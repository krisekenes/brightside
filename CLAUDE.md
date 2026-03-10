# BrightSide — Claude CLI Handoff Context

---

## What This Is

**BrightSide** is a positive-news web app — "Today's Good News". It filters out negative/distressing content and serves good and neutral news across categories, with mood-based feed reranking, geographic radius filtering, and engagement features designed to replace doom scrolling with intentional reading.

Design inspiration: The Atlantic, Monocle, Kinfolk — editorial warmth, not wellness-app.

---

## Current State

The app is a modular React 18 + Vite project. It has been refactored out of a single-file prototype into a proper `src/` component tree. The feed runs on 12 hardcoded mock stories. The immediate next milestone is wiring it to a real news API via a Vercel serverless function — see `NEXT_STEPS.md`.

---

## Tech Stack

| Layer | Current | Next (Option B) | Production (Option C) |
|---|---|---|---|
| Frontend | React 18 + Vite | React 18 + Vite | Next.js 15 (App Router) |
| Styling | Inline styles + CSS-in-JS | Inline styles | Tailwind CSS or CSS Modules |
| State | useState / useMemo / useCallback | useState + useFeed hook | Zustand or Jotai |
| Data | Hardcoded STORIES array | Guardian API (Vercel serverless) | Go API + Supabase/PostgreSQL |
| Auth | None | None | Supabase Auth |
| Persistence | localStorage (prefs, dark mode) | localStorage | Supabase user profile + localStorage fallback |
| Sentiment | None | Keyword heuristic | Google NLP API (score ≥ 0.65 auto-approve) |
| Deploy | GitHub Pages | Vercel | Vercel |
| Email | None | None | Resend |

---

## Design System

### Brand
- Name: **BrightSide**
- Tagline: **Today's Good News**
- Fonts: `Bricolage Grotesque` (all headlines, variable font `opsz,wght@12..96,200..800`) + `DM Sans` (body/UI, weights 300–700)
- `DM Serif Display` is retained **only** for the "BrightSide" wordmark — do not use it for headings or card titles
- No emoji anywhere — all icons are inline SVGs in `src/icons/index.jsx`

### Color Tokens

**Light mode:**
```
amber:       #E8651A   — primary brand, deep sunrise amber
amberLight:  #F5A05A
amberPale:   #FEF0E6   — amber tint backgrounds
amberMid:    #F7C89B
amberGlow:   rgba(232,101,26,0.12)
ink:         #1C1917   — near-black, warm toned
inkMid:      #57534E   — body text
inkLight:    #A8A29E   — metadata, muted
inkFaint:    #D6CFC7   — dividers, disabled
bg:          #FDFAF6   — main page background
surface:     #FFFFFF   — cards, modals
surfaceAlt:  #F7F3ED   — secondary surfaces, inputs
border:      #EFE9DF
borderLight: #F5F0E8
```

**Dark mode:** Warm burnt umber browns (not cold grays). Dark bg is `#171412`, cards are `#211D1A`. The amber accent is bumped to `#F5813A` so it glows on dark surfaces.

### Per-Category Accents
```
nature:    #3D9970 / #4DB882
discover:  #7C52C8 / #9B75E0
community: #C4991A / #E0B830
wellness:  #38A169 / #52C285
world:     #3B72C4 / #6293E0
politics:  #4472B8 / #6A96D8
local:     #E8651A / #F5813A  (same as brand amber)
ideas:     #B85490 / #D878B0
```

### Design Rules
- No emoji anywhere — all icons are inline SVGs
- No external icon libraries
- Category labels are editorial: Nature (not Animals), Discover (not Science), Community (not Humans)
- "Love" not "Like" — heart SVG with live count on card
- Hiding a story ("unsee") is NOT fed back as negative signal — it just suppresses from the current session

---

## Architecture

