#!/usr/bin/env bash
# snapshot.sh — RÉGRESSION VISUELLE : sauvegarde / compare un PNG de référence.
#   save  <page.html> [nom]   → rend la page et enregistre snapshots/<nom>.png (la référence)
#   check <page.html> [nom]   → rend la page et la compare à la référence (diff au pixel via diff.sh)
# But : automatiser le rayon d'impact — re-rendre + diff la bibliothèque (storybook) après toute modif
# de composant, au lieu de rendre chaque consommateur à la main. À lancer depuis la racine du projet.
set -euo pipefail
MODE="${1:?usage: snapshot.sh save|check <page.html> [nom]}"
PAGE="${2:?page.html manquante}"
NAME="${3:-$(basename "$PAGE" .html)}"
mkdir -p snapshots
bash scripts/render.sh "$PAGE" 1340 >/dev/null 2>&1 || { echo "render KO: $PAGE"; exit 1; }
case "$MODE" in
  save)
    cp /tmp/render.png "snapshots/$NAME.png"
    echo "référence sauvée : snapshots/$NAME.png" ;;
  check)
    [ -f "snapshots/$NAME.png" ] || { echo "pas de référence snapshots/$NAME.png — lance 'save' d'abord"; exit 1; }
    echo "diff $PAGE vs snapshots/$NAME.png :"
    bash scripts/diff.sh "snapshots/$NAME.png" /tmp/render.png "/tmp/snapcheck-$NAME" | head -3 ;;
  *) echo "mode inconnu: $MODE (save|check)"; exit 1 ;;
esac
