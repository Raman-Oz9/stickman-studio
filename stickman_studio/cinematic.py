"""High-quality 2D story renderer using Pillow + FFmpeg.

A deliberately different renderer from the old SVG pose loop: layered painted
backgrounds, articulated character joints, interpolated movement, prop animation,
particles, camera framing, and cinematic scene transitions.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random, subprocess, tempfile
from pathlib import Path

W, H = 720, 1280
FPS = 24
INK = (17, 24, 39)
WHITE = (248, 250, 252)

def ease(x):
    x = max(0.0, min(1.0, x))
    return x*x*(3-2*x)

def mix(a, b, t):
    return a + (b-a)*t

def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def gradient(top, bottom):
    im = Image.new("RGB", (W,H))
    px = im.load()
    for y in range(H):
        t = y/(H-1)
        c = tuple(int(mix(top[i],bottom[i],t)) for i in range(3))
        for x in range(W): px[x,y] = c
    return im

def glow(im, x, y, radius, color, alpha=100):
    layer = Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(*color,alpha))
    layer=layer.filter(ImageFilter.GaussianBlur(radius*.55))
    im.alpha_composite(layer)

def line(d, pts, fill=INK, width=12):
    d.line(pts, fill=fill, width=width, joint="curve")
    r=width/2
    for x,y in (pts[0],pts[-1]):
        d.ellipse((x-r,y-r,x+r,y+r),fill=fill)

def background(setting, t, seed=4):
    setting=(setting or "workshop").lower()
    if setting in ("space","outer_space"):
        im=gradient((7,12,38),(23,34,76)).convert("RGBA")
        glow(im,545,235,155,(91,130,255),85)
        d=ImageDraw.Draw(im)
        d.ellipse((455,145,635,325),fill=(242,226,190),outline=(255,255,255),width=5)
        d.ellipse((495,170,675,350),fill=(23,34,76))
        rng=random.Random(seed)
        for i in range(95):
            x=rng.randrange(W); y=rng.randrange(H); r=rng.choice([1,2,3])
            a=130+int(100*(.5+.5*math.sin(t*3+i)))
            d.ellipse((x-r,y-r,x+r,y+r),fill=(220,235,255,a))
        d.polygon([(0,1020),(140,940),(275,1015),(420,930),(720,1020),(720,1280),(0,1280)],fill=(39,53,92))
        d.polygon([(0,1100),(210,1030),(390,1110),(570,1025),(720,1080),(720,1280),(0,1280)],fill=(20,29,58))
    elif setting in ("city","rooftop"):
        im=gradient((22,37,70),(245,128,91)).convert("RGBA")
        glow(im,535,300,120,(255,208,120),120)
        d=ImageDraw.Draw(im)
        d.ellipse((470,235,600,365),fill=(255,218,145))
        rng=random.Random(seed)
        for i in range(13):
            x=i*62-15; bw=rng.randint(45,85); bh=rng.randint(250,570)
            top=875-bh
            col=rng.choice([(29,43,67),(39,52,76),(52,63,83)])
            d.rectangle((x,top,x+bw,1030),fill=col)
            for wx in range(x+10,x+bw-5,20):
                for wy in range(top+20,990,32):
                    if rng.random()>.35: d.rounded_rectangle((wx,wy,wx+8,wy+13),3,fill=(255,204,125,180))
        d.rectangle((0,1010,W,H),fill=(27,34,50))
        d.line((0,1010,W,1010),fill=(150,164,186),width=8)
        d.polygon([(0,1050),(720,1050),(720,1280),(0,1280)],fill=(34,43,61))
    elif setting=="forest":
        im=gradient((75,145,174),(207,213,160)).convert("RGBA")
        glow(im,530,240,100,(255,229,150),100)
        d=ImageDraw.Draw(im)
        d.ellipse((475,185,585,295),fill=(255,229,150))
        for layer,(col,base,scale) in enumerate([((42,103,83),900,1.0),((27,82,65),1020,1.2),((15,62,50),1130,1.4)]):
            for x in range(-80,850,145):
                h=int((260+((x*7)%170))*scale)
                d.polygon([(x,base),(x+72,base-h),(x+145,base)],fill=col)
        d.rectangle((0,1050,W,H),fill=(24,83,55))
    else:
        im=gradient((32,48,75),(192,132,90)).convert("RGBA")
        d=ImageDraw.Draw(im)
        # workshop wall, window and sunbeams
        d.polygon([(0,0),(720,0),(720,870),(0,870)],fill=(48,62,82,255))
        d.polygon([(0,0),(190,0),(490,870),(330,870)],fill=(255,221,155,23))
        d.rounded_rectangle((55,155,305,485),18,fill=(27,46,68),outline=(226,232,240),width=12)
        d.rectangle((70,170,290,470),fill=(105,174,194))
        d.line((180,170,180,470),fill=(230,241,235),width=8)
        d.line((70,320,290,320),fill=(230,241,235),width=8)
        d.rectangle((0,890,W,H),fill=(67,52,48))
        for y in range(900,1280,70): d.line((0,y,W,y+15),fill=(88,69,60),width=3)
        # workbench
        d.rounded_rectangle((420,710,690,750),10,fill=(124,76,46))
        d.rectangle((445,750,465,1000),fill=(78,49,38))
        d.rectangle((645,750,665,1000),fill=(78,49,38))
    return im

def draw_rocket(im, x, y, scale, flame, angle=0):
    layer=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer)
    # local transform around rocket center
    def tr(px,py):
        a=math.radians(angle); xx=px*scale; yy=py*scale
        return (x+xx*math.cos(a)-yy*math.sin(a), y+xx*math.sin(a)+yy*math.cos(a))
    body=[tr(0,-112),tr(-39,-30),tr(-35,65),tr(35,65),tr(39,-30)]
    d.polygon(body,fill=(231,237,244),outline=(20,31,49))
    d.line(body+[body[0]],fill=(20,31,49),width=max(2,int(6*scale)),joint="curve")
    cx,cy=tr(0,-20); r=17*scale
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(62,184,220),outline=(20,31,49),width=max(2,int(5*scale)))
    for side in [-1,1]:
        d.polygon([tr(side*28,35),tr(side*66,88),tr(side*28,72)],fill=(222,72,68),outline=(20,31,49))
    if flame:
        flick=math.sin(flame*19)*12
        d.polygon([tr(-20,65),tr(0,150+flick),tr(20,65)],fill=(255,130,48))
        d.polygon([tr(-10,70),tr(0,120+flick),tr(10,70)],fill=(255,220,113))
    im.alpha_composite(layer)

def draw_character(im, x, y, t, action, scale=1.0, color=(45,145,220), facing=1):
    layer=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer)
    phase=t*10
    stride=math.sin(phase)
    bob=0
    lean=0
    if action=="run":
        bob=-abs(math.sin(phase*1.0))*25; lean=16
        armL=math.sin(phase+math.pi)*.95; armR=math.sin(phase)*.95
        legL=math.sin(phase)*.9; legR=math.sin(phase+math.pi)*.9
    elif action in ("jump","launch"):
        bob=-abs(math.sin(t*3.2))*155-20; armL=-.95; armR=-.95
        legL=-.35; legR=.35
    elif action in ("celebrate","win"):
        bob=-abs(math.sin(t*6))*18; armL=-1.0; armR=-1.0
        legL=math.sin(phase)*.25; legR=-math.sin(phase)*.25
    elif action=="think":
        armL=-.55; armR=.35; legL=.04; legR=-.04
    elif action=="wave":
        armL=-.25; armR=-.9+math.sin(t*9)*.12; legL=.03; legR=-.03
    else:
        bob=math.sin(t*3)*4; armL=.12; armR=-.12; legL=.04; legR=-.04
    # coordinates relative to body anchor
    def p(px,py):
        return (x+facing*px*scale, y+(py+bob)*scale)
    head=p(0,-198)
    radius=44*scale
    # soft contact shadow
    d.ellipse((x-75*scale,y+215*scale,x+75*scale,y+235*scale),fill=(0,0,0,65))
    # neck and torso
    line(d,[p(0,-151),p(lean,-25)],INK,max(5,int(13*scale)))
    # arms with articulated elbows and hands
    for side,ang in [(-1,armL),(1,armR)]:
        shoulder=p(lean,-135)
        elbow=p(lean+side*(48+22*math.sin(ang*2)),-95+ang*42)
        hand=p(lean+side*(85+22*math.sin(ang*2)),-70+ang*95)
        line(d,[shoulder,elbow,hand],INK,max(5,int(11*scale)))
        hx,hy=hand; rr=8*scale
        d.ellipse((hx-rr,hy-rr,hx+rr,hy+rr),fill=WHITE,outline=INK,width=max(2,int(3*scale)))
    # legs, knees and shoes
    hip=p(lean, -25)
    for side,ang in [(-1,legL),(1,legR)]:
        knee=p(lean+side*(28+ang*30),70+abs(ang)*12)
        foot=p(lean+side*(45+ang*72),190+abs(ang)*9)
        line(d,[hip,knee,foot],INK,max(6,int(13*scale)))
        fx,fy=foot
        d.rounded_rectangle((fx-19*scale,fy-5*scale,fx+20*scale,fy+12*scale),radius=int(7*scale),fill=(26,35,52))
    # shirt / torso silhouette
    sx,sy=p(lean,-142); ex,ey=p(lean,-28)
    d.line((sx,sy,ex,ey),fill=color,width=max(8,int(25*scale)))
    # scarf / collar accent
    d.arc((sx-18*scale,sy-12*scale,sx+18*scale,sy+22*scale),0,180,fill=(255,190,83),width=max(3,int(7*scale)))
    hx,hy=head
    d.ellipse((hx-radius,hy-radius,hx+radius,hy+radius),fill=WHITE,outline=INK,width=max(4,int(9*scale)))
    # face direction
    eyeoff=14*scale*facing
    for ex in [hx-eyeoff-10*scale,hx-eyeoff+14*scale]:
        d.ellipse((ex-4*scale,hy-8*scale,ex+4*scale,hy+1*scale),fill=INK)
    if action=="think":
        d.arc((hx-13*scale,hy+8*scale,hx+15*scale,hy+28*scale),190,330,fill=INK,width=max(2,int(4*scale)))
    else:
        d.arc((hx-15*scale,hy+3*scale,hx+15*scale,hy+28*scale),15,160,fill=INK,width=max(2,int(4*scale)))
    im.alpha_composite(layer)

def draw_caption(im, text, progress, duration):
    if not text: return
    d=ImageDraw.Draw(im)
    f=font(31,True)
    # wrap to 34 chars
    words=str(text).split(); lines=[]; cur=""
    for word in words:
        trial=(cur+" "+word).strip()
        if d.textbbox((0,0),trial,font=f)[2] > 610 and cur:
            lines.append(cur); cur=word
        else: cur=trial
    if cur: lines.append(cur)
    lines=lines[:2]
    h=36+len(lines)*43
    alpha=int(245*min(1,progress/.35,(duration-progress)/.25 if duration>progress else 0))
    alpha=max(0,min(245,alpha))
    box=Image.new("RGBA",(W,H),(0,0,0,0)); bd=ImageDraw.Draw(box)
    bd.rounded_rectangle((32,68,688,68+h),24,fill=(9,17,32,alpha),outline=(255,255,255,int(alpha*.18)),width=2)
    for i,txt in enumerate(lines):
        bb=bd.textbbox((0,0),txt,font=f); tw=bb[2]-bb[0]
        bd.text(((W-tw)//2,88+i*43),txt,font=f,fill=(255,255,255,alpha))
    im.alpha_composite(box)

def render_frame(scene, local_t, scene_index, total_time, fmt, size, seed):
    global W,H
    W,H=size
    setting=scene.get("setting","workshop")
    action=scene.get("action","idle")
    duration=float(scene.get("duration",4))
    im=background(setting,local_t,seed)
    # vignette / cinematic framing
    vign=Image.new("RGBA",(W,H),(0,0,0,0)); vd=ImageDraw.Draw(vign)
    for k in range(12):
        pad=k*13
        vd.rounded_rectangle((pad,pad,W-pad,H-pad),radius=30,outline=(3,8,20,10+k*2),width=18)
    im.alpha_composite(vign)
    # foreground props and staging
    prop=scene.get("prop","")
    if prop=="rocket":
        launch=action in ("launch","jump","celebrate")
        lift=ease(min(1,max(0,(local_t-1.0)/max(.8,duration-1.0))) if launch else 0)
        rx=525-95*lift; ry=830-650*lift
        draw_rocket(im,rx,ry,0.9,local_t if launch and local_t>1 else 0,angle=-5*lift)
        if launch and local_t>1:
            d=ImageDraw.Draw(im)
            rng=random.Random(int(local_t*30)+seed)
            for i in range(18):
                px=rx+rng.randint(-65,65); py=ry+100+rng.randint(0,220)
                rr=rng.randint(2,7)
                d.ellipse((px-rr,py-rr,px+rr,py+rr),fill=(255,174,75,170))
    elif prop=="desk":
        d=ImageDraw.Draw(im)
        d.rounded_rectangle((400,755,690,790),10,fill=(132,82,48))
        d.rectangle((425,790,450,1040),fill=(76,49,39)); d.rectangle((645,790,670,1040),fill=(76,49,39))
        d.rounded_rectangle((505,695,585,750),8,fill=(35,49,66),outline=(220,230,240),width=4)
        d.line((520,710,570,710),fill=(90,190,220),width=4)
    # character travel and action
    if action=="run":
        cx=170+ease(local_t/duration)*330
    elif action=="launch":
        cx=260
    else:
        cx=270+math.sin(local_t*1.3)*18
    cy=830 if setting in ("city","rooftop") else 860
    if action in ("jump","launch"): cy=850
    shirt=scene.get("shirt","#2D91DC")
    try: color=tuple(int(shirt.lstrip("#")[i:i+2],16) for i in (0,2,4))
    except Exception: color=(45,145,220)
    draw_character(im,cx,cy,local_t,action,1.0,color,1)
    # cinematic action streaks
    if action in ("run","launch"):
        d=ImageDraw.Draw(im)
        for i in range(7):
            yy=cy-80+i*28
            d.line((max(5,cx-150-i*8),yy,cx-55,yy-8),fill=(255,255,255,90),width=3)
    # subtle camera push-in via crop/resize
    zoom=1.0+0.025*ease(local_t/duration)
    if zoom>1:
        nw,nh=int(W*zoom),int(H*zoom)
        im=im.resize((nw,nh),Image.Resampling.LANCZOS)
        left=(nw-W)//2; top=(nh-H)//2
        im=im.crop((left,top,left+W,top+H))
    caption=scene.get("visual",scene.get("caption",""))
    draw_caption(im,caption,local_t,duration)
    # fade transitions between scenes
    fade=min(1.0,local_t/.35,(duration-local_t)/.3)
    fade=max(0.0,fade)
    if fade<1:
        overlay=Image.new("RGBA",(W,H),(4,8,18,int(255*(1-fade))))
        im.alpha_composite(overlay)
    return im.convert("RGB")

def render_cinematic(data, fmt="short", outdir="output", fps=FPS):
    _check = subprocess.run(["ffmpeg","-version"],capture_output=True)
    if _check.returncode: raise RuntimeError("FFmpeg is required")
    scenes=data.get("scenes",[])
    if not scenes: raise ValueError("No scenes in story")
    size=(720,1280) if fmt=="short" else (1280,720)
    out=Path(outdir); out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        frame_dir=Path(td)/"frames"; frame_dir.mkdir()
        frame_no=0
        for si,scene in enumerate(scenes):
            duration=float(scene.get("duration",4))
            for fi in range(max(1,int(duration*fps))):
                t=fi/fps
                frame=render_frame(scene,t,si,sum(float(s.get("duration",4)) for s in scenes[:si])+t,fmt,size,si*101+9)
                frame.save(frame_dir/f"f{frame_no:06d}.jpg",quality=94,subsampling=0)
                frame_no+=1
        final=out/f"video_{fmt}.mp4"
        subprocess.run(["ffmpeg","-y","-framerate",str(fps),"-i",str(frame_dir/"f%06d.jpg"),
                        "-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p",
                        "-r",str(fps),"-movflags","+faststart",str(final)],check=True)
    return final