### File Structure
```
api/
└── feed.js                     # Vercel serverless function (Option B, to be created)
src/
├── App.jsx                     # Main component, all feed state/logic
├── lib/
│   ├── theme.js                # LIGHT/DARK tokens, cAcc(), cBg() helpers
│   ├── mood.js                 # MOOD_CONFIG + moodScore()
│   ├── storage.js              # LS helper: get(key, fallback) / set(key, value)
│   └── data.js                 # CATS array + STORIES mock data
├── icons/
│   └── index.jsx               # All SVG icons as named exports on Ic object
└── components/
    ├── Onboarding.jsx          # Kept in codebase but NO LONGER shown as a gate
    ├── SettingsPanel.jsx       # Slide-in drawer, right side
    ├── StoryCard.jsx
    ├── StoryRail.jsx
    ├── SwipeMode.jsx           # Discover / Tinder-style swipe deck
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

### Onboarding — Deferred Personalisation

New users land directly in the feed (all categories, no mood). The `<Onboarding />` gate is removed. Instead:
- `bs-onboarded` localStorage key still exists; `updatePrefs()` sets it to true when any preference is saved
- A non-blocking amber **nudge card** appears inline in the feed for users where `!hasOnboarded && !nudgeDismissed`
- "Personalise" opens SettingsPanel; "Keep as is" calls `updatePrefs(prefs)` to dismiss permanently
- `bs-nudge-dismissed` localStorage key tracks dismiss independently of `bs-onboarded`

### Tag Filtering + Mood Suggestion

- `activeTag` state: clicking any story tag (on StoryCard, StoryRail, hero card) toggles this
- Active tag shown as a dismissible amber chip row between the cat nav and radius bar
- `tagHistory` state: a Record counting clicks per tag across the session
- `moodSuggestion` useEffect: when ≥3 clicks accumulate on tags that map to a mood, a persistent suggestion banner appears at `position:fixed, bottom: isMobile?88:32, zIndex:490`
- 8s auto-dismiss timer via `suggTimerRef` (useRef for cleanup)
- "Try it" applies the mood; "×" dismisses

### Mood System

Mood pills are rendered **inline in the category nav row** (not a separate bar), separated by a thin `width:1px` divider. This keeps the header to a single row on both desktop and mobile.

```js
MOOD_CONFIG = {
  Inspired:    { categoryBoost: {discover:2.0, community:1.8, ideas:1.6, politics:1.2}, storyTags: ["achievement","breakthrough","innovation","hero"] },
  Hopeful:     { categoryBoost: {world:2.0, politics:1.8, nature:1.6, wellness:1.4},    storyTags: ["recovery","progress","milestone","future"] },
  Wholesome:   { categoryBoost: {community:2.0, local:1.8, ideas:1.4, wellness:1.2},    storyTags: ["kindness","community","connection","family"] },
  Peaceful:    { categoryBoost: {nature:2.2, wellness:2.0, world:1.2, local:1.3},        storyTags: ["nature","calm","wildlife","environment"] },
  Celebrating: { categoryBoost: {community:2.0, discover:1.8, nature:1.6, politics:1.5}, storyTags: ["milestone","record","victory","first"] },
}

