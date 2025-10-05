<!-- Consolidated README: combines quickstart, architecture, deployment, and project summary into one file -->

# BluePulse — Marine Pollution Daily Digest

BluePulse is a single-page web application that aggregates recent ocean pollution news and provides AI-driven summaries, practical tips, a short quiz, and an interactive Q&A assistant.

Table of contents
- Project overview
- Quick start (developer)
- Architecture & data flow
- API endpoints
- Environment variables
- Deployment notes
- Project status & next steps
- Credits & license

## Project overview

- Daily Digest: 3-sentence summary of recent ocean pollution stories
- Tip of the Day: one practical action users can take immediately
- Top headlines: quick access to recent articles (top 2–3 in the UI)
- Quiz: 5-question multiple-choice quiz about marine pollution
- Q&A assistant: ask questions about the articles or general marine pollution topics

Tech stack
- Frontend: React + TypeScript + Vite
- Styling: TailwindCSS, custom CSS in `src/index.css` (ocean background, glass cards)
- Backend: Express.js, `rss-parser` for feeds
- AI: Cerebras Chat Completions (Meta Llama) via `CEREBRAS_API_KEY` and optional `CEREBRAS_MODEL`

Public assets
- `public/waves.svg` — animated wave header
- `public/ocean-bg.jpg` — ocean background image used by the app

## Impact & goals

BluePulse is designed not only as a news aggregator but as an educational and behavioral tool to increase awareness of marine pollution and encourage concrete action. This section explains the intended impact, target audiences, suggested metrics to measure success, and calls-to-action for users and contributors.

Intended impact
- Increase awareness: deliver short, factual daily summaries so readers can quickly understand major ocean-pollution issues.
- Encourage action: provide one clear, practical tip each day (Tip of the Day) to nudge behavior change (reusables, proper disposal, policy engagement).
- Teach and retain: a short quiz reinforces learning and improves knowledge retention.

Target audiences
- Concerned citizens and coastal communities
- Environmental educators and students
- NGOs and local advocacy groups
- Journalists and researchers looking for quick situational awareness

Calls-to-action (CTAs)
- For users: read the Daily Digest, try the quiz, adopt the Tip of the Day, and share articles/tips with local groups.
- For teachers: use the digest + quiz as a short classroom warm-up or homework prompt.
- For contributors: help by adding sources, improving prompts for factuality, adding caching, or building small features like bookmarking and email digests.

How to measure locally
- Add a simple analytics endpoint or inject a minimal event logger to collect anonymous counters (digest viewed, quiz submitted). Keep privacy in mind — prefer aggregated counts over user-level data.
- Store metrics in a small database or even a CSV during early testing; later migrate to a metrics platform or Prometheus.

Ethics & data considerations
- Do not store or expose Cerebras API keys in client code or public repos.
- Avoid collecting PII. If adding analytics, keep it anonymous and opt-in where possible.
- Be transparent about model limitations and present AI-generated content as assistance, not authoritative fact without verification.
## Quick start (developer)

Prerequisites
- Node.js 18+ and npm
- A Cerebras API key (for AI features)

1) Install dependencies

```powershell
npm install
```

2) Create a local environment file

```powershell
code .env
# then edit .env and add your CEREBRAS_API_KEY
```

3) Start the backend

```powershell
npm run server
```

4) Start the frontend

```powershell
npm run dev
```

5) Open the app

Visit the Vite URL printed in the terminal (usually `http://localhost:5173`).

## Architecture & data flow

High-level:

1. Frontend (React) requests GET `/api/fetch-feeds` from the backend.
2. Backend fetches multiple RSS feeds (UNEP, NOAA, The Guardian), filters for marine/ocean keywords and a 7-day window, sanitizes content, and returns top articles.
3. Frontend posts the article array to POST `/api/summarize` to get a 3-sentence digest + tip, or posts with a `question` to get a focused answer. The backend proxies Cerebras calls and performs defensive JSON extraction and fallbacks.
4. The frontend renders digest, tip, headlines, the QuizBox (GET `/api/generate-quiz`), and the Q&A assistant (POST `/api/summarize` in Q&A mode).

Design decisions & safety
- API keys live in environment variables and are never exposed to the client.
- Defensive parsing: server searches model outputs for JSON, parses if possible, otherwise returns a safe fallback.
- Map and heavy geo-deps were intentionally removed to simplify the codebase and reduce bundle size.

## API endpoints

The app exposes the following public API endpoints (for the frontend):

- `GET /api/fetch-feeds` — returns recent marine-related articles.
- `POST /api/summarize` — accepts articles and optional `question`; returns either a `{ digest, tipOfTheDay }` object (digest mode) or an `answer` string (Q&A mode).
- `GET /api/generate-quiz` — returns a short multiple-choice quiz about marine pollution (or a fallback quiz when needed).

## Environment variables

Minimum required in `.env`:

```text
CEREBRAS_API_KEY=your_api_key_here
CEREBRAS_MODEL=llama-3.3-70b  # optional
PORT=3001
```

Frontend-specific (optional):

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Deployment notes

- Frontend is a static Vite build: `npm run build` → `dist/` can be hosted on Vercel/Netlify.
- Backend can be hosted on Railway, Render, or any Node host; set `CEREBRAS_API_KEY` in the hosting environment variables.
- Production considerations: add caching (Redis), rate limiting, structured logging, and HTTPS.

## Project status & next steps

- Top-N headlines: Frontend displays top 2–3 headlines (configurable) instead of a single headline.
- Weekly window: `/api/fetch-feeds` considers the past 7 days.
- Quiz feature: `QuizBox` component and `/api/generate-quiz` implemented; backend returns `requestId` and has a fallback quiz.
- Summarization & Q&A: `/api/summarize` accepts an optional `question` and can answer general marine-pollution questions.
- UI polish: ocean background, glass cards, typography updates.
- Map removal: map component and Leaflet deps removed to simplify the project.

Next recommended tasks:
1. Run `npm install` locally to sync `package-lock.json` after removing map dependencies.
2. Add caching and rate limiting for LLM endpoints.
3. Add a small Dockerfile for production or a Procfile for simple deploy.

## Credits & license

- RSS Feeds: UNEP, NOAA, The Guardian
- AI: Cerebras AI (Meta Llama)
- Icons: Lucide React
- License: MIT



