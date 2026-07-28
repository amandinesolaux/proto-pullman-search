# BRAND PRESETS — réglages de marque réutilisables

Réglages **validés** par marque, pour ne pas re-saisir à chaque proto. La skill lit ce fichier au
début et **réutilise** le preset si la marque y figure ; elle le **crée/met à jour** à la fin quand un
réglage a été validé. Décentralisé : chaque designer accumule les marques qu'il traite.

Voir `BRANDING.md` pour le "comment", ici c'est le "quoi" déjà éprouvé.

---

_(Base vanilla : **aucun preset de marque**. Chaque designer remplit le gabarit ci-dessous pour sa
première marque, puis le réutilise. Les presets sont spécifiques à une marque — inutiles pour les autres.)_

## (GABARIT — dupliquer ce bloc pour une nouvelle marque, le renommer, le remplir)
## <marque> — statut : à valider
- **Classe body** : `brand-<marque>` (vérifier qu'elle existe dans `core/tokens/brands.css`)
- **Polices** : display `<…>`, body `<…>` (cf. table BRANDING.md). `.woff2` fournis ? **oui/non**. Si non → fallback système (limite assumée).
  - `@font-face` à ajouter dans `welds.css` (modèle dans BRANDING.md).
- **Logo** : snippet à coller AVANT `components.js` (SVG en currentColor, mono `viewBox 0 0 44 44`, wordmark ~172×14) :
  ```html
  <script>
    window.WD_BRAND = {
      name: "<Nom marque>",
      wordmark: `<svg viewBox="0 0 172 14">…</svg>`,
      mono: `<svg viewBox="0 0 44 44">…</svg>`
    };
  </script>
  ```
- **Devise / langue** : `<€/$/…>` / `<FR/EN/…>`
- **Quirks** : `<pièges rencontrés sur cette marque, ou "RAS">`
