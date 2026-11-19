require("dotenv").config();

const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const dataDir = path.join(__dirname, "data");
const submissionsFile = path.join(dataDir, "submissions.json");

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error("Set SESSION_SECRET in .env to a random string of at least 32 characters.");
}
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error("Set ADMIN_PASSWORD in .env to a unique password of at least 12 characters.");
}
const adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: "16kb" }));
app.use(session({
  name: "kishore_admin_session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000
  }
}));

const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: "draft-7", legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false });

const quizQuestions = [
  "Who is more likely to laugh at a serious moment?",
  "Who gets angry first?",
  "Who is the biggest foodie?",
  "Who is more likely to forget an important date?",
  "Who is the crazier one?",
  "Who takes longer to get ready?",
  "Who is most likely to fall asleep during a movie?",
  "Who gives the funniest advice?",
  "Who is more likely to make a random plan?",
  "Who spends more money on food?",
  "Who is the better secret keeper?",
  "Who starts the conversation after an argument?",
  "Who is more dramatic?",
  "Who is most likely to become famous?",
  "Who will remember this friendship forever?"
];
const allowedAnswers = new Set(["Me", "Kishore", "Both"]);
let writeQueue = Promise.resolve();

async function readSubmissions() {
  try {
    const raw = await fs.readFile(submissionsFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Submission storage must contain a JSON array.");
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

// Serialize writes and replace the file atomically to avoid partial JSON files.
function saveSubmission(submission) {
  const write = writeQueue.catch(() => {}).then(async () => {
    const submissions = await readSubmissions();
    submissions.unshift(submission);
    const tempFile = `${submissionsFile}.${crypto.randomUUID()}.tmp`;
    try {
      await fs.writeFile(tempFile, JSON.stringify(submissions, null, 2), { mode: 0o600 });
      await fs.rename(tempFile, submissionsFile);
    } finally {
      try {
        await fs.unlink(tempFile);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  });
  writeQueue = write;
  return write;
}

function requireAdmin(req, res, next) {
  res.set("Cache-Control", "no-store");
  if (req.session?.isAdmin === true) return next();
  return res.status(401).json({ error: "Please sign in to the private dashboard." });
}

app.get("/api/health", (_req, res) => res.json({ ok: true, storage: "json-file" }));
app.use("/api/admin", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.post("/api/quiz/submit", submitLimiter, async (req, res) => {
  try {
    const friendName = typeof req.body?.friendName === "string" ? req.body.friendName.trim() : "";
    const answers = req.body?.answers;
    if (!friendName || friendName.length > 80 || !Array.isArray(answers) ||
        answers.length !== quizQuestions.length || answers.some(answer => !allowedAnswers.has(answer))) {
      return res.status(400).json({ error: `Please answer all ${quizQuestions.length} questions.` });
    }
    const submission = {
      id: crypto.randomUUID(),
      friendName,
      answers,
      submittedAt: new Date().toISOString()
    };
    await saveSubmission(submission);
    res.status(201).json({ success: true, message: "Your 15 answers are safely saved. Thank you!" });
  } catch (error) {
    console.error("Quiz submission error:", error.message);
    res.status(500).json({ error: "We couldn't save your answers right now. Please try again." });
  }
});

app.post("/api/admin/login", loginLimiter, async (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const valid = password.length <= 200 && await bcrypt.compare(password, adminPasswordHash);
  if (!valid) return res.status(401).json({ error: "That password isn't correct." });

  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: "Could not start a secure session." });
    req.session.isAdmin = true;
    req.session.save(saveErr => {
      if (saveErr) return res.status(500).json({ error: "Could not save your session." });
      res.json({ success: true });
    });
  });
});

app.get("/api/admin/session", (req, res) => {
  res.json({ authenticated: req.session?.isAdmin === true });
});

app.get("/api/admin/submissions", requireAdmin, async (_req, res) => {
  try {
    res.json(await readSubmissions());
  } catch (error) {
    console.error("Admin read error:", error.message);
    res.status(500).json({ error: "Could not load submissions." });
  }
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Could not sign out." });
    res.clearCookie("kishore_admin_session", { httpOnly: true, sameSite: "strict", secure: isProduction });
    res.json({ success: true });
  });
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

fs.mkdir(dataDir, { recursive: true })
  .then(async () => {
    try { await fs.access(submissionsFile); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      await fs.writeFile(submissionsFile, "[]\n", { mode: 0o600 });
    }
    app.listen(PORT, () => console.log(`Kishore birthday website running at http://localhost:${PORT}`));
  })
  .catch(error => {
    console.error("Could not initialize JSON storage:", error.message);
    process.exit(1);
  });
