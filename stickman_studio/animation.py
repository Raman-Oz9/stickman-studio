"""Scene-aware procedural 2D animation for Stickman Studio.

The renderer builds layered environments and expressive, continuously animated
characters in SVG. No stock assets or paid generation APIs are required.
"""
import html
import math

W, H = 720, 1280
INK = "#111827"


def _line(x1, y1, x2, y2, width=12, color=INK):
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{color}" stroke-width="{width}" stroke-linecap="round" '
            'stroke-linejoin="round"/>')


def _environment(kind, t, bg):
    """Draw a distinct, layered setting instead of a blank pastel card."""
    p = [f'<rect width="{W}" height="{H}" fill="{bg}"/>']
    drift = math.sin(t * .35) * 18
    if kind == "space":
        p += ['<circle cx="570" cy="190" r="82" fill="#FDE68A"/>',
              '<circle cx="570" cy="190" r="82" fill="none" stroke="#FFFFFF" stroke-width="8" opacity=".5"/>']
        for i, (x, y, r) in enumerate([(80,160,3),(220,300,5),(610,430,3),(110,610,4),(520,720,3),(330,120,3),(650,900,4)]):
            p.append(f'<circle cx="{x}" cy="{y}" r="{r + (1 if int(t*4+i)%2 else 0)}" fill="#FFFFFF"/>')
        p += ['<path d="M-40 990 Q160 880 360 970 T760 920 V1280 H-40Z" fill="#475569"/>',
              '<path d="M0 1050 Q180 970 360 1040 T720 1000" fill="none" stroke="#94A3B8" stroke-width="8"/>']
    elif kind in ("city", "rooftop"):
        p += ['<circle cx="570" cy="170" r="65" fill="#FDE68A"/>']
        for i, (x, w, h) in enumerate([(0,125,440),(115,105,560),(215,140,380),(350,115,510),(455,130,420),(575,145,600)]):
            y = 930-h
            p.append(f'<rect x="{x+drift*(i%2):.1f}" y="{y}" width="{w}" height="{h}" fill="{["#334155","#475569","#64748B"][i%3]}"/>')
            for wx in range(int(x+18), int(x+w-10), 32):
                for wy in range(y+28, 900, 42):
                    p.append(f'<rect x="{wx}" y="{wy}" width="11" height="15" rx="2" fill="#FDE68A" opacity=".8"/>')
        p += ['<path d="M0 960 H720 V1280 H0Z" fill="#1E293B"/>',
              '<path d="M0 960 H720" stroke="#CBD5E1" stroke-width="10"/>']
    elif kind == "forest":
        p += ['<circle cx="560" cy="160" r="70" fill="#FDE68A"/>']
        for x, h in [(30,330),(135,430),(260,300),(465,410),(600,350)]:
            p.append(f'<path d="M{x} 1010 L{x+58} {1010-h} L{x+116} 1010Z" fill="#166534"/>')
            p.append(f'<path d="M{x+58} 1010 V{1010-h+80}" stroke="#854D0E" stroke-width="20"/>')
        p += ['<path d="M0 990 Q180 940 360 990 T720 970 V1280 H0Z" fill="#14532D"/>']
    else:  # workshop / interior
        p += ['<rect x="0" y="0" width="720" height="850" fill="#F8FAFC" opacity=".18"/>',
              '<path d="M0 900 H720 V1280 H0Z" fill="#64748B"/>',
              '<path d="M0 900 H720" stroke="#CBD5E1" stroke-width="10"/>',
              '<rect x="52" y="180" width="210" height="250" rx="14" fill="#BAE6FD" stroke="#334155" stroke-width="12"/>',
              '<path d="M157 180 V430 M52 305 H262" stroke="#FFFFFF" stroke-width="9"/>',
              '<rect x="475" y="660" width="190" height="24" rx="8" fill="#92400E"/>',
              '<path d="M495 684 V900 M645 684 V900" stroke="#78350F" stroke-width="18"/>']
    return "".join(p)


