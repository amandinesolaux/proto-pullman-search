# Résumé des itérations - Homepage Pullman

**Date** : 19 juin 2026
**Fichier** : `pages/pullman/brand-homepage.html`
**Nombre de demandes** : ~40
**Temps estimé** : 2-3 heures

---

## 🎯 Objectif
Recréer la homepage Pullman à partir de la maquette Figma, pixel-perfect, avec tous les wordings de production.

---

## 📋 Liste des problèmes rencontrés

### 1. Page blanche au chargement
**Symptôme** : La page ne s'affichait pas du tout
**Cause** : Les scripts JavaScript étaient mal placés dans le code
**Solution** : Repositionné les scripts et lancé un serveur web local
**Tentatives** : 2

---

### 2. Cartes destinations empilées verticalement
**Symptôme** : Dans la section "Explorez le monde autrement", les cartes de destinations s'affichaient les unes sous les autres au lieu de défiler horizontalement
**Cause** : Le code JavaScript qui transforme les composants ne fonctionnait pas, et il manquait un style CSS de secours
**Solution** : Ajout d'un style CSS alternatif qui fonctionne même sans JavaScript
**Tentatives** : 5
**Note** : J'ai essayé plusieurs solutions CSS avant de comprendre le vrai problème

---

### 3. Espacements incorrects
**Symptôme** : Les espaces entre les éléments ne correspondaient pas au design Figma
**Cause** : Valeurs CSS approximatives au lieu de mesures exactes
**Solution** : Utilisé l'outil Figma pour mesurer les espacements exacts (28px au lieu de 16px, 120px au lieu de 96px)
**Tentatives** : 1

---

### 4. Section callout mal alignée
**Symptôme** :
- D'abord, les 4 cartes s'affichaient à côté du titre au lieu d'en dessous
- Ensuite, 3 cartes par ligne au lieu de 4
- Enfin, les cartes avaient des hauteurs différentes

**Cause** :
- Mauvaise compréhension de la structure HTML générée
- Espaces invisibles dans le code qui prenaient de la place
- Style CSS qui ne forçait pas les hauteurs égales

**Solution** :
- Ciblé uniquement les cartes (pas le titre)
- Supprimé les espaces invisibles avec `font-size: 0`
- Utilisé Flexbox pour égaliser les hauteurs

**Tentatives** : 4
**Note** : L'agent QA m'a aidé à identifier le problème des espaces invisibles

---

### 5. Textes génériques
**Symptôme** : Les titres et descriptions étaient des textes "lorem ipsum" au lieu des vrais contenus
**Cause** : Pas de référence au site de production dès le départ
**Solution** : Extrait tous les textes depuis pullman.accor.com et remplacé
**Tentatives** : 1

**Exemples de corrections** :
- Hero : "Pullman Hotels" → "Des séjours inspirants à travers le monde"
- Navigation : "Hôtels & Resorts" → "Destinations"
- Instagram : "Rejoignez la communauté" → "Rejoignez-nous sur Instagram"

---

### 6. Section Instagram complètement cassée
**Symptôme** :
- Tentative 1 : 8 images en grille simple (pas de post texte)
- Tentative 2 : Toutes les images empilées verticalement
- Tentative 3 : 3 images par ligne au lieu de 4
- Tentative 4 : Icônes réseaux sociaux en haut au lieu d'en bas
- Tentative 5-8 : Différents problèmes de mise en page

**Cause** : N'ai pas analysé le design Figma avant de coder. Structure complexe (grille 75%/25% avec images à gauche et post texte à droite) mal comprise.

**Solution** :
1. Capturé screenshot Figma pour comprendre le layout exact
2. Lu le code du composant pour voir la structure générée
3. Créé le bon CSS : grille principale 75%/25%, sous-grille 4 colonnes pour les images, post carré à droite

**Tentatives** : 8
**Note** : Le problème le plus long. Aurait dû utiliser l'agent QA dès la 2e tentative au lieu d'essayer 8 fois.

---

## 🔄 Erreurs récurrentes

### Web components non transformés (3 fois)
**Quoi** : Oubli systématique de prévoir un style CSS pour les cas où le JavaScript ne fonctionne pas
**Impact** : Carousel, callouts, Instagram tous cassés initialement
**Leçon** : Toujours prévoir 2 versions CSS : avec et sans JavaScript

### Espaces invisibles (2 fois)
**Quoi** : Des espaces dans le code HTML comptent comme de vrais espaces à l'écran
**Impact** : 3 éléments par ligne au lieu de 4
**Leçon** : Ne plus utiliser `inline-block` pour les grilles, préférer Flexbox

### Coder sans voir (6 fois)
**Quoi** : Essayer de coder sans d'abord regarder le design Figma en détail
**Impact** : Beaucoup d'allers-retours inutiles
**Leçon** : Toujours capturer un screenshot Figma AVANT d'écrire le moindre code

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Problèmes majeurs** | 6 |
| **Tentatives totales** | 21 |
| **Erreurs évitables** | 18 (86%) |
| **Pire cas** | Section Instagram (8 tentatives) |
| **Meilleur cas** | Textes production (1 tentative) |

---

## 💡 Ce qui aurait dû être fait différemment

### ✅ Workflow idéal
1. **Démarrage** : Capturer screenshots Figma de TOUTES les sections
2. **Mesures** : Extraire espacements/tailles exacts via Figma
3. **Wordings** : Extraire textes du site de production
4. **Code** : Générer composants avec CSS fallback systématique
5. **Validation** : Screenshot résultat + comparaison visuelle
6. **Agent QA** : Appeler dès la 2e tentative échouée, pas après 5-8

### ❌ Ce qui a été fait
1. Coder "à l'aveugle" sans référence visuelle
2. Deviner les espacements
3. Utiliser textes placeholder
4. Oublier CSS fallback
5. Découvrir les erreurs quand tu te plaignais
6. Essayer 8 fois avant d'appeler l'agent QA

---

## 🎓 Leçons pour améliorer la skill

### Règles automatiques à ajouter

1. **Web components** : Générer AUTOMATIQUEMENT 2 blocs CSS pour chaque composant
   - Version sans JavaScript (fallback)
   - Version avec JavaScript (transformé)

2. **Grilles** : INTERDIRE `inline-block`, toujours utiliser Flexbox ou Grid

3. **Agent QA** : Appeler automatiquement après 2 tentatives échouées

4. **Figma** : Proposer systématiquement extraction complète au démarrage :
   - Screenshots toutes sections
   - Mesures exactes
   - Textes production si URL disponible

5. **Validation** : Screenshot avant/après obligatoire pour chaque section

---

## 🏆 Résultat final

✅ Page fonctionnelle
✅ Pixel-perfect selon Figma
✅ Wordings production
✅ Responsive desktop
✅ Tous les composants alignés

**Mais** : Aurait pu être fait en 10-15 requêtes au lieu de 40 avec le bon workflow.

---

## 📝 Fichiers générés

- **Ce résumé** : `ITERATIONS-RESUME.md` (version simple)
- **Analyse technique** : `ITERATIONS-ANALYSIS.json` (version détaillée avec recommandations skill)
- **Page finale** : `pages/pullman/brand-homepage.html`
- **Styles** : `core/styles/base.css`
