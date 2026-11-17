import React from "react";

type Props = { frame: number; variant?: number };

// Story-specific illustrated establishing environment for Great Zimbabwe.
// Layers are authored for the vertical 9:16 frame: distant escarpment, kopjes,
// dry-stone city, acacia silhouettes, wildlife, processional road and foreground grass.
export const GreatZimbabweBackdrop: React.FC<Props> = ({ frame, variant = 0 }) => {
  const wind = Math.sin(frame / 19);
  const birds = frame * 1.7;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
      <defs>
        <linearGradient id="gz-sky" x2="0" y2="1"><stop stopColor="#334f66"/><stop offset=".42" stopColor="#e18c58"/><stop offset=".72" stopColor="#f6c477"/><stop offset="1" stopColor="#f4d59a"/></linearGradient>
        <linearGradient id="gz-ground" x2="0" y2="1"><stop stopColor="#c99a56"/><stop offset=".48" stopColor="#a8753e"/><stop offset="1" stopColor="#5b4937"/></linearGradient>
        <linearGradient id="gz-stone" x2=".15" y2="1"><stop stopColor="#d1b58a"/><stop offset=".5" stopColor="#9c8060"/><stop offset="1" stopColor="#665444"/></linearGradient>
        <linearGradient id="gz-tower" x2="0" y2="1"><stop stopColor="#dfc49a"/><stop offset="1" stopColor="#735b45"/></linearGradient>
        <radialGradient id="gz-sun"><stop stopColor="#fff4c9" stopOpacity=".95"/><stop offset=".55" stopColor="#ffd48b" stopOpacity=".42"/><stop offset="1" stopColor="#ffd48b" stopOpacity="0"/></radialGradient>
        <pattern id="gz-masonry" width="76" height="48" patternUnits="userSpaceOnUse"><path d="M1 3H36L40 22H4ZM43 4H75V22H41ZM3 27H29L34 46H0ZM38 27H75V46H35Z" fill="none" stroke="#594938" strokeWidth="2.8" opacity=".68"/><path d="M5 6L33 5M45 7L70 7" stroke="#f2dfbd" strokeWidth="2" opacity=".42"/></pattern>
        <pattern id="gz-grain" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="7" cy="9" r="1.4" fill="#473c30" opacity=".22"/><circle cx="29" cy="28" r="1.2" fill="#fff0c9" opacity=".3"/></pattern>
        <filter id="gz-soft"><feGaussianBlur stdDeviation="28"/></filter>
        <filter id="gz-shadow"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <rect width="1080" height="1920" fill="url(#gz-sky)"/>
      <circle cx="805" cy="360" r="260" fill="url(#gz-sun)"/>
      <circle cx="805" cy="360" r="92" fill="#ffe3a1" opacity=".9"/>
      <path d="M0 840L92 725 160 760 255 610 337 710 425 575 514 704 615 590 710 704 824 555 921 700 1008 612 1080 690V1180H0Z" fill="#5e6670"/>
      <path d="M0 930L120 805 214 848 322 700 410 792 520 690 614 820 742 690 835 815 956 675 1080 770V1240H0Z" fill="#72705f"/>
      <g fill="#87704e" opacity=".85"><path d="M80 1060Q80 900 210 840Q330 850 350 1060Z"/><path d="M730 1030Q760 850 885 815Q1010 850 1040 1040Z"/><path d="M420 1000Q455 825 550 790Q650 835 690 1010Z"/></g>
      <path d="M0 1040Q220 920 420 1030T810 1000T1080 1030V1920H0Z" fill="#8a805a"/>
      <path d="M0 1190Q180 1080 380 1185T760 1150T1080 1180V1920H0Z" fill="#a88b55"/>
      <path d="M0 1320Q230 1210 450 1325T870 1280T1080 1320V1920H0Z" fill="url(#gz-ground)"/>
      <g opacity=".5" fill="#e9c47e"><path d="M0 1160q160-100 310-12t280-4 280-12 210 0v38H0Z"/><path d="M0 1270q180-80 350-5t350-4 380-5v24H0Z"/></g>
      {/* Great Zimbabwe's monumental dry-stone enclosure and iconic conical tower. */}
      <ellipse cx="550" cy="1325" rx="460" ry="72" fill="#3c3028" opacity=".35" filter="url(#gz-shadow)"/>
      <path d="M105 1330L145 1045Q160 955 260 930L790 930Q900 955 935 1050L980 1330Z" fill="url(#gz-stone)" stroke="#493d31" strokeWidth="20"/>
      <path d="M105 1330L145 1045Q160 955 260 930L790 930Q900 955 935 1050L980 1330Z" fill="url(#gz-masonry)" opacity=".88"/>
      <path d="M105 1330L145 1045Q160 955 260 930L790 930Q900 955 935 1050L980 1330" fill="none" stroke="#e2c69b" strokeWidth="12" opacity=".75"/>
      <path d="M430 1330Q425 1160 500 1110H620Q695 1160 690 1330Z" fill="#554535" stroke="#3e3329" strokeWidth="15"/>
      <path d="M455 1330Q454 1180 515 1145H605Q666 1180 665 1330Z" fill="#2c2926"/>
      <g transform="translate(0 0)">
        <path d="M565 1290L565 845Q565 790 625 770Q685 790 685 845L685 1290Z" fill="url(#gz-tower)" stroke="#473a2e" strokeWidth="17"/>
        <path d="M565 1290L565 845Q565 790 625 770Q685 790 685 845L685 1290Z" fill="url(#gz-masonry)" opacity=".75"/>
        <path d="M573 860Q625 805 677 860" fill="none" stroke="#f0d7ae" strokeWidth="8" opacity=".75"/>
        {Array.from({length:8},(_,i)=><path key={i} d={`M ${572-i*.5} ${890+i*48} Q 625 ${906+i*48} ${678+i*.5} ${890+i*48}`} fill="none" stroke="#594736" strokeWidth="4" opacity=".7"/>)}
      </g>
      {/* Outer homesteads and market shelters make this a living city, not an empty ruin. */}
      <g stroke="#574433" strokeWidth="9">
        <path d="M80 1430V1270L175 1190 270 1270V1430Z" fill="#9c7045"/><path d="M55 1275L175 1160 295 1275Z" fill="#644b36"/>
        <path d="M805 1430V1260L900 1170 995 1260V1430Z" fill="#a77a4b"/><path d="M780 1260L900 1140 1020 1260Z" fill="#654a34"/>
        <path d="M320 1480V1355L385 1290 450 1355V1480Z" fill="#b1814d"/><path d="M295 1360L385 1270 475 1360Z" fill="#765338"/>
      </g>
      <g fill="#40372b" opacity=".85"><rect x="145" y="1320" width="48" height="110" rx="20"/><rect x="870" y="1310" width="50" height="120" rx="20"/><rect x="365" y="1390" width="35" height="90" rx="16"/></g>
      {variant === 2 ? (
        <g stroke="#49392b" strokeWidth="9" strokeLinejoin="round">
          <path d="M85 1535V1390L190 1315 295 1390V1535Z" fill="#a47749"/>
          <path d="M58 1395L190 1280 322 1395Z" fill="#9c583b"/>
          <path d="M58 1395Q190 1340 322 1395" fill="none" stroke="#e2b66d" strokeWidth="12"/>
          <path d="M735 1535V1390L840 1315 945 1390V1535Z" fill="#9a7047"/>
          <path d="M708 1395L840 1280 972 1395Z" fill="#3e7770"/>
          <path d="M708 1395Q840 1340 972 1395" fill="none" stroke="#e4c27b" strokeWidth="12"/>
          <path d="M115 1510H270M765 1510H920" stroke="#594330" strokeWidth="18"/>
          <g fill="#d18b4f" stroke="#593d2b" strokeWidth="6">
            <path d="M140 1490Q130 1440 160 1420Q190 1440 180 1490Z"/><path d="M195 1490Q185 1440 215 1420Q245 1440 235 1490Z"/>
            <path d="M790 1490Q780 1440 810 1420Q840 1440 830 1490Z"/><path d="M850 1490Q840 1440 870 1420Q900 1440 890 1490Z"/>
          </g>
          <g fill="none" stroke="#f0d5a0" strokeWidth="5"><path d="M120 1530L120 1560M255 1530L255 1560M770 1530L770 1560M905 1530L905 1560"/></g>
        </g>
      ) : null}
      {/* Acacia silhouettes frame the scene; wind moves only the small crown branches. */}
      <g fill="#3e4936" stroke="#3e4936" strokeLinecap="round">
        <path d="M60 1510Q85 1300 155 1100M155 1100L100 1015M155 1100L235 1010" fill="none" strokeWidth="24"/>
        <path d="M-30 1045Q45 930 145 1010Q210 935 275 1010Q225 1080 145 1060Q65 1110-30 1045Z"/>
        <path d="M900 1480Q940 1260 990 1080M990 1080L935 1000M990 1080L1060 1000" fill="none" strokeWidth="22"/>
        <path d="M825 1030Q880 930 970 980Q1040 915 1110 990Q1060 1070 980 1050Q900 1100 825 1030Z" transform={`translate(0 ${wind*3})`}/>
      </g>
      {/* A small antelope pair and birds establish living savanna scale without stealing the city focal point. */}
      <g fill="#443b2e" stroke="#443b2e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(770 1390) scale(.72)"><path d="M0 0Q25-25 60-8L78 5 64 16 20 13Z"/><path d="M58-10L70-42 78-40 77-10Z"/><path d="M72-38L64-63M78-38L88-61" fill="none" strokeWidth="4"/><path d="M18 12L14 48M42 12L48 47M62 12L66 47" fill="none" strokeWidth="6"/></g>
        <g transform="translate(850 1415) scale(.48)"><path d="M0 0Q25-25 60-8L78 5 64 16 20 13Z"/><path d="M58-10L70-42 78-40 77-10Z"/><path d="M72-38L64-63M78-38L88-61" fill="none" strokeWidth="4"/><path d="M18 12L14 48M42 12L48 47M62 12L66 47" fill="none" strokeWidth="6"/></g>
      </g>
      <g transform={`translate(${(birds%1500)-200} 560)`} fill="none" stroke="#3f4140" strokeWidth="7" strokeLinecap="round"><path d="M0 0q24-24 48 0 24-24 48 0"/><path d="M110 36q18-18 36 0 18-18 36 0" opacity=".75"/></g>
      {/* Worn ochre processional path leads the eye from the viewer toward the city gate. */}
      <path d="M350 1920Q410 1670 470 1480Q510 1380 545 1320L630 1320Q585 1435 590 1510Q630 1730 720 1920Z" fill="#d8b574" opacity=".88"/>
      <path d="M430 1920Q470 1700 525 1510" fill="none" stroke="#f5d89e" strokeWidth="8" opacity=".6"/>
      {/* Foreground grasses add depth and frame the guide character. */}
      <g strokeLinecap="round" fill="none">
        {Array.from({length:34},(_,i)=>{const x=(i*137)%1080,y=1770+(i%7)*21,h=55+(i%5)*16;return <path key={i} d={`M ${x} 1920 Q ${x-14+wind*5} ${y+h/2} ${x+9+wind*8} ${y}`} stroke={i%3?"#4e5638":"#d5b06c"} strokeWidth={i%4===0?8:5} opacity=".8"/>;})}
      </g>
      <rect width="1080" height="1920" fill="url(#gz-grain)" opacity=".45"/>
      <rect width="1080" height="1920" fill="#f4d7a2" opacity=".055" style={{mixBlendMode:"soft-light"}}/>
    </svg>
  );
};
