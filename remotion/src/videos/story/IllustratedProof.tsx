import React from "react";
import { Stickman } from "./Stickman2D";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const toLocal = (w: [number, number], gx: number, facing: 1 | -1): [number, number] => [((w[0] - gx) * facing) / 1.18, (w[1] - 1560) / 1.18];

export const IllustratedProof: React.FC = () => {
  const f = useCurrentFrame();
  const approach = smooth((f - 12) / 44);
  const exchange = smooth((f - 75) / 44);
  // Release the giver first; the recipient then lowers the hand with the coin.
  const giverRelease = smooth((f - 122) / 30);
  const receiverRelease = smooth((f - 132) / 30);
  // The coin travels from the giver's fingertips to the receiver's fingertips.
  // Push toward the handover, then ease back to re-establish the whole setting.
  const zoom = interpolate(f, [0, 55, 100, 145, 179], [1, 1.08, 1.2, 1.14, 1.08], {
    easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const pan = interpolate(f, [0, 100, 179], [0, -28, 0], {
    easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cameraY = interpolate(f, [0, 55, 100, 145, 179], [1050, 1100, 1190, 1130, 1050], {
    easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const walk = mix(f / 30, 1.85, smooth((f - 45) / 20));
  const giverReach = approach * (1 - giverRelease);
  const receiverReach = approach * (1 - receiverRelease);
  const SC = 1.18, GY = 1560, GX = 410, RX = 690;
  const M: [number, number] = [550, 1175];
  const standA = smooth((f - 40) / 20);
  const restHand = (gx: number, dir: 1 | -1): [number, number] => [gx + dir * 40, GY - 215 * SC];
  const gHand = lerp2(restHand(GX, 1), M, giverReach);
  const rHand = lerp2(restHand(RX, -1), [M[0] + 16, M[1] + 4], receiverReach);
  const coinPos: [number, number] = f < 80 ? [gHand[0] + 14, gHand[1]] : f < 124 ? [mix(gHand[0], rHand[0], exchange) + 8, mix(gHand[1], rHand[1], exchange)] : [rHand[0] - 14, rHand[1]];
  const coinOp = interpolate(f, [58, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
          <pattern id="stoneLines" width="92" height="64" patternUnits="userSpaceOnUse">
            <path d="M0 12 L42 10 L48 30 L0 34Z M52 8 L90 12 L92 34 L50 30Z M0 40 L26 36 L31 62 L0 64Z M36 39 L90 37 L92 64 L32 64Z" fill="none" stroke="#704b3c" strokeWidth="4" opacity=".42"/>
            <path d="M4 15 L38 13 M56 12 L86 15 M5 44 L23 42 M42 43 L84 42" fill="none" stroke="#f1c68b" strokeWidth="2.5" opacity=".34"/>
          </pattern>
          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
          <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="11" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer>
          </filter>
        </defs>
        <g>
          {/* One camera transform drives the complete illustrated world, not only the actors. */}
          <g transform={`translate(${540 + pan} ${cameraY}) scale(${zoom}) translate(-540 -${cameraY})`}>
          <rect width="1080" height="1920" fill="url(#sky)"/>
          <circle cx="865" cy="260" r="118" fill="#fff4c8" opacity=".72"/>
          <circle cx="865" cy="260" r="88" fill="url(#sun)"/>
          <g fill="#fff" opacity=".42"><ellipse cx="205" cy="300" rx="120" ry="28"/><ellipse cx="270" cy="286" rx="72" ry="35"/><ellipse cx="720" cy="440" rx="110" ry="23"/></g>
          <path d="M0 850 Q160 670 330 820 Q500 620 700 820 Q880 650 1080 800 V1250 H0Z" fill="#829c68"/>
          <path d="M0 930 Q170 810 345 940 Q520 770 710 930 Q880 800 1080 920 V1340 H0Z" fill="#607f58"/>
          <path d="M0 1110 Q240 1000 440 1110 Q690 970 900 1100 Q1000 1040 1080 1080 V1920 H0Z" fill="#d9b879"/>
          <g transform="translate(0 0)">
            <ellipse cx="385" cy="1034" rx="355" ry="38" fill="#65443a" opacity=".18" filter="url(#softShadow)"/>
            <path d="M70 1030 Q100 760 350 735 Q570 720 690 1010Z" fill="url(#stone)" stroke="#65443a" strokeWidth="14"/>
            <path d="M70 1030 Q100 760 350 735 Q570 720 690 1010Z" fill="url(#stoneLines)" opacity=".96"/>
            <path d="M210 940 Q240 680 400 650 Q530 680 555 940Z" fill="#c58c59" stroke="#65443a" strokeWidth="13"/>
            <path d="M210 940 Q240 680 400 650 Q530 680 555 940Z" fill="url(#stoneLines)" opacity=".96"/>
            <path d="M340 895 L355 820 L372 750 L388 675 L405 610 Q420 555 440 545 Q460 555 475 610 L492 675 L508 750 L525 820 L540 895Z" fill="#b87c50" stroke="#65443a" strokeWidth="13"/>
            <path d="M340 895 L355 820 L372 750 L388 675 L405 610 Q420 555 440 545 Q460 555 475 610 L492 675 L508 750 L525 820 L540 895Z" fill="url(#stoneLines)"/>
            <path d="M360 820 Q440 842 520 820 M377 750 Q440 770 503 750 M393 680 Q440 700 487 680 M410 612 Q440 628 470 612" fill="none" stroke="#754b3a" strokeWidth="7" opacity=".52"/>
            <path d="M105 1030 Q112 955 160 955 Q208 955 215 1030Z" fill="#3f2d2b" stroke="#65443a" strokeWidth="10"/>
            <path d="M40 1030 Q380 1080 720 1020" fill="none" stroke="#f0c48b" strokeWidth="26"/>
            <g transform="translate(125 850)">
              <path d="M0 165 Q-12 82 0 0" fill="none" stroke="#60432e" strokeWidth="22"/>
              <path d="M-105 0 Q-82 -42 -48 -38 Q-20 -88 8 -56 Q42 -82 70 -42 Q108 -34 105 0 Q56 25 -105 0Z" fill="#54794b" stroke="#3e6343" strokeWidth="9"/>
              <path d="M-72 -8 Q-44 -45 -20 -28 Q4 -64 30 -31 Q64 -45 82 -7" fill="none" stroke="#7e9b5a" strokeWidth="10" opacity=".72"/>
              <g fill="#6d8c52"><circle cx="-55" cy="-12" r="25"/><circle cx="5" cy="-45" r="24"/><circle cx="55" cy="-18" r="22"/></g>
            </g>
            <g transform="translate(930 900)">
              <path d="M0 175 Q-8 90 0 0" fill="none" stroke="#60432e" strokeWidth="24"/>
              <path d="M-112 -6 Q-82 -55 -45 -43 Q-12 -98 20 -58 Q60 -82 85 -40 Q122 -30 112 8 Q60 30 -112 -6Z" fill="#52784b" stroke="#3e6343" strokeWidth="9"/>
              <path d="M-70 -8 Q-35 -48 -8 -28 Q24 -65 48 -30 Q75 -45 94 -4" fill="none" stroke="#7e9b5a" strokeWidth="10" opacity=".7"/>
              <g fill="#6d8c52"><circle cx="-62" cy="-16" r="24"/><circle cx="12" cy="-47" r="26"/><circle cx="65" cy="-15" r="23"/></g>
            </g>
            <g transform="translate(790 990)">
              <path d="M-72 42 Q-60 -48 0 -58 Q62 -48 72 42Z" fill="#b77c4c" stroke="#65443a" strokeWidth="9"/>
              <path d="M-88 -4 Q0 -112 88 -4" fill="#8b5739" stroke="#65443a" strokeWidth="10"/>
              <path d="M-62 12 Q0 -54 62 12" fill="none" stroke="#e2b577" strokeWidth="8"/>
              <path d="M-28 42 V-8 M28 42 V-8" stroke="#593c30" strokeWidth="8"/>
            </g>
          </g>
          <path d="M0 1230 Q180 1170 330 1235 T660 1220 T1080 1210 V1920 H0Z" fill="#c9965c"/>
          <path d="M0 1230 Q180 1170 330 1235 T660 1220 T1080 1210 V1920 H0Z" fill="url(#grain)"/>
          <g stroke="#8c7045" strokeWidth="7" strokeLinecap="round" opacity=".55">
            <path d="M42 1545 q-18 -35 -28 -42 M42 1545 q8 -45 24 -58 M42 1545 q22 -28 40 -30 M230 1450 q-12 -28 -24 -36 M230 1450 q12 -40 26 -48 M790 1540 q-14 -36 -28 -42 M790 1540 q12 -40 27 -50 M1030 1495 q-14 -30 -26 -34 M1030 1495 q12 -38 26 -44"/>
          </g>
          <g fill="#8c7857" stroke="#6f5941" strokeWidth="4" opacity=".75">
            <path d="M260 1320 l20 -16 28 10 8 22 -36 12Z M735 1410 l18 -18 27 8 9 20 -38 14Z M930 1300 l14 -12 21 8 7 17 -27 10Z"/>
          </g>
          <g opacity=".48" fill="#fff0ce"><path d="M0 1370 Q200 1300 380 1370 T760 1360 T1080 1350" fill="none" stroke="#fff0ce" strokeWidth="9"/><path d="M0 1530 Q240 1460 490 1535 T1080 1510" fill="none" stroke="#fff0ce" strokeWidth="7"/></g>
          <g transform="translate(90 1450)">
            <ellipse cx="0" cy="0" rx="90" ry="23" fill="#61422f" opacity=".18"/>
            <path d="M-54 -10 Q-45 -115 0 -130 Q50 -112 58 -10Z" fill="#c27c48" stroke="#51382e" strokeWidth="10"/>
            <path d="M-35 -70 Q0 -100 38 -70 M-48 -38 Q0 -20 52 -38" fill="none" stroke="#e8bb7a" strokeWidth="10"/>
            <ellipse cx="2" cy="-128" rx="22" ry="8" fill="#70432f" stroke="#51382e" strokeWidth="7"/>
          </g>
          <g transform="translate(890 1470)">
            <ellipse cx="0" cy="0" rx="82" ry="20" fill="#61422f" opacity=".2"/>
            <path d="M-56 -6 Q-48 -88 0 -100 Q48 -88 56 -6Z" fill="#b77b46" stroke="#51382e" strokeWidth="9"/>
            <path d="M-46 -42 Q0 -24 46 -42 M-35 -68 Q0 -54 35 -68 M-25 -8 L-18 -88 M0 -6 V-98 M25 -8 L18 -88" fill="none" stroke="#e9bc78" strokeWidth="7"/>
            <path d="M-42 -82 Q0 -142 42 -82" fill="none" stroke="#51382e" strokeWidth="8"/>
          </g>
          <g transform="translate(965 1430)"><path d="M0 0 Q-30 -180 0 -270" fill="none" stroke="#62412e" strokeWidth="24"/><g fill="#527b4c"><circle cx="-35" cy="-270" r="70"/><circle cx="35" cy="-310" r="75"/><circle cx="0" cy="-360" r="70"/></g></g>
          <g transform={`translate(${540 + pan} ${cameraY}) scale(${zoom}) translate(-540 -${cameraY})`}>
            <Stickman x={GX} y={GY} scale={SC} facing={1} skin="#8b5139" cloth="#315f59" trim="#e8bd73" stand={standA} walk={walk} frame={f} lean={3 * giverReach}
              frontHand={toLocal(gHand, GX, 1)} build="lean" grip={f > 128} expression={f < 60 ? "smile" : f < 118 ? "joy" : "smile"} look={0.6} />
            <Stickman x={RX} y={GY} scale={SC} facing={-1} skin="#a86645" cloth="#9b493d" trim="#edc06c" stand={standA} walk={walk + .3} frame={f + 17} lean={3 * receiverReach}
              frontHand={toLocal(rHand, RX, -1)} build="stocky" grip={f > 128} expression={f < 70 ? "focused" : f < 128 ? "shock" : "joy"} look={0.6} />
            <g transform={`translate(${coinPos[0]} ${coinPos[1]})`} opacity={coinOp}>
              <ellipse rx="22" ry="22" fill="#9b6428" stroke="#382b2a" strokeWidth="7"/>
              <circle r="14" fill="#f8d36d" stroke="#fff0ad" strokeWidth="3"/>
              <path d="M-8 0 Q0 -8 8 0 Q0 8 -8 0" fill="none" stroke="#a56a2a" strokeWidth="3"/>
            </g>
          </g>
          </g>
          <g transform="translate(540 1790)"><rect x="-200" y="-48" width="400" height="82" rx="24" fill="#352a30" opacity=".9"/><text x="0" y="8" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="38" fill="#fff2d5">GOLD FOR THE COAST</text></g>
          <rect width="1080" height="1920" fill="#8a6748" opacity=".08" filter="url(#paperGrain)"/>
          <rect width="1080" height="1920" fill="none" stroke="#fff2d5" strokeWidth="24"/>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 58, right: 58, top: 88, opacity: capOpacity, fontFamily: "Arial Black, Impact, sans-serif", fontSize: 54, fontWeight: 900, color: "#fff4dc", textAlign: "center", textShadow: "0 5px 0 #56382f, 0 10px 22px #4d352b" }}>GREAT ZIMBABWE</div>
    </AbsoluteFill>
  );
};
