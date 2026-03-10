import { useState } from "react";
import Modal from "./Modal";
import { STORIES } from "../../lib/data";
import { cAcc, cBg } from "../../lib/theme";
import { Ic } from "../../icons";

export default function DigestModal({ onClose, C, dark }) {
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
          <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:21,color:C.ink,lineHeight:1.3,marginBottom:6 }}>Start every morning with good news</div>
          <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6 }}>A curated briefing delivered at the time that suits you.</div>
        </>}
        {preview&&<div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,color:C.ink }}>Here's what your digest looks like</div>}
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
          <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:19,color:C.ink,marginBottom:6 }}>You're subscribed</div>
          <div style={{ fontSize:13,color:C.inkMid,marginBottom:16,lineHeight:1.6 }}>First digest arrives tomorrow {freq==="morning"?"at 7am":freq==="afternoon"?"at noon":"at 8pm"}.</div>
          <button onClick={onClose} style={{ background:C.ink,color:dark?C.bg:"#fff",border:"none",borderRadius:8,padding:"10px 26px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Close</button>
        </div>}
      </div>}

      {preview&&(
        <div style={{ maxHeight:"58vh",overflowY:"auto" }}>
          {/* Email preview */}
          <div style={{ background:"#FDFAF6",fontFamily:"'DM Sans',sans-serif" }}>
            <div style={{ background:"#E8651A",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,color:"#fff" }}>BrightSide</div>
              <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:"rgba(255,255,255,0.75)" }}>TODAY'S GOOD NEWS</div>
            </div>
            <div style={{ padding:"20px 24px 14px",borderBottom:"1px solid #EFE9DF" }}>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,color:"#1C1917",marginBottom:4 }}>Good {freq==="evening"?"evening":freq==="afternoon"?"afternoon":"morning"}.</div>
              <div style={{ fontSize:12,color:"#A8A29E" }}>{previewDate}</div>
            </div>
            <div style={{ padding:"16px 24px" }}>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#A8A29E",marginBottom:12 }}>Today's top stories</div>
              {previewStories.map(s=>{
                const acc=cAcc(s.category,false), bg=cBg(s.category,false);
                return(
                  <div key={s.id} style={{ background:bg,borderRadius:8,padding:"14px 16px",marginBottom:10,border:"1px solid #EFE9DF" }}>
                    <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:5 }}>{s.tag}</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:14,color:"#1C1917",lineHeight:1.35,marginBottom:6 }}>{s.title}</div>
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
