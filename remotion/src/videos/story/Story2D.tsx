import React,{useEffect,useMemo,useRef} from "react";
import {AbsoluteFill,interpolate,useCurrentFrame} from "remotion";
import {bodyFront,Pen} from "../bridge/toon";
import {outfitFor} from "./outfits";
import {Board,CastDef,sceneAt,totalFrames,FPS} from "./types";
import {getBoard} from "./Story";
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const Actor:React.FC<{d:CastDef;i:number;era?:string;x:number;y:number;phase:number;reach?:{side:-1|1;x:number;y:number};expr:CastDef["expr"];scale:number}>=({d,i,era,x,y,phase,reach,expr,scale})=>{
 const ref=useRef<HTMLCanvasElement>(null),outfit=useMemo(()=>outfitFor(d.role,i,era),[d.role,i,era]);
 useEffect(()=>{const c=ref.current?.getContext("2d");if(!c)return;c.clearRect(0,0,600,1000);bodyFront(new Pen(c),outfit,{mode:reach?"stand":d.mode==="stroll"?"stroll":"stand",phase,expr:expr??"neutral",reach:reach?[reach]:undefined,facing:0,light:-2.1,seed:i+11,blink:Math.floor(phase*30)%104<4?1:0});},[outfit,d.mode,expr,i,phase,reach]);
 const s=.66*scale;return <canvas ref={ref} width={600} height={1000} style={{position:"absolute",left:x-300*s,top:y-975*s,width:600*s,height:1000*s,pointerEvents:"none"}}/>;
};
const Backdrop:React.FC=()=> <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
 <defs><linearGradient id="s2sky" x2="0" y2="1"><stop stopColor="#65b8d1"/><stop offset=".65" stopColor="#d9e5c0"/><stop offset="1" stopColor="#f0d6a0"/></linearGradient><linearGradient id="s2stone" x2="0" y2="1"><stop stopColor="#e5c18a"/><stop offset="1" stopColor="#87563e"/></linearGradient><pattern id="s2wall" width="82" height="54" patternUnits="userSpaceOnUse"><path d="M0 5L38 3 42 25 0 28M48 5L82 8V28L44 25M0 34L28 32 34 53H0M40 33L82 31V54H35" fill="none" stroke="#704b39" strokeWidth="3"/></pattern><pattern id="s2grain" width="37" height="37" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r="1.3" fill="#5e4637" opacity=".17"/><circle cx="27" cy="25" r="1.1" fill="#fff3d4" opacity=".35"/></pattern></defs>
 <rect width="1080" height="1920" fill="url(#s2sky)"/><circle cx="870" cy="245" r="110" fill="#ffe7ac"/>
 <path d="M0 880L130 760 230 825 370 690 500 820 650 700 790 825 930 715 1080 820V1260H0Z" fill="#82936a"/><path d="M0 1000q170-155 330-25t330-10 420-12v430H0Z" fill="#6f8458"/>
 <path d="M90 1110L112 935Q145 800 305 770H710Q900 815 970 1110Z" fill="url(#s2stone)" stroke="#604333" strokeWidth="15"/><path d="M90 1110L112 935Q145 800 305 770H710Q900 815 970 1110Z" fill="url(#s2wall)"/><path d="M155 1070Q170 875 330 840H690Q850 875 900 1070" fill="none" stroke="#f1d09b" strokeWidth="16"/>
 <path d="M390 1010L405 815 430 650Q445 560 470 525Q495 560 510 650L535 815 550 1010Z" fill="url(#s2stone)" stroke="#604333" strokeWidth="14"/><path d="M390 1010L405 815 430 650Q445 560 470 525Q495 560 510 650L535 815 550 1010Z" fill="url(#s2wall)"/>
 <path d="M0 1150q210-120 410-25t350-5 320-20v800H0Z" fill="#d7b574"/><path d="M0 1260Q240 1180 460 1260T1080 1240V1920H0Z" fill="#bd9560"/><path d="M0 1260Q240 1180 460 1260T1080 1240V1920H0Z" fill="url(#s2grain)"/><path d="M390 1920Q460 1640 530 1380Q570 1300 650 1380Q720 1640 780 1920Z" fill="#e9cf9c"/>
