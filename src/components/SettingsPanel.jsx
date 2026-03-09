import { useState, useEffect } from "react";
import { CATS } from "../lib/data";
import { MOOD_CONFIG } from "../lib/mood";
import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
export default function SettingsPanel({ C, dark, prefs, onUpdate, onClose, onResetOnboarding, onHowWeFilter }) {
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
