# Search Tabs Design Specification

**Date:** 2026-07-24  
**Version:** V2  
**Author:** Spec validated with user

## Problem Statement

The current Pullman homepage has a single search bar optimized for hotel booking (destination, dates, guests). Users need to search for hotels with specific facilities: restaurants or meeting/event spaces. The search should adapt to these different use cases while maintaining a unified search experience.

## Solution Overview

Add a tab navigation system above the search bar that switches between three search modes:
1. **Séjour** — Hotel stays (current behavior)
2. **Restaurant** — Hotels with dining options
3. **Meeting & Événement** — Hotels with event/meeting spaces

Each mode adapts the search fields while the results remain hotel listings filtered by available facilities.

## Architecture

### New Component: `<wd-search-tabs>`

**Responsibilities:**
- Display 3 tabs with icons and labels
- Track active tab state
- Emit `search-mode-change` custom event when tab changes

**Position:**
- Between `<wd-hero>` and `<wd-booking>` on homepage
- Centered horizontally
- Spacing: `--spacing-xl` (32px) below hero, `--spacing-xl` above booking

**API:**
```html
<wd-search-tabs active="sejour"></wd-search-tabs>
```

**Attributes:**
- `active` (optional, default: `"sejour"`) — Initial active tab: `"sejour" | "restaurant" | "meeting"`

**Events:**
- `search-mode-change` — Dispatched when user clicks a tab
  - `event.detail.mode` — New mode: `"sejour" | "restaurant" | "meeting"`

**HTML Structure:**
```html
<div class="wd-search-tabs" role="tablist">
  <button 
    class="wd-search-tab wd-search-tab--active" 
    role="tab"
    aria-selected="true"
    data-mode="sejour"
  >
    <svg class="wd-search-tab__icon"><!-- hotel icon --></svg>
    <span>Séjour</span>
  </button>
  <button 
    class="wd-search-tab" 
    role="tab"
    aria-selected="false"
    data-mode="restaurant"
  >
    <svg class="wd-search-tab__icon"><!-- restaurant icon --></svg>
    <span>Restaurant</span>
  </button>
  <button 
    class="wd-search-tab" 
    role="tab"
    aria-selected="false"
    data-mode="meeting"
  >
    <svg class="wd-search-tab__icon"><!-- meeting icon --></svg>
    <span>Meeting & Événement</span>
  </button>
</div>
```

### Modified Component: `<wd-booking>`

**New attribute:**
- `mode` (default: `"sejour"`) — Controls which fields to display

**Event listener:**
- Listens to `search-mode-change` on document
- Updates internal mode state
- Re-renders fields with 200ms fade transition

**Field configurations by mode:**

#### Mode: `sejour` (default)
- **Field 1:** Destination (autocomplete, current behavior)
- **Field 2:** Dates — Label: "À quelles dates ?", Value placeholder: "JJ/MM/AAAA → JJ/MM/AAAA"
- **Field 3:** Voyageurs — Label: "Combien serez-vous ?", Value placeholder: "1 personne, 1 chambre"

#### Mode: `restaurant`
- **Field 1:** Destination (same autocomplete)
- **Field 2:** Date + Heure — Label: "Quand ?", Value placeholder: "JJ/MM/AAAA à HH:MM"
- **Field 3:** Couverts — Label: "Combien de couverts ?", Value placeholder: "2 personnes"

#### Mode: `meeting`
- **Field 1:** Destination (same autocomplete)
- **Field 2:** Dates — Label: "Du ... au ...", Value placeholder: "JJ/MM/AAAA → JJ/MM/AAAA"
- **Field 3:** Participants — Label: "Nombre de participants ?", Value placeholder: "10 participants"
- **Field 4 (optional):** Type d'événement — Dropdown with options: "Séminaire", "Conférence", "Cocktail", "Team building", "Réunion", "Autre"

**State management:**
- When mode changes, reset all field values except destination
- Preserve destination field content across mode changes
- Store mode in component instance for field rendering

## Visual Design

### Tab Styling

**Container (`wd-search-tabs`):**
- Background: transparent
- Display: flex, justify-content: center
- Gap between tabs: `--spacing-lg` (24px)
- Padding: `--spacing-md` vertical, 0 horizontal

**Tab button (`wd-search-tab`):**
- Inactive state:
  - Color: `--color-text-secondary` (gray)
  - Background: none
  - Border: none
  - Font: `--font-body-md` (Poppins Regular 16px)
  - Cursor: pointer
  - Transition: opacity 200ms ease
- Active state (`.wd-search-tab--active`):
  - Color: `--color-text-primary` (black)
  - Border-bottom: 2px solid `--color-brand-primary` (Pullman brand color)
  - Font: `--font-body-md-semibold` (Poppins SemiBold 16px)
- Hover state (inactive tabs):
  - Opacity: 0.7
  - Transition: opacity 200ms ease

**Icon (`wd-search-tab__icon`):**
- Size: 20×20px
- Margin-right: `--spacing-xs` (8px)
- Vertical-align: middle
- Color: inherits from parent

