# Vẽ nền giấy tiêu đề (header) và chân trang (footer) 300 dpi cho tao-mau-van-ban.js
# Chạy: python3 hanh-chinh-van-hanh/_cong-cu/tao-nen-tieu-de.py
import math, os, bisect
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.join(HERE, '..', '..', 'public', 'brand')
DPI = 300; S = 2  # supersample
cm = lambda v: round(v / 2.54 * DPI)
W = cm(21.0)
M = W / 1055.0  # 1 đơn vị trên bản phác thảo (rộng 1055) -> px
FONT = '/usr/share/fonts/truetype/liberation/LiberationSerif-%s.ttf'
SYM = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
DEEP = (10, 74, 80); TEAL = (16, 128, 118); TEAL2 = (24, 150, 136)
GOLD = (214, 160, 52); GOLD_L = (240, 196, 98)
INK = (12, 52, 58); INK2 = (28, 72, 78)
hexc = lambda c: c

def lerp(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
def smooth(x, pts):
    # nội suy cosine giữa các điểm (x, y) theo đơn vị bản phác thảo
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= x <= x1:
            t = (x - x0) / (x1 - x0); t = (1 - math.cos(t * math.pi)) / 2
            return y0 + (y1 - y0) * t
    return pts[-1][1] if x > pts[-1][0] else pts[0][1]

def band(img, top, bot, color_fn, step=1):
    """Tô vùng giữa 2 đường cong top(x), bot(x) (đơn vị phác thảo, oy = gốc)"""
    px = img.load(); w, h = img.size; k = w / 1055.0
    for X in range(w):
        x = X / k; y0 = top(x) * k; y1 = bot(x) * k
        if y1 <= y0: continue
        c = color_fn(x)
        for Y in range(max(0, int(y0)), min(h, int(math.ceil(y1)))):
            # khử răng cưa mép
            a = min(1.0, Y + 1 - y0, y1 - Y)
            if a <= 0: continue
            r, g, b = px[X, Y]
            px[X, Y] = tuple(round(c[i] * a + (r, g, b)[i] * (1 - a)) for i in range(3))

def recolor(im, teal_to, gold_to):
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            px[x, y] = (*(gold_to if r > b else teal_to), a)
    return im

def text(d, xy, s, size, style='Regular', fill=INK, spacing=0):
    f = ImageFont.truetype(FONT % style, round(size * M * S))
    x, y = xy[0] * M * S, xy[1] * M * S
    if not spacing:
        d.text((x, y), s, font=f, fill=fill, anchor='ls'); return
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill, anchor='ls'); x += f.getlength(ch) + spacing * M * S

# ---------------- HEADER ----------------
HH = 215  # chiều cao theo bản phác thảo
hdr = Image.new('RGB', (W * S, round(HH * M * S)), (255, 255, 255))
# quầng xanh bạc hà nhẹ góc phải trên
glow = Image.new('L', hdr.size, 0); gd = ImageDraw.Draw(glow)
gd.ellipse([hdr.width * 0.55, -hdr.height * 1.2, hdr.width * 1.35, hdr.height * 0.95], fill=150)
glow = glow.filter(ImageFilter.GaussianBlur(hdr.width * 0.05))
hdr = Image.composite(Image.new('RGB', hdr.size, (214, 238, 234)), hdr, glow)
def bez(p0, p1, p2, p3, n=600):
    """Đường cong Bézier bậc 3 -> hàm y(x) mượt (đơn vị phác thảo)"""
    xs, ys = [], []
    for i in range(n + 1):
        t = i / n; m = 1 - t
        xs.append(m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0])
        ys.append(m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1])
    def f(x):
        j = bisect.bisect_left(xs, x); j = min(max(j, 1), n)
        t = (x - xs[j-1]) / ((xs[j] - xs[j-1]) or 1); return ys[j-1] + (ys[j] - ys[j-1]) * t
    return f
ss = lambda t: (lambda u: u * u * (3 - 2 * u))(min(1, max(0, t)))  # smoothstep
U = bez((0, 150), (380, 176), (700, 214), (1055, 132))   # mép trên dải xanh
L0 = bez((0, 172), (420, 191), (720, 215), (1055, 155))  # mép dưới dải xanh
Lw = lambda x: max(L0(x), U(x) + 6)
tealc = lambda x: lerp(TEAL2, DEEP, ss(abs(x - 560) / 520) ** 0.9)
# vệt bạc hà rất nhẹ dưới sóng
band(hdr, lambda x: Lw(x), lambda x: Lw(x) + 14, lambda x: (234, 246, 244))
band(hdr, U, Lw, tealc)
# chỉ vàng mảnh: trái nằm dưới dải xanh, phải nằm trên – thon dần mượt
gl = lambda x: 5.5 * (1 - ss(x / 560))
band(hdr, lambda x: Lw(x) + 3, lambda x: Lw(x) + 3 + gl(x), lambda x: lerp(GOLD, GOLD_L, x / 560))
gr = lambda x: 7.5 * ss((x - 560) / 495)
band(hdr, lambda x: U(x) - 3.5 - gr(x), lambda x: U(x) - 3.5, lambda x: lerp(GOLD_L, GOLD, ss((x - 560) / 495)))

