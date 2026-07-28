# Adapter le kit à une autre marque (Ibis, Pullman, Fairmont…)

Le kit est agnostique de la marque. Le proto Sofitel est juste le **défaut**. Pour produire un proto fidèle d'une autre marque, 3 étapes. Aucune n'exige de toucher au cœur des composants.

## Étape 1 — La classe de marque (couleurs + noms de police : automatique)

Sur le `<body>`, mettre la classe de la marque :
```html
<body class="brand-pullman">   <!-- au lieu de brand-sofitel -->
```
Marques disponibles dans `core/tokens/brands.css` : `sofitel, fairmont, pullman, raffles, ibis, novotel, mgallery, movenpick, handwritten, swissotel, all, brandbook`.

Effet immédiat : toutes les **couleurs** se re-skinnent (accent, encre, surfaces…), et les **noms de police** de la marque sont injectés dans `--font-serif` / `--font-sans` / `--font-meta`. Il reste juste à fournir les fichiers de police (étape 2).

## Étape 2 — Les fichiers de police (le seul vrai travail manuel)

Chaque marque a ses familles (déjà câblées via les tokens). Le travail manuel se fait **dans la couche de la marque** : déposer les `.woff2` **sous licence** dans `brands/<marque>/fonts/` et ajouter les `@font-face` dans `brands/<marque>/<marque>.css`. La base (le plugin) n'embarque QUE des **fallbacks libres** (`Serif Fallback` = Playfair, `Sans Fallback` = Poppins) ; sans vos fichiers, la marque rend avec ces équivalences (pas une erreur, juste moins fidèle). La vraie police déposée reprend la main.

| Marque | Titres (display) | Corps (body) | Fichiers à fournir ? |
|---|---|---|---|
| sofitel | Romie | GT America LV | dans `brands/sofitel/fonts/` |
| fairmont | Silk Serif | Montserrat | Silk Serif (licence) ; Montserrat = Google Fonts |
| pullman | Pullman Neue Power | Noto Sans | Pullman Neue Power (licence) ; Noto Sans = Google Fonts |
| raffles | Canela | Lato | Canela (licence) ; Lato = Google Fonts |
| mgallery | The Seasons | MGallery Cera | les deux sous licence |
| movenpick | Gloock | Noto Sans | Gloock + Noto Sans = Google Fonts |
| swissotel | New Title | Satoshi | sous licence |
| handwritten | Darker Grotesque | Darker Grotesque | Google Fonts |
| novotel | Roboto | Roboto | Google Fonts |
| ibis | Arial | Arial | système, rien à fournir |
| all / brandbook | Montserrat / Roboto | Roboto | Google Fonts |

Exemple de `@font-face` (dans `brands/<marque>/<marque>.css` ; fichiers dans `brands/<marque>/fonts/`) :
```css
@font-face {
  font-family: 'The Seasons';
  src: url('fonts/TheSeasons-Regular.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
```
Puis placer la vraie police EN TÊTE du stack dans la même couche :
`body.brand-<marque> { --font-serif: 'The Seasons', 'Serif Fallback', Georgia, serif; }`

## Étape 3 — Le logo et le monogramme

Le wordmark (logo texte) et le monogramme sont des SVG. Par défaut = **placeholder NEUTRE** (plus de Sofitel). Le logo de marque se définit dans `brands/<marque>/<marque>.js` (`window.WD_BRAND`), chargé **avant** `components.js` :
```html
<script>
  window.WD_BRAND = {
    name: "Pullman",
    wordmark: `<svg viewBox="0 0 172 14" ...>…</svg>`,   // logo texte de la marque
    mono: `<svg viewBox="0 0 44 44" ...>…</svg>`          // monogramme de la marque
  };
</script>
<script src="../core/components/components.js"></script>
```
Contraintes des SVG :
- `fill="currentColor"` (la couleur vient des tokens de marque, ne pas figer une couleur).
- `mono` : `viewBox="0 0 44 44"`.
- `wordmark` : ratio proche de `172 × 14`.

`name` sert aussi à l'aria-label et au copyright du footer. Le template `templates/sofitel/hotel-homepage.html` contient déjà ce bloc commenté (avant `components.js`).

Alternative ponctuelle : surcharger un seul composant par attribut, ex. `<wd-header wordmark="<svg…>">` ou `<wd-mono mono="<svg…>">`.

## Ce que le kit NE fait PAS (limites connues)

- **Langue** : le chrome d'UI est codé en dur en français ("Voir les tarifs", calendrier, footer…). Passer à l'anglais = chantier i18n séparé.
- **Graisses de titre** : seules les familles et couleurs se re-skinnent. Les graisses (ex. Sofitel titres en 400) ne suivent pas les tokens `--font-weight-*`.
- **Fichiers de police sous licence** : à la charge du designer (le kit ne les embarque pas, sauf Sofitel).
- **Contenu** : le contenu (nom d'hôtel, photos, prix, textes) se remplit via le template + la skill `welds-fill-template`.

## Vérifier qu'une marque est bien prise en compte

Ouvrir la page et, en console :
```js
getComputedStyle(document.body).getPropertyValue('--font-serif')   // doit contenir la police titres de la marque
document.querySelector('.wd-header__mono svg')                     // doit être le SVG de la marque si WD_BRAND.mono fourni
```
Le portfolio Accor en bas de footer (Raffles, Sofitel, MGallery, Fairmont…) reste affiché pour toutes les marques : c'est le portefeuille du groupe, normal.
