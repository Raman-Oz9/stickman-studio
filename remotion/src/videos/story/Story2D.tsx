import React,{useEffect,useMemo,useRef} from "react";
import {AbsoluteFill,interpolate,useCurrentFrame} from "remotion";
import {bodyFront,Pen} from "../bridge/toon";
import {outfitFor} from "./outfits";
import {Board,CastDef,sceneAt,totalFrames,FPS} from "./types";
import {getBoard} from "./Story";
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const Actor:React.FC<{d:CastDef;i:number;era?:string;x:number;y:number;phase:number;reach?:{side:-1|1;x:number;y:number};expr:CastDef["expr"];scale:number;facing:1|-1}>=({d,i,era,x,y,phase,reach,expr,scale,facing})=>{
 const ref=useRef<HTMLCanvasElement>(null),outfit=useMemo(()=>outfitFor(d.role,i,era),[d.role,i,era]);
 useEffect(()=>{const c=ref.current?.getContext("2d");if(!c)return;c.clearRect(0,0,600,1000);bodyFront(new Pen(c),outfit,{mode:reach?"stand":d.mode==="stroll"?"stroll":"stand",phase,expr:expr??"neutral",reach:reach?[reach]:undefined,facing,light:-2.1,seed:i+11,blink:Math.floor(phase*30)%104<4?1:0});},[outfit,d.mode,expr,i,phase,reach]);
 const s=.66*scale;return <canvas ref={ref} width={600} height={1000} style={{position:"absolute",left:x-300*s,top:y-975*s,width:600*s,height:1000*s,transform:"scaleX("+facing+")",transformOrigin:"center bottom",pointerEvents:"none"}}/>;
};
const Backdrop:React.FC<{variant:number}>=({variant})=> <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
 <defs>
  <linearGradient id="s2sky" x2="0" y2="1"><stop stopColor="#4c9fc2"/><stop offset=".58" stopColor="#c6d9b0"/><stop offset="1" stopColor="#f1d49b"/></linearGradient>
  <linearGradient id="s2stone" x2="0" y2="1"><stop stopColor="#e8c895"/><stop offset="1" stopColor="#87563e"/></linearGradient>
  <linearGradient id="s2earth" x2="0" y2="1"><stop stopColor="#d8b477"/><stop offset="1" stopColor="#9b6946"/></linearGradient>
  <pattern id="s2wall" width="82" height="54" patternUnits="userSpaceOnUse"><path d="M0 5L38 3 42 25 0 28M48 5L82 8V28L44 25M0 34L28 32 34 53H0M40 33L82 31V54H35" fill="none" stroke="#704b39" strokeWidth="3"/></pattern>
  <pattern id="s2grain" width="37" height="37" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r="1.3" fill="#5e4637" opacity=".17"/><circle cx="27" cy="25" r="1.1" fill="#fff3d4" opacity=".35"/></pattern>
  <filter id="s2shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
 </defs>
 <rect width="1080" height="1920" fill="url(#s2sky)"/>
 <circle cx="870" cy="245" r="108" fill="#ffe7ac"/>
 <g fill="#fff" opacity=".48"><path d="M70 390q55-55 112-8 48-56 105-5 46 6 48 39H55q-15-15 15-26Z"/><path d="M680 500q55-52 106-5 44-54 93-3 43 7 46 35H665q-14-15 15-27Z"/></g>
 {variant===0 ? <>
  <path d="M0 930L135 770 250 850 390 700 525 850 680 720 830 860 970 735 1080 840V1320H0Z" fill="#81936a"/>
  <path d="M0 1080q180-170 360-25t350-15 370-8v430H0Z" fill="#6c8257"/>
  <path d="M0 1240q210-110 420-15t350-5 310-18v718H0Z" fill="url(#s2earth)"/>
  <g fill="#b67b4c" stroke="#644632" strokeWidth="12"><path d="M130 1210V1050q8-120 110-120t110 120v160Z"/><path d="M740 1190V1010q8-125 105-125t105 125v180Z"/></g>
  <g fill="#754a35"><path d="M110 1050l130-145 130 145Z"/><path d="M720 1010l125-140 125 140Z"/></g>
  <path d="M0 1500Q300 1370 540 1490T1080 1450V1920H0Z" fill="#c39a62"/>
  <g fill="#e9d09d" opacity=".8"><path d="M220 1920q100-230 190-390 70-70 130 0 95 160 190 390Z"/></g>
 </> : variant===1 ? <>
  <path d="M0 1040Q100 800 300 760H790Q970 820 1080 1080V1920H0Z" fill="#bd8b5a"/>
  <path d="M-40 1200L40 900Q115 760 310 735H780Q965 780 1120 1200V1430H-40Z" fill="url(#s2stone)" stroke="#624632" strokeWidth="22"/>
  <path d="M-40 1200L40 900Q115 760 310 735H780Q965 780 1120 1200V1430H-40Z" fill="url(#s2wall)"/>
  <path d="M180 1420Q205 1080 370 1040H710Q880 1080 900 1420" fill="none" stroke="#e8c895" strokeWidth="26"/>
  <path d="M390 1400L410 1030 455 760Q485 650 520 610Q555 650 585 760L630 1030 650 1400Z" fill="url(#s2stone)" stroke="#604333" strokeWidth="18"/>
  <path d="M390 1400L410 1030 455 760Q485 650 520 610Q555 650 585 760L630 1030 650 1400Z" fill="url(#s2wall)"/>
  <path d="M0 1480q260-100 520 0t560-5v445H0Z" fill="#d0a66b"/>
 </> : variant===2 ? <>
  <path d="M0 900L160 770 310 875 470 730 650 875 810 755 1080 890V1290H0Z" fill="#82936a"/>
  <path d="M0 1150Q280 1010 540 1140T1080 1120V1920H0Z" fill="#c69e68"/>
  <g filter="url(#s2shadow)" fill="#604632" opacity=".3"><ellipse cx="540" cy="1430" rx="460" ry="75"/></g>
  <g stroke="#5a3e2d" strokeWidth="14" fill="#b97949"><path d="M70 1110V830L250 700 430 830V1110Z"/><path d="M650 1090V800L835 675 1020 800V1090Z"/></g>
  <g fill="#754a35"><path d="M40 840L250 650 460 840Z"/><path d="M620 810L835 625 1050 810Z"/></g>
  <g fill="#3f3028"><rect x="165" y="920" width="85" height="190" rx="35"/><rect x="755" y="900" width="90" height="190" rx="35"/></g>
  <g fill="#e2bd7d" stroke="#6b4a32" strokeWidth="12"><path d="M210 1410h660l-55 180H265Z"/><path d="M270 1360q270-150 540 0v55H270Z"/></g>
  <g fill="#b86e3e" stroke="#62432f" strokeWidth="10"><ellipse cx="360" cy="1370" rx="48" ry="22"/><path d="M312 1370v75q48 40 96 0v-75"/><ellipse cx="520" cy="1370" rx="48" ry="22"/><path d="M472 1370v75q48 40 96 0v-75"/></g>
  <path d="M0 1600Q280 1500 540 1600T1080 1580V1920H0Z" fill="#b98c59"/>
 </> : <>
  <rect width="1080" height="1920" fill="#d6b77e"/>
  <path d="M0 1080Q220 960 420 1080T820 1060T1080 1080V1920H0Z" fill="#c79b61"/>
  <g fill="#b67b4c" stroke="#644632" strokeWidth="10"><path d="M80 1180V950l120-105 120 105v230Z"/><path d="M710 1180V920l140-125 140 125v260Z"/></g>
  <g fill="#754a35"><path d="M55 950l145-145 145 145Z"/><path d="M680 925l170-170 170 170Z"/></g>
  <g fill="#f0d29a" stroke="#76513a" strokeWidth="12"><path d="M390 1450q-15-260 150-390 165 130 150 390Z"/><path d="M440 1450q0-150 100-245 100 95 100 245Z"/></g>
  <g fill="none" stroke="#6b4934" strokeWidth="10"><path d="M0 1600q260-90 540 0t540-10"/><path d="M0 1690q260-90 540 0t540-10"/></g>
 </>}
 <rect width="1080" height="1920" fill="url(#s2grain)" opacity=".55"/>
