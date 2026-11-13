extends Node2D

const INK := Color("#171717")
const SKIN := Color("#fffefa")
const HOOD := Color("#e8edf0")
const HOOD_SHADE := Color("#aebfca")
const HAIR := Color("#56351f")
const BLUE := Color("#5484b4")
const DURATION := 8.0

var elapsed := 0.0
var capture_mode := false

func _ready() -> void:
    RenderingServer.set_default_clear_color(Color("#f5f3ee"))
    set_process(true)

func _process(delta: float) -> void:
    elapsed += delta
    if elapsed >= DURATION:
        elapsed = 0.0
    queue_redraw()

func _draw() -> void:
    var t := elapsed
    draw_rect(Rect2(0, 0, 720, 1280), Color("#f5f3ee"))
    _draw_background(t)
    var enter := smoothstep(0.0, 1.2, t)
    var exit := smoothstep(7.2, 8.0, t)
    var x := lerpf(-170.0, 360.0, enter)
    x = lerpf(x, 900.0, exit)
    var walk := t < 1.5 or (t > 5.8 and t < 7.1)
    var talk := t > 2.0 and t < 4.8
    var point := t > 4.8 and t < 5.8
    var jump := t > 1.4 and t < 2.0
    var phase := t * 10.0
    var bob := 0.0
    if walk:
        bob = absf(sin(phase)) * -13.0
    if jump:
        bob = -sin((t - 1.4) / 0.6 * PI) * 95.0
    var root := Vector2(x, 900.0 + bob)
    _draw_character(root, t, walk, talk, point, jump, phase)
    _draw_caption(t)

func _draw_background(t: float) -> void:
    # Warm illustrated room with a window, floor and layered silhouettes.
    draw_rect(Rect2(0, 0, 720, 930), Color("#e8e6e2"))
    draw_rect(Rect2(55, 170, 250, 320), Color("#a9c9d3"), true)
    draw_rect(Rect2(55, 170, 250, 320), Color("#30343b"), false, 9.0)
    draw_line(Vector2(180, 170), Vector2(180, 490), Color("#f5f3ee"), 7.0)
    draw_line(Vector2(55, 330), Vector2(305, 330), Color("#f5f3ee"), 7.0)
    draw_circle(Vector2(255, 240), 54, Color("#f8d79c"))
    # distant skyline outside window
    for i in range(5):
        var bx := 70.0 + i * 45.0
        draw_rect(Rect2(bx, 360.0 - float((i * 37) % 100), 25, 130), Color("#6d8790"))
    draw_rect(Rect2(0, 930, 720, 350), Color("#c7b9a9"))
    draw_line(Vector2(0, 930), Vector2(720, 930), Color("#54463e"), 10.0)
    for i in range(1, 8):
        draw_line(Vector2(0, 930 + i * 48), Vector2(720, 930 + i * 48), Color("#b4a393"), 2.0)
    # subtle floor shadow follows character
    var shadow_x := lerpf(-100.0, 360.0, smoothstep(0.0, 1.2, t))
    _draw_oval(Vector2(shadow_x, 1110), Vector2(105, 18), Color(0, 0, 0, 0.12))

func _draw_oval(center: Vector2, radius: Vector2, color: Color) -> void:
    var points := PackedVector2Array()
    for i in range(32):
        var a := TAU * float(i) / 32.0
        points.append(center + Vector2(cos(a) * radius.x, sin(a) * radius.y))
    draw_colored_polygon(points, color)

func _line(points: PackedVector2Array, color: Color = INK, width: float = 11.0) -> void:
    draw_polyline(points, color, width, true)
    for p in [points[0], points[points.size() - 1]]:
        draw_circle(p, width * 0.5, color)

