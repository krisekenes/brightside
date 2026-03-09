import { cAcc, cBg } from "../lib/theme";
import { Ic } from "../icons";

export default function StoryRail({ title, subtitle, stories, lovedSet, onLove, onOpen, C, dark }) {
  return (
    <section style={{ marginBottom:40 }}>
      <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:14 }}>
        <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,fontWeight:400,color:C.ink,margin:0 }}>{title}</h2>
        {subtitle&&<span style={{ fontSize:12,color:C.inkLight }}>{subtitle}</span>}
      </div>
      <div className="bs-rail">
        {stories.map(s=>{
          const acc=cAcc(s.category,dark), bg=cBg(s.category,dark);
          return (
            <div key={s.id} onClick={()=>onOpen(s)} className="bs-card bs-rail-card" style={{ background:bg,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",flexShrink:0 }}>
              <div style={{ height:3,background:`linear-gradient(90deg,${acc},${acc}88)` }}/>
              <div style={{ padding:"15px 15px 13px" }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:acc,marginBottom:6 }}>{s.tag}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,fontWeight:400,lineHeight:1.4,color:C.ink,marginBottom:9 }}>{s.title}</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ fontSize:11,color:C.inkLight }}>{s.source}</span>
                  <button onClick={e=>{e.stopPropagation();onLove(s.id);}} style={{ display:"flex",alignItems:"center",gap:4,background:lovedSet.has(s.id)?C.amberPale:C.surface,border:`1px solid ${lovedSet.has(s.id)?C.amber:C.border}`,borderRadius:20,padding:"3px 8px",cursor:"pointer",transition:"all 0.15s" }}>
                    <Ic.Heart c={lovedSet.has(s.id)?C.amber:C.inkLight} f={lovedSet.has(s.id)} s={11}/>
                    <span style={{ fontSize:11,fontWeight:600,color:lovedSet.has(s.id)?C.amber:C.inkLight }}>{(s.loves+(lovedSet.has(s.id)?1:0)).toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
