// api/feed.js — Multi-source Vercel serverless function
// Sources: The Guardian · NewsAPI · New York Times · Hacker News

// ─── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = {
  nature: {
    guardian: { q: 'wildlife OR conservation OR "national park" OR restoration OR rewilding', section: "environment" },
    newsapi:  { q: '"wildlife" OR "conservation" OR "rewilding" OR "national park"' },
    nyt:      { q: 'wildlife OR conservation OR rewilding', section: "Science" },
  },
  discover: {
    guardian: { q: 'discovery OR breakthrough OR "new research" OR innovation OR "space exploration"', section: "science|technology" },
    newsapi:  { q: '"breakthrough" OR "discovery" OR "space exploration" OR "new research"' },
    nyt:      { q: 'discovery OR breakthrough OR innovation OR "space exploration"', section: "Science" },
    hn:       true,
  },
  community: {
    guardian: { q: 'community OR volunteer OR charity OR "local hero" OR fundraising OR kindness', section: "society|uk-news" },
    newsapi:  { q: '"volunteer" OR "charity" OR "fundraising" OR "local hero" OR "community"' },
    nyt:      { q: 'volunteer OR charity OR community OR fundraising', section: "U.S." },
  },
  wellness: {
    guardian: { q: 'wellbeing OR "mental health" OR fitness OR mindfulness OR recovery OR "healthy living"', section: "lifeandstyle|society" },
    newsapi:  { category: "health" },
    nyt:      { q: 'wellbeing OR fitness OR mindfulness OR "healthy living"', section: "Health" },
  },
  world: {
    guardian: { q: 'aid OR humanitarian OR "peace deal" OR development OR "global health" OR diplomacy', section: "world" },
    newsapi:  { q: '"humanitarian" OR "aid" OR "diplomacy" OR "peace" OR "development"' },
    nyt:      { q: 'humanitarian OR aid OR diplomacy OR "peace deal"', section: "World" },
  },
  politics: {
    guardian: { q: 'reform OR legislation OR "new law" OR bipartisan OR passed OR "signed into law"', section: "politics|us-news" },
    newsapi:  { q: '"legislation" OR "reform" OR "new law" OR "signed into law" OR "bipartisan"' },
    nyt:      { q: 'legislation OR reform OR "new law" OR "bipartisan"', section: "Politics" },
  },
  local: {
    guardian: { q: 'community OR neighbourhood OR "local council" OR "town centre" OR "high street"', section: "uk-news" },
    newsapi:  { q: '"local" OR "community" OR "neighbourhood" OR "town"' },
    nyt:      { q: 'local community OR neighbourhood', section: "U.S." },
  },
  ideas: {
    guardian: { q: 'creativity OR design OR "new book" OR arts OR architecture OR startup OR invention', section: "culture|technology|books" },
    newsapi:  { q: '"design" OR "arts" OR "startup" OR "creativity" OR "architecture" OR "invention"' },
    nyt:      { q: 'design OR arts OR creativity OR startup', section: "Arts" },
    hn:       true,
  },
  all: {
    guardian: { q: 'breakthrough OR recovery OR conservation OR volunteer OR innovation OR kindness OR discovery', section: "" },
  },
};

// ─── Positive keyword filter ───────────────────────────────────────────────────

const BLOCKLIST_RE = /\b(killed|killing|murder|murdered|deaths?|died|shooting|shooter|gun\s+violence|stabbing|bombing?|explosion|terrorist?|missile|airstrike|military\s+strike|crashed?|disaster|catastrophe|casualties|warfare?|invasion|siege|abused?|assault|rape|trafficking|bankrupt|recession|scandal|corruption|fraud|arrested|convicted|suicide|overdose|hostage|kidnap)\b/gi;
const SOFT_BLOCK_RE = /\b(conflict|crisis|emergency|war|collapse|charged)\b/gi;
const POSITIVE_FRAMING_RE = /\b(end(ed|ing|s)?|resolv|peace|after|former|avoided?|prevented?|survived?|overcome|past|history|historic)\b/i;
const SIGNAL_RE = /\b(awarded?|record|breakthrough|launched?|opened?|celebrated?|recovered?|restored?|saved?|rescued?|achieved?|won|elected?|founded?|built|created?|donated?|raised|discovered?|approved?|expanded?|improved?|growing|thriving|healed?|reunited?|announce[sd]?|named|pioneered?|completed?|milestone|inspiring)\b/gi;

