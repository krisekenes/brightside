import { cAcc, cBg } from "../../lib/theme";
import { Ic } from "../../icons";

export default function StoryModal({ story, onClose, onUnsee, C, dark }) {
  const acc=cAcc(story.category,dark), bg=cBg(story.category,dark);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:C.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16,backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:16,overflow:"hidden",maxWidth:560,width:"100%",maxHeight:"92vh",overflowY:"auto",boxShadow:`0 24px 64px ${C.shadowMd}`,border:`1px solid ${C.border}` }}>
        <div style={{ background:bg,padding:"32px 30px 24px",position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,background:"rgba(128,128,128,0.12)",border:"none",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16,color:C.inkMid,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:10 }}>{story.tag}</div>
          <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:24,fontWeight:600,lineHeight:1.2,color:C.ink,letterSpacing:"-0.02em" }}>{story.title}</div>
        </div>
        <div style={{ padding:"22px 30px 30px" }}>
          <div style={{ fontSize:14,lineHeight:1.8,color:C.inkMid,marginBottom:16,fontStyle:"italic",borderLeft:`3px solid ${acc}`,paddingLeft:14 }}>{story.summary}</div>
          <div style={{ fontSize:14,lineHeight:1.85,color:C.inkMid,marginBottom:22 }}>{story.body}</div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11,color:C.inkLight }}>{story.source} · {story.time} · {story.readTime} read</div>
            <button onClick={()=>{onUnsee(story.id);onClose();}} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,color:C.inkLight,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Hide story</button>
          </div>
        </div>
      </div>
    </div>
  );
}
