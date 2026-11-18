// Universal procedural environment + civilization layer. No character/action code lives here.
// All geometry is assembled from flat primitives; drawWorld(params,t) is deterministic for a given time.
import * as THREE from "three";

export type TerrainType = "forest"|"jungle"|"ocean"|"ocean-floor"|"mountain"|"canyon"|"desert"|"ice"|"plain"|"river"|"coast"|"swamp"|"cave"|"savanna";
export type WeatherType = "clear"|"rain"|"snow"|"fog"|"storm"|"drought"|"wind";
export type EraType = "stone-age"|"ancient"|"classical"|"medieval"|"early-modern"|"industrial"|"modern"|"viking"|"renaissance"|"victorian"|"1920s"|"ww2"|"near-future"|"space-age"|"egyptian"|"roman"|"greek";
export type RegionType = "european"|"african"|"east-asian"|"south-asian"|"middle-eastern"|"mesoamerican";
export type ArtifactType = "pottery"|"coin"|"tool"|"weapon"|"tablet"|"scroll"|"jewellery"|"bone"|"ruins"|"excavation";
export type WorldParams = {
  terrain: TerrainType; climate?: string; weather?: WeatherType; season?: "spring"|"summer"|"autumn"|"winter";
  timeOfDay?: "dawn"|"noon"|"dusk"|"night"; era?: EraType; region?: RegionType; mapMode?: boolean;
  seed?: number; accentBeat?: number; accentEnabled?: boolean; label?: string; artifact?: ArtifactType;
};
const P = { earth:"#b99a6a", stone:"#71685c", shade:"#403c39", green:"#718b4c", sky:"#a9c7cf", accent:"#d2a34a", deep:"#174d68", reef:"#d47755", coral:"#df9b70", sand:"#d5bd8b" } as const;
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
  const ground=p.terrain==="ocean-floor"?P.sand:(p.weather==="rain"||p.weather==="storm")?P.shade:seasonGround(p);box(g,260,0.5,260,ground,0,-0.25,-45);
  if(p.terrain==="ocean-floor"){
    // The cast stands on a broad sandy seabed; a translucent animated surface and light shafts
    // establish that the whole set is submerged rather than a flat blue floor.
    box(g,180,.55,150,P.sand,0,-.28,-34);
    for(let i=0;i<16;i++){
      const x=(hash(i,4)-.5)*145,z=-8-hash(i,5)*105,r=1.2+hash(i,6)*3.2;
      const rock=ball(g,r,i%3===0?P.shade:P.stone,x,r*.32,z,1.2,.65,1.05);
      rock.rotation.y=hash(i,7)*Math.PI;
    }
    // Coral fans and branching reef clusters, with a restrained warm accent.
    for(let i=0;i<24;i++){
      const x=(hash(i,14)-.5)*140,z=-8-hash(i,15)*105,h=1.4+hash(i,16)*4.2;
      const stem=cylinder(g,.12+hash(i,17)*.12,h*.55,i%3===0?P.reef:P.coral,x,h*.275,z,7);
      stem.rotation.z=(hash(i,18)-.5)*.35;
      for(let b=0;b<3;b++){
        const branch=cylinder(g,.07,.8+hash(i,b+20)*1.2,P.coral,x+(b-1)*.42,h*.55,z,6);
        branch.rotation.z=(b-1)*.48;
      }
      for(let k=0;k<3;k++)ball(g,.24,i%2?P.reef:P.green,x+(k-1)*.38,h*.65,z,.75,1.35,.75);
    }
    // Small schools of fish animate as groups, staying inside the underwater scene.
    for(let school=0;school<4;school++){
      const sg=new THREE.Group();
      for(let j=0;j<7;j++){
        const fish=ball(sg,.42,j%3===0?P.accent:P.sky,j*.85,.0,(j%2)*.34,.95,.42,.5);
        fish.rotation.y=Math.PI/2;
        poly(sg,[[j*.85-.28,0,-.12],[j*.85-.85,.3,-.12],[j*.85-.85,-.3,-.12]],P.reef);
      }
      sg.position.set(-58+school*38,3+school%2*2,-22-school*17);
      sg.userData.swim={phase:school*1.7,baseX:sg.position.x,baseY:sg.position.y};
      g.add(sg);
    }
    // Soft shafts from the bright surface, plus a gently moving translucent wave sheet.
    for(let i=0;i<7;i++){
      const x=-68+i*22, ray=new THREE.Mesh(new THREE.ConeGeometry(3.2,18,8,1,true),new THREE.MeshBasicMaterial({color:"#b8e5e9",transparent:true,opacity:.075,depthWrite:false,side:THREE.DoubleSide}));
      ray.position.set(x,8,-42);ray.rotation.z=(i-3)*-.035;ray.userData.ray={phase:i*.8};g.add(ray);
    }
    const water=new THREE.Mesh(new THREE.PlaneGeometry(180,150,24,18),new THREE.MeshPhongMaterial({color:"#4c9eae",transparent:true,opacity:.24,shininess:90,side:THREE.DoubleSide,depthWrite:false}));
    water.rotation.x=-Math.PI/2;water.position.set(0,17,-34);water.userData.waveSurface=true;g.add(water);
  } else if(p.terrain==="ocean"||p.terrain==="river"||p.terrain==="coast"){
    // Open-water scenes get a real broad water body with layered wave crests, not a thin blue strip.
    const water=box(g,180,.55,120,P.sky,0,-.12,-38);
    water.userData.waterWave={phase:0,baseY:-.12};
    for(let i=0;i<46;i++){const x=(hash(i,4)-.5)*170,z=-5-hash(i,5)*105;const m=box(g,2+hash(i,6)*9,.035,.24,i%4===0?P.accent:P.sky,x,.19,z);m.userData.waveMark={phase:hash(i,7)*6.28,baseY:.19};}
    if(p.terrain!=="ocean")poly(g,[[-90,-.05,0],[-90,-.05,-14],[90,-.05,-14],[90,-.05,0]],P.earth);
  } else if(p.terrain==="canyon"){
    // Grand-canyon scale walls: stepped, stratified mesas frame a winding river gorge.
    box(g,190,.5,170,P.earth,0,-.25,-42);
    for(const side of [-1,1]){
      for(let i=0;i<8;i++){
        const x=side*(48+i*2.8),h=18+hash(i,side+30)*20,z=-42-hash(i,side+40)*34,w=14+hash(i,side+50)*9;
        const cliff=poly(g,[[x-w,0,z+24],[x-w*.72,h*.72,z],[x,h,z-16],[x+w*.72,h*.72,z],[x+w,0,z+24]],i%2?P.stone:P.shade);
        cliff.userData.canyonWall={side,index:i};
        for(let layer=0;layer<4;layer++){
          const yy=3+layer*3.7, inset=layer*.8;
          box(g,w*1.45-inset,.42,1.1,layer%2?P.earth:P.stone,x,yy,z+12-layer*3);
        }
      }
    }
    // Meandering river ribbon at the gorge floor, visible from elevated camera angles.
    for(let i=0;i<18;i++){
      const z=12-i*6,x=Math.sin(i*.34)*17;
      const bend=box(g,13,.16,7,P.sky,x,.02,z);bend.rotation.y=Math.sin(i*.34)*.22;
    }
    // Foreground hoodoos and rim rocks give the canyon a strong near-field scale cue.
    for(let i=0;i<9;i++){
      const x=-42+i*10.5,h=7+hash(i,61)*9;
      cylinder(g,2.3,h*.55,P.earth,x,h*.275,-7,7);
      ball(g,3.6,P.red,x,h*.62,-7,1.35,.48,1.05);
    }
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
  } else if(era==="modern"||era==="1920s"||era==="near-future"){
    for(let i=0;i<7;i++){
      const x=-30+i*10,h=era==="1920s"?14+hash(i,7)*20:era==="near-future"?24+hash(i,7)*28:10+hash(i,7)*18;
      box(g,8,h,8,P.stone,x,h/2,-30);
      for(let y=2;y<h-1;y+=2)for(let z=-3;z<=3;z+=2)box(g,.8,1,.08,P.sky,x+z,y,-25.9);
      if(era==="1920s")for(let tier=0;tier<3;tier++)box(g,8-tier*1.6,1.2,8-tier*1.6,P.earth,x,h+tier*1.2,-30);
      if(era==="near-future"){box(g,7,.18,3,P.green,x,h+.2,-30);cylinder(g,.12,3,P.accent,x,h+1.7,-30,8);}
    }
    box(g,90,.22,7,P.shade,0,.1,10);
    if(era==="near-future"){
      // Elevated transit spine and two support pylons make the skyline feel connected and inhabited.
      box(g,100,.55,3,P.shade,0,8,-48);for(const x of [-38,0,38])box(g,1,8,1,P.stone,x,4,-48);
      for(let i=0;i<8;i++)box(g,3,.16,2,P.sky,-35+i*10,8.4,-48);
    }
  } else if(era==="viking"){
    // Timber longhouse, carved gable ends and a shield line.
    box(g,34,7,13,P.earth,0,3.5,-28);
    poly(g,[[-20,7,-35],[0,14,-35],[20,7,-35]],P.shade);
    poly(g,[[-20,7,-21],[0,14,-21],[20,7,-21]],P.shade);
    for(let i=0;i<9;i++){const x=-15+i*3.75;box(g,.35,7,.35,P.stone,x,3.5,-35);cylinder(g,.48,.16,i%2?P.accent:P.red,x,2.3,-35,10);}
    // A beached longship silhouette and its mast.
    const hull=poly(g,[[-17,.5,4],[-12,2,0],[12,2,0],[17,.5,4],[0,.2,8]],P.earth);
    box(g,.32,10,.32,P.shade,0,5,3);poly(g,[[-.1,9,3],[5,7,3],[5,2,3],[-.1,2,3]],P.cream);
    for(let i=0;i<7;i++)cylinder(g,.12,.7,P.accent,-12+i*4,2.1,1,8);
    void hull;
  } else if(era==="renaissance"){
    // Palazzo facade, repeated arches and a central dome.
    box(g,46,13,10,P.earth,0,6.5,-34);
    for(let i=0;i<7;i++){const x=-20+i*6.6;cylinder(g,.42,8,P.stone,x,4,-28,12);box(g,5,.55,1.1,P.stone,x,8.3,-28);}
    box(g,49,.9,12,P.stone,0,13.4,-34);
    cylinder(g,7,2,P.stone,0,14.8,-34,20);ball(g,6,P.earth,0,18,-34,1,1.1,1);
    for(let i=0;i<5;i++)box(g,1.4,2.4,.3,P.sky,-16+i*8,3,-28);
  } else if(era==="victorian"){
    // Narrow terraced houses, chimney pots, bay windows and cast-iron street lamps.
    for(let i=0;i<5;i++){
      const x=-30+i*15,h=10+hash(i,81)*4;
      box(g,12,h,9,i%2?P.earth:P.stone,x,h/2,-34);
      poly(g,[[x-6,h,-39],[x,h+5,-39],[x+6,h,-39]],P.shade);
      for(let y=2;y<h-1;y+=2)box(g,1.3,1.1,.12,P.sky,x-3,y,-29.4);
      box(g,1.4,4,1.4,P.shade,x+3,h+2,-36);
    }
    for(const x of [-24,24]){cylinder(g,.12,6,P.shade,x,3,3,8);ball(g,.48,P.accent,x,6.2,3,.7,1.2,.7);}
  } else if(era==="ww2"){
    // Defensive concrete emplacement, sandbag lines and a shallow zig-zag trench.
    box(g,24,5,12,P.stone,0,2.5,-35);
    box(g,12,2,5,P.shade,0,5,-28);
    for(let i=0;i<18;i++){const side=i%2?1:-1,x=side*(8+(i%5)*2.5),z=4+Math.floor(i/5)*2;const bag=ball(g,.85,P.earth,x,.65,z,1.6,.55,.75);bag.rotation.y=side*.3;}
    for(let i=0;i<7;i++)box(g,1.2,1.2,1.2,P.shade,-18+i*6,.6,13+(i%2)*1.2,.35);
  } else if(era==="space-age"){
    // Landing apron, habitat domes and a communications mast.
    cylinder(g,22,.45,P.stone,0,.22,-32,48);cylinder(g,17,.08,P.sky,0,.5,-32,48);
    for(let i=0;i<3;i++){const x=-24+i*24;ball(g,6,P.earth,x,4,-45,1.4,.8,1.1);box(g,8,.35,1,P.stone,x,1,-45);}
    cylinder(g,.3,15,P.shade,30,7.5,-28,8);for(let i=0;i<4;i++)box(g,4,.22,.22,P.accent,30,12+i*.7,-28);
  } else if(era==="egyptian"){
    // Nile-side temple axis, obelisks and broad pyramidal silhouettes.
    for(const x of [-24,24]){
      poly(g,[[x-12,0,-42],[x,20,-42],[x+12,0,-42]],P.earth);
      cylinder(g,.85,11,P.stone,x,5.5,-18,8);poly(g,[[x-.85,11,-18],[x,15,-18],[x+.85,11,-18]],P.accent);
    }
    box(g,90,.18,7,P.sky,0,.02,12);
  } else if(era==="roman"||era==="greek"){
    box(g,34,1,18,P.earth,0,.5,-28);
    for(let i=0;i<9;i++){const x=-15+i*3.75;cylinder(g,.48,7,P.stone,x,4,-22,10);}
    box(g,36,.8,2,P.stone,0,7.8,-22);
    poly(g,[[-18,8.2,-23],[0,13,-23],[18,8.2,-23]],P.earth);
    for(let i=0;i<5;i++)box(g,26-i*3,.45,2,P.stone,0,.3+i*.5,-48-i*1.4);
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

export const drawWorld=(params:WorldParams,t:number):THREE.Group=>{
  const p: WorldParams={season:"summer",timeOfDay:"dawn",weather:"clear",era:"medieval",region:"african",...params};
  const g=new THREE.Group();g.name=p.mapMode?"HistoricalMapWorld":"ProceduralWorld";
  if(p.mapMode){mapLayer(g,p,t);g.scale.set(.5,1,.72);}else{
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
  g.traverse(o=>{const swim=o.userData.swim as {phase:number;baseX:number;baseY:number}|undefined;if(swim){o.position.x=swim.baseX+Math.sin(t*.55+swim.phase)*2.2;o.position.y=swim.baseY+Math.sin(t*1.3+swim.phase)*.35;o.rotation.y=Math.sin(t*.4+swim.phase)*.12;}const ray=o.userData.ray as {phase:number}|undefined;if(ray&&o instanceof THREE.Mesh&&o.material instanceof THREE.MeshBasicMaterial)o.material.opacity=.055+.025*(.5+.5*Math.sin(t*.7+ray.phase));const wave=o.userData.waveSurface as boolean|undefined;if(wave&&o instanceof THREE.Mesh){const a=o.geometry as THREE.PlaneGeometry,pos=a.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,Math.sin(x*.12+t*.8)*.18+Math.cos(y*.1-t*.6)*.12);}pos.needsUpdate=true;a.computeVertexNormals();}const water=o.userData.waterWave as {phase:number;baseY:number}|undefined;if(water)o.position.y=water.baseY+Math.sin(t*.8+water.phase)*.08;const mark=o.userData.waveMark as {phase:number;baseY:number}|undefined;if(mark)o.position.y=mark.baseY+Math.sin(t*.9+mark.phase)*.035;const routeIndex=o.userData.routeIndex as number|undefined;if(routeIndex!==undefined)o.visible=routeIndex<Math.floor(clamp(t/3)*26);const s=o.userData.sway as {phase:number;amp:number}|undefined;if(s)o.rotation.z=Math.sin(t*1.3+s.phase)*s.amp;const smoke=o.userData.smokeParticle as {phase:number;baseY:number}|undefined;if(smoke){o.position.y=smoke.baseY+((t*1.5+smoke.phase)%5);o.scale.setScalar(.7+((t*.35+smoke.phase)%1)*.5);}const w=o.userData.weatherParticle as {kind:string;baseX:number;baseY:number;baseZ:number;phase:number;index:number}|undefined;if(w){if(w.kind==="rain"||w.kind==="storm")o.position.y=2+((w.baseY-2-t*(w.kind==="storm"?14:8))%14+14)%14;else if(w.kind==="snow")o.position.y=2+((w.baseY-2-t*.8)%14+14)%14;else if(w.kind==="fog"){o.position.x=w.baseX+Math.sin(t*.12+w.phase)*2;o.position.y=w.baseY+Math.sin(t*.2+w.phase)*.2;}else o.position.x=w.baseX+Math.sin(t*.7+w.phase)*.8;}});
};
