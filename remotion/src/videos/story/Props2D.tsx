import React from "react";

// Ink-style hand-held props. Origin (0,0) = the grip point; +x = away from the body, -y = up.
const INK = "#1d1a20";
const S = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
type K = { re: RegExp; node: React.ReactNode; hand?: number };

const KINDS: K[] = [
  { re: /sword|blade|dagger|machete|saber|sabre|knife/, node: <g {...S}><path d="M 0 -4 L 150 -6 L 172 0 L 150 6 L 0 4 Z" fill="#dfe6ea" /><path d="M 4 -3 L 150 -3" stroke="#fff" strokeWidth="3" /><rect x="-4" y="-22" width="12" height="44" rx="4" fill="#b88a3a" /><rect x="-34" y="-7" width="30" height="14" rx="6" fill="#6b3f2a" /></g> },
  { re: /spear|lance|javelin|trident/, node: <g {...S}><path d="M -90 -3 L 250 -3 L 250 3 L -90 3 Z" fill="#8a5a36" /><path d="M 250 -14 L 310 0 L 250 14 Z" fill="#dfe6ea" /></g> },
  { re: /bow|arrow/, node: <g {...S} fill="none"><path d="M 12 -95 Q 70 0 12 95" stroke={INK} strokeWidth="8" /><path d="M 12 -95 L 12 95" strokeWidth="2.5" /><path d="M -20 0 L 70 0" strokeWidth="4" /></g> },
  { re: /gun|rifle|musket|pistol|cannon/, node: <g {...S}><rect x="-10" y="-9" width="110" height="18" rx="5" fill="#4b4d55" /><rect x="-34" y="-8" width="30" height="26" rx="6" fill="#8a5a36" /></g> },
  { re: /shield/, node: <g {...S}><path d="M 6 -62 L 54 -62 L 54 0 Q 54 48 30 66 Q 6 48 6 0 Z" fill="#b53c3c" /><path d="M 30 -50 V 56" stroke="#f1d07a" /></g> },
  { re: /shovel|spade/, node: <g {...S}><path d="M -60 -3 L 200 -3 L 200 3 L -60 3 Z" fill="#8a5a36" /><path d="M 200 -22 L 262 -22 Q 285 0 262 22 L 200 22 Z" fill="#c9ced3" /></g> },
  { re: /pickaxe|axe|hammer|mallet|tool|wrench/, node: <g {...S}><path d="M -40 -4 L 110 -4 L 110 4 L -40 4 Z" fill="#8a5a36" /><path d="M 100 -30 L 140 -30 L 140 30 L 100 30 Z" fill="#b9bfc6" /></g> },
  { re: /pen|quill|brush|pencil|chalk/, node: <g {...S}><path d="M -10 0 L 56 -26 L 62 -20 L 0 8 Z" fill="#f1e6c8" /><path d="M -10 0 L -22 8 L 0 8 Z" fill={INK} /></g> },
  { re: /book|tome|diary|bible|quran|ledger|manual/, node: <g {...S}><rect x="0" y="-52" width="74" height="86" rx="6" fill="#7a3b3b" /><rect x="8" y="-44" width="58" height="70" rx="3" fill="#f4ead2" /><path d="M 18 -26 H 56 M 18 -12 H 56 M 18 2 H 48" strokeWidth="3" /></g> },
  { re: /scroll|letter|paper|map|note|document|decree|contract|poster/, node: <g {...S}><rect x="0" y="-44" width="80" height="84" rx="8" fill="#efe0b6" /><path d="M 12 -22 H 66 M 12 -8 H 66 M 12 6 H 52 M 12 20 H 60" strokeWidth="3" /></g> },
  { re: /cup|mug|glass|goblet|chalice|bottle|water|wine|tea|coffee|drink|juice|milk/, node: <g {...S}><path d="M 0 -30 L 44 -30 L 38 26 Q 22 34 6 26 Z" fill="#f1e6c8" /><path d="M 44 -18 Q 66 -14 56 8 Q 52 12 40 10" fill="none" /><path d="M 6 -18 H 40" stroke="#6f9ec9" strokeWidth="9" /></g> },
  { re: /bread|food|meat|fruit|mango|apple|egg|cake|pie|fish|corn|rice|bowl|plate|loaf|meal|feast/, node: <g {...S}><path d="M 0 0 Q 4 -34 40 -34 Q 82 -30 76 4 Q 70 30 36 30 Q 4 30 0 0 Z" fill="#d9a05a" /><path d="M 18 -14 Q 28 -4 22 8 M 40 -20 Q 50 -6 44 10" fill="none" strokeWidth="3.5" /></g> },
  { re: /coin|gold|money|cash|treasure|jewel|gem|ring/, node: <g {...S}><circle cx="18" cy="0" r="22" fill="#f1c24f" /><circle cx="18" cy="0" r="13" fill="none" stroke="#b98a24" strokeWidth="3" /></g> },
  { re: /sack|bag|basket|pouch|purse|crate|box|chest|parcel|cargo/, node: <g {...S}><path d="M 0 -10 Q -6 -50 36 -56 Q 78 -50 72 -10 Q 80 30 36 34 Q -8 30 0 -10 Z" fill="#b99565" /><path d="M 14 -48 Q 36 -34 58 -48" fill="none" strokeWidth="4" /></g> },
  { re: /torch|flame|fire|candle|lantern|lamp/, node: <g {...S}><path d="M -10 0 H 70 V 7 H -10 Z" fill="#7a5130" /><path d="M 70 0 Q 96 -30 82 -52 Q 112 -40 112 -8 Q 112 20 84 22 Q 66 18 70 0 Z" fill="#ff9a2e" /><path d="M 82 4 Q 96 -12 90 -26 Q 104 -14 98 4 Z" fill="#ffd94a" strokeWidth="0" /></g> },
  { re: /flag|banner|standard/, node: <g {...S}><path d="M -70 -3 L 150 -3 L 150 3 L -70 3 Z" fill="#8a5a36" /><path d="M 70 -3 L 70 -70 L 150 -58 L 135 -36 L 150 -12 L 70 -3 Z" fill="#c63d3d" /></g> },
  { re: /crown|tiara|helmet|hat/, node: <g {...S}><path d="M 0 20 L 4 -20 L 18 -2 L 32 -26 L 46 -2 L 60 -20 L 64 20 Z" fill="#f1c24f" /></g> },
  { re: /phone|camera|tablet|radio|device|laptop/, node: <g {...S}><rect x="0" y="-34" width="34" height="64" rx="7" fill="#33363d" /><rect x="5" y="-27" width="24" height="46" rx="3" fill="#8fd0ea" /></g> },
  { re: /ball|stone|rock|bomb|rocket|orb|globe|planet|star|moon/, node: <g {...S}><circle cx="24" cy="0" r="26" fill="#d9d4c7" /><path d="M 8 -10 Q 24 -2 40 -10" fill="none" strokeWidth="3" /></g> },
  { re: /rope|chain|whip|net|leash/, node: <g {...S} fill="none"><path d="M 0 0 Q 40 -40 80 0 T 160 0" strokeWidth="8" stroke="#8a5a36" /></g> },
  { re: /oar|paddle|staff|stick|cane|wand|scepter|sceptre|broom/, node: <g {...S}><path d="M -70 -3 L 170 -3 L 170 3 L -70 3 Z" fill="#8a5a36" /><circle cx="176" cy="0" r="14" fill="#f1c24f" /></g> },
  { re: /key|lock/, node: <g {...S}><circle cx="8" cy="0" r="14" fill="#f1c24f" /><path d="M 20 0 H 70 M 56 0 V 14 M 68 0 V 12" fill="none" /></g> },
  { re: /telescope|spyglass|binocular/, node: <g {...S}><path d="M 0 -10 L 100 -16 L 100 16 L 0 10 Z" fill="#b88a3a" /><rect x="88" y="-20" width="20" height="40" rx="4" fill="#4a4c55" /></g> },
];
const FALLBACK = (name: string) => <g {...S}><rect x="0" y="-32" width="64" height="64" rx="10" fill="#d8b77a" /><text x="32" y="12" textAnchor="middle" fontSize="34" fontFamily="Arial Black,sans-serif" fill={INK} stroke="none">{(name[0] ?? "?").toUpperCase()}</text></g>;

export const PropIcon: React.FC<{ name: string; scale?: number }> = ({ name, scale = 1 }) => {
  const n = name.toLowerCase();
  const k = KINDS.find((q) => q.re.test(n));
  return <g transform={`scale(${scale})`}>{k ? k.node : FALLBACK(n)}</g>;
};
export const hasPropIcon = (name: string) => KINDS.some((q) => q.re.test(name.toLowerCase()));
