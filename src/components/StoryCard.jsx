import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

// ─── STORY CARD ───────────────────────────────────────────────────────────────
export default function StoryCard({ story, loved, saved, onLove, onSave, onShare, onUnsee, onClick, C, dark, delay=0 }) {
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
