# Vẽ nền giấy tiêu đề (header) và chân trang (footer) 300 dpi cho tao-mau-van-ban.js
# Chạy: python3 hanh-chinh-van-hanh/_cong-cu/tao-nen-tieu-de.py
import math, os
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
C = [(0, 166), (300, 192), (560, 204), (820, 178), (1055, 128)]
c = lambda x: smooth(x, C)
th = lambda x: smooth(x, [(0, 40), (260, 22), (540, 2.5), (800, 14), (1055, 42)])
tealc = lambda x: lerp(DEEP, TEAL2, min(1, abs(x - 520) / 520) ** 0.8) if x < 520 else lerp(TEAL2, DEEP, ((x - 520) / 535) ** 1.3)
# vệt sáng dưới sóng
band(hdr, lambda x: c(x) + th(x) * 0.4, lambda x: c(x) + th(x) * 0.4 + 26, lambda x: (232, 245, 243))
band(hdr, lambda x: c(x) - th(x) * 0.6, lambda x: c(x) + th(x) * 0.4, tealc)
# vàng: trái nằm dưới, phải nằm trên dải xanh
gl = lambda x: smooth(x, [(0, 13), (200, 7), (440, 0)])
band(hdr, lambda x: c(x) + th(x) * 0.4 + 3, lambda x: c(x) + th(x) * 0.4 + 3 + gl(x), lambda x: lerp(GOLD, GOLD_L, x / 440))
gr = lambda x: smooth(x, [(640, 0), (880, 8), (1055, 16)])
band(hdr, lambda x: c(x) - th(x) * 0.6 - 4 - gr(x), lambda x: c(x) - th(x) * 0.6 - 4, lambda x: lerp(GOLD_L, GOLD, (x - 640) / 415))

d = ImageDraw.Draw(hdr)
# logo: biểu tượng | chữ (đổi sang màu đậm để in rõ)
mark = Image.open(os.path.join(BRAND, 'mark.png')).convert('RGBA')
mh = round(80 * M * S); mark = mark.resize((round(mark.width * mh / mark.height), mh), Image.LANCZOS)
hdr.paste(mark, (round(54 * M * S), round(44 * M * S)), mark)
wm = recolor(Image.open(os.path.join(BRAND, 'wordmark.png')), DEEP, (196, 140, 34))
ww = round(262 * M * S); wm = wm.resize((ww, round(wm.height * ww / wm.width)), Image.LANCZOS)
hdr.paste(wm, (round(188 * M * S), round(54 * M * S)), wm)
for x0, (y0, y1) in [(168, (48, 120)), (488, (48, 120))]:
    d.rectangle([x0 * M * S, y0 * M * S, x0 * M * S + 2.2 * S, y1 * M * S], fill=GOLD)
text(d, (530, 66), 'CÔNG TY CỔ PHẦN VIORA LIVING SAIGON', 15.5, 'Bold', INK)
text(d, (530, 89), 'VIORA LIVING SAIGON CORPORATION', 13, 'Regular', TEAL, spacing=0.9)
f3 = 12
f = ImageFont.truetype(FONT % 'Regular', round(f3 * M * S)); x1 = 530 + f.getlength('MSDN 3703493386') / (M * S)
text(d, (530, 114), 'MSDN 3703493386', f3, 'Regular', INK2)
text(d, (x1 + 9, 114), '|', f3, 'Regular', GOLD)
text(d, (x1 + 22, 114), 'A147F KP. Bình Đức 2, P. Lái Thiêu, TP.HCM', f3, 'Regular', INK2)
hdr = hdr.resize((W, round(HH * M)), Image.LANCZOS)
hdr.save(os.path.join(HERE, 'header-bg.png'), dpi=(DPI, DPI))

# ---------------- FOOTER ----------------
FH = 160; BT = 70  # cao tổng; mép trên dải đậm (đơn vị phác thảo, tính từ đỉnh ảnh)
ftr = Image.new('RGB', (W * S, round(FH * M * S)), (255, 255, 255))
u = lambda x: smooth(x, [(0, BT - 3), (520, BT - 4), (820, BT - 18), (1055, 38)])
g = lambda x: smooth(x, [(0, 2.6), (520, 3.5), (820, 9), (1055, 15)])
band(ftr, lambda x: u(x) - g(x), u, lambda x: lerp(GOLD, GOLD_L, min(1, x / 1055) ** 0.7))
band(ftr, lambda x: u(x) + 3, lambda x: FH, lambda x: lerp(TEAL, DEEP, 1 - min(1, max(0, (x - 650) / 405))) if x > 650 else DEEP)
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
text(d, (86, Y), 'Where Aging Becomes Living', 14.5, 'Italic', TAG)
icon('phone', 346, Y - 5)
text(d, (372, Y), 'Hotline 0868 120 165', 14, 'Bold', WHITE)
icon('mail', 577, Y - 5)
text(d, (604, Y), 'contact@vioraliving.com.vn', 14, 'Regular', WHITE)
icon('globe', 853, Y - 5)
text(d, (880, Y), 'vioraliving.com.vn', 14, 'Regular', WHITE)
for x0 in (307, 537, 808):
    d.rectangle([x0 * M * S, (Y - 19) * M * S, x0 * M * S + 2 * S, (Y + 7) * M * S], fill=GOLD)
ftr = ftr.resize((W, round(FH * M)), Image.LANCZOS)
ftr.save(os.path.join(HERE, 'footer-bg.png'), dpi=(DPI, DPI))
print('header', hdr.size, 'footer', ftr.size, 'cm', round(HH * 21 / 1055, 2), round(FH * 21 / 1055, 2))
