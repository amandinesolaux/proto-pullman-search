# brands/ — couches de marque (à créer en local)

La base welDS est **agnostique**. Chaque marque pose sa couche ici, **hors plugin partagé**
(polices sous licence, logo). Crée `brands/<marque>/` avec :

```
brands/<marque>/
  <marque>.css     # @font-face des VRAIES polices + ajustements mesurés
  <marque>.js      # logo : window.WD_BRAND = { name, wordmark, mono }
  fonts/           # .woff2 sous licence (locaux, non distribués)
```

## Ce que la couche fait
- **Couleurs & noms de police** : déjà gérés par les tokens (`core/tokens/brands.css`) via
  `body.brand-<marque>` → se re-skinnent tout seuls. Vérifie que ta marque existe dans `brands.css`.
- **Polices réelles** : dépose les `.woff2` dans `fonts/`, déclare les `@font-face` dans `<marque>.css`,
  et réécris `--font-serif` / `--font-sans` pour placer ta police AVANT les fallbacks OSS de la base.
  Sans fichiers → fallback Playfair/Poppins (pas une erreur, à signaler).
- **Logo** : `window.WD_BRAND = { name, wordmark, mono }` dans `<marque>.js` (SVG en `currentColor`,
  `mono` viewBox `0 0 44 44`, `wordmark` ratio ~172×14). Sans ça → logo NEUTRE placeholder.

## Ordre de chargement dans une page
`core/tokens/*` → `core/styles/base.css` → `brands/<marque>/<marque>.css`, puis en fin de body
`brands/<marque>/<marque>.js` → `core/components/components.js`.

Détails et exemples : `../docs/BRANDING.md`. Pour maintenir un master : skill `welds-component`.
