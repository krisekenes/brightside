// ─── THEME TOKENS ──────────────────────────────────────────────────────────────
export const LIGHT = {
  amber:"#E8651A", amberLight:"#F5A05A", amberPale:"#FEF0E6", amberMid:"#F7C89B", amberGlow:"rgba(232,101,26,0.12)",
  ink:"#1C1917", inkMid:"#57534E", inkLight:"#A8A29E", inkFaint:"#D6CFC7",
  bg:"#FDFAF6", surface:"#FFFFFF", surfaceAlt:"#F7F3ED", border:"#EFE9DF", borderLight:"#F5F0E8",
  overlay:"rgba(28,25,23,0.65)", shadow:"rgba(28,25,23,0.10)", shadowMd:"rgba(28,25,23,0.18)",
};
export const DARK = {
  amber:"#F5813A", amberLight:"#FAA96A", amberPale:"#2C1A0E", amberMid:"#7A3A10", amberGlow:"rgba(245,129,58,0.18)",
  ink:"#F5F0E8", inkMid:"#C4BAB0", inkLight:"#7A7068", inkFaint:"#3A3330",
  bg:"#171412", surface:"#211D1A", surfaceAlt:"#2A2420", border:"#352F2B", borderLight:"#2C2724",
  overlay:"rgba(10,8,7,0.80)", shadow:"rgba(0,0,0,0.30)", shadowMd:"rgba(0,0,0,0.50)",
};
export const CAT_ACCENTS = {
  nature:    {light:"#3D9970",dark:"#4DB882",bg_l:"#EEF7F1",bg_d:"#0D1F16"},
  discover:  {light:"#7C52C8",dark:"#9B75E0",bg_l:"#F5F0FB",bg_d:"#1A1228"},
  community: {light:"#C4991A",dark:"#E0B830",bg_l:"#FEF9E6",bg_d:"#221C05"},
  wellness:  {light:"#38A169",dark:"#52C285",bg_l:"#F0FAF4",bg_d:"#0C1F14"},
  world:     {light:"#3B72C4",dark:"#6293E0",bg_l:"#EDF3FB",bg_d:"#0E1828"},
  politics:  {light:"#4472B8",dark:"#6A96D8",bg_l:"#F0F4FB",bg_d:"#0F1624"},
  local:     {light:"#E8651A",dark:"#F5813A",bg_l:"#FEF0E6",bg_d:"#200E04"},
  ideas:     {light:"#B85490",dark:"#D878B0",bg_l:"#FBF0F5",bg_d:"#1F0D18"},
};
export const cAcc = (cat,dark) => dark?(CAT_ACCENTS[cat]?.dark||"#F5813A"):(CAT_ACCENTS[cat]?.light||"#E8651A");
export const cBg  = (cat,dark) => dark?(CAT_ACCENTS[cat]?.bg_d||"#1A1412"):(CAT_ACCENTS[cat]?.bg_l||"#FEF0E6");
