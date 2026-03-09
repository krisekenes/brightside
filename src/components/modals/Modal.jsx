import { useEffect } from "react";

// ─── MODAL BASE ───────────────────────────────────────────────────────────────
export default function Modal({ onClose, children, C, maxWidth=440 }) {
  useEffect(()=>{ const h=e=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[onClose]);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:C.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20,backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:16,overflow:"hidden",maxWidth,width:"100%",boxShadow:`0 24px 64px ${C.shadowMd}`,border:`1px solid ${C.border}` }}>{children}</div>
    </div>
  );
}
