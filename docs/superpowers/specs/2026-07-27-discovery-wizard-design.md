# Discovery Wizard - Pullman Homepage

**Date:** 2026-07-27  
**Status:** Approved  
**Owner:** Design System Team

## Objectif

Créer une expérience de découverte de destinations pour les visiteurs Pullman qui ne savent pas exactement où ils veulent voyager. L'utilisateur répond à 2 questions rapides via des cards visuelles immersives, puis reçoit 3 destinations recommandées personnalisées.

## Contexte

La homepage Pullman actuelle propose un carrousel de destinations organisé par zones géographiques. Ce nouveau module s'insère **juste après le hero** pour capter les visiteurs indécis et les guider vers leur prochaine inspiration avant qu'ils ne scrollent vers le contenu existant.

## User Journey

1. **Arrivée sur homepage** → Scroll après hero → Découvre section "Trouvez votre prochaine inspiration"
2. **Question 1** → "Avec qui voyagez-vous ?" → Sélectionne parmi 5 cards visuelles
3. **Question 2** → "Quel type de voyage ?" → Sélectionne parmi 5 cards thématiques  
4. **Résultats** → Voit 3 destinations recommandées + message personnalisé
5. **CTA final** → "Voir toutes les destinations {type}" → Scroll vers carrousel existant (filtré)

## Architecture

### Composant Principal

**`<wd-discovery-wizard>`**

Un composant Web Component à 3 états qui se transforme dans une seule section conteneur :

- **État 1** : Question 1 (état initial au chargement)
- **État 2** : Question 2 (après sélection Q1)
- **État 3** : Résultats (après sélection Q2)

### Structure HTML par État

**État 1 - Question 1:**
```html
<section class="wd-discovery">
  <div class="wd-discovery__container">
    <h2 class="wd-discovery__title">Trouvez votre prochaine inspiration</h2>
    <p class="wd-discovery__subtitle">Répondez à 2 questions rapides...</p>
    <div class="wd-discovery__grid">
      <!-- 5 cards : Solo, Couple, Famille, Amis, Business -->
      <button class="wd-discovery__card" data-value="solo">
        <div class="wd-discovery__card-bg" style="background-image:url(...)"></div>
        <div class="wd-discovery__card-content">
          <svg class="wd-discovery__card-icon">...</svg>
          <span class="wd-discovery__card-label">Solo</span>
        </div>
      </button>
    </div>
  </div>
</section>
```

**État 2 - Question 2:**
```html
<!-- Même container, contenu remplacé -->
<h2>Quel type de voyage ?</h2>
<p>Sélectionnez l'expérience qui vous inspire <span class="breadcrumb">Solo ></span></p>
<div class="wd-discovery__grid">
  <!-- 5 cards : Détente, Culture, City, Gastro, Business -->
</div>
```

**État 3 - Résultats:**
```html
<h2>Vos destinations recommandées</h2>
<p class="subtitle-personalized">Pour un city break en couple</p>
<button class="wd-discovery__restart">← Recommencer</button>
<div class="wd-discovery__results">
  <!-- 3 destination cards -->
  <div class="wd-discovery__dest-card">
    <img src="..." alt="Paris">
    <span class="wd-discovery__dest-tag">City break</span>
    <h3>Paris</h3>
    <p>Parfait pour un city break en couple</p>
  </div>
</div>
<a href="#destinations" class="wd-discovery__cta">
  Voir toutes les destinations city break
  <svg>arrow-right</svg>
</a>
```

## Design Visuel

### Tokens Figma (issus du composant Pullman)

**Couleurs:**
- Background section : `#f8f8f8` (neutre clair)
- Cards overlay : `rgba(0, 0, 0, 0.54)` + `backdrop-filter: blur(96px)`
- Accent CTA : `#5fef91` (gradient `linear-gradient(135deg, #5fef91 0%, #4cd67d 100%)`)
- Texte sur cards : `#ffffff` (titres), `rgba(255, 255, 255, 0.9)` (labels)
- Texte section : `#222` (titres), `#717171` (sous-titres)
- Border subtle : `rgba(255, 255, 255, 0.1)`

**Espacements:**
- Padding section : `80px 64px`
- Gap entre cards : `24px` (token `m`)
- Padding cards : `24px`
- Border-radius cards : `12px`
- Border-radius CTA : `99px`

**Typographie:**
- Titre section (H2) : `36px / 700` (desktop), `28px / 700` (mobile)
- Sous-titre section : `16px / 400`, color `#717171`
- Label cards : `18px / 600`
- Titre destination : `24px / 700`
- Description destination : `14px / 400`

