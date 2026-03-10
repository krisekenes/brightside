# BrightSide — Today's Good News

A positive-news web app that filters out negative and distressing content, serving good and neutral news across categories with mood-based feed reranking, geographic radius filtering, and engagement features designed to replace doom scrolling with intentional reading.

**Live:** [krisekenes.github.io/brightside](https://krisekenes.github.io/brightside/) *(moving to Vercel — see NEXT_STEPS.md)*

---

## Features

- **Deferred personalisation** — users land straight in the feed; a non-blocking nudge card offers to personalise preferences without forcing upfront decisions
- **Tag filtering** — click any story tag to filter the feed; repeat clicks on related tags surface a mood suggestion
- **Mood system** — Inspired, Hopeful, Wholesome, Peaceful, Celebrating; reranks stories in real time; mood pills sit inline with category nav (single row)
- **Discover / Swipe mode** — Tinder-style card deck (experimental, pulsing NEW badge); swipe right to love, left to pass, tap to read
- **Local radius filter** — surface stories from within 5–100 km
- **Love / bookmark / share / hide** per story
- **Daily Digest** — subscribe for a curated morning/afternoon/evening email briefing
- **7-day streak** with weekly calendar popover
- **Dark mode** — warm burnt umber palette, not cold grays; respects system preference
- **Fully responsive** — mobile bottom nav, desktop rail layout
- **Settings panel** — edit categories + default mood at any time via gear icon
- **Account modal** — stats and preferences summary
- **"How we filter"** — transparency page explaining the sentiment scoring system

## Design

Editorial warmth — inspired by The Atlantic, Monocle, Kinfolk. Fonts: `Bricolage Grotesque` (headlines, variable) + `DM Sans` (UI). `DM Serif Display` kept for the "BrightSide" wordmark only. Brand colour: `#E8651A` deep sunrise amber. No emoji anywhere — inline SVGs only.

## Stack

| Layer | Current | Next (Option B) | Production (Option C) |
|---|---|---|---|
| Frontend | React 18 + Vite | React 18 + Vite | Next.js 15 App Router |
| Styling | Inline styles | Inline styles | Tailwind CSS |
| State | useState / useMemo | useState + useFeed hook | Zustand |
| Data | Hardcoded mock stories | Guardian API (Vercel serverless) | Go API + Supabase/PostgreSQL |
| Deploy | GitHub Pages | Vercel | Vercel |
| Sentiment | None | Keyword heuristic | Google NLP API |

See [NEXT_STEPS.md](./NEXT_STEPS.md) for the full Option B implementation plan and Option C migration path.

## Project Structure

```
api/
└── feed.js                     # Vercel serverless function (Option B, to be created)
src/
├── App.jsx                     # Main component, all feed state/logic
├── lib/
│   ├── theme.js                # LIGHT/DARK tokens + category accent helpers
│   ├── mood.js                 # MOOD_CONFIG + moodScore()
│   ├── storage.js              # localStorage get/set with fallback
│   └── data.js                 # CATS + STORIES mock data (dev fallback)
├── icons/
│   └── index.jsx               # All SVG icons (no external icon library)
└── components/
    ├── Onboarding.jsx          # Kept in codebase; no longer shown as a gate
    ├── SettingsPanel.jsx
    ├── StoryCard.jsx
    ├── StoryRail.jsx
    ├── SwipeMode.jsx           # Discover / swipe deck (experimental)
    ├── CaughtUp.jsx
    ├── EmptyState.jsx
    └── modals/
        ├── Modal.jsx
        ├── ShareModal.jsx
        ├── DigestModal.jsx
        ├── AccountModal.jsx
        ├── HowWeFilterModal.jsx
        └── StoryModal.jsx
```

## Development

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
npm run preview
```

For Option B (Vercel serverless), run locally with:
```bash
# Add GUARDIAN_API_KEY to .env.local first (see NEXT_STEPS.md)
npx vercel dev  # http://localhost:3000
```
