# Discovery Wizard - Parcours Utilisateur et Questionnaire

**Version:** 2026-07-29  
**Projet:** Pullman Hotels & Resorts  
**Composant:** `wd-discovery-modal`

---

## Vue d'ensemble

Le Discovery Wizard est un questionnaire interactif en 7 étapes qui guide l'utilisateur dans la découverte de sa destination de voyage idéale. Le parcours s'adapte dynamiquement en fonction des réponses choisies.

---

## Schéma du parcours

```
START
  ↓
Q1: Avec qui voyagez-vous ?
  ↓
  ├─ "En solo" ────────────────────→ Q2
  ├─ "En couple" ──────────────────→ Q2
  ├─ "En famille" ─→ Q1.5 (détails famille) → Q2
  ├─ "Entre amis" ─→ Q1.5 (nombre adultes) → Q2
  └─ "Voyage d'affaires" ──────────→ Q2
  ↓
Q2: Quel type de voyage recherchez-vous ? (multi-sélection)
  ↓
Q3: Avez-vous une idée de destination ?
  ↓
  ├─ "Oui, j'ai une destination en tête" ─→ Q3.1 (input texte) → Q4
  ├─ "Non, je cherche l'inspiration" ─────→ Q3.2 (choix région) → Q3.3 (sélection détaillée régions multi) → Q4
  └─ "J'ai plusieurs destinations en tête" → Q3.3 (sélection régions multi) → Q4
  ↓
Q4: Régions du monde qui vous attirent (multi-sélection)
  ↓
Q5: Période et durée
  ↓
Q6: Services importants (optionnel)
  ↓
RÉSULTATS (3 destinations + CTA)
```

---

## Détail des questions

### Q1 : Avec qui voyagez-vous ?

**Type:** Carousel 3D - sélection unique  
**Étape affichée:** 1/7  
**Options:**

| Valeur | Label | Image |
|--------|-------|-------|
| `solo` | Voyage en solo | `solo.jpg` |
| `couple` | Voyage en couple | `couple.jpg` |
| `family` | Voyage en famille | `family.jpg` |
| `friends` | Voyage entre amis | `friends.jpg` |
| `business` | Voyage d'affaires | `business.jpg` |

**Navigation:**
- **Si `solo`, `couple`, `business`** → Q2 directement
- **Si `family`** → Q1.5 (mode famille)
- **Si `friends`** → Q1.5 (mode amis)

---

### Q1.5 : Détails du voyage (conditionnelle)

**Type:** Formulaire  
**Étape affichée:** 1/7  
**Conditions d'affichage:** Seulement si Q1 = `family` ou `friends`

#### Mode Famille (`family`)

**Titre:** "Parlez-nous de votre famille"

