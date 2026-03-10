// ─── EMPTY STATES ─────────────────────────────────────────────────────────────
// Three distinct situations, each with a specific message and recovery action.
export default function EmptyState({ reason, C, onClearSearch, onExpandRadius, onOpenSettings, onSwitchCategory, activeCategory, radiusKm }) {
  const config = {
    search: {
      headline: "No results found",
      body: "Try different words, or browse your full feed instead.",
      cta: "Clear search",
      action: onClearSearch,
      secondary: null,
    },
    local: {
      headline: `Nothing within ${radiusKm} km`,
      body: "There aren't any local stories that close right now — try widening your radius.",
      cta: "Expand to 100 km",
      action: onExpandRadius,
      secondary: null,
    },
    category: {
      headline: "All stories hidden",
      body: "You've hidden all the stories in this section. Check another section or adjust your preferences.",
      cta: "Go back to Your Feed",
      action: onSwitchCategory,
      secondary: { label:"Edit sections", action: onOpenSettings },
    },
    mood: {
      headline: "No stories match this mood",
      body: "Your mood filter is narrowing the feed to zero. Try a different mood or browse all sections.",
      cta: "Browse without a mood",
      action: onSwitchCategory,
      secondary: null,
    },
  };

  const { headline, body, cta, action, secondary } = config[reason] || config.category;

  return (
    <div style={{ textAlign:"center", padding:"80px 16px 40px" }}>
      {/* Subtle icon */}
      <div style={{ width:52, height:52, borderRadius:"50%", background:C.surfaceAlt, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.inkLight} strokeWidth="1.5" strokeLinecap="round">
          {reason === "search"
            ? <><circle cx="9" cy="9" r="6"/><line x1="14" y1="14" x2="18" y2="18"/><line x1="6" y1="9" x2="12" y2="9"/></>
            : reason === "local"
            ? <><circle cx="10" cy="9" r="5"/><path d="M10 14v4M10 2v2"/><path d="M3 16s2-3 7-3 7 3 7 3"/></>
            : <><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/><circle cx="10" cy="14" r="0.8" fill={C.inkLight}/></>
          }
        </svg>
      </div>
      <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:22, color:C.inkMid, marginBottom:8 }}>{headline}</div>
      <div style={{ fontSize:14, color:C.inkLight, lineHeight:1.7, maxWidth:300, margin:"0 auto 28px" }}>{body}</div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <button onClick={action} style={{ background:C.amber, color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
          {cta}
        </button>
        {secondary && (
          <button onClick={secondary.action} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, color:C.inkMid, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}
