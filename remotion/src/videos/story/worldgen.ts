// Universal procedural environment + civilization layer. No character/action code lives here.
// All geometry is assembled from flat primitives; drawWorld(params,t) is deterministic for a given time.
import * as THREE from "three";

export type TerrainType = "forest"|"jungle"|"ocean"|"mountain"|"desert"|"ice"|"plain"|"river"|"coast"|"swamp"|"cave"|"savanna";
export type WeatherType = "clear"|"rain"|"snow"|"fog"|"storm"|"drought"|"wind";
export type EraType = "stone-age"|"ancient"|"classical"|"medieval"|"early-modern"|"industrial"|"modern";
export type RegionType = "european"|"african"|"east-asian"|"south-asian"|"middle-eastern"|"mesoamerican";
export type ArtifactType = "pottery"|"coin"|"tool"|"weapon"|"tablet"|"scroll"|"jewellery"|"bone"|"ruins"|"excavation";
export type WorldParams = {
  terrain: TerrainType; climate?: string; weather?: WeatherType; season?: "spring"|"summer"|"autumn"|"winter";
  timeOfDay?: "dawn"|"noon"|"dusk"|"night"; era?: EraType; region?: RegionType; mapMode?: boolean;
  seed?: number; accentBeat?: number; accentEnabled?: boolean; label?: string; artifact?: ArtifactType;
};
const P = { earth:"#b99a6a", stone:"#71685c", shade:"#403c39", green:"#718b4c", sky:"#a9c7cf", accent:"#d2a34a" } as const;
const MAP = { paper:"#e5d5ae", ink:"#665844", land:"#aab18a", water:"#9bb8bd", line:"#85775e", accent:"#b78b45" } as const;
const hash = (n:number,s:number)=>{const x=Math.sin(n*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const k=clamp(x);return k*k*(3-2*k);};
const mat=(c:string, rough=1)=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
const box=(g:THREE.Group,w:number,h:number,d:number,c:string,x:number,y:number,z:number,rz=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.rotation.z=rz;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
const ball=(g:THREE.Group,r:number,c:string,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;g.add(m);return m;};
const cylinder=(g:THREE.Group,r:number,h:number,c:string,x:number,y:number,z:number,seg=8)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
const poly=(g:THREE.Group,pts:[number,number,number][],c:string)=>{const v:number[]=[];for(let i=1;i<pts.length-1;i++)v.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat(c));g.add(m);return m;};
const seasonGround=(p:WorldParams)=>p.season==="winter"?P.sky:p.season==="spring"?P.green:P.earth;
const terrain=(g:THREE.Group,p:WorldParams,t:number)=>{
  const ground=seasonGround(p);box(g,180,0.5,180,ground,0,-0.25,-18);
  if(p.terrain==="ocean"||p.terrain==="river"||p.terrain==="coast"){
    box(g,180,0.3,65,P.sky,0,-0.12,-38);
    for(let i=0;i<32;i++){const x=(hash(i,4)-.5)*150,z=-15-hash(i,5)*60;const m=box(g,2+hash(i,6)*7,.025,.18,P.sky,x,-.0,z);m.position.x+=Math.sin(t*1.2+i)*.18;}
    if(p.terrain!=="ocean")poly(g,[[-90,-.05,0],[-90,-.05,-14],[90,-.05,-14],[90,-.05,0]],P.earth);
  } else if(p.terrain==="mountain"){
    for(let i=0;i<9;i++){const x=-75+i*18,h=18+hash(i,2)*22;poly(g,[[x-18,0,-48],[x,h,-78],[x+18,0,-48]],i%2?P.stone:P.shade);if(p.season==="winter"||p.climate==="polar")poly(g,[[x-5,h*.72,-76],[x,h,-78],[x+5,h*.72,-76]],P.sky);}
  } else if(p.terrain==="desert"){
    for(let i=0;i<9;i++){const x=-80+i*20,z=-24-hash(i,2)*35;const m=ball(g,12,i%2?P.earth:P.stone,x,0,z,1,.18,1.2);m.rotation.z=.05*Math.sin(t+i);}
  } else if(p.terrain==="ice"){
    for(let i=0;i<22;i++){const x=(hash(i,2)-.5)*140,z=-10-hash(i,3)*60;poly(g,[[x-5,0,z],[x,1+hash(i,4)*3,z-7],[x+6,0,z+3]],P.sky);}
  } else if(p.terrain==="forest"||p.terrain==="jungle"||p.terrain==="savanna"||p.terrain==="plain"){
    const count=p.terrain==="forest"||p.terrain==="jungle"?28:12;
    for(let i=0;i<count;i++){const x=(hash(i,8)-.5)*145,z=-8-hash(i,9)*60,s=.75+hash(i,10)*.8;const trunk=cylinder(g,.45*s,4*s,P.shade,x,2*s,z);const crown=ball(g,3.3*s,p.season==="autumn"?P.earth:P.green,x,5.2*s,z,1.4,1.1,1.1);crown.userData.sway={phase:hash(i,11)*6.28,amp:.035*s};}
    for(let i=0;i<70;i++){const x=(hash(i,12)-.5)*140,z=-2-hash(i,13)*50;box(g,.05,.5+hash(i,14)*.5,.05,P.green,x,.25,z,(hash(i,15)-.5)*.5);}
  } else if(p.terrain==="swamp"){
    box(g,150,.2,70,P.shade,0,-.05,-30);for(let i=0;i<55;i++){const x=(hash(i,20)-.5)*130,z=-3-hash(i,21)*55;box(g,.08,1+hash(i,22),.08,P.green,x,.5,z,(hash(i,23)-.5)*.4);}
  } else if(p.terrain==="cave"){
    box(g,160,45,5,P.shade,0,20,-55);for(let i=0;i<20;i++)poly(g,[[-78+i*8,44,-52],[-74+i*8,34+hash(i,24)*8,-48],[-70+i*8,44,-52]],P.stone);
  }
  // near / mid / far parallax markers remain spatially separated for the camera.
  for(let i=0;i<18;i++){const z=-5-i*3.2;const x=(hash(i,30)-.5)*(12+i*4);const m=box(g,.12,.08,.12,P.shade,x,.04,z);m.userData.parallax=.18+i*.025;}
};
const settlement=(g:THREE.Group,p:WorldParams,t:number)=>{
  const era=p.era??"medieval",region=p.region??"african";
  if(era==="stone-age"){for(let i=0;i<4;i++){const x=-15+i*10;poly(g,[[x-4,0,-12],[x,4,-18],[x+4,0,-12]],P.earth);cylinder(g,.2,1,P.shade,x,0.5,-8);}}
  else {
    // African medieval stone enclosure: stacked dry-stone walls, conical tower, round homesteads.
    const wall=(x:number,z:number,w:number,d:number,h:number)=>{box(g,w,h,.9,P.stone,x,h/2,z);for(let k=0;k<Math.floor(w/1.5);k++)box(g,1.1,.16,1.0,P.earth,x-w/2+.75+k*1.5,h+.08,z);};
    wall(0,-23,34,0,4.4);wall(-17,-12,1,0,3.4);wall(17,-12,1,0,3.4);wall(0,-2,34,0,3.6);
    // iconic conical tower and concentric stone courses
    cylinder(g,4.4,7,P.stone,0,3.5,-23,12);for(let y=1;y<7;y+=.8)cylinder(g,4.6-y*.18,.18,P.earth,0,y,-23,12);
    poly(g,[[-5,7,-23],[0,12,-23],[5,7,-23]],P.stone);
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7,x=Math.cos(a)*28,z=-18+Math.sin(a)*20;const hut=new THREE.Group();g.add(hut);cylinder(hut,2.5,2.4,P.earth,0,1.2,0,10);const roof=ball(hut,2.5,P.stone,0,2.9,0,1,1.1,1);roof.scale.y=.7;hut.position.set(x,0,z);}
    // trade enclosure, grain stores, low market awnings
    for(let i=0;i<4;i++){const x=-20+i*13;box(g,8,2.8,5,P.earth,x,1.4,12);poly(g,[[x-4,2.8,9.5],[x,5,9.5],[x+4,2.8,9.5]],P.stone);box(g,9,.18,5,P.shade,x,3,12);}
    if(region==="east-asian")for(let i=0;i<3;i++){const x=-22+i*22;poly(g,[[x-6,4,-30],[x,7,-30],[x+6,4,-30]],P.stone);}
    if(region==="middle-eastern")for(let i=0;i<3;i++)ball(g,2,P.stone,-20+i*20,5,-28,1,1.3,1);
    if(region==="european")for(let i=0;i<3;i++)poly(g,[[-24+i*24,3,-28],[-20+i*24,9,-28],[-16+i*24,3,-28]],P.stone);
  }
};
const mapLayer=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,150,.5,180,MAP.paper,0,-.15,-24);
  // coastline and land mass, with restrained six-colour parchment palette
  poly(g,[[-65,.14,-4],[-48,.14,-58],[-15,.14,-74],[18,.14,-60],[55,.14,-30],[68,.14,8],[30,.14,20],[-20,.14,15]],MAP.land);
  for(let i=0;i<7;i++){const x=-46+i*15,z=-35+Math.sin(i*1.7)*13;poly(g,[[x-4,.28,z+3],[x,.28,z-5],[x+4,.28,z+3]],MAP.line);}
  for(let i=0;i<8;i++){const x=-45+i*12,z=-7-hash(i,44)*28;ball(g,1.3,MAP.ink,x,.35,z,.8,1.1,.8);}
  // dashed trade route grows left-to-right from t=0 to t=1.
  for(let i=0;i<26;i++){const u=i/26,x=-48+u*96,z=-5-Math.sin(u*Math.PI)*24;const dot=ball(g,.38,p.accentEnabled?MAP.accent:MAP.line,x,.42,z,1,1,1);dot.visible=false;dot.userData.routeIndex=i;}
  const pulse=.75+.25*Math.sin(t*3);ball(g,2.2,p.accentEnabled?MAP.accent:MAP.ink,35,.5,-32,pulse,pulse,pulse);
  // period-style serif map label rendered onto the parchment surface
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=256;const ctx=canvas.getContext("2d")!;ctx.clearRect(0,0,1024,256);ctx.fillStyle=MAP.ink;ctx.font="bold 82px Georgia, serif";ctx.textAlign="center";ctx.fillText("GREAT ZIMBABWE",512,112);ctx.font="38px Georgia, serif";ctx.fillText("SOUTHERN AFRICA  •  INDIAN OCEAN TRADE",512,190);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(74,18),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));sign.position.set(0,.48,66);sign.rotation.x=-Math.PI/2;g.add(sign);
  // compass rose
  poly(g,[[58,.4,50],[61,.4,40],[64,.4,50],[61,.4,60]],MAP.ink);
};

