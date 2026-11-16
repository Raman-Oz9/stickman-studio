import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const Character: React.FC<{ x: number; y: number; scale?: number; skin: string; cloth: string; trim: string; facing?: 1 | -1; phase: number; reach: number; holding?: boolean; expression?: "smile" | "focused" }> = ({
  x, y, scale = 1, skin, cloth, trim, facing = 1, phase, reach, holding, expression = "smile",
}) => {
  const stride = Math.sin(phase * Math.PI * 2) * 17 * (1 - reach);
  const arm = mix(-18, -78, reach);
  const forearm = mix(24, 18, reach);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} stroke="#29212a" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="0" cy="12" rx="76" ry="20" fill="#3b2b2c" opacity=".18" stroke="none" />
      <g fill="none" strokeWidth="28">
        <path d={`M -25 260 Q -43 315 -35 380 L ${-37 + stride} 455`} stroke="#29212a" />
        <path d={`M -25 260 Q -43 315 -35 380 L ${-37 + stride} 455`} stroke={trim} strokeWidth="17" />
        <path d={`M 27 260 Q 44 318 35 380 L ${37 - stride} 455`} stroke="#29212a" />
        <path d={`M 27 260 Q 44 318 35 380 L ${37 - stride} 455`} stroke={cloth} strokeWidth="17" />
      </g>
      <path d="M -42 455 Q -64 466 -83 458" fill="none" stroke="#29212a" strokeWidth="27" />
      <path d="M 42 455 Q 64 466 83 458" fill="none" stroke="#29212a" strokeWidth="27" />
      <path d="M -55 118 Q -70 170 -53 267 Q 0 292 54 267 Q 70 170 55 118 Q 0 89 -55 118Z" fill={cloth} />
      <path d="M -48 135 Q 0 156 48 135" fill="none" stroke={trim} strokeWidth="9" />
      <path d="M -28 150 L -8 267 M 28 150 L 8 267" stroke={trim} strokeWidth="5" opacity=".8" />
      <path d="M -55 142 Q -100 165 -103 220" fill="none" stroke="#29212a" strokeWidth="27" />
      <path d="M -55 142 Q -100 165 -103 220" fill="none" stroke={skin} strokeWidth="17" />
      <g transform={`translate(53 142) rotate(${arm})`}>
        <path d="M 0 0 Q 20 14 40 35" fill="none" stroke="#29212a" strokeWidth="29" />
        <path d="M 0 0 Q 20 14 40 35" fill="none" stroke={skin} strokeWidth="18" />
        <g transform={`translate(40 35) rotate(${forearm})`}>
          <path d="M 0 0 Q 28 10 58 5" fill="none" stroke="#29212a" strokeWidth="26" />
          <path d="M 0 0 Q 28 10 58 5" fill="none" stroke={skin} strokeWidth="16" />
          <path d="M 58 5 q 8 -10 17 -2 q 7 8 -2 14 q -10 5 -15 -2" fill={skin} />
          {holding ? <g transform="translate(62 7)"><circle r="14" fill="#f3bd45" stroke="#29212a" strokeWidth="5" /><circle r="8" fill="none" stroke="#fff0ad" strokeWidth="3" /><path d="M-4 0 Q0 -5 4 0 Q0 5 -4 0" fill="none" stroke="#a56a2a" strokeWidth="2" /></g> : null}
        </g>
      </g>
      <path d="M -39 60 Q -38 -9 0 -20 Q 42 -10 40 60 L 33 107 Q 0 130 -33 107Z" fill={skin} />
      <path d="M -40 45 Q -48 -23 0 -33 Q 49 -25 42 44 Q 20 17 -1 18 Q -21 17 -40 45Z" fill="#2e2423" />
      <path d="M -24 56 q 10 -8 20 0 M 10 56 q 10 -8 20 0" fill="none" stroke="#29212a" strokeWidth="5" />
      <ellipse cx="-14" cy="66" rx="4" ry="7" fill="#29212a" stroke="none" />
      <ellipse cx="17" cy="66" rx="4" ry="7" fill="#29212a" stroke="none" />
      {expression === "smile" ? <path d="M -12 87 Q 0 99 14 85" fill="none" stroke="#8c3f45" strokeWidth="5" /> : <path d="M -10 94 Q 0 88 12 94" fill="none" stroke="#8c3f45" strokeWidth="5" />}
      <path d="M -34 31 Q 0 12 34 31" fill="none" stroke="#f4c36b" strokeWidth="7" />
    </g>
  );
};

