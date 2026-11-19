# The Kishore Files — Birthday Website

A five-stage friendship birthday experience built with React, Vite, Node.js, and Express. Quiz submissions are stored in a private server-side JSON file; no database is used.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Install packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`. Set a unique admin password (at least 12 characters) and a random session secret (at least 32 characters). Keep `.env` private; it is ignored by Git.

3. Open two terminals in this folder:

   ```bash
   npm run server
   ```

   ```bash
   npm run dev
   ```

4. Open the Vite URL printed in the second terminal (usually `http://localhost:5173`). The separate admin sign-in is at `http://localhost:5173/admin`.

The quiz asks 15 questions and requires all answers before submitting. Answers are sent to Express and can only be read from `/api/admin/submissions` after a successful admin login. The public website does not load or display submissions.

## Memories and personal videos

The eight supplied photos are already in `public/images/memory-01.jpg` through `memory-08.jpg`. Replace those files to change the photos; update the nearby captions in `src/App.jsx` to personalize them.

To add up to two MP4 video memories, copy your clips into `public/videos/` using either or both names:

- `kishore-memory-01.mp4`
- `kishore-memory-02.mp4`

The Memories stage automatically displays clips it finds. Use videos you have permission to share. The site does not include copyrighted music; its birthday melody is synthesized in the browser when the music toggle is enabled.

## Build and serve

```bash
npm run build
```

For a local production-style run, set `NODE_ENV=production` and start the Express server:

PowerShell:

```powershell
$env:NODE_ENV = "production"
npm start
```

macOS/Linux:

```bash
NODE_ENV=production npm start
```

The Express server serves the built `dist` app and API on port 3000 by default. Set `PORT` to change it. Configure `SESSION_SECRET` and `ADMIN_PASSWORD` as environment variables on the host; use HTTPS in production. If deployed behind a trusted reverse proxy, set `TRUST_PROXY=true` where appropriate.

## Private data and deployment

- Submissions are created in `data/submissions.json`, outside the public `dist` directory. The server validates participant names and all 15 allowed answers before saving.
- The JSON file and `.env` are excluded from Git. Back up `data/submissions.json` securely; never publish or serve it as a static file.
- Use a host with persistent writable storage. Ephemeral filesystems can lose submissions on redeploy or restart.
- Admin sign-in uses an in-memory session store, so a server restart signs the admin out. Use a persistent session store if the site needs durable sessions or multiple server instances.
- The countdown targets midnight on 30 November 2026 in each visitor's local time zone.
