# Calendrier Annuel Q5 - Design Spec

**Date:** 2026-07-29  
**Feature:** Remplacement des boutons mois par un calendrier annuel 3×4 compact  
**Context:** Discovery Wizard Question 5 "À quelle période et pour quelle durée souhaitez-vous partir ?"

---

## Objectif

Remplacer la grille de 12 boutons de mois (Janvier, Février, ..., Décembre) par un calendrier annuel visuel affichant les 12 mois simultanément en grille 3 colonnes × 4 lignes. Chaque mois est représenté par un mini-calendrier (grille 7×5 jours) cliquable.

---

## Architecture

### Structure HTML

```
.wd-discovery-modal__calendar-grid (grille 3×4)
  └─ .wd-discovery-modal__mini-calendar (×12, un par mois)
       ├─ .wd-discovery-modal__mini-calendar-header (nom du mois)
       └─ .wd-discovery-modal__mini-calendar-days (grille 7×6 jours)
            └─ .wd-discovery-modal__mini-calendar-day (×35-42, numéros de jours)
```

### État

- `this.state.selectedMonth` : stocke la valeur du mois sélectionné ('janvier', 'fevrier', etc.)
- Inchangé par rapport à l'implémentation actuelle (compatibilité avec navigation Q5→Q6)

### Rendu des jours

Pour chaque mois (0-11) :
1. Calculer le premier jour de la semaine (dimanche=0, lundi=1, ..., samedi=6)
2. Déterminer le nombre de jours dans le mois
3. Remplir les jours vides avant le 1er (jours du mois précédent, en gris clair)
4. Afficher les jours du mois en couleur normale
5. Compléter avec les premiers jours du mois suivant si nécessaire

**Année de référence** : Année en cours (`new Date().getFullYear()`)

---

## Design Visuel

### Grille principale

```css
.wd-discovery-modal__calendar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
```

### Mini-calendrier

```css
.wd-discovery-modal__mini-calendar {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wd-discovery-modal__mini-calendar:hover {
  border-color: #5fef91;
  box-shadow: 0 2px 8px rgba(95, 239, 145, 0.2);
}

.wd-discovery-modal__mini-calendar.is-selected {
  border-color: #5fef91;
  background: #f0fdf4;
}
```

### Header mois

```css
.wd-discovery-modal__mini-calendar-header {
  font-size: 14px;
  font-weight: 600;
  color: #445047;
  text-align: center;
  margin-bottom: 8px;
}
```

### Grille jours

```css
.wd-discovery-modal__mini-calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.wd-discovery-modal__mini-calendar-day {
  font-size: 10px;
  text-align: center;
  padding: 2px;
  color: #445047;
  line-height: 1.4;
}

.wd-discovery-modal__mini-calendar-day.is-other-month {
  color: #d1d5db;
}

.wd-discovery-modal__mini-calendar-day.is-weekend {
  color: #888;
}
```

---

## Interaction

### Click Handler

**Event delegation** : Un seul listener sur `.wd-discovery-modal__calendar-grid`

**Logique** :
1. Détecter le clic sur `.wd-discovery-modal__mini-calendar` ou ses enfants
2. Lire l'attribut `data-month` du mini-calendrier
3. Mettre à jour `this.state.selectedMonth = monthValue`
4. Retirer `.is-selected` de tous les mini-calendriers
5. Ajouter `.is-selected` au mini-calendrier cliqué
6. Vérifier si `this.state.selectedMonth` ET `this.state.selectedDuration` sont définis → activer le bouton Continue

### Accessibilité

- Chaque mini-calendrier a un attribut `role="button"` et `aria-label="Sélectionner [Mois]"`
- État sélectionné indiqué par `aria-pressed="true"`
- Navigation clavier : Tab entre les mois, Enter/Space pour sélectionner

---

## Données

```javascript
const monthsData = [
  { value: 'janvier', label: 'Janvier', monthIndex: 0 },
  { value: 'fevrier', label: 'Février', monthIndex: 1 },
  { value: 'mars', label: 'Mars', monthIndex: 2 },
  { value: 'avril', label: 'Avril', monthIndex: 3 },
  { value: 'mai', label: 'Mai', monthIndex: 4 },
  { value: 'juin', label: 'Juin', monthIndex: 5 },
  { value: 'juillet', label: 'Juillet', monthIndex: 6 },
  { value: 'aout', label: 'Août', monthIndex: 7 },
  { value: 'septembre', label: 'Septembre', monthIndex: 8 },
  { value: 'octobre', label: 'Octobre', monthIndex: 9 },
  { value: 'novembre', label: 'Novembre', monthIndex: 10 },
  { value: 'decembre', label: 'Décembre', monthIndex: 11 }
];
```

---

## Fonction de génération des jours

```javascript
function generateMonthDays(monthIndex, year) {
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=Dimanche
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
  
  const days = [];
  
  // Jours du mois précédent pour remplir la première ligne
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isOtherMonth: true,
      isWeekend: false
    });
  }
  
  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dayOfWeek = date.getDay();
    days.push({
      day,
      isOtherMonth: false,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }
  
  // Jours du mois suivant pour compléter la dernière ligne
  const remainingDays = 42 - days.length; // Grille 7×6 = 42 cellules
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isOtherMonth: true,
      isWeekend: false
    });
  }
  
  return days;
}
```

---

## Modifications Requises

### Fichiers à modifier

1. **core/components/components.js**
   - Méthode `renderQuestion4_Period()` : remplacer la section Période (grille de boutons) par le calendrier annuel
   - Méthode `afterRender()` : ajouter event listener pour le calendrier (délégation sur `.wd-discovery-modal__calendar-grid`)

2. **core/styles/discovery-modal.css**
   - Ajouter styles pour `.wd-discovery-modal__calendar-grid`
   - Ajouter styles pour `.wd-discovery-modal__mini-calendar`
   - Ajouter styles pour `.wd-discovery-modal__mini-calendar-header`
   - Ajouter styles pour `.wd-discovery-modal__mini-calendar-days`
   - Ajouter styles pour `.wd-discovery-modal__mini-calendar-day`

### Compatibilité

- La section "Durée" (5 boutons) reste inchangée
- Le state `selectedMonth` et `selectedDuration` gardent le même format
- La navigation Q5→Q6 reste identique
- Le bouton Continue suit la même logique d'activation

---

## Tests à effectuer

1. **Rendu visuel** : Vérifier que les 12 mini-calendriers s'affichent correctement en grille 3×4
2. **Calcul des jours** : Vérifier que chaque mois affiche le bon nombre de jours et commence le bon jour de la semaine
3. **Sélection** : Clic sur n'importe quel jour d'un mois → ce mois est sélectionné (highlight vert)
4. **État Continue** : Sélection mois + durée → bouton Continue s'active
5. **Navigation** : Q5→Q6 transmet bien `selectedMonth` et `selectedDuration`
6. **Responsive** : Vérifier l'affichage sur mobile (grille 3×4 peut nécessiter scroll horizontal ou passage en 2×6)

---

## Notes d'implémentation

- Les mini-calendriers sont générés côté serveur (pas de library externe type FullCalendar)
- L'année de référence est l'année en cours (pas de sélection d'année)
- Le calendrier est purement visuel/sélectif (pas de date picker avec input caché)
- Les jours ne sont pas individuellement sélectionnables, seulement le mois entier