</svg>;
const TradeMap:React.FC=()=> <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
 <defs><linearGradient id="mapSea" x2="0" y2="1"><stop stopColor="#243c4a"/><stop offset="1" stopColor="#527b78"/></linearGradient><pattern id="mapPaper" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r="1" fill="#f1d7a0" opacity=".18"/><circle cx="24" cy="21" r="1" fill="#1f3037" opacity=".12"/></pattern></defs>
 <rect width="1080" height="1920" fill="url(#mapSea)"/><rect width="1080" height="1920" fill="url(#mapPaper)"/>
 <path d="M170 210L310 170 405 235 480 330 555 390 580 500 530 590 560 710 515 825 475 970 410 1100 365 1250 290 1370 235 1290 210 1140 160 1000 130 840 150 710 100 580 135 430 110 320Z" fill="#bca174" stroke="#ead5ac" strokeWidth="14"/>
 <path d="M480 330L565 305 640 355 690 435 660 510 600 520 555 460Z" fill="#bca174" stroke="#ead5ac" strokeWidth="12"/>
 <path d="M520 920Q630 850 745 930T980 1030" fill="none" stroke="#f2c66c" strokeWidth="12" strokeDasharray="20 18"/><path d="M515 920Q630 850 745 930T980 1030" fill="none" stroke="#fff1c4" strokeWidth="3"/>
 <circle cx="515" cy="920" r="23" fill="#f2c66c" stroke="#fff1c4" strokeWidth="8"/><circle cx="980" cy="1030" r="23" fill="#f2c66c" stroke="#fff1c4" strokeWidth="8"/>
 <text x="520" y="850" textAnchor="middle" fill="#fff0cf" fontSize="42" fontWeight="bold" letterSpacing="5">GREAT ZIMBABWE</text><text x="810" y="1130" textAnchor="middle" fill="#fff0cf" fontSize="38" letterSpacing="4">INDIAN OCEAN</text><text x="265" y="760" textAnchor="middle" fill="#263a3c" fontSize="48" fontWeight="bold" letterSpacing="7">AFRICA</text>
 <g fill="#e7d1a6" opacity=".6"><path d="M700 260q90-60 180 0t150 10" fill="none" stroke="#e7d1a6" strokeWidth="4"/><path d="M680 310q90-60 180 0t150 10" fill="none" stroke="#e7d1a6" strokeWidth="3"/></g>
 <text x="540" y="1650" textAnchor="middle" fill="#fff0cf" fontSize="56" fontWeight="bold" letterSpacing="7">A CONNECTED KINGDOM</text>
