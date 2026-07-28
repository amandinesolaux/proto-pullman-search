# 💾 Système de backup - Homepage Pullman

## Version stable sauvegardée

**Date** : 19 juin 2026 - 15:05:25
**Localisation** : `backups/2026-06-19_15-05-25/`
**Status** : ✅ Validée et stable

---

## 🚀 Restauration rapide

### Option 1 : Script automatique (recommandé)
```bash
./RESTORE-STABLE.sh
```

Le script va :
1. Sauvegarder tes fichiers actuels dans `backups/pre-restore-[date]/`
2. Restaurer la version stable du 19 juin 2026
3. Afficher les instructions pour lancer le serveur

### Option 2 : Restauration manuelle
```bash
# Copier les fichiers
cp backups/2026-06-19_15-05-25/brand-homepage.html pages/pullman/
cp backups/2026-06-19_15-05-25/base.css core/styles/
cp backups/2026-06-19_15-05-25/pullman.css brands/pullman/
cp backups/2026-06-19_15-05-25/components.js core/components/

# Lancer le serveur
python3 -m http.server 8000

# Ouvrir dans le navigateur
open http://localhost:8000/pages/pullman/brand-homepage.html
```

---

## 📂 Fichiers sauvegardés

| Fichier | Taille | Description |
|---------|--------|-------------|
| `brand-homepage.html` | 12 KB | Page HTML complète |
| `base.css` | 25 KB | Styles core (tous les fixes) |
| `pullman.css` | 4 KB | Styles marque Pullman |
| `components.js` | 29 KB | Web components |
| `BACKUP-INFO.md` | 3 KB | Documentation backup |

**Total** : ~73 KB

---

## 🔒 Protection de cette version

### ✅ Déjà fait
- [x] Backup horodaté créé
- [x] Documentation complète
- [x] Script de restauration
- [x] Tous les fichiers critiques sauvegardés

### 💡 Bonnes pratiques

1. **Avant toute modification majeure** :
   ```bash
   # Créer un nouveau backup
   BACKUP_DIR="backups/$(date +%Y-%m-%d_%H-%M-%S)"
   mkdir -p "$BACKUP_DIR"
   cp pages/pullman/brand-homepage.html "$BACKUP_DIR/"
   cp core/styles/base.css "$BACKUP_DIR/"
   ```

2. **Pour comparer avec la version stable** :
   ```bash
   # Voir différences HTML
   diff pages/pullman/brand-homepage.html backups/2026-06-19_15-05-25/brand-homepage.html

   # Voir différences CSS
   diff core/styles/base.css backups/2026-06-19_15-05-25/base.css
   ```

3. **Liste tous les backups** :
   ```bash
   ls -lhtr backups/
   ```

---

## 📊 Contenu de la version stable

### Sections implémentées
- ✅ Header navigation 2 lignes
- ✅ Hero full-width
- ✅ Booking engine
- ✅ Carousel destinations (horizontal, 28px gap)
- ✅ Editorial héritage (3 slides)
- ✅ Nos offres du moment
- ✅ Callout hôtels emblématiques (4 cards égales)
- ✅ Marketing expériences (tabs)
- ✅ Highlight V2 magazine
- ✅ Billboard développement durable
- ✅ Section Instagram (7 images + post + icônes)
- ✅ Loyalty ALL
- ✅ Footer complet

### Fixes appliqués
- ✅ Scripts dans `<head>` (pas de page blanche)
- ✅ CSS fallback pour tous les web components
- ✅ Gap 28px mesuré Figma (carousel)
- ✅ Spacing 120px entre sections
- ✅ Callout : `font-size: 0` anti-whitespace
- ✅ Instagram : grid 3fr/1fr avec post carré
- ✅ Wordings production pullman.accor.com
- ✅ Scrollbar hidden sur carousel

---

## 🆘 En cas de problème

### La page est cassée
```bash
./RESTORE-STABLE.sh
```

### Le script ne fonctionne pas
```bash
# Vérifier les permissions
chmod +x RESTORE-STABLE.sh

# Ou restaurer manuellement
cp backups/2026-06-19_15-05-25/* pages/pullman/ core/styles/ brands/pullman/ core/components/
```

### Les backups sont perdus
Les fichiers originaux sont dans `backups/2026-06-19_15-05-25/`
Cette version a été testée et validée après 40 itérations.

---

## 📁 Structure des backups

```
backups/
├── 2026-06-19_15-05-25/          ← VERSION STABLE
│   ├── brand-homepage.html
│   ├── base.css
│   ├── pullman.css
│   ├── components.js
│   └── BACKUP-INFO.md
│
└── pre-restore-[date]/           ← Créé automatiquement par RESTORE-STABLE.sh
    └── [fichiers actuels avant restauration]
```

---

## ✨ Référence Figma

**Design** : https://www.figma.com/design/4SGldt68F6BHgdChG6URdf/Test-skill?node-id=2-10186

**Production** : https://pullman.accor.com/fr.html

---

**Créé automatiquement par Claude Code**
**Ne pas supprimer ce fichier ni le dossier `backups/`**
