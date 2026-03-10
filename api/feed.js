// api/feed.js — Vercel serverless function
// Fetches articles from The Guardian API, maps them to the BrightSide Story
// shape, and applies a keyword-based positive filter before returning JSON.

// ─── Category → Guardian API query map ────────────────────────────────────────

const CATEGORY_QUERY_MAP = {
  nature: {
    q: 'wildlife OR conservation OR "national park" OR restoration OR rewilding',
    section: "environment",
  },
  discover: {
    q: 'discovery OR breakthrough OR "new research" OR innovation OR "space exploration"',
    section: "science,technology",
  },
  community: {
    q: 'community OR volunteer OR charity OR "local hero" OR fundraising OR kindness',
    section: "society,uk-news",
  },
  wellness: {
    q: 'wellbeing OR "mental health" OR fitness OR mindfulness OR recovery OR "healthy living"',
    section: "lifeandstyle,society",
  },
  world: {
    q: 'aid OR humanitarian OR "peace deal" OR development OR "global health" OR diplomacy',
    section: "world",
  },
  politics: {
    q: 'reform OR legislation OR "new law" OR bipartisan OR passed OR "signed into law"',
    section: "politics,us-news",
  },
  local: {
    q: 'community OR neighbourhood OR "local council" OR "town centre" OR "high street"',
    section: "uk-news",
  },
  ideas: {
    q: 'creativity OR design OR "new book" OR arts OR architecture OR startup OR invention',
    section: "culture,technology,books",
  },
  all: {
    q: 'breakthrough OR recovery OR conservation OR volunteer OR innovation OR kindness OR discovery',
    section: "",
  },
};

// ─── Positive keyword filter ───────────────────────────────────────────────────

const BLOCKLIST = [
  "killed", "killing", "murder", "murdered", "dead", "death", "deaths", "died",
  "attack", "attacked", "shooting", "shooter", "gun violence", "stabbing",
  "bomb", "bombing", "explosion", "terror", "terrorist",
  "crash", "crashed", "disaster", "catastrophe", "casualties",
  "war", "warfare", "conflict", "invasion", "siege",
  "abuse", "abused", "assault", "rape", "trafficking",
  "crisis", "emergency", "collapse", "bankrupt", "recession",
  "scandal", "corruption", "fraud", "arrested", "charged", "convicted",
  "suicide", "overdose",
];

const SIGNAL_WORDS = [
  "awarded", "record", "breakthrough", "launched", "opened", "celebrated",
  "recovered", "restored", "saved", "rescued", "achieved", "won", "elected",
  "founded", "built", "created", "donated", "raised", "discovered", "approved",
  "expanded", "improved", "growing", "thriving", "healed", "reunited",
];

function positiveFilter(story) {
  const text = `${story.title} ${story.summary}`.toLowerCase();

  let blockHits = 0;
  for (const word of BLOCKLIST) {
    if (text.includes(word)) blockHits++;
  }

  let signals = 0;
  for (const word of SIGNAL_WORDS) {
    if (text.includes(word)) signals++;
  }

  const score = signals - blockHits * 3;
  return score >= 0;
}

// ─── Tag derivation ────────────────────────────────────────────────────────────

const TAG_POOLS = {
  nature:    ["Wildlife", "Conservation", "Environment", "Nature", "Rewilding"],
  discover:  ["Discovery", "Breakthrough", "Science", "Space", "Innovation"],
  community: ["Community", "Kindness", "Volunteer", "Local Hero", "Fundraising"],
  wellness:  ["Wellness", "Mental Health", "Fitness", "Recovery", "Mindfulness"],
  world:     ["Global", "Aid", "Diplomacy", "Peace", "Development"],
  politics:  ["Policy", "Reform", "Legislation", "Progress", "Democracy"],
  local:     ["Local", "Nearby", "Regional", "City", "Town"],
  ideas:     ["Ideas", "Design", "Arts", "Creativity", "Startup"],
  all:       ["Good News", "Positive", "Uplifting"],
};

