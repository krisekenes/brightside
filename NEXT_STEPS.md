# BrightSide — Next Steps

## Status

The frontend is complete as a polished prototype on mock data. The next two milestones are:

- **Option B (immediate):** Wire up a real news API via a Vercel serverless function. Live content, keyword-based positive filtering, no database, minimal infrastructure.
- **Option C (migration):** Replace the serverless function with a proper Go API + Supabase backend, add Google NLP sentiment scoring, move the frontend to Next.js 15.

---

## TODO — Before You Can Start Option B

- [ ] **Sign up for The Guardian Open Platform API**
  URL: https://open-platform.theguardian.com/access/
  Free tier. No credit card. Get your API key from the dashboard.
  Key format: a UUID string, e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

- [ ] **Create a Vercel account and connect the GitHub repo**
  URL: https://vercel.com — sign in with GitHub
  Import the `brightside` repo. Vercel detects Vite automatically.

- [ ] **Add the API key as a Vercel environment variable**
  In Vercel project settings → Environment Variables:
  `GUARDIAN_API_KEY` = your key from step 1
  Set for Production + Preview + Development.

---

## Option B — Vercel Serverless News Feed

### Overview

A single Vercel API route (`/api/feed`) replaces the hardcoded `STORIES` array. It:
1. Receives a `category` query param from the frontend
2. Builds a Guardian API query for that category
3. Fetches articles, maps them to the BrightSide `Story` shape
4. Runs keyword-based positive filtering to reject clearly negative articles
5. Returns JSON the frontend already understands

The frontend gets a `useFeed(category, mood, prefs)` hook that calls `/api/feed` and handles loading/error states. The `STORIES` array stays in the codebase as a development fallback.

### Hosting change: GitHub Pages → Vercel

GitHub Pages is static-only. Vercel supports serverless functions alongside static builds.

```bash
# One-time deploy
npx vercel

# Thereafter, every push to main auto-deploys
```

The live URL changes from `krisekenes.github.io/brightside` to `brightside.vercel.app` (or a custom domain).

Update `vite.config.js`: remove `base: "/brightside/"` since Vercel serves from root.

---

### Category → Guardian API Query Map

The Guardian's `q` param accepts boolean operators. Each BrightSide category maps to a query designed to surface positive/constructive coverage:

| Category | Guardian section(s) | Query string |
|---|---|---|
| `nature` | `environment` | `wildlife OR conservation OR "national park" OR restoration OR "rewilding"` |
| `discover` | `science`, `technology` | `discovery OR breakthrough OR "new research" OR innovation OR "space exploration"` |
| `community` | `society`, `uk-news` | `community OR volunteer OR charity OR "local hero" OR fundraising OR kindness` |
| `wellness` | `lifeandstyle`, `society` | `wellbeing OR "mental health" OR fitness OR mindfulness OR recovery OR "healthy living"` |
| `world` | `world` | `aid OR "humanitarian" OR "peace deal" OR development OR "global health" OR diplomacy` |
| `politics` | `politics`, `us-news` | `reform OR legislation OR "new law" OR "bipartisan" OR "passed" OR "signed into law"` |
| `local` | `uk-news` | use geolocation lat/lng + Guardian's `production-office` param or `tags` for region |
| `ideas` | `culture`, `technology`, `books` | `creativity OR design OR "new book" OR arts OR architecture OR "startup" OR invention` |

Pagination: `page-size=20`, `order-by=newest`, `show-fields=trailText,thumbnail,wordcount,byline`.

---

### Positive Keyword Filter

Applied server-side in the API route before returning results. Two lists:

**Blocklist** — auto-reject if title or summary contains any of these:
```
killed, killing, murder, murdered, dead, death, deaths, died,
attack, attacked, shooting, shooter, gun violence, stabbing,
bomb, bombing, explosion, terror, terrorist,
crash, crashed, disaster, catastrophe, casualties,
war, warfare, conflict, invasion, siege,
abuse, abused, assault, rape, trafficking,
crisis, emergency, collapse, bankrupt, recession,
scandal, corruption, fraud, arrested, charged, convicted,
suicide, overdose
```

