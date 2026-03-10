import Modal from "./Modal";

export default function HowWeFilterModal({ onClose, C }) {
  return (
    <Modal onClose={onClose} C={C} maxWidth={480}>
      <div style={{ background:C.amberPale,padding:"26px 26px 20px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.amber,marginBottom:7 }}>Transparency</div>
        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:21,color:C.ink,lineHeight:1.3,marginBottom:6 }}>How we filter the news</div>
        <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6 }}>Every story on BrightSide passes through the same transparent system.</div>
      </div>

      <div style={{ padding:"20px 26px",overflowY:"auto",maxHeight:"58vh" }}>
        {/* Sentiment tiers */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:10 }}>Sentiment scoring</div>
          <div style={{ fontSize:13,color:C.inkMid,lineHeight:1.6,marginBottom:14 }}>
            Each story is scored by Google's Natural Language API on a scale from −1 (very negative) to +1 (very positive). Only stories above a baseline threshold are shown.
          </div>
          {[
            {score:"≥ 0.65",label:"Auto-approved",desc:"Goes straight into your feed.",col:"#3D9970",bg:"#EEF7F1"},
            {score:"0.45 – 0.65",label:"Editorial review",desc:"A human reads it before it's published.",col:"#C4991A",bg:"#FEF9E6"},
            {score:"< 0.45",label:"Rejected",desc:"Not shown on BrightSide.",col:"#B85450",bg:"#FBF0F0"},
          ].map(({score,label,desc,col,bg})=>(
            <div key={label} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"12px 14px",background:bg,borderRadius:10,marginBottom:8,border:`1px solid ${col}22` }}>
              <div style={{ background:col,color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1 }}>{score}</div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#1C1917",marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:12,color:"#57534E" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What we never show */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:10 }}>What we never show</div>
          {["Disasters, tragedies, or mass casualty events","Crime, violence, or graphic content","Partisan attack stories or political outrage","Celebrity gossip or clickbait","Stories designed to generate anxiety or fear"].map(item=>(
            <div key={item} style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:8 }}>
              <div style={{ width:4,height:4,borderRadius:"50%",background:C.inkLight,flexShrink:0,marginTop:6 }}/>
              <span style={{ fontSize:13,color:C.inkMid,lineHeight:1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Hiding note */}
        <div style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px" }}>
          <div style={{ fontSize:12,fontWeight:700,color:C.ink,marginBottom:5 }}>When you hide a story</div>
          <div style={{ fontSize:12,color:C.inkMid,lineHeight:1.7 }}>
            Hiding removes a story from your current session only. It is <em>not</em> sent back as a negative signal — hiding represents preference, not quality. Only editorial flags affect scoring.
          </div>
        </div>
      </div>

      <div style={{ padding:"14px 26px 20px",borderTop:`1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ width:"100%",background:C.ink,color:C.bg,border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Got it</button>
      </div>
    </Modal>
  );
}