### Cards Discovery (Q1 & Q2)

**Dimensions:**
- Height : `240px` (desktop), `200px` (mobile)
- Layout : grille responsive 3 colonnes → 2 → 1

**Style:**
- Image background couvrant 100%
- Overlay gradient : `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)`
- Border : `1px solid rgba(255,255,255,0.1)`
- Border-radius : `12px`

**Hover:**
- `transform: scale(1.02)`
- Box-shadow : `0 8px 24px rgba(0,0,0,0.15)`
- Overlay plus léger : `rgba(0,0,0,0.4)` au lieu de `0.6`
- Transition : `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

**Icônes:**
- Taille : `32px`
- Couleur : `#ffffff`
- Drop-shadow : `0 2px 4px rgba(0,0,0,0.2)`

### Destination Cards (Résultats)

**Dimensions:**
- Height : `300px`
- Format : vertical 3:4
- Layout : grille 3 colonnes → 1

**Éléments:**
- Image couvrant 60% hauteur
- Tag kicker : background `rgba(95, 239, 145, 0.9)`, text `#445047`, padding `4px 12px`, radius `20px`
- Titre : `24px / 700`, margin-top `12px`
- Description : `14px / 400`, 2 lignes max avec `text-overflow: ellipsis`

### Transitions

**Entre états (Q1 → Q2 → Résultats):**
```css
.wd-discovery__container {
  transition: opacity 400ms ease-in-out;
}
/* État sortant */
.state-exit {
  opacity: 0;
  transform: translateY(-20px);
}
/* État entrant */
.state-enter {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideIn 400ms ease-out forwards;
}
```

**Interactions:**
- Hover cards : `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Click CTA : `transform: scale(0.98)` + `0.2s`

## Data & Logique

### Structure de Données

**Destinations :**
```javascript
const destinations = [
  {
    id: "paris",
    name: "Paris",
    image: "https://...",
    who: ["couple", "solo", "friends"],
    type: ["culture", "gastro", "city"],
    descriptions: {
      "couple-city": "Parfait pour un city break en couple",
      "solo-culture": "Idéal pour une découverte culturelle en solo",
      // ...
    }
  },
  // Singapour, Bali, Dubaï, São Paulo, Shanghai, Sydney, Toulouse
]
```

**Questions :**
```javascript
const questions = {
  q1: {
    title: "Avec qui voyagez-vous ?",
    subtitle: "Répondez à 2 questions rapides pour découvrir...",
    options: [
      { value: "solo", label: "Solo", icon: "person", image: "url" },
      { value: "couple", label: "En couple", icon: "hearts", image: "url" },
      { value: "family", label: "En famille", icon: "family", image: "url" },
      { value: "friends", label: "Entre amis", icon: "group", image: "url" },
      { value: "business", label: "Business", icon: "briefcase", image: "url" }
    ]
  },
  q2: {
    title: "Quel type de voyage ?",
    subtitle: "Sélectionnez l'expérience qui vous inspire",
    options: [
      { value: "wellness", label: "Détente & Wellness", image: "url" },
      { value: "culture", label: "Découverte culturelle", image: "url" },
      { value: "city", label: "City break", image: "url" },
      { value: "gastro", label: "Gastronomie", image: "url" },
      { value: "events", label: "Business & Events", image: "url" }
    ]
  }
}
```

### Algorithme de Filtrage

**Étape 1 - Sélection Q1 :**
```javascript
state.selectedWho = "couple";
transitionToState2();
```

**Étape 2 - Sélection Q2 :**
```javascript
state.selectedType = "city";
const results = filterDestinations(state.selectedWho, state.selectedType);
transitionToState3(results);
```

**Filtrage :**
```javascript
function filterDestinations(who, type) {
  // Match parfait (who ET type)
  let matches = destinations.filter(d => 
    d.who.includes(who) && d.type.includes(type)
  );
  
  // Si < 3 résultats, fallback sur match partiel (juste type)
  if (matches.length < 3) {
    matches = destinations.filter(d => d.type.includes(type));
  }
  
  // Limiter à 3
  return matches.slice(0, 3);
}
```

**Personnalisation message :**
```javascript
const typeLabels = {
  wellness: "séjour détente",
  culture: "découverte culturelle",
  city: "city break",
  gastro: "escapade gastronomique",
  events: "voyage business"
};

const whoLabels = {
  solo: "en solo",
  couple: "en couple",
  family: "en famille",
  friends: "entre amis",
  business: "professionnel"
};

