export default function FeedSkeleton({ C, isMobile }) {
  const shimmer = {
    background: `linear-gradient(90deg, ${C.border} 25%, ${C.surfaceAlt} 50%, ${C.border} 75%)`,
    backgroundSize: "200% 100%",
    animation: "bsShimmer 1.4s ease infinite",
    borderRadius: 6,
  };

  const Block = ({ w = "100%", h = 14, style = {} }) => (
    <div style={{ ...shimmer, width: w, height: h, borderRadius: 6, flexShrink: 0, ...style }} />
  );

  const CardSkeleton = ({ hero = false }) => (
    <div style={{
      background: C.surface,
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      overflow: "hidden",
      ...(hero ? { minHeight: isMobile ? "auto" : 280 } : {}),
    }}>
      <div style={{ height: 3, background: C.border }} />
      <div style={{ padding: hero ? (isMobile ? "18px 18px 14px" : "30px 34px") : "17px 17px 0" }}>
        <Block w={60} h={10} style={{ marginBottom: hero ? 14 : 10 }} />
        <Block w="90%" h={hero ? (isMobile ? 22 : 28) : 15} style={{ marginBottom: 8 }} />
        {hero && <Block w="75%" h={hero ? 28 : 15} style={{ marginBottom: 16 }} />}
        <Block w="65%" h={13} style={{ marginBottom: hero ? 0 : 8 }} />
        {!hero && <Block w="45%" h={13} style={{ marginTop: 6, marginBottom: 14 }} />}
      </div>
      <div style={{
        padding: isMobile ? "12px 18px 14px" : "11px 17px 13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${C.border}`,
        marginTop: hero ? 20 : 0,
        background: "rgba(128,128,128,0.03)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <Block w={80} h={10} />
          <Block w={60} h={9} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Block w={64} h={isMobile ? 36 : 28} style={{ borderRadius: 20 }} />
          <Block w={isMobile ? 36 : 28} h={isMobile ? 36 : 28} style={{ borderRadius: 8 }} />
          <Block w={isMobile ? 36 : 28} h={isMobile ? 36 : 28} style={{ borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hero skeleton */}
      <section style={{ marginBottom: isMobile ? 24 : 40 }}>
        <Block w={80} h={10} style={{ marginBottom: 12 }} />
        <CardSkeleton hero />
      </section>

      {/* Grid skeletons */}
      <section>
        <Block w={100} h={10} style={{ marginBottom: 16 }} />
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(285px,1fr))",
          gap: isMobile ? 11 : 15,
        }}>
          {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}