d = ImageDraw.Draw(hdr)
for x0, (y0, y1) in [(168, (48, 120)), (488, (48, 120))]:
    d.rectangle([x0 * M * S, y0 * M * S, x0 * M * S + 2.2 * S, y1 * M * S], fill=GOLD)
hdr = hdr.resize((W, round(HH * M)), Image.LANCZOS)
hdr.save(os.path.join(HERE, 'header-bg.png'), dpi=(DPI, DPI))

# ---------------- FOOTER ----------------
FH = 160; BT = 70  # cao tổng; mép trên dải đậm (đơn vị phác thảo, tính từ đỉnh ảnh)
ftr = Image.new('RGB', (W * S, round(FH * M * S)), (255, 255, 255))
u = lambda x: BT - 3 - 24 * ss((x - 300) / 755) ** 1.2
g = lambda x: 2.6 + 6 * ss((x - 300) / 755)
band(ftr, lambda x: u(x) - g(x), u, lambda x: lerp(GOLD, GOLD_L, min(1, x / 1055) ** 0.7))
band(ftr, lambda x: u(x) + 3, lambda x: FH, lambda x: lerp(DEEP, TEAL, ss((x - 400) / 655)))
band(ftr, lambda x: BT, lambda x: FH, lambda x: lerp(DEEP, (8, 62, 68), x / 1055))
d = ImageDraw.Draw(ftr)
Y = 110  # đường chân chữ
WHITE = (255, 255, 255); TAG = (246, 205, 112)
def icon(kind, cx, cy, r=9):
    cx, cy, r = cx * M * S, cy * M * S, r * M * S
    if kind == 'pin':
        d.ellipse([cx - r * .75, cy - r * 1.1, cx + r * .75, cy + r * .4], fill=GOLD_L)
        d.polygon([(cx - r * .62, cy - r * .1), (cx + r * .62, cy - r * .1), (cx, cy + r * 1.1)], fill=GOLD_L)
        d.ellipse([cx - r * .28, cy - r * .63, cx + r * .28, cy - r * .07], fill=DEEP)
    elif kind == 'globe':
        w = max(2, round(1.6 * S))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD_L, width=w)
        d.ellipse([cx - r * .45, cy - r, cx + r * .45, cy + r], outline=GOLD_L, width=w)
        d.line([cx - r, cy, cx + r, cy], fill=GOLD_L, width=w)
        d.line([cx, cy - r, cx, cy + r], fill=GOLD_L, width=w)
        for k in (-.5, .5): d.line([cx - r * .86, cy + r * k, cx + r * .86, cy + r * k], fill=GOLD_L, width=w)
    elif kind == 'mail':
        w = max(2, round(1.6 * S))
        d.rectangle([cx - r * 1.1, cy - r * .72, cx + r * 1.1, cy + r * .72], fill=GOLD_L)
        d.line([cx - r * 1.1, cy - r * .72, cx, cy + r * .1, cx + r * 1.1, cy - r * .72], fill=DEEP, width=w)
    elif kind == 'phone':
        f = ImageFont.truetype(SYM, round(r * 2.3)); d.text((cx, cy), '☎', font=f, fill=GOLD_L, anchor='mm')
icon('pin', 61, Y - 5)
icon('phone', 346, Y - 5)
icon('mail', 577, Y - 5)
icon('globe', 853, Y - 5)
for x0 in (307, 537, 808):
    d.rectangle([x0 * M * S, (Y - 19) * M * S, x0 * M * S + 2 * S, (Y + 7) * M * S], fill=GOLD)
ftr = ftr.resize((W, round(FH * M)), Image.LANCZOS)
ftr.save(os.path.join(HERE, 'footer-bg.png'), dpi=(DPI, DPI))
print('header', hdr.size, 'footer', ftr.size, 'cm', round(HH * 21 / 1055, 2), round(FH * 21 / 1055, 2))

# ---------------- LOGO độ phân giải cao (600 dpi) từ file gốc ref/Logo ----------------
SRC = os.path.join(HERE, '..', '..', 'ref', 'Logo', 'VIORA LIVING SAIGON_Logo Dọc_Nền sáng.png')
src = Image.open(SRC).convert('RGBA')
def crop_rows(im, y0, y1):
    part = im.crop((0, y0, im.width, y1)); return part.crop(part.getbbox())
mk = crop_rows(src, 0, 1840); wd = crop_rows(src, 1850, src.height)
# giữ nguyên màu gốc của logo (không đổi màu)
D2 = 600; k = D2 / 2.54 * (21.0 / 1055)  # px / đơn vị phác thảo ở 600 dpi
mh = round(80 * k); mk = mk.resize((round(mk.width * mh / mk.height), mh), Image.LANCZOS)
ww = round(262 * k); wd = wd.resize((ww, round(wd.height * ww / wd.width)), Image.LANCZOS)
LW, LH = round((450 - 54) * k), mh
logo = Image.new('RGBA', (LW, LH), (0, 0, 0, 0))
logo.alpha_composite(mk, (0, 0))
logo.alpha_composite(wd, (round((188 - 54) * k), round((LH - wd.height) / 2)))
logo.save(os.path.join(HERE, 'logo-hd.png'), dpi=(D2, D2))
print('logo', logo.size, 'cm', round(LW / D2 * 2.54, 3), round(LH / D2 * 2.54, 3))