**Champs:**
- Nombre d'adultes (input number, min: 1, max: 10)
- Nombre d'enfants (input number, min: 0, max: 10)
- Âge des enfants (inputs dynamiques générés selon le nombre d'enfants)

#### Mode Amis (`friends`)

**Titre:** "Combien serez-vous ?"

**Champs:**
- Nombre d'adultes (input number, min: 2, max: 20)

**State modifié:**
- `familyDetails: { adultsCount, childrenCount, childrenAges[] }`
- `friendsDetails: { adultsCount }`

**Navigation:** → Q2

---

### Q2 : Quel type de voyage recherchez-vous ?

**Type:** Carousel 3D - multi-sélection  
**Étape affichée:** 2/7  
**Options:**

| Valeur | Label | Image |
|--------|-------|-------|
| `spa` | Avoir un spa dans l'hôtel | `wellness.jpg` |
| `restaurant` | Avoir un restaurant dans l'hôtel | `gastro.jpg` |
| `workspace` | Avoir un espace de travail dans l'hôtel | `business.jpg` |
| `kids` | Avoir un espace pour enfants | `kids.jpg` |
| `local` | Profiter de la vie locale | `culture.jpg` |

**Interaction:**
- Clic sur carte active → toggle sélection (checkmark verte)
- Clic sur carte non-active → navigation carousel
- Bouton Continue affiche le nombre de sélections: `Continuer (3)`

**State modifié:** `selectedTypes: []` (array de valeurs)

**Navigation:** → Q3

---

### Q3 : Avez-vous une idée de destination ?

**Type:** Liste verticale - sélection unique  
**Étape affichée:** 3/7  
**Options:**

| Valeur | Label |
|--------|-------|
| `yes` | Oui, j'ai une destination en tête |
| `no` | Non, je cherche l'inspiration |
| `multiple` | J'ai plusieurs destinations en tête |

**Navigation:**
- **Si `yes`** → Q3.1 (input texte)
- **Si `no`** → Q3.2 (choix région simple)
- **Si `multiple`** → Q3.3 (sélection régions multi-sélection)

---

### Q3.1 : Quelle est votre destination ? (conditionnelle)

**Type:** Formulaire texte  
**Étape affichée:** 3/7  
**Condition:** Q3 = `yes`

**Champ:**
- Input texte libre (placeholder: "Ex: Paris, Tokyo, New York...")

**State modifié:** `destinationInput: string`

**Navigation:** → Q4

---

### Q3.2 : Quelle région du monde vous attire le plus ? (conditionnelle)

**Type:** Liste verticale - sélection unique  
**Étape affichée:** 3/7  
**Condition:** Q3 = `no`

**Options:**

| Valeur | Label | Image |
|--------|-------|-------|
| `europe` | Europe | `Europe.avif` |
| `asia` | Asie | `asie.avif` |
| `africa` | Afrique | `africa.avif` |
| `north-america` | Amérique du Nord | `america.avif` |
| `latin-america` | Amérique Latine | `ameriquelatine.avif` |
| `oceania` | Océanie | `oceanie.avif` |

**State modifié:** `selectedRegion: string`

**Navigation:** → Q3.3 (multi-sélection régions)

---

### Q3.3 : Quelles régions du monde vous intéressent ? (conditionnelle)

**Type:** Carousel 3D - multi-sélection  
**Étape affichée:** 3/7  
**Conditions:**
- Si Q3 = `no` → arrive depuis Q3.2 avec une région pré-sélectionnée
- Si Q3 = `multiple` → arrive directement sans pré-sélection

**Options:**

| Valeur | Label | Image |
|--------|-------|-------|
| `europe` | Europe | `Europe.avif` |
| `asia` | Asie | `asie.avif` |
| `africa` | Afrique | `africa.avif` |
| `north-america` | Amérique du Nord | `america.avif` |
| `latin-america` | Amérique Latine | `ameriquelatine.avif` |
| `oceania` | Océanie | `oceanie.avif` |

**State modifié:** `selectedRegions: []` (array)

**Navigation:** → Q4

---

### Q4 : Quelles régions du monde vous attirent le plus ?

**Type:** Carousel 3D - multi-sélection  
**Étape affichée:** 4/7  
**Options:** Identiques à Q3.3

**State modifié:** `selectedRegions: []`

**Navigation:** → Q5

---

### Q5 : À quelle période et pour quelle durée souhaitez-vous partir ?

**Type:** Formulaire avec sélecteur calendrier + grille boutons  
**Étape affichée:** 5/7

#### Section Période

**Interface:** Sélecteur mois/année avec toggle

**Header cliquable:** Affiche `[Mois] [Année]` (ex: "Mai 2026")
- Clic → toggle entre vue mois et vue années

**Vue Mois (par défaut):**
- Grille 3×4 de 12 boutons
- Labels: Jan, Fév, Mar, Avr, Mai, Jun, Jul, Aoû, Sep, Oct, Nov, Déc
- Sélection unique, highlight vert (#5fef91)

**Vue Années:**
- Grille 3×3 scrollable
- Années de (année actuelle - 2) à (année actuelle + 10)
- Ex: 2024 à 2036
- Sélection unique, highlight vert
- Après sélection → retour automatique à vue mois

**Valeurs mois:**

| Valeur | Label court | Label complet |
|--------|-------------|---------------|
| `janvier` | Jan | Janvier |
| `fevrier` | Fév | Février |
| `mars` | Mar | Mars |
| `avril` | Avr | Avril |
| `mai` | Mai | Mai |
| `juin` | Jun | Juin |
| `juillet` | Jul | Juillet |
| `aout` | Aoû | Août |
| `septembre` | Sep | Septembre |
| `octobre` | Oct | Octobre |
| `novembre` | Nov | Novembre |
| `decembre` | Déc | Décembre |

#### Section Durée

**Type:** Grille 5 boutons - sélection unique

**Options:**

| Valeur | Label |
|--------|-------|
| `1week` | Une semaine |
| `2weeks` | Deux semaines |
| `3weeks` | Trois semaines |
| `more` | Plus de trois semaines |
| `advice` | Conseillez-moi |

**State modifié:**
- `selectedMonth: string`
- `selectedYear: number`
- `selectedDuration: string`
- `showYearPicker: boolean`

**Condition Continue:** `selectedMonth` ET `selectedDuration` doivent être définis

**Navigation:** → Q6

---

### Q6 : Quels services sont importants pour vous ?

**Type:** Grille boutons - multi-sélection (optionnelle)  
**Étape affichée:** 6/7  
**Label:** "6. Quels services sont importants pour vous ? *(optionnel)*"

**Options:**

| Valeur | Label |
|--------|-------|
| `pets` | Animaux |
| `accessibility` | Accès handicapés |
| `parking` | Parking |
| `kids-club` | Club enfants |

**Interaction:**
- Multi-sélection (toggle)
- Bouton Continue affiche le nombre: `Continuer (2)`
- Toujours actif (même sans sélection = optionnel)

**State modifié:** `selectedServices: []`

**Navigation:** → Résultats

---

## Page Résultats

**Type:** Affichage des 3 meilleures destinations

**Algorithme de matching:**
1. Filtre les destinations par régions sélectionnées (Q4 ou Q3.3)
2. Calcule un score par destination basé sur:
   - Correspondance avec types de voyage (Q2)
   - Présence des services demandés (Q6)
3. Trie par score décroissant
4. Retourne les 3 premières

**State final:**
```javascript
{
  selectedWho: string,
  familyDetails: { adultsCount, childrenCount, childrenAges[] },
  friendsDetails: { adultsCount },
  selectedTypes: string[],
  destinationIdea: 'yes' | 'no' | 'multiple',
  destinationInput: string,
  selectedRegion: string,
  selectedRegions: string[],
  selectedMonth: string,
  selectedYear: number,
  selectedDuration: string,
  selectedServices: string[],
  results: Destination[] (max 3)
}
```

---

## Interactions communes

### Carousel 3D

**Contrôles:**
- Clic sur carte active → sélection (Q1) ou toggle sélection (Q2, Q3.3, Q4)
- Clic sur carte non-active → navigation vers cette carte
- Flèches clavier ← → : navigation
- Swipe tactile : navigation
- Molette horizontale : navigation
- Points de navigation (dots) sous le carousel

**Animations:**
- Carte active (centre) : scale 1.1, z-index 10, rotation 0°
- Cartes prev/next : scale 0.8, rotation ±35°, translateX ±160px
- Cartes cachées : scale 0.6, rotation ±50°, opacity 0.3

**Carousel circulaire:** Navigation infinie avec modulo (carte 5 → carte 1)

**Centrage par défaut:** Démarre toujours sur la carte du milieu (index 2 pour 5 options)

### Navigation

**Boutons:**
- **Retour** : Revient à l'étape précédente (conserve les réponses)
- **Recommencer** : Reset complet, retour à Q1, carousel centré
- **Continuer** : Avance à l'étape suivante
  - Actif seulement si conditions remplies (highlight vert #5fef91)
  - Affiche le compteur pour multi-sélection: `Continuer (3)`

**Bouton Fermer (X)** : En haut à droite, ferme la modal (perte des réponses)

### Stepper

**Format:** "Étape X/7"  
**Position:** Footer gauche

**Mapping:**
- Q1 : Étape 1/7
- Q1.5 : Étape 1/7 (suite de Q1)
- Q2 : Étape 2/7
- Q3, Q3.1, Q3.2, Q3.3 : Étape 3/7
- Q4 : Étape 4/7
- Q5 : Étape 5/7
- Q6 : Étape 6/7
- Résultats : Étape 7/7

---

## Design Tokens

**Couleur accent (Pullman):** `#5fef91`  
**Texte principal:** `#445047`  
**Texte secondaire:** `#717171`  
**Bordures:** `#e0e0e0`  
**Background sélectionné:** `#5fef91`  
**Background hover:** `#f8fff9`  
**Espacements:** 24px standard, 32px sections

**Typographie:**
- Titre modal : `var(--font-serif)`, 30px, uppercase
- Question label : `var(--font-sans)`, 20px, weight 500
- Options : `var(--font-sans)`, 15-16px

---

## Cas particuliers et règles métier

1. **Q1.5 n'apparaît que pour `family` et `friends`**
2. **Q3 détermine le parcours Q3.1, Q3.2 ou Q3.3**
3. **Q3.3 peut avoir une région pré-sélectionnée (si vient de Q3.2)**
4. **Q5 requiert MOIS + DURÉE pour activer Continue**
5. **Q6 est optionnel : bouton Continue toujours actif**
6. **Carousel démarre centré (index 2) à chaque fois**
7. **Multi-sélection affiche le compteur sur le bouton Continue**
8. **Recommencer recentre tous les carousels**
9. **Vue année retourne automatiquement à vue mois après sélection**
10. **Les années vont de (année actuelle - 2) à (année actuelle + 10)**

---

## État complet du composant

```javascript
state = {
  currentStep: 1 | 1.5 | 2 | 3 | 3.1 | 3.2 | 3.3 | 4 | 5,
  carouselIndex: 0-4 (position carousel, défaut: 2),
  selectedWho: 'solo' | 'couple' | 'family' | 'friends' | 'business' | null,
  selectedYear: number (défaut: année actuelle),
  showYearPicker: boolean (défaut: false),
  familyDetails: {
    adultsCount: number | null,
    childrenCount: number | null,
    childrenAges: number[]
  },
  friendsDetails: {
    adultsCount: number | null
  },
  selectedTypes: string[], // Q2
  destinationIdea: 'yes' | 'no' | 'multiple' | null, // Q3
  destinationInput: string, // Q3.1
  selectedRegion: string | null, // Q3.2
  selectedRegions: string[], // Q3.3 et Q4
  selectedMonth: string | null, // Q5
  selectedDuration: string | null, // Q5
  selectedServices: string[], // Q6
  results: Destination[] // Page résultats
}
```

---

## Fichiers sources

- **Composant principal:** `core/components/components.js` (classe `wd-discovery-modal`)
- **Styles:** `core/styles/discovery-modal.css`
- **Page de démonstration:** `pages/pullman/proto-pullman-v2-discovery-wizard.html`
- **Assets images:** `assets/images/discovery/` et `assets/images/destination/`

---

**Dernière mise à jour:** 2026-07-29  
**Version calendrier:** Sélecteur mois/année avec toggle, couleurs Pullman vertes
