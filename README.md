# proto-factory — kit de prototypage welDS (Accor/ALL)

Composants agnostiques `<wd-*>`, tokens par marque, templates de pages, et skills de création/
remplissage. Empaqueté en **plugin Claude Code** installable au terminal. **La base est NEUTRE** :
aucune marque dedans. Les couleurs et noms de police se re-skinnent par `body.brand-<marque>` ;
les **vraies polices et logos de marque s'ajoutent en local** (voir plus bas).

## Structure

```
core/        BASE AGNOSTIQUE (distribuée dans le plugin)
  components/components.js   masters <wd-*> (light DOM, tokens, 0 hex)
  styles/base.css            styles partagés (aucune marque)
  tokens/base.css + brands.css   tokens welDS + valeurs par marque
  assets/                    fallbacks libres OSS (Playfair, Poppins)
  templates/                 hotel-homepage.html, brand-homepage.html (jetons {{...}})
  components.html            storybook NEUTRE
skills/      welds, welds-create-template, welds-fill-template, welds-component
scripts/     render.sh, dump-state.sh, diff.sh, probe-img.sh
docs/        DESIGN, BRANDING, LEARNINGS, brand-presets, guide.html

brands/      ← LOCAL (non distribué) : couches de marque + polices sous licence
  <marque>/<marque>.css, <marque>.js, fonts/
pages/       ← LOCAL (non distribué) : pages remplies par marque
```

## Installer (autres designers)

```bash
/plugin marketplace add <owner>/proto-factory      # repo GitHub de ce kit
/plugin install proto-factory@proto-factory-marketplace
```

Les skills deviennent disponibles : `/proto-factory:welds-create-template`, `/proto-factory:welds-fill-template`,
`/proto-factory:welds-component`, `/proto-factory:welds`.

## ⚠️ Ajouter vos polices de marque (étape obligatoire pour le rendu fidèle)

Le plugin **n'embarque AUCUNE police sous licence** (seulement les fallbacks libres Playfair/Poppins).
Pour qu'une marque rende avec ses vraies polices, **déposez vos fichiers `.woff2` sous licence** dans le
dossier de la marque, avec les **noms exacts** attendus par `brands/<marque>/<marque>.css` :

- **Sofitel** → `brands/sofitel/fonts/` : `Romie-Regular.woff2`, `GT-America-LV-Standard-Thin.woff2`,
  `GT-America-LV-Standard-Regular.woff2`.
- **MGallery** → `brands/mgallery/fonts/` : `TheSeasons-Regular.woff2` (+ `-Light`, `-Bold`),
  `MGalleryCera-Regular.woff2` (+ `-Light`, `-Bold`).

Sans ces fichiers, la marque rend avec les **équivalences libres** (pas une erreur, juste moins fidèle).
La vraie police déposée reprend automatiquement la main.

## Principe : base agnostique + couches par marque

- **Différence couleur / police / espacement** → tokens (`tokens/brands.css`), automatique.
- **Élément en plus/moins** → attribut optionnel sur le composant de base.
- **Variante de layout** → `variant="…"` sur le composant de base.
- **Spécificités de marque** (logo, vraies polices, ajustements mesurés) → couche `brands/<marque>/`.
- On **n'embarque jamais** de marque dans la base. Voir `docs/BRANDING.md`.

## Vérifier

```bash
scripts/render.sh pages/sofitel/hotel-homepage-new-york.html 1340   # rendu PNG
scripts/dump-state.sh <page.html>                                   # erreurs console + jetons restants
scripts/diff.sh <figma.png> <render.png>                            # diff au pixel (iso)
```
