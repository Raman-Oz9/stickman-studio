import React from "react";
type Props={frame:number;variant?:number;night?:boolean;chalkboard?:boolean;fire?:boolean};

// Miniature storybook village with a sharp action plane and softly blurred near/far layers.
export const ChickenVillageBackdrop:React.FC<Props>=({frame,variant=0,night=false,chalkboard=false,fire=false})=>{
 const flicker=Math.sin(frame*.31)*7+Math.sin(frame*.17)*4,wing=Math.sin(frame*.22)*5;
 const board=chalkboard||variant%5===3,flames=fire||night;
 return <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
 <defs>
  <linearGradient id="cv-sky" x2="0" y2="1"><stop stopColor={night?"#142D53":"#55BCEB"}/><stop offset=".7" stopColor={night?"#31537A":"#F4C56B"}/><stop offset="1" stopColor={night?"#59445C":"#FFE3A0"}/></linearGradient>
  <linearGradient id="cv-road" x2="0" y2="1"><stop stopColor="#D99A52"/><stop offset="1" stopColor="#8C5940"/></linearGradient>
  <radialGradient id="cv-glow"><stop stopColor="#FFB23F" stopOpacity=".9"/><stop offset=".5" stopColor="#F06B32" stopOpacity=".32"/><stop offset="1" stopColor="#F06B32" stopOpacity="0"/></radialGradient>
  <radialGradient id="cv-vignette"><stop offset=".48" stopColor="#111522" stopOpacity="0"/><stop offset="1" stopColor="#111522" stopOpacity={night?".55":".28"}/></radialGradient>
  <pattern id="cv-grain" width="41" height="41" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r="1.2" fill="#171717" opacity=".22"/><circle cx="29" cy="27" r="1" fill="#FFF4D8" opacity=".38"/><path d="M16 4l1 2M35 12l1 2M9 33l1 2" stroke="#171717" opacity=".16"/></pattern>
  <filter id="cv-far"><feGaussianBlur stdDeviation="5"/></filter><filter id="cv-near"><feGaussianBlur stdDeviation="2.5"/></filter><filter id="cv-fireblur"><feGaussianBlur stdDeviation="38"/></filter>
 </defs>
 <rect width="1080" height="1920" fill="url(#cv-sky)"/>
 {night?<g><circle cx="835" cy="260" r="82" fill="#FFF0B6" stroke="#171717" strokeWidth="9"/><circle cx="865" cy="235" r="76" fill="#244267"/><g fill="#FFF3C8"><circle cx="160" cy="250" r="7"/><circle cx="340" cy="390" r="5"/><circle cx="650" cy="170" r="6"/><circle cx="980" cy="500" r="5"/></g></g>:<g><circle cx="825" cy="270" r="108" fill="#FFE27A" stroke="#171717" strokeWidth="9"/><g fill="#fff" opacity=".75"><path d="M70 390q55-60 112-8 48-56 105-5 46 6 48 39H55q-15-15 15-26Z"/><path d="M680 500q55-52 106-5 44-54 93-3 43 7 46 35H665q-14-15 15-27Z"/></g></g>}
 <g filter="url(#cv-far)" stroke="#171717" strokeWidth="12" strokeLinejoin="round"><path d="M0 930V670L145 535 290 670V940Z" fill="#F1C66A"/><path d="M-25 680L145 505 315 680Z" fill="#C84F3D"/><path d="M790 925V640L930 505 1080 645V930Z" fill="#E9B95F"/><path d="M765 650L930 470 1105 650Z" fill="#C84F3D"/></g>
 <g stroke="#171717" strokeWidth="13" strokeLinejoin="round">
  <path d="M-55 1270V790L190 595 435 790V1270Z" fill="#F6D57A"/><path d="M-70 805L190 575 455 805Z" fill="#D6533D"/>
  <path d="M28 860H352M28 1110H352M190 640V1265M35 850L190 1000 345 850M35 1115L190 960 345 1115" fill="none" strokeWidth="18"/>
  <rect x="78" y="875" width="86" height="128" fill="#B8E5E7"/><rect x="246" y="875" width="86" height="128" fill="#B8E5E7"/>
  <g fill="#C84638"><rect x="64" y="865" width="30" height="145"/><rect x="148" y="865" width="30" height="145"/><rect x="232" y="865" width="30" height="145"/><rect x="316" y="865" width="30" height="145"/></g>
  <path d="M140 1270V1080Q190 1015 240 1080V1270Z" fill="#B84B37"/><circle cx="220" cy="1175" r="8" fill="#FFD85A"/>
  <path d="M675 1265V795L905 610 1135 795V1265Z" fill="#F5D27A"/><path d="M650 805L905 585 1160 805Z" fill="#C94D3B"/>
  <path d="M745 860H1065M745 1110H1065M905 635V1260M750 850L905 1000 1060 850M750 1115L905 960 1060 1115" fill="none" strokeWidth="18"/>
  <rect x="790" y="875" width="90" height="128" fill="#A9DDE2"/><rect x="930" y="875" width="90" height="128" fill="#A9DDE2"/>
  <g fill="#C84638"><rect x="775" y="865" width="30" height="145"/><rect x="865" y="865" width="30" height="145"/><rect x="915" y="865" width="30" height="145"/><rect x="1005" y="865" width="30" height="145"/></g>
  <path d="M850 1265V1080Q905 1015 960 1080V1265Z" fill="#B84B37"/><circle cx="940" cy="1175" r="8" fill="#FFD85A"/>
 </g>
 <g stroke="#171717" strokeWidth="8"><path d="M60 1020H180V1055H60Z" fill="#D95B43"/><path d="M780 1020H900V1055H780Z" fill="#D95B43"/><g fill="#F7D65F"><circle cx="78" cy="1014" r="12"/><circle cx="112" cy="1008" r="13"/><circle cx="148" cy="1014" r="12"/><circle cx="800" cy="1014" r="12"/><circle cx="835" cy="1008" r="13"/><circle cx="872" cy="1014" r="12"/></g></g>
 <path d="M300 1110L780 1110 1080 1920H0Z" fill="url(#cv-road)" stroke="#171717" strokeWidth="16"/>
 <g fill="none" stroke="#171717" strokeWidth="7" opacity=".9"><path d="M300 1110L0 1920M780 1110L1080 1920M540 1110V1920"/>{Array.from({length:15},(_,i)=>{const y=1140+i*i*3.45;return <path key={i} d={"M "+Math.max(0,390-i*29)+" "+y+" Q 540 "+(y+18+i*3)+" "+Math.min(1080,690+i*29)+" "+y}/>;})}</g>
 <g fill="#E7B77A" stroke="#171717" strokeWidth="5">{Array.from({length:7},(_,row)=>Array.from({length:8},(_,col)=>{const y=1200+row*93+col%2*18,x=110+col*124-row*7;return <path key={row+"-"+col} d={"M "+x+" "+y+"l48 -7 40 22-8 37-58 8-31-24Z"}/>;}))}</g>
 <g stroke="#171717" strokeWidth="9" strokeLinejoin="round">
  <g transform="translate(55 1325) scale(.82)"><path d="M0 100V-8L100-85 200-8V100Z" fill="#F4D16C"/><path d="M-18-5L100-112 218-5Z" fill="#D34E3D"/><rect x="70" y="18" width="62" height="82" rx="25" fill="#68412F"/><path d="M78 24L124 96M124 24L78 96M101 20V100M73 60H130" fill="none" stroke="#FFF0C5" strokeWidth="5"/></g>
  <g transform="translate(800 1340) scale(.78)"><path d="M0 100V-8L100-85 200-8V100Z" fill="#F4D16C"/><path d="M-18-5L100-112 218-5Z" fill="#D34E3D"/><rect x="70" y="18" width="62" height="82" rx="25" fill="#68412F"/><path d="M78 24L124 96M124 24L78 96M101 20V100M73 60H130" fill="none" stroke="#FFF0C5" strokeWidth="5"/></g>
  {Array.from({length:4},(_,i)=><g key={i} transform={"translate("+(300+i*112)+" "+(1480+(i%2)*45)+") scale(.43)"}><path d="M0 100V-8L100-85 200-8V100Z" fill="#F4D16C"/><path d="M-18-5L100-112 218-5Z" fill="#D34E3D"/><rect x="70" y="18" width="62" height="82" rx="25" fill="#68412F"/><path d="M78 24L124 96M124 24L78 96M101 20V100" fill="none" stroke="#FFF0C5" strokeWidth="5"/></g>)}
 </g>
 {board?<g transform="translate(360 760)" stroke="#171717" strokeWidth="13" strokeLinejoin="round"><rect width="360" height="260" rx="9" fill="#8A5736"/><rect x="22" y="22" width="316" height="216" rx="4" fill="#183D38" strokeWidth="8"/><path d="M60 70H290M60 178H290M60 70V178" fill="none" stroke="#FFF2D1" strokeWidth="5" strokeDasharray="8 8"/><path d="M92 178V130H142V178M174 178V92H224V178" fill="#F4C64D" stroke="#FFF2D1" strokeWidth="5"/><text x="180" y="58" fill="#FFF2D1" stroke="none" fontSize="28" fontWeight="900" textAnchor="middle">RICH / POOR</text><text x="95" y="215" fill="#FFF2D1" stroke="none" fontSize="20" fontWeight="bold" textAnchor="middle">2 = EGG</text><text x="240" y="215" fill="#FFF2D1" stroke="none" fontSize="20" fontWeight="bold" textAnchor="middle">3 = EGG</text><path d="M130 260V340M230 260V340M95 340H265" fill="none" strokeWidth="12"/></g>:null}
 <g transform={"translate(560 710) rotate("+(wing*.25)+")"} stroke="#171717" strokeWidth="8" strokeLinejoin="round"><path d="M-34 5Q-48-42-6-54Q38-56 43-12Q24 20-12 20Z" fill="#20252B"/><path d={"M-10-18Q-35 "+(-44-wing)+" -48 "+(-62-wing)+"Q-10 "+(-58-wing)+" 8-22Z"} fill="#353B43"/><path d="M35-30L75-17 37-5Z" fill="#F3AE3C"/><circle cx="20" cy="-32" r="5" fill="#FFF6DC" stroke="none"/><path d="M-25 18l-10 18m34-18l7 18" fill="none" strokeWidth="5"/></g>
 {flames?<g><ellipse cx="540" cy="1510" rx="260" ry="250" fill="url(#cv-glow)" filter="url(#cv-fireblur)"/><g transform="translate(540 1495)" stroke="#171717" strokeWidth="12" strokeLinejoin="round"><path d="M-130 65L130 5M-120 5L120 72" stroke="#75452E" strokeWidth="30" strokeLinecap="round"/><path d={"M-65 35Q-135-42-42-"+(150+flicker)+"Q-34-72 0-20Q12-108 65-"+(148-flicker)+"Q126-72 62 35Z"} fill="#F05A32"/><path d={"M-35 35Q-74-12-18-"+(94+flicker)+"Q-2-46 16-5Q40-75 42-"+(98-flicker)+"Q90-22 35 35Z"} fill="#FFD34E"/><path d="M-10 35Q-24 0 2-38Q23-3 12 35Z" fill="#FFF0A7"/></g></g>:null}
 <g filter="url(#cv-near)" opacity=".45"><path d="M0 1800Q250 1700 520 1810T1080 1780V1920H0Z" fill="#463A35"/></g>
 <rect width="1080" height="1920" fill="url(#cv-vignette)" pointerEvents="none"/><rect width="1080" height="1920" fill="url(#cv-grain)" opacity=".36" pointerEvents="none"/>
 <g fill="none" stroke={night?"#FFB44D":"#FFF0BA"} strokeWidth="9" strokeLinecap="round" opacity=".72"><path d="M88 545q18-30 42-2t42-1"/><path d="M900 540q16-24 32-2t32-1"/><path d="M500 560q18-28 36 0t36 0"/></g>
 </svg>;
};
