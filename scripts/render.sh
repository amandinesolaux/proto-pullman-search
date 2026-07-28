#!/usr/bin/env bash
# render.sh — rendu headless d'une page welDS (kit Template-1.0).
# Flags GPU obligatoires pour backdrop-filter (verre dépoli du header) + virtual-time.
#
# Usage : scripts/render.sh <fichier.html> [largeur=1340] [hauteur=7800] [sortie=/tmp/render.png]
# Bandes : BANDS=1 scripts/render.sh page.html   → découpe aussi en bandes de ~1000px
#          (la fenêtre headless plafonne ~8000px : limite texture SwiftShader).
set -euo pipefail

FILE="${1:?usage: render.sh <fichier.html> [w] [h] [out.png]}"
W="${2:-1340}"; H="${3:-7800}"; OUT="${4:-/tmp/render.png}"

[ -f "$FILE" ] || { echo "fichier introuvable : $FILE" >&2; exit 2; }   # sinon Chrome rend sa page d'erreur (exit 0 = faux succès)
case "$W$H" in *[!0-9]*) echo "largeur/hauteur doivent être numériques (reçu: $W $H)" >&2; exit 2;; esac

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || CHROME="$(command -v google-chrome-stable || command -v chromium || command -v chrome || true)"
[ -n "$CHROME" ] || { echo "Chrome introuvable — exporte \$CHROME=chemin"; exit 1; }

[ "$H" -gt 8000 ] && echo "⚠ hauteur $H > 8000px : SwiftShader peut tronquer. Préfère rendre + cropper en bandes (BANDS=1)." >&2

ABS="$(cd "$(dirname "$FILE")" && pwd)/$(basename "$FILE")"
"$CHROME" --headless=new --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader \
  --hide-scrollbars --force-device-scale-factor=1 --window-size="$W,$H" \
  --virtual-time-budget=5000 --run-all-compositor-stages-before-draw \
  --screenshot="$OUT" "file://$ABS" 2>/dev/null

SIZE="$(python3 -c "from PIL import Image;print('x'.join(map(str,Image.open('$OUT').size)))" 2>/dev/null || echo '?')"
echo "$OUT ($SIZE)"

if [ "${BANDS:-0}" != "0" ]; then
  python3 -c 'import PIL' 2>/dev/null || { echo "BANDS requiert Pillow (pip install pillow)" >&2; exit 3; }
  python3 - "$OUT" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]); W, H = im.size
step = 1000
base = sys.argv[1].rsplit('.', 1)[0]
for i, y in enumerate(range(0, H, step)):
    p = f"{base}.band-{i:02d}.png"
    im.crop((0, y, W, min(y+step, H))).save(p); print(p)
PY
fi
