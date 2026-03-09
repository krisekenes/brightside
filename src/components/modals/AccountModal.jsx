import Modal from "./Modal";
import { CATS } from "../../lib/data";
import { cAcc, cBg } from "../../lib/theme";
import { Ic } from "../../icons";

export default function AccountModal({ onClose, C, dark, prefs, streak, lovedCount, savedCount, onResetOnboarding }) {
  return (
    <Modal onClose={onClose} C={C} maxWidth={400}>
      {/* Header */}
      <div style={{ padding:"28px 26px 20px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
          <div style={{ width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.amberLight})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fff" }}>B</span>
          </div>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:C.ink }}>Your BrightSide</div>
            <div style={{ fontSize:12,color:C.inkLight,marginTop:2 }}>Local reader · {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
          {[{label:"Day streak",value:streak},{label:"Loved",value:lovedCount},{label:"Saved",value:savedCount}].map(({label,value})=>(
            <div key={label} style={{ textAlign:"center",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px" }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:C.amber }}>{value}</div>
              <div style={{ fontSize:10,fontWeight:600,color:C.inkLight,marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences summary */}
      <div style={{ padding:"16px 26px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:10 }}>Your sections</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
          {prefs.categories.map(id=>{
            const cat=CATS.find(c=>c.id===id);
            const acc=cAcc(id,dark), bg=cBg(id,dark);
            return(<span key={id} style={{ background:bg,border:`1px solid ${acc}44`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,color:acc }}>{cat?.label}</span>);
          })}
        </div>
        {prefs.mood&&(
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.inkLight,marginBottom:6 }}>Default mood</div>
            <span style={{ background:C.amberPale,border:`1px solid ${C.amberMid}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:C.amber }}>{prefs.mood}</span>
          </div>
        )}
      </div>


      {/* Reset */}
      <div style={{ padding:"16px 26px 22px" }}>
        <button onClick={onResetOnboarding} style={{ background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",fontSize:12,fontWeight:600,color:C.inkLight,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",transition:"all 0.15s" }}>
          Reset my preferences — redo setup
        </button>
      </div>
    </Modal>
  );
}