// Procedural archaeology insert. Each artifact is built only from the active six-colour world palette.
export const drawArtifact=(type:ArtifactType,t=0):THREE.Group=>{
  const g=new THREE.Group();g.name="Artifact_"+type;
  const patina=0.5+0.5*Math.sin(t*0.18);
  if(type==="coin"||type==="jewellery"){
    cylinder(g,type==="coin"?1.15:.72,.16,P.earth,0,1,0, type==="coin"?16:10);
    cylinder(g,type==="coin"?.82:.42,.035,P.stone,0,1.1,0,12);
    if(type==="jewellery")ball(g,.28,P.accent,0,1.28,0,.8,1.2,.8);
  } else if(type==="pottery"){
    cylinder(g,.62,1.5,P.earth,0,.8,0,10);
    cylinder(g,.48,.12,P.stone,0,1.58,0,10);
    cylinder(g,.2,.16,P.shade,0,1.68,0,10);
    for(let y=.5;y<1.35;y+=.28)cylinder(g,.67-(y-.5)*.12,.055,P.stone,0,y,0,10);
  } else if(type==="tool"||type==="weapon"){
    box(g,.18,2.2,.18,P.earth,0,1,0);
    poly(g,[[-.12,2,0],[0,type==="weapon"?4.1:3.2,.02],[.12,2,0]],P.stone);
    box(g,.7,.16,.24,P.shade,0,.7,0);
  } else if(type==="tablet"){
    box(g,1.9,2.5,.28,P.earth,0,1.25,0);
    for(let i=0;i<5;i++)box(g,.8,.045,.035,P.shade,-.15,2.05-i*.36,.17);
  } else if(type==="scroll"){
    box(g,2.1,2.6,.12,P.earth,0,1.3,0);
    cylinder(g,.13,2.8,P.stone,-1.08,1.3,0,8);cylinder(g,.13,2.8,P.stone,1.08,1.3,0,8);
  } else if(type==="bone"){
    box(g,.22,2.2,.22,P.earth,0,1,0);
    for(const x of [-.16,.16])for(const y of [.2,2])ball(g,.24,P.stone,x,y,0);
  } else if(type==="ruins"){
    for(let i=0;i<4;i++)box(g,.6,2.4+(i%2)*.7,.6,P.stone,-1.1+i*.72,1.2,0);
    box(g,3,.32,.7,P.earth,0,2.7,0);
  } else {
    box(g,3,.22,2.2,P.earth,0,.1,0);
    for(let i=0;i<5;i++)box(g,.12,.7+(i%2)*.3,.12,P.stone,-1.1+i*.55,.55,0);
    poly(g,[[-1.4,.2,-.9],[0,1.7,0],[1.4,.2,.9]],P.shade);
  }
  g.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;o.userData.patina=patina;}});
  return g;
};