</svg>;
const Prop:React.FC<{name:string;x:number;y:number}>=({name,x,y})=><svg width="90" height="90" viewBox="0 0 90 90" style={{position:"absolute",left:x-45,top:y-45}}>
 {name.toLowerCase().includes("coin")||name.toLowerCase().includes("gold")?<><circle cx="45" cy="45" r="28" fill="#9b6428" stroke="#50301f" strokeWidth="5"/><circle cx="45" cy="42" r="22" fill="#f2c65d" stroke="#fff0b0" strokeWidth="3"/><path d="M36 30H54L58 40 50 47 56 56H38L32 46 40 40Z" fill="#d99b35"/></>:<><path d="M22 25Q8 42 17 68Q24 84 45 82Q66 84 73 68Q82 42 68 25Z" fill="#bd7045" stroke="#54372d" strokeWidth="5"/><ellipse cx="45" cy="25" rx="23" ry="8" fill="#e2a36a" stroke="#54372d" strokeWidth="4"/></>}
</svg>;
export const StoryShort2D:React.FC=()=>{
 const f=useCurrentFrame(),b=useMemo(getBoard,[]),{i,local,n}=sceneAt(b,f),s=b.scenes[i],u=n>1?local/(n-1):0;
 const z=s.move==="push"?interpolate(u,[0,1],[.98,1.24]):s.move==="pull"?interpolate(u,[0,1],[1.15,.9]):s.shot==="close"?1.28:s.shot==="high"?.88:1.02;
 const pan=s.move==="pan"?interpolate(u,[0,1],[55,-55]):0;
 const giver=s.cast.find(c=>c.do?.type==="handOver"),buyer=giver?.do?.to?s.cast.find(c=>c.id===giver.do!.to):undefined,at=giver?.do?.at??.25,dur=giver?.do?.dur??.5,p=ease((u-at)/Math.max(.05,dur)),live=!!giver&&u>=at&&u<=at+dur;
 const people=s.cast.map((d,j)=>{const w=d.to?ease((u-(d.walkAt??0))/Math.max(.05,1-(d.walkAt??0))):0,x=d.x+(d.to?(d.to.x-d.x)*w:0),zz=d.z+(d.to?(d.to.z-d.z)*w:0);return {d,j,x:540+x*86,y:1480+zz*34,scale:(d.scale??1)*(1-Math.max(-.3,Math.min(.3,zz*.045)))};});
 const cx=giver&&buyer?mix(540+giver.x*86+120,540+buyer.x*86-120,p):540;
 return <AbsoluteFill style={{background:"#ead5aa",overflow:"hidden"}}><div style={{position:"absolute",inset:0,transform:"translate("+pan+"px,0) scale("+z+")",transformOrigin:"50% 58%"}}><Backdrop/>{(s.props??[]).map((q,j)=><Prop key={j} name={q.name} x={540+q.x*86} y={1500+q.z*34-(q.h??1)*42}/>)}{people.map(({d,j,x,y,scale})=>{const g=d.id===giver?.id,r=d.id===buyer?.id,reach=live&&(g||r)?{side:(g?1:-1) as -1|1,x:g?1.2:.95,y:1}:undefined;const expr=d.expr2&&d.at2!=null&&u>=d.at2?d.expr2:d.expr;return <Actor key={d.id} d={d} i={j} era={s.era} x={x} y={y} phase={f/FPS+j*.17} reach={reach} expr={expr} scale={scale}/>;})}{giver&&buyer?<Prop name={giver.do?.prop??"goldcoin"} x={cx} y={live?1345:1360}/>:null}</div>{s.caption?<div style={{position:"absolute",left:54,right:54,bottom:205,textAlign:"center",fontFamily:"Arial Black,Impact,sans-serif",fontWeight:900,fontSize:68,color:"#fff",WebkitTextStroke:"9px #211923",paintOrder:"stroke fill",textShadow:"0 7px 0 rgba(0,0,0,.32)"}}>{s.caption}</div>:null}</AbsoluteFill>;
};
export const story2DFrames=(b:Board)=>totalFrames(b);
