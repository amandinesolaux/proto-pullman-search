# Backup - Homepage Pullman Stable

**Date** : 19 juin 2026 - 15:05:25
**Version** : Finale fonctionnelle après ~40 itérations
**Status** : ✅ Validée et stable

---

## Fichiers sauvegardés

1. **`brand-homepage.html`** - Page HTML complète
2. **`base.css`** - Styles core avec tous les fixes (carousel, callout, social)
3. **`pullman.css`** - Styles spécifiques marque Pullman
4. **`components.js`** - Web components JavaScript

---

## Caractéristiques de cette version

### ✅ Fonctionnel
- Page s'affiche correctement (scripts dans head)
- Serveur HTTP requis : `python3 -m http.server 8000`
- URL : `http://localhost:8000/pages/pullman/brand-homepage.html`

### ✅ Pixel-perfect Figma
- Référence : https://www.figma.com/design/4SGldt68F6BHgdChG6URdf/Test-skill?node-id=2-10186
- Gap carousel : 28px (mesuré Figma)
- Spacing sections : 120px (mesuré Figma)

### ✅ Wordings production
- Extraits depuis pullman.accor.com/fr.html
- Hero : "Des séjours inspirants à travers le monde"
- Navigation : "Destinations" (pas "Hôtels & Resorts")
- Instagram : "Rejoignez-nous sur Instagram" + "#Pullman"

### ✅ Sections corrigées
1. **Carousel destinations** - Horizontal avec scrollbar masqué
2. **Callout cards** - 4 par ligne, hauteurs égales
3. **Instagram** - Grille 7 images + 1 post texte + icônes réseaux sociaux

---

## Problèmes résolus

| Section | Problème | Solution |
|---------|----------|----------|
| Global | Page blanche | Scripts dans `<head>` + serveur HTTP |
| Carousel | Cards verticales | CSS fallback inline-block + scrollbar hidden |
| Callout | 3 cards au lieu de 4 | `font-size: 0` + flexbox gap |
| Instagram | 8 tentatives | Grid 3fr/1fr + sous-grille 4col + post carré |
| Wordings | Textes placeholder | Extraction pullman.accor.com |
| Spacing | Valeurs approximatives | Mesures Figma exactes |

---

## Comment restaurer cette version

1. **Copier les fichiers** :
   ```bash
   cp backups/2026-06-19_15-05-25/brand-homepage.html pages/pullman/
   cp backups/2026-06-19_15-05-25/base.css core/styles/
   cp backups/2026-06-19_15-05-25/pullman.css brands/pullman/
   cp backups/2026-06-19_15-05-25/components.js core/components/
   ```

2. **Lancer le serveur** :
   ```bash
   cd /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2
   python3 -m http.server 8000
   ```

3. **Ouvrir** : http://localhost:8000/pages/pullman/brand-homepage.html

---

## Notes importantes

⚠️ **Ne jamais modifier directement sans backup** - Toujours créer un nouveau backup avant modifications majeures

⚠️ **Serveur HTTP obligatoire** - Ne fonctionne PAS avec `file://` (CORS)

⚠️ **Web components** - Tous les composants ont CSS fallback + CSS transformé

⚠️ **Inline-block** - Évité partout, remplacé par flexbox/grid

---

## Fichiers dépendants (ne pas modifier)

- `core/tokens/brands.css` - Tokens design system
- `brands/pullman/pullman.js` - Configuration marque (logo SVG)
- `brands/pullman/fonts/` - Polices Neue Power + Noto Sans

---

## Prochaines étapes possibles

- [ ] Ajouter responsive mobile
- [ ] Implémenter carrousels interactifs (navigation)
- [ ] Relier au vrai booking engine
- [ ] Ajouter animations scroll
- [ ] Optimiser images (lazy loading déjà présent)

---

**Backup créé automatiquement par Claude Code**