moodScore(story, mood) = categoryBoost[story.category] * (1.4 if story.moodTags overlaps storyTags, else 1.0)
```

Feed is sorted descending by moodScore, with `loves` as tiebreaker.

### Discover / SwipeMode

`<SwipeMode />` is a full-screen overlay triggered by the Discover button (desktop header) or Discover tab (mobile bottom nav).

- Pointer events API (`setPointerCapture`) for reliable cross-device drag tracking
- `movedRef` distinguishes tap (open story) from drag (swipe decision)
- `THRESHOLD = 85px` — swipe must travel this far to commit
- Right swipe → `onLove(id)` (adds to lovedStories set); Left swipe → `onPass(id)` (adds to unseen set)
- Fly-out animation: `translateX(±640px) translateY(-60px)` over 320ms
- LOVE/PASS stamps fade in proportionally to drag distance
- Stack cards behind the active card at scale 0.88/0.94
- "NEW" badge (`swipeNew` state) pulses until first open (`bsNewPing` keyframe)

### Personalisation / Prefs

localStorage keys:
- `bs-onboarded` — boolean
- `bs-nudge-dismissed` — boolean
- `bs-prefs` — `{ categories: string[], mood: string | null }`
- `bs-dark` — `"true" | "false"` — manual dark mode override

**activeMood init:** `useState(prefs.mood)` — reads from the already-parsed prefs object, not raw localStorage.

**Edge case guards in place:**
- Missing or corrupt `bs-prefs` → silently reconstruct with all-category defaults
- Empty categories array → fall back to all categories
- Unknown mood string (schema mismatch) → reset to null

### Story Data Shape
```ts
type Story = {
  id:       number
  category: "nature" | "discover" | "community" | "wellness" | "world" | "politics" | "local" | "ideas"
  tag:      string          // display label, Title Case — clickable for tag filter
  title:    string
  summary:  string          // 1-2 sentence summary shown on card
  body:     string          // full article text shown in modal
  source:   string
  time:     string          // e.g. "2h ago"
  readTime: string          // e.g. "3 min"
  loves:    number          // seed engagement count
  radius:   number          // km from user — 0 means national/global
  featured?: boolean        // marks the hero story
  moodTags: string[]        // used by moodScore() for tag boost
}
```

---

## Components

### `<Onboarding />` — kept, not used as gate
In codebase for re-entry (Settings → "Reset preferences"). Not shown to new users on first load.

### `<SettingsPanel />` — slide-in drawer (right side)
- Accessible via gear icon in header at all times
- Full category toggle list + default mood selector
- Saves immediately to localStorage and updates live feed
- Mood toggle: `activeMood === m ? null : m` (toggle off = null, not double-negation bug)

### `<StoryCard />` — feed grid item
- Colored top bar (3px, category accent gradient)
- Tag label (clickable → `onTagClick`), title (Bricolage Grotesque 500), truncated summary
- Footer: source, timestamp, love button (with count), bookmark, share, hide (eye icon)
- All icon-only buttons have `aria-label`

### `<StoryRail />` — horizontal scroll section
- Used for "Most Loved Today" and "Spreading Joy Near You"
- Scroll-snap, mobile-optimized card widths (255px desktop, 215px mobile)
- Tag label clickable → `onTagClick`

### `<SwipeMode />` — full-screen swipe deck
- See Discover/SwipeMode section above

### `<CaughtUp />` — end of feed moment
- 1.8s delay then fades + rises in; re-mounts on category change

### `<EmptyState />` — context-aware no-results states
Four variants: `search`, `local`, `mood`, `category`

### Modals
- `<StoryModal />` — full story body, hide button, ESC to close
- `<ShareModal />` — branded card preview, Copy Link / Twitter / Messages
- `<DigestModal />` — email + time preference subscribe flow
- `<AccountModal />` — stats and preferences summary
- `<HowWeFilterModal />` — transparency page explaining sentiment scoring

---

## Responsive Behaviour

Breakpoint: `640px` (detected via `window.innerWidth`, updates on resize)

| Element | Desktop (≥640px) | Mobile (<640px) |
|---|---|---|
| Hero card | Two-column (content + visual panel) | Single column, no visual panel |
| Story grid | `auto-fill minmax(285px, 1fr)` | Single column |
| Category nav | Rail in sticky header (with mood pills inline) | Horizontal pill scroll below header |
| Bottom nav | Hidden | Fixed 4-tab bar (Home, Discover, Saved, Digest) |
| Discover button | In header, with NEW badge | Bottom nav Discover tab |
| Streak badge | Fixed bottom-right floating pill | Hidden (streak accessible via nav) |

---

## Feature Inventory (what's built)

- [x] Personalised feed filtered by preferred categories
- [x] Deferred onboarding — users land in the feed, nudge card offers personalisation
- [x] Tag filtering — click tag to filter feed; repeated clicks suggest a mood
- [x] Mood selector (inline with cat nav, single row) with live feed reranking
- [x] Mood suggestion banner (fires after ≥3 related tag clicks, 8s auto-dismiss)
- [x] Discover / SwipeMode — Tinder-style card deck with love/pass/read
- [x] Local radius slider (5–100km) with story count
- [x] Love / bookmark / share / hide (unsee) per story
- [x] Story detail modal (full body)
- [x] Share modal (branded card + copy/social)
- [x] Daily Digest subscribe modal
- [x] "Most Loved Today" horizontal rail
- [x] "Spreading Joy Near You" horizontal rail
- [x] 7-day streak badge + weekly calendar popover
- [x] Search (inline, filters visible feed)
- [x] Dark mode (system default + manual override, persisted)
- [x] Fully responsive (mobile / tablet / desktop)
- [x] Mobile bottom nav (Home / Discover / Saved / Digest)
- [x] Settings panel (edit categories + default mood anytime)
- [x] Saved shelf (desktop inline, mobile tab)
- [x] Context-aware empty states (search / local / mood / category)
- [x] "You're caught up" animated end-of-feed moment
- [x] All icon-only buttons have aria-labels

---

## What's NOT Built Yet

Immediate next: **Option B** — real news via Vercel serverless + Guardian API. See `NEXT_STEPS.md`.

Then in phases:
1. Google NLP sentiment scoring (replaces keyword heuristic)
2. Go API backend (replaces Node.js serverless)
3. Supabase PostgreSQL + PostGIS (story storage + radius queries)
4. Next.js 15 migration (SSR, React Server Components)

Not yet designed:
- BrightSide+ upgrade moment (paywall surface, upgrade modal)
- Account/auth (Supabase Auth, persistent user profile)
- Digest email HTML template

---

## Monetization Model

**Free tier:** Full feed, mood system, saves (limited), streak, digest (morning only)
**BrightSide+ ($4.99/mo):**
- Ad-free
- Unlimited saves
- Streak freeze (1 per month)
- Custom digest delivery time
- Early access to new categories

---

## KPIs (Month 12 targets)

- 500K MAU
- 12K paid subscribers
- 30% D7 retention
- Digest open rate ≥ 38%
- Avg session ≥ 6 min

---

## Sentiment Filtering Rules

| Score | Action |
|---|---|
| ≥ 0.65 | Auto-approve → feed |
| 0.45–0.65 | Editorial review queue |
| < 0.45 | Auto-reject |

Story hides (unsee) are NOT fed back as negative training signal — they represent preference, not quality.

---

## Notes for Claude CLI

- Main entry point is `src/App.jsx`. All feed state lives here; components receive props only.
- `STORIES` in `src/lib/data.js` is the shape contract for the API response. When Option B is live, replace static import with `useFeed()` hook calling `/api/feed`.
- `src/lib/mood.js` (`MOOD_CONFIG`, `moodScore`) will be needed server-side for digest personalisation — keep pure JS, no browser APIs.
- `src/lib/storage.js` (`LS` helper) is the only place localStorage is accessed — keep it that way.
- Dark mode: `dark` boolean + two complete token objects (`LIGHT`/`DARK`) in `theme.js`. Next.js migration → `next-themes` + `ThemeProvider`.
- `vite.config.js` has `base: "/brightside/"` for GitHub Pages — remove this when moving to Vercel.
- No emoji anywhere in the UI — intentional, maintain this.
- Bricolage Grotesque is a variable font; load with `opsz,wght@12..96,200..800` in the Google Fonts URL.
- `SwipeMode` uses pointer capture — test on both touch (iOS Safari) and mouse (desktop) when making changes.