**Signal words** — count positives in title + summary:
```
awarded, record, breakthrough, launched, opened, celebrated,
recovered, restored, saved, rescued, achieved, won, elected,
founded, built, created, donated, raised, discovered, approved,
expanded, improved, growing, thriving, healed, reunited
```

**Scoring:**
```
score = positive_signals - (blocklist_hits * 3)
accept if score >= 0
```

The 3x penalty means a single blocklist word overrides 3 positive signals. This is intentionally aggressive — false negatives (missing a good story) are better than false positives (showing a bad one).

---

### Story Shape Mapping

The Guardian response maps to the existing BrightSide `Story` shape like this:

```js
// Guardian article → BrightSide Story
{
  id:       article.id,                              // Guardian's path string
  category: requestedCategory,                       // from the query param
  tag:      deriveTag(article.sectionName, query),   // see tag derivation below
  title:    article.webTitle,
  summary:  article.fields.trailText || "",
  body:     article.fields.bodyText || article.fields.trailText,
  source:   "The Guardian",
  time:     timeAgo(article.webPublicationDate),
  readTime: estimateReadTime(article.fields.wordcount),
  loves:    0,                                        // no engagement data yet
  radius:   0,                                        // 0 = national/global
  moodTags: deriveMoodTags(article.webTitle, article.fields.trailText),
}
```

**Tag derivation** — map Guardian section + query to a BrightSide display tag:
```js
const TAG_MAP = {
  nature:    ["Wildlife","Conservation","Environment","Nature","Rewilding"],
  discover:  ["Discovery","Breakthrough","Science","Space","Innovation"],
  community: ["Community","Kindness","Volunteer","Local Hero","Fundraising"],
  wellness:  ["Wellness","Mental Health","Fitness","Recovery","Mindfulness"],
  world:     ["Global","Aid","Diplomacy","Peace","Development"],
  politics:  ["Policy","Reform","Legislation","Progress","Democracy"],
  local:     ["Local","Nearby","Regional","City","Town"],
  ideas:     ["Ideas","Design","Arts","Creativity","Startup"],
}
// Pick one from the list based on which signal words appear in the title
```

**moodTags derivation** — scan title + summary for MOOD_CONFIG signal words and return matching ones. Simple regex per mood:
```js
const MOOD_SIGNALS = {
  achievement: /award|record|won|champion|first ever/i,
  breakthrough: /breakthrough|discovery|new research|invented/i,
  kindness:    /kind|donated|volunteer|helped|saved/i,
  nature:      /wildlife|forest|ocean|plant|animal|rewild/i,
  milestone:   /milestone|anniversary|celebrat|launch/i,
  // etc.
}
```

---

### API Route File

Create `api/feed.js` at the repo root (Vercel picks this up automatically):

```js
// api/feed.js
export default async function handler(req, res) {
  const { category = "all", page = 1 } = req.query;
  const key = process.env.GUARDIAN_API_KEY;

  const queries = CATEGORY_QUERY_MAP[category] || CATEGORY_QUERY_MAP.all;
  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(queries.q)}`
    + `&section=${queries.section || ""}`
    + `&page-size=30&order-by=newest&page=${page}`
    + `&show-fields=trailText,wordcount,byline,bodyText`
    + `&api-key=${key}`;

  const data = await fetch(url).then(r => r.json());
  const articles = data.response?.results || [];

  const stories = articles
    .map(a => mapToStory(a, category))
    .filter(s => positiveFilter(s));  // keyword filter

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.json({ stories, total: data.response?.total || 0 });
}
```

The `Cache-Control` header tells Vercel's CDN to cache responses for 5 minutes and serve stale for up to 10 — this avoids hammering the Guardian API on every page load.

---

### Frontend Changes

**1. Create `src/lib/useFeed.js`:**
```js
import { useState, useEffect } from "react";
import { STORIES } from "./data"; // fallback