const TAG_SIGNALS = {
  Wildlife:      /wildlife|animal|bird|mammal|reef/i,
  Conservation:  /conserv|protect|preserv/i,
  Rewilding:     /rewild|reintroduc|habitat restor/i,
  Discovery:     /discover|found|identified/i,
  Breakthrough:  /breakthrough|milestone|first ever/i,
  Space:         /space|nasa|orbit|planet|star|galaxy/i,
  Innovation:    /innovat|tech|engineer|invent/i,
  Kindness:      /kind|compassion|helped|support/i,
  Volunteer:     /volunteer|donate|charity/i,
  "Local Hero":  /hero|champion|communit/i,
  Fundraising:   /fundrais|raised|donated/i,
  Wellness:      /wellbeing|wellness|thrive/i,
  "Mental Health":/mental health|anxiety|depression|therapy/i,
  Fitness:       /fitness|exercise|sport|marathon/i,
  Recovery:      /recover|heal|rehabilit/i,
  Aid:           /aid|relief|humanitarian/i,
  Diplomacy:     /diplomat|negotiat|agreement|treaty/i,
  Peace:         /peace|ceasefire|reconcil/i,
  Reform:        /reform|overhaul|revamp/i,
  Legislation:   /law|legislat|bill|act\b/i,
  Design:        /design|architect|aesthetic/i,
  Arts:          /art|museum|gallery|theatre|concert/i,
  Startup:       /startup|founder|launch/i,
};

function deriveTag(category, title) {
  const pool = TAG_POOLS[category] || TAG_POOLS.all;
  for (const tag of pool) {
    const re = TAG_SIGNALS[tag];
    if (re && re.test(title)) return tag;
  }
  return pool[0];
}

// ─── Mood tags derivation ──────────────────────────────────────────────────────

const MOOD_SIGNALS = {
  achievement:  /award|record|won|champion|first ever|gold medal/i,
  breakthrough: /breakthrough|discovery|new research|invented|pioneered/i,
  kindness:     /kind|donated|volunteer|helped|saved|rescued/i,
  nature:       /wildlife|forest|ocean|plant|animal|rewild|conservation/i,
  milestone:    /milestone|anniversary|celebrat|launch|opening/i,
  progress:     /progress|improve|grow|expand|recover/i,
  hero:         /hero|champion|activist|campaigner/i,
  future:       /future|next generation|innovation|technology/i,
};

function deriveMoodTags(title, summary) {
  const text = `${title} ${summary}`;
  return Object.entries(MOOD_SIGNALS)
    .filter(([, re]) => re.test(text))
    .map(([tag]) => tag);
}

// ─── Utility helpers ───────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function estimateReadTime(wordcount) {
  const wc = parseInt(wordcount, 10) || 400;
  const mins = Math.max(1, Math.round(wc / 200));
  return `${mins} min read`;
}

// ─── Story mapper ──────────────────────────────────────────────────────────────

function mapToStory(article, category) {
  const title   = article.webTitle || "";
  const summary = article.fields?.trailText || "";
  return {
    id:       article.id,
    category,
    tag:      deriveTag(category, title),
    title,
    summary,
    body:     article.fields?.bodyText || summary,
    source:   "The Guardian",
    time:     timeAgo(article.webPublicationDate),
    readTime: estimateReadTime(article.fields?.wordcount),
    loves:    0,
    radius:   0,
    moodTags: deriveMoodTags(title, summary),
  };
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const { category = "all", page = 1 } = req.query;
  const key = process.env.GUARDIAN_API_KEY;

  if (!key) {
    res.status(500).json({ error: "GUARDIAN_API_KEY not configured" });
    return;
  }

  const query = CATEGORY_QUERY_MAP[category] || CATEGORY_QUERY_MAP.all;

  const url =
    `https://content.guardianapis.com/search` +
    `?q=${encodeURIComponent(query.q)}` +
    (query.section ? `&section=${encodeURIComponent(query.section)}` : "") +
    `&page-size=30&order-by=newest&page=${page}` +
    `&show-fields=trailText,wordcount,byline,bodyText` +
    `&api-key=${key}`;

  let data;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Guardian API ${r.status}`);
    data = await r.json();
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch from Guardian API", detail: err.message });
    return;
  }

  const articles = data.response?.results || [];

  const stories = articles
    .map(a => mapToStory(a, category))
    .filter(s => positiveFilter(s));

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.json({ stories, total: data.response?.total || 0 });
}
