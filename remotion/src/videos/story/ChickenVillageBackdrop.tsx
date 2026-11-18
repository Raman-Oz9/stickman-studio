import React from "react";

type Props = { variant: number; frame: number; cue?: string };

const ink = "#332b2a";
const cream = "#f2dfb8";
const red = "#b94e3e";
const teal = "#315b5c";
const gold = "#e6b64e";
const brown = "#87583d";

/** Story-specific illustrated village plates. The foreground action stays in Story2D. */
export const ChickenVillageBackdrop: React.FC<Props> = ({ variant, frame, cue = "" }) => {
  const text = cue.toLowerCase();
  const night = /night|dark|fire|cold|hungry|sleep/.test(text) || variant === 3;
  const board = /teach|lesson|rich|poor|egg|count|price|two|three/.test(text) || variant === 1;
  const aerial = /village|many|crowd|every|whole|hundred|thousand|settlement|rows/.test(text) || variant === 4;
  const coop = /coop|farm|hatch|nest|lay|chicken|hen|rooster/.test(text) || variant === 2;
  const yard = /yard|market|stall|sell|buy|trade/.test(text) || variant === 5;
  const bob = Math.sin(frame / 13) * 5;
  return <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="cvSky" x2="0" y2="1"><stop stopColor={night ? "#243b50" : "#79b6c0"}/><stop offset=".72" stopColor={night ? "#526176" : "#d5c39a"}/><stop offset="1" stopColor={night ? "#6d574e" : "#ead8b4"}/></linearGradient>
      <linearGradient id="cvRoad" x2="0" y2="1"><stop stopColor="#d7c39c"/><stop offset="1" stopColor="#a88c68"/></linearGradient>
      <pattern id="cvCobble" width="94" height="58" patternUnits="userSpaceOnUse"><path d="M5 9Q24 1 43 9L47 25Q27 34 7 25ZM53 34Q72 25 89 35L91 50Q70 58 52 50Z" fill="none" stroke="#806c56" strokeWidth="3" opacity=".55"/></pattern>
      <pattern id="cvTimber" width="90" height="76" patternUnits="userSpaceOnUse"><path d="M0 0L90 76M90 0L0 76M45 0V76" fill="none" stroke="#694634" strokeWidth="8"/></pattern>
      <filter id="cvSoft"><feGaussianBlur stdDeviation="13"/></filter>
      <filter id="cvShadow"><feGaussianBlur stdDeviation="20"/></filter>
    </defs>
    <rect width="1080" height="1920" fill="url(#cvSky)"/>
    {night ? <><circle cx="835" cy="245" r="92" fill="#f3e6c4"/><g fill="#fff0c6" opacity=".75"><circle cx="130" cy="230" r="5"/><circle cx="390" cy="170" r="4"/><circle cx="640" cy="340" r="4"/><circle cx="970" cy="460" r="5"/></g></> :
      <><circle cx="855" cy="245" r="112" fill="#ffe4a0"/><g fill="#fff7e5" opacity=".65"><path d="M75 410q44-54 98-5 45-50 95-2 34 7 35 34H60q-15-14 15-27Z"/><path d="M650 480q45-48 96-4 42-48 88-1 36 6 39 31H635q-12-12 15-26Z"/></g></>}
    {/* distant village silhouette */}
    <g opacity=".55" fill={night ? "#344450" : "#8e8b78"}><path d="M0 920V700l100-95 100 95v220ZM220 920V660l120-110 120 110v260ZM750 920V680l120-120 120 120v240Z"/></g>
    {/* tall red-roofed houses framing the street */}
    <g stroke={ink} strokeWidth="15" strokeLinejoin="round">
      <path d="M-55 1170V530L165 360 390 530V1170Z" fill={cream}/>
      <path d="M-90 550L165 300 425 550L390 580 165 390 0 560Z" fill={red}/>
      <path d="M690 1160V520L885 355 1090 520V1160Z" fill={cream}/>
      <path d="M660 535L885 300 1120 540L1080 575 885 390 705 570Z" fill={red}/>
    </g>
    <g stroke={brown} strokeWidth="11" fill="none"><path d="M0 570L330 570M0 850L390 850M690 560L1080 560M690 840L1080 840"/><path d="M80 390V1170M250 390V1170M760 390V1160M1000 390V1160"/></g>
    <g fill={teal} stroke={ink} strokeWidth="10"><rect x="62" y="650" width="92" height="145" rx="8"/><rect x="235" y="650" width="92" height="145" rx="8"/><rect x="760" y="640" width="92" height="145" rx="8"/><rect x="935" y="640" width="92" height="145" rx="8"/></g>
    <g fill="none" stroke="#e8c98e" strokeWidth="8"><path d="M108 650V795M62 723H154M281 650V795M235 723H327M806 640V785M760 712H852M981 640V785M935 712H1027"/></g>
    {/* converging cobbled lane */}
    <path d="M390 840L690 840 1080 1920H0Z" fill="url(#cvRoad)" stroke={ink} strokeWidth="12"/>
    <path d="M390 840L690 840 1080 1920H0Z" fill="url(#cvCobble)" opacity=".75"/>
    <path d="M510 840L570 840 690 1920H390Z" fill="#ead7b5" opacity=".28"/>
    {/* rows of little coops and fenced runs */}
    <g stroke={ink} strokeWidth="10" strokeLinejoin="round">
      <path d="M-10 1250V1030l125-100 125 100v220Z" fill="#d5ad72"/><path d="M-25 1040L115 900 255 1040Z" fill={red}/>
      <path d="M825 1260V1035l115-95 115 95v225Z" fill="#d5ad72"/><path d="M805 1045L940 910 1075 1045Z" fill={red}/>
    </g>
    <g stroke={brown} strokeWidth="8" fill="none"><path d="M0 1320L260 1320M0 1380L270 1380M830 1320H1080M820 1380H1080"/><path d="M25 1290V1430M100 1290V1430M175 1290V1430M900 1290V1430M980 1290V1430"/></g>
    {/* teacher's board / lesson insert */}
    {board && <g transform="translate(300 760)" stroke={ink} strokeWidth="14" strokeLinejoin="round">
      <rect x="0" y="0" width="480" height="355" rx="18" fill="#654832"/>
      <rect x="22" y="22" width="436" height="300" rx="8" fill="#244b46"/>
      <g fill="#fff2d2" stroke="none" fontFamily="Arial, sans-serif" fontWeight="900" textAnchor="middle">
        <text x="240" y="95" fontSize="58">RICH  /  POOR</text><text x="240" y="180" fontSize="48">2 = EGG</text><text x="240" y="250" fontSize="48">3 = EGG</text>
      </g>
      <path d="M110 350V480M370 350V480" stroke={brown} strokeWidth="18"/>
    </g>}
    {/* elevated settlement: repeating coop roofs create legible scale */}
    {aerial && <g stroke={ink} strokeWidth="8" strokeLinejoin="round">
      {Array.from({ length: 5 }, (_, row) => Array.from({ length: 4 }, (_, col) => {
        const x = 65 + col * 245 + (row % 2) * 28, y = 1030 + row * 145;
        return <g key={row + "-" + col} transform={`translate(${x} ${y}) scale(${1 - row * .08})`}><path d="M0 65V0L70-55 140 0V65Z" fill="#d7b47d"/><path d="M-12 5L70-75 152 5" fill="none" stroke={red} strokeWidth="24"/><rect x="50" y="26" width="40" height="39" fill={teal}/></g>;
      }))}
    </g>}
    {/* coin pile is a story object, not random decoration */}
    {yard && <g stroke={ink} strokeWidth="9">
      <ellipse cx="530" cy="1500" rx="245" ry="80" fill="#8b5c2e"/>
      {Array.from({ length: 9 }, (_, k) => <ellipse key={k} cx={390 + (k % 3) * 140} cy={1430 + Math.floor(k / 3) * 42} rx="62" ry="25" fill={gold}/>)}
      <path d="M530 1300v-160" stroke={brown} strokeWidth="13"/>
    </g>}
    {/* night firelight and stacked logs */}
    {night && <g>
      <ellipse cx="540" cy="1580" rx="330" ry="210" fill="#e48b3c" opacity=".2" filter="url(#cvSoft)"/>
      <g stroke={ink} strokeWidth="12" strokeLinecap="round"><path d="M385 1610L690 1660M390 1660L680 1605M420 1690L655 1690" stroke={brown} strokeWidth="30"/><path d="M515 1600Q420 1480 535 1350Q565 1450 615 1475Q685 1530 580 1620Z" fill="#e58b39"/><path d="M535 1590Q500 1510 560 1430Q570 1500 600 1520Q630 1570 565 1610Z" fill="#ffd36b"/></g>
    </g>}
    {/* a few readable chickens in the midground */}
    <g stroke={ink} strokeWidth="9" strokeLinejoin="round" transform={`translate(0 ${bob})`}>
      {[{x:190,y:1500,s:.9},{x:850,y:1480,s:1.05},{x:735,y:1190,s:.68}].map((p,j)=><g key={j} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
        <ellipse cx="0" cy="0" rx="64" ry="48" fill="#f5eee0"/><circle cx="38" cy="-48" r="34" fill="#f5eee0"/><path d="M20-77q-12-35 9-34 18-2 19 19 19-24 31-7 9 14-15 31" fill={red}/><path d="M69-48l42 13-42 12Z" fill={gold}/><circle cx="48" cy="-54" r="5" fill={ink} stroke="none"/><path d="M-18 42v28m38-28v28" stroke={brown} strokeWidth="9"/><path d="M-64-8q-40-30-45 8 25 17 45 8" fill="#ddd0b7"/>
      </g>)}
    </g>
    {/* crow mascot, perched on the right roofline */}
    <g transform={`translate(900 ${500 + Math.sin(frame / 18) * 4})`} stroke={ink} strokeWidth="9" strokeLinejoin="round"><ellipse cx="0" cy="0" rx="42" ry="31" fill="#202a2d"/><circle cx="27" cy="-23" r="24" fill="#202a2d"/><path d="M47-22l35 11-35 9Z" fill={gold}/><circle cx="33" cy="-28" r="4" fill="#fff"/><path d="M-22 0q-28-35-38 4 18 20 38 5" fill="#35494a"/></g>
    {/* restrained ink flecks and depth framing */}
    <g fill={ink} opacity=".12"><circle cx="80" cy="1750" r="22"/><circle cx="1000" cy="1810" r="28"/><circle cx="940" cy="970" r="12"/></g>
    <rect width="1080" height="1920" fill="none" stroke={ink} strokeWidth="22" opacity=".13"/>
  </svg>;
};
