"""SVG frame generator for a simple expressive stickman."""
import math, html
W, H = 720, 1280
def _line(x1,y1,x2,y2,width=12,color="#171923"):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
def stickman_svg(t, action="idle", background="#F4F7FB", caption=""):
    cx,cy=W*.5,H*.55; bob=math.sin(t*5)*8; lean=0
    arm=math.sin(t*7)*24; leg=math.sin(t*7)*28
    if action=="run": arm,leg,bob=math.sin(t*12)*55,math.sin(t*12)*48,abs(math.sin(t*12))*24
    elif action=="walk": arm,leg=math.sin(t*6)*28,math.sin(t*6)*22
    elif action=="jump": bob=-abs(math.sin(t*3))*150; arm=-40
    elif action=="wave": arm=-65+math.sin(t*9)*15
    elif action=="fight": lean,arm,leg=22,math.sin(t*15)*65,math.sin(t*15)*25
    elif action=="celebrate": arm,bob=-75,abs(math.sin(t*7))*18
    head_y=cy-210+bob; body_top,body_bottom=cy-150+bob,cy+75+bob
    left_hand=(cx-105-arm*.25,cy-35+bob+arm*.35); right_hand=(cx+105+arm*.25,cy-35+bob-arm*.35)
    left_foot=(cx-65-leg,cy+245+bob); right_foot=(cx+65+leg,cy+245+bob)
    caption=html.escape(caption)
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',f'<rect width="100%" height="100%" fill="{background}"/>','<circle cx="580" cy="160" r="72" fill="#FFFFFF" opacity=".55"/>','<path d="M0 1030 Q180 980 360 1030 T720 1010 V1280 H0Z" fill="#FFFFFF" opacity=".55"/>',f'<ellipse cx="{cx}" cy="{cy+270+bob}" rx="115" ry="20" fill="#172033" opacity=".12"/>',f'<circle cx="{cx}" cy="{head_y}" r="58" fill="#FFFFFF" stroke="#171923" stroke-width="13"/>',f'<circle cx="{cx-19}" cy="{head_y-8}" r="5" fill="#171923"/>',f'<circle cx="{cx+19}" cy="{head_y-8}" r="5" fill="#171923"/>',f'<path d="M{cx-16} {head_y+20} Q{cx} {head_y+33} {cx+16} {head_y+20}" fill="none" stroke="#171923" stroke-width="6" stroke-linecap="round"/>',_line(cx,body_top,cx+lean,body_bottom,15),_line(cx+lean,cy-105+bob,*left_hand,13),_line(cx+lean,cy-105+bob,*right_hand,13),_line(cx+lean,body_bottom,*left_foot,14),_line(cx+lean,body_bottom,*right_foot,14)]
    if caption: parts += ['<rect x="45" y="80" width="630" height="120" rx="28" fill="#FFFFFF" opacity=".88"/>',f'<text x="360" y="150" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="30" font-weight="bold" fill="#171923">{caption[:58]}</text>']
    parts.append("</svg>"); return "".join(parts)
