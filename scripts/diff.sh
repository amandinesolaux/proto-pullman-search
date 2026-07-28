#!/usr/bin/env bash
# diff.sh — comparaison AU PIXEL entre un rendu et une capture Figma (vérité terrain).
# Aligne les deux images à la même largeur, produit :
#   - <out>-side.png  : côte-à-côte (Figma | rendu)
#   - <out>-diff.png  : carte de différence (rouge = écart)
#   - un score moyen de différence (%) + zones les plus divergentes (bandes de 100px).
# But : remplacer le jugement à l'œil sur miniatures par une mesure objective, section par section.
#
# Usage : scripts/diff.sh <figma_capture.png> <render.png> [out_prefix]
#   ex.  : scripts/diff.sh /tmp/figma_loyalty.png /tmp/render_loyalty.png /tmp/cmp_loyalty
set -euo pipefail

REF="${1:?capture Figma (vérité terrain) manquante}"
GOT="${2:?rendu manquant}"
OUT="${3:-/tmp/cmp}"

python3 - "$REF" "$GOT" "$OUT" <<'PY'
import sys
from PIL import Image, ImageChops, ImageOps
ref_p, got_p, out = sys.argv[1], sys.argv[2], sys.argv[3]
ref = Image.open(ref_p).convert("RGB")
got = Image.open(got_p).convert("RGB")

# aligner sur la même largeur (celle du rendu), puis recadrer à la hauteur commune
W = got.width
if ref.width != W:
    ref = ref.resize((W, round(ref.height * W / ref.width)))
H = min(ref.height, got.height)
ref = ref.crop((0, 0, W, H)); got = got.crop((0, 0, W, H))

# carte de différence (amplifiée pour la lisibilité)
diff = ImageChops.difference(ref, got)
gray = diff.convert("L")
heat = ImageOps.colorize(gray.point(lambda v: min(255, v*3)), black="black", white="red")
heat.save(f"{out}-diff.png")

# côte-à-côte : Figma (vérité) | rendu
side = Image.new("RGB", (W*2 + 16, H), "white")
side.paste(ref, (0, 0)); side.paste(got, (W + 16, 0))
side.save(f"{out}-side.png")

# scores
px = list(gray.getdata())
mean = sum(px) / len(px) / 255 * 100
print(f"difference moyenne : {mean:.2f}%  (0 = identique)")
print(f"cote-a-cote : {out}-side.png")
print(f"carte diff  : {out}-diff.png")

# bandes horizontales les plus divergentes (pour cibler quoi corriger)
band = 100; worst = []
for y in range(0, H, band):
    strip = gray.crop((0, y, W, min(y+band, H)))
    d = strip.getdata(); m = sum(d)/len(d)/255*100
    worst.append((m, y))
worst.sort(reverse=True)
print("bandes les plus divergentes (y -> %):")
for m, y in worst[:5]:
    print(f"  y={y:>5}-{min(y+band,H):<5} : {m:.1f}%")
PY