function stripHtml(str) { return (str || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function countMatches(text, re) { return (text.match(re) || []).length; }

function positiveFilter(story) {
  const raw  = stripHtml(`${story.title} ${story.summary}`);
  if (raw.length < 40) return false;
  const text = raw.toLowerCase();
  if (countMatches(text, BLOCKLIST_RE) > 0) return false;
  const softBlocks   = countMatches(text, SOFT_BLOCK_RE);
  const hasFraming   = POSITIVE_FRAMING_RE.test(text);
  const effectiveSoft = (softBlocks > 0 && !hasFraming) ? softBlocks : 0;
  const signals = countMatches(text, SIGNAL_RE);
  return (signals - effectiveSoft * 2) >= 0;
}

// ─── Deduplication ─────────────────────────────────────────────────────────────

function titleWords(title) {
  return new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 3));
}

function isDuplicate(title, seen) {
  const words = titleWords(title);
  for (const seenTitle of seen) {
    const seenWords = titleWords(seenTitle);
    const overlap = [...words].filter(w => seenWords.has(w)).length;
    const similarity = overlap / Math.max(words.size, seenWords.size, 1);
    if (similarity > 0.6) return true;
  }
  return false;
}

// ─── Tag + mood derivation ─────────────────────────────────────────────────────

const TAG_POOLS = {
  nature:    ["Wildlife", "Conservation", "Environment", "Nature", "Rewilding"],
  discover:  ["Discovery", "Breakthrough", "Science", "Space", "Innovation"],
  community: ["Community", "Kindness", "Volunteer", "Local Hero", "Fundraising"],
  wellness:  ["Wellness", "Mental Health", "Fitness", "Recovery", "Mindfulness"],
  world:     ["Global", "Aid", "Diplomacy", "Peace", "Development"],
  politics:  ["Policy", "Reform", "Legislation", "Progress", "Democracy"],
  local:     ["Local", "Nearby", "Regional", "City", "Town"],
  ideas:     ["Ideas", "Design", "Arts", "Creativity", "Startup"],
};

const TAG_SIGNALS = {
  Wildlife:       /wildlife|animal|bird|mammal|reef/i,
  Conservation:   /conserv|protect|preserv/i,
  Rewilding:      /rewild|reintroduc|habitat restor/i,
  Discovery:      /discover|found|identified/i,
  Breakthrough:   /breakthrough|milestone|first ever/i,
  Space:          /space|nasa|orbit|planet|star|galaxy/i,
  Innovation:     /innovat|tech|engineer|invent/i,
  Kindness:       /kind|compassion|helped|support/i,
  Volunteer:      /volunteer|donate|charity/i,
  "Local Hero":   /hero|champion|communit/i,
  Fundraising:    /fundrais|raised|donated/i,
  Wellness:       /wellbeing|wellness|thrive/i,
  "Mental Health":/mental health|anxiety|depression|therapy/i,
  Fitness:        /fitness|exercise|sport|marathon/i,
  Recovery:       /recover|heal|rehabilit/i,
  Aid:            /aid|relief|humanitarian/i,
  Diplomacy:      /diplomat|negotiat|agreement|treaty/i,
  Peace:          /peace|ceasefire|reconcil/i,
  Reform:         /reform|overhaul|revamp/i,
  Legislation:    /law|legislat|bill|act\b/i,
  Design:         /design|architect|aesthetic/i,
  Arts:           /art|museum|gallery|theatre|concert/i,
  Startup:        /startup|founder|launch/i,
};