export function useFeed(category = "all") {
  const [stories, setStories] = useState(STORIES); // start with mock data
  const [loading, setLoading]  = useState(false);
  const [error,   setError]    = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/feed?category=${category}`)
      .then(r => r.json())
      .then(d => { setStories(d.stories); setError(null); })
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [category]);

  return { stories, loading, error };
}
```

**2. Update `App.jsx`:** replace `import { CATS, STORIES } from "./lib/data"` with `useFeed()`.

**3. Add loading state:** a subtle skeleton shimmer on the feed grid while articles load (not a full-page spinner — show stale/mock data until fresh data arrives).

**4. Error state:** if the API call fails, fall back to mock stories silently in dev, show a quiet "Couldn't refresh feed" banner in production.

---

### Environment Variables

```
# .env.local (development — never commit)
GUARDIAN_API_KEY=your-key-here

# Vercel dashboard — set for Production + Preview + Development
GUARDIAN_API_KEY=your-key-here
```

Add `.env.local` to `.gitignore` if not already present.

---

## Option C — Migration Path to Full Backend

This is the production architecture. Build it in phases — each phase is independently shippable.

---

### Phase 1 — Add Google NLP to the existing serverless function

**What changes:** The Vercel API route adds a call to Google's Natural Language API to score each article's sentiment before filtering. Replaces the keyword heuristic with a proper ML score.

**Prerequisites:**
- [ ] Google Cloud account + Natural Language API enabled
- [ ] `GOOGLE_NLP_API_KEY` environment variable in Vercel

**Sentiment scoring:**
```js
async function sentimentScore(text) {
  const res = await fetch(
    `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${process.env.GOOGLE_NLP_API_KEY}`,
    {
      method: "POST",
      body: JSON.stringify({
        document: { type: "PLAIN_TEXT", content: text },
        encodingType: "UTF8",
      }),
    }
  );
  const data = await res.json();
  return data.documentSentiment?.score ?? 0;
}
```

**Thresholds (from PRD):**

| Score | Action |
|---|---|
| ≥ 0.65 | Auto-approve → feed |
| 0.45–0.65 | Future: editorial review queue |
| < 0.45 | Reject |

**Cost:** ~$1 per 1,000 articles analysed. At 30 articles/request × 100 req/day = 3,000 articles/day = ~$3/day at scale. Cache aggressively to control this.

**moodTags from NLP:** Google NLP returns entity categories and salience scores. Map high-salience entity types to moodTags:
- Entity type `CONSUMER_GOOD`, `WORK_OF_ART` → `creativity`
- Entity type `LOCATION` + positive score → `nature` (if outdoor-related)
- High-salience `PERSON` + positive score → `hero`

---

### Phase 2 — Go API (replaces Vercel serverless function)

**What changes:** The Node.js Vercel function is replaced by a Go HTTP server. The frontend calls the same `/api/feed` endpoint — no frontend changes required.

**Why Go here:**
- Concurrent RSS ingestion (fetch 20 feeds simultaneously)
- Faster sentiment scoring pipeline
- More control over caching, deduplication, scheduling

**Stack:**
- `chi` router
- `gofeed` for RSS parsing
- `go-guardian-api` or raw HTTP for Guardian requests
- Redis (Upstash free tier) for response caching

**Endpoint shape stays identical:**
```
GET /api/feed?category=nature&page=1
→ { stories: Story[], total: number }
```

**Deploy:** Fly.io or Railway (both have free tiers for a Go binary). Point the Vercel frontend's API calls at the new URL via an environment variable: `VITE_API_BASE=https://api.brightside.app`.

---

### Phase 3 — Supabase (story storage + deduplication)

**What changes:** Stories are stored in Supabase PostgreSQL rather than fetched live on every request. A background job (cron or Fly.io scheduled task) ingests and scores new stories every 30 minutes.

**Schema:**
```sql
-- stories
id            uuid primary key default gen_random_uuid()
external_id   text unique          -- Guardian article path
category      text not null
tag           text
title         text not null
summary       text
body          text
source        text
published_at  timestamptz
sentiment     float                -- Google NLP score
mood_tags     text[]
radius        int default 0
loves         int default 0
created_at    timestamptz default now()

-- stories_engagement (future)
story_id      uuid references stories
user_id       uuid references auth.users
action        text   -- 'love' | 'save' | 'hide'
created_at    timestamptz default now()
```

**PostGIS for local stories:**
```sql
ALTER TABLE stories ADD COLUMN location geography(Point, 4326);
CREATE INDEX stories_location_idx ON stories USING GIST(location);

-- Query: stories within 50km of user
SELECT * FROM stories
WHERE ST_DWithin(location, ST_MakePoint($lng, $lat)::geography, $radius_meters)
ORDER BY published_at DESC;
```

---

### Phase 4 — Frontend migration to Next.js 15

**What changes:** The Vite app is rewritten as a Next.js 15 App Router project. This enables server-side rendering, React Server Components, and cleaner API route co-location.

**Migration strategy:**
- Keep all component files — they're pure React, no Vite-specific code
- Replace inline `<style>` blocks with Tailwind (token values defined in `tailwind.config.js`)
- Replace `useState` theme with `next-themes`
- Replace `useFeed()` with a React Server Component that fetches directly from Supabase
- Keep `localStorage` prefs approach — or migrate to Supabase Auth + user profiles

**Key files that change:**
- `src/App.jsx` → `app/page.tsx` (Server Component wrapper) + `app/feed.tsx` (Client Component)
- `src/lib/theme.js` → `tailwind.config.js` + CSS variables
- `src/lib/data.js` → `app/lib/db.ts` (Supabase queries)
- `src/lib/mood.js` → `app/lib/mood.ts` (same logic, TypeScript)

**Hosting:** Stays on Vercel. No URL change.

---

## Architecture Overview

```
Option B (now)
  Browser → Vercel CDN → /api/feed (Node.js) → Guardian API
                                              → keyword filter
                                              → Story[]

Option C (later)
  Browser → Vercel/CDN → Next.js RSC → Supabase (cached stories)
  Cron job (every 30min):
    Fly.io Go worker → RSS feeds + Guardian API
                     → Google NLP sentiment scoring
                     → Supabase INSERT (deduped by external_id)
```

---

## News Sources (current and future)

| Source | API | Cost | Notes |
|---|---|---|---|
| The Guardian | REST API | Free | High quality, good international coverage, topic filtering |
| AP News | No public API | — | RSS feeds available |
| Good News Network | RSS | Free | Purpose-built positive news |
| Positive News | RSS | Free | UK-based, curated |
| Reuters | Commercial API | Paid | Phase 3+ |
| BBC | RSS | Free | Good for world/local |

For Option B, start with The Guardian only. Add RSS sources in Phase 2 when the Go worker handles ingestion.

---

## Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| News API | The Guardian | Free, no credit card, high quality, good topic API |
| Serverless platform | Vercel | Native Vite support, free tier, edge caching |
| Sentiment filtering (now) | Keyword heuristic | Fast to build, good enough for launch |
| Sentiment filtering (later) | Google NLP | Proper ML scores, moodTags automation |
| Backend language | Go | Concurrent ingestion, matches CLAUDE.md plan |
| Database | Supabase PostgreSQL + PostGIS | Auth, storage, radius queries in one service |
| Frontend framework (now) | React 18 + Vite | Already built, no throwaway work |
| Frontend framework (later) | Next.js 15 App Router | SSR, co-located API routes, RSC for feed |
