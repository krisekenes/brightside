import { useState, useRef, useCallback } from "react";
import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

const THRESHOLD = 85;

// ─── SWIPE MODE ────────────────────────────────────────────────────────────────
export default function SwipeMode({ stories, lovedSet, onLove, onPass, onOpen, onClose, C, dark, isMobile }) {
  const [index,      setIndex]      = useState(0);
  const [drag,       setDrag]       = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir,     setFlyDir]     = useState(null); // 'left' | 'right'
  const [cardIn,     setCardIn]     = useState(true);
  const startRef  = useRef(null);
  const movedRef  = useRef(false);

  const story = stories[index];
  const done  = !story;

  const doSwipe = useCallback((dir) => {
    if (flyDir || !stories[index]) return;
    setFlyDir(dir);
    setTimeout(() => {
      if (dir === "right") onLove(stories[index].id);
      else                 onPass(stories[index].id);
      setCardIn(false);
      setIndex(i => i + 1);
      setFlyDir(null);
      setDrag({ x: 0, y: 0 });
      setTimeout(() => setCardIn(true), 80);
    }, 320);
  }, [flyDir, index, stories, onLove, onPass]);

  const onPtrDown = useCallback((e) => {
    if (flyDir || done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    setIsDragging(true);
  }, [flyDir, done]);

  const onPtrMove = useCallback((e) => {
    if (!isDragging || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) movedRef.current = true;
    setDrag({ x: dx, y: dy * 0.12 });
  }, [isDragging]);

  const onPtrUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!movedRef.current) {
      // Tap → open story
      onOpen(stories[index]);
      setDrag({ x: 0, y: 0 });
      startRef.current = null;
      return;
    }
    const dx = drag.x;
    if (Math.abs(dx) > THRESHOLD) {
      doSwipe(dx > 0 ? "right" : "left");
    } else {
      setDrag({ x: 0, y: 0 });
    }
    startRef.current = null;
  }, [isDragging, drag, doSwipe, onOpen, stories, index]);

  // Card transform values
  const dispX  = flyDir === "right" ? 640 : flyDir === "left" ? -640 : drag.x;
  const dispY  = flyDir ? -60 : drag.y;
  const rot    = dispX * 0.05;
  const loveOp = Math.max(0, Math.min(1, dispX / THRESHOLD));
  const passOp = Math.max(0, Math.min(1, -dispX / THRESHOLD));

  const cardH = isMobile ? 400 : 440;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:250,background:C.bg,display:"flex",flexDirection:"column" }}>

      {/* ── Header ── */}
      <div style={{ flexShrink:0,padding:isMobile?"14px 18px":"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface }}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:600,color:C.ink,letterSpacing:"-0.01em" }}>Discover</div>
            <span style={{ background:C.amber,color:"#fff",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:800,letterSpacing:"0.08em" }}>BETA</span>
          </div>
          <div style={{ fontSize:11,color:C.inkLight,marginTop:2 }}>Swipe right to love · left to pass</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {!done && <span style={{ fontSize:12,color:C.inkLight }}>{index + 1} / {stories.length}</span>}
          <button aria-label="Close Discover" onClick={onClose} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.inkMid }}>×</button>
        </div>
      </div>

      {/* ── Card area ── */}
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",padding:"24px 20px 0" }}>
        {done ? (
          // ── All done ──
          <div style={{ textAlign:"center",padding:"0 24px" }}>
            <div style={{ width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.amberLight})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
              <Ic.Check c="#fff" s={24}/>
            </div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:600,color:C.ink,marginBottom:10,letterSpacing:"-0.02em" }}>You've seen everything</div>
            <div style={{ fontSize:14,color:C.inkMid,lineHeight:1.7,marginBottom:28,maxWidth:280,margin:"0 auto 28px" }}>
              Stories you loved will surface higher in your feed.
            </div>
            <button onClick={onClose} style={{ background:C.amber,color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
              Back to feed
            </button>
          </div>
        ) : (
          <>
            {/* ── Background stack cards ── */}
            {[index + 2, index + 1].map((i, stackI) => {
              const s = stories[i];
              if (!s) return null;
              const scale = stackI === 0 ? 0.88 : 0.94;
              const ty    = stackI === 0 ? 22 : 11;
              const op    = stackI === 0 ? 0.4 : 0.65;
              return (
                <div key={s.id} style={{ position:"absolute",width:"100%",maxWidth:420,height:cardH,background:cBg(s.category,dark),borderRadius:16,border:`1px solid ${C.border}`,transform:`scale(${scale}) translateY(${ty}px)`,transformOrigin:"center bottom",opacity:op,pointerEvents:"none" }}/>
              );
            })}

            {/* ── Active card ── */}
            {(() => {
              const acc = cAcc(story.category, dark);
              const bg  = cBg(story.category, dark);
              return (
                <div
                  onPointerDown={onPtrDown}
                  onPointerMove={onPtrMove}
                  onPointerUp={onPtrUp}
                  onPointerCancel={onPtrUp}
                  style={{
                    position:"relative",width:"100%",maxWidth:420,height:cardH,
                    background:bg,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden",
                    transform:`translateX(${dispX}px) translateY(${dispY}px) rotate(${rot}deg)`,
                    transition: flyDir ? "transform 0.32s ease, opacity 0.32s ease" : isDragging ? "none" : "transform 0.2s ease, opacity 0.18s ease",
                    opacity:flyDir ? 0 : cardIn ? 1 : 0,
                    cursor:isDragging ? "grabbing" : "grab",
                    touchAction:"none",userSelect:"none",willChange:"transform",
                  }}
                >
                  {/* LOVE stamp */}
                  <div style={{ position:"absolute",top:22,left:18,border:`3px solid ${C.amber}`,color:C.amber,borderRadius:6,padding:"4px 12px",fontSize:15,fontWeight:800,letterSpacing:"0.06em",opacity:loveOp,transform:"rotate(-14deg)",zIndex:10,fontFamily:"'DM Sans',sans-serif",pointerEvents:"none" }}>
                    LOVE
                  </div>
                  {/* PASS stamp */}
                  <div style={{ position:"absolute",top:22,right:18,border:"3px solid #9CA3AF",color:"#9CA3AF",borderRadius:6,padding:"4px 12px",fontSize:15,fontWeight:800,letterSpacing:"0.06em",opacity:passOp,transform:"rotate(14deg)",zIndex:10,fontFamily:"'DM Sans',sans-serif",pointerEvents:"none" }}>
                    PASS
                  </div>

                  {/* Accent bar */}
                  <div style={{ height:4,background:`linear-gradient(90deg,${acc},${acc}66)` }}/>

                  {/* Content */}
                  <div style={{ padding:"20px 22px 18px",height:"calc(100% - 4px)",display:"flex",flexDirection:"column",boxSizing:"border-box" }}>
                    <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:10 }}>{story.tag}</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?19:21,fontWeight:600,lineHeight:1.25,color:C.ink,marginBottom:14,letterSpacing:"-0.02em" }}>{story.title}</div>
                    <div style={{ fontSize:14,lineHeight:1.7,color:C.inkMid,flex:1,overflow:"hidden" }}>{story.summary}</div>
                    <div style={{ marginTop:"auto",paddingTop:14,borderTop:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:11,color:C.inkLight }}>{story.source} · {story.time} · {story.readTime}</div>
                      <div style={{ fontSize:11,color:C.inkLight,marginTop:3,fontStyle:"italic" }}>Tap card to read · drag to decide</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* ── Action buttons ── */}
      {!done && (
        <div style={{ flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",gap:28,padding:isMobile?`20px 0 calc(20px + env(safe-area-inset-bottom,0px))`:"24px 0 28px" }}>
          <button aria-label="Pass" onClick={()=>doSwipe("left")} style={{ width:58,height:58,borderRadius:"50%",background:C.surface,border:`1.5px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.inkMid,transition:"all 0.15s",fontFamily:"sans-serif" }}>✕</button>
          <button aria-label="Read full story" onClick={()=>onOpen(story)} style={{ height:38,borderRadius:20,background:C.surfaceAlt,border:`1px solid ${C.border}`,cursor:"pointer",padding:"0 18px",fontSize:12,fontWeight:600,color:C.inkMid,fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>Read more</button>
          <button aria-label="Love story" onClick={()=>doSwipe("right")} style={{ width:58,height:58,borderRadius:"50%",background:C.amberPale,border:`1.5px solid ${C.amber}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
            <Ic.Heart c={C.amber} f s={22}/>
          </button>
        </div>
      )}
    </div>
  );
}