function deriveTag(category, title) {
  const pool = TAG_POOLS[category] || TAG_POOLS.discover;
  for (const tag of pool) {
    const re = TAG_SIGNALS[tag];
    if (re && re.test(title)) return tag;
  }
  return pool[0];
}

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
  return Object.entries(MOOD_SIGNALS).filter(([, re]) => re.test(text)).map(([tag]) => tag);
}

// ─── Utility helpers ───────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function estimateReadTime(wordcount) {
  const mins = Math.max(1, Math.round((parseInt(wordcount, 10) || 400) / 200));
  return `${mins} min read`;
}

// ─── Guardian section → BrightSide category ───────────────────────────────────

const SECTION_TO_CATEGORY = {
  "environment": "nature", "science": "discover", "technology": "discover",
  "society": "community", "uk-news": "community", "lifeandstyle": "wellness",
  "world": "world", "politics": "politics", "us-news": "politics",
  "culture": "ideas", "books": "ideas", "film": "ideas", "music": "ideas",
  "sport": "discover", "business": "world", "money": "wellness",
};

function resolveCategory(requestedCategory, sectionId) {
  if (requestedCategory !== "all") return requestedCategory;
  return SECTION_TO_CATEGORY[sectionId] || "discover";
}

function regionTag(lat, lng) {
  if (!lat || !lng) return null;
  const la = parseFloat(lat), lo = parseFloat(lng);
  if (la > 49 && la < 61 && lo > -8  && lo < 2)   return "uk/uk";
  if (la > 24 && la < 50 && lo > -125 && lo < -66) return "world/usa";
  if (la > -44 && la < -10 && lo > 113 && lo < 154) return "world/australia";
  if (la > 42 && la < 84 && lo > -141 && lo < -52) return "world/canada";
  return null;
}

// ─── Source fetchers ───────────────────────────────────────────────────────────

async function fetchGuardian(category, page, lat, lng, key) {
  const cfg = CATEGORIES[category]?.guardian || CATEGORIES.all.guardian;
  const tag = category === "local" ? regionTag(lat, lng) : null;
  const url =
    `https://content.guardianapis.com/search` +
    `?q=${encodeURIComponent(cfg.q)}` +
    (cfg.section ? `&section=${cfg.section}` : "") +
    `&page-size=30&order-by=newest&page=${page}` +
    `&show-fields=trailText,wordcount,bodyText` +
    (tag ? `&tag=${encodeURIComponent(tag)}` : `&tag=type/article`) +
    `&api-key=${key}`;
  const data = await fetch(url).then(r => r.json());
  return (data.response?.results || []).map(a => {
    const cat = resolveCategory(category, a.sectionId || "");
    return {
      id:       `guardian:${a.id}`,
      category: cat,
      tag:      deriveTag(cat, a.webTitle),
      title:    a.webTitle,
      summary:  stripHtml(a.fields?.trailText || ""),
      body:     a.fields?.bodyText || a.fields?.trailText || "",
      source:   "The Guardian",
      url:      a.webUrl,
      time:     timeAgo(a.webPublicationDate),
      readTime: estimateReadTime(a.fields?.wordcount),
      loves: 0, radius: 0,
      moodTags: deriveMoodTags(a.webTitle, stripHtml(a.fields?.trailText || "")),
    };
  });
}

