import { useState, useEffect } from "react";
import { CATS } from "../lib/data";
import { MOOD_CONFIG } from "../lib/mood";
import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

// ─── ONBOARDING ────────────────────────────────────────────────────────────────
export default function Onboarding({ C, dark, onComplete }) {
  const [step, setStep]         = useState(1);
  const [picks, setPicks]       = useState(new Set());
  const [mood, setMood]         = useState(null);
  const [exiting, setExiting]   = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

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
    <div style={{ position:"fixed",inset:0,background:C.bg,zIndex:500,display:"flex",flexDirection:"column",overflow:"hidden" }}>

      {/* ── Sticky header: wordmark + progress ── */}
      <div style={{ flexShrink:0,padding:isMobile?"16px 20px 14px":"20px 20px 16px",textAlign:"center",borderBottom:`1px solid ${C.borderLight}`,background:C.bg }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:22,color:C.ink }}>
          Bright<span style={{color:C.amber}}>Side</span>
        </div>
        <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:C.inkLight,marginTop:2 }}>Today's Good News</div>
        {step < 3 && (
          <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:12 }}>
            {[1,2].map(n=>(
              <div key={n} style={{ width:step>=n?24:8,height:6,borderRadius:3,background:step>=n?C.amber:C.border,transition:"all 0.3s ease" }}/>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch" }}>
        <div style={{
          maxWidth:520,margin:"0 auto",
          padding:isMobile?"24px 16px 16px":"32px 24px 24px",
          opacity:exiting?0:1,
          transform:exiting?"translateY(12px)":"translateY(0)",
          transition:"all 0.3s ease",
        }}>

          {/* ── STEP 1: Categories ── */}
          {step === 1 && (
            <>
              <div style={{ textAlign:"center",marginBottom:isMobile?20:28 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?24:28,fontWeight:400,color:C.ink,lineHeight:1.2,marginBottom:8 }}>
                  What do you want<br/>more of?
                </div>
                <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6 }}>
                  Pick the sections you care about.<br/>Your feed will be built around them.
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?8:10,marginBottom:isMobile?16:24 }}>
                {CATS.map(cat => {
                  const selected = picks.has(cat.id);
                  const acc = cAcc(cat.id, dark);
                  const bg  = cBg(cat.id, dark);
                  return (
                    <button key={cat.id} onClick={()=>toggleCat(cat.id)}
                      style={{ background:selected?bg:C.surface,border:`1.5px solid ${selected?acc:C.border}`,borderRadius:12,padding:isMobile?"12px 12px":"16px 16px",cursor:"pointer",textAlign:"left",transition:"all 0.18s",position:"relative",overflow:"hidden" }}>
                      {selected && (
                        <div style={{ position:"absolute",top:8,right:8,width:20,height:20,borderRadius:"50%",background:acc,display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <Ic.Check c="#fff" s={9}/>
                        </div>
                      )}
                      <div style={{ width:isMobile?22:28,height:isMobile?22:28,borderRadius:6,background:selected?`${acc}22`:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:isMobile?7:10,transition:"all 0.18s" }}>
                        <div style={{ width:8,height:8,borderRadius:"50%",background:selected?acc:C.inkLight,transition:"all 0.18s" }}/>
                      </div>
                      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?14:16,color:selected?C.ink:C.inkMid,marginBottom:2,transition:"color 0.18s" }}>{cat.label}</div>
                      <div style={{ fontSize:isMobile?10:11,color:selected?C.inkMid:C.inkLight,lineHeight:1.4,transition:"color 0.18s" }}>{cat.desc}</div>
                    </button>
                  );
                })}
              </div>

              {picks.size===0 && (
                <div style={{ textAlign:"center" }}>
                  <button onClick={()=>{setPicks(new Set(CATS.map(c=>c.id)));goStep2();}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.inkLight,fontFamily:"'DM Sans',sans-serif",padding:"6px" }}>
                    Show me everything →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── STEP 2: Mood ── */}
          {step === 2 && (
            <>
              <div style={{ textAlign:"center",marginBottom:isMobile?20:28 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?24:28,fontWeight:400,color:C.ink,lineHeight:1.2,marginBottom:8 }}>
                  How do you want<br/>to feel reading this?
                </div>
                <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6 }}>
                  Your default mood shapes how stories are ranked.<br/>You can change it anytime.
                </div>
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:isMobile?8:10,marginBottom:isMobile?16:24 }}>
                {Object.entries(MOOD_CONFIG).map(([name, cfg]) => {
                  const selected = mood === name;
                  return (
                    <button key={name} onClick={()=>setMood(selected?null:name)}
                      style={{ background:selected?C.amberPale:C.surface,border:`1.5px solid ${selected?C.amber:C.border}`,borderRadius:12,padding:isMobile?"12px 14px":"16px 18px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,transition:"all 0.18s" }}>
                      <div style={{ width:isMobile?30:36,height:isMobile?30:36,borderRadius:"50%",background:selected?C.amber:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s" }}>
                        {selected ? <Ic.Check c="#fff" s={12}/> : <div style={{ width:8,height:8,borderRadius:"50%",background:C.inkLight }}/>}
                      </div>
                      <div>
                        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?15:17,color:selected?C.amber:C.ink,marginBottom:2,transition:"color 0.18s" }}>{name}</div>
                        <div style={{ fontSize:isMobile?11:12,color:C.inkMid,lineHeight:1.4 }}>{cfg.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ textAlign:"center" }}>
                <button onClick={()=>{setStep(1);setExiting(false);}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.inkLight,fontFamily:"'DM Sans',sans-serif",padding:"6px" }}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Ready ── */}
          {step === 3 && (
            <div style={{ textAlign:"center",paddingTop:isMobile?12:24 }}>
              <div style={{ width:isMobile?72:88,height:isMobile?72:88,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.amberLight})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:`0 0 0 14px ${C.amberPale},0 0 0 28px ${C.amberGlow}`,animation:"bsReadyPop 0.5s ease" }}>
                <Ic.Sparkle c="#fff" s={isMobile?28:36}/>
              </div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?26:30,fontWeight:400,color:C.ink,lineHeight:1.2,marginBottom:10 }}>
                Your BrightSide<br/>is ready
              </div>
              <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.7,marginBottom:24 }}>
                Built around {picks.size>0?`${picks.size} section${picks.size>1?"s":""}`:"all sections"}
                {mood?` and sorted for a ${mood} mindset`:""}.
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center" }}>
                {(picks.size>0?[...picks]:CATS.map(c=>c.id)).map(id => {
                  const cat = CATS.find(c=>c.id===id);
                  const acc = cAcc(id,dark);
                  const bg  = cBg(id,dark);
                  return (
                    <span key={id} style={{ background:bg,border:`1px solid ${acc}44`,borderRadius:20,padding:"4px 11px",fontSize:12,fontWeight:600,color:acc }}>
                      {cat?.label}
                    </span>
                  );
                })}
                {mood && (
                  <span style={{ background:C.amberPale,border:`1px solid ${C.amberMid}`,borderRadius:20,padding:"4px 11px",fontSize:12,fontWeight:600,color:C.amber }}>
                    {mood}
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Sticky CTA pinned to bottom ── */}
      <div style={{ flexShrink:0,padding:"12px 16px",background:C.bg,borderTop:`1px solid ${C.border}`,paddingBottom:`calc(12px + env(safe-area-inset-bottom, 0px))` }}>
        {step === 1 && (
          <button onClick={picks.size>0?goStep2:undefined}
            style={{ width:"100%",background:C.amber,color:"#fff",border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,cursor:picks.size===0?"default":"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em",opacity:picks.size===0?0.45:1,transition:"all 0.15s" }}>
            {picks.size===0?"Select at least one section":`Continue with ${picks.size} section${picks.size>1?"s":""}`}
          </button>
        )}
        {step === 2 && (
          <button onClick={goStep3}
            style={{ width:"100%",background:C.amber,color:"#fff",border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>
            {mood?`Start with ${mood} mood`:"Continue without a default mood"}
          </button>
        )}
        {step === 3 && (
          <button onClick={finish}
            style={{ width:"100%",background:C.ink,color:dark?C.bg:"#fff",border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em",transition:"all 0.2s" }}>
            Take me to my feed
          </button>
        )}
      </div>

    </div>
  );
}
