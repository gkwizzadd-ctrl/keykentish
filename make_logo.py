from PIL import Image, ImageDraw, ImageFont

# ── Config ───────────────────────────────────────────────────
W_FONTS = r'C:\Windows\Fonts'
OUTPUT  = r'c:\AAA KeyKentish\Claude AI\WebsiteBuilder\Brand_assets\key-kentish-logo.png'

NAVY   = (10,  22,  40)
TEAL   = (0,  168, 148)   # slightly deeper — more refined, less neon
SILVER = (215, 223, 234)
WHITE  = (255, 255, 255)

# All geometry in 1× output pixels. SCALE only used when drawing.
SCALE  = 4
def s(n): return int(n * SCALE)   # to high-res coords
def sp(pt): return (s(pt[0]), s(pt[1]))

# ── Output dimensions ────────────────────────────────────────
H_OUT  = 420
CY     = H_OUT // 2
PAD_L  = 68
PAD_R  = 80

# ── Mark geometry (1× output px) ─────────────────────────────
CX     = PAD_L + 108
VX     = CX - 50
ARM_X  = CX + 50
HH     = 80
HUB_Y  = CY - 4
STK, NR, HR = 7, 11, 15

DIV_X  = CX + HH + 54      # vertical divider x (no enclosing circle)
TX     = DIV_X + 48        # wordmark left edge

# ── 1× fonts for measurement only ────────────────────────────
fm_brand = ImageFont.truetype(f'{W_FONTS}/corbelb.ttf',  76)
fm_tag   = ImageFont.truetype(f'{W_FONTS}/segoeuil.ttf', 25)

BRAND = 'KEY KENTISH'
TAG   = 'TELECOM  STRATEGY'

_tmp = Image.new('RGB', (2000, 200))
_d   = ImageDraw.Draw(_tmp)
bb   = _d.textbbox((0, 0), BRAND, font=fm_brand)
bt   = _d.textbbox((0, 0), TAG,   font=fm_tag)
bw, bh = bb[2]-bb[0], bb[3]-bb[1]
tw, th = bt[2]-bt[0], bt[3]-bt[1]

# ── Compute canvas width from actual text bounds ──────────────
W_OUT = TX + max(bw, tw) + PAD_R

# ── High-res canvas ──────────────────────────────────────────
img  = Image.new('RGBA', (s(W_OUT), s(H_OUT)), WHITE + (255,))
draw = ImageDraw.Draw(img)

# ── 4× fonts for rendering ───────────────────────────────────
f_brand = ImageFont.truetype(f'{W_FONTS}/corbelb.ttf',  s(76))
f_tag   = ImageFont.truetype(f'{W_FONTS}/segoeuil.ttf', s(25))

# ── K-Network mark ───────────────────────────────────────────
pts = {
    'TL':  (VX,    CY - HH),
    'BL':  (VX,    CY + HH),
    'HUB': (VX,    HUB_Y),
    'TR':  (ARM_X, CY - HH),
    'BR':  (ARM_X, CY + HH),
}

draw.line([sp(pts['TL']), sp(pts['BL'])],  fill=NAVY, width=s(STK))   # spine
draw.line([sp(pts['HUB']), sp(pts['TR'])], fill=TEAL, width=s(STK))   # upper (teal)
draw.line([sp(pts['HUB']), sp(pts['BR'])], fill=NAVY, width=s(STK))   # lower

# Two concentric signal arcs at TR — clean, elegant, unambiguous
trx, try_ = s(ARM_X), s(CY - HH)
for r in [s(20), s(36)]:
    draw.arc([trx-r, try_-r, trx+r, try_+r], start=248, end=328, fill=TEAL, width=s(3))

# Endpoint nodes: navy disc + white pip
for key in ['TL', 'BL', 'TR', 'BR']:
    x, y = s(pts[key][0]), s(pts[key][1])
    draw.ellipse([(x-s(NR), y-s(NR)), (x+s(NR), y+s(NR))], fill=NAVY)
    draw.ellipse([(x-s(3),  y-s(3)),  (x+s(3),  y+s(3))],  fill=WHITE)

# Hub node: navy ring, teal fill
hx, hy = s(pts['HUB'][0]), s(pts['HUB'][1])
draw.ellipse([(hx-s(HR),   hy-s(HR)),   (hx+s(HR),   hy+s(HR))],   fill=NAVY)
draw.ellipse([(hx-s(HR-4), hy-s(HR-4)), (hx+s(HR-4), hy+s(HR-4))], fill=TEAL)

# ── Vertical divider ─────────────────────────────────────────
draw.line([(s(DIV_X), s(CY-78)), (s(DIV_X), s(CY+78))], fill=SILVER, width=s(1))

# ── Wordmark: vertically centred block ───────────────────────
GAP    = s(10)
RULE_H = s(2)
# Use scaled text sizes for block height calc
bb4 = draw.textbbox((0,0), BRAND, font=f_brand)
bt4 = draw.textbbox((0,0), TAG,   font=f_tag)
bh4 = bb4[3]-bb4[1]
th4 = bt4[3]-bt4[1]
BLOCK = bh4 + GAP + RULE_H + GAP + th4
by0   = s(CY) - BLOCK // 2

draw.text((s(TX), by0), BRAND, font=f_brand, fill=NAVY)

# Teal rule: 48 % of brand width
bw4 = bb4[2] - bb4[0]
ry  = by0 + bh4 + GAP
draw.line([(s(TX), ry), (s(TX) + int(bw4 * 0.48), ry)], fill=TEAL, width=RULE_H)

# Tagline with +1 px letter tracking
TRACK = s(2)
tx_c  = s(TX)
ty0   = ry + RULE_H + GAP
for ch in TAG:
    draw.text((tx_c, ty0), ch, font=f_tag, fill=TEAL)
    cb   = draw.textbbox((tx_c, ty0), ch, font=f_tag)
    tx_c += (cb[2] - cb[0]) + TRACK

# ── Downsample → 300 dpi PNG ─────────────────────────────────
out = img.resize((W_OUT, H_OUT), Image.LANCZOS).convert('RGB')
out.save(OUTPUT, 'PNG', dpi=(300, 300))
print(f'DONE: {W_OUT}x{H_OUT}  ->  {OUTPUT}')