async function fetchNewsAPI(category, key) {
  const cfg = CATEGORIES[category]?.newsapi;
  if (!cfg) return [];
  let url;
  if (cfg.category) {
    url = `https://newsapi.org/v2/top-headlines?category=${cfg.category}&language=en&pageSize=20&apiKey=${key}`;
  } else {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(cfg.q)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${key}`;
  }
  const data = await fetch(url).then(r => r.json());
  if (data.status !== "ok") return [];
  return (data.articles || [])
    .filter(a => a.title && a.title !== "[Removed]" && a.description)
    .map(a => ({
      id:       `newsapi:${a.url}`,
      category,
      tag:      deriveTag(category, a.title),
      title:    a.title,
      summary:  stripHtml(a.description || ""),
      body:     stripHtml(a.content || a.description || ""),
      source:   a.source?.name || "NewsAPI",
      url:      a.url,
      time:     timeAgo(a.publishedAt),
      readTime: "3 min read",
      loves: 0, radius: 0,
      moodTags: deriveMoodTags(a.title, a.description || ""),
    }));
}

async function fetchNYT(category, key) {
  const cfg = CATEGORIES[category]?.nyt;
  if (!cfg) return [];
  const fq = cfg.section ? `section_name:("${cfg.section}")` : "";
  const url =
    `https://api.nytimes.com/svc/search/v2/articlesearch.json` +
    `?q=${encodeURIComponent(cfg.q)}` +
    (fq ? `&fq=${encodeURIComponent(fq)}` : "") +
    `&sort=newest&api-key=${key}`;
  const data = await fetch(url).then(r => r.json());
  return (data.response?.docs || [])
    .filter(a => a.abstract && a.headline?.main)
    .map(a => ({
      id:       `nyt:${a._id}`,
      category,
      tag:      deriveTag(category, a.headline.main),
      title:    a.headline.main,
      summary:  stripHtml(a.abstract || a.snippet || ""),
      body:     stripHtml(a.lead_paragraph || a.abstract || ""),
      source:   "The New York Times",
      url:      a.web_url,
      time:     timeAgo(a.pub_date),
      readTime: "4 min read",
      loves: 0, radius: 0,
      moodTags: deriveMoodTags(a.headline.main, a.abstract || ""),
    }));
}

async function fetchHackerNews(category) {
  if (!CATEGORIES[category]?.hn) return [];
  const ids = await fetch("https://hacker-news.firebaseio.com/v0/beststories.json?limitToFirst=20&orderBy=%22$key%22")
    .then(r => r.json());
  const items = await Promise.all(
    ids.slice(0, 20).map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()).catch(() => null)
    )
  );
  return items
    .filter(a => a && a.url && a.title && a.score > 100)
    .map(a => ({
      id:       `hn:${a.id}`,
      category,
      tag:      deriveTag(category, a.title),
      title:    a.title,
      summary:  `${a.score} points · ${a.descendants || 0} comments on Hacker News`,
      body:     `${a.score} points · ${a.descendants || 0} comments on Hacker News`,
      source:   "Hacker News",
      url:      a.url,
      time:     timeAgo(new Date(a.time * 1000).toISOString()),
      readTime: "5 min read",
      loves: 0, radius: 0,
      moodTags: deriveMoodTags(a.title, ""),
    }));
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const { category = "all", page = 1, lat, lng } = req.query;
  const guardianKey = process.env.GUARDIAN_API_KEY;
  const newsApiKey  = process.env.NEWSAPI_KEY;
  const nytKey      = process.env.NYT_API_KEY;

  if (!guardianKey) {
    res.status(500).json({ error: "GUARDIAN_API_KEY not configured" });
    return;
  }

  const [guardianRes, newsApiRes, nytRes, hnRes] = await Promise.allSettled([
    fetchGuardian(category, page, lat, lng, guardianKey),
    newsApiKey ? fetchNewsAPI(category, newsApiKey) : Promise.resolve([]),
    nytKey     ? fetchNYT(category, nytKey)         : Promise.resolve([]),
    fetchHackerNews(category),
  ]);

  const all = [
    ...(guardianRes.status === "fulfilled" ? guardianRes.value : []),
    ...(newsApiRes.status  === "fulfilled" ? newsApiRes.value  : []),
    ...(nytRes.status      === "fulfilled" ? nytRes.value      : []),
    ...(hnRes.status       === "fulfilled" ? hnRes.value       : []),
  ];

  // Filter, deduplicate, sort by recency
  const seenTitles = [];
  const stories = all
    .filter(s => positiveFilter(s))
    .filter(s => {
      if (isDuplicate(s.title, seenTitles)) return false;
      seenTitles.push(s.title);
      return true;
    })
    .sort((a, b) => {
      // Guardian and NYT first, then others
      const srcScore = (s) => s.source === "The Guardian" || s.source === "The New York Times" ? 1 : 0;
      return srcScore(b) - srcScore(a);
    });

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
  res.json({ stories, total: stories.length });
}