**Icons to use:**
- Séjour: Bed/hotel icon (from existing `ICON` set or new)
- Restaurant: Fork & knife / dining icon
- Meeting: Conference room / presentation icon

### Integration with Booking Component

**Spacing:**
- Between tabs and booking: `--spacing-xl` (32px)
- Booking component retains current styles (white background, shadow, border-radius)

**Field transition:**
- When mode changes, fade out old fields (opacity 0, 100ms)
- Re-render new fields
- Fade in new fields (opacity 1, 100ms)
- Total transition: 200ms

## Data Flow

```
1. User clicks tab
   ↓
2. wd-search-tabs updates active state
   ↓
3. wd-search-tabs dispatches 'search-mode-change' event
   ↓
4. wd-booking receives event via document listener
   ↓
5. wd-booking updates mode attribute
   ↓
6. wd-booking re-renders fields (with fade transition)
   ↓
7. User interacts with adapted fields
   ↓
8. User clicks "Rechercher" button
   ↓
9. Navigate to search results with mode parameter
```

## Dropdown Adaptations

The booking dropdown content should adapt based on mode:

**Mode: `sejour`**
- Recent searches: hotel stays
- Suggestions: hotels, destinations
- Chips: same as current (spa, gastronomie, famille, business, romantique, culture)

**Mode: `restaurant`**
- Recent searches: restaurant reservations
- Suggestions: hotels with notable restaurants
- Chips: cuisine types (Gastronomie, Brunch, Bar, Bistro, Rooftop)

**Mode: `meeting`**
- Recent searches: event/meeting bookings
- Suggestions: hotels with meeting facilities
- Chips: event types (Séminaire, Conférence, Cocktail, Team building, Réunion)

## Accessibility

**Keyboard Navigation:**
- Tab key: navigate between tabs
- Enter/Space: activate tab
- Tab again: move to search fields

**ARIA attributes:**
- Tabs container: `role="tablist"`
- Each tab: `role="tab"`, `aria-selected="true|false"`
- Active tab: `aria-selected="true"`
- Screen reader announces mode change: "Mode restaurant activé"

**Focus management:**
- Tab activation moves focus to first search field
- Focus indicator visible on all interactive elements

## Error Handling

**Missing destination:**
- All modes require destination
- Show validation error if user clicks search without destination

**Mode-specific validations:**
- Restaurant mode: validate time format (HH:MM)
- Meeting mode: validate that end date > start date
- All modes: destination is required, other fields optional (as indicated)

## Testing Checklist

- [ ] Tab clicks switch active state
- [ ] Event dispatched correctly with mode data
- [ ] Booking component receives and processes event
- [ ] Fields re-render with correct labels and placeholders
- [ ] Destination value persists across mode changes
- [ ] Other field values reset when switching modes
- [ ] Fade transition works smoothly
- [ ] Dropdown content adapts to mode
- [ ] Search button submits correct mode parameter
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Mobile responsive behavior
- [ ] Visual styling matches Pullman brand

## Implementation Notes

**Component placement in HTML:**
```html
<wd-hero ...></wd-hero>

<!-- NEW: Add tabs here -->
<wd-search-tabs active="sejour"></wd-search-tabs>

<wd-booking cta="Rechercher"></wd-booking>
```

**JavaScript event wiring:**
```javascript
// In wd-search-tabs component
connectedCallback() {
  this.shadowRoot.querySelectorAll('.wd-search-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.mode;
      this.setActive(mode);
      document.dispatchEvent(new CustomEvent('search-mode-change', {
        detail: { mode }
      }));
    });
  });
}

// In wd-booking component
connectedCallback() {
  document.addEventListener('search-mode-change', (e) => {
    this.setAttribute('mode', e.detail.mode);
    this.render();
  });
}
```

**CSS custom properties to use:**
- Spacing: `--spacing-xs`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`
- Colors: `--color-brand-primary`, `--color-text-primary`, `--color-text-secondary`
- Typography: `--font-body-md`, `--font-body-md-semibold`
- Transitions: `transition: opacity 200ms ease`

## Dependencies

**Existing components:**
- `wd-booking` (to be modified)
- Icon set (may need new icons for restaurant/meeting)

**New components:**
- `wd-search-tabs` (to be created)

**Files to modify:**
- `core/components/components.js` — Add `wd-search-tabs`, modify `wd-booking`
- `core/styles/base.css` — Add tab styles
- `pages/pullman/brand-homepage.html` — Add `<wd-search-tabs>` element

## Future Considerations

**Phase 2 enhancements (not in scope):**
- Deep-link support: URL hash controls active tab
- Analytics tracking per search mode
- A/B testing different tab labels
- Add more modes (Spa & Wellness, Group booking)
- Remember user's last used mode in localStorage

## Success Criteria

✅ User can switch between 3 search modes via tabs  
✅ Search fields adapt to selected mode  
✅ Destination value persists across mode changes  
✅ Visual design matches Pullman brand  
✅ Transitions are smooth and not jarring  
✅ Keyboard navigation works correctly  
✅ Screen readers announce mode changes  
✅ Search results filter by facility type (hotels with restaurant, meeting spaces, etc.)  
✅ No breaking changes to existing homepage functionality
