# scripts/ — outillage du kit welDS

Petits outils pour la création/remplissage de templates et leur vérification.
Utilisés par les skills `welds-create-template` et `welds-fill-template`.

| Script | Rôle |
|---|---|
| `render.sh <page.html> [w] [h] [out]` | Rendu headless (flags GPU pour backdrop-filter). `BANDS=1` découpe aussi en bandes de 1000px. |
| `dump-state.sh <page.html> [motif]` | États JS via dump-dom : erreurs console, sticky/aria/display, jetons `{{}}` & lorem restants. |
| `probe-img.sh <ID...>` | Valide des IDs image Scene7 : HTTP, taille (placeholder si < 10 ko), md5 (doublons). |
| `diff.sh <figma.png> <render.png> [out]` | **Diff AU PIXEL** : aligne, sort un côte-à-côte + carte de différence + % moyen + bandes les plus divergentes. Pour l'iso pixel-perfect (pas de jugement à l'œil sur miniature). |
| `snapshot.sh save\|check <page.html> [nom]` | **Régression visuelle** : `save` fige `snapshots/<nom>.png`, `check` re-rend et diff. Prouve qu'une modif de composant n'a rien cassé dans la bibliothèque. |
| `catalog.sh` | Génère `docs/COMPONENTS.md` = **catalogue** des `<wd-*>` + attributs (anti-doublon, rayon d'impact, contrat d'attributs). |
| `figma-capture.md` | Recette de capture Figma (sous-nodes, lecture couleur/texte, pièges timeout). |

Prérequis : Google Chrome (ou `$CHROME`), `python3` + Pillow (PIL), `curl`, `openssl`.

```sh
scripts/render.sh pages/sofitel/hotel-homepage-new-york.html
BANDS=1 scripts/render.sh templates/sofitel/hotel-homepage.html
scripts/dump-state.sh pages/sofitel/hotel-homepage-new-york.html
scripts/probe-img.sh 2509_acf_066 2509_acf_062 2511_acf_960
```
