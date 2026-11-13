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
    var sway := sin(phase) * 0.10 if walking else sin(t * 2.1) * 0.025
    var hip := root + Vector2(0, -125)
    var shoulder := root + Vector2(sway * 50.0, -430)
    var head := root + Vector2(sway * 65.0, -555)
    var leg_swing := sin(phase) * 0.58 if walking else 0.0
    var jump_spread := 0.32 if jumping else 0.0

    # Legs: articulated thigh/shin segments with rounded sneakers.
    for side in [-1, 1]:
        var hip_joint := hip + Vector2(float(side) * 31, 0)
        var knee := hip_joint + Vector2(float(side) * (18 + leg_swing * 42), 95 + absf(leg_swing) * 12)
        var ankle := knee + Vector2(float(side) * (18 + leg_swing * 45), 95 - absf(leg_swing) * 20)
        if jumping:
            knee.y -= 30.0
            ankle.y -= 80.0
            ankle.x += float(side) * 22.0
        _line(PackedVector2Array([hip_joint, knee, ankle]), INK, 13.0)
        var shoe := Rect2(ankle.x - 24, ankle.y - 5, 57, 25)
        draw_rect(shoe, Color("#26313a"), true)
        draw_rect(shoe, Color("#f8f7f3"), false, 4.0)
        draw_line(ankle + Vector2(-9, 2), ankle + Vector2(20, 2), Color("#f8f7f3"), 3.0)

    # Arms behind the hoodie; elbow positions change continuously with action.
    var left_shoulder := shoulder + Vector2(-52, 35)
    var right_shoulder := shoulder + Vector2(52, 35)
    var left_elbow := left_shoulder + Vector2(-45, 95)
    var right_elbow := right_shoulder + Vector2(45, 95)
    var left_hand := left_elbow + Vector2(-12, 90)
    var right_hand := right_elbow + Vector2(12, 90)
    if walking:
        left_elbow += Vector2(0, sin(phase + PI) * 30)
        right_elbow += Vector2(0, sin(phase) * 30)
        left_hand += Vector2(0, sin(phase + PI) * 55)
        right_hand += Vector2(0, sin(phase) * 55)
    if pointing:
        right_elbow = right_shoulder + Vector2(75, -30)
        right_hand = right_elbow + Vector2(95, -45)
    if talking:
        right_elbow = right_shoulder + Vector2(58, 60 + sin(t * 12) * 13)
        right_hand = right_elbow + Vector2(22, -45 + sin(t * 12) * 15)
    if jumping:
        left_elbow = left_shoulder + Vector2(-35, -85)
        right_elbow = right_shoulder + Vector2(35, -85)
        left_hand = left_elbow + Vector2(-12, -75)
        right_hand = right_elbow + Vector2(12, -75)
    _line(PackedVector2Array([left_shoulder, left_elbow, left_hand]), INK, 16.0)
    _line(PackedVector2Array([right_shoulder, right_elbow, right_hand]), INK, 16.0)

    # Hoodie silhouette and shaded folds.
    var torso := PackedVector2Array([
        shoulder + Vector2(-62, 0), shoulder + Vector2(62, 0),
        hip + Vector2(75, 0), hip + Vector2(-75, 0)
    ])
    draw_colored_polygon(torso, HOOD)
    draw_polyline(PackedVector2Array([torso[0], torso[1], torso[2], torso[3], torso[0]]), INK, 9.0, true)
    draw_colored_polygon(PackedVector2Array([
        shoulder + Vector2(-58, 8), shoulder + Vector2(-18, 25),
        hip + Vector2(-12, -5), hip + Vector2(-66, -8)
    ]), Color("#d3dde2"))
    draw_line(shoulder + Vector2(-10, 15), hip + Vector2(-15, -15), HOOD_SHADE, 5.0)
    # Hood/collar and pocket.
    draw_arc(shoulder + Vector2(0, 12), 66.0, 0.15, PI - 0.15, 32, HOOD_SHADE, 12.0)
    draw_rect(Rect2(hip.x - 47, hip.y - 74, 94, 38), HOOD_SHADE, false, 5.0)
    draw_line(shoulder + Vector2(-18, 34), shoulder + Vector2(-18, 112), HOOD_SHADE, 5.0)
    draw_line(shoulder + Vector2(18, 34), shoulder + Vector2(18, 112), HOOD_SHADE, 5.0)

    # Neck and large expressive face.
    draw_rect(Rect2(head.x - 18, head.y + 57, 36, 48), SKIN)
    draw_circle(head, 92.0, SKIN)
    draw_arc(head, 92.0, 0, TAU, 80, INK, 8.0)
    # Hair cap with swept spikes.
    var hair := PackedVector2Array([
        head + Vector2(-85, -20), head + Vector2(-102, -94),
        head + Vector2(-48, -70), head + Vector2(-10, -112),
        head + Vector2(18, -77), head + Vector2(78, -91),
        head + Vector2(90, -35), head + Vector2(48, -51),
        head + Vector2(-8, -43)
    ])
    draw_colored_polygon(hair, HAIR)
    draw_polyline(hair, INK, 7.0, true)
    # eyebrows and eyes
    draw_line(head + Vector2(-48, -12), head + Vector2(-18, -20), INK, 7.0)
    draw_line(head + Vector2(20, -20), head + Vector2(50, -12), INK, 7.0)
    _draw_oval(head + Vector2(-32, 12), Vector2(9, 15), INK)
    _draw_oval(head + Vector2(34, 12), Vector2(9, 15), INK)
    if talking:
        draw_arc(head + Vector2(0, 43), 17.0, 0, TAU, 24, INK, 6.0)
    else:
        draw_arc(head + Vector2(0, 25), 34.0, 0.2, PI - 0.2, 32, INK, 6.0)
    # Finger/point detail
    if pointing:
        draw_line(right_hand, right_hand + Vector2(22, -10), SKIN, 9.0)

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