func _draw_character(root: Vector2, t: float, walking: bool, talking: bool, pointing: bool, jumping: bool, phase: float) -> void:
    # Original streetwear cartoon hero: layered clothing, expressive face and
    # articulated limbs. Coordinates are local to the character root.
    var stride := sin(phase) if walking else 0.0
    var bounce := absf(sin(phase * 2.0)) * 7.0 if walking else 0.0
    var lean := sin(t * 2.0) * 2.0
    var hip := root + Vector2(lean, -205.0 + bounce)
    var shoulder := root + Vector2(lean, -475.0 + bounce)
    var head := root + Vector2(lean, -620.0 + bounce)
    var skin := Color("#8d4b2d")
    var skin_light := Color("#b86b43")
    var ink := Color("#17131a")
    var hoodie := Color("#171b28")
    var hoodie_light := Color("#30394c")
    var red := Color("#f04438")
    var shoe_white := Color("#f5f0e8")

    # Ground shadow and legs, animated at hip/knee/ankle joints.
    _draw_oval(root + Vector2(0, 8), Vector2(105, 17), Color(0,0,0,0.20))
    for side in [-1, 1]:
        var s := float(side)
        var hip_joint := hip + Vector2(s * 34.0, 0)
        var knee := hip_joint + Vector2(s * (17.0 + stride * 48.0), 105.0 - absf(stride) * 12.0)
        var ankle := knee + Vector2(s * (12.0 + stride * 53.0), 105.0 + absf(stride) * 10.0)
        if jumping:
            knee += Vector2(s * 22.0, -42.0)
            ankle += Vector2(s * 42.0, -95.0)
        # Cargo trousers with outlined thigh and shin panels.
        _line(PackedVector2Array([hip_joint, knee, ankle]), ink, 34.0)
        _line(PackedVector2Array([hip_joint, knee, ankle]), Color("#252b39"), 26.0)
        draw_line(hip_joint + Vector2(-10, 34), knee + Vector2(-8, -18), Color("#465064"), 3.0)
        draw_rect(Rect2(knee.x - 23.0, knee.y - 2.0, 43.0, 37.0), Color("#111722"), true)
        draw_rect(Rect2(knee.x - 23.0, knee.y - 2.0, 43.0, 37.0), ink, false, 3.0)
        # High-top sneakers, layered sole, toe cap and laces.
        var shoe := Rect2(ankle.x - 29.0, ankle.y - 9.0, 76.0, 43.0)
        draw_rect(shoe, red, true, 10.0)
        draw_rect(Rect2(shoe.position.x, shoe.position.y + 29.0, shoe.size.x, 13.0), shoe_white, true, 5.0)
        draw_rect(shoe, ink, false, 5.0)
        draw_line(ankle + Vector2(-1, 3), ankle + Vector2(26, 3), shoe_white, 4.0)
        draw_line(ankle + Vector2(4, 11), ankle + Vector2(25, 17), shoe_white, 3.0)
        draw_line(ankle + Vector2(4, 19), ankle + Vector2(25, 25), shoe_white, 3.0)

    # Neck and hood sit behind the torso.
    draw_rect(Rect2(head.x - 23.0, head.y + 72.0, 46.0, 68.0), skin, true)
    draw_rect(Rect2(head.x - 25.0, head.y + 72.0, 50.0, 42.0), skin_light, true)
    # Arms: shoulder, elbow and wrist positions change with each action.
    var ls := shoulder + Vector2(-67, 35)
    var rs := shoulder + Vector2(67, 35)
    var le := ls + Vector2(-55, 105)
    var re := rs + Vector2(55, 105)
    var lh := le + Vector2(-10, 88)
    var rh := re + Vector2(10, 88)
    if walking:
        le.y += sin(phase + PI) * 25.0
        re.y += sin(phase) * 25.0
        lh.y += sin(phase + PI) * 45.0
        rh.y += sin(phase) * 45.0
    if talking:
        re = rs + Vector2(65, 48 + sin(t * 11.0) * 17.0)
        rh = re + Vector2(25, -48 + sin(t * 11.0) * 12.0)
    if pointing:
        re = rs + Vector2(92, -45)
        rh = re + Vector2(105, -48)
    if jumping:
        le = ls + Vector2(-48, -100)
        re = rs + Vector2(48, -100)
        lh = le + Vector2(-5, -78)
        rh = re + Vector2(5, -78)
    _line(PackedVector2Array([ls, le, lh]), ink, 31.0)
    _line(PackedVector2Array([ls, le, lh]), hoodie, 23.0)
    _line(PackedVector2Array([rs, re, rh]), ink, 31.0)
    _line(PackedVector2Array([rs, re, rh]), hoodie, 23.0)
    # Hands and fingers.
    for hand in [lh, rh]:
        draw_circle(hand, 17.0, skin)
        draw_circle(hand + Vector2(3,-3), 11.0, skin_light)
    if pointing:
        draw_line(rh, rh + Vector2(31,-8), skin, 12.0)
        draw_circle(rh + Vector2(31,-8), 6.0, skin_light)

    # Oversized hoodie body, shoulder seams, hood, pocket and drawstrings.
    var body := PackedVector2Array([
        shoulder + Vector2(-76, 0), shoulder + Vector2(76, 0),
        hip + Vector2(82, 0), hip + Vector2(-82, 0)
    ])
    draw_colored_polygon(body, hoodie)
    draw_polyline(PackedVector2Array([body[0],body[1],body[2],body[3],body[0]]), ink, 10.0, true)
    draw_colored_polygon(PackedVector2Array([
        shoulder + Vector2(-69, 12), shoulder + Vector2(-25, 28),
        hip + Vector2(-34, -8), hip + Vector2(-75, -8)
    ]), hoodie_light)
    draw_colored_polygon(PackedVector2Array([
        shoulder + Vector2(69, 12), shoulder + Vector2(25, 28),
        hip + Vector2(34, -8), hip + Vector2(75, -8)
    ]), Color("#222a3b"))
    draw_arc(shoulder + Vector2(0, 18), 72.0, 0.05, PI - 0.05, 36, Color("#596276"), 9.0)
    draw_rect(Rect2(hip.x - 55, hip.y - 88, 110, 48), Color("#242c3c"), true, 9.0)
    draw_rect(Rect2(hip.x - 55, hip.y - 88, 110, 48), ink, false, 4.0)
    draw_line(shoulder + Vector2(-19, 48), shoulder + Vector2(-19, 128), red, 5.0)
    draw_line(shoulder + Vector2(19, 48), shoulder + Vector2(19, 128), red, 5.0)
    # Chest emblem.
    draw_colored_polygon(PackedVector2Array([
        shoulder + Vector2(0, 125), shoulder + Vector2(-22, 158),
        shoulder + Vector2(0, 150), shoulder + Vector2(22, 158)
    ]), shoe_white)
    draw_line(shoulder + Vector2(-10, 166), shoulder + Vector2(10, 166), red, 4.0)

    # Head, ears, hair silhouette and textured curls.
    draw_circle(head + Vector2(-88, 10), 20.0, skin)
    draw_circle(head + Vector2(88, 10), 20.0, skin)
    draw_circle(head, 104.0, skin)
    draw_arc(head, 104.0, 0, TAU, 90, ink, 9.0)
    # Afro silhouette with individual curls for a recognisable character.
    draw_circle(head + Vector2(0,-75), 91.0, ink)
    draw_circle(head + Vector2(-58,-83), 42.0, ink)
    draw_circle(head + Vector2(54,-87), 45.0, ink)
    for i in range(17):
        var a := PI + PI * float(i) / 16.0
        var p := head + Vector2(cos(a) * 88.0, -70.0 + sin(a) * 42.0)
        draw_circle(p, 13.0, Color("#35212a"))
        draw_circle(p + Vector2(-3,-3), 4.0, Color("#68402f"))
    # Brows, whites, pupils and highlights.
    draw_line(head + Vector2(-57,-17), head + Vector2(-17,-29), ink, 11.0)
    draw_line(head + Vector2(17,-29), head + Vector2(57,-17), ink, 11.0)
    _draw_oval(head + Vector2(-34, 10), Vector2(21, 25), Color.WHITE)
    _draw_oval(head + Vector2(34, 10), Vector2(21, 25), Color.WHITE)
    _draw_oval(head + Vector2(-29, 13), Vector2(10, 15), ink)
    _draw_oval(head + Vector2(39, 13), Vector2(10, 15), ink)
    draw_circle(head + Vector2(-32, 6), 4.0, Color.WHITE)
    draw_circle(head + Vector2(36, 6), 4.0, Color.WHITE)
    # Nose and expressive mouth.
    draw_line(head + Vector2(0, 22), head + Vector2(-5, 39), Color("#713a2a"), 4.0)
    if talking:
        _draw_oval(head + Vector2(3, 58), Vector2(18, 23), Color("#401c24"))
        draw_arc(head + Vector2(3, 58), 18.0, 0, PI, 24, Color("#f58b8b"), 5.0)
    else:
        draw_arc(head + Vector2(0, 43), 38.0, 0.15, PI - 0.15, 32, ink, 7.0)
    # Cheek highlights.
    draw_circle(head + Vector2(-65, 48), 8.0, Color("#d77b68", 0.55))
    draw_circle(head + Vector2(65, 48), 8.0, Color("#d77b68", 0.55))

func _draw_caption(t: float) -> void:
    var caption := ""
    if t < 1.5:
        caption = "MEET THE NEW HERO"
    elif t < 4.8:
        caption = "BIG IDEAS START SMALL"
    elif t < 6.2:
        caption = "LET'S MAKE IT HAPPEN"
    else:
        caption = "STICKMAN STUDIO"
    var font := ThemeDB.fallback_font
    var size := 36
    var width := font.get_string_size(caption, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
    draw_rect(Rect2(38, 70, 644, 78), Color("#171717", 0.82), true, 18.0)
    draw_string(font, Vector2((720.0 - width) / 2.0, 120), caption, HORIZONTAL_ALIGNMENT_LEFT, -1, size, Color.WHITE)