</svg>;
const Prop:React.FC<{name:string;x:number;y:number}>=({name,x,y})=><svg width="90" height="90" viewBox="0 0 90 90" style={{position:"absolute",left:x-45,top:y-45}}>
 {name.toLowerCase().includes("ivory")?<><path d="M18 72Q7 40 35 18Q50 6 72 19Q48 24 42 43Q36 60 18 72Z" fill="#f1dfb9" stroke="#765d43" strokeWidth="5"/><path d="M22 65Q34 44 57 27" fill="none" stroke="#fff7e5" strokeWidth="4"/></>:name.toLowerCase().includes("basket")?<><path d="M15 34Q45 22 75 34L68 78Q45 88 22 78Z" fill="#b98b51" stroke="#60432e" strokeWidth="5"/><path d="M20 45H70M19 57H69M22 69H67M29 31L33 80M45 29V82M60 31L57 80" stroke="#e6c17d" strokeWidth="4"/><path d="M25 34Q45 0 65 34" fill="none" stroke="#60432e" strokeWidth="5"/></>:name.toLowerCase().includes("coin")||name.toLowerCase().includes("gold")?<><circle cx="45" cy="45" r="28" fill="#9b6428" stroke="#50301f" strokeWidth="5"/><circle cx="45" cy="42" r="22" fill="#f2c65d" stroke="#fff0b0" strokeWidth="3"/><path d="M36 30H54L58 40 50 47 56 56H38L32 46 40 40Z" fill="#d99b35"/></>:<><path d="M22 25Q8 42 17 68Q24 84 45 82Q66 84 73 68Q82 42 68 25Z" fill="#bd7045" stroke="#54372d" strokeWidth="5"/><ellipse cx="45" cy="25" rx="23" ry="8" fill="#e2a36a" stroke="#54372d" strokeWidth="4"/></>}
