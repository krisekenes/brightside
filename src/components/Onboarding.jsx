import { useState } from "react";
import { CATS } from "../lib/data";
import { MOOD_CONFIG } from "../lib/mood";
import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

// ─── ONBOARDING ────────────────────────────────────────────────────────────────
export default function Onboarding({ C, dark, onComplete }) {
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
