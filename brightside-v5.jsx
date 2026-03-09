import { useState, useEffect, useCallback, useMemo } from "react";

// ─── THEME TOKENS ──────────────────────────────────────────────────────────────
const LIGHT = {
  amber:"#E8651A", amberLight:"#F5A05A", amberPale:"#FEF0E6", amberMid:"#F7C89B", amberGlow:"rgba(232,101,26,0.12)",
  ink:"#1C1917", inkMid:"#57534E", inkLight:"#A8A29E", inkFaint:"#D6CFC7",
  bg:"#FDFAF6", surface:"#FFFFFF", surfaceAlt:"#F7F3ED", border:"#EFE9DF", borderLight:"#F5F0E8",
  overlay:"rgba(28,25,23,0.65)", shadow:"rgba(28,25,23,0.10)", shadowMd:"rgba(28,25,23,0.18)",
};
const DARK = {
  amber:"#F5813A", amberLight:"#FAA96A", amberPale:"#2C1A0E", amberMid:"#7A3A10", amberGlow:"rgba(245,129,58,0.18)",
  ink:"#F5F0E8", inkMid:"#C4BAB0", inkLight:"#7A7068", inkFaint:"#3A3330",
  bg:"#171412", surface:"#211D1A", surfaceAlt:"#2A2420", border:"#352F2B", borderLight:"#2C2724",
  overlay:"rgba(10,8,7,0.80)", shadow:"rgba(0,0,0,0.30)", shadowMd:"rgba(0,0,0,0.50)",
};
const CAT_ACCENTS = {
  nature:    {light:"#3D9970",dark:"#4DB882",bg_l:"#EEF7F1",bg_d:"#0D1F16"},
  discover:  {light:"#7C52C8",dark:"#9B75E0",bg_l:"#F5F0FB",bg_d:"#1A1228"},
  community: {light:"#C4991A",dark:"#E0B830",bg_l:"#FEF9E6",bg_d:"#221C05"},
  wellness:  {light:"#38A169",dark:"#52C285",bg_l:"#F0FAF4",bg_d:"#0C1F14"},
  world:     {light:"#3B72C4",dark:"#6293E0",bg_l:"#EDF3FB",bg_d:"#0E1828"},
  politics:  {light:"#4472B8",dark:"#6A96D8",bg_l:"#F0F4FB",bg_d:"#0F1624"},
  local:     {light:"#E8651A",dark:"#F5813A",bg_l:"#FEF0E6",bg_d:"#200E04"},
  ideas:     {light:"#B85490",dark:"#D878B0",bg_l:"#FBF0F5",bg_d:"#1F0D18"},
};
const cAcc = (cat,dark) => dark?(CAT_ACCENTS[cat]?.dark||"#F5813A"):(CAT_ACCENTS[cat]?.light||"#E8651A");
const cBg  = (cat,dark) => dark?(CAT_ACCENTS[cat]?.bg_d||"#1A1412"):(CAT_ACCENTS[cat]?.bg_l||"#FEF0E6");

// ─── MOOD CONFIG ───────────────────────────────────────────────────────────────
const MOOD_CONFIG = {
  Inspired:    {description:"Breakthroughs, achievements & people doing remarkable things", categoryBoost:{discover:2.0,community:1.8,ideas:1.6,politics:1.2}, storyTags:["achievement","breakthrough","innovation","hero"]},
  Hopeful:     {description:"Progress, recovery & signs that things are getting better",    categoryBoost:{world:2.0,politics:1.8,nature:1.6,wellness:1.4},     storyTags:["recovery","progress","milestone","future"]},
  Wholesome:   {description:"Kindness, connection & the best of human nature",              categoryBoost:{community:2.0,local:1.8,ideas:1.4,wellness:1.2},      storyTags:["kindness","community","connection","family"]},
  Peaceful:    {description:"Nature, stillness & stories that slow the world down",         categoryBoost:{nature:2.2,wellness:2.0,world:1.2,local:1.3},          storyTags:["nature","calm","wildlife","environment"]},
  Celebrating: {description:"Records broken, milestones hit & victories worth cheering",   categoryBoost:{community:2.0,discover:1.8,nature:1.6,politics:1.5},   storyTags:["milestone","record","victory","first"]},
};
const moodScore = (story,mood) => {
  if (!mood) return 1;
  const cfg = MOOD_CONFIG[mood]; if (!cfg) return 1;
  return (cfg.categoryBoost[story.category]||1.0)*(story.moodTags?.some(t=>cfg.storyTags.includes(t))?1.4:1.0);
};

// ─── CATEGORIES ────────────────────────────────────────────────────────────────
const CATS = [
  {id:"local",    label:"Local",     desc:"Stories from your community"},
  {id:"world",    label:"World",     desc:"Global progress & good news"},
  {id:"discover", label:"Discover",  desc:"Science, tech & exploration"},
  {id:"wellness", label:"Wellness",  desc:"Health breakthroughs & wellbeing"},
  {id:"nature",   label:"Nature",    desc:"Wildlife, conservation & the planet"},
  {id:"community",label:"Community", desc:"People helping people"},
  {id:"ideas",    label:"Ideas",     desc:"Creativity, arts & innovation"},
  {id:"politics", label:"Politics",  desc:"Bipartisan wins & civic progress"},
];

// ─── STORIES ───────────────────────────────────────────────────────────────────
const STORIES = [
  {id:1,  category:"nature",    tag:"Nature",    title:"Snow Leopard Cubs Spotted Thriving in Himalayan Reserve",          summary:"A decade of conservation work is paying off. Wildlife trackers documented a mother and three healthy cubs — the largest litter on record in the region.",              body:"Conservation teams working across the Himalayan corridor have confirmed the sighting of a snow leopard mother and three cubs in a protected reserve, marking the largest recorded litter in the region's history. The finding follows a ten-year breeding protection initiative that limited human encroachment on key habitat corridors.",           source:"Wildlife Conservation Society",   time:"2h ago",  readTime:"3 min", loves:2847, radius:0,  moodTags:["wildlife","recovery","milestone","nature"]},
  {id:2,  category:"discover",  tag:"Discover",  title:"New Battery Technology Could Make EVs Charge in Under Five Minutes",summary:"MIT researchers have developed a solid-state battery that charges ten times faster than current technology while lasting significantly longer.",                    body:"A team at MIT has published results showing a solid-state battery architecture capable of reaching 80% charge in under five minutes while retaining 90% capacity after 1,000 cycles. The breakthrough addresses the two biggest barriers to EV adoption — charge time and longevity — simultaneously.",                                              source:"MIT News",                         time:"4h ago",  readTime:"4 min", loves:1923, radius:0,  moodTags:["breakthrough","innovation","future"]},
  {id:3,  category:"community", tag:"Community", title:"The Teenager Who Built a Tutoring Platform for 50,000 Students",   summary:"What started as a homework help Discord server has grown into a nonprofit serving students across 40 countries, founded by 17-year-old Maya Chen.",             body:"When Maya Chen posted a homework help channel to Discord two years ago, she expected a few classmates. Today, the platform she built — entirely self-taught — serves 50,000 students across 40 countries.",                                                                                                                                       source:"Good Morning America",             time:"5h ago",  readTime:"5 min", loves:4102, radius:25, moodTags:["hero","achievement","kindness","community"]},
  {id:4,  category:"wellness",  tag:"Wellness",  title:"Breakthrough Depression Treatment Shows 80% Remission in Trials",  summary:"A targeted magnetic therapy has cleared Phase 3 trials with remarkable results, offering real hope for millions who haven't responded to traditional treatments.", body:"The therapy, known as deep TMS, achieved an 80% remission rate in a 600-person Phase 3 trial — a number that far exceeds the 40-60% range typical of current first-line treatments.",                                                                                                                                                                source:"New England Journal of Medicine",  time:"6h ago",  readTime:"6 min", loves:5611, radius:0,  moodTags:["breakthrough","progress","future"]},
  {id:5,  category:"world",     tag:"World",     title:"Atlantic Coral Reefs Show First Signs of Recovery in Thirty Years", summary:"Marine biologists are cautiously optimistic after new surveys found juvenile coral colonies in areas that were bleached just eight years ago.",               body:"A comprehensive NOAA survey of the Florida Reef Tract has identified juvenile coral colonies establishing themselves in sections previously declared ecologically dead following the 2016 mass bleaching event.",                                                                                                                                      source:"NOAA",                             time:"7h ago",  readTime:"4 min", loves:3388, radius:0,  moodTags:["recovery","nature","environment","progress"]},
  {id:6,  category:"politics",  tag:"Politics",  title:"Senate Passes Sweeping Veterans Mental Health Expansion, 94 to 4", summary:"In a rare show of bipartisan unity, the bill expands VA mental health services more broadly than any legislation in two decades.",                            body:"The Veterans Mental Health Modernization Act passed the Senate 94-4 following months of quiet, cross-party negotiations. The bill expands telehealth access, adds 3,000 new VA counselor positions.",                                                                                                                                                 source:"Associated Press",                 time:"9h ago",  readTime:"3 min", loves:7240, radius:0,  moodTags:["progress","milestone","victory","kindness"]},
  {id:7,  category:"local",     tag:"Local",     title:"A Shuttered Mall Becomes the Town's Beating Heart",                summary:"Three years after closing, a former shopping center reopens as a community farm, co-working hub, and arts space — funded entirely by local crowdfunding.",    body:"The Millbrook Commons mall, vacant since 2021, has been transformed by a coalition of local residents into a mixed-use community space including an urban farm, a 60-desk co-working space, and a community kitchen.",                                                                                                                                source:"Regional News Network",            time:"11h ago", readTime:"4 min", loves:1654, radius:15, moodTags:["community","kindness","connection"]},
  {id:8,  category:"nature",    tag:"Nature",    title:"California Condor Population Reaches 500 for the First Time",      summary:"Once down to just 27 individuals, the condor has hit a historic milestone after 40 years of dedicated recovery programs.",                                    body:"The California condor has now crossed the 500 individual milestone. Wildlife biologists confirmed the population count this week, calling it one of the most successful recovery programs in conservation history.",                                                                                                                                   source:"US Fish & Wildlife Service",       time:"12h ago", readTime:"5 min", loves:2991, radius:50, moodTags:["milestone","record","wildlife","victory","nature"]},
  {id:9,  category:"discover",  tag:"Discover",  title:"Webb Telescope Detects Life Chemistry Signatures on Distant Exoplanet",summary:"Astronomers have found dimethyl sulfide in the atmosphere of K2-18b — a molecule produced on Earth almost exclusively by living organisms.",           body:"The James Webb Space Telescope has detected what appears to be dimethyl sulfide in the atmosphere of K2-18b, a super-Earth in the habitable zone of its host star. Researchers describe it as the most compelling biosignature ever observed beyond our solar system.",                                                                               source:"NASA / ESA",                       time:"1d ago",  readTime:"7 min", loves:9812, radius:0,  moodTags:["breakthrough","innovation","future","achievement"]},
  {id:10, category:"community", tag:"Community", title:"A Viral Campaign Just Added 2.3 Million Organ Donors to the Registry",summary:"A 12-year-old's tribute video to her donor sparked a social media movement that produced one of the largest single sign-up surges on record.",         body:"After Priya Nair posted a video tribute to the donor who saved her life, the clip reached 40 million views in four days. UNOS reported a 600% spike in registry sign-ups with 2.3 million new donors added across the United States.",                                                                                                               source:"UNOS",                             time:"1d ago",  readTime:"4 min", loves:6730, radius:30, moodTags:["kindness","community","milestone","connection","record"]},
  {id:11, category:"local",     tag:"Local",     title:"Free Bus Pilot Cuts Downtown Car Traffic by 34 Percent",            summary:"Six months after making all buses free, the city reports dramatic air quality improvements and record ridership.",                                            body:"A six-month review found a 34% reduction in downtown vehicle traffic, a 22% improvement in air quality index scores, and record daily ridership exceeding pre-pandemic highs by 40%.",                                                                                                                                                                source:"City Transit Authority",           time:"1d ago",  readTime:"3 min", loves:2100, radius:10, moodTags:["progress","community","environment","future"]},
  {id:12, category:"wellness",  tag:"Wellness",  title:"Twenty-Minute Daily Walks Reduce Dementia Risk by Forty Percent",  summary:"One of the largest longitudinal studies of its kind found that consistent moderate walking dramatically outperforms medication for dementia prevention.",  body:"A 15-year follow-up study tracking 48,000 adults aged 60+ found that those who walked at a moderate pace for 20 minutes daily showed a 40% lower incidence of dementia onset compared to sedentary controls.",                                                                                                                                          source:"The Lancet",                       time:"2d ago",  readTime:"5 min", loves:8842, radius:0,  moodTags:["progress","calm","future","milestone"]},
];

