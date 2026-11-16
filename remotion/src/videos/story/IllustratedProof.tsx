import React, { useEffect, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { bodyFront, Outfit, Pen } from "../bridge/toon";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const GIVE: Outfit = { jacket: "#b66b37", pants: "#604537", boots: "#34272b", skin: "#8b5139", sash: "#e5b95f", buttons: "#e9cf91", build: "adult" };
const RECEIVE: Outfit = { jacket: "#326c68", pants: "#3f4b45", boots: "#29252b", skin: "#a86645", sash: "#d9a85b", buttons: "#e6c98b", moustache: "#34251f", build: "stout" };

type CardProps = { x: number; feet: number; facing: 1 | -1; outfit: Outfit; reachX: number; reachY: number; phase: number; expr: "neutral" | "stern" | "grin" | "laugh" | "nervous" | "shock"; seed: number };
const InkCharacter: React.FC<CardProps> = ({ x, feet, facing, outfit, reachX, reachY, phase, expr, seed }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 1000);
    const r = reachX > 0.06 || reachY > 0.06 ? [{ side: 1 as const, x: reachX, y: reachY }] : undefined;
    bodyFront(new Pen(ctx), outfit, {
      mode: reachX > 0.06 || reachY > 0.06 ? "stand" : "stroll",
      phase,
      expr,
      reach: r,
      facing,
      light: -2.1,
      seed,
      blink: f % 104 < 4 ? 1 : 0,
      look: facing === 1 ? 0.35 : -0.2,
      tilt: reachY > 0.8 ? -2 : 0,
      headTilt: reachY > 0.8 ? 1.5 : 0,
    });
  }, [f, outfit, reachX, reachY, phase, expr, facing, seed]);
  const scale = 0.68;
  return <canvas ref={ref} width={600} height={1000} style={{
    position: "absolute", left: x - 300 * scale, top: feet - 975 * scale,
    width: 600 * scale, height: 1000 * scale,
    transform: `scaleX(${facing})`, transformOrigin: "center bottom",
    overflow: "visible", pointerEvents: "none",
  }} />;
};

