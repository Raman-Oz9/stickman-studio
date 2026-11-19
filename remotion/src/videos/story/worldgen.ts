// Universal procedural environment + civilization layer. No character/action code lives here.
// All geometry is assembled from flat primitives; drawWorld(params,t) is deterministic for a given time.
import * as THREE from "three";

export type TerrainType = "forest"|"jungle"|"ocean"|"mountain"|"desert"|"ice"|"plain"|"river"|"coast"|"swamp"|"cave"|"savanna";
export type WeatherType = "clear"|"rain"|"snow"|"fog"|"storm"|"drought"|"wind";
export type EraType = "stone-age"|"ancient"|"classical"|"medieval"|"early-modern"|"industrial"|"modern"|"futuristic";
export type RegionType = "european"|"african"|"east-asian"|"south-asian"|"middle-eastern"|"mesoamerican";
export type ArtifactType = "pottery"|"coin"|"tool"|"weapon"|"tablet"|"scroll"|"jewellery"|"bone"|"ruins"|"excavation";
export type WorldParams = {
  terrain: TerrainType; climate?: string; weather?: WeatherType; season?: "spring"|"summer"|"autumn"|"winter";
  timeOfDay?: "dawn"|"noon"|"dusk"|"night"; era?: EraType; region?: RegionType; mapMode?: boolean;
  seed?: number; accentBeat?: number; accentEnabled?: boolean; label?: string; artifact?: ArtifactType;
  kind?: string;
};
const P = { earth:"#b99a6a", stone:"#71685c", shade:"#403c39", green:"#718b4c", sky:"#a9c7cf", accent:"#d2a34a" } as const;
const MAP = { paper:"#e5d5ae", ink:"#554632", land:"#899967", water:"#86aeb8", line:"#66513a", accent:"#c18b3d" } as const;
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
  const ground=(p.weather==="rain"||p.weather==="storm")?P.shade:seasonGround(p);box(g,260,0.5,260,ground,0,-0.25,-45);
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
    for(let i=0;i<70;i++){const x=(hash(i,12)-.5)*140,z=-2-hash(i,13)*50;const blade=box(g,.05,.5+hash(i,14)*.5,.05,P.green,x,.25,z,(hash(i,15)-.5)*.5);blade.userData.sway={phase:hash(i,16)*6.28,amp:.12};}
  } else if(p.terrain==="swamp"){
    box(g,150,.2,70,P.shade,0,-.05,-30);for(let i=0;i<55;i++){const x=(hash(i,20)-.5)*130,z=-3-hash(i,21)*55;box(g,.08,1+hash(i,22),.08,P.green,x,.5,z,(hash(i,23)-.5)*.4);}
  } else if(p.terrain==="cave"){
    box(g,160,45,5,P.shade,0,20,-55);for(let i=0;i<20;i++)poly(g,[[-78+i*8,44,-52],[-74+i*8,34+hash(i,24)*8,-48],[-70+i*8,44,-52]],P.stone);
  }
  if(p.terrain==="savanna"){
    // Layered southern-African kopje and escarpment silhouettes behind the city.
    for(let i=0;i<11;i++){
      const x=-92+i*18.4,z=-104-hash(i,61)*24,h=17+hash(i,62)*19,r=11+hash(i,63)*8;
      const peak=new THREE.Mesh(new THREE.ConeGeometry(r,h,7),mat(i%3===0?P.shade:P.stone));
      peak.position.set(x,h*.48,z);peak.rotation.y=hash(i,64)*.7;peak.castShadow=true;peak.receiveShadow=true;g.add(peak);
      const shoulder=ball(g,r*.95,i%2?P.earth:P.shade,x+8,1,z+9,1,.34,1.25);shoulder.rotation.y=hash(i,65)*.5;
    }
    for(const side of [-1,1])for(let i=0;i<3;i++){
      const x=side*(43+i*8),z=-47-i*15,r=7+i*1.8;
      const rock=ball(g,r,P.stone,x,r*.38,z,1.35,.9,1.05);rock.rotation.z=side*.08;
      ball(g,r*.48,P.earth,x-side*2,r*.28,z-1,1.25,.55,.82);
    }
    for(let i=0;i<13;i++){
      const x=-105+i*17.5,z=-91-hash(i,66)*13,s=.65+hash(i,67)*.55;
      cylinder(g,.32*s,3.8*s,P.shade,x,1.9*s,z,7);
      const crown=ball(g,2.6*s,P.green,x,4*s,z,1.65,.42,1.05);crown.userData.sway={phase:hash(i,68)*6.28,amp:.025};
    }
  }
  // near / mid / far parallax markers remain spatially separated for the camera.
  for(let i=0;i<18;i++){const z=-5-i*3.2;const x=(hash(i,30)-.5)*(12+i*4);const m=box(g,.12,.08,.12,P.shade,x,.04,z);m.userData.parallax=.18+i*.025;}
};
const settlement=(g:THREE.Group,p:WorldParams,t:number)=>{
  const era=p.era??"medieval",region=p.region??"african";
  const hut=(x:number,z:number,s=1)=>{
    cylinder(g,2.1*s,2.2*s,P.earth,x,1.1*s,z,10);
    const roof=ball(g,2.3*s,P.green,x,2.65*s,z,1,0.72,1);
    roof.userData.sway={phase:x*.17+z*.11,amp:.012*s};
  };
  const gable=(x:number,z:number,w:number,h:number)=>{
    box(g,w,h*.62,w*.72,P.earth,x,h*.31,z);
    poly(g,[[x-w*.6,h*.62,z-w*.38],[x,h,z-w*.38],[x+w*.6,h*.62,z-w*.38]],P.stone);
  };
  if(era==="stone-age"){
    for(let i=0;i<5;i++){const x=-20+i*10;poly(g,[[x-4,0,-12],[x,4,-18],[x+4,0,-12]],P.earth);box(g,1.4,.18,1.4,P.shade,x,.1,-8);}
    cylinder(g,1.2,.25,P.shade,0,.14,2,8);
    for(let i=0;i<5;i++)ball(g,.16+hash(i,4)*.12,P.stone,-1+i*.5,.3+hash(i,5)*.25,2);
    return;
  }
  if(era==="ancient"){
    for(let i=0;i<4;i++){const x=-25+i*16;box(g,10,5,8,P.earth,x,2.5,-22);box(g,10.5,.35,8.5,P.stone,x,5.1,-22);}
    // stepped temple / ziggurat, with a broad processional stair
    for(let i=0;i<5;i++)box(g,26-i*4,1.7,18-i*2,P.stone,0,.85+i*1.7,-48);
    box(g,5,1.2,5,P.earth,0,9.1,-48);
    for(let i=0;i<6;i++)box(g,1.2,1.4,.8,P.shade,-3+i*1.2,.7,-8);
    box(g,90,.18,7,P.sky,0,.02,12); // canal beside the granaries
  } else if(era==="classical"){
    box(g,34,1,18,P.earth,0,.5,-28);
    for(let i=0;i<9;i++){const x=-15+i*3.75;cylinder(g,.48,7,P.stone,x,4,-22,10);}
    box(g,36,.8,2,P.stone,0,7.8,-22);
    poly(g,[[-18,8.2,-23],[0,13,-23],[18,8.2,-23]],P.earth);
    // forum paving and amphitheatre tiers
    for(let i=0;i<5;i++)box(g,26-i*3,.45,2,P.stone,0,.3+i*.5,-48-i*1.4);
  } else if(era==="medieval"){
    if(region==="african" && p.label==="great-zimbabwe"){
      // Great Zimbabwe-inspired dry-stone enclosure: a broad elliptical wall, stepped conical tower and controlled entrance.
      const cx=0, cz=-36, rx=19, rz=14, segs=36, wallH=5.6;
      for(let i=0;i<segs;i++){
        if(i>=8 && i<=10) continue; // leave the near-side gateway open
        const a=i/segs*Math.PI*2, x=cx+Math.cos(a)*rx, z=cz+Math.sin(a)*rz;
        const dx=-Math.sin(a)*rx, dz=Math.cos(a)*rz, angle=Math.atan2(-dz,dx);
        const course=box(g,3.45,wallH,1.05,i%5===0?P.earth:P.stone,x,wallH/2,z);
        course.rotation.y=angle;
        for(let row=0;row<3;row++){
          const block=box(g,.92,.42,.14,(i+row)%3===0?P.shade:P.earth,
            x+Math.cos(a)*.62,1.05+row*1.35,z+Math.sin(a)*.62);
          block.rotation.y=angle;
        }
      }
      // Gate passage and short projecting cheeks.
      box(g,1.15,3.25,8,P.stone,-2.15,1.62,-17);
      box(g,1.15,3.25,8,P.stone,2.15,1.62,-17);
      // Iconic conical tower formed from progressively smaller dry-stone courses.
      for(let i=0;i<9;i++) cylinder(g,4.7-i*.43,1.05,i%2?P.stone:P.earth,5,.525+i*1.05,-36,12);
      // Outer residential compounds spread beyond the monumental wall, forming a lived-in city.
      hut(-29,-34,.82); hut(29,-34,.82); hut(-27,-53,.72); hut(27,-53,.72); hut(0,-59,.68);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=31+hash(i,71)*10;hut(Math.cos(a)*r,-35+Math.sin(a)*r*.78,.55+hash(i,72)*.22);}
      // A worn processional road links the gate to the outer market.
      box(g,4.2,.12,47,P.earth,0,.025,8);
      for(let i=0;i<22;i++){const z=-13+i*2;box(g,.16,.08,.32,P.stone,-2.15,.12,z);box(g,.16,.08,.32,P.stone,2.15,.12,z);}
      // Four timber-and-thatch market stalls with visible trade goods.
      for(let i=0;i<4;i++){
        const x=(i%2?1:-1)*(12+(i>1?7:0)),z=-2+Math.floor(i/2)*13;
        for(const dx of [-1.7,1.7])for(const dz of [-1.1,1.1])cylinder(g,.12,3.1,P.shade,x+dx,1.55,z+dz,6);
        box(g,4.2,.28,3.2,P.earth,x,3.15,z);box(g,3.5,.18,2.8,P.green,x,3.38,z);
        box(g,3.4,.65,1.15,P.stone,x,1.0,z);
        for(let k=0;k<4;k++)cylinder(g,.28,.55,k%2?P.earth:P.shade,x-1.2+k*.8,1.55,z,8);
      }
      for(let i=0;i<2;i++){const puff=ball(g,.42,P.sky,-25+i*50,.8,-48,1.2,1,.9);puff.userData.smokeParticle={phase:i*2.4,baseY:2.2};}
      for(let i=0;i<5;i++)box(g,1.2,.12,1.2,P.shade,-2+i*1.1,.08,-7);
    } else if(region==="african"){
      const wall=(x:number,z:number,w:number,h:number)=>{box(g,w,h,.9,P.stone,x,h/2,z);for(let k=0;k<Math.floor(w/1.5);k++)box(g,1.1,.16,1,P.earth,x-w/2+.75+k*1.5,h+.08,z);};
      wall(0,-23,34,4.4);wall(-17,-12,1,3.4);wall(17,-12,1,3.4);wall(0,-2,34,3.6);
      cylinder(g,4.4,7,P.stone,0,3.5,-23,12);
      for(let y=1;y<7;y+=.8)cylinder(g,4.6-y*.18,.18,P.earth,0,y,-23,12);
      for(let i=0;i<7;i++){const a=i*Math.PI*2/7;hut(Math.cos(a)*28,-18+Math.sin(a)*20,.9);}
    } else {
      for(let i=0;i<6;i++){const x=-28+i*11;gable(x,-24,8,7);}
      box(g,44,3,1,P.stone,0,1.5,-8);
      for(let i=0;i<5;i++)box(g,1,4,.7,P.earth,-20+i*10,2,-7);
    }
  } else if(era==="early-modern"||era==="industrial"){
    // brick works, dock sheds and tall chimneys
    for(let i=0;i<3;i++){const x=-22+i*22;box(g,15,9,10,P.earth,x,4.5,-28);box(g,16,.55,11,P.stone,x,9.25,-28);}
    for(let i=0;i<3;i++){const x=-25+i*24;cylinder(g,1.25,15,P.shade,x,14,-32,8);const smoke=ball(g,1.1,P.sky,x,22,-32,1.3,1,1);smoke.userData.smokeParticle={phase:i*2.1,baseY:22};}
    box(g,90,.3,9,P.sky,0,.05,12);
  } else if(era==="modern"){
    for(let i=0;i<7;i++){const x=-30+i*10,h=10+hash(i,7)*18;box(g,8,h,8,P.stone,x,h/2,-30);for(let y=2;y<h-1;y+=2)for(let z=-3;z<=3;z+=2)box(g,.8,1,.08,P.sky,x+z,y,-25.9);}
    box(g,90,.22,7,P.shade,0,.1,10);
  }
  // Region flavour is layered on the era rather than replacing it.
  if(region==="east-asian"){
    for(let i=0;i<3;i++){const x=-23+i*23;box(g,8,5,7,P.earth,x,2.5,-43);poly(g,[[x-6,5,-47],[x-4,6.8,-47],[x,6.1,-47],[x+4,6.8,-47],[x+6,5,-47]],P.stone);}
  } else if(region==="middle-eastern"){
    for(let i=0;i<3;i++){const x=-22+i*22;box(g,8,5,8,P.earth,x,2.5,-42);ball(g,2.5,P.stone,x,6,-42,.9,1.25,.9);cylinder(g,.35,5,P.stone,x+4,7,-42,8);}
  } else if(region==="european"){
    for(let i=0;i<3;i++){const x=-22+i*22;gable(x,-45,9,10);}
  } else if(region==="african"&&era!=="medieval"){
    for(let i=0;i<4;i++)hut(-27+i*18,-43,.7);
  } else if(region==="mesoamerican"){
    for(let i=0;i<3;i++)for(let k=0;k<4;k++)box(g,12-k*2,1.3,10-k*1.5,P.stone,-22+i*22,.65+k*1.3,-48);
  } else if(region==="south-asian"){
    for(let i=0;i<3;i++){const x=-22+i*22;box(g,9,5,8,P.earth,x,2.5,-43);for(let k=0;k<4;k++)poly(g,[[x-4+k*1.3,5+k*.8,-47],[x,8+k*.8,-47],[x+4-k*1.3,5+k*.8,-47]],P.stone);}
  }
};
const mapLayer=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,150,.5,180,MAP.paper,0,-.15,-24);
  // Southern Africa is the visual anchor: a tapered continent, east-coast curve and Madagascar.
  poly(g,[[-48,.14,-74],[-28,.14,-82],[-8,.14,-76],[8,.14,-65],[28,.14,-58],[43,.14,-42],[53,.14,-20],[48,.14,2],[34,.14,16],[17,.14,24],[2,.14,20],[-10,.14,10],[-23,.14,-2],[-37,.14,-20],[-52,.14,-43],[-58,.14,-60]],MAP.land);
  // Southern tip and east African coast are picked out with short ink strokes.
  const coast:[[number,number,number],[number,number,number]][]=[
    [[-48,.3,-74],[-28,.3,-82]], [[-28,.3,-82],[-8,.3,-76]], [[-8,.3,-76],[8,.3,-65]],
    [[8,.3,-65],[28,.3,-58]], [[28,.3,-58],[43,.3,-42]], [[43,.3,-42],[53,.3,-20]],
    [[53,.3,-20],[48,.3,2]], [[48,.3,2],[34,.3,16]], [[34,.3,16],[17,.3,24]],
    [[17,.3,24],[2,.3,20]], [[2,.3,20],[-10,.3,10]], [[-10,.3,10],[-23,.3,-2]]
  ];
  for(const [a,b] of coast){const dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz);const edge=box(g,len,.055,.22,MAP.line,(a[0]+b[0])/2,.31,(a[2]+b[2])/2);edge.rotation.y=-Math.atan2(dz,dx);}
  // Madagascar, just off the south-east coast.
  poly(g,[[58,.18,-22],[63,.18,-35],[66,.18,-48],[63,.18,-58],[59,.18,-49],[57,.18,-35]],MAP.land);
  for(let i=0;i<4;i++){const x=-25+i*12,z=-42+Math.sin(i*1.3)*8;poly(g,[[x-3,.28,z+2],[x,.28,z-4],[x+3,.28,z+2]],MAP.line);}
  // Zimbabwe marker and a dotted route to the Indian Ocean coast.
  const zx=25,zz=-36;
  for(let i=0;i<18;i++){const u=i/17,x=zx+u*24,z=zz+u*26-Math.sin(u*Math.PI)*5;const dot=ball(g,.82,p.accentEnabled?MAP.accent:MAP.line,x,.43,z,1,1,1);dot.userData.routeIndex=i;}
  const marker=ball(g,2.5,p.accentEnabled?MAP.accent:MAP.ink,zx,.48,zz,1,1,1);marker.userData.mapMarker="great-zimbabwe";
  // Zimbabwe label on a small parchment plaque near the marker.
  const tag=document.createElement("canvas");tag.width=512;tag.height=128;const tc=tag.getContext("2d")!;tc.clearRect(0,0,512,128);tc.fillStyle=MAP.ink;tc.font="bold 54px Georgia, serif";tc.textAlign="center";tc.fillText("ZIMBABWE",256,78);const tt=new THREE.CanvasTexture(tag);tt.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(24,6),new THREE.MeshBasicMaterial({map:tt,transparent:true,depthWrite:false}));label.position.set(25,.52,-47);label.rotation.x=-Math.PI/2;g.add(label);
  // Main title and trade geography, kept away from the lower caption safe area.
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=256;const ctx=canvas.getContext("2d")!;ctx.clearRect(0,0,1024,256);ctx.fillStyle=MAP.ink;ctx.font="bold 82px Georgia, serif";ctx.textAlign="center";ctx.fillText("GREAT ZIMBABWE",512,112);ctx.font="38px Georgia, serif";ctx.fillText("SOUTHERN AFRICA  •  INDIAN OCEAN TRADE",512,190);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(74,18),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));sign.position.set(0,.48,66);sign.rotation.x=-Math.PI/2;g.add(sign);
  // Compass rose and Indian Ocean label.
  poly(g,[[58,.4,50],[61,.4,40],[64,.4,50],[61,.4,60]],MAP.ink);
  const ocean=document.createElement("canvas");ocean.width=512;ocean.height=96;const oc=ocean.getContext("2d")!;oc.clearRect(0,0,512,96);oc.fillStyle=MAP.ink;oc.font="italic 42px Georgia, serif";oc.textAlign="center";oc.fillText("INDIAN OCEAN",256,62);const ot=new THREE.CanvasTexture(ocean);ot.colorSpace=THREE.SRGBColorSpace;const ol=new THREE.Mesh(new THREE.PlaneGeometry(32,6),new THREE.MeshBasicMaterial({map:ot,transparent:true,depthWrite:false}));ol.position.set(48,.4,28);ol.rotation.x=-Math.PI/2;g.add(ol);
};