// ─── SVG ICONS ─────────────────────────────────────────────────────────────────
const Ic = {
  Sun:      ({c,s=18})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="3.5"/><line x1="9" y1="1" x2="9" y2="3"/><line x1="9" y1="15" x2="9" y2="17"/><line x1="1" y1="9" x2="3" y2="9"/><line x1="15" y1="9" x2="17" y2="9"/><line x1="3.2" y1="3.2" x2="4.6" y2="4.6"/><line x1="13.4" y1="13.4" x2="14.8" y2="14.8"/><line x1="3.2" y1="14.8" x2="4.6" y2="13.4"/><line x1="13.4" y1="4.6" x2="14.8" y2="3.2"/></svg>,
  Moon:     ({c,s=18})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M15 10.5A7 7 0 0 1 7.5 3a7 7 0 1 0 7.5 7.5z"/></svg>,
  Search:   ({c,s=16})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="15" y2="15"/></svg>,
  Heart:    ({c,s=14,f=false})=><svg width={s} height={s} viewBox="0 0 14 13" fill={f?c:"none"} stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M7 12s-5.5-3.8-5.5-7.5A3.5 3.5 0 0 1 7 2.1 3.5 3.5 0 0 1 12.5 4.5C12.5 8.2 7 12 7 12z"/></svg>,
  Bookmark: ({c,s=14,f=false})=><svg width={s} height={s} viewBox="0 0 12 15" fill={f?c:"none"} stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M2 1h8a1 1 0 0 1 1 1v12l-5-3.2L1 14V2a1 1 0 0 1 1-1z"/></svg>,
  Share:    ({c,s=14})=><svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M9 1.5l4 4-4 4M13 5.5H5.5A4 4 0 0 0 1.5 9.5V13"/></svg>,
  Eye:      ({c,s=14})=><svg width={s} height={s} viewBox="0 0 14 11" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M1 5.5S3.5 1 7 1s6 4.5 6 4.5-2.5 4.5-6 4.5S1 5.5 1 5.5z"/><circle cx="7" cy="5.5" r="1.8"/><line x1="2.5" y1="1.5" x2="11.5" y2="9.5"/></svg>,
  Settings: ({c,s=18})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="2.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4"/></svg>,
  Check:    ({c,s=11})=><svg width={s} height={s} viewBox="0 0 11 9" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M1 4.5l3.5 3.5 5.5-7"/></svg>,
  Home:     ({c,s=22})=><svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M3 10.5L11 3l8 7.5"/><path d="M6 9v10h3.5v-5h3v5H16V9"/></svg>,
  Compass:  ({c,s=22})=><svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="9"/><path d="M14.5 7.5l-2.5 5.5-2.5-2.5-5.5 2.5 2.5-5.5 2.5 2.5 5.5-2.5z"/></svg>,
  Saved:    ({c,s=22})=><svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M5 2h12a1 1 0 0 1 1 1v16l-7-4.5L4 19V3a1 1 0 0 1 1-1z"/></svg>,
  Menu:     ({c,s=22})=><svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="7" x2="19" y2="7"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="15" x2="19" y2="15"/></svg>,
  Sparkle:  ({c,s=22})=><svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l2 7h7l-5.5 4 2 7L11 16l-5.5 4 2-7L2 9h7z"/></svg>,
  Person:   ({c,s=18})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="6" r="3.5"/><path d="M1.5 17c0-4 3.4-7 7.5-7s7.5 3 7.5 7"/></svg>,
  Info:     ({c,s=18})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="7.5"/><line x1="9" y1="8.5" x2="9" y2="13"/><circle cx="9" cy="5.5" r="0.75" fill={c} stroke="none"/></svg>,
};

