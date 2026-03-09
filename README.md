# BrightSide — Today's Good News

A positive-news web app that filters out negative and distressing content, serving good and neutral news across categories with mood-based feed reranking, geographic radius filtering, and engagement features designed to replace doom scrolling with intentional reading.

**Live:** [krisekenes.github.io/brightside](https://krisekenes.github.io/brightside/)

---

## Features

- **Personalised feed** — choose categories, hide what doesn't interest you
- **Mood system** — Inspired, Hopeful, Wholesome, Peaceful, Celebrating; reranks stories in real time
- **Local radius filter** — surface stories from within 5–100 km
- **Love / bookmark / share / hide** per story
- **Daily Digest** — subscribe for a curated morning/afternoon/evening email briefing
- **7-day streak** with weekly calendar popover
- **Dark mode** — warm burnt umber palette, not cold grays; respects system preference
- **Fully responsive** — mobile bottom nav, desktop rail layout
- **Onboarding flow** — 2-step category + mood picker with animated completion screen
- **Account modal** — stats, preferences summary, BrightSide+ upgrade CTA
- **"How we filter"** — transparency page explaining the sentiment scoring system

## Design

Editorial warmth — inspired by The Atlantic, Monocle, Kinfolk. Fonts: `DM Serif Display` (headlines) + `DM Sans` (UI). Brand colour: `#E8651A` deep sunrise amber. No emoji anywhere — inline SVGs only.

## Stack

| Layer | Current |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Inline styles / CSS-in-JS |
| State | useState / useMemo / useCallback |
| Data | Hardcoded mock stories |
| Deploy | GitHub Pages |

**Production target:** Next.js 15 (App Router) · Tailwind CSS · Zustand · Go API · Supabase/PostgreSQL

## Project Structure

```
src/
├── App.jsx                     # Main component, all feed state/logic
├── lib/
│   ├── theme.js                # LIGHT/DARK tokens + category accent helpers
│   ├── mood.js                 # MOOD_CONFIG + moodScore()
│   ├── storage.js              # localStorage get/set with fallback
│   └── data.js                 # CATS + STORIES mock data
├── icons/
│   └── index.jsx               # All SVG icons
└── components/
    ├── Onboarding.jsx
    ├── SettingsPanel.jsx
    ├── StoryCard.jsx
    ├── StoryRail.jsx
    ├── CaughtUp.jsx
    ├── EmptyState.jsx
    └── modals/
        ├── Modal.jsx
        ├── ShareModal.jsx
        ├── DigestModal.jsx     # Includes email preview
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

## What's Not Built Yet

1. **Real content pipeline** — RSS ingestion, Google NLP sentiment scoring (≥0.65 auto-approve), Go API + Supabase
2. **BrightSide+** — $4.99/mo paywall (unlimited saves, ad-free, streak freeze, custom digest time)
3. **Account/auth** — Supabase Auth, persistent user profile