def _character(t, action, x, y, scale=1.0, color="#2563EB", accent="#F59E0B", facing=1):
    """An expressive character with articulated limbs and action-specific poses."""
    phase = t * (12 if action in ("run", "fight") else 7)
    bob = 0.0
    lean = 0.0
    arm = math.sin(phase) * 25
    leg = math.sin(phase) * 22
    if action == "run":
        bob = abs(math.sin(phase)) * -25
        arm, leg, lean = math.sin(phase)*62, math.sin(phase)*55, 18
    elif action == "walk":
        arm, leg = math.sin(phase)*34, math.sin(phase)*30
    elif action == "jump":
        bob = -abs(math.sin(t*3.2))*185
        arm, leg = -58, math.sin(phase)*18
    elif action == "wave":
        arm = -65 + math.sin(t*10)*18
    elif action == "fight":
        lean, arm, leg = 28, math.sin(phase)*75, math.sin(phase)*32
    elif action == "celebrate":
        arm, bob = -78, abs(math.sin(t*7))*-18
    elif action == "fall":
        lean, bob, arm = 48, abs(math.sin(t*5))*20, 55
    elif action == "think":
        arm, bob = -48, math.sin(t*2)*3
    head_y = y - 190 + bob
    shoulder_y, hip_y = y - 115 + bob, y + 90 + bob
    sx = x + lean
    lh = (x-105-arm*.3, y-30+bob+arm*.25)
    rh = (x+105+arm*.3, y-30+bob-arm*.25)
    lf = (x-60-leg, y+255+bob)
    rf = (x+60+leg, y+255+bob)
    def tr(px, py): return (x + (px-x)*facing, py)
    lh, rh, lf, rf = map(lambda q: tr(*q), (lh, rh, lf, rf))
    q = [f'<g transform="translate(0 0) scale({scale})">',
         f'<ellipse cx="{x}" cy="{y+275+bob}" rx="112" ry="17" fill="#020617" opacity=".22"/>',
         _line(sx, shoulder_y, sx, hip_y, 18, INK),
         _line(sx, shoulder_y, *lh, 15, INK),
         _line(sx, shoulder_y, *rh, 15, INK),
         _line(sx, hip_y, *lf, 17, INK),
         _line(sx, hip_y, *rf, 17, INK),
         f'<path d="M{x-30} {y-132+bob} Q{x} {y-160+bob} {x+30} {y-132+bob}" fill="none" stroke="{accent}" stroke-width="15" stroke-linecap="round"/>',
         f'<circle cx="{x}" cy="{head_y}" r="59" fill="#F8FAFC" stroke="{INK}" stroke-width="14"/>',
         f'<circle cx="{x-20}" cy="{head_y-8}" r="6" fill="{INK}"/>',
         f'<circle cx="{x+20}" cy="{head_y-8}" r="6" fill="{INK}"/>']
    if action == "think":
        q.append(f'<path d="M{x-16} {head_y+24} Q{x} {head_y+12} {x+16} {head_y+24}" fill="none" stroke="{INK}" stroke-width="6"/>')
        q.append(f'<circle cx="{x+94}" cy="{head_y-90}" r="8" fill="#FDE68A"/><circle cx="{x+116}" cy="{head_y-120}" r="13" fill="#FDE68A"/>')
    elif action in ("fight", "fall"):
        q.append(f'<path d="M{x-18} {head_y+27} L{x+18} {head_y+15}" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>')
    else:
        q.append(f'<path d="M{x-17} {head_y+22} Q{x} {head_y+39} {x+17} {head_y+22}" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>')
    q += [f'<path d="M{x-36} {y-85+bob} Q{x} {y-60+bob} {x+36} {y-85+bob}" fill="none" stroke="{color}" stroke-width="24" stroke-linecap="round"/>',
          f'<circle cx="{lh[0]:.1f}" cy="{lh[1]:.1f}" r="10" fill="#F8FAFC" stroke="{INK}" stroke-width="5"/>',
          f'<circle cx="{rh[0]:.1f}" cy="{rh[1]:.1f}" r="10" fill="#F8FAFC" stroke="{INK}" stroke-width="5"/>',
          '</g>']
    return "".join(q)


def stickman_svg(t, action="idle", background="#F4F7FB", caption="", scene=None):
    """Render one animated frame; scene is an optional story-scene dictionary."""
    scene = scene or {}
    kind = scene.get("setting", "workshop")
    safe_caption = html.escape(str(caption))
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">',
             _environment(kind, t, background)]
    # A scene prop that gives the character something to interact with.
    prop = scene.get("prop", "")
    if prop == "rocket":
        parts += ['<g transform="translate(490 650)">',
                  '<path d="M0 90 Q-45 10 0 -90 Q45 10 0 90Z" fill="#E2E8F0" stroke="#0F172A" stroke-width="9"/>',
                  '<circle cx="0" cy="10" r="17" fill="#38BDF8" stroke="#0F172A" stroke-width="7"/>',
                  '<path d="M-24 60 L-55 105 L-8 88 M24 60 L55 105 L8 88" fill="#EF4444" stroke="#0F172A" stroke-width="7"/>',
                  '<path d="M-12 90 Q0 150 12 90" fill="#F97316"/>','</g>']
    elif prop == "desk":
        parts += ['<rect x="430" y="720" width="220" height="18" rx="8" fill="#92400E"/>',
                  '<path d="M450 738 V900 M630 738 V900" stroke="#78350F" stroke-width="16"/>',
                  '<rect x="490" y="655" width="85" height="62" rx="7" fill="#0F172A"/>']
    elif prop == "sword":
        parts += ['<g transform="translate(510 690) rotate(-25)">',
                  '<path d="M0 0 L14 -190 L28 0Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="7"/>',
                  '<path d="M-18 0 H46 M14 0 V48" stroke="#92400E" stroke-width="13" stroke-linecap="round"/>','</g>']
    # Camera drift and layered character staging.
    drift = math.sin(t*.55) * 10
    parts.append(f'<g transform="translate({drift:.1f} 0)">')
    parts.append(_character(t, action, 330, 650, color=scene.get("shirt", "#2563EB"),
                            accent=scene.get("accent", "#F59E0B")))
    parts.append('</g>')
    # Action accents.
    if action in ("run", "fight", "jump"):
        for i in range(5):
            xx = 130 + i*28 + math.sin(t*9+i)*9
            yy = 820 + i*19
            parts.append(f'<path d="M{xx:.1f} {yy:.1f} l-35 12" stroke="#F8FAFC" stroke-width="6" opacity=".75"/>')
    if caption:
        parts += ['<rect x="38" y="55" width="644" height="116" rx="26" fill="#0F172A" opacity=".82"/>',
                  f'<text x="360" y="125" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="27" font-weight="bold" fill="#FFFFFF">{safe_caption[:66]}</text>']
    parts.append('</svg>')
    return "".join(parts)