// Procedural archaeology insert. Each artifact is built only from the active six-colour world palette.
export const drawArtifact=(type:ArtifactType,t=0):THREE.Group=>{
  const g=new THREE.Group();g.name="Artifact_"+type;
  const patina=0.5+0.5*Math.sin(t*0.18);
  if(type==="coin"||type==="jewellery"){
    cylinder(g,type==="coin"?1.15:.72,.16,P.earth,0,1,0, type==="coin"?16:10);
    cylinder(g,type==="coin"?.82:.42,.035,P.stone,0,1.1,0,12);
    if(type==="jewellery")ball(g,.28,P.green,0,1.28,0,.8,1.2,.8);
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

const seaWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,1,260,"#051325",0,-0.8,-45);
  for(let i=0;i<40;i++){
    const x=(hash(i,100)-.5)*160, z=-10-hash(i,101)*80;
    const wMesh=box(g,8+hash(i,102)*8,0.18,1.4,i%2===0?"#1a446e":"#0f2b48",x,0.05,z);
    wMesh.userData.waveDisplace={baseY:0.05,phase:hash(i,103)*6.28,speed:2.2};
  }
  for(let i=0;i<30;i++){
    const fx=(hash(i,105)-.5)*150, fz=-12-hash(i,106)*75;
    const foam=box(g,3+hash(i,107)*4,0.04,0.4,"#d0e7ef",fx,0.15,fz);
    foam.userData.foamAnim={baseY:0.15,phase:hash(i,108)*6.28};
  }
  for(let i=0;i<25;i++){
    const gx=(hash(i,110)-.5)*130, gz=-15-hash(i,111)*65;
    const glint=ball(g,0.35,"#ffffff",gx,0.2,gz);
    glint.userData.sunGlint={phase:hash(i,112)*6.28};
  }
  for(let sIdx=0;sIdx<3;sIdx++){
    const bGroup=new THREE.Group();
    bGroup.name="Boat_"+sIdx;
    const bx=-30+sIdx*30, bz=-22-sIdx*18;
    bGroup.position.set(bx,0.5,bz);
    box(bGroup,9,1.8,3.6,"#4a2e18",0,0,0);
    box(bGroup,4,1.4,2.8,"#6b4423",-0.5,1.1,0);
    cylinder(bGroup,0.18,7,"#24160d",-1.2,3.8,0,6);
    box(bGroup,0.1,5,3.2,"#f4efe2",-1.1,4.2,0,0.2);
    bGroup.userData.boatBob={baseY:0.5,baseX:bx,baseZ:bz,phase:sIdx*2.1,speed:1.6};
    g.add(bGroup);
  }
  for(let i=0;i<14;i++){
    const cx=-70+i*11, cz=-20-hash(i,115)*55;
    const caustic=new THREE.Mesh(new THREE.PlaneGeometry(10,30),new THREE.MeshBasicMaterial({color:"#4cc9f0",transparent:true,opacity:0.18,side:THREE.DoubleSide}));
    caustic.position.set(cx,10,cz);
    caustic.rotation.x=Math.PI/2;
    caustic.userData.causticAnim={phase:hash(i,116)*6.28};
    g.add(caustic);
  }
  for(let i=0;i<60;i++){
    const px=(hash(i,120)-.5)*140, pz=-10-hash(i,121)*80, py=hash(i,122)*16;
    const part=new THREE.Mesh(new THREE.IcosahedronGeometry(0.15+hash(i,123)*0.25,0),new THREE.MeshBasicMaterial({color:"#80e5ff",transparent:true,opacity:0.65}));
    part.position.set(px,py,pz);
    part.userData.bubbleParticle={baseX:px,baseY:py,baseZ:pz,speed:1.2+hash(i,124)*1.5,phase:hash(i,125)*6.28};
    g.add(part);
  }
  for(let i=0;i<22;i++){
    const rx=(hash(i,130)-.5)*130, rz=-15-hash(i,131)*70, rr=1.8+hash(i,132)*4;
    const rMesh=ball(g,rr,i%2===0?"#16325c":"#224275",rx,-0.6,rz,1.4,0.6,1.2);
    rMesh.rotation.z=hash(i,133)*0.3;
  }
};

const oceanWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,1,260,"#122030",0,-0.75,-45);
  for(let i=0;i<24;i++){
    const x=(hash(i,70)-.5)*140, z=-10-hash(i,71)*70, r=2+hash(i,72)*5;
    const isCoral=i%3===0;
    const col=isCoral?(i%2===0?"#e65c5c":"#9b5de5"):"#2c3540";
    const rock=ball(g,r,col,x,r*0.3,z,1.3,0.6,1.2);
    rock.rotation.z=hash(i,73)*0.2;
    if(isCoral){
      const branch=ball(g,r*0.5,"#f59e35",x+1,r*0.6,z,0.6,1.4,0.6);
      branch.rotation.z=-0.3;
      g.add(branch);
    }
  }
  const wreckGroup=new THREE.Group();
  wreckGroup.position.set(-22,0,-38);
  box(wreckGroup,12,3.5,5,"#3b2416",0,1.7,0);
  const mast=cylinder(wreckGroup,0.35,8,"#24160d",-2,4,0,6);
  mast.rotation.z=0.4;
  mast.rotation.x=0.2;
  for(let k=0;k<5;k++){
    box(wreckGroup,0.4,4,5.2,"#4a301f",-5+k*2.5,2,0,0.2);
  }
  g.add(wreckGroup);

  const ventX=28, ventZ=-42;
  cylinder(g,2.5,4,"#1a242f",ventX,2,ventZ,8);
  const ventCore=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,0),new THREE.MeshBasicMaterial({color:"#00f0ff"}));
  ventCore.position.set(ventX,4.2,ventZ);
  ventCore.userData.ventGlow={phase:1.5};
  g.add(ventCore);
  for(let i=0;i<8;i++){
    const pPart=new THREE.Mesh(new THREE.IcosahedronGeometry(0.4+hash(i,75)*0.3,0),new THREE.MeshBasicMaterial({color:"#00f0ff",transparent:true,opacity:0.4}));
    pPart.position.set(ventX+(hash(i,76)-.5)*1.5,5+i*1.2,ventZ+(hash(i,77)-.5)*1.5);
    pPart.userData.bubbleParticle={baseX:ventX+(hash(i,76)-.5)*1.5,baseY:5+i*1.2,baseZ:ventZ+(hash(i,77)-.5)*1.5,speed:2.5+hash(i,78),phase:i*0.8};
    g.add(pPart);
  }

  const afX=-10, afY=3.2, afZ=-28;
  ball(g,1.2,"#1c2229",afX,afY,afZ,1.4,1.1,1.6);
  const lureRod=box(g,0.08,1.8,0.08,"#111822",afX-0.6,afY+1.2,afZ-0.5,0.5);
  const lureBulb=new THREE.Mesh(new THREE.IcosahedronGeometry(0.35,0),new THREE.MeshBasicMaterial({color:"#80e5ff"}));
  lureBulb.position.set(afX-1.2,afY+2.1,afZ-0.8);
  lureBulb.userData.anglerLure={baseY:afY+2.1,phase:0.5};
  g.add(lureRod,lureBulb);

  for(let school=0;school<3;school++){
    const sX=-40+school*35, sZ=-25-school*15, sY=4+school*2;
    for(let f=0;f<10;f++){
      const fx=sX+(hash(school*10+f,80)-.5)*6, fz=sZ+(hash(school*10+f,81)-.5)*6, fy=sY+(hash(school*10+f,82)-.5)*3;
      const fish=box(g,0.6,0.25,0.3,f%2===0?"#4cc9f0":"#4361ee",fx,fy,fz);
      fish.userData.fishParticle={baseX:fx,baseY:fy,baseZ:fz,speed:1.2+hash(f,83)*0.8,radius:4+hash(f,84)*3,phase:f*0.6};
    }
  }

  for(let i=0;i<45;i++){
    const bx=(hash(i,90)-.5)*120, bz=-10-hash(i,91)*65, by=hash(i,92)*15;
    const bMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(0.15+hash(i,93)*0.25,0),new THREE.MeshBasicMaterial({color:"#80e5ff",transparent:true,opacity:0.65}));
    bMesh.position.set(bx,by,bz);
    bMesh.userData.bubbleParticle={baseX:bx,baseY:by,baseZ:bz,speed:0.8+hash(i,94)*1.2,phase:hash(i,95)*6.28};
    g.add(bMesh);
  }

  for(let i=0;i<10;i++){
    const lx=-70+i*15, lz=-15-hash(i,96)*50;
    const shaft=new THREE.Mesh(new THREE.BoxGeometry(3,25,3),new THREE.MeshBasicMaterial({color:"#80e5ff",transparent:true,opacity:0.12}));
    shaft.position.set(lx,12,lz);
    shaft.rotation.z=0.15;
    g.add(shaft);
  }
};

const romeWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,P.stone,0,-0.25,-45);
  for(let i=0;i<6;i++){
    const z=-15-i*10;
    for(const x of [-16, 16]){
      cylinder(g,0.55,7.5,P.stone,x,3.75,z,10);
      box(g,1.4,0.4,1.4,P.earth,x,7.7,z);
      box(g,1.5,0.3,1.5,P.earth,x,0.2,z);
    }
    box(g,34,0.6,1.2,P.stone,0,7.9,z);
  }
  const cx=0, cz=-65, rx=28, rz=18;
  for(let i=0;i<20;i++){
    const a = i/20*Math.PI, x = cx + Math.cos(a)*rx, z = cz + Math.sin(a)*rz;
    const arch = box(g,2.8,8,1.2,P.stone,x,4,z);
    arch.rotation.y = -a;
    box(g,1.6,4.5,1.4,P.shade,x,2.2,z);
  }
  box(g,16,9,6,P.stone,0,4.5,-38);
  box(g,7,5.5,6.2,P.shade,0,2.75,-38);
  box(g,18,0.8,7,P.earth,0,9.2,-38);
};

const greeceWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,P.earth,0,-0.25,-45);
  box(g,260,0.3,90,P.sky,0,-0.12,35);
  for(let i=0;i<20;i++){
    const x=(hash(i,30)-.5)*200, z=20+hash(i,31)*40;
    const m=box(g,3+hash(i,32)*6,.025,.2,P.sky,x,0,z);
    m.position.x+=Math.sin(t*1.5+i)*.2;
  }
  box(g,32,1.2,42,P.stone,0,0.6,-38);
  box(g,28,0.8,38,P.stone,0,1.5,-38);
  for(let i=0;i<7;i++){
    const x=-12+i*4;
    cylinder(g,0.48,6.5,P.stone,x,5,-19,10);
    cylinder(g,0.48,6.5,P.stone,x,5,-57,10);
  }
  for(let i=0;i<9;i++){
    const z=-21-i*4.5;
    cylinder(g,0.48,6.5,P.stone,-14,5,z,10);
    cylinder(g,0.48,6.5,P.stone,14,5,z,10);
  }
  box(g,30,0.8,40,P.stone,0,8.4,-38);
  poly(g,[[-16,8.8,-18],[0,13,-18],[16,8.8,-18]],P.earth);
  poly(g,[[-16,8.8,-58],[0,13,-58],[16,8.8,-58]],P.earth);
  for(let i=0;i<12;i++){
    const x=-65+i*11, z=-15-hash(i,40)*30, s=0.8+hash(i,41)*0.5;
    cylinder(g,0.35*s,3.2*s,P.shade,x,1.6*s,z,7);
    const crown=ball(g,2.6*s,P.green,x,3.6*s,z,1.5,0.8,1.4);
    crown.userData.sway={phase:hash(i,42)*6.28,amp:0.03};
  }
};

const egyptWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,P.earth,0,-0.25,-45);
  box(g,260,0.2,35,P.sky,0,-0.05,-15);
  for(let i=0;i<25;i++){
    const x=(hash(i,50)-.5)*220, z=-22+hash(i,51)*14;
    const m=box(g,4+hash(i,52)*8,.02,.15,P.stone,x,0,z);
    m.position.x+=Math.sin(t+i)*.15;
  }
  const pyrs=[{x:-35,z:-75,s:22},{x:30,z:-90,s:28},{x:65,z:-65,s:16}];
  for(const pyrInfo of pyrs){
    const pyrMesh=new THREE.Mesh(new THREE.ConeGeometry(pyrInfo.s,pyrInfo.s*0.75,4),mat(P.stone));
    pyrMesh.position.set(pyrInfo.x,pyrInfo.s*0.375,pyrInfo.z);
    pyrMesh.rotation.y=Math.PI/4;
    pyrMesh.castShadow=true; pyrMesh.receiveShadow=true;
    g.add(pyrMesh);
  }
  cylinder(g,0.6,14,P.stone,0,7,-32,6);
  poly(g,[[-0.5,14,-0.5],[0,15.8,0],[0.5,14,0.5]],P.earth);
  for(let i=0;i<8;i++){
    const x=-50+i*15, z=i%2===0?-28:-2;
    cylinder(g,0.3,5,P.shade,x,2.5,z,7);
    for(let f=0.5;f<Math.PI*2;f+=Math.PI/3){
      const leaf=box(g,3,0.05,0.8,P.green,x+Math.cos(f)*1.2,5.2,z+Math.sin(f)*1.2,0.3);
      leaf.rotation.y=f;
    }
  }
};

const chinaWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,P.green,0,-0.25,-45);
  for(let i=0;i<9;i++){
    const x=-90+i*22, h=15+hash(i,60)*25;
    poly(g,[[x-20,0,-60],[x,h,-90],[x+20,0,-60]],i%2?P.stone:P.green);
  }
  for(let i=0;i<14;i++){
    const x=-70+i*10.5, z=-35-Math.sin(i*0.4)*15, h=4+Math.sin(i*0.5)*3;
    box(g,11,h,3.2,P.stone,x,h/2,z);
    if(i%4===0){
      box(g,5,h+4,5,P.earth,x,(h+4)/2,z);
      box(g,5.4,1,5.4,P.stone,x,h+4.5,z);
    }
    for(let b=0;b<3;b++){
      box(g,1.2,0.8,0.8,P.shade,x-3+b*3,h+0.6,z-1.2);
      box(g,1.2,0.8,0.8,P.shade,x-3+b*3,h+0.6,z+1.2);
    }
  }
  const px=35, pz=-40;
  for(let tier=0;tier<5;tier++){
    const w=5-tier*0.6, h=2;
    box(g,w,h,w,tier%2===0?P.stone:P.earth,px,tier*2.2+1,pz);
    box(g,w+1.4,0.35,w+1.4,P.shade,px,tier*2.2+2.1,pz);
  }
  cylinder(g,0.15,3,P.stone,px,12.5,pz,6);
  ball(g,0.4,P.accent,px,14,pz);
};

const cityWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  const era = p.era ?? "modern";
  const seed = p.seed ?? 1337;
  box(g, 260, 0.4, 260, P.stone, 0, -0.2, -45);

  const gridSize = 4;
  const spacing = 22;
  const roadWidth = 6;

  for(let xi = -gridSize; xi <= gridSize; xi++){
    for(let zi = -gridSize; zi <= gridSize; zi++){
      const blockX = xi * spacing;
      const blockZ = -30 + zi * spacing;
      const hSeed = hash(xi * 51 + zi * 103, seed);

      box(g, spacing - 1.5, 0.25, spacing - 1.5, P.earth, blockX, 0.125, blockZ);

      if(xi < gridSize){
        const roadX = blockX + spacing / 2;
        box(g, roadWidth, 0.05, spacing - 1.5, P.shade, roadX, 0.025, blockZ);
        for(let d = -spacing/2 + 2; d < spacing/2 - 2; d += 3){
          box(g, 0.4, 0.06, 1.2, P.sky, roadX, 0.05, blockZ + d);
        }
        box(g, 0.8, 0.35, spacing - 1.5, P.stone, blockX + spacing/2 - roadWidth/2 - 0.4, 0.175, blockZ);
        box(g, 0.8, 0.35, spacing - 1.5, P.stone, blockX + spacing/2 + roadWidth/2 + 0.4, 0.175, blockZ);
        if(zi % 2 === 0){
          const lampX = roadX;
          const lampZ = blockZ - spacing/2 + 2;
          cylinder(g, 0.15, 4.5, P.shade, lampX, 2.25, lampZ, 6);
          ball(g, 0.35, P.sky, lampX, 4.6, lampZ);
        }
      }

      const buildingWidth = spacing - 3.5;
      const buildingDepth = spacing - 3.5;

      if(era === "modern"){
        const bHeight = 8 + hSeed * 22;
        box(g, buildingWidth, bHeight, buildingDepth, P.stone, blockX, bHeight/2, blockZ);
        for(let y = 2; y < bHeight - 1; y += 2.5){
          for(let wx = -buildingWidth/2 + 1.5; wx <= buildingWidth/2 - 1.5; wx += 2.5){
            box(g, 1.2, 1.2, 0.1, P.sky, blockX + wx, y, blockZ + buildingDepth/2 + 0.05);
            box(g, 1.2, 1.2, 0.1, P.sky, blockX + wx, y, blockZ - buildingDepth/2 - 0.05);
          }
        }
      } else if(era === "futuristic"){
        const bHeight = 12 + hSeed * 30;
        box(g, buildingWidth * 0.9, bHeight, buildingDepth * 0.9, P.shade, blockX, bHeight/2, blockZ);
        const spireHeight = bHeight + 4;
        cylinder(g, 0.4, spireHeight, P.accent, blockX, spireHeight/2, blockZ, 8);
        ball(g, 1.2, P.sky, blockX, spireHeight, blockZ);
        for(let ry = 4; ry < bHeight; ry += 5){
          box(g, buildingWidth + 0.8, 0.4, buildingDepth + 0.8, P.accent, blockX, ry, blockZ);
        }
      } else if(era === "medieval"){
        const bHeight = 3 + hSeed * 4;
        box(g, buildingWidth * 0.85, bHeight, buildingDepth * 0.85, P.earth, blockX, bHeight/2, blockZ);
        poly(g, [
          [blockX - buildingWidth*0.45, bHeight, blockZ - buildingDepth*0.45],
          [blockX, bHeight + 2.5, blockZ],
          [blockX + buildingWidth*0.45, bHeight, blockZ - buildingDepth*0.45]
        ], P.stone);
        poly(g, [
          [blockX - buildingWidth*0.45, bHeight, blockZ + buildingDepth*0.45],
          [blockX, bHeight + 2.5, blockZ],
          [blockX + buildingWidth*0.45, bHeight, blockZ + buildingDepth*0.45]
        ], P.stone);
      } else if(era === "ancient"){
        const bHeight = 4 + hSeed * 6;
        box(g, buildingWidth * 0.8, bHeight, buildingDepth * 0.8, P.stone, blockX, bHeight/2, blockZ);
        for(const cxOffset of [-buildingWidth*0.3, buildingWidth*0.3]){
          cylinder(g, 0.35, bHeight, P.earth, blockX + cxOffset, bHeight/2, blockZ + buildingDepth*0.45, 8);
        }
        box(g, buildingWidth, 0.6, buildingDepth + 1, P.earth, blockX, bHeight + 0.3, blockZ);
      } else {
        const bHeight = 6 + hSeed * 15;
        box(g, buildingWidth, bHeight, buildingDepth, P.stone, blockX, bHeight/2, blockZ);
      }
    }
  }
};

const grandCanyonWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#a03a28",0,-0.25,-45);
  box(g,16,0.35,220,"#4a88b8",0,-0.1,-20);
  for(let i=0;i<7;i++){
    const z=-10-i*18;
    const h1=4+i*1.5;
    const h2=8+i*2;
    box(g,35,h1,14,i%2===0?"#b84a39":"#c86a4f",-55,h1/2,z);
    box(g,35,h2,14,i%2!==0?"#9e3a24":"#d9825b",55,h2/2,z);
    box(g,36,0.5,15,"#713220",-55,h1,z);
    box(g,36,0.5,15,"#713220",55,h2,z);
  }
  for(let i=0;i<14;i++){
    const x=(hash(i,100)-0.5)*80, z=-5-hash(i,101)*70;
    if(Math.abs(x)<12) continue;
    ball(g,0.6+hash(i,102)*0.8,"#8a5a4a",x,0.4,z,1.3,0.7,1.1);
  }
  for(let i=0;i<8;i++){
    const x=(hash(i,103)-0.5)*70, z=-10-hash(i,104)*50;
    if(Math.abs(x)<14) continue;
    const h=2+hash(i,105)*1.5;
    cylinder(g,0.22,h,"#4f9a52",x,h/2,z,6);
  }
};

const coneMesh=(g:THREE.Group,r:number,h:number,c:string,x:number,y:number,z:number,seg=7)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
const mountainsWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#6b7a5a",0,-0.25,-45);
  for(let i=0;i<9;i++){
    const x=-80+i*20, h=22+hash(i,110)*18, r=12+hash(i,111)*8;
    poly(g,[[x-r,0,-50],[x,h,-50-r],[x+r,0,-50]],i%2===0?"#7b7f8e":"#646975");
    poly(g,[[x-r*0.35,h*0.7,-50-r*0.35],[x,h,-50-r],[x+r*0.35,h*0.7,-50-r*0.35]],"#f4f7ff");
  }
  for(let i=0;i<35;i++){
    const x=(hash(i,115)-0.5)*100, z=-4-hash(i,116)*60, s=0.8+hash(i,117)*0.6;
    for(let j=0;j<3;j++){
      coneMesh(g,1.3*s-j*0.3,1.8*s,"#2f7a46",x,(1.6+j*1.1)*s,z,7);
    }
    cylinder(g,0.14*s,1.3*s,"#5a3b1e",x,0.65*s,z,6);
  }
  for(let i=0;i<15;i++){
    ball(g,0.8+hash(i,118)*0.9,"#8a8f9c",(hash(i,119)-0.5)*80,0.4,-6-hash(i,120)*50,1.4,0.8,1.2);
  }
};

const volcanoWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#242220",0,-0.25,-45);
  const vx=0, vz=-65, vr=28, vh=32;
  const volcanoMesh=new THREE.Mesh(new THREE.ConeGeometry(vr,vh,9),mat("#332b28"));
  volcanoMesh.position.set(vx,vh/2,vz);
  volcanoMesh.castShadow=true; volcanoMesh.receiveShadow=true;
  g.add(volcanoMesh);
  ball(g,6,"#ff4500",vx,vh-0.5,vz,1,0.2,1);
  for(let i=0;i<4;i++){
    const angle=i*Math.PI/2;
    box(g,2.5,vh*0.8,0.8,"#ff8c00",vx+Math.cos(angle)*(vr*0.5),vh*0.4,vz+Math.sin(angle)*(vr*0.5));
  }
  for(let i=0;i<20;i++){
    ball(g,1+hash(i,130)*1.2,"#1a1918",(hash(i,131)-0.5)*90,0.5,-5-hash(i,132)*60,1.5,0.9,1.3);
  }
  for(let i=0;i<6;i++){
    const puff=ball(g,1.5+hash(i,135)*0.8,P.shade,vx+(hash(i,136)-0.5)*4,vh+2+i*3,vz+(hash(i,137)-0.5)*4,1.2,1,1.2);
    puff.userData.smokeParticle={phase:i*1.8,baseY:vh+2+i*3};
  }
};

const glacierWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#eaf5ff",0,-0.25,-45);
  for(let i=0;i<11;i++){
    const x=-85+i*17, h=12+hash(i,140)*16;
    box(g,18,h,14,i%2===0?"#bfe3ff":"#a9d6f5",x,h/2,-55);
    box(g,19,0.6,15,"#d9f0ff",x,h,-55);
  }
  for(let i=0;i<15;i++){
    const x=(hash(i,145)-0.5)*90, z=-6-hash(i,146)*55, h=3+hash(i,147)*5;
    cylinder(g,1.2+hash(i,148)*1.5,h,"#8ab4f8",x,h/2,z,5);
  }
  for(let i=0;i<10;i++){
    ball(g,1+hash(i,149),"#c9e2ff",(hash(i,150)-0.5)*70,0.4,-4-hash(i,151)*40,1.6,0.7,1.3);
  }
};

const desertDunesWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  for(let i=0;i<30;i++){
    const r=16+hash(i,160)*80, a=hash(i,161)*6.283, w=14+hash(i,162)*26;
    const m=ball(g,1,i%3===0?"#e9c887":i%3===1?"#dcb774":"#c9a05b",Math.cos(a)*r,0,Math.sin(a)*r-15,w,2.5+hash(i,163)*4,w*0.7);
    m.rotation.z=hash(i,164)*3;
  }
  for(let i=0;i<18;i++){
    const x=(hash(i,165)-0.5)*70, z=-6-hash(i,166)*50, h=2+hash(i,167)*1.8;
    cylinder(g,0.28,h,"#4f9a52",x,h/2,z,7);
    cylinder(g,0.14,0.9,"#4f9a52",x+0.5,h*0.6,z,6);
    cylinder(g,0.14,0.9,"#4f9a52",x-0.5,h*0.45,z,6);
  }
  for(let i=0;i<14;i++){
    ball(g,0.6+hash(i,168)*0.8,"#b8996a",(hash(i,169)-0.5)*60,0.3,-4-hash(i,170)*40,1.3,0.6,1.2);
  }
};

const jungleWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#3f8f3a",0,-0.25,-45);
  for(let i=0;i<40;i++){
    const x=(hash(i,180)-0.5)*90, z=-5-hash(i,181)*60, h=4+hash(i,182)*5;
    cylinder(g,0.22,h,"#6b4a2a",x,h/2,z,8);
    const canopy=ball(g,2.8,i%2===0?"#2f8a3a":"#3fa04a",x,h,z,1.5,0.8,1.5);
    canopy.userData.sway={phase:hash(i,183)*6.28,amp:0.03};
  }
  for(let i=0;i<20;i++){
    const x=(hash(i,185)-0.5)*70, z=-4-hash(i,186)*50;
    ball(g,0.8+hash(i,187)*0.7,"#4a6b42",x,0.4,z,1.4,0.7,1.2);
  }
  for(let i=0;i<12;i++){
    const x=(hash(i,188)-0.5)*60, z=-8-hash(i,189)*40;
    cylinder(g,0.06,3.5,"#255c25",x,3,z,5);
  }
};

const savannaWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#c9b86a",0,-0.25,-45);
  for(let i=0;i<22;i++){
    const x=(hash(i,190)-0.5)*90, z=-6-hash(i,191)*65;
    cylinder(g,0.25,3.5,"#8a6a4a",x,1.75,z,8);
    const canopy=ball(g,3.2,"#6f9a3a",x,3.6,z,2.2,0.4,2.2);
    canopy.userData.sway={phase:hash(i,192)*6.28,amp:0.02};
  }
  for(let i=0;i<120;i++){
    box(g,0.06,0.8+hash(i,195)*0.5,0.06,"#d9c65a",(hash(i,196)-0.5)*80,0.4,-2-hash(i,197)*55,(hash(i,198)-0.5)*0.4);
  }
  for(let i=0;i<12;i++){
    ball(g,1.2+hash(i,199)*1.1,"#a89b82",(hash(i,200)-0.5)*70,0.5,-5-hash(i,201)*50,1.5,0.6,1.2);
  }
};

const railwayWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,P.green,0,-0.25,-45);
  for(let z=-80; z<=20; z+=1.5){
    box(g,4.2,0.18,0.6,P.shade,0,0.05,z);
  }
  for(const x of [-1.2, 1.2]){
    box(g,0.22,0.32,105,P.stone,x,0.18,-30);
  }
  box(g,8,0.7,90,P.stone,7.5,0.35,-30);
  box(g,22,6,12,P.earth,14,3,-40);
  poly(g,[[3,6,-46],[14,10,-46],[25,6,-46]],P.stone);
  for(let z=-70; z<=10; z+=15){
    cylinder(g,0.2,4,P.shade,4,2,z,6);
    box(g,6,0.25,3.5,P.earth,4,4.1,z);
  }
  for(let z=-50; z<=0; z+=20){
    box(g,3,0.5,0.8,P.shade,8,0.8,z);
    box(g,0.3,1.2,0.8,P.shade,9.2,1.2,z);
  }
  const trainGroup=new THREE.Group();
  trainGroup.name="Train";
  box(g,3.2,3.2,7,P.shade,0,1.8,-15);
  cylinder(g,1.4,5,P.earth,0,2.2,-13,10);
  cylinder(g,0.3,2.5,P.shade,0,4.5,-15,6);
  ball(g,1.1,P.sky,0,2.8,-11);
  for(const x of [-1.7, 1.7]) for(const z of [-17, -13, -9]){
    cylinder(g,0.7,0.3,P.stone,x,0.7,z,10);
  }
  for(let i=1; i<=3; i++){
    const cz=-15 - i*8.5;
    box(g,3.1,2.8,7.8,P.earth,0,1.7,cz);
    for(const x of [-1.6, 1.6]) for(const z of [cz-2.5, cz+2.5]){
      cylinder(g,0.6,0.3,P.stone,x,0.6,z,8);
    }
    for(const wx of [-1.55, 1.55]) for(const wz of [cz-1.5, cz, cz+1.5]){
      box(g,0.1,0.8,0.8,P.sky,wx,2.2,wz);
    }
  }
  trainGroup.userData.trainAnim={speed:6, range:60};
  g.add(trainGroup);
};

const airportWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,P.stone,0,-0.25,-45);
  box(g,36,0.06,180,P.shade,0,0,-30);
  for(let z=-110; z<=40; z+=6){
    box(g,0.8,0.08,3.5,P.sky,0,0.04,z);
  }
  for(let z=-110; z<=40; z+=12){
    for(const x of [-17, 17]){
      cylinder(g,0.2,0.4,P.accent,x,0.2,z,6);
      ball(g,0.25,P.sky,x,0.5,z);
    }
  }
  box(g,55,10,22,P.sky,35,5,-55);
  for(let x=15; x<=55; x+=6){
    for(let y=2; y<=8; y+=2.5){
      box(g,4,1.8,0.2,P.stone,x,y,-43.9);
    }
  }
  cylinder(g,2.2,22,P.stone,-35,11,-65,10);
  box(g,7,4.5,7,P.sky,-35,22,-65);
  cylinder(g,0.8,3,P.shade,-35,25.5,-65,8);
  const planeGroup=new THREE.Group();
  planeGroup.name="Plane";
  box(g,4.5,3.2,16,P.sky,0,2.5,-20);
  box(g,22,0.3,4.5,P.stone,0,2.5,-20);
  poly(g,[[0,2.5,-27],[0,6.5,-25],[0,2.5,-23]],P.stone);
  box(g,7,0.2,2,P.stone,0,2.6,-27);
  for(const x of [-6, 6]){
    cylinder(g,0.8,3.5,P.shade,x,2.2,-20,8);
  }
  planeGroup.userData.planeAnim={speed:12, range:120};
  g.add(planeGroup);
};

const harbourWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.3,90,P.sky,0,-0.12,35);
  for(let i=0;i<25;i++){
    const x=(hash(i,90)-.5)*200, z=15+hash(i,91)*40;
    const m=box(g,3+hash(i,92)*6,.02,.18,P.sky,x,0,z);
    m.position.x+=Math.sin(t*1.3+i)*.2;
  }
  box(g,260,0.8,120,P.stone,0,0.4,-35);
  for(let x=-90; x<=90; x+=30){
    box(g,8,0.9,35,P.earth,x,0.45,10);
    for(const px of [x-3.5, x+3.5]) for(const pz of [-5, 10, 25]){
      cylinder(g,0.4,3,P.shade,px,-1.2,pz,8);
    }
  }
  for(const cx of [-45, 45]){
    const crane=new THREE.Group();
    box(g,3,18,3,P.accent,cx,9,-5);
    box(g,16,2.5,3,P.accent,cx+6,17,-5);
    cylinder(g,0.2,12,P.shade,cx+12,11,-5,6);
    box(g,4,1.5,4,P.shade,cx+12,5,-5);
    crane.userData.craneSway={phase:cx};
    g.add(crane);
  }
  const containerColors=["#e65c5c","#4cc9f0","#f72585","#4361ee","#f8961e","#43aa8b"];
  for(let i=0; i<16; i++){
    const cx=-70+(i%6)*12, cz=-35+Math.floor(i/6)*8, stackH=1+(i%3);
    for(let h=0; h<stackH; h++){
      const col=containerColors[(i+h)%containerColors.length];
      box(g,6,2.2,3,col,cx,1.1+h*2.2,cz);
    }
  }
  const ship=new THREE.Group();
  ship.position.set(0,0.2,28);
  box(ship,45,4,12,P.shade,0,2,0);
  box(ship,15,5,10,P.stone,-12,6.5,0);
  for(let k=-18; k<=12; k+=6){
    box(ship,5,3.5,4,containerColors[(k+18)%containerColors.length],k,5.5,0);
  }
  g.add(ship);
};

const spaceWorld=(g:THREE.Group,p:WorldParams,t:number)=>{
  box(g,260,0.5,260,"#080812",0,-0.25,-45);
  const nebulaColors=["#431259","#12243d","#591236","#12433d","#391259"];
  for(let i=0;i<12;i++){
    const nx=(hash(i,200)-0.5)*180, nz=-20-hash(i,201)*100, ny=10+hash(i,202)*35;
    const nc=nebulaColors[i%nebulaColors.length];
    const nPuff=new THREE.Mesh(new THREE.IcosahedronGeometry(12+hash(i,203)*15,1),new THREE.MeshBasicMaterial({color:nc,transparent:true,opacity:0.25}));
    nPuff.position.set(nx,ny,nz);
    g.add(nPuff);
  }
  for(let i=0;i<150;i++){
    const sx=(hash(i,210)-0.5)*200, sz=-5-hash(i,211)*120, sy=2+hash(i,212)*60;
    const star=new THREE.Mesh(new THREE.IcosahedronGeometry(0.25+hash(i,213)*0.3,0),new THREE.MeshBasicMaterial({color:i%3===0?"#a5f3fc":i%5===0?"#fef08a":"#ffffff"}));
    star.position.set(sx,sy,sz);
    star.userData.starTwinkle={phase:hash(i,214)*6.28};
    g.add(star);
  }
  const gasGiant=new THREE.Mesh(new THREE.SphereGeometry(16,28,20),mat("#d97736"));
  gasGiant.position.set(40,28,-80);
  gasGiant.castShadow=true;
  gasGiant.userData.planetRotate={speed:0.8};
  g.add(gasGiant);
  for(let b=0;b<4;b++){
    const band=new THREE.Mesh(new THREE.CylinderGeometry(16.05,16.05,2.5,28,1,true),mat(b%2===0?"#b45309":"#92400e"));
    band.position.set(40,18+b*6,-80);
    g.add(band);
  }
  const planetRing=new THREE.Mesh(new THREE.TorusGeometry(24,2.2,4,48),new THREE.MeshBasicMaterial({color:"#e8c89a",transparent:true,opacity:0.85}));
  planetRing.position.set(40,28,-80);
  planetRing.rotation.x=1.2;
  planetRing.rotation.y=0.3;
  g.add(planetRing);

  const earthPlanet=new THREE.Mesh(new THREE.SphereGeometry(10,24,18),mat("#2563eb"));
  earthPlanet.position.set(-45,22,-65);
  earthPlanet.castShadow=true;
  earthPlanet.userData.planetRotate={speed:1.2};
  g.add(earthPlanet);
  for(let c=0;c<3;c++){
    const cont=ball(g,4.5+c*0.8,"#16a34a",-45+(c===0?-3:c===1?4:-2),22+(c===0?3:c===1?-2:4),-65+(c===0?2:c===1?-3:1),1.2,0.6,1.1);
    cont.rotation.y=c*1.5;
  }

  for(let i=0;i<35;i++){
    const ax=(hash(i,220)-0.5)*130, az=-10-hash(i,221)*80, ay=2+hash(i,222)*40;
    const size=1.2+hash(i,223)*3.5;
    const ast=new THREE.Mesh(new THREE.IcosahedronGeometry(size,1),mat(i%2===0?P.stone:P.shade));
    ast.position.set(ax,ay,az);
    ast.rotation.set(hash(i,224)*6,hash(i,225)*6,hash(i,226)*6);
    ast.castShadow=true;
    ast.userData.asteroidDrift={speed:0.5+hash(i,227),phase:hash(i,228)*6.28};
    g.add(ast);
  }

  const station=new THREE.Group();
  station.position.set(0,15,-45);
  cylinder(station,2.5,9,P.stone,0,0,0,10);
  ball(station,3.2,P.shade,0,0,0,1.2,1,1.2);
  for(const side of [-1,1]){
    box(station,14,0.4,4,"#1e3a8a",side*9.5,0,0);
    box(station,5,0.2,0.4,P.shade,side*3.5,0,0);
  }
  const habRing=new THREE.Mesh(new THREE.TorusGeometry(5.5,0.6,6,24),mat(P.earth));
  habRing.position.set(0,-3.5,0);
  habRing.rotation.x=Math.PI/2;
  station.add(habRing);
  station.userData.stationSpin={speed:0.6};
  g.add(station);

  const bhGroup=new THREE.Group();
  bhGroup.position.set(-18,16,-55);
  const bhCore=new THREE.Mesh(new THREE.SphereGeometry(3.5,24,18),new THREE.MeshBasicMaterial({color:"#020204"}));
  bhGroup.add(bhCore);
  const photonRing=new THREE.Mesh(new THREE.TorusGeometry(3.9,0.18,8,36),new THREE.MeshBasicMaterial({color:"#00f0ff",transparent:true,opacity:0.85}));
  photonRing.rotation.x=1.1;
  bhGroup.add(photonRing);
  for(let d=0;d<3;d++){
    const discRadius=5.5+d*1.8;
    const discOpacity=0.9-d*0.25;
    const discColor=d===0?"#ff6b00":d===1?"#ffcc00":"#ff3366";
    const accretionDisc=new THREE.Mesh(new THREE.TorusGeometry(discRadius,0.6+d*0.2,6,48),new THREE.MeshBasicMaterial({color:discColor,transparent:true,opacity:discOpacity}));
    accretionDisc.rotation.x=1.1;
    accretionDisc.rotation.y=0.2*d;
    accretionDisc.userData.accretionSwirl={speed:(d+1)*0.8};
    bhGroup.add(accretionDisc);
  }
  g.add(bhGroup);
};

