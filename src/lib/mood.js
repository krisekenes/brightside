// ─── MOOD CONFIG ───────────────────────────────────────────────────────────────
export const MOOD_CONFIG = {
  Inspired:    {description:"Breakthroughs, achievements & people doing remarkable things", categoryBoost:{discover:2.0,community:1.8,ideas:1.6,politics:1.2}, storyTags:["achievement","breakthrough","innovation","hero"]},
  Hopeful:     {description:"Progress, recovery & signs that things are getting better",    categoryBoost:{world:2.0,politics:1.8,nature:1.6,wellness:1.4},     storyTags:["recovery","progress","milestone","future"]},
  Wholesome:   {description:"Kindness, connection & the best of human nature",              categoryBoost:{community:2.0,local:1.8,ideas:1.4,wellness:1.2},      storyTags:["kindness","community","connection","family"]},
  Peaceful:    {description:"Nature, stillness & stories that slow the world down",         categoryBoost:{nature:2.2,wellness:2.0,world:1.2,local:1.3},          storyTags:["nature","calm","wildlife","environment"]},
  Celebrating: {description:"Records broken, milestones hit & victories worth cheering",   categoryBoost:{community:2.0,discover:1.8,nature:1.6,politics:1.5},   storyTags:["milestone","record","victory","first"]},
};
export const moodScore = (story,mood) => {
  if (!mood) return 1;
  const cfg = MOOD_CONFIG[mood]; if (!cfg) return 1;
  return (cfg.categoryBoost[story.category]||1.0)*(story.moodTags?.some(t=>cfg.storyTags.includes(t))?1.4:1.0);
};