export const drawWorld=(params:WorldParams,t:number):THREE.Group=>{
  const p={season:"summer",timeOfDay:"dawn",weather:"clear",era:"medieval",region:"african",...params};
  const g=new THREE.Group();g.name=p.mapMode?"HistoricalMapWorld":"ProceduralWorld";
  if(p.mapMode)mapLayer(g,p,t);else{
    terrain(g,p,t);
    settlement(g,p,t);
    if(p.artifact){const a=drawArtifact(p.artifact,t);a.position.set(0,0,5);g.add(a);}
    if(p.timeOfDay==="night"){const moon=ball(g,3,P.sky,40,34,-70);moon.material=new THREE.MeshBasicMaterial({color:P.sky});}
    if(p.timeOfDay==="dawn"||p.timeOfDay==="dusk")ball(g,2.8,p.accentEnabled?P.accent:P.sky,34,26,-68);
  }
  // Deterministic weather particles. Accent stays dormant until explicitly unlocked.
  if(p.weather==="rain"||p.weather==="storm"||p.weather==="snow"||p.weather==="fog"||p.weather==="wind"){
    for(let i=0;i<90;i++){const x=(hash(i,51)-.5)*130,z=-8-hash(i,52)*70,phase=hash(i,53)*6.28;
      const y=p.weather==="snow"?4+((hash(i,54)*12+t*(.6+hash(i,55)))%14):p.weather==="fog"?1.4+hash(i,56)*4:7+((hash(i,57)*12+t*8)%14);
      const c=p.weather==="fog"?P.sky:p.weather==="snow"?P.sky:P.sky;
      const m=box(g,p.weather==="fog"?8:.035,p.weather==="fog"?1:.5,.035,c,x+Math.sin(t+phase)*.7,y,z);
      m.userData.weatherParticle={kind:p.weather,baseX:x,baseY:y,baseZ:z,phase,index:i};
      if(p.weather==="fog")(m.material as THREE.MeshLambertMaterial).transparent=true,(m.material as THREE.MeshLambertMaterial).opacity=.14;
    }
  }
  g.userData.worldParams=p;g.userData.time=t;return g;
};
export const animateWorld=(g:THREE.Group,t:number)=>{
  g.traverse(o=>{const routeIndex=o.userData.routeIndex as number|undefined;if(routeIndex!==undefined)o.visible=routeIndex<Math.floor(clamp(t/3)*26);const s=o.userData.sway as {phase:number;amp:number}|undefined;if(s)o.rotation.z=Math.sin(t*1.3+s.phase)*s.amp;const w=o.userData.weatherParticle as {kind:string;baseX:number;baseY:number;baseZ:number;phase:number;index:number}|undefined;if(w){if(w.kind==="rain"||w.kind==="storm")o.position.y=2+((w.baseY-2-t*8)%14+14)%14;else if(w.kind==="snow")o.position.y=2+((w.baseY-2-t*.8)%14+14)%14;else if(w.kind==="fog"){o.position.x=w.baseX+Math.sin(t*.12+w.phase)*2;o.position.y=w.baseY+Math.sin(t*.2+w.phase)*.2;}else o.position.x=w.baseX+Math.sin(t*.7+w.phase)*.8;}});
};
