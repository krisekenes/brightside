import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

// ─── STORY CARD ───────────────────────────────────────────────────────────────
export default function StoryCard({ story, loved, saved, onLove, onSave, onShare, onUnsee, onClick, onTagClick, C, dark, delay=0, justLovedId, isMobile }) {
  const acc=cAcc(story.category,dark), bg=cBg(story.category,dark);
  const btnSz = isMobile ? 44 : 30;
  const summaryLen = isMobile ? 130 : 105;
  return (
    <article onClick={onClick} className="bs-card" style={{ background:bg,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,cursor:"pointer",animationDelay:`${delay}s`,display:"flex",flexDirection:"column" }}>
      <div style={{ height:3,background:`linear-gradient(90deg,${acc},${acc}88)` }}/>
      <div style={{ padding:isMobile?"18px 18px 0":"17px 17px 0",flex:1 }}>
        <div onClick={e=>{e.stopPropagation();onTagClick?.(story.tag);}} style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:7,cursor:"pointer",display:"inline-block" }}>{story.tag}</div>
        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?17:15,fontWeight:500,lineHeight:1.35,color:C.ink,marginBottom:8,letterSpacing:"-0.01em" }}>{story.title}</div>
        <div style={{ fontSize:13,lineHeight:1.7,color:C.inkMid }}>{story.summary.substring(0,summaryLen)}{story.summary.length>summaryLen?"…":""}</div>
      </div>
      <div style={{ padding:isMobile?"12px 18px 14px":"11px 17px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,marginTop:13,background:"rgba(128,128,128,0.03)" }}>
        <div>
          <div style={{ fontSize:11,color:C.inkLight }}>{story.source}</div>
          <div style={{ fontSize:10,color:C.inkFaint }}>{story.time} · {story.readTime}</div>
        </div>
        <div style={{ display:"flex",gap:isMobile?6:5,alignItems:"center" }} onClick={e=>e.stopPropagation()}>
          <button aria-label={loved?"Unlike story":"Love story"} onClick={onLove} style={{ display:"flex",alignItems:"center",gap:5,padding:isMobile?"9px 12px":"5px 9px",borderRadius:20,background:loved?C.amberPale:C.surface,border:`1px solid ${loved?C.amber:C.border}`,cursor:"pointer",transition:"all 0.15s",minHeight:btnSz }}>
            <span style={{ display:"inline-flex",animation:justLovedId===story.id?"bsHeartPop 0.35s ease":undefined }}><Ic.Heart c={loved?C.amber:C.inkLight} f={loved}/></span>
            <span style={{ fontSize:11,fontWeight:600,color:loved?C.amber:C.inkLight }}>{(story.loves+(loved?1:0)).toLocaleString()}</span>
          </button>
          <button aria-label={saved?"Remove bookmark":"Bookmark story"} onClick={onSave} style={{ width:btnSz,height:btnSz,borderRadius:8,background:saved?C.amberPale:C.surface,border:`1px solid ${saved?C.amber:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}><Ic.Bookmark c={saved?C.amber:C.inkLight} f={saved}/></button>
          <button aria-label="Share story" onClick={onShare} style={{ width:btnSz,height:btnSz,borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic.Share c={C.inkLight}/></button>
          {!isMobile&&<button aria-label="Hide story" onClick={onUnsee} style={{ width:btnSz,height:btnSz,borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic.Eye c={C.inkLight}/></button>}
        </div>
      </div>
    </article>
  );
}