</svg>;
export const StoryShort2D:React.FC=()=>{
 const f=useCurrentFrame(),b=useMemo(getBoard,[]),{i,local,n}=sceneAt(b,f),s=b.scenes[i],u=n>1?local/(n-1):0;
 const z=s.world?.mapMode ? .88 : s.shot==="close"?1.62:s.shot==="medium"?1.32:s.move==="push"?interpolate(u,[0,1],[1,1.22]):s.move==="pull"?interpolate(u,[0,1],[1.28,.96]):s.shot==="high"?.92:1.02;
 const pan=s.move==="pan"?interpolate(u,[0,1],[55,-55]):0;
 const giver=s.cast.find(c=>c.do?.type==="handOver"),buyer=giver?.do?.to?s.cast.find(c=>c.id===giver.do!.to):undefined,at=giver?.do?.at??.25,dur=giver?.do?.dur??.5,p=ease((u-at)/Math.max(.05,dur)),live=!!giver&&u>=at&&u<=at+dur,carry=!!giver&&u>at+dur?ease((u-at-dur)/.12):0;
 const people=s.cast.map((d,j)=>{const w=d.to?ease((u-(d.walkAt??0))/Math.max(.05,1-(d.walkAt??0))):0,x=d.x+(d.to?(d.to.x-d.x)*w:0),zz=d.z+(d.to?(d.to.z-d.z)*w:0);return {d,j,x:540+x*(giver&&buyer?52:86),y:1480+zz*34,scale:(d.scale??1)*(1-Math.max(-.3,Math.min(.3,zz*.045)))};});
 const gp=people.find(v=>v.d.id===giver?.id),bp=people.find(v=>v.d.id===buyer?.id);const gx=gp?gp.x+(.53*414*.66):540,bx=bp?bp.x-(.53*414*.68):540,gy=gp?gp.y-(1.24*414*.68):1345,by=bp?bp.y-(1.0*414*.68):1345,cx=giver&&buyer?mix(gx,bx+90,p):540,cy=giver&&buyer?mix(gy,by-35,p):1345;
 return <AbsoluteFill style={{background:"#ead5aa",overflow:"hidden"}}><div style={{position:"absolute",inset:0,transform:"translate("+pan+"px,0) scale("+z+")",transformOrigin:"50% 58%"}}>{s.world?.mapMode?<TradeMap/>:<Backdrop variant={i%4}/>}{(s.props??[]).filter(q=>!(giver&&q.name.toLowerCase().includes("gold"))).map((q,j)=><Prop key={j} name={q.name} x={540+q.x*86} y={1500+q.z*34-(q.h??1)*42}/>)}{(!s.world?.mapMode?people:[]).map(({d,j,x,y,scale})=>{const g=d.id===giver?.id,r=d.id===buyer?.id,reach=g&&live?{side:1 as const,x:.53,y:1.24}:r&&(live||carry>0)?{side:1 as const,x:mix(.53,.12,carry),y:mix(1.24,1.0,carry)}:d.act==="point"?{side:1 as const,x:.45,y:.9}:undefined;const expr=d.expr2&&d.at2!=null&&u>=d.at2?d.expr2:d.expr;return <Actor key={d.id} d={d} i={j} era={s.era} x={x} y={y} phase={f/FPS+j*.17} reach={reach} expr={expr} scale={scale} facing={d.x<0?1:-1}/>;})}{giver&&buyer&&u>=at?<Prop name={giver.do?.prop??"goldcoin"} x={cx} y={cy}/>:null}</div>{s.caption?<div style={{position:"absolute",left:54,right:54,bottom:205,textAlign:"center",fontFamily:"Arial Black,Impact,sans-serif",fontWeight:900,fontSize:56,color:"#fff",WebkitTextStroke:"9px #211923",paintOrder:"stroke fill",textShadow:"0 7px 0 rgba(0,0,0,.32)"}}>{s.caption}</div>:null}</AbsoluteFill>;
};
export const story2DFrames=(b:Board)=>totalFrames(b);