export const IllustratedProof: React.FC = () => {
  const f = useCurrentFrame();
  const approach = smooth((f - 12) / 44);
  const exchange = smooth((f - 75) / 44);
  // Release the giver first; the recipient then lowers the hand with the coin.
  const giverRelease = smooth((f - 122) / 30);
  const receiverRelease = smooth((f - 132) / 30);
  const coinX = mix(537, 579, exchange);
  // The coin travels from the giver's fingertips to the receiver's fingertips.
  const coinY = 1091 - Math.sin(exchange * Math.PI) * 10;
  // Push toward the handover, then ease back to re-establish the whole setting.
  const zoom = interpolate(f, [0, 55, 100, 145, 179], [1, 1.08, 1.2, 1.14, 1.08], {
    easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const pan = interpolate(f, [0, 100, 179], [0, -28, 0], {
    easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cameraY = interpolate(f, [0, 55, 100, 145, 179], [960, 1000, 1091, 1040, 960], {
    easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const walk = mix(f / 30, 1.85, smooth((f - 45) / 20));
  const giverReach = approach * (1 - giverRelease);
  const receiverReach = approach * (1 - receiverRelease);
  const capOpacity = interpolate(f, [8, 18, 138, 158], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#f6dba6" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" role="img" aria-label="2D illustrated Great Zimbabwe trade scene">
        <defs>
          <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#79c9df"/><stop offset=".62" stopColor="#d9e9ca"/><stop offset="1" stopColor="#f7d99c"/></linearGradient>
          <linearGradient id="sun" x2="0" y2="1"><stop stopColor="#fff3c0"/><stop offset="1" stopColor="#f2a84e"/></linearGradient>
          <linearGradient id="stone" x2="0" y2="1"><stop stopColor="#d9a66a"/><stop offset="1" stopColor="#9a6044"/></linearGradient>
          <linearGradient id="cloth" x2="0" y2="1"><stop stopColor="#f4c36b"/><stop offset="1" stopColor="#c87843"/></linearGradient>
          <pattern id="grain" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r="1.4" fill="#7d563b" opacity=".16"/><circle cx="24" cy="21" r="1" fill="#fff3d4" opacity=".32"/></pattern>
          <pattern id="stoneLines" width="74" height="36" patternUnits="userSpaceOnUse"><path d="M0 18 H74 M22 0 V18 M58 18 V36" stroke="#704b3c" strokeWidth="4" opacity=".38"/></pattern>
          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
        </defs>
        <g>
          <rect width="1080" height="1920" fill="url(#sky)"/>
          <circle cx="865" cy="260" r="118" fill="#fff4c8" opacity=".72"/>
          <circle cx="865" cy="260" r="88" fill="url(#sun)"/>
          <g fill="#fff" opacity=".42"><ellipse cx="205" cy="300" rx="120" ry="28"/><ellipse cx="270" cy="286" rx="72" ry="35"/><ellipse cx="720" cy="440" rx="110" ry="23"/></g>
          <path d="M0 850 Q160 670 330 820 Q500 620 700 820 Q880 650 1080 800 V1250 H0Z" fill="#829c68"/>
          <path d="M0 930 Q170 810 345 940 Q520 770 710 930 Q880 800 1080 920 V1340 H0Z" fill="#607f58"/>
          <path d="M0 1110 Q240 1000 440 1110 Q690 970 900 1100 Q1000 1040 1080 1080 V1920 H0Z" fill="#d9b879"/>
          <g transform="translate(0 0)">
            <path d="M70 1030 Q100 760 350 735 Q570 720 690 1010Z" fill="url(#stone)" stroke="#65443a" strokeWidth="14"/>
            <path d="M70 1030 Q100 760 350 735 Q570 720 690 1010Z" fill="url(#stoneLines)" opacity=".9"/>
            <path d="M210 940 Q240 680 400 650 Q530 680 555 940Z" fill="#c58c59" stroke="#65443a" strokeWidth="13"/>
            <path d="M210 940 Q240 680 400 650 Q530 680 555 940Z" fill="url(#stoneLines)" opacity=".9"/>
            <path d="M340 895 Q350 565 440 555 Q520 570 525 895Z" fill="#b87c50" stroke="#65443a" strokeWidth="13"/>
            <path d="M340 895 Q350 565 440 555 Q520 570 525 895Z" fill="url(#stoneLines)"/>
            <path d="M420 910 Q425 780 480 780 Q530 790 535 910Z" fill="#402e2c"/>
            <path d="M40 1030 Q380 1080 720 1020" fill="none" stroke="#f0c48b" strokeWidth="26"/>
            <g fill="#4f7650"><circle cx="120" cy="790" r="70"/><circle cx="930" cy="850" r="100"/><circle cx="1010" cy="810" r="70"/></g>
            <g stroke="#3d6146" strokeWidth="16"><path d="M120 850 v150 M930 900 v170 M1010 860 v170"/></g>
          </g>
          <path d="M0 1230 Q180 1170 330 1235 T660 1220 T1080 1210 V1920 H0Z" fill="#c9965c"/>
          <path d="M0 1230 Q180 1170 330 1235 T660 1220 T1080 1210 V1920 H0Z" fill="url(#grain)"/>
          <g opacity=".48" fill="#fff0ce"><path d="M0 1370 Q200 1300 380 1370 T760 1360 T1080 1350" fill="none" stroke="#fff0ce" strokeWidth="9"/><path d="M0 1530 Q240 1460 490 1535 T1080 1510" fill="none" stroke="#fff0ce" strokeWidth="7"/></g>
          <g transform="translate(90 1450)"><ellipse cx="0" cy="0" rx="90" ry="23" fill="#61422f" opacity=".18"/><path d="M-54 -10 Q-45 -115 0 -130 Q50 -112 58 -10Z" fill="#c27c48" stroke="#51382e" strokeWidth="10"/><path d="M-35 -70 Q0 -100 38 -70" fill="none" stroke="#e8bb7a" strokeWidth="10"/></g>
          <g transform="translate(965 1430)"><path d="M0 0 Q-30 -180 0 -270" fill="none" stroke="#62412e" strokeWidth="24"/><g fill="#527b4c"><circle cx="-35" cy="-270" r="70"/><circle cx="35" cy="-310" r="75"/><circle cx="0" cy="-360" r="70"/></g></g>
          <g transform={`translate(${540 + pan} ${cameraY}) scale(${zoom}) translate(-540 -${cameraY})`}>
            <Character x={430 - approach * 22} y={1030} scale={1.03} skin="#8b5139" cloth="#315f59" trim="#e8bd73" phase={walk} reach={giverReach} holding={false} expression="smile" />
            <Character x={690 + approach * 18} y={1030} scale={1.03} skin="#a86645" cloth="#9b493d" trim="#edc06c" facing={-1} phase={walk + .3} reach={receiverReach} holding={f >= 128} expression="focused" />
            <g transform={`translate(${coinX} ${coinY})`} opacity={interpolate(f, [72, 82, 132, 145], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
              <ellipse rx="20" ry="11" fill="#9b6428" stroke="#382b2a" strokeWidth="7"/>
              <ellipse rx="14" ry="7" fill="#f8d36d" stroke="#fff0ad" strokeWidth="3"/>
              <path d="M-8 0 Q0 -8 8 0 Q0 8 -8 0" fill="none" stroke="#a56a2a" strokeWidth="3"/>
            </g>
          </g>
          <g transform="translate(540 1670)"><rect x="-200" y="-48" width="400" height="82" rx="24" fill="#352a30" opacity=".9"/><text x="0" y="8" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="38" fill="#fff2d5">GOLD FOR THE COAST</text></g>
          <rect width="1080" height="1920" fill="none" stroke="#fff2d5" strokeWidth="24"/>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 58, right: 58, top: 88, opacity: capOpacity, fontFamily: "Arial Black, Impact, sans-serif", fontSize: 54, fontWeight: 900, color: "#fff4dc", textAlign: "center", textShadow: "0 5px 0 #56382f, 0 10px 22px #4d352b" }}>GREAT ZIMBABWE</div>
    </AbsoluteFill>
  );
};
