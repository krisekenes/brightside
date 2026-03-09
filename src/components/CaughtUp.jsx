import { useState, useEffect } from "react";
import { Ic } from "../icons";

// ─── CAUGHT UP ────────────────────────────────────────────────────────────────
// Animated end-of-feed moment. Fades + rises in after a 1.8s delay so it feels
// like it appears naturally once the user has actually read through the feed.
export default function CaughtUp({ C, streak, onDigest }) {
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