// ─── PERSIST HELPERS ───────────────────────────────────────────────────────────
const LS = {
  get: (k, fallback=null) => { try { const v=localStorage.getItem(k); return v!=null?JSON.parse(v):fallback; } catch { return fallback; } },
  set: (k, v)             => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({ C, dark, onComplete }) {
  const [step, setStep]         = useState(1); // 1=categories, 2=mood, 3=ready
  const [picks, setPicks]       = useState(new Set());
  const [mood, setMood]         = useState(null);
  const [exiting, setExiting]   = useState(false);

  const toggleCat = (id) => setPicks(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });

  const goStep2 = () => { setExiting(true); setTimeout(()=>{ setStep(2); setExiting(false); },300); };
  const goStep3 = () => { setExiting(true); setTimeout(()=>{ setStep(3); setExiting(false); },300); };
  const finish  = () => {
    setExiting(true);
    setTimeout(() => {
      onComplete({ categories: picks.size>0?[...picks]:CATS.map(c=>c.id), mood });
    }, 400);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:C.bg,zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",overflow:"hidden" }}>

      {/* Wordmark */}
      <div style={{ position:"absolute",top:24,left:0,right:0,textAlign:"center" }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:C.ink }}>
          Bright<span style={{color:C.amber}}>Side</span>
        </div>
        <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:C.inkLight,marginTop:2 }}>Today's Good News</div>
      </div>

      {/* Progress dots */}
      <div style={{ position:"absolute",top:72,left:0,right:0,display:"flex",justifyContent:"center",gap:8 }}>
        {[1,2].map(n=>(
          <div key={n} style={{ width: step>n||step===n?24:8, height:8, borderRadius:4, background:step>=n?C.amber:C.border, transition:"all 0.3s ease" }}/>
        ))}
      </div>

      {/* Step content */}
      <div style={{ width:"100%", maxWidth:520, opacity:exiting?0:1, transform:exiting?"translateY(12px)":"translateY(0)", transition:"all 0.3s ease" }}>

        {/* ── STEP 1: Categories ── */}
        {step === 1 && (
          <>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,fontWeight:400,color:C.ink,lineHeight:1.2,marginBottom:10 }}>
                What do you want<br/>more of?
              </div>
              <div style={{ fontSize:14,color:C.inkMid,lineHeight:1.6 }}>
                Pick the sections you care about.<br/>Your feed will be built around them.
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
              {CATS.map(cat => {
                const selected = picks.has(cat.id);
                const acc = cAcc(cat.id, dark);
                const bg  = cBg(cat.id, dark);
                return (
                  <button key={cat.id} onClick={()=>toggleCat(cat.id)}
                    style={{ background:selected?bg:C.surface, border:`1.5px solid ${selected?acc:C.border}`, borderRadius:12, padding:"16px 16px", cursor:"pointer", textAlign:"left", transition:"all 0.18s", position:"relative", overflow:"hidden" }}>
                    {/* Selected check */}
                    {selected && (
                      <div style={{ position:"absolute",top:10,right:10,width:22,height:22,borderRadius:"50%",background:acc,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Ic.Check c="#fff" s={10}/>
                      </div>
                    )}
                    <div style={{ width:28,height:28,borderRadius:8,background:selected?`${acc}22`:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,transition:"all 0.18s" }}>
                      <div style={{ width:10,height:10,borderRadius:"50%",background:selected?acc:C.inkLight,transition:"all 0.18s" }}/>
                    </div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:selected?C.ink:C.inkMid,marginBottom:3,transition:"color 0.18s" }}>{cat.label}</div>
                    <div style={{ fontSize:11,color:selected?C.inkMid:C.inkLight,lineHeight:1.4,transition:"color 0.18s" }}>{cat.desc}</div>
                  </button>
                );
              })}
            </div>

            <button onClick={goStep2} style={{ width:"100%",background:C.amber,color:"#fff",border:"none",borderRadius:10,padding:"15px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em",transition:"all 0.15s",opacity:picks.size===0?0.5:1 }}>
              {picks.size===0 ? "Select at least one section" : `Continue with ${picks.size} section${picks.size>1?"s":""}`}
            </button>
            {picks.size===0 && (
              <button onClick={()=>{setPicks(new Set(CATS.map(c=>c.id)));goStep2();}} style={{ width:"100%",background:"none",border:"none",cursor:"pointer",marginTop:10,fontSize:13,color:C.inkLight,fontFamily:"'DM Sans',sans-serif",padding:"8px" }}>
                Show me everything →
              </button>
            )}
          </>
        )}

        {/* ── STEP 2: Mood ── */}
        {step === 2 && (
          <>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,fontWeight:400,color:C.ink,lineHeight:1.2,marginBottom:10 }}>
                How do you want<br/>to feel reading this?
              </div>
              <div style={{ fontSize:14,color:C.inkMid,lineHeight:1.6 }}>
                Your default mood shapes how stories are ranked.<br/>You can change it anytime.
              </div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:28 }}>
              {Object.entries(MOOD_CONFIG).map(([name, cfg]) => {
                const selected = mood === name;
                return (
                  <button key={name} onClick={()=>setMood(selected?null:name)}
                    style={{ background:selected?C.amberPale:C.surface, border:`1.5px solid ${selected?C.amber:C.border}`, borderRadius:12, padding:"16px 18px", cursor:"pointer", textAlign:"left", display:"flex",alignItems:"center",gap:14, transition:"all 0.18s" }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:selected?C.amber:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s" }}>
                      {selected ? <Ic.Check c="#fff" s={13}/> : <div style={{ width:10,height:10,borderRadius:"50%",background:C.inkLight }}/>}
                    </div>
                    <div>
                      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:selected?C.amber:C.ink,marginBottom:3,transition:"color 0.18s" }}>{name}</div>
                      <div style={{ fontSize:12,color:C.inkMid,lineHeight:1.4 }}>{cfg.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={goStep3} style={{ width:"100%",background:C.amber,color:"#fff",border:"none",borderRadius:10,padding:"15px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>
              {mood ? `Start with ${mood} mood` : "Continue without a default mood"}
            </button>
            <button onClick={()=>{setStep(1);setExiting(false);}} style={{ width:"100%",background:"none",border:"none",cursor:"pointer",marginTop:10,fontSize:13,color:C.inkLight,fontFamily:"'DM Sans',sans-serif",padding:"8px" }}>
              ← Back
            </button>
          </>
        )}

        {/* ── STEP 3: Ready ── */}
        {step === 3 && (
          <div style={{ textAlign:"center" }}>
            {/* Animated sunburst */}
            <div style={{ width:88,height:88,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.amberLight})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",boxShadow:`0 0 0 16px ${C.amberPale}, 0 0 0 32px ${C.amberGlow}`,animation:"bsReadyPop 0.5s ease" }}>
              <Ic.Sparkle c="#fff" s={36}/>
            </div>

            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:30,fontWeight:400,color:C.ink,lineHeight:1.2,marginBottom:12 }}>
              Your BrightSide<br/>is ready
            </div>
            <div style={{ fontSize:14,color:C.inkMid,lineHeight:1.7,marginBottom:28 }}>
              Your feed is built around {picks.size>0?`${picks.size} section${picks.size>1?"s":""}`:"all sections"}
              {mood ? ` and sorted for a ${mood} mindset` : ""}.
            </div>

            {/* Picks summary */}
            <div style={{ display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:32 }}>
              {(picks.size>0?[...picks]:CATS.map(c=>c.id)).map(id => {
                const cat = CATS.find(c=>c.id===id);
                const acc = cAcc(id,dark);
                const bg  = cBg(id,dark);
                return (
                  <span key={id} style={{ background:bg,border:`1px solid ${acc}44`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,color:acc }}>
                    {cat?.label}
                  </span>
                );
              })}
              {mood && (
                <span style={{ background:C.amberPale,border:`1px solid ${C.amberMid}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,color:C.amber }}>
                  {mood}
                </span>
              )}
            </div>

            <button onClick={finish} style={{ width:"100%",maxWidth:320,background:C.ink,color:dark?C.bg:"#fff",border:"none",borderRadius:10,padding:"15px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em",transition:"all 0.2s",margin:"0 auto",display:"block" }}>
              Take me to my feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
function SettingsPanel({ C, dark, prefs, onUpdate, onClose, onResetOnboarding, onHowWeFilter }) {
  const [localCats, setLocalCats] = useState(new Set(prefs.categories));
  const [localMood, setLocalMood] = useState(prefs.mood);

  const toggleCat = (id) => setLocalCats(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});

  const save = () => {
    onUpdate({ categories: localCats.size>0?[...localCats]:CATS.map(c=>c.id), mood: localMood });
    onClose();
  };

  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:C.overlay,zIndex:400,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,width:"min(400px,100%)",height:"100%",overflowY:"auto",boxShadow:`-8px 0 48px ${C.shadowMd}`,display:"flex",flexDirection:"column",borderLeft:`1px solid ${C.border}` }}>

        {/* Header */}
        <div style={{ padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:C.surface,zIndex:1 }}>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:C.ink }}>Your preferences</div>
            <div style={{ fontSize:12,color:C.inkLight,marginTop:2 }}>Personalise your BrightSide feed</div>
          </div>
          <button onClick={onClose} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.inkMid }}>×</button>
        </div>

        <div style={{ padding:"20px 24px",flex:1 }}>
          {/* Sections */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:14 }}>Sections</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {CATS.map(cat=>{
                const on  = localCats.has(cat.id);
                const acc = cAcc(cat.id,dark);
                const bg  = cBg(cat.id,dark);
                return (
                  <button key={cat.id} onClick={()=>toggleCat(cat.id)}
                    style={{ background:on?bg:C.surfaceAlt,border:`1.5px solid ${on?acc:C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.15s" }}>
                    <div style={{ width:28,height:28,borderRadius:6,background:on?`${acc}22`:C.surface,border:`1px solid ${on?acc:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s" }}>
                      {on?<Ic.Check c={acc} s={11}/>:<div style={{width:8,height:8,borderRadius:"50%",background:C.inkLight}}/>}
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:14,fontWeight:600,color:on?C.ink:C.inkMid,fontFamily:"'DM Sans',sans-serif",transition:"color 0.15s" }}>{cat.label}</div>
                      <div style={{ fontSize:11,color:C.inkLight }}>{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default mood */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:14 }}>Default mood</div>
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {[null, ...Object.keys(MOOD_CONFIG)].map(m=>{
                const on = localMood===m;
                return (
                  <button key={m||"none"} onClick={()=>setLocalMood(on&&m?null:m)}
                    style={{ background:on?(m?C.amberPale:C.surfaceAlt):C.surfaceAlt,border:`1.5px solid ${on?(m?C.amber:C.inkLight):C.border}`,borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,transition:"all 0.15s" }}>
                    <div style={{ width:22,height:22,borderRadius:"50%",background:on?(m?C.amber:C.inkLight):C.surface,border:`1px solid ${on?(m?C.amber:C.inkFaint):C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s" }}>
                      {on&&<Ic.Check c="#fff" s={9}/>}
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:13,fontWeight:600,color:on?C.ink:C.inkMid,fontFamily:"'DM Sans',sans-serif" }}>{m||"No default — choose each visit"}</div>
                      {m&&<div style={{ fontSize:11,color:C.inkLight }}>{MOOD_CONFIG[m].description}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ padding:"16px 24px 24px",borderTop:`1px solid ${C.border}`,background:C.surface }}>
          <button onClick={save} style={{ width:"100%",background:C.amber,color:"#fff",border:"none",borderRadius:10,padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em" }}>
            Save preferences
          </button>
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:12 }}>
            <button onClick={onHowWeFilter} style={{ background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.inkLight,fontFamily:"'DM Sans',sans-serif",padding:"4px 0",display:"flex",alignItems:"center",gap:5 }}>
              <Ic.Info c={C.inkLight} s={13}/>
              How we filter
            </button>
            <button onClick={onResetOnboarding} style={{ background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.inkLight,fontFamily:"'DM Sans',sans-serif",padding:"4px 0" }}>
              Reset preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function Modal({ onClose, children, C, maxWidth=440 }) {
  useEffect(()=>{ const h=e=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[onClose]);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:C.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20,backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:16,overflow:"hidden",maxWidth,width:"100%",boxShadow:`0 24px 64px ${C.shadowMd}`,border:`1px solid ${C.border}` }}>{children}</div>
    </div>
  );
}

function ShareModal({ story, onClose, C, dark }) {
  const [copied,setCopied]=useState(false);
  const acc=cAcc(story.category,dark), bg=cBg(story.category,dark);
  return (
    <Modal onClose={onClose} C={C}>
      <div style={{ background:bg,padding:"28px 26px 22px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:8 }}>{story.tag}</div>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,lineHeight:1.35,color:C.ink,marginBottom:12 }}>{story.title}</div>
        <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.05em",color:C.inkLight }}>via BrightSide · Today's Good News</div>
      </div>
      <div style={{ padding:"18px 22px 22px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12 }}>
          {[["Copy Link","copy"],["Twitter / X","tw"],["Messages","msg"]].map(([l,t])=>(
            <button key={t} onClick={t==="copy"?()=>{navigator.clipboard?.writeText(`${story.title} — via BrightSide`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}:undefined}
              style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 4px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:copied&&t==="copy"?C.amber:C.inkMid,transition:"all 0.15s" }}>
              {copied&&t==="copy"?"Copied":l}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ width:"100%",background:C.ink,color:dark?C.bg:"#fff",border:"none",borderRadius:8,padding:"13px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Done</button>
      </div>
    </Modal>
  );
}

function DigestModal({ onClose, C, dark }) {
  const [email,setEmail]=useState(""), [freq,setFreq]=useState("morning"), [done,setDone]=useState(false);
  const [preview,setPreview]=useState(false);

  const previewStories = [...STORIES].sort((a,b)=>b.loves-a.loves).slice(0,3);
  const previewDate = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return (
    <Modal onClose={onClose} C={C} maxWidth={preview?520:440}>
      <div style={{ background:C.amberPale,padding:"26px 26px 20px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.amber }}>Daily Digest</div>
          {!done&&<button onClick={()=>setPreview(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.amber,fontFamily:"'DM Sans',sans-serif",fontWeight:600,padding:0 }}>{preview?"← Back":"Preview email"}</button>}
        </div>
        {!preview&&<>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:21,color:C.ink,lineHeight:1.3,marginBottom:6 }}>Start every morning with good news</div>
          <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6 }}>A curated briefing delivered at the time that suits you.</div>
        </>}
        {preview&&<div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:C.ink }}>Here's what your digest looks like</div>}
      </div>

      {!preview&&<div style={{ padding:22 }}>
        {!done?<>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{ width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"11px 13px",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:13,color:C.ink,background:C.surfaceAlt }}/>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.inkLight,marginBottom:8 }}>Delivery time</div>
            <div style={{ display:"flex",gap:8 }}>
              {[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFreq(v)} style={{ flex:1,background:freq===v?C.amber:C.surfaceAlt,color:freq===v?"#fff":C.inkMid,border:`1px solid ${freq===v?C.amber:C.border}`,borderRadius:7,padding:"9px 4px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>{l}</button>
              ))}
            </div>
          </div>
          <button onClick={()=>setDone(true)} style={{ width:"100%",background:C.amber,color:"#fff",border:"none",borderRadius:8,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Subscribe — Free</button>
        </>:<div style={{ textAlign:"center",padding:"12px 0 4px" }}>
          <div style={{ width:48,height:48,borderRadius:"50%",background:C.amberPale,border:`2px solid ${C.amberMid}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}><Ic.Check c={C.amber} s={16}/></div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:C.ink,marginBottom:6 }}>You're subscribed</div>
          <div style={{ fontSize:13,color:C.inkMid,marginBottom:16,lineHeight:1.6 }}>First digest arrives tomorrow {freq==="morning"?"at 7am":freq==="afternoon"?"at noon":"at 8pm"}.</div>
          <button onClick={onClose} style={{ background:C.ink,color:dark?C.bg:"#fff",border:"none",borderRadius:8,padding:"10px 26px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Close</button>
        </div>}
      </div>}

      {preview&&(
        <div style={{ maxHeight:"58vh",overflowY:"auto" }}>
          {/* Email preview */}
          <div style={{ background:"#FDFAF6",fontFamily:"'DM Sans',sans-serif" }}>
            <div style={{ background:"#E8651A",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:"#fff" }}>BrightSide</div>
              <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:"rgba(255,255,255,0.75)" }}>TODAY'S GOOD NEWS</div>
            </div>
            <div style={{ padding:"20px 24px 14px",borderBottom:"1px solid #EFE9DF" }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#1C1917",marginBottom:4 }}>Good {freq==="evening"?"evening":freq==="afternoon"?"afternoon":"morning"}.</div>
              <div style={{ fontSize:12,color:"#A8A29E" }}>{previewDate}</div>
            </div>
            <div style={{ padding:"16px 24px" }}>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#A8A29E",marginBottom:12 }}>Today's top stories</div>
              {previewStories.map(s=>{
                const acc=cAcc(s.category,false), bg=cBg(s.category,false);
                return(
                  <div key={s.id} style={{ background:bg,borderRadius:8,padding:"14px 16px",marginBottom:10,border:"1px solid #EFE9DF" }}>
                    <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:5 }}>{s.tag}</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:14,color:"#1C1917",lineHeight:1.35,marginBottom:6 }}>{s.title}</div>
                    <div style={{ fontSize:12,color:"#57534E",lineHeight:1.5 }}>{s.summary.substring(0,90)}…</div>
                    <div style={{ fontSize:11,color:"#A8A29E",marginTop:8 }}>{s.source} · {s.readTime} read</div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding:"14px 24px 20px",borderTop:"1px solid #EFE9DF",textAlign:"center" }}>
              <div style={{ fontSize:11,color:"#A8A29E",lineHeight:1.8 }}>
                You're receiving this because you subscribed to BrightSide Daily Digest.<br/>
                <span style={{ color:"#E8651A" }}>Unsubscribe</span> · <span style={{ color:"#E8651A" }}>Change delivery time</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AccountModal({ onClose, C, dark, prefs, streak, lovedCount, savedCount, onResetOnboarding }) {
  return (
    <Modal onClose={onClose} C={C} maxWidth={400}>
      {/* Header */}
      <div style={{ padding:"28px 26px 20px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
          <div style={{ width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.amberLight})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fff" }}>B</span>
          </div>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:C.ink }}>Your BrightSide</div>
            <div style={{ fontSize:12,color:C.inkLight,marginTop:2 }}>Local reader · {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
          {[{label:"Day streak",value:streak},{label:"Loved",value:lovedCount},{label:"Saved",value:savedCount}].map(({label,value})=>(
            <div key={label} style={{ textAlign:"center",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px" }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:C.amber }}>{value}</div>
              <div style={{ fontSize:10,fontWeight:600,color:C.inkLight,marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences summary */}
      <div style={{ padding:"16px 26px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:10 }}>Your sections</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
          {prefs.categories.map(id=>{
            const cat=CATS.find(c=>c.id===id);
            const acc=cAcc(id,dark), bg=cBg(id,dark);
            return(<span key={id} style={{ background:bg,border:`1px solid ${acc}44`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,color:acc }}>{cat?.label}</span>);
          })}
        </div>
        {prefs.mood&&(
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:6 }}>Default mood</div>
            <span style={{ background:C.amberPale,border:`1px solid ${C.amberMid}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:C.amber }}>{prefs.mood}</span>
          </div>
        )}
      </div>

      {/* BrightSide+ CTA */}
      <div style={{ padding:"16px 26px",borderBottom:`1px solid ${C.border}`,background:C.amberPale }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.ink,marginBottom:3 }}>BrightSide+</div>
            <div style={{ fontSize:12,color:C.inkMid,lineHeight:1.5 }}>Unlimited saves, ad-free, streak freeze</div>
          </div>
          <button style={{ background:C.amber,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}>$4.99 / mo</button>
        </div>
      </div>

      {/* Reset */}
      <div style={{ padding:"16px 26px 22px" }}>
        <button onClick={onResetOnboarding} style={{ background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",fontSize:12,fontWeight:600,color:C.inkLight,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",transition:"all 0.15s" }}>
          Reset my preferences — redo setup
        </button>
      </div>
    </Modal>
  );
}

function HowWeFilterModal({ onClose, C }) {
  return (
    <Modal onClose={onClose} C={C} maxWidth={480}>
      <div style={{ background:C.amberPale,padding:"26px 26px 20px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.amber,marginBottom:7 }}>Transparency</div>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:21,color:C.ink,lineHeight:1.3,marginBottom:6 }}>How we filter the news</div>
        <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6 }}>Every story on BrightSide passes through the same transparent system.</div>
      </div>

      <div style={{ padding:"20px 26px",overflowY:"auto",maxHeight:"58vh" }}>
        {/* Sentiment tiers */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:10 }}>Sentiment scoring</div>
          <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6,marginBottom:14 }}>
            Each story is scored by Google's Natural Language API on a scale from −1 (very negative) to +1 (very positive). Only stories above a baseline threshold are shown.
          </div>
          {[
            {score:"≥ 0.65",label:"Auto-approved",desc:"Goes straight into your feed.",col:"#3D9970",bg:"#EEF7F1"},
            {score:"0.45 – 0.65",label:"Editorial review",desc:"A human reads it before it's published.",col:"#C4991A",bg:"#FEF9E6"},
            {score:"< 0.45",label:"Rejected",desc:"Not shown on BrightSide.",col:"#B85450",bg:"#FBF0F0"},
          ].map(({score,label,desc,col,bg})=>(
            <div key={label} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"12px 14px",background:bg,borderRadius:10,marginBottom:8,border:`1px solid ${col}22` }}>
              <div style={{ background:col,color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1 }}>{score}</div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#1C1917",marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:12,color:"#57534E" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What we never show */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:10 }}>What we never show</div>
          {["Disasters, tragedies, or mass casualty events","Crime, violence, or graphic content","Partisan attack stories or political outrage","Celebrity gossip or clickbait","Stories designed to generate anxiety or fear"].map(item=>(
            <div key={item} style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:8 }}>
              <div style={{ width:4,height:4,borderRadius:"50%",background:C.inkLight,flexShrink:0,marginTop:6 }}/>
              <span style={{ fontSize:13,color:C.inkMid,lineHeight:1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Hiding note */}
        <div style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px" }}>
          <div style={{ fontSize:12,fontWeight:700,color:C.ink,marginBottom:5 }}>When you hide a story</div>
          <div style={{ fontSize:12,color:C.inkMid,lineHeight:1.7 }}>
            Hiding removes a story from your current session only. It is <em>not</em> sent back as a negative signal — hiding represents preference, not quality. Only editorial flags affect scoring.
          </div>
        </div>
      </div>

      <div style={{ padding:"14px 26px 20px",borderTop:`1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ width:"100%",background:C.ink,color:C.bg,border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Got it</button>
      </div>
    </Modal>
  );
}

function StoryModal({ story, onClose, onUnsee, C, dark }) {
  const acc=cAcc(story.category,dark), bg=cBg(story.category,dark);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:C.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16,backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:16,overflow:"hidden",maxWidth:560,width:"100%",maxHeight:"92vh",overflowY:"auto",boxShadow:`0 24px 64px ${C.shadowMd}`,border:`1px solid ${C.border}` }}>
        <div style={{ background:bg,padding:"32px 30px 24px",position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,background:"rgba(128,128,128,0.12)",border:"none",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16,color:C.inkMid,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:10 }}>{story.tag}</div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,lineHeight:1.25,color:C.ink }}>{story.title}</div>
        </div>
        <div style={{ padding:"22px 30px 30px" }}>
          <div style={{ fontSize:14,lineHeight:1.8,color:C.inkMid,marginBottom:16,fontStyle:"italic",borderLeft:`3px solid ${acc}`,paddingLeft:14 }}>{story.summary}</div>
          <div style={{ fontSize:14,lineHeight:1.85,color:C.inkMid,marginBottom:22 }}>{story.body}</div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11,color:C.inkLight }}>{story.source} · {story.time} · {story.readTime} read</div>
            <button onClick={()=>{onUnsee(story.id);onClose();}} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,color:C.inkLight,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Hide story</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STORY CARD ───────────────────────────────────────────────────────────────
function StoryCard({ story, loved, saved, onLove, onSave, onShare, onUnsee, onClick, C, dark, delay=0 }) {
  const acc=cAcc(story.category,dark), bg=cBg(story.category,dark);
  return (
    <article onClick={onClick} className="bs-card" style={{ background:bg,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,cursor:"pointer",animationDelay:`${delay}s`,display:"flex",flexDirection:"column" }}>
      <div style={{ height:3,background:`linear-gradient(90deg,${acc},${acc}88)` }}/>
      <div style={{ padding:"17px 17px 0",flex:1 }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:7 }}>{story.tag}</div>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,fontWeight:400,lineHeight:1.4,color:C.ink,marginBottom:7 }}>{story.title}</div>
        <div style={{ fontSize:12,lineHeight:1.65,color:C.inkMid }}>{story.summary.substring(0,105)}{story.summary.length>105?"…":""}</div>
      </div>
      <div style={{ padding:"11px 17px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,marginTop:13,background:"rgba(128,128,128,0.03)" }}>
        <div>
          <div style={{ fontSize:11,color:C.inkLight }}>{story.source}</div>
          <div style={{ fontSize:10,color:C.inkFaint }}>{story.time} · {story.readTime}</div>
        </div>
        <div style={{ display:"flex",gap:5,alignItems:"center" }} onClick={e=>e.stopPropagation()}>
          <button onClick={onLove} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:20,background:loved?C.amberPale:C.surface,border:`1px solid ${loved?C.amber:C.border}`,cursor:"pointer",transition:"all 0.15s" }}>
            <Ic.Heart c={loved?C.amber:C.inkLight} f={loved}/><span style={{ fontSize:11,fontWeight:600,color:loved?C.amber:C.inkLight }}>{(story.loves+(loved?1:0)).toLocaleString()}</span>
          </button>
          <button onClick={onSave}  style={{ width:30,height:30,borderRadius:6,background:saved?C.amberPale:C.surface,border:`1px solid ${saved?C.amber:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}><Ic.Bookmark c={saved?C.amber:C.inkLight} f={saved}/></button>
          <button onClick={onShare} style={{ width:30,height:30,borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic.Share c={C.inkLight}/></button>
          <button onClick={onUnsee} style={{ width:30,height:30,borderRadius:6,background:C.surface,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }} title="Hide"><Ic.Eye c={C.inkLight}/></button>
        </div>
      </div>
    </article>
  );
}

function StoryRail({ title, subtitle, stories, lovedSet, onLove, onOpen, C, dark }) {
  return (
    <section style={{ marginBottom:40 }}>
      <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:14 }}>
        <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,fontWeight:400,color:C.ink,margin:0 }}>{title}</h2>
        {subtitle&&<span style={{ fontSize:12,color:C.inkLight }}>{subtitle}</span>}
      </div>
      <div className="bs-rail">
        {stories.map(s=>{
          const acc=cAcc(s.category,dark), bg=cBg(s.category,dark);
          return (
            <div key={s.id} onClick={()=>onOpen(s)} className="bs-card bs-rail-card" style={{ background:bg,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",flexShrink:0 }}>
              <div style={{ height:3,background:`linear-gradient(90deg,${acc},${acc}88)` }}/>
              <div style={{ padding:"15px 15px 13px" }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:6 }}>{s.tag}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,fontWeight:400,lineHeight:1.4,color:C.ink,marginBottom:9 }}>{s.title}</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ fontSize:11,color:C.inkLight }}>{s.source}</span>
                  <button onClick={e=>{e.stopPropagation();onLove(s.id);}} style={{ display:"flex",alignItems:"center",gap:4,background:lovedSet.has(s.id)?C.amberPale:C.surface,border:`1px solid ${lovedSet.has(s.id)?C.amber:C.border}`,borderRadius:20,padding:"3px 8px",cursor:"pointer",transition:"all 0.15s" }}>
                    <Ic.Heart c={lovedSet.has(s.id)?C.amber:C.inkLight} f={lovedSet.has(s.id)} s={11}/>
                    <span style={{ fontSize:11,fontWeight:600,color:lovedSet.has(s.id)?C.amber:C.inkLight }}>{(s.loves+(lovedSet.has(s.id)?1:0)).toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── CAUGHT UP ────────────────────────────────────────────────────────────────
// Animated end-of-feed moment. Fades + rises in after a 1.8s delay so it feels
// like it appears naturally once the user has actually read through the feed.
function CaughtUp({ C, streak, onDigest }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  return (
    <div style={{
      marginTop: 56, paddingTop: 56, borderTop: `1px solid ${C.border}`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center", padding: "0 16px" }}>
        {/* Radiating sun */}
        <div style={{ position:"relative", width:72, height:72, margin:"0 auto 28px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", inset:-14, borderRadius:"50%", background:`${C.amberGlow}`, animation:"bsSunPulse 3s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", inset:-6, borderRadius:"50%", background:`${C.amberPale}`, border:`1px solid ${C.amberMid}` }}/>
          <div style={{ width:48, height:48, borderRadius:"50%", background:`linear-gradient(135deg, ${C.amber}, ${C.amberLight})`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
            {/* SVG sunrise rays */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2v3M12 17v2M4.2 4.2l2 2M17.8 17.8l1.5 1.5M2 12h3M17 12h3M4.2 19.8l2-2M17.8 6.2l1.5-1.5"/>
              <path d="M5 15a7 7 0 0 1 14 0"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </div>
        </div>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.amber, marginBottom:12 }}>
          You're caught up
        </div>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontWeight:400, color:C.ink, lineHeight:1.25, marginBottom:10 }}>
          That's all of today's<br/>good news
        </div>
        <div style={{ fontSize:13, color:C.inkMid, lineHeight:1.7, marginBottom:8 }}>
          {today}
        </div>
        {streak > 0 && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.amberPale, border:`1px solid ${C.amberMid}`, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, color:C.amber, marginBottom:28 }}>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:14 }}>{streak}</span>
            <span>day streak — keep it up</span>
          </div>
        )}

        <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px 24px", marginTop:streak>0?0:28 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:C.ink, marginBottom:6 }}>
            Wake up to good news tomorrow
          </div>
          <div style={{ fontSize:13, color:C.inkMid, lineHeight:1.6, marginBottom:16 }}>
            Get a curated briefing delivered at the time that suits you — free, no noise.
          </div>
          <button onClick={onDigest} style={{ background:C.amber, color:"#fff", border:"none", borderRadius:8, padding:"11px 24px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", width:"100%", transition:"all 0.15s" }}>
            Subscribe to Daily Digest
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATES ─────────────────────────────────────────────────────────────
// Three distinct situations, each with a specific message and recovery action.
function EmptyState({ reason, C, onClearSearch, onExpandRadius, onOpenSettings, onSwitchCategory, activeCategory, radiusKm }) {
  const config = {
    search: {
      headline: "No results found",
      body: "Try different words, or browse your full feed instead.",
      cta: "Clear search",
      action: onClearSearch,
      secondary: null,
    },
    local: {
      headline: `Nothing within ${radiusKm} km`,
      body: "There aren't any local stories that close right now — try widening your radius.",
      cta: "Expand to 100 km",
      action: onExpandRadius,
      secondary: null,
    },
    category: {
      headline: "All stories hidden",
      body: "You've hidden all the stories in this section. Check another section or adjust your preferences.",
      cta: "Go back to Your Feed",
      action: onSwitchCategory,
      secondary: { label:"Edit sections", action: onOpenSettings },
    },
    mood: {
      headline: "No stories match this mood",
      body: "Your mood filter is narrowing the feed to zero. Try a different mood or browse all sections.",
      cta: "Browse without a mood",
      action: onSwitchCategory,
      secondary: null,
    },
  };

  const { headline, body, cta, action, secondary } = config[reason] || config.category;

  return (
    <div style={{ textAlign:"center", padding:"80px 16px 40px" }}>
      {/* Subtle icon */}
      <div style={{ width:52, height:52, borderRadius:"50%", background:C.surfaceAlt, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.inkLight} strokeWidth="1.5" strokeLinecap="round">
          {reason === "search"
            ? <><circle cx="9" cy="9" r="6"/><line x1="14" y1="14" x2="18" y2="18"/><line x1="6" y1="9" x2="12" y2="9"/></>
            : reason === "local"
            ? <><circle cx="10" cy="9" r="5"/><path d="M10 14v4M10 2v2"/><path d="M3 16s2-3 7-3 7 3 7 3"/></>
            : <><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/><circle cx="10" cy="14" r="0.8" fill={C.inkLight}/></>
          }
        </svg>
      </div>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:C.inkMid, marginBottom:8 }}>{headline}</div>
      <div style={{ fontSize:14, color:C.inkLight, lineHeight:1.7, maxWidth:300, margin:"0 auto 28px" }}>{body}</div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <button onClick={action} style={{ background:C.amber, color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
          {cta}
        </button>
        {secondary && (
          <button onClick={secondary.action} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, color:C.inkMid, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BrightSide() {
  // ── Dark mode ──
  const [dark, setDark] = useState(()=>{ try { const s=localStorage.getItem("bs-dark"); if(s!=null)return s==="true"; } catch{} return window.matchMedia?.("(prefers-color-scheme: dark)").matches??false; });
  useEffect(()=>{ try{localStorage.setItem("bs-dark",String(dark));}catch{} },[dark]);
  useEffect(()=>{ const mq=window.matchMedia?.("(prefers-color-scheme: dark)"); if(!mq)return; const h=e=>{try{if(localStorage.getItem("bs-dark")===null)setDark(e.matches);}catch{setDark(e.matches);}}; mq.addEventListener("change",h); return()=>mq.removeEventListener("change",h); },[]);
  const C = dark ? DARK : LIGHT;

  // ── Onboarding & prefs ──
  // Edge case hardening: if bs-onboarded is true but prefs are missing/corrupt,
  // reconstruct silently with all-categories defaults rather than re-triggering onboarding.
  const [hasOnboarded, setHasOnboarded] = useState(()=>LS.get("bs-onboarded",false));
  const [prefs, setPrefs] = useState(()=>{
    const ALL_CATS = CATS.map(c=>c.id);
    try {
      const raw = LS.get("bs-prefs", null);
      if (!raw || typeof raw !== "object") return { categories: ALL_CATS, mood: null };
      // Ensure categories is a non-empty array of valid ids
      const cats = Array.isArray(raw.categories) && raw.categories.length > 0
        ? raw.categories.filter(id => ALL_CATS.includes(id))
        : ALL_CATS;
      const safeCats = cats.length > 0 ? cats : ALL_CATS;
      // Ensure mood is a known key or null
      const mood = MOOD_CONFIG[raw.mood] ? raw.mood : null;
      return { categories: safeCats, mood };
    } catch {
      return { categories: ALL_CATS, mood: null };
    }
  });

  const completeOnboarding = useCallback((p) => {
    const newPrefs = { categories: p.categories, mood: p.mood };
    LS.set("bs-prefs", newPrefs);
    LS.set("bs-onboarded", true);
    setPrefs(newPrefs);
    setHasOnboarded(true);
    setActiveMood(p.mood);
    setActiveCategory("all");
  }, []);

  const updatePrefs = useCallback((p) => {
    LS.set("bs-prefs", p);
    setPrefs(p);
    setActiveMood(p.mood);
  }, []);

  const resetOnboarding = useCallback(() => {
    LS.set("bs-onboarded", false);
    setHasOnboarded(false);
    setShowSettings(false);
    setShowAccount(false);
  }, []);

  // ── Feed state ──
  const [activeCategory, setActiveCategory] = useState("all");
  const [lovedStories,  setLovedStories]    = useState(new Set());
  const [savedStories,  setSavedStories]    = useState(new Set());
  const [unseenStories, setUnseenStories]   = useState(new Set());
  const [activeMood,    setActiveMood]      = useState(()=>LS.get("bs-prefs",{mood:null}).mood);
  const [radiusKm,      setRadiusKm]        = useState(50);
  const [shareStory,    setShareStory]      = useState(null);
  const [openStory,     setOpenStory]       = useState(null);
  const [showDigest,    setShowDigest]      = useState(false);
  const [showSettings,  setShowSettings]    = useState(false);
  const [showAccount,   setShowAccount]     = useState(false);
  const [showHowWeFilter,setShowHowWeFilter]= useState(false);
  const [showSearch,    setShowSearch]      = useState(false);
  const [searchQuery,   setSearchQuery]     = useState("");
  const [mobileTab,     setMobileTab]       = useState("home");
  const [streak]                            = useState(7);
  const [showStreak,    setShowStreak]      = useState(false);

  const toggleLove = useCallback((id,e)=>{e?.stopPropagation();setLovedStories(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});},[]);
  const toggleSave = useCallback((id,e)=>{e?.stopPropagation();setSavedStories(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});},[]);
  const unseeStory = useCallback((id)=>{setUnseenStories(p=>new Set([...p,id]));},[]);

  const [isMobile, setIsMobile] = useState(()=>window.innerWidth<640);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<640); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);

  // Personalized feed — filter by saved categories, then mood-sort
  const visible = useMemo(()=>{
    let s = STORIES.filter(x=>{
      if(unseenStories.has(x.id)) return false;
      // Filter to preferred categories (unless a specific cat is drilled into)
      if(activeCategory==="all"){
        if(!prefs.categories.includes(x.category)) return false;
      } else {
        if(x.category!==activeCategory) return false;
      }
      if(activeCategory==="local"&&x.radius>radiusKm) return false;
      if(searchQuery){ const q=searchQuery.toLowerCase(); return x.title.toLowerCase().includes(q)||x.summary.toLowerCase().includes(q); }
      return true;
    });
    if(activeMood) s=[...s].sort((a,b)=>{ const d=moodScore(b,activeMood)-moodScore(a,activeMood); return Math.abs(d)>0.05?d:b.loves-a.loves; });
    return s;
  },[unseenStories,activeCategory,radiusKm,searchQuery,activeMood,prefs.categories]);

  const featured  = visible[0];
  const grid      = visible.slice(1);
  const mostLoved = [...STORIES].filter(s=>!unseenStories.has(s.id)&&prefs.categories.includes(s.category)).sort((a,b)=>b.loves-a.loves).slice(0,6);
  const nearYou   = [...STORIES].filter(s=>!unseenStories.has(s.id)&&s.radius>0&&prefs.categories.includes(s.category)).sort((a,b)=>a.radius-b.radius).slice(0,5);
  const savedList = STORIES.filter(s=>savedStories.has(s.id));

  const featAcc = featured ? cAcc(featured.category,dark) : C.amber;
  const featBg  = featured ? cBg(featured.category,dark)  : C.surfaceAlt;

  // ── Show onboarding for new users ──
  if (!hasOnboarded) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap'); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0} @keyframes bsReadyPop{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}`}</style>
        <Onboarding C={C} dark={dark} onComplete={completeOnboarding}/>
      </>
    );
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100vh",color:C.ink,transition:"background 0.25s,color 0.25s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${C.amberPale};color:${C.amber}}
        ::-webkit-scrollbar{width:0;height:0}
        .bs-card{transition:transform 0.18s ease,box-shadow 0.18s ease}
        .bs-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px ${C.shadowMd}}
        .bs-rail{display:flex;gap:14px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
        .bs-rail-card{width:255px;scroll-snap-align:start}
        @media(max-width:639px){.bs-rail-card{width:215px}}
        .bs-cat{flex-shrink:0;background:none;border:1px solid transparent;border-radius:4px;padding:6px 12px;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;color:${C.inkMid};transition:all 0.15s;white-space:nowrap}
        .bs-cat:hover{color:${C.ink};background:${C.surfaceAlt}}
        .bs-cat.on{color:${C.amber};background:${C.amberPale};border-color:${C.amberMid};font-weight:600}
        .bs-mood{flex-shrink:0;background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:20px;padding:5px 13px;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;color:${C.inkMid};transition:all 0.15s}
        .bs-mood:hover{border-color:${C.amberMid};color:${C.amber}}
        .bs-mood.on{background:${C.amber};color:#fff;border-color:${C.amber};font-weight:600}
        .bs-card-in{animation:bsRise 0.35s ease both}
        @keyframes bsRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .bs-btn{background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:6px;padding:7px 13px;cursor:pointer;font-size:13px;font-weight:600;color:${C.inkMid};font-family:'DM Sans',sans-serif;transition:all 0.15s}
        .bs-btn:hover{border-color:${C.amberMid};color:${C.amber}}
        .bs-btn-dark{background:${C.ink};color:${dark?C.bg:"#fff"};border:none}
        .bs-btn-dark:hover{background:${C.amber};color:#fff;border:none}
        input[type=range]{-webkit-appearance:none;height:3px;background:${C.border};border-radius:2px;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:${C.amber};cursor:pointer;border:2px solid ${C.surface};box-shadow:0 1px 4px ${C.shadow}}
        .bs-search{width:100%;border:1.5px solid ${C.border};border-radius:8px;padding:10px 13px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;color:${C.ink};background:${C.surfaceAlt};transition:border 0.15s}
        .bs-search:focus{border-color:${C.amber}}
        .bs-bottom-nav{position:fixed;bottom:0;left:0;right:0;background:${C.surface};border-top:1px solid ${C.border};display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom,0px)}
        .bs-nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px 8px;cursor:pointer;background:none;border:none;gap:4px;transition:all 0.15s}
        .bs-nav-label{font-size:10px;font-family:'DM Sans',sans-serif;font-weight:600;letter-spacing:0.02em}
        @keyframes bsPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
        @keyframes bsReadyPop{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes bsSunPulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:`0 ${isMobile?"14px":"28px"}`,position:"sticky",top:0,zIndex:100,transition:"background 0.25s" }}>
        <div style={{ maxWidth:1160,margin:"0 auto" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0 8px" }}>
            <div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:22,fontWeight:400,letterSpacing:"-0.3px",color:C.ink }}>Bright<span style={{color:C.amber}}>Side</span></div>
              {!isMobile&&<div style={{ fontSize:10,fontWeight:500,letterSpacing:"0.07em",color:C.inkLight,marginTop:1 }}>Today's Good News</div>}
            </div>

            <div style={{ display:"flex",alignItems:"center",gap:7 }}>
              {/* Personalisation indicator */}
              {!isMobile && prefs.categories.length < CATS.length && (
                <div style={{ fontSize:11,fontWeight:600,color:C.amber,background:C.amberPale,border:`1px solid ${C.amberMid}`,borderRadius:20,padding:"4px 10px" }}>
                  {prefs.categories.length} sections
                </div>
              )}
              <div style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:C.amberPale,border:`1px solid ${C.amberMid}`,borderRadius:20,fontSize:11,fontWeight:600,color:C.amber }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:C.amber,display:"inline-block",animation:"bsPulse 2.2s infinite" }}/>
                {isMobile?"Live":"Live feed"}
              </div>
              {!isMobile&&<button className="bs-btn" onClick={()=>setShowDigest(true)}>Daily Digest</button>}
              <button className="bs-btn" onClick={()=>setShowSearch(v=>!v)} style={{ width:36,height:36,padding:0,display:"flex",alignItems:"center",justifyContent:"center",background:showSearch?C.amberPale:C.surfaceAlt,borderColor:showSearch?C.amberMid:C.border }}><Ic.Search c={showSearch?C.amber:C.inkMid}/></button>
              <button className="bs-btn" onClick={()=>setShowAccount(true)} style={{ width:36,height:36,padding:0,display:"flex",alignItems:"center",justifyContent:"center" }} title="Your account"><Ic.Person c={C.inkMid}/></button>
              <button className="bs-btn" onClick={()=>setShowSettings(true)} style={{ width:36,height:36,padding:0,display:"flex",alignItems:"center",justifyContent:"center" }} title="Preferences"><Ic.Settings c={C.inkMid}/></button>
              <button className="bs-btn" onClick={()=>setDark(v=>!v)} style={{ width:36,height:36,padding:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                {dark?<Ic.Sun c={C.amber}/>:<Ic.Moon c={C.inkMid}/>}
              </button>
            </div>
          </div>

          {showSearch&&<div style={{ paddingBottom:10 }}><input autoFocus className="bs-search" placeholder="Search today's good news…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div>}

          {!isMobile&&(
            <div style={{ display:"flex",gap:2,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.border}`,paddingTop:7,paddingBottom:9 }}>
              <button className={`bs-cat${activeCategory==="all"?" on":""}`} onClick={()=>setActiveCategory("all")}>Your Feed</button>
              {CATS.filter(c=>prefs.categories.includes(c.id)).map(cat=>(
                <button key={cat.id} className={`bs-cat${activeCategory===cat.id?" on":""}`} onClick={()=>setActiveCategory(cat.id)}>{cat.label}</button>
              ))}
              {prefs.categories.length < CATS.length && (
                <button className="bs-cat" onClick={()=>setShowSettings(true)} style={{ color:C.inkLight,fontStyle:"italic" }}>+ more sections</button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── MOOD BAR ────────────────────────────────────────────── */}
      <div style={{ background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`,padding:`0 ${isMobile?"14px":"28px"}`,transition:"background 0.25s" }}>
        <div style={{ maxWidth:1160,margin:"0 auto" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,overflowX:"auto",scrollbarWidth:"none",padding:"8px 0" }}>
            <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,flexShrink:0 }}>Mood</span>
            {Object.keys(MOOD_CONFIG).map(m=>(
              <button key={m} className={`bs-mood${activeMood===m?" on":""}`} onClick={()=>setActiveMood(activeMood===m?null:m)}>{m}</button>
            ))}
          </div>
          {activeMood&&(
            <div style={{ display:"flex",alignItems:"center",gap:8,paddingBottom:8,animation:"bsRise 0.2s ease" }}>
              <div style={{ width:3,height:13,borderRadius:2,background:C.amber,flexShrink:0 }}/>
              <span style={{ fontSize:12,color:C.inkMid }}><strong style={{ color:C.amber,fontWeight:600 }}>{activeMood}</strong>{" — "}{MOOD_CONFIG[activeMood].description}</span>
              <span style={{ fontSize:11,color:C.inkLight,marginLeft:"auto",flexShrink:0,whiteSpace:"nowrap" }}>{visible.length} {visible.length===1?"story":"stories"}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── LOCAL RADIUS ── */}
      {activeCategory==="local"&&(
        <div style={{ background:cBg("local",dark),borderBottom:`1px solid ${C.border}`,padding:`9px ${isMobile?"14px":"28px"}` }}>
          <div style={{ maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",gap:14 }}>
            <span style={{ fontSize:12,fontWeight:600,color:cAcc("local",dark),flexShrink:0 }}>Within</span>
            <input type="range" min={5} max={100} value={radiusKm} onChange={e=>setRadiusKm(Number(e.target.value))} style={{ flex:1,maxWidth:200 }}/>
            <span style={{ fontSize:13,fontWeight:700,color:cAcc("local",dark),flexShrink:0,minWidth:50 }}>{radiusKm} km</span>
            <span style={{ fontSize:12,color:C.inkLight }}>{visible.length} {visible.length===1?"story":"stories"}</span>
          </div>
        </div>
      )}

      {/* ── MOBILE CAT TABS ── */}
      {isMobile&&(
        <div style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"7px 14px",overflowX:"auto",scrollbarWidth:"none",display:"flex",gap:5 }}>
          <button className={`bs-cat${activeCategory==="all"?" on":""}`} style={{ fontSize:12,padding:"5px 10px" }} onClick={()=>{setActiveCategory("all");setMobileTab("home");}}>Your Feed</button>
          {CATS.filter(c=>prefs.categories.includes(c.id)).map(cat=>(
            <button key={cat.id} className={`bs-cat${activeCategory===cat.id?" on":""}`} style={{ fontSize:12,padding:"5px 10px" }} onClick={()=>{setActiveCategory(cat.id);setMobileTab("home");}}>{cat.label}</button>
          ))}
        </div>
      )}

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth:1160,margin:"0 auto",padding:`26px ${isMobile?"14px":"28px"} ${isMobile?"88px":"40px"}` }}>

        {/* Mobile: Saved tab */}
        {isMobile&&mobileTab==="saved"&&(
          <section>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.inkLight,marginBottom:16 }}>Saved · {savedList.length}</div>
            {savedList.length===0?<div style={{ textAlign:"center",padding:"60px 0",color:C.inkLight }}><div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:C.inkMid,marginBottom:8 }}>Nothing saved yet</div><div style={{ fontSize:13 }}>Tap the bookmark on any story to save it here.</div></div>
              :savedList.map(s=>{const acc=cAcc(s.category,dark);return(<div key={s.id} onClick={()=>setOpenStory(s)} className="bs-card" style={{ display:"flex",alignItems:"center",gap:13,padding:"12px 15px",background:C.surfaceAlt,borderRadius:10,marginBottom:8,cursor:"pointer",border:`1px solid ${C.border}` }}><div style={{ width:4,alignSelf:"stretch",borderRadius:2,background:acc,flexShrink:0 }}/><div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:2 }}>{s.tag}</div><div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:C.ink,lineHeight:1.35,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.title}</div></div><button onClick={e=>{e.stopPropagation();toggleSave(s.id,e);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.amber,fontSize:18,flexShrink:0 }}>×</button></div>);})}
          </section>
        )}

        {/* Mobile: Explore tab */}
        {isMobile&&mobileTab==="explore"&&(
          <section>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.inkLight,marginBottom:16 }}>All Sections</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {CATS.map(cat=>{
                const acc=cAcc(cat.id,dark), bg=cBg(cat.id,dark), on=prefs.categories.includes(cat.id);
                return(<button key={cat.id} onClick={()=>{setActiveCategory(cat.id);setMobileTab("home");}} style={{ background:bg,border:`1.5px solid ${on?acc:C.border}`,borderRadius:12,padding:"16px 14px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:7,position:"relative" }}>
                  {!on&&<div style={{ position:"absolute",top:8,right:8,fontSize:9,fontWeight:700,color:C.inkLight,background:C.surfaceAlt,borderRadius:4,padding:"2px 6px" }}>hidden</div>}
                  <div style={{ width:28,height:28,borderRadius:8,background:`${acc}22`,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:10,height:10,borderRadius:"50%",background:acc }}/></div>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.ink }}>{cat.label}</div>
                  <div style={{ fontSize:11,color:C.inkLight }}>{STORIES.filter(s=>s.category===cat.id).length} stories</div>
                </button>);
              })}
            </div>
          </section>
        )}

        {/* Feed */}
        {(!isMobile||mobileTab==="home")&&(
          <>
            {visible.length===0?(
              // ── Context-aware empty states ──
              searchQuery
                ? <EmptyState reason="search"    C={C} onClearSearch={()=>setSearchQuery("")} activeCategory={activeCategory} radiusKm={radiusKm}/>
                : activeCategory==="local"
                ? <EmptyState reason="local"     C={C} onExpandRadius={()=>setRadiusKm(100)} activeCategory={activeCategory} radiusKm={radiusKm}/>
                : activeMood
                ? <EmptyState reason="mood"      C={C} onSwitchCategory={()=>setActiveMood(null)} onOpenSettings={()=>setShowSettings(true)} activeCategory={activeCategory} radiusKm={radiusKm}/>
                : <EmptyState reason="category"  C={C} onSwitchCategory={()=>setActiveCategory("all")} onOpenSettings={()=>setShowSettings(true)} activeCategory={activeCategory} radiusKm={radiusKm}/>
            ):<>
              {/* Hero */}
              {featured&&(
                <section style={{ marginBottom:isMobile?24:40 }}>
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:activeMood?C.amber:C.inkLight,marginBottom:12 }}>
                    {activeMood?`${activeMood} — Sorted for your mood`:"Top Story"}
                  </div>
                  <div onClick={()=>setOpenStory(featured)} className="bs-card bs-card-in" style={{ background:featBg,borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`,cursor:"pointer",display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 280px",minHeight:isMobile?"auto":280 }}>
                    <div style={{ padding:isMobile?"18px 18px 14px":"30px 34px",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:featAcc,marginBottom:11 }}>{featured.tag}</div>
                        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?21:27,fontWeight:400,lineHeight:1.2,marginBottom:13,color:C.ink }}>{featured.title}</div>
                        <div style={{ fontSize:isMobile?13:14,lineHeight:1.75,color:C.inkMid }}>{featured.summary}</div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:18,paddingTop:14,borderTop:`1px solid ${C.borderLight}`,flexWrap:"wrap",gap:8 }}>
                        <div style={{ fontSize:11,color:C.inkLight }}>{featured.source} · {featured.time}</div>
                        <div style={{ display:"flex",gap:7,alignItems:"center" }} onClick={e=>e.stopPropagation()}>
                          <button onClick={e=>toggleLove(featured.id,e)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,background:lovedStories.has(featured.id)?C.amberPale:C.surface,border:`1px solid ${lovedStories.has(featured.id)?C.amber:C.border}`,cursor:"pointer",transition:"all 0.15s" }}>
                            <Ic.Heart c={lovedStories.has(featured.id)?C.amber:C.inkLight} f={lovedStories.has(featured.id)} s={13}/>
                            <span style={{ fontSize:12,fontWeight:600,color:lovedStories.has(featured.id)?C.amber:C.inkMid }}>{(featured.loves+(lovedStories.has(featured.id)?1:0)).toLocaleString()}</span>
                          </button>
                          <button onClick={e=>{e.stopPropagation();setShareStory(featured);}} className="bs-btn">Share</button>
                          <button onClick={()=>setOpenStory(featured)} className="bs-btn bs-btn-dark">Read</button>
                        </div>
                      </div>
                    </div>
                    {!isMobile&&(
                      <div style={{ background:`linear-gradient(160deg,${featAcc}20,${featAcc}06)`,display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"flex-end",padding:"26px 26px 30px",position:"relative",overflow:"hidden",borderLeft:`1px solid ${C.borderLight}` }}>
                        <div style={{ position:"absolute",top:-16,right:-8,fontFamily:"'DM Serif Display',serif",fontSize:100,fontWeight:400,color:`${featAcc}14`,lineHeight:1,userSelect:"none",letterSpacing:"-3px" }}>{featured.tag}</div>
                        <div style={{ position:"relative",zIndex:1 }}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:featAcc,marginBottom:5,opacity:0.7 }}>BrightSide</div>
                          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,fontStyle:"italic",color:C.inkMid,lineHeight:1.6,maxWidth:180 }}>"{featured.summary.split(".")[0]}."</div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeCategory==="all"&&<StoryRail title="Most Loved Today" subtitle={`${mostLoved.reduce((s,x)=>s+x.loves,0).toLocaleString()} loves`} stories={mostLoved} lovedSet={lovedStories} onLove={id=>toggleLove(id)} onOpen={setOpenStory} C={C} dark={dark}/>}
              {activeCategory==="all"&&nearYou.length>0&&<StoryRail title="Spreading Joy Near You" subtitle="Stories with a local heartbeat" stories={nearYou} lovedSet={lovedStories} onLove={id=>toggleLove(id)} onOpen={setOpenStory} C={C} dark={dark}/>}

              {grid.length>0&&(
                <section>
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.inkLight,marginBottom:16 }}>
                    {activeMood?`${activeMood} — sorted for your mood`:activeCategory==="all"?"Your Stories":CATS.find(c=>c.id===activeCategory)?.label}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(285px,1fr))",gap:isMobile?11:15 }}>
                    {grid.map((story,i)=>(
                      <StoryCard key={story.id} story={story} loved={lovedStories.has(story.id)} saved={savedStories.has(story.id)}
                        onLove={e=>toggleLove(story.id,e)} onSave={e=>toggleSave(story.id,e)}
                        onShare={e=>{e?.stopPropagation();setShareStory(story);}}
                        onUnsee={e=>{e?.stopPropagation();unseeStory(story.id);}}
                        onClick={()=>setOpenStory(story)} C={C} dark={dark} delay={i*0.04}/>
                    ))}
                  </div>
                </section>
              )}

              {/* ── You're caught up ── */}
              <CaughtUp C={C} streak={streak} onDigest={()=>setShowDigest(true)}/>

              {!isMobile&&savedList.length>0&&(
                <section style={{ marginTop:48,paddingTop:32,borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:16 }}>
                    <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,fontWeight:400,color:C.ink }}>Saved</h2>
                    <span style={{ fontSize:13,color:C.inkLight }}>{savedList.length}</span>
                  </div>
                  {savedList.map(s=>{const acc=cAcc(s.category,dark);return(<div key={s.id} onClick={()=>setOpenStory(s)} className="bs-card" style={{ display:"flex",alignItems:"center",gap:13,padding:"12px 16px",background:C.surfaceAlt,borderRadius:9,marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}` }}><div style={{ width:4,alignSelf:"stretch",borderRadius:2,background:acc,flexShrink:0 }}/><div style={{ flex:1 }}><div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:2 }}>{s.tag}</div><div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:C.ink,lineHeight:1.35 }}>{s.title}</div></div><div style={{ fontSize:11,color:C.inkLight,flexShrink:0 }}>{s.source}</div><button onClick={e=>{e.stopPropagation();toggleSave(s.id,e);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.amber,fontSize:18,lineHeight:1 }}>×</button></div>);})}
                </section>
              )}
            </>}
          </>
        )}
      </main>

      {/* ── STREAK (desktop) ─────────────────────────────────────── */}
      {!isMobile&&(
        <>
          <div onClick={()=>setShowStreak(v=>!v)} style={{ position:"fixed",bottom:24,right:24,background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"10px 16px",boxShadow:`0 4px 20px ${C.shadow}`,display:"flex",alignItems:"center",gap:11,cursor:"pointer",transition:"all 0.2s",zIndex:90 }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.amberLight})`,display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:"#fff" }}>{streak}</span></div>
            <div><div style={{ fontSize:12,fontWeight:700,color:C.ink }}>{streak}-day streak</div><div style={{ fontSize:11,color:C.inkLight }}>Keep scrolling bright</div></div>
          </div>
          {showStreak&&(
            <div style={{ position:"fixed",bottom:80,right:24,background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:18,boxShadow:`0 8px 32px ${C.shadowMd}`,zIndex:200,width:216 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.ink,marginBottom:13 }}>This week</div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:11 }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i)=>(
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:9,color:C.inkLight,marginBottom:5,fontWeight:500 }}>{d}</div>
                    <div style={{ width:23,height:23,borderRadius:"50%",background:i<streak?C.amber:C.border,display:"flex",alignItems:"center",justifyContent:"center" }}>{i<streak&&<Ic.Check c="#fff" s={9}/>}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11,color:C.inkLight,textAlign:"center",lineHeight:1.5 }}>A week of bright news. Keep it going.</div>
            </div>
          )}
        </>
      )}

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────── */}
      {isMobile&&(
        <nav className="bs-bottom-nav">
          {[{id:"home",l:"Home",I:({c})=><Ic.Home c={c}/>},{id:"explore",l:"Explore",I:({c})=><Ic.Compass c={c}/>},{id:"saved",l:"Saved",I:({c})=><Ic.Saved c={c}/>},{id:"digest",l:"Digest",I:({c})=><Ic.Menu c={c}/>}].map(item=>{
            const active=item.id!=="digest"&&mobileTab===item.id;
            return(<button key={item.id} className="bs-nav-btn" onClick={()=>item.id==="digest"?setShowDigest(true):setMobileTab(item.id)}>
              <item.I c={active?C.amber:C.inkLight}/>
              <span className="bs-nav-label" style={{ color:active?C.amber:C.inkLight }}>{item.l}</span>
            </button>);
          })}
        </nav>
      )}

      {/* ── MODALS & PANELS ─────────────────────────────────────── */}
      {shareStory&&<ShareModal story={shareStory} onClose={()=>setShareStory(null)} C={C} dark={dark}/>}
      {showDigest&&<DigestModal onClose={()=>setShowDigest(false)} C={C} dark={dark}/>}
      {openStory&&<StoryModal story={openStory} onClose={()=>setOpenStory(null)} onUnsee={unseeStory} C={C} dark={dark}/>}
      {showSettings&&<SettingsPanel C={C} dark={dark} prefs={prefs} onUpdate={updatePrefs} onClose={()=>setShowSettings(false)} onResetOnboarding={resetOnboarding} onHowWeFilter={()=>{setShowSettings(false);setShowHowWeFilter(true);}}/>}
      {showAccount&&<AccountModal onClose={()=>setShowAccount(false)} C={C} dark={dark} prefs={prefs} streak={streak} lovedCount={lovedStories.size} savedCount={savedStories.size} onResetOnboarding={resetOnboarding}/>}
      {showHowWeFilter&&<HowWeFilterModal onClose={()=>setShowHowWeFilter(false)} C={C}/>}
    </div>
  );
}
