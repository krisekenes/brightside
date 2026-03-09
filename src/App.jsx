import { useState, useEffect, useCallback, useMemo } from "react";
import { LIGHT, DARK, cAcc, cBg } from "./lib/theme";
import { MOOD_CONFIG, moodScore } from "./lib/mood";
import { LS } from "./lib/storage";
import { CATS, STORIES } from "./lib/data";
import { Ic } from "./icons";
import Onboarding from "./components/Onboarding";
import SettingsPanel from "./components/SettingsPanel";
import StoryCard from "./components/StoryCard";
import StoryRail from "./components/StoryRail";
import CaughtUp from "./components/CaughtUp";
import EmptyState from "./components/EmptyState";
import ShareModal from "./components/modals/ShareModal";
import DigestModal from "./components/modals/DigestModal";
import AccountModal from "./components/modals/AccountModal";
import HowWeFilterModal from "./components/modals/HowWeFilterModal";
import StoryModal from "./components/modals/StoryModal";

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
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
  const [showStreak,    setShowStreak]      = useState(false);
  const [justLovedId,   setJustLovedId]     = useState(null);
  const [toast,         setToast]           = useState(null);
  const [readCount,     setReadCount]       = useState(0);

  // ── Streak — real persistence via localStorage ──
  const [streakData, setStreakData] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const data  = LS.get("bs-streak", { count: 0, lastVisit: null, days: [] });
    if (data.lastVisit === today) return data;
    const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
    const newCount  = data.lastVisit === yesterday ? data.count + 1 : 1;
    const days      = [...(data.days||[]).filter(d=>(Date.now()-new Date(d).getTime())/864e5<7), today];
    const newData   = { count: newCount, lastVisit: today, days };
    LS.set("bs-streak", newData);
    return newData;
  });
  const streak     = streakData.count;
  const streakDays = streakData.days || [];

  // Show toast on streak milestones (7, 14, 30…)
  useEffect(() => {
    if (![7,14,30,50,100].includes(streak)) return;
    const shown = LS.get("bs-streak-milestone", 0);
    if (shown >= streak) return;
    LS.set("bs-streak-milestone", streak);
    const t = setTimeout(() => {
      setToast(`${streak}-day streak`);
      setTimeout(() => setToast(null), 3000);
    }, 800);
    return () => clearTimeout(t);
  }, [streak]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const toggleLove = useCallback((id,e)=>{
    e?.stopPropagation();
    setLovedStories(p=>{
      const n=new Set(p);
      if (!n.has(id)) {
        n.add(id);
        setJustLovedId(id);
        setTimeout(()=>setJustLovedId(cur=>cur===id?null:cur), 400);
        const milestones={5:"5 stories loved",10:"10 loves today",25:"25 loves"};
        if (milestones[n.size]) showToast(milestones[n.size]);
      } else {
        n.delete(id);
      }
      return n;
    });
  },[showToast]);
  const toggleSave = useCallback((id,e)=>{e?.stopPropagation();setSavedStories(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});},[]);
  const unseeStory = useCallback((id)=>{setUnseenStories(p=>new Set([...p,id]));},[]);
  const openStoryModal = useCallback((story)=>{setOpenStory(story);setReadCount(c=>c+1);},[]);

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
        @keyframes bsHeartPop{0%{transform:scale(1)}35%{transform:scale(1.5)}65%{transform:scale(0.88)}100%{transform:scale(1)}}
        @keyframes bsToastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
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
              :savedList.map(s=>{const acc=cAcc(s.category,dark);return(<div key={s.id} onClick={()=>openStoryModal(s)} className="bs-card" style={{ display:"flex",alignItems:"center",gap:13,padding:"12px 15px",background:C.surfaceAlt,borderRadius:10,marginBottom:8,cursor:"pointer",border:`1px solid ${C.border}` }}><div style={{ width:4,alignSelf:"stretch",borderRadius:2,background:acc,flexShrink:0 }}/><div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:2 }}>{s.tag}</div><div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:C.ink,lineHeight:1.35,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.title}</div></div><button onClick={e=>{e.stopPropagation();toggleSave(s.id,e);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.amber,fontSize:18,flexShrink:0 }}>×</button></div>);})}
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
                  <div onClick={()=>openStoryModal(featured)} className="bs-card bs-card-in" style={{ background:featBg,borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`,cursor:"pointer",display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 280px",minHeight:isMobile?"auto":280 }}>
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
                          <button onClick={()=>openStoryModal(featured)} className="bs-btn bs-btn-dark">Read</button>
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

              {activeCategory==="all"&&<StoryRail title="Most Loved Today" subtitle={`${mostLoved.reduce((s,x)=>s+x.loves,0).toLocaleString()} loves`} stories={mostLoved} lovedSet={lovedStories} onLove={id=>toggleLove(id)} onOpen={openStoryModal} C={C} dark={dark} justLovedId={justLovedId}/>}
              {activeCategory==="all"&&nearYou.length>0&&<StoryRail title="Spreading Joy Near You" subtitle="Stories with a local heartbeat" stories={nearYou} lovedSet={lovedStories} onLove={id=>toggleLove(id)} onOpen={openStoryModal} C={C} dark={dark} justLovedId={justLovedId}/>}

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
                        onClick={()=>openStoryModal(story)} C={C} dark={dark} delay={i*0.04} justLovedId={justLovedId}/>
                    ))}
                  </div>
                </section>
              )}

              {/* ── You're caught up ── */}
              <CaughtUp C={C} streak={streak} onDigest={()=>setShowDigest(true)} lovedToday={lovedStories.size} readToday={readCount}/>

              {!isMobile&&savedList.length>0&&(
                <section style={{ marginTop:48,paddingTop:32,borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:16 }}>
                    <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,fontWeight:400,color:C.ink }}>Saved</h2>
                    <span style={{ fontSize:13,color:C.inkLight }}>{savedList.length}</span>
                  </div>
                  {savedList.map(s=>{const acc=cAcc(s.category,dark);return(<div key={s.id} onClick={()=>openStoryModal(s)} className="bs-card" style={{ display:"flex",alignItems:"center",gap:13,padding:"12px 16px",background:C.surfaceAlt,borderRadius:9,marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}` }}><div style={{ width:4,alignSelf:"stretch",borderRadius:2,background:acc,flexShrink:0 }}/><div style={{ flex:1 }}><div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:2 }}>{s.tag}</div><div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:C.ink,lineHeight:1.35 }}>{s.title}</div></div><div style={{ fontSize:11,color:C.inkLight,flexShrink:0 }}>{s.source}</div><button onClick={e=>{e.stopPropagation();toggleSave(s.id,e);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.amber,fontSize:18,lineHeight:1 }}>×</button></div>);})}
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
                {(()=>{
                  const today=new Date(), dow=today.getDay();
                  const sunday=new Date(today); sunday.setDate(today.getDate()-dow);
                  return ["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i)=>{
                    const day=new Date(sunday); day.setDate(sunday.getDate()+i);
                    const iso=day.toISOString().split("T")[0];
                    const visited=streakDays.includes(iso);
                    const isToday=i===dow;
                    return(
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:9,color:isToday?C.amber:C.inkLight,marginBottom:5,fontWeight:isToday?700:500 }}>{d}</div>
                        <div style={{ width:23,height:23,borderRadius:"50%",background:visited?C.amber:C.border,border:isToday&&!visited?`2px solid ${C.amber}`:"none",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box" }}>
                          {visited&&<Ic.Check c="#fff" s={9}/>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div style={{ fontSize:11,color:C.inkLight,textAlign:"center",lineHeight:1.5 }}>{streak>1?`${streak} days and counting. Keep it going.`:"Day 1 — come back tomorrow to build your streak."}</div>
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

      {/* ── TOAST ──────────────────────────────────────────────── */}
      {toast&&(
        <div style={{ position:"fixed",bottom:isMobile?88:32,left:"50%",transform:"translateX(-50%)",background:C.ink,color:dark?C.bg:"#fff",borderRadius:20,padding:"9px 18px",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",zIndex:500,whiteSpace:"nowrap",boxShadow:`0 4px 20px ${C.shadowMd}`,animation:"bsToastIn 0.25s ease",display:"flex",alignItems:"center",gap:8,pointerEvents:"none" }}>
          <Ic.Heart c={C.amber} f s={12}/>
          {toast}
        </div>
      )}
    </div>
  );
}
