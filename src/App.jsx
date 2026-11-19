import React, { useEffect, useMemo, useState } from "react";

const QUESTIONS = [
  "Who is more likely to laugh at a serious moment?",
  "Who gets angry first?",
  "Who is the biggest foodie?",
  "Who is more likely to miss the other person?",
  "Who is the crazier one?",
  "Who gives better advice?",
  "Who is most likely to fall asleep during a movie?",
  "Who gives the funniest advice?",
  "Who is more introverted?",
  "Who spends more money on food?",
  "Who is the better secret keeper?",
  "Who starts the conversation after an argument?",
  "Who is most likely to maintain a friendship?",
  "Who says sorry after a fight?",
  "Who will remember this friendship forever?"
];
const CHOICES = [
  "1. Kishore",
  "2. Bharath",
  "3. Surya",
  "4. All of these",
  "5. None of these"
];
const STAGES = ["Welcome", "Memories", "Friendship quiz", "Mini games", "Surprise"];
const VIDEO_MEMORIES = [
  { file: "kishore-memory-01.mp4", poster: "/images/memory-03.jpg", label: "A little moment, on repeat." },
  { file: "kishore-memory-02.mp4", poster: "/images/memory-06.jpg", label: "One for the memory book." }
];

function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminPage /> : <BirthdaySite />;
}

