#!/usr/bin/env bash
# dump-state.sh — état JS d'une page via --dump-dom (kit Template-1.0).
# Les états JS (filtres d'onglets, sticky au scroll, popovers, aria) NE se reflètent PAS
# dans un screenshot : on lit le DOM rendu. Sert aussi à vérifier qu'un template est bien
# rempli (plus aucun {{jeton}} ni "lorem ipsum").
#
# Usage : scripts/dump-state.sh <fichier.html> [motif-grep]
#   sans motif → erreurs console + états clés (sticky, aria, display:none, jetons restants)
set -uo pipefail

FILE="${1:?usage: dump-state.sh <fichier.html> [motif grep]}"
PAT="${2:-}"
[ -f "$FILE" ] || { echo "fichier introuvable : $FILE" >&2; exit 2; }   # sinon Chrome rend sa page d'erreur (faux 'OK')
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || CHROME="$(command -v google-chrome-stable || command -v chromium || command -v chrome || true)"
[ -n "$CHROME" ] || { echo "Chrome introuvable — exporte \$CHROME=chemin"; exit 1; }

ABS="$(cd "$(dirname "$FILE")" && pwd)/$(basename "$FILE")"
DOM="$(mktemp)"; LOG="$(mktemp)"
"$CHROME" --headless=new --window-size=1340,900 --virtual-time-budget=3500 \
  --run-all-compositor-stages-before-draw --enable-logging=stderr --v=0 \
  --dump-dom "file://$ABS" 2>"$LOG" > "$DOM"

echo "=== erreurs JS ==="
grep -iE 'uncaught|TypeError|ReferenceError|SyntaxError|is not a function|is not defined' "$LOG" \
  | grep -viE 'gpu|swiftshader|vulkan|ANGLE|gbm|gl |updater|crash reporting|VERBOSE' || echo "(aucune)"

if [ -n "$PAT" ]; then
  echo "=== motif: $PAT ==="
  grep -oE "$PAT" "$DOM" | sort | uniq -c
else
  echo "=== états clés ==="
  for k in 'class="wd-sticky[^"]*"' 'data-state="[^"]*"' 'aria-pressed="[^"]*"' 'aria-expanded="[^"]*"'; do
    grep -oE "$k" "$DOM" | sort | uniq -c
  done
  echo "display:none      : $(grep -oE 'display: *none' "$DOM" | wc -l | tr -d ' ')"
  # compter jetons/lorem SANS les commentaires HTML (la légende {{...}} du template en contient)
  NC="$(perl -0pe 's/<!--.*?-->//gs' "$DOM")"
  echo "jetons {{}} restants : $(printf '%s' "$NC" | grep -oE '\{\{[^}]+\}\}' | sort -u | wc -l | tr -d ' ')"
  echo "lorem ipsum restants : $(printf '%s' "$NC" | grep -oci 'lorem ipsum' | tr -d ' ')"
fi
rm -f "$DOM" "$LOG"