const message = `Pour un ${typeLabels[type]} ${whoLabels[who]}`;
// → "Pour un city break en couple"
```

### Interaction avec le Carrousel Existant

**CTA final :**
```javascript
// Click sur "Voir toutes les destinations city break"
document.querySelector('.wd-discovery__cta').addEventListener('click', (e) => {
  e.preventDefault();
  
  // Scroll vers le carrousel
  document.querySelector('.wd-carousel').scrollIntoView({ 
    behavior: 'smooth' 
  });
  
  // Appliquer filtre visuel (fade destinations non-matchantes)
  const carouselCards = document.querySelectorAll('wd-dest-card');
  carouselCards.forEach(card => {
    const matchesFilter = card.getAttribute('type-tags').includes(state.selectedType);
    card.style.opacity = matchesFilter ? '1' : '0.3';
  });
});
```

## Comportements & Edge Cases

### Recommencer

Bouton "← Recommencer" en haut à droite (état 3 uniquement) :
- Reset state : `selectedWho = null`, `selectedType = null`
- Transition vers état 1
- Scroll top de la section

### Navigation Back

L'utilisateur peut-il revenir en arrière (Q2 → Q1) ?
**Non dans V1** — parcours linéaire pour simplicité. Seul le bouton "Recommencer" (état 3) permet de reset.

### Moins de 3 résultats

Si après fallback il reste < 3 destinations :
- Afficher celles disponibles (1 ou 2 cards)
- Message adapté : "Voici nos meilleures suggestions pour un {type}"
- CTA reste identique

### Accessibilité

- Titre section en H2 sémantique
- Cards en `<button>` avec labels explicites
- Focus visible avec outline `2px solid #5fef91`
- Navigation clavier : Tab entre cards, Enter pour sélectionner
- ARIA : `aria-live="polite"` sur container pour annoncer changements d'état
- Alt text sur toutes images

### Mobile

- Cards en grille 1 colonne
- Touch targets ≥ 48px (cards height 200px OK)
- Swipe horizontal entre états : **Non** — boutons seulement
- Padding section réduit : `40px 24px`

## Intégration

### Fichiers à créer

1. **Component JS :**  
   `/core/components/components.js` → Ajouter `def("wd-discovery-wizard", class extends WdEl {...})`

2. **Styles CSS :**  
   `/core/styles/discovery-wizard.css` → Tous les styles du composant

3. **Data JSON :**  
   `/brands/pullman/discovery-data.json` → Questions + destinations

### Placement HTML

Insérer dans `/pages/pullman/brand-homepage-tabs.html` :

```html
<!-- APRÈS wd-hero, AVANT wd-content -->
<wd-discovery-wizard></wd-discovery-wizard>

<!-- ===== CONTENT ===== -->
<div class="wd-content">
  <!-- Carrousel destinations existant -->
</div>
```

### Dépendances

- Réutilise les icônes SVG de `ICON` dans `components.js`
- Utilise les tokens Pullman existants via CSS variables
- Images de cards : hébergées sur CDN Accor (même domaine que hero)

## Testing

### Scénarios de test

1. **Parcours complet :**  
   Q1 "Couple" → Q2 "City" → Voit 3 destinations matchantes → CTA scroll carrousel

2. **Fallback :**  
   Q1 "Business" → Q2 "Wellness" (peu de match) → Voit destinations wellness (fallback sur type seul)

3. **Recommencer :**  
   Compléter parcours → Click "Recommencer" → Retour Q1, state reset

4. **Responsive :**  
   Desktop (3 cols) → Tablet (2 cols) → Mobile (1 col)

5. **Clavier :**  
   Tab navigation entre cards → Enter sélection → Focus visible

### Critères d'acceptance

- [ ] Transitions fluides 400ms entre états
- [ ] Hover cards fonctionne (scale + shadow)
- [ ] Message personnalisé correct ("Pour un {type} {who}")
- [ ] CTA scroll vers carrousel + filtre appliqué
- [ ] Bouton "Recommencer" reset state
- [ ] Responsive 3 breakpoints OK
- [ ] Accessibilité clavier OK
- [ ] Aucune erreur console

## Évolutions Futures (Hors Scope V1)

- Analytics : tracking sélections Q1/Q2 + destinations vues
- A/B test : variation du wording questions
- Personnalisation avancée : 3ème question (durée, budget)
- Sauvegarde préférences : cookie pour pré-remplir au retour
- Animation entrée : scroll-triggered reveal au chargement page
- Navigation back : breadcrumb cliquable pour revenir Q1

---

**Spec validée le 2026-07-27**