export const drawWorld=(params:WorldParams,t:number):THREE.Group=>{
  const p: WorldParams={season:"summer",timeOfDay:"dawn",weather:"clear",era:"medieval",region:"african",...params};
  const k = p.kind ?? "";
  const isGrandCanyon = k === "grand-canyon" || k === "canyon" || k === "grandcanyon";
  const isMountains = k === "mountain" || k === "mountains" || k === "snow-caps" || k === "alpine";
  const isVolcano = k === "volcano";
  const isGlacier = k === "glacier" || k === "arctic" || k === "ice" || k === "polar";
  const isDesert = k === "desert" || k === "desert-dunes" || k === "dunes";
  const isJungle = k === "jungle" || k === "rainforest";
  const isSavanna = k === "savanna" || k === "plains";
  const isRailway = k === "railway" || k === "train" || k === "station";
  const isAirport = k === "airport" || k === "runway" || k === "plane";
  const isHarbour = k === "harbour" || k === "port" || k === "dock";

  const g=new THREE.Group();
  g.name=p.mapMode?"HistoricalMapWorld"
    : p.kind==="sea"?"SeaWorld"
    : p.kind==="ocean"?"DeepOceanWorld"
    : p.kind==="space" || p.kind==="deep-space" || p.kind==="deepspace"?"DeepSpaceWorld"
    : p.kind==="rome"?"RomeWorld"
    : p.kind==="greece"?"GreeceWorld"
    : p.kind==="egypt"?"EgyptWorld"
    : p.kind==="china"?"ChinaWorld"
    : p.kind==="city"?"CityWorld"
    : isRailway?"RailwayWorld"
    : isAirport?"AirportWorld"
    : isHarbour?"HarbourWorld"
    : isGrandCanyon?"GrandCanyonWorld"
    : isMountains?"MountainsWorld"
    : isVolcano?"VolcanoWorld"
    : isGlacier?"GlacierWorld"
    : isDesert?"DesertDunesWorld"
    : isJungle?"JungleWorld"
    : isSavanna?"SavannaWorld"
    :"ProceduralWorld";

   if(p.mapMode){
    mapLayer(g,p,t);g.scale.set(.5,1,.72);
  }else if(p.kind==="sea"){
    seaWorld(g,p,t);
  }else if(p.kind==="ocean"){
    oceanWorld(g,p,t);
  }else if(p.kind==="space" || p.kind==="deep-space" || p.kind==="deepspace"){
    spaceWorld(g,p,t);
  }else if(p.kind==="rome"){
    romeWorld(g,p,t);
  }else if(p.kind==="greece"){
    greeceWorld(g,p,t);
  }else if(p.kind==="egypt"){
    egyptWorld(g,p,t);
  }else if(p.kind==="china"){
    chinaWorld(g,p,t);
  }else if(p.kind==="city"){
    cityWorld(g,p,t);
  }else if(isRailway){
    railwayWorld(g,p,t);
  }else if(isAirport){
    airportWorld(g,p,t);
  }else if(isHarbour){
    harbourWorld(g,p,t);
  }else if(isGrandCanyon){
    grandCanyonWorld(g,p,t);
  }else if(isMountains){
    mountainsWorld(g,p,t);
  }else if(isVolcano){
    volcanoWorld(g,p,t);
  }else if(isGlacier){
    glacierWorld(g,p,t);
  }else if(isDesert){
    desertDunesWorld(g,p,t);
  }else if(isJungle){
    jungleWorld(g,p,t);
  }else if(isSavanna){
    savannaWorld(g,p,t);
  }else{
    terrain(g,p,t);
    settlement(g,p,t);
    if(p.artifact){const a=drawArtifact(p.artifact,t);a.position.set(0,0,5);g.add(a);}
    if(p.timeOfDay==="night"){ball(g,3,P.sky,40,34,-70);}
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
  g.traverse(o=>{
    const waveDis=o.userData.waveDisplace as {baseY:number;phase:number;speed:number}|undefined;if(waveDis)o.position.y=waveDis.baseY+Math.sin(t*waveDis.speed+waveDis.phase)*0.18;
    const foamAn=o.userData.foamAnim as {baseY:number;phase:number}|undefined;if(foamAn){o.position.y=foamAn.baseY+Math.cos(t*2.8+foamAn.phase)*0.08;const sc=0.8+0.4*Math.sin(t*3.2+foamAn.phase);o.scale.x=sc;}
    const glint=o.userData.sunGlint as {phase:number}|undefined;if(glint){const mat=(o as THREE.Mesh).material as THREE.MeshBasicMaterial;if(mat)mat.opacity=0.2+0.8*Math.abs(Math.sin(t*4.5+glint.phase));}
    const boat=o.userData.boatBob as {baseY:number;phase:number;speed:number}|undefined;if(boat){o.position.y=boat.baseY+Math.sin(t*boat.speed+boat.phase)*0.4;o.rotation.z=Math.sin(t*1.3+boat.phase)*0.09;o.rotation.x=Math.cos(t*1.1+boat.phase)*0.06;}
    const caustic=o.userData.causticAnim as {phase:number}|undefined;if(caustic){const mat=(o as THREE.Mesh).material as THREE.MeshBasicMaterial;if(mat)mat.opacity=0.08+0.12*Math.sin(t*2.2+caustic.phase);}
    const planetRot=o.userData.planetRotate as {speed:number}|undefined;if(planetRot)o.rotation.y=t*0.2*planetRot.speed;
    const astDrift=o.userData.asteroidDrift as {speed:number;phase:number}|undefined;if(astDrift)o.position.y+=Math.sin(t*astDrift.speed+astDrift.phase)*0.005;
    const stationSpin=o.userData.stationSpin as {speed:number}|undefined;if(stationSpin)o.rotation.y=t*0.4*stationSpin.speed;
    const discSwirl=o.userData.accretionSwirl as {speed:number}|undefined;if(discSwirl)o.rotation.z=t*0.5*discSwirl.speed;
    const starTwinkle=o.userData.starTwinkle as {phase:number}|undefined;if(starTwinkle){const mat=(o as THREE.Mesh).material as THREE.MeshBasicMaterial;if(mat)mat.opacity=0.4+0.6*Math.sin(t*3+starTwinkle.phase);}
    const routeIndex=o.userData.routeIndex as number|undefined;if(routeIndex!==undefined)o.visible=routeIndex<Math.floor(clamp(t/3)*26);const s=o.userData.sway as {phase:number;amp:number}|undefined;if(s)o.rotation.z=Math.sin(t*1.3+s.phase)*s.amp;const smoke=o.userData.smokeParticle as {phase:number;baseY:number}|undefined;if(smoke){o.position.y=smoke.baseY+((t*1.5+smoke.phase)%5);o.scale.setScalar(.7+((t*.35+smoke.phase)%1)*.5);}const w=o.userData.weatherParticle as {kind:string;baseX:number;baseY:number;baseZ:number;phase:number;index:number}|undefined;if(w){if(w.kind==="rain"||w.kind==="storm")o.position.y=2+((w.baseY-2-t*(w.kind==="storm"?14:8))%14+14)%14;else if(w.kind==="snow")o.position.y=2+((w.baseY-2-t*.8)%14+14)%14;else if(w.kind==="fog"){o.position.x=w.baseX+Math.sin(t*.12+w.phase)*2;o.position.y=w.baseY+Math.sin(t*.2+w.phase)*.2;}else o.position.x=w.baseX+Math.sin(t*.7+w.phase)*.8;}const fish=o.userData.fishParticle as {baseX:number;baseY:number;baseZ:number;speed:number;radius:number;phase:number}|undefined;if(fish){o.position.x=fish.baseX+Math.sin(t*fish.speed+fish.phase)*fish.radius;o.position.z=fish.baseZ+Math.cos(t*fish.speed*0.7+fish.phase)*fish.radius*0.6;}const bubble=o.userData.bubbleParticle as {baseX:number;baseY:number;baseZ:number;speed:number;phase:number}|undefined;if(bubble){o.position.y=((bubble.baseY+t*bubble.speed+bubble.phase)%18);o.position.x=bubble.baseX+Math.sin(t*0.8+bubble.phase)*0.5;}const glow=o.userData.ventGlow as {phase:number}|undefined;if(glow){const sc=1+0.25*Math.sin(t*3+glow.phase);o.scale.set(sc,sc,sc);}const lure=o.userData.anglerLure as {baseY:number;phase:number}|undefined;if(lure){o.position.y=lure.baseY+Math.sin(t*2+lure.phase)*0.3;}const train=o.userData.trainAnim as {speed:number;range:number}|undefined;if(train){o.position.z=-15+Math.sin(t*0.6)*18;}const plane=o.userData.planeAnim as {speed:number;range:number}|undefined;if(plane){o.position.z=-20+((t*plane.speed)%plane.range);}const crane=o.userData.craneSway as {phase:number}|undefined;if(crane){o.rotation.y=Math.sin(t*0.4+crane.phase)*0.12;}});
};