function BirthdaySite() {
  const [stage, setStage] = useState(1);
  const [musicOn, setMusicOn] = useState(false);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(""));
  const [participantName, setParticipantName] = useState("Kishore");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [quizStatus, setQuizStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [toast, setToast] = useState("");
  const [countdown, setCountdown] = useState({ days: "--", hours: "--", minutes: "--", seconds: "--" });
  const [fortuneIndex, setFortuneIndex] = useState(0);

  const goTo = (next) => {
    setStage(next);
    window.history.replaceState(null, "", `#stage-${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (next === 5) confetti();
  };

  useEffect(() => {
    const initial = Number((window.location.hash.match(/stage-(\d)/) || [])[1] || 1);
    if (initial >= 1 && initial <= 5) setStage(initial);
  }, []);

  useEffect(() => {
    const tick = () => {
      const target = new Date(2026, 10, 30, 0, 0, 0).getTime();
      let diff = target - Date.now();
      if (diff <= 0) {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }
      const days = Math.floor(diff / 86400000); diff %= 86400000;
      const hours = Math.floor(diff / 3600000); diff %= 3600000;
      const minutes = Math.floor(diff / 60000); diff %= 60000;
      const seconds = Math.floor(diff / 1000);
      setCountdown({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0")
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!musicOn) return;
    const audio = new Audio("/audio/birthday-song.mp3");
    audio.loop = true;
    audio.volume = 0.7;
    audio.play().catch(() => setMusicOn(false));
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [musicOn]);

  const updateAnswer = (value) => {
    setAnswers(prev => prev.map((answer, i) => i === questionIndex ? value : answer));
    setQuizStatus("");
  };

  const submitQuiz = async () => {
    if (answers.some(answer => !answer)) {
      setQuizStatus("Please answer all 15 questions before submitting.");
      return;
    }
    if (!participantName.trim()) {
      setQuizStatus("Please enter a name for your answer sheet.");
      return;
    }
    setSubmitting(true);
    setQuizStatus("Saving your answers...");
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendName: participantName.trim(), answers })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save answers.");
      setQuizSubmitted(true);
      setQuizStatus("✓ All 15 answers have been saved. Thank you, Kishore!");
      setToast("Friendship answers saved privately!");
    } catch (error) {
      setQuizStatus(error.message + " Make sure the Node.js website server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="noise" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#stage-1" onClick={(e) => { e.preventDefault(); goTo(1); }}>
          <span className="brand-mark">K</span><span>THE KISHORE FILES</span>
        </a>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setMusicOn(v => !v)} aria-pressed={musicOn}>
            <span>♫</span><span className="music-label">{musicOn ? "Music on" : "Music off"}</span>
          </button>
          <a className="icon-button admin-link" href="/admin">⌑ Private admin</a>
        </div>
      </header>
      <nav className="stage-nav">
        {STAGES.map((name, i) => (
          <button key={name} className={stage === i + 1 ? "active" : ""} onClick={() => goTo(i + 1)}>
            <span>0{i + 1}</span>{name}
          </button>
        ))}
      </nav>

      <main>
        {stage === 1 && <section className="stage hero-stage">
          <div className="hero-copy">
            <p className="eyebrow"><i /> A LITTLE SOMETHING FOR SOMEONE SPECIAL</p>
            <p className="hero-kicker">THE WORLD'S NOT READY.</p>
            <h1>Happy Birthday,<br /><em>Kishore.</em></h1>
            <p className="hero-subtitle">One more year. A thousand memories. And still the same legendary friendship.</p>
            <p className="hero-meta">● 30 NOVEMBER 2026 <span>/</span> A DAY TO REMEMBER</p>
            <button className="primary-button" onClick={() => goTo(2)}>ENTER OUR STORY <b>↗</b></button>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="hero-number">30</div>
            <figure className="hero-photo">
              <img src="/images/memory-01.jpg" alt="A friendship memory" loading="lazy" decoding="async" />
              <figcaption>A MOMENT TO KEEP</figcaption>
            </figure>
            <div className="hero-date-card"><span>MONDAY</span><strong>NOV</strong><b>2026</b></div>
            <div className="star star-a">✦</div><div className="star star-b">✧</div><div className="star star-c">✦</div>
            <div className="hero-caption">THE NEXT CHAPTER<small>STARTS RIGHT HERE</small></div>
          </div>
          <div className="countdown-wrap">
            <span className="countdown-heading">● COUNTING DOWN TO YOUR DAY</span>
            <div className="countdown">
              {Object.entries(countdown).map(([unit, value], i) => <React.Fragment key={unit}>
                {i > 0 && <i>:</i>}<div><strong>{value}</strong><span>{unit.toUpperCase()}</span></div>
              </React.Fragment>)}
            </div>
            <p>The clock is ticking. The memories are forever.</p>
          </div>
        </section>}

        {stage === 2 && <section className="stage">
          <SectionHeading eyebrow="STAGE 02 — THE GOOD OLD DAYS" title={<>Our kind of<br /><em>chaos.</em></>} text="Eight friendship photos are ready to customize with your own captions or replace whenever you like." />
          <div className="memory-grid">
            {[
              ["memory-01.jpg", "01 / OUR STORY", "A moment worth keeping."],
              ["memory-02.jpg", "02 / GOOD COMPANY", "Better when we're together."],
              ["memory-03.jpg", "03 / THE GOOD DAYS", "One for the memory book."],
              ["memory-04.jpg", "04 / THE LAUGHS", "The kind you remember."],
              ["memory-05.jpg", "05 / ALWAYS US", "Same bond, every chapter."],
              ["memory-06.jpg", "06 / A FAVORITE", "A little snapshot of us."],
              ["memory-07.jpg", "07 / MORE MEMORIES", "Here's to the next one."],
              ["memory-08.jpg", "08 / TO BE CONTINUED", "Our story keeps growing."]
            ].map(([image, label, caption], i) => (
              <article className={`memory-card ${i === 0 ? "memory-tall" : ""} ${i === 2 || i === 5 ? "memory-wide" : ""}`} key={image}>
                <img src={`/images/${image}`} alt={caption} loading="lazy" decoding="async" />
                <div className="memory-caption"><span>{label}</span><h3>{caption}</h3></div>
              </article>
            ))}
          </div>
          <VideoMemories />
          <p className="photo-tip">✦ These are your supplied photos. Replace files in <code>public/images</code> and edit the captions in <code>src/App.jsx</code> whenever you like.</p>
          <StageFooter back={() => goTo(1)} next={() => goTo(3)} nextLabel="NEXT: THE QUIZ" />
        </section>}

        {stage === 3 && <section className="stage">
          <SectionHeading eyebrow="STAGE 03 — THE FRIENDSHIP TEST" title={<>How well do you<br /><em>know this madness?</em></>} text="15 questions. No lifelines. Be honest — your answers are saved to a private dashboard." />
          <div className="quiz-layout">
          <aside className="quiz-aside"><div className="quiz-stamp">BFF<br /><b>TEST</b></div><span>OFFICIAL FRIENDSHIP BUSINESS</span><h3>Let's see what you know.</h3><p>Answer all 15 questions to submit your friendship report.</p>
            <label className="participant-label" htmlFor="participant-name">YOUR NAME FOR THE ANSWER SHEET</label>
            <input id="participant-name" className="participant-input" value={participantName} maxLength={80} onChange={event => setParticipantName(event.target.value)} />
              <div className="quiz-counter"><strong>{answers.filter(Boolean).length}</strong><span> / 15 ANSWERED</span></div>
              <div className="progress-track"><i style={{ width: `${answers.filter(Boolean).length / 15 * 100}%` }} /></div>
            </aside>
            <div className="quiz-card">
              <div className="quiz-progress">QUESTION {String(questionIndex + 1).padStart(2, "0")} / 15</div>
              <div className="progress-track"><i style={{ width: `${(questionIndex + 1) / 15 * 100}%` }} /></div>
              <h3 className="question-title">{QUESTIONS[questionIndex]}</h3>
              <div className="answer-options">
                {CHOICES.map(choice => <label className={`answer-option ${answers[questionIndex] === choice ? "selected" : ""}`} key={choice}>
                  <input type="radio" name={`question-${questionIndex}`} value={choice} checked={answers[questionIndex] === choice} onChange={() => updateAnswer(choice)} />
                  <span>{choice}</span>
                </label>)}
              </div>
              <div className="quiz-controls">
                <button className="text-button" disabled={questionIndex === 0} onClick={() => { setQuestionIndex(i => i - 1); setQuizStatus(""); }}>← BACK</button>
                {questionIndex < 14
                  ? <button className="primary-button" onClick={() => { if (!answers[questionIndex]) { setQuizStatus("Choose an answer first."); return; } setQuestionIndex(i => i + 1); setQuizStatus(""); }}>NEXT QUESTION <b>→</b></button>
                  : <button className="primary-button" disabled={submitting || quizSubmitted} onClick={submitQuiz}>{submitting ? "SAVING..." : quizSubmitted ? "ANSWERS SAVED ✓" : "SUBMIT ALL 15 ↗"}</button>}
              </div>
              <p className="quiz-privacy">🔒 Answers are saved securely and can only be viewed in the password-protected admin page.</p>
              <p className="quiz-status" role="status">{quizStatus}</p>
            </div>
          </div>
          <StageFooter back={() => goTo(2)} next={() => goTo(4)} nextLabel="SKIP TO GAMES" />
        </section>}

        {stage === 4 && <section className="stage">
          <SectionHeading eyebrow="STAGE 04 — PLAY TIME" title={<>Friendship is serious.<br /><em>We are not.</em></>} text="A few tiny challenges. No prize money. Just bragging rights." />
          <Games fortuneIndex={fortuneIndex} setFortuneIndex={setFortuneIndex} />
          <StageFooter back={() => goTo(3)} next={() => goTo(5)} nextLabel="UNLOCK THE SURPRISE" />
        </section>}

        {stage === 5 && <section className="stage finale-stage">
          <div className="finale-content">
            <p className="eyebrow">✦ STAGE 05 — THE FINAL CHAPTER ✦</p>
            <div className="finale-cake">🎂</div>
            <p className="finale-overline">TO MY PARTNER IN CRIME</p>
            <h2>Here's to you,<br /><em>Kishore.</em></h2>
            <div className="letter-card">
              <span className="quote-mark">“</span>
              <p>Life gets busy, days change, and new chapters begin. But some people make every chapter better just by being in it. Thanks for the laughs, the random conversations, the madness and all the memories still waiting to happen.</p>
              <p>Keep being your wonderfully chaotic self. Wishing you a year full of good health, big wins, peaceful days and reasons to smile.</p>
              <strong>Happy Birthday, best friend. ❤️</strong>
              <small>— Your friend, always.</small>
            </div>
            <button className="primary-button" onClick={confetti}>MAKE A LITTLE MAGIC ✨</button>
            <p className="finale-footnote">30 NOVEMBER 2026 · THE STORY CONTINUES</p>
          </div>
          <StageFooter back={() => goTo(4)} next={() => goTo(1)} nextLabel="REPLAY FROM START" />
        </section>}
      </main>
      {toast && <div className="toast" onAnimationEnd={() => setToast("")}>{toast}</div>}
      <footer className="site-footer"><span>MADE WITH FRIENDSHIP, NOT PERFECTION.</span><span>© 2026 / THE KISHORE FILES</span></footer>
    </>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return <div className="section-heading"><p className="eyebrow"><i /> {eyebrow}</p><h2>{title}</h2><p>{text}</p></div>;
}
function StageFooter({ back, next, nextLabel }) {
  return <div className="stage-footer"><button className="text-button" onClick={back}>← PREVIOUS</button><button className="primary-button" onClick={next}>{nextLabel} <b>↗</b></button></div>;
}

function VideoMemories() {
  const [availableVideos, setAvailableVideos] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all(VIDEO_MEMORIES.map(async video => {
      try {
        const response = await fetch(`/videos/${video.file}`, { method: "HEAD" });
        const contentType = response.headers.get("content-type") || "";
        return response.ok && contentType.includes("video/mp4") ? video : null;
      } catch {
        return null;
      }
    })).then(videos => {
      if (active) setAvailableVideos(videos.filter(Boolean));
    });
    return () => { active = false; };
  }, []);

  return <section className="video-memories" aria-label="Friendship videos">
    <div className="video-heading">
      <p className="eyebrow"><i /> MOVING MEMORIES</p>
      <h3>A few moments,<br /><em>in motion.</em></h3>
      <p>Add one or two personal MP4 clips to bring this part of the story to life.</p>
    </div>
    {availableVideos === null ? <p className="video-note">Checking for your video memories…</p> :
      availableVideos.length ? <div className="video-grid">
        {availableVideos.map(video => <article className="video-card" key={video.file}>
          <video controls preload="metadata" playsInline poster={video.poster}>
            <source src={`/videos/${video.file}`} type="video/mp4" />
            Your browser does not support MP4 video.
          </video>
          <p>{video.label}</p>
        </article>)}
      </div> : <p className="video-note">Your videos will appear here. Add <code>kishore-memory-01.mp4</code> and/or <code>kishore-memory-02.mp4</code> to <code>public/videos</code>.</p>}
  </section>;
}

function Games({ fortuneIndex, setFortuneIndex }) {
  const [deck, setDeck] = useState(() => shuffle(["🌙", "🍕", "🎧", "⭐", "🌙", "🍕", "🎧", "⭐"]));
  const [opened, setOpened] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [riddle, setRiddle] = useState(0);
  const [riddleMessage, setRiddleMessage] = useState("");
  const [choice, setChoice] = useState("");
  const [quickIndex, setQuickIndex] = useState(0);
  const fortunes = [
    "A good friend knows all your stories. A best friend helped you write them.",
    "The best memories usually start with: 'This is probably a bad idea…'",
    "Real friendship is sending one meme and understanding the entire conversation.",
    "Some people are family by choice. You're one of those people.",
    "Growing up is optional when your best friend is around."
  ];
  const riddles = [
    { clue: "🍕 😂 🌙", hint: "A classic kind of hangout", options: ["Late-night food and laughs", "Morning workout", "Shopping trip"], answer: "Late-night food and laughs" },
    { clue: "📱 💬 🌅", hint: "The chat just kept going", options: ["One-word reply", "Texting till sunrise", "Phone battery died"], answer: "Texting till sunrise" },
    { clue: "🎮 🏆 😤", hint: "A little friendly competition", options: ["Cooking together", "Game night rivalry", "Quiet library visit"], answer: "Game night rivalry" },
    { clue: "🚗 🎶 🛣️", hint: "The journey is the memory", options: ["Road trip playlist", "Waiting for a bus", "Running a marathon"], answer: "Road trip playlist" }
  ];
  const quickQuestions = [
    "Who would survive a zombie apocalypse?",
    "Who would order food for the whole table?",
    "Who would get lost even with GPS?",
    "Who would laugh at the worst possible time?"
  ];

  const reset = () => { setDeck(shuffle(["🌙", "🍕", "🎧", "⭐", "🌙", "🍕", "🎧", "⭐"])); setOpened([]); setMatched([]); setMoves(0); setLocked(false); };
  const flip = (index) => {
    if (locked || opened.includes(index) || matched.includes(index)) return;
    if (opened.length === 0) { setOpened([index]); return; }
    const first = opened[0];
    setOpened([first, index]); setMoves(m => m + 1);
    if (deck[first] === deck[index]) {
      setMatched(prev => [...prev, first, index]); setOpened([]);
    } else {
      setLocked(true);
      setTimeout(() => { setOpened([]); setLocked(false); }, 750);
    }
  };

  return <div className="games-grid">
    <article className="game-card">
      <div className="game-icon">🧩</div><span className="game-tag">GAME 01 / MEMORY</span><h3>Match the memories</h3><p>Find all matching pairs. Try to beat your own moves.</p>
      <div className="memory-game">{deck.map((symbol, i) => <button key={i} className={`memory-tile ${opened.includes(i) ? "flipped" : ""} ${matched.includes(i) ? "matched" : ""}`} onClick={() => flip(i)}>{opened.includes(i) || matched.includes(i) ? symbol : "?"}</button>)}</div>
      <div className="game-foot"><span>MOVES: {moves} {matched.length === 8 ? "· ALL MATCHED!" : ""}</span><button className="small-button" onClick={reset}>RESET ↻</button></div>
    </article>
    <article className="game-card">
      <div className="game-icon">💭</div><span className="game-tag">GAME 02 / QUICK GUESS</span><h3>Decode the emoji</h3><p>What friendship moment is hiding in these emojis?</p>
      <div className="emoji-row">{riddles[riddle].clue}</div><p className="game-hint">Hint: {riddles[riddle].hint}</p>
      <div className="emoji-options">{riddles[riddle].options.map(option => <button key={option} onClick={() => setRiddleMessage(option === riddles[riddle].answer ? "✓ Nailed it!" : "Not quite. Try another answer.")}>{option}</button>)}</div>
      <p className="game-feedback">{riddleMessage}</p><button className="small-button" onClick={() => { setRiddle((riddle + 1) % riddles.length); setRiddleMessage(""); }}>NEXT RIDDLE ↗</button>
    </article>
    <article className="game-card game-card-full">
      <div className="game-icon">⚡</div><span className="game-tag">GAME 03 / SPEED ROUND</span><h3>Pick your best-friend energy</h3><p>Quick-fire choices. There are no wrong answers — allegedly.</p>
      <h4 className="would-you-question">{quickQuestions[quickIndex]}</h4>
      <div className="would-you-options">{["Me", "Kishore", "Both"].map(item => <button key={item} onClick={() => setChoice(item)}>{item === "Both" ? "BOTH OF US" : item.toUpperCase()}</button>)}</div>
      <p className="game-feedback">{choice ? `${choice} — answer locked in. No appeals accepted. 😄` : ""}</p>
      <button className="small-button" onClick={() => { setQuickIndex((quickIndex + 1) % quickQuestions.length); setChoice(""); }}>NEXT QUESTION ↗</button>
    </article>
    <article className="game-card game-card-full fortune-card">
      <div className="game-icon">💌</div><span className="game-tag">BONUS / FRIENDSHIP FORTUNE</span><h3>A little reminder</h3>
      <p className="fortune-text">“{fortunes[fortuneIndex % fortunes.length]}”</p>
      <button className="small-button" onClick={() => setFortuneIndex(i => i + 1)}>ANOTHER ONE ↗</button>
    </article>
  </div>;
}
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function confetti() {
  const colors = ["#d6b77a", "#d98b9d", "#a5b5d6", "#f1f0eb"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 5000);
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/submissions");
      if (response.status === 401) { setAuthenticated(false); throw new Error("Please sign in again."); }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load submissions.");
      setSubmissions(data);
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch("/api/admin/session").then(r => r.json()).then(data => {
      if (data.authenticated) { setAuthenticated(true); }
    }).catch(() => setMessage("Could not check your admin session. Make sure the Node.js server is running."));
  }, []);
  useEffect(() => { if (authenticated) loadSubmissions(); }, [authenticated]);

  const login = async (event) => {
    event.preventDefault(); setMessage("Checking...");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      setPassword(""); setAuthenticated(true); setMessage("");
    } catch (error) { setMessage(error.message); }
  };
  const logout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Could not sign out.");
      }
      setAuthenticated(false); setSubmissions([]); setMessage("Vault locked.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return <>
    <div className="noise" /><div className="ambient ambient-one" />
    <header className="topbar"><a className="brand" href="/"><span className="brand-mark">K</span><span>THE KISHORE FILES / PRIVATE</span></a><a className="icon-button" href="/">← BACK TO WEBSITE</a></header>
    <main className="admin-main">
      {!authenticated ? <section className="admin-login-panel">
        <p className="eyebrow"><i /> PRIVATE AREA</p><div className="admin-lock">🔐</div>
        <h1>Your private<br /><em>answer vault.</em></h1>
        <p className="admin-intro">Sign in with the admin password from your server's .env file. Only the site owner should use this page.</p>
        <form onSubmit={login} className="login-form">
          <label htmlFor="admin-password">ADMIN PASSWORD</label>
          <input id="admin-password" type="password" autoComplete="current-password" required maxLength="200" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
          <button className="primary-button" type="submit">UNLOCK DASHBOARD ↗</button><p className="form-message">{message}</p>
        </form>
      </section> : <section className="dashboard-panel">
        <div className="dashboard-heading"><div><p className="eyebrow"><i /> OWNER VIEW</p><h1>Friendship<br /><em>submissions.</em></h1></div><button className="small-button" onClick={logout}>SIGN OUT ↗</button></div>
        <div className="dashboard-stats"><div><strong>{submissions.length}</strong><span>TOTAL SUBMISSIONS</span></div><div><strong>PRIVATE</strong><span>VISIBILITY</span></div></div>
        {loading && <p className="admin-intro">Loading answers...</p>}
        {!loading && submissions.length === 0 && <div className="empty-state">No answers yet. Kishore's completed 15-question quiz will appear here.</div>}
        <div className="submission-list">{submissions.map(item => <article className="submission-card" key={item.id}>
          <h3>{item.friendName}</h3><p className="submission-date">{new Date(item.submittedAt).toLocaleString()}</p>
          <ol>{QUESTIONS.map((question, i) => <li key={i}>{question} — <strong>{item.answers[i] || "—"}</strong></li>)}</ol>
        </article>)}</div>
        <p className="dashboard-note">Submissions are stored in a private server-side JSON file. Keep your admin password and hosting credentials private.</p>
      </section>}
    </main>
  </>;
}

export default App;
