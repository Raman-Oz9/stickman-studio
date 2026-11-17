import type {SceneDef} from "./types";
type Person={d:{id:string;x:number;z:number};x:number;y:number};
type Input={scene:SceneDef;people:Person[];u:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
/** Deterministic 2D virtual cinematographer. Camera keyframes are scene-relative, never wall-clock driven. */
export const camera2D=({scene,people,u}:Input)=>{
 if(scene.world?.mapMode)return {z:.88,panX:0,panY:0};
 const target=people.find(p=>p.d.id===scene.target)??people[0];
 let fx=target?.x??540, fy=target?.y??1480;
 if(scene.focus){const name=scene.focus.toLowerCase();const prop=scene.props?.find(p=>p.name.toLowerCase().includes(name)||name.includes(p.name.toLowerCase()));if(prop){fx=540+prop.x*86;fy=1500+prop.z*34-(prop.h??1)*42;}}
 const shot=scene.shot;
 const base=shot==="close"?1.48:shot==="medium"?1.2:shot==="high"?.88:shot==="low"?1.12:shot==="over"?1.04:.94;
 const focusY=shot==="close"?fy-875:shot==="medium"?fy-520:shot==="high"?fy-250:shot==="low"?fy-330:fy-210;
 let from=base,to=base;
 if(scene.move==="push"){from=Math.min(base,.94);to=Math.min(1.55,Math.max(base,from*1.22));}
 else if(scene.move==="pull"){from=Math.min(1.55,Math.max(base,base*1.22));to=base;}
 else if(scene.move==="reveal"){from=.92;to=1.32;}
 else if(scene.move==="descend"||scene.move==="crane"){from=.88;to=base;}
 else if(scene.move==="track"){from=base*.98;to=base*1.04;}
 const travel=smooth(scene.move==="reveal"?Math.min(1,u*3):u),z=mix(from,to,travel);
 // Subject-led reframing: face, upper body or full figure depending on the declared shot.
 const anchorY=shot==="close"?930:shot==="medium"?1080:shot==="high"?1180:shot==="low"?1050:shot==="over"?1120:1260;
 const originY=1920*.58;
 let panX=540-(540+(fx-540)*z),panY=anchorY-(originY+(focusY-originY)*z);
 if(scene.move==="pan"){panX+=mix(65,-65,travel);}
 if(scene.move==="track"&&target){const startX=target.d.x;panX-=mix(-28,28,travel)+(target.x-(540+startX*86))*.22;}
 if(scene.move==="descend"||scene.move==="crane")panY+=mix(-90,25,travel);
 if(scene.move==="tiltup")panY+=mix(70,-45,travel);
 if(scene.move==="tiltdown")panY+=mix(-45,70,travel);
 // A short reaction hold after a motivated push keeps the focal expression readable.
 if(scene.cast.some(c=>c.expr2&&c.at2!=null)&&scene.move==="push"&&u>.82){const settle=smooth((u-.82)/.18);panX=mix(panX,panX*.94,settle);panY=mix(panY,panY*.94,settle);}
 return {z,panX,panY};
};
