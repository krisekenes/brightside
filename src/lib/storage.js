// ─── PERSIST HELPERS ───────────────────────────────────────────────────────────
export const LS = {
  get: (k, fallback=null) => { try { const v=localStorage.getItem(k); return v!=null?JSON.parse(v):fallback; } catch { return fallback; } },
  set: (k, v)             => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
