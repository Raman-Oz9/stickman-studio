import React from "react";
import { getBoard } from "./Story";

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
  { re: /quill.*ink|inkpot|inkwell|quill_inkpot/, node: <g {...S}><path d="M 0 0 Q -25 -35 -40 -60 Q -15 -45 5 -10 Z" fill="#f0f4f8" /><path d="M 0 0 L -38 -58" stroke={INK} strokeWidth="2" /><path d="M 14 6 L 36 6 L 40 28 L 10 28 Z" fill="#363942" /><rect x="18" y="0" width="14" height="6" fill="#25272e" /><path d="M 14 18 Q 25 14 36 18" stroke="#4a89dc" strokeWidth="3" strokeLinecap="round" opacity="0.8" /></g> },
  { re: /paintbrush|paint_brush/, node: <g {...S}><path d="M -30 0 L 25 0" stroke="#8a5a36" strokeWidth="7" strokeLinecap="round" /><rect x="25" y="-5" width="12" height="10" fill="#a0a4ab" /><path d="M 37 -5 Q 52 0 52 0 Q 37 5 37 5 Z" fill="#d93838" /></g> },
  { re: /pen|quill|brush|pencil|chalk/, node: <g {...S}><path d="M -10 0 L 56 -26 L 62 -20 L 0 8 Z" fill="#f1e6c8" /><path d="M -10 0 L -22 8 L 0 8 Z" fill={INK} /></g> },
  { re: /book|tome|diary|bible|quran|ledger|manual/, node: <g {...S}><rect x="0" y="-52" width="74" height="86" rx="6" fill="#7a3b3b" /><rect x="8" y="-44" width="58" height="70" rx="3" fill="#f4ead2" /><path d="M 18 -26 H 56 M 18 -12 H 56 M 18 2 H 48" strokeWidth="3" /></g> },
  { re: /scroll|letter|paper|map|note|document|decree|contract|poster/, node: <g {...S}><rect x="0" y="-44" width="80" height="84" rx="8" fill="#efe0b6" /><path d="M 12 -22 H 66 M 12 -8 H 66 M 12 6 H 52 M 12 20 H 60" strokeWidth="3" /></g> },
  { re: /cup|mug|glass|goblet|chalice|bottle|water|wine|tea|coffee|drink|juice|milk/, node: <g {...S}><path d="M 0 -30 L 44 -30 L 38 26 Q 22 34 6 26 Z" fill="#f1e6c8" /><path d="M 44 -18 Q 66 -14 56 8 Q 52 12 40 10" fill="none" /><path d="M 6 -18 H 40" stroke="#6f9ec9" strokeWidth="9" /></g> },
  { re: /jug|pitcher|urn|jar|water_jug/, node: <g {...S}><path d="M 8 -18 Q -10 -10 2 12" fill="none" stroke="#8a4f28" strokeWidth="6" /><path d="M 12 -24 L 28 -24 L 38 -12 Q 46 0 42 18 Q 36 28 20 28 Q 4 28 0 18 Q -4 0 4 -12 Z" fill="#b86b35" /><rect x="10" y="-28" width="18" height="6" rx="2" fill="#9c5525" /></g> },
  { re: /plate.*meat|meat.*plate|roast_meat|steak_plate/, node: <g {...S}><ellipse cx="32" cy="6" rx="36" ry="14" fill="#e8ecef" /><ellipse cx="32" cy="6" rx="28" ry="10" fill="#d0d7de" /><path d="M 10 2 Q 15 -22 36 -20 Q 58 -18 54 4 Q 38 14 10 2 Z" fill="#8b3a2b" /><path d="M 50 -10 L 68 -16 M 68 -20 A 3 3 0 1 1 70 -14 A 3 3 0 1 1 65 -12" fill="#f4ead2" stroke={INK} strokeWidth="3" /></g> },
  { re: /bread|food|meat|fruit|mango|apple|egg|cake|pie|fish|corn|rice|bowl|plate|loaf|meal|feast/, node: <g {...S}><path d="M 0 0 Q 4 -34 40 -34 Q 82 -30 76 4 Q 70 30 36 30 Q 4 30 0 0 Z" fill="#d9a05a" /><path d="M 18 -14 Q 28 -4 22 8 M 40 -20 Q 50 -6 44 10" fill="none" strokeWidth="3.5" /></g> },
  { re: /coin|gold|money|cash|treasure|jewel|gem|ring/, node: <g {...S}><circle cx="18" cy="0" r="22" fill="#f1c24f" /><circle cx="18" cy="0" r="13" fill="none" stroke="#b98a24" strokeWidth="3" /></g> },
  { re: /sack|bag|basket|pouch|purse|crate|box|chest|parcel|cargo/, node: <g {...S}><path d="M 0 -10 Q -6 -50 36 -56 Q 78 -50 72 -10 Q 80 30 36 34 Q -8 30 0 -10 Z" fill="#b99565" /><path d="M 14 -48 Q 36 -34 58 -48" fill="none" strokeWidth="4" /></g> },
  { re: /lantern|oil_lamp/, node: <g {...S}><circle cx="20" cy="-20" r="8" fill="none" stroke="#3a3d45" strokeWidth="4" /><path d="M 6 -12 L 34 -12 L 28 -4 L 12 -4 Z" fill="#3a3d45" /><rect x="8" y="-4" width="24" height="32" rx="3" fill="#ffea9f" opacity="0.9" /><path d="M 20 8 Q 24 0 20 -2 Q 16 0 20 8 Z" fill="#ff9a2e" opacity="0.9" /><rect x="4" y="28" width="32" height="6" rx="2" fill="#3a3d45" /><path d="M 8 -4 V 28 M 32 -4 V 28 M 20 -4 V 28" stroke="#3a3d45" strokeWidth="3" fill="none" /></g> },
  { re: /candle|candlestick|taper/, node: <g {...S}><path d="M -8 18 H 36 L 32 10 H -4 Z" fill="#d49e35" /><path d="M -8 14 Q -18 14 -14 2 Q -10 -10 -4 10" fill="none" stroke="#d49e35" strokeWidth="4" /><rect x="8" y="-30" width="12" height="40" rx="2" fill="#f4ebd0" /><path d="M 14 -30 V -35" stroke={INK} strokeWidth="2" /><path d="M 14 -36 Q 20 -46 14 -52 Q 8 -46 14 -36 Z" fill="#ff9a2e" /><path d="M 14 -38 Q 17 -44 14 -48 Q 11 -44 14 -38 Z" fill="#ffd94a" strokeWidth="0" /></g> },
  { re: /torch|flame|fire/, node: <g {...S}><path d="M -10 0 H 70 V 7 H -10 Z" fill="#7a5130" /><path d="M 70 0 Q 96 -30 82 -52 Q 112 -40 112 -8 Q 112 20 84 22 Q 66 18 70 0 Z" fill="#ff9a2e" /><path d="M 82 4 Q 96 -12 90 -26 Q 104 -14 98 4 Z" fill="#ffd94a" strokeWidth="0" /><circle cx="98" cy="-12" r="3" fill="#ffd94a" strokeWidth="0" /></g> },
  { re: /flag|banner|standard/, node: <g {...S}><path d="M -70 -3 L 150 -3 L 150 3 L -70 3 Z" fill="#8a5a36" /><path d="M 70 -3 L 70 -70 L 150 -58 L 135 -36 L 150 -12 L 70 -3 Z" fill="#c63d3d" /></g> },
  { re: /crown|tiara|helmet|hat/, node: <g {...S}><path d="M 0 20 L 4 -20 L 18 -2 L 32 -26 L 46 -2 L 60 -20 L 64 20 Z" fill="#f1c24f" /></g> },
  { re: /phone|camera|tablet|radio|device|laptop/, node: <g {...S}><rect x="0" y="-34" width="34" height="64" rx="7" fill="#33363d" /><rect x="5" y="-27" width="24" height="46" rx="3" fill="#8fd0ea" /></g> },
  { re: /ball|stone|rock|bomb|rocket|orb|globe|planet|star|moon/, node: <g {...S}><circle cx="24" cy="0" r="26" fill="#d9d4c7" /><path d="M 8 -10 Q 24 -2 40 -10" fill="none" strokeWidth="3" /></g> },
  { re: /net|fishing_net|catch_net/, node: <g {...S}><path d="M -20 0 L 10 0" stroke="#7a5130" strokeWidth="6" /><ellipse cx="42" cy="0" rx="32" ry="22" fill="none" stroke="#7a5130" strokeWidth="6" /><path d="M 12 0 Q 42 50 72 0 M 20 5 Q 42 45 64 5 M 24 -5 Q 42 40 60 -5 M 30 0 V 38 M 42 0 V 42 M 54 0 V 38" fill="none" stroke="#d5c8ab" strokeWidth="2.5" /></g> },
  { re: /rope|chain|whip|leash/, node: <g {...S} fill="none"><path d="M 0 0 Q 40 -40 80 0 T 160 0" strokeWidth="8" stroke="#8a5a36" /></g> },
  { re: /oar|paddle|staff|stick|cane|wand|scepter|sceptre|broom/, node: <g {...S}><path d="M -70 -3 L 170 -3 L 170 3 L -70 3 Z" fill="#8a5a36" /><circle cx="176" cy="0" r="14" fill="#f1c24f" /></g> },
  { re: /key_ring|keyring|keys|key_chain/, node: <g {...S}><circle cx="12" cy="0" r="14" fill="none" stroke="#8a8d93" strokeWidth="5" /><path d="M 12 14 V 42 M 12 32 H 20 M 12 38 H 18" stroke="#f1c24f" strokeWidth="4" strokeLinecap="round" /><path d="M 22 8 L 42 28 M 34 20 L 40 14 M 38 24 L 44 18" stroke="#d49e35" strokeWidth="4" strokeLinecap="round" /><path d="M 2 10 L -12 34 M -6 24 L 0 20" stroke="#a0a4ab" strokeWidth="3.5" strokeLinecap="round" /></g> },
  { re: /key|lock/, node: <g {...S}><circle cx="8" cy="0" r="14" fill="#f1c24f" /><path d="M 20 0 H 70 M 56 0 V 14 M 68 0 V 12" fill="none" /></g> },
  { re: /telescope|spyglass|binocular/, node: <g {...S}><path d="M 0 -10 L 100 -16 L 100 16 L 0 10 Z" fill="#b88a3a" /><rect x="88" y="-20" width="20" height="40" rx="4" fill="#4a4c55" /></g> },
  { re: /hourglass|sandglass|timer/, node: <g {...S}><path d="M 0 -32 L 40 -32 L 24 -4 L 24 4 L 40 32 L 0 32 L 16 4 L 16 -4 Z" fill="#e8f4f8" opacity="0.85" /><path d="M -4 -38 H 44 V -30 H -4 Z" fill="#7a4b2a" /><path d="M -4 30 H 44 V 38 H -4 Z" fill="#7a4b2a" /><path d="M 0 -30 V 30 M 40 -30 V 30" stroke="#7a4b2a" strokeWidth="4" fill="none" /><path d="M 6 32 L 34 32 L 20 16 Z" fill="#e5b842" /><path d="M 19 -4 L 21 -4 L 21 28 L 19 28 Z" fill="#e5b842" strokeWidth="0" /></g> },
  { re: /compass|mariner_compass|pocket_compass/, node: <g {...S}><circle cx="24" cy="0" r="24" fill="#d49e35" /><circle cx="-2" cy="0" r="7" fill="none" strokeWidth="4" /><circle cx="24" cy="0" r="18" fill="#f7f3e6" /><polygon points="24,0 30,-3 24,-16 18,-3" fill="#d93838" strokeWidth="2" /><polygon points="24,0 30,3 24,16 18,3" fill="#385bd9" strokeWidth="2" /><circle cx="24" cy="0" r="3" fill="#d49e35" strokeWidth="0" /></g> },
  { re: /trumpet|bugle|horn/, node: <g {...S}><path d="M -15 -4 H 50 M -5 4 H 40 M 15 -12 H 45" stroke="#d49e35" strokeWidth="4" fill="none" /><rect x="20" y="-14" width="5" height="18" fill="#e8c36b" /><rect x="28" y="-14" width="5" height="18" fill="#e8c36b" /><rect x="36" y="-14" width="5" height="18" fill="#e8c36b" /><path d="M 50 -6 Q 70 -20 85 -24 L 85 24 Q 70 20 50 6 Z" fill="#f1c24f" /></g> },
  { re: /drum|bongo|snare|hand_drum/, node: <g {...S}><path d="M 2 -18 V 16 Q 28 26 54 16 V -18 Z" fill="#b83838" /><ellipse cx="28" cy="16" rx="26" ry="8" fill="#8c2525" /><ellipse cx="28" cy="-18" rx="26" ry="8" fill="#f4ebd0" /><path d="M 4 -16 L 16 18 L 28 -16 L 40 18 L 52 -16" fill="none" stroke="#f1c24f" strokeWidth="3" /></g> },
  { re: /lute|guitar|lyre|mandolin|ukulele/, node: <g {...S}><rect x="-35" y="-5" width="40" height="10" rx="2" fill="#6e4223" /><path d="M -48 -10 L -35 -5 L -35 5 L -48 10 Z" fill="#4a2c16" /><path d="M 5 -12 Q 35 -30 65 -22 Q 85 0 65 22 Q 35 30 5 12 Z" fill="#c48344" /><circle cx="35" cy="0" r="8" fill={INK} /><rect x="60" y="-8" width="5" height="16" fill="#4a2c16" /></g> },
  { re: /fishing_rod|fishing-rod|fishing_pole|fishingpole|rod/, node: <g {...S}><rect x="-20" y="-6" width="35" height="12" rx="4" fill="#7a5436" /><circle cx="20" cy="8" r="8" fill="#4a4d55" /><path d="M 15 -2 Q 70 -45 160 -30" fill="none" stroke="#3a3c42" strokeWidth="4" /><path d="M 160 -30 L 160 25" fill="none" stroke="#d0d5dd" strokeWidth="2" /><circle cx="160" cy="25" r="6" fill="#e63946" /></g> },
  { re: /magnifier|magnifying_glass|loupe|lens/, node: <g {...S}><path d="M 0 0 L -25 25" stroke="#6e4223" strokeWidth="8" strokeLinecap="round" /><circle cx="22" cy="-22" r="22" fill="#f1c24f" /><circle cx="22" cy="-22" r="16" fill="#d4effc" opacity="0.85" /><path d="M 14 -28 Q 20 -34 28 -32" stroke="#fff" strokeWidth="3" fill="none" /></g> },
  { re: /whistle|referee_whistle/, node: <g {...S}><circle cx="-8" cy="0" r="6" fill="none" stroke="#a0a4ab" strokeWidth="3.5" /><path d="M 0 -8 H 30 A 10 10 0 0 1 30 12 H 10 A 10 10 0 0 1 0 -8 Z" fill="#d0d5dd" /><rect x="12" y="-8" width="8" height="5" fill={INK} /><rect x="25" y="-3" width="18" height="10" rx="2" fill="#d0d5dd" /></g> },
  { re: /bell|handbell|chime/, node: <g {...S}><path d="M 0 0 L -22 -22" stroke="#7a4b2a" strokeWidth="7" strokeLinecap="round" /><path d="M -2 -2 Q 15 -18 32 -2 Q 42 18 45 22 L -15 22 Q -12 18 -2 -2 Z" fill="#f1c24f" /><circle cx="15" cy="26" r="5" fill="#8a5a20" /></g> },
  { re: /spoon|ladle/, node: <g {...S}><path d="M -25 0 L 15 0" stroke="#b0b5be" strokeWidth="5" strokeLinecap="round" /><ellipse cx="32" cy="0" rx="16" ry="10" fill="#d0d5dd" /><ellipse cx="30" cy="0" rx="12" ry="7" fill="#eaedf1" strokeWidth="0" /></g> },
  { re: /wheel|ship_wheel|steering_wheel|wagon_wheel/, node: <g {...S}><circle cx="20" cy="0" r="8" fill="#7a4b2a" /><circle cx="20" cy="0" r="28" fill="none" stroke="#6e4223" strokeWidth="7" /><path d="M 20 -36 V 36 M -16 0 H 56 M -5 -25 L 45 25 M -5 25 L 45 -25" stroke="#6e4223" strokeWidth="4" fill="none" /><circle cx="20" cy="-36" r="3" fill="#4a2c16" strokeWidth="0" /><circle cx="20" cy="36" r="3" fill="#4a2c16" strokeWidth="0" /><circle cx="-16" cy="0" r="3" fill="#4a2c16" strokeWidth="0" /><circle cx="56" cy="0" r="3" fill="#4a2c16" strokeWidth="0" /></g> },
];
const FALLBACK = (name: string) => {
  const n = name.toLowerCase();
  let customIcons: Record<string, string> | undefined;
  try {
    customIcons = getBoard()?.icons;
  } catch {}
  const svgStr = customIcons?.[n] || customIcons?.[name];
  if (svgStr) {
    return <g dangerouslySetInnerHTML={{ __html: svgStr }} />;
  }
  return <g {...S}><rect x="0" y="-32" width="64" height="64" rx="10" fill="#d8b77a" /><text x="32" y="12" textAnchor="middle" fontSize="34" fontFamily="Arial Black,sans-serif" fill={INK} stroke="none">{(name[0] ?? "?").toUpperCase()}</text></g>;
};

export const PropIcon: React.FC<{ name: string; scale?: number }> = ({ name, scale = 1 }) => {
  const n = name.toLowerCase();
  const k = KINDS.find((q) => q.re.test(n));
  return <g transform={`scale(${scale})`}>{k ? k.node : FALLBACK(n)}</g>;
};
export const hasPropIcon = (name: string) => KINDS.some((q) => q.re.test(name.toLowerCase()));
