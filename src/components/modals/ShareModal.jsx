import { useState } from "react";
import Modal from "./Modal";
import { cAcc, cBg } from "../../lib/theme";
import { Ic } from "../../icons";

export default function ShareModal({ story, onClose, C, dark }) {
  const [copied,setCopied]=useState(false);
  const acc=cAcc(story.category,dark), bg=cBg(story.category,dark);
  return (
    <Modal onClose={onClose} C={C}>
      <div style={{ background:bg,padding:"28px 26px 22px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:8 }}>{story.tag}</div>
        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:17,lineHeight:1.35,color:C.ink,marginBottom:12 }}>{story.title}</div>
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