export const IllustratedProof: React.FC = () => {
  const f = useCurrentFrame();
  const approach = smooth((f - 16) / 46);
  const exchange = smooth((f - 76) / 42);
  const giverRelease = smooth((f - 126) / 26);
  const receiverRelease = smooth((f - 137) / 24);
  const giverReach = approach * (1 - giverRelease);
  const receiverReach = approach * (1 - receiverRelease);
  const coinX = f < 82 ? 540 : f < 126 ? mix(540, 554, exchange) : 554;
  const coinY = f < 82 ? 1210 : f < 126 ? mix(1210, 1218, exchange) : 1218;
  const zoom = interpolate(f, [0, 48, 100, 148, 179], [1, 1.035, 1.12, 1.08, 1.035], { easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pan = interpolate(f, [0, 100, 179], [0, -18, 0], { easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraY = interpolate(f, [0, 100, 179], [0, 22, 0], { easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phase = f / 30;
  const cap = f < 55 ? "GREAT ZIMBABWE" : f < 116 ? "GOLD. IVORY. TRADE." : "A KINGDOM CONNECTED.";
  const captionIn = interpolate(f, [6, 14, 160, 176], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#f3dfb5", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${pan}px,${cameraY}px) scale(${zoom})`, transformOrigin: "50% 56%" }}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="zSky" x2="0" y2="1"><stop stopColor="#69b9d2"/><stop offset=".58" stopColor="#d7e4bd"/><stop offset="1" stopColor="#f0d49a"/></linearGradient>
            <linearGradient id="zEarth" x2="0" y2="1"><stop stopColor="#d9b77d"/><stop offset="1" stopColor="#a86e48"/></linearGradient>
            <linearGradient id="zStone" x2=".2" y2="1"><stop stopColor="#e5c18a"/><stop offset=".55" stopColor="#bd8757"/><stop offset="1" stopColor="#87563e"/></linearGradient>
            <linearGradient id="zRoof" x2="0" y2="1"><stop stopColor="#a75e3b"/><stop offset="1" stopColor="#653e32"/></linearGradient>
            <pattern id="zGrain" width="31" height="31" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r="1.3" fill="#5e4637" opacity=".17"/><circle cx="22" cy="20" r="1.1" fill="#fff3d4" opacity=".36"/></pattern>
            <pattern id="zMasonry" width="100" height="65" patternUnits="userSpaceOnUse">
              <path d="M0 8 L44 5 50 28 0 33Z M56 7 L98 10 100 33 52 29Z M0 40 L29 37 34 64 0 65Z M40 39 L100 37 100 65 35 64Z" fill="none" stroke="#704b39" strokeWidth="4" opacity=".55"/>
              <path d="M5 12 L38 10 M60 13 L92 15 M5 45 L24 43 M45 44 L91 42" fill="none" stroke="#f5d4a0" strokeWidth="2.5" opacity=".5"/>
            </pattern>
            <filter id="zShadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"/></filter>
          </defs>
          <rect width="1080" height="1920" fill="url(#zSky)"/>
          <circle cx="870" cy="245" r="124" fill="#fff2c4" opacity=".55"/><circle cx="870" cy="245" r="78" fill="#ffe4a0"/>
          <g fill="#fff" opacity=".48"><path d="M80 360q65-62 130-8 52-66 116-5 56 5 60 48H70q-18-20 10-35Z"/><path d="M650 470q54-45 102-4 43-55 96-4 42 7 44 36H635q-13-16 15-28Z"/></g>
          {/* Far escarpment and layered savanna */}
          <path d="M0 880 130 760 230 825 370 690 500 820 650 700 790 825 930 715 1080 820V1260H0Z" fill="#82936a"/>
          <path d="M0 1000q170-155 330-25t330-10 420-12v430H0Z" fill="#6f8458"/>
          <path d="M0 1150q210-120 410-25t350-5 320-20v800H0Z" fill="#d7b574"/>
          {/* Great Zimbabwe stone enclosure, drawn as layered masonry not primitive blocks */}
          <g>
            <ellipse cx="540" cy="1110" rx="440" ry="70" fill="#604432" opacity=".2" filter="url(#zShadow)"/>
            <path d="M90 1110 112 935Q145 800 305 770L710 770Q900 815 970 1110Z" fill="url(#zStone)" stroke="#604333" strokeWidth="15"/>
            <path d="M90 1110 112 935Q145 800 305 770L710 770Q900 815 970 1110Z" fill="url(#zMasonry)" opacity=".92"/>
            <path d="M155 1070Q170 875 330 840L690 840Q850 875 900 1070" fill="none" stroke="#f1d09b" strokeWidth="16" opacity=".62"/>
            <path d="M220 1065Q225 905 365 890L665 890Q805 905 830 1065" fill="none" stroke="#704a39" strokeWidth="12"/>
            <path d="M220 1065Q225 905 365 890L665 890Q805 905 830 1065" fill="url(#zMasonry)" opacity=".65"/>
            {/* Conical tower and upper courses */}
            <path d="M390 1010 405 815 430 650Q445 560 470 525Q495 560 510 650L535 815 550 1010Z" fill="url(#zStone)" stroke="#604333" strokeWidth="14"/>
            <path d="M390 1010 405 815 430 650Q445 560 470 525Q495 560 510 650L535 815 550 1010Z" fill="url(#zMasonry)"/>
            <path d="M407 840Q470 860 533 840M418 750Q470 768 522 750M430 660Q470 678 510 660" fill="none" stroke="#714b38" strokeWidth="7" opacity=".62"/>
            <path d="M450 1008V910Q470 870 490 910V1008Z" fill="#44302b" stroke="#654333" strokeWidth="9"/>
            {/* Wall walk, parapet and stone gate */}
            <path d="M95 955Q530 900 960 955" fill="none" stroke="#e7c18a" strokeWidth="18"/>
            <path d="M120 900v-48h36v43m28-49v-49h34v46m32-48v-44h34v42m560 22v-44h34v50m28-55v-43h34v53" fill="none" stroke="#9b6947" strokeWidth="16"/>
          </g>
          {/* Distant homesteads and trading huts */}
          {[-1,1].map((side,i)=><g key={side} transform={`translate(${side===-1?30:760} 1020) scale(.72)`}>
            <path d="M0 130V-15Q105-110 210-15V130Z" fill="#d7b47a" stroke="#684735" strokeWidth="12"/>
            <path d="M-18-10Q105-155 228-10L210 4Q105-110 0 4Z" fill="url(#zRoof)" stroke="#55392f" strokeWidth="12"/>
            <path d="M76 130V55Q105 20 134 55V130" fill="#49332b" stroke="#684735" strokeWidth="9"/>
            <path d="M22 42H188M32 74H178" stroke="#9b7049" strokeWidth="7" opacity=".65"/>
          </g>)}
          {/* Baobab silhouettes with illustrated leaf clusters */}
          <g transform="translate(120 1200)"><path d="M0 0Q-22-130-8-250M-8-160Q-92-220-110-275M-2-190Q88-250 115-310" fill="none" stroke="#765036" strokeWidth="36" strokeLinecap="round"/><g fill="#55794b" stroke="#3d6342" strokeWidth="8"><circle cx="-105" cy="-285" r="72"/><circle cx="-36" cy="-325" r="82"/><circle cx="52" cy="-338" r="80"/><circle cx="112" cy="-305" r="70"/></g><g fill="#82a45e"><circle cx="-65" cy="-300" r="28"/><circle cx="22" cy="-350" r="33"/><circle cx="90" cy="-292" r="26"/></g></g>
          <g transform="translate(1000 1205) scale(.85)"><path d="M0 0Q-12-130 5-260M0-160Q-90-210-110-270M0-190Q80-245 110-300" fill="none" stroke="#765036" strokeWidth="34" strokeLinecap="round"/><g fill="#55794b" stroke="#3d6342" strokeWidth="8"><circle cx="-104" cy="-285" r="68"/><circle cx="-34" cy="-326" r="80"/><circle cx="48" cy="-330" r="78"/><circle cx="112" cy="-300" r="67"/></g></g>
          {/* Ground plane, path and hand-painted texture */}
          <path d="M0 1260Q240 1180 460 1260T1080 1240V1920H0Z" fill="url(#zEarth)"/>
          <path d="M0 1260Q240 1180 460 1260T1080 1240V1920H0Z" fill="url(#zGrain)"/>
          <path d="M390 1920Q460 1640 530 1380Q570 1300 650 1380Q720 1640 780 1920Z" fill="#e9cf9c" opacity=".7"/>
          <path d="M430 1920Q500 1650 560 1420M750 1920Q680 1650 620 1420" fill="none" stroke="#f6e2b8" strokeWidth="12" opacity=".65"/>
          <g fill="#967b54" opacity=".68"><path d="m180 1450 24-18 30 8 10 23-42 12Z"/><path d="m820 1530 18-18 31 7 10 24-39 12Z"/><path d="m930 1350 17-12 22 8 8 17-30 10Z"/><path d="m300 1710 20-15 24 8 6 20-34 9Z"/></g>
          <g stroke="#7b6a43" strokeWidth="7" strokeLinecap="round" opacity=".65"><path d="M65 1590q-18-35-28-42m28 42q8-45 24-58m-24 58q22-28 40-30M910 1630q-18-35-28-42m28 42q8-45 24-58m-24 58q22-28 40-30"/></g>
          {/* foreground trade goods */}
          <g transform="translate(105 1650)"><ellipse cy="0" rx="90" ry="22" fill="#4c3429" opacity=".2"/><path d="M-52-10Q-44-112 0-128 45-112 54-10Z" fill="#b87845" stroke="#52382d" strokeWidth="10"/><path d="M-37-70Q0-98 39-70M-48-38Q0-20 50-38" fill="none" stroke="#e7bc7a" strokeWidth="10"/><ellipse cy="-128" rx="22" ry="8" fill="#70432f" stroke="#52382d" strokeWidth="7"/></g>
          <g transform="translate(960 1660)"><path d="M-54-5Q-48-86 0-100 48-86 54-5Z" fill="#bd824d" stroke="#52382d" strokeWidth="9"/><path d="M-43-42Q0-24 43-42M-33-68Q0-54 33-68M-20-8V-86M0-8V-96M20-8V-86" fill="none" stroke="#edc98e" strokeWidth="7"/></g>
          <g fill="#fff1d0" opacity=".2"><path d="M0 1340Q250 1280 500 1340T1080 1320" fill="none" stroke="#fff1d0" strokeWidth="9"/><path d="M0 1540Q260 1480 540 1540T1080 1520" fill="none" stroke="#fff1d0" strokeWidth="6"/></g>
        </svg>
        <InkCharacter x={390} feet={1560} facing={1} outfit={GIVE} reachX={giverReachX} reachY={giverReachY} phase={phase} expr={f < 62 ? "grin" : f < 118 ? "laugh" : "grin"} seed={17}/>
        <InkCharacter x={690} feet={1560} facing={-1} outfit={RECEIVE} reachX={receiverReachX} reachY={receiverReachY} phase={phase + .3} expr={f < 68 ? "stern" : f < 128 ? "shock" : "grin"} seed={41}/>
        <div style={{ position:"absolute", left:coinX-27, top:coinY-27, width:54, height:54, borderRadius:"50%", background:"#8c5725", border:"8px solid #382b2a", boxSizing:"border-box", display:"grid", placeItems:"center", opacity:interpolate(f,[58,68],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}), zIndex:3 }}>
          <div style={{ width:29, height:29, borderRadius:"50%", background:"#f6d16a", border:"3px solid #fff0ad", boxSizing:"border-box", display:"grid", placeItems:"center", color:"#9b6428", fontSize:19, fontWeight:900 }}>✦</div>
        </div>
      </div>
      <div style={{ position:"absolute", left:48, right:48, top:78, textAlign:"center", fontFamily:"Arial Black, Impact, sans-serif", fontWeight:900, fontSize:56, color:"#fff4dc", WebkitTextStroke:"7px #35252b", paintOrder:"stroke fill", textShadow:"0 7px 0 #654333", opacity:captionIn }}>{cap}</div>
      <div style={{ position:"absolute", left:50, right:50, bottom:92, display:"flex", justifyContent:"center", opacity:.75 }}>
        <div style={{ width:280, height:7, borderRadius:8, background:"rgba(255,245,220,.5)", overflow:"hidden" }}><div style={{ width:`${(f/179)*100}%`, height:"100%", background:"#f8d56c" }}/></div>
      </div>
    </AbsoluteFill>
  );
};
