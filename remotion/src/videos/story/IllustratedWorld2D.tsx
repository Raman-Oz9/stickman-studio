import React from "react";
import { GreatZimbabweBackdrop } from "./GreatZimbabweBackdrop";

export type IllustratedWorldKind = "savanna" | "stone-city" | "market" | "workshop" | "quarry";

export const IllustratedWorld2D: React.FC<{ frame: number; kind: IllustratedWorldKind }> = ({ frame, kind }) => {
  const drift = Math.sin(frame / 170) * 5;
  const sway = Math.sin(frame / 23);
  const smokeY = (frame % 120) * -0.42;
  const smokeX = Math.sin(frame / 11) * 7;
  const fire = 0.82 + Math.sin(frame / 4) * 0.08;
  if (kind === "savanna") return <GreatZimbabweBackdrop frame={frame} variant={0} />;
  if (kind === "stone-city") return <GreatZimbabweBackdrop frame={frame} variant={1} />;

  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="iw-sky" x2="0" y2="1"><stop stopColor="#203b43" /><stop offset=".42" stopColor="#b87550" /><stop offset="1" stopColor="#e1b56f" /></linearGradient>
        <linearGradient id="iw-ground" x2="0" y2="1"><stop stopColor="#9a754d" /><stop offset=".55" stopColor="#6e5039" /><stop offset="1" stopColor="#332e2c" /></linearGradient>
        <linearGradient id="iw-stone" x2="0" y2="1"><stop stopColor="#dfc28d" /><stop offset=".48" stopColor="#a7835d" /><stop offset="1" stopColor="#71533e" /></linearGradient>
        <linearGradient id="iw-wood" x2="0" y2="1"><stop stopColor="#b17a49" /><stop offset="1" stopColor="#54392e" /></linearGradient>
        <radialGradient id="iw-fire"><stop stopColor="#fff0a0" /><stop offset=".35" stopColor="#e59a43" /><stop offset="1" stopColor="#bd5739" stopOpacity="0" /></radialGradient>
        <pattern id="iw-masonry" width="88" height="42" patternUnits="userSpaceOnUse">
          <path d="M0 0H88M0 21H88M44 0V21M18 21V42M70 21V42" fill="none" stroke="#493b32" strokeWidth="3" opacity=".42" />
          <path d="M4 5H38M50 26H83" stroke="#fff0c8" strokeWidth="2" opacity=".34" />
        </pattern>
        <pattern id="iw-floor" width="90" height="64" patternUnits="userSpaceOnUse">
          <path d="M0 0L90 0 78 60 12 60Z" fill="none" stroke="#302a29" strokeWidth="3" opacity=".28" />
          <path d="M10 8L75 8M20 52L70 52" stroke="#e0bb7c" strokeWidth="2" opacity=".18" />
        </pattern>
        <pattern id="iw-fabric" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 8H34M0 25H34" stroke="#f3dfb9" strokeWidth="4" opacity=".52" />
          <path d="M8 0V34M25 0V34" stroke="#293b39" strokeWidth="2" opacity=".25" />
        </pattern>
        <pattern id="iw-woodgrain" width="64" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 6Q16 0 32 6T64 6M0 17Q16 11 32 17T64 17" fill="none" stroke="#3d2d27" strokeWidth="2" opacity=".35" />
          <path d="M8 11Q22 7 35 11" fill="none" stroke="#f0c78a" strokeWidth="1.5" opacity=".38" />
        </pattern>
        <pattern id="iw-rockgrain" width="42" height="36" patternUnits="userSpaceOnUse">
          <path d="M0 9L13 4 25 11 42 5M2 29L15 22 30 28" fill="none" stroke="#584638" strokeWidth="2.5" opacity=".38" />
          <path d="M8 15L17 12M29 32L38 29" stroke="#f0d6a7" strokeWidth="2" opacity=".35" />
        </pattern>
        <linearGradient id="iw-haze" x2="0" y2="1">
          <stop stopColor="#f6d9aa" stopOpacity="0" />
          <stop offset="1" stopColor="#f6d9aa" stopOpacity=".22" />
        </linearGradient>
        <pattern id="iw-grain" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="8" r="1.2" fill="#fff1ce" opacity=".22" /><circle cx="24" cy="20" r="1" fill="#211d22" opacity=".17" />
          <path d="M13 28l4 -2" stroke="#fff1ce" strokeWidth="1" opacity=".16" />
        </pattern>
        <filter id="iw-shadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="11" /></filter>
        <filter id="iw-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <rect width="1080" height="1920" fill="url(#iw-sky)" />
      <circle cx="840" cy="260" r="170" fill="#f5d28a" opacity=".2" filter="url(#iw-glow)" />
      <circle cx="840" cy="260" r="74" fill="#f6d98e" opacity=".82" />
      <g transform={"translate(" + (Math.sin(frame / 240) * 18) + " 0)"} opacity=".52">
        <path d="M70 440Q115 385 165 430Q205 380 255 425Q300 432 300 460H55Q45 448 70 440Z" fill="#f2ddbf" stroke="#6e5c4c" strokeWidth="3" />
        <path d="M655 565Q700 515 748 555Q790 505 842 548Q885 555 885 582H640Q630 570 655 565Z" fill="#f2ddbf" stroke="#6e5c4c" strokeWidth="3" />
      </g>
      <rect y="650" width="1080" height="520" fill="url(#iw-haze)" opacity=".65" />
      <g transform={"translate(" + (drift * .34) + " 0)"}>
        <path d="M0 770Q140 560 280 710Q430 470 580 690Q760 480 900 690Q1010 560 1120 730V1250H0Z" fill="#48575a" stroke="#27262b" strokeWidth="12" />
        <path d="M0 920Q150 700 300 870Q460 650 620 880Q780 680 950 870Q1030 810 1120 900V1300H0Z" fill="#72765f" stroke="#27262b" strokeWidth="10" />
        <path d="M85 790Q245 650 390 780T710 770T1040 760" fill="none" stroke="#a9a58b" strokeWidth="7" opacity=".28" />
        <path d="M40 950Q220 810 380 930T740 920T1060 930" fill="none" stroke="#d0b98a" strokeWidth="5" opacity=".24" />
        <path d="M0 1090Q180 910 340 1080Q500 900 670 1080Q850 900 1080 1080V1450H0Z" fill="#9a805a" opacity=".82" />
        <path d="M65 1050Q540 820 1010 1050V1370H65Z" fill="url(#iw-stone)" stroke="#282329" strokeWidth="15" />
        <path d="M65 1050Q540 820 1010 1050V1370H65Z" fill="url(#iw-masonry)" opacity=".9" />
        <path d="M410 1050V820Q410 650 540 620Q670 650 670 820V1370H410Z" fill="url(#iw-stone)" stroke="#282329" strokeWidth="17" />
        <path d="M435 1040V830Q435 690 540 670Q645 690 645 830V1370H435Z" fill="url(#iw-masonry)" opacity=".9" />
        <path d="M430 1368V1200Q540 1080 650 1200V1368Z" fill="#342b2a" stroke="#282329" strokeWidth="13" />
        <path d="M450 1368V1210Q540 1125 630 1210V1368Z" fill="#161f22" />
      </g>
      <rect y="1320" width="1080" height="600" fill="url(#iw-ground)" />
      <rect y="1320" width="1080" height="600" fill="url(#iw-floor)" opacity=".7" />
      <path d="M0 1515Q180 1470 360 1510T720 1505T1080 1510" fill="none" stroke="#e0bd83" strokeWidth="7" opacity=".22" />
      <g opacity=".28" fill="#3c3029">
        <ellipse cx="110" cy="1660" rx="26" ry="10" /><ellipse cx="305" cy="1785" rx="34" ry="12" />
        <ellipse cx="790" cy="1695" rx="29" ry="9" /><ellipse cx="980" cy="1810" rx="38" ry="12" />
      </g>

      {kind === "market" ? (
        <g stroke="#282329" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round">
          <g>
            <ellipse cx="250" cy="1390" rx="235" ry="35" fill="#251f24" opacity=".22" stroke="none" filter="url(#iw-shadow)" />
            <path d="M55 1390V1050H455V1390Z" fill="#a66f49" />
            <path d="M32 1055L252 850 480 1055Z" fill="#2f5b59" />
            <path d="M32 1055L480 1055L448 1110H65Z" fill="#d5a65f" />
            <path d="M90 1075L120 1095 150 1075 180 1095 210 1075 240 1095 270 1075 300 1095 330 1075 360 1095 390 1075" fill="none" stroke="#f4dfb6" strokeWidth="5" />
            <path d="M95 1140H420M95 1200H420M95 1260H420" stroke="#50382e" strokeWidth="5" opacity=".65" />
            <path d="M105 1390V1110M405 1390V1110" stroke="#50382e" strokeWidth="12" />
          </g>
          <g>
            <ellipse cx="820" cy="1390" rx="230" ry="35" fill="#251f24" opacity=".22" stroke="none" filter="url(#iw-shadow)" />
            <path d="M620 1390V1055H1010V1390Z" fill="#956345" />
            <path d="M590 1060L810 850 1040 1060Z" fill="#b95f46" />
            <path d="M590 1060L1040 1060L1000 1112H630Z" fill="#e0b56f" />
            <path d="M655 1080L690 1100 725 1080 760 1100 795 1080 830 1100 865 1080 900 1100 935 1080 970 1100" fill="none" stroke="#f3d9b0" strokeWidth="5" />
            <path d="M660 1390V1115M980 1390V1115" stroke="#50382e" strokeWidth="12" />
          </g>
          <path d="M140 1335Q250 1295 360 1335V1410H140Z" fill="#7c5236" />
          <path d="M690 1335Q810 1295 930 1335V1410H690Z" fill="#7c5236" />
          <path d="M170 1310Q170 1240 220 1220Q270 1240 260 1310Z" fill="#c56d49" />
          <ellipse cx="220" cy="1220" rx="42" ry="12" fill="#e0ad70" />
          <path d="M280 1310Q270 1250 310 1228Q352 1250 342 1310Z" fill="#d3a45f" />
          <ellipse cx="310" cy="1228" rx="35" ry="11" fill="#f0d4a0" />
          <path d="M760 1310Q750 1240 800 1220Q850 1240 840 1310Z" fill="#bd6849" />
          <ellipse cx="800" cy="1220" rx="42" ry="12" fill="#e2b27a" />
          <path d="M870 1310Q860 1260 900 1240Q940 1260 930 1310Z" fill="#d6a65e" />
          <ellipse cx="900" cy="1240" rx="34" ry="10" fill="#f0d5a1" />
          <path d="M80 1450H1000" stroke="#e7c58b" strokeWidth="7" opacity=".55" />
        </g>
      ) : null}

      {kind === "market" ? (
        <g stroke="#49372e" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
          <path d="M32 1055L252 850 480 1055Z" fill="url(#iw-fabric)" opacity=".68" stroke="none" />
          <path d="M590 1060L810 850 1040 1060Z" fill="url(#iw-fabric)" opacity=".62" stroke="none" />
          <path d="M95 1055Q250 1000 420 1055M655 1060Q810 1005 980 1060" fill="none" stroke="#f0d4a5" strokeWidth="8" opacity=".8" />
          <path d="M130 1070L145 1100M205 1000L218 1038M285 1000L298 1038M365 1070L380 1100M690 1075L705 1105M770 1000L785 1038M850 1000L865 1038M930 1075L945 1105" stroke="#614331" strokeWidth="5" />
          <path d="M135 1140H375V1190H135Z" fill="#d6b67c" />
          <path d="M155 1165H355" stroke="#8a5c3b" strokeWidth="7" />
          <path d="M120 1320H410V1375H120Z" fill="url(#iw-woodgrain)" opacity=".48" />
          <path d="M680 1320H960V1375H680Z" fill="url(#iw-woodgrain)" opacity=".48" />
          <path d="M120 1395L165 1365 210 1395V1450H120Z" fill="#8a603d" />
          <path d="M870 1395L915 1365 960 1395V1450H870Z" fill="#8a603d" />
          <path d="M140 1410H190M890 1410H940" stroke="#e5c38a" strokeWidth="5" />
          <path d="M480 1430Q510 1385 540 1430Q570 1385 600 1430" fill="none" stroke="#c99c5f" strokeWidth="7" opacity=".6" />
        </g>
      ) : null}

      {kind === "workshop" ? (
        <g stroke="#282329" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round">
          <path d="M45 1010L540 650 1035 1010V1510H45Z" fill="#8f7153" />
          <path d="M45 1010L540 650 1035 1010" fill="none" stroke="#27242a" strokeWidth="22" />
          <path d="M95 1030H985V1510H95Z" fill="url(#iw-masonry)" opacity=".6" stroke="none" />
          <path d="M110 1020V760L270 650 430 760V1020" fill="#344d4c" />
          <path d="M130 1000V780L270 690 410 780V1000" fill="#d8b57c" strokeWidth="9" />
          <path d="M160 990V810L270 735 380 810V990" fill="#293d40" strokeWidth="8" />
          <path d="M160 990H380" stroke="#e8c88d" strokeWidth="7" />
          <path d="M700 1120Q690 1010 770 940Q850 1010 840 1120Z" fill="#744d39" />
          <path d="M685 1120Q685 1030 770 985Q855 1030 855 1120" fill="none" stroke="#33262a" strokeWidth="16" />
          <ellipse cx="770" cy="1120" rx="88" ry="25" fill="#32282a" />
          <ellipse cx="770" cy="1100" rx="55" ry="85" fill="url(#iw-fire)" opacity={fire} filter="url(#iw-glow)" stroke="none" />
          <path d="M735 1115Q710 1070 760 1035Q755 1080 785 1090Q815 1055 805 1115Q785 1150 760 1140Z" fill="#e58d43" stroke="#8d4934" strokeWidth="6" />
          <path d="M760 1118Q748 1088 774 1070Q773 1097 790 1108Q784 1130 760 1118Z" fill="#ffe29a" stroke="none" />
          <g transform={"translate(" + smokeX + " " + smokeY + ")"}>
            <path d="M755 980Q710 900 770 850Q720 790 775 730" fill="none" stroke="#e5d4b7" strokeWidth="18" opacity=".2" />
            <path d="M805 980Q850 900 800 850Q860 790 820 720" fill="none" stroke="#f4e3c8" strokeWidth="12" opacity=".18" />
          </g>
          <path d="M110 1300H975V1515H110Z" fill="#65442f" />
          <path d="M80 1300H1000L965 1360H115Z" fill="url(#iw-wood)" />
          <path d="M130 1360V1510M940 1360V1510" stroke="#3e302c" strokeWidth="18" />
          <path d="M145 1330H930" stroke="#e2b978" strokeWidth="6" opacity=".65" />
          <path d="M160 1250H430V1300H160Z" fill="#694a36" />
          <path d="M175 1250V1150H230V1250M270 1250V1125H325V1250M365 1250V1170H420V1250" fill="#7c5a3e" />
          <path d="M175 1150Q200 1100 230 1150M270 1125Q298 1070 325 1125M365 1170Q395 1125 420 1170" fill="#c16e4b" />
          <path d="M180 1250H420" stroke="#e3c08a" strokeWidth="6" />
          <path d="M530 1335Q630 1275 730 1335V1415H530Z" fill="#72513a" />
          <ellipse cx="630" cy="1335" rx="100" ry="24" fill="#c28e58" />
          <ellipse cx="630" cy="1324" rx="76" ry="16" fill="#e2bd7e" />
          <path d="M630 1335V1420M575 1420H685" stroke="#44332c" strokeWidth="14" />
          <path d="M860 1290Q845 1230 885 1200Q925 1230 910 1290Z" fill="#bf6b4b" />
          <ellipse cx="885" cy="1200" rx="35" ry="10" fill="#e5b77d" />
          <path d="M900 1290Q920 1240 960 1230" fill="none" stroke="#282329" strokeWidth="9" />
          <path d="M0 1510H1080" stroke="#282329" strokeWidth="15" />
        </g>
      ) : null}

      {kind === "workshop" ? (
        <g stroke="#49382f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M125 760L430 1010 405 1070Z" fill="#fff0c8" opacity=".08" stroke="none" />
          <path d="M150 1070H430" stroke="#302a29" strokeWidth="17" />
          <path d="M160 1060H420" stroke="#d7b57c" strokeWidth="5" />
          <path d="M205 1070V1135M290 1070V1120M375 1070V1140" stroke="#6c4935" strokeWidth="7" />
          <path d="M190 1135L205 1155 220 1135 205 1105Z" fill="#8c6847" />
          <path d="M276 1120L290 1145 304 1120 290 1088Z" fill="#9b7148" />
          <path d="M360 1140L375 1160 390 1140 375 1105Z" fill="#8b6545" />
          <path d="M690 1135Q770 1160 850 1135" fill="none" stroke="#e4b779" strokeWidth="7" opacity=".65" />
          <path d="M700 1080Q770 1110 840 1080M710 1055Q770 1082 830 1055" fill="none" stroke="#5a3a2c" strokeWidth="5" opacity=".7" />
          <path d="M110 1315H975V1360H110Z" fill="url(#iw-woodgrain)" opacity=".5" stroke="none" />
          <path d="M545 1335L570 1300 595 1335M630 1335L655 1300 680 1335" fill="none" stroke="#49352b" strokeWidth="6" />
          <path d="M545 1385H715" stroke="#e1bc7c" strokeWidth="5" opacity=".5" />
        </g>
      ) : null}

      {kind === "quarry" ? (
        <g stroke="#282329" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round">
          <path d="M0 1070L130 800 280 930 430 690 600 900 770 650 930 890 1080 760V1510H0Z" fill="#77725c" />
          <path d="M0 1070L130 800 280 930 430 690 600 900 770 650 930 890 1080 760" fill="none" stroke="#302a2a" strokeWidth="18" />
          <path d="M0 1140Q180 980 330 1100Q500 940 650 1090Q830 930 1080 1090V1510H0Z" fill="#a48a65" />
          <path d="M70 1120L210 930 360 1080 250 1220Z" fill="#c2a071" />
          <path d="M390 1080L540 860 690 1090 600 1240Z" fill="#c7a777" />
          <path d="M740 1090L870 900 1030 1110 940 1250Z" fill="#b89567" />
          <path d="M70 1120L210 930 360 1080M390 1080L540 860 690 1090M740 1090L870 900 1030 1110" fill="none" stroke="#e0c18a" strokeWidth="8" opacity=".65" />
          <path d="M95 1350H320V1510H95ZM345 1310H560V1510H345ZM590 1350H810V1510H590Z" fill="#d1b17a" />
          <path d="M95 1350H320V1510H95ZM345 1310H560V1510H345ZM590 1350H810V1510H590Z" fill="url(#iw-masonry)" opacity=".7" />
          <path d="M820 1190V1510M820 1200L1010 1040M820 1280L1010 1140M870 1150V1510M930 1095V1510M990 1048V1510" fill="none" stroke="#614834" strokeWidth="15" />
          <path d="M0 1510Q180 1450 360 1510T720 1510T1080 1510V1920H0Z" fill="#74553c" stroke="none" />
          <path d="M0 1600Q230 1540 460 1600T920 1600T1080 1600" fill="none" stroke="#d6b477" strokeWidth="8" opacity=".35" />
          <path d="M120 1435Q230 1390 340 1435M830 1430Q920 1370 1010 1430" fill="none" stroke="#3c302c" strokeWidth="12" />
        </g>
      ) : null}

      {kind === "quarry" ? (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 1000Q160 930 270 1010T510 980T770 1000T1060 960" stroke="#e1c18e" strokeWidth="8" opacity=".48" />
          <path d="M80 1080Q210 1015 340 1080T620 1065T910 1080" stroke="#5b4b3b" strokeWidth="7" opacity=".4" />
          <path d="M150 850L180 900 155 955M440 790L415 855 450 915M780 760L750 835 790 890" stroke="#4a4037" strokeWidth="9" opacity=".55" />
          <path d="M100 1355H320V1508H100ZM350 1315H560V1508H350ZM595 1355H810V1508H595Z" fill="url(#iw-rockgrain)" opacity=".58" stroke="none" />
          <path d="M835 1200V1510M835 1210L1000 1080M835 1290L1000 1160M875 1170V1510M935 1115V1510M990 1075V1510" stroke="#49392e" strokeWidth="9" opacity=".72" />
          <path d="M835 1210L1000 1080M835 1290L1000 1160" stroke="#d7b77f" strokeWidth="3" opacity=".55" />
          <path d="M100 1510L145 1465 190 1510M245 1510L285 1478 330 1510M620 1510L665 1468 710 1510M880 1510L925 1470 970 1510" stroke="#d2b17a" strokeWidth="8" opacity=".7" />
          <g fill="#c7a678" stroke="#594534" strokeWidth="5">
            <path d="M130 1570L155 1538 185 1570Z" /><path d="M270 1620L302 1578 340 1620Z" />
            <path d="M735 1580L765 1540 805 1580Z" /><path d="M930 1650L962 1608 1000 1650Z" />
          </g>
        </g>
      ) : null}

      <g transform={"translate(" + (drift * 1.65) + " 0)"} opacity=".52">
        <path d="M0 1790Q160 1745 320 1790T640 1785T960 1790T1080 1780V1920H0Z" fill="#282b28" opacity=".2" />
        {Array.from({ length: 18 }, (_, i) => {
          const x = (i * 113) % 1080;
          const y = 1685 + (i % 5) * 38;
          return <path key={i} d={`M ${x} ${y + 24} Q ${x + 12} ${y + 2} ${x + 25} ${y + 18} Q ${x + 42} ${y + 3} ${x + 53} ${y + 25}`} fill="none" stroke={i % 3 === 0 ? "#d6b77f" : "#3e4936"} strokeWidth={i % 4 === 0 ? 7 : 5} />;
        })}
      </g>
      <g transform={"translate(" + (sway * 4) + " 0)"} fill="none" stroke="#34302b" strokeWidth="9" strokeLinecap="round">
        <path d="M0 1750Q28 1640 42 1570M42 1780Q60 1660 94 1610M1030 1780Q1000 1650 1018 1580M1080 1750Q1045 1640 1060 1590" />
        <path d="M12 1660l-25 -30M50 1690l28 -34M1015 1670l-28 -34M1060 1690l25 -32" stroke="#9c9a68" strokeWidth="7" />
      </g>
      <rect width="1080" height="1920" fill="url(#iw-grain)" opacity=".72" />
      <rect width="1080" height="1920" fill="none" stroke="#251f25" strokeWidth="34" opacity=".16" />
      <rect width="1080" height="1920" fill="#f5d7a2" opacity=".045" />
    </svg>
  );
};
