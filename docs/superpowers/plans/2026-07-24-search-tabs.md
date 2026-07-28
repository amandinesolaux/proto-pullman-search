# Search Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tab navigation above the search bar that switches between three search modes (Séjour, Restaurant, Meeting & Événement) with adaptive search fields.

**Architecture:** Create a standalone `<wd-search-tabs>` component that emits events, modify `<wd-booking>` to listen for mode changes and re-render fields accordingly. No state sharing, pure event-driven communication.

**Tech Stack:** Vanilla Web Components (WdEl base class), CSS custom properties from welDS tokens, Light DOM rendering

---

## File Structure

**New files:**
- None (all code added to existing files)

**Modified files:**
- `core/components/components.js` — Add `wd-search-tabs` component (~120 lines), modify `wd-booking` component (~80 lines changed)
- `core/styles/base.css` — Add `.wd-search-tabs` styles (~60 lines)
- `pages/pullman/brand-homepage.html` — Insert `<wd-search-tabs>` element (1 line)

**Why this structure:**
- Single components file keeps all welDS components together (existing pattern)
- Styles in base.css apply to all brands (tabs are brand-agnostic structure)
- Minimal HTML change (drop-in component)

---

## Task 1: Add Tab Icons to ICON Set

**Files:**
- Modify: `core/components/components.js:46-60`

- [ ] **Step 1: Add hotel/bed icon for "Séjour" tab**

Add after line 60 (after `phone` icon):

```javascript
    bed: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M3 20v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1h6v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8M3 12V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
```

- [ ] **Step 2: Add fork & knife icon for "Restaurant" tab**

Add after the `bed` icon:

```javascript
    utensils: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M7 2v10a2 2 0 1 0 4 0V2M7 5h4M17 2v4a3 3 0 0 1-3 3v13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
```

- [ ] **Step 3: Add presentation/meeting icon for "Meeting & Événement" tab**

Add after the `utensils` icon:

```javascript
    presentation: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><rect x="2" y="3" width="20" height="14" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M9 22l3-5 3 5M7 22h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
```

- [ ] **Step 4: Verify icons are added to ICON object**

Check the ICON object now includes:
```javascript
const ICON = {
  // ... existing icons ...
  bed: `<svg...`,
  utensils: `<svg...`,
  presentation: `<svg...`,
};
```

- [ ] **Step 5: Test icons render in browser**

Open browser console:
```javascript
document.body.innerHTML = `${ICON.bed} ${ICON.utensils} ${ICON.presentation}`;
```

Expected: Three icons visible (bed, fork/knife, presentation screen)

- [ ] **Step 6: Commit icon additions**

```bash
git add core/components/components.js
git commit -m "feat: add icons for search tabs (bed, utensils, presentation)"
```

---

## Task 2: Create wd-search-tabs Component

**Files:**
- Modify: `core/components/components.js:~400` (insert before `wd-booking` definition)

- [ ] **Step 1: Add component definition with render method**

Insert after line 397 (before `/* ---------- wd-booking ---------- */`):

```javascript
  /* ---------- wd-search-tabs ---------- */
  def("wd-search-tabs", class extends WdEl {
    render() {
      const active = this.attr("active", "sejour");
      const tabs = [
        { mode: "sejour", icon: ICON.bed, label: "Séjour" },
        { mode: "restaurant", icon: ICON.utensils, label: "Restaurant" },
        { mode: "meeting", icon: ICON.presentation, label: "Meeting & Événement" }
      ];
      
      return `<div class="wd-search-tabs" role="tablist">
        ${tabs.map(tab => {
          const isActive = tab.mode === active;
          return `<button 
            class="wd-search-tab ${isActive ? 'wd-search-tab--active' : ''}" 
            role="tab"
            aria-selected="${isActive}"
            data-mode="${tab.mode}"
            type="button"
          >
            <span class="wd-search-tab__icon">${tab.icon}</span>
            <span>${esc(tab.label)}</span>
          </button>`;
        }).join("")}
      </div>`;
    }
  });
```

- [ ] **Step 2: Add afterRender method for event listeners**

Add after the `render()` method (inside the class):

```javascript
    afterRender() {
      const tabs = this.querySelectorAll('.wd-search-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          const mode = e.currentTarget.dataset.mode;
          this.setActive(mode);
          document.dispatchEvent(new CustomEvent('search-mode-change', {
            detail: { mode },
            bubbles: true
          }));
        });
      });
    }
```

- [ ] **Step 3: Add setActive method to update UI state**

Add after the `afterRender()` method:

```javascript
    setActive(mode) {
      this.setAttribute('active', mode);
      const tabs = this.querySelectorAll('.wd-search-tab');
      tabs.forEach(tab => {
        const isActive = tab.dataset.mode === mode;
        tab.classList.toggle('wd-search-tab--active', isActive);
        tab.setAttribute('aria-selected', isActive);
      });
    }
```

- [ ] **Step 4: Test component renders**

Add to `pages/pullman/brand-homepage.html` temporarily (line 33, after `</wd-hero>`):

```html
<wd-search-tabs active="sejour"></wd-search-tabs>
```

Open browser, expected: 3 tabs visible (Séjour active, Restaurant and Meeting inactive)

- [ ] **Step 5: Test tab clicks dispatch events**

Browser console:
```javascript
document.addEventListener('search-mode-change', e => console.log('Mode changed:', e.detail.mode));
```

Click "Restaurant" tab, expected console output: `Mode changed: restaurant`

- [ ] **Step 6: Test setActive updates UI**

Browser console:
```javascript
document.querySelector('wd-search-tabs').setActive('meeting');
```

Expected: Meeting tab becomes active, others become inactive

- [ ] **Step 7: Commit component creation**

```bash
git add core/components/components.js pages/pullman/brand-homepage.html
git commit -m "feat: create wd-search-tabs component with event emission"
```

---

## Task 3: Add Styles for wd-search-tabs

**Files:**
- Modify: `core/styles/base.css:~end` (append at end of file)

- [ ] **Step 1: Add container styles**

Append to end of `base.css`:

```css
/* ============================================================
   wd-search-tabs — Tab navigation for search modes
   ============================================================ */
.wd-search-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg, 24px);
  padding: var(--spacing-md, 16px) 0;
  background: transparent;
}
```

- [ ] **Step 2: Add tab button base styles**

Add after container styles:

```css
.wd-search-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary, #6B7280);
  font-family: var(--font-family-body, Poppins, sans-serif);
  font-size: var(--font-size-body-md, 16px);
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  transition: opacity 200ms ease, color 200ms ease, border-color 200ms ease;
  white-space: nowrap;
}
```

- [ ] **Step 3: Add active tab styles**

Add after tab button styles:

```css
.wd-search-tab--active {
  color: var(--color-text-primary, #000000);
  font-weight: 600;
  border-bottom-color: var(--color-brand-primary, #4A90E2);
}
```

- [ ] **Step 4: Add hover styles for inactive tabs**

Add after active styles:

```css
.wd-search-tab:not(.wd-search-tab--active):hover {
  opacity: 0.7;
  color: var(--color-text-primary, #000000);
}
```

- [ ] **Step 5: Add focus styles for accessibility**

Add after hover styles:

```css
.wd-search-tab:focus-visible {
  outline: 2px solid var(--color-brand-primary, #4A90E2);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 6: Add icon styles**

Add after focus styles:

```css
.wd-search-tab__icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
  color: inherit;
}

.wd-search-tab__icon svg {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 7: Add responsive styles for mobile**

Add after icon styles:

```css
@media (max-width: 768px) {
  .wd-search-tabs {
    gap: var(--spacing-sm, 12px);
  }
  
  .wd-search-tab {
    padding: var(--spacing-xs, 8px) var(--spacing-sm, 12px);
    font-size: var(--font-size-body-sm, 14px);
  }
  
  .wd-search-tab span:not(.wd-search-tab__icon) {
    /* Hide label text on very small screens, show icons only */
  }
}
```

- [ ] **Step 8: Test styles in browser**

Refresh homepage, verify:
- Tabs are horizontally centered
- Active tab has underline and darker text
- Hover on inactive tabs changes opacity
- Icons are 20px and aligned with text
- Keyboard focus shows outline

- [ ] **Step 9: Commit styles**

```bash
git add core/styles/base.css
git commit -m "style: add CSS for wd-search-tabs component"
```

---

## Task 4: Modify wd-booking to Listen for Mode Changes

**Files:**
- Modify: `core/components/components.js:400-500` (wd-booking component)

- [ ] **Step 1: Add mode attribute and field configurations**

At the top of the `wd-booking` class (after line 400), add:

```javascript
  def("wd-booking", class extends WdEl {
    constructor() {
      super();
      this._mode = "sejour";
      this._fieldConfigs = {
        sejour: {
          field2Label: "À quelles dates ?",
          field2Value: "JJ/MM/AAAA → JJ/MM/AAAA",
          field3Label: "Combien serez-vous ?",
          field3Value: "1 personne, 1 chambre",
          field4: null
        },
        restaurant: {
          field2Label: "Quand ?",
          field2Value: "JJ/MM/AAAA à HH:MM",
          field3Label: "Combien de couverts ?",
          field3Value: "2 personnes",
          field4: null
        },
        meeting: {
          field2Label: "Du ... au ...",
          field2Value: "JJ/MM/AAAA → JJ/MM/AAAA",
          field3Label: "Nombre de participants ?",
          field3Value: "10 participants",
          field4: {
            label: "Type d'événement",
            value: "Séminaire",
            options: ["Séminaire", "Conférence", "Cocktail", "Team building", "Réunion", "Autre"]
          }
        }
      };
    }
```

- [ ] **Step 2: Update render method to use mode config**

Replace the existing field HTML (lines 412-414) with:

```javascript
    render() {
      const btn = this.attr("cta", "Rechercher");
      const mode = this.attr("mode", "sejour");
      const config = this._fieldConfigs[mode] || this._fieldConfigs.sejour;
      
      return `<div class="wd-booking">
        <div class="wd-booking__fields">
          <div class="wd-booking__field wd-booking__field--dest">
            <span class="wd-booking__search-icon-pulse">${SEARCH_ICON.search}</span>
            <div class="wd-booking__dest-static"><span class="wd-booking__label">${new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir'}, quelle sera votre prochaine escapade ?</span><span class="wd-booking__value wd-booking__value--typing"></span></div>
            <input type="text" class="wd-booking__dest-input" placeholder="Une destination, un hôtel, une envie..." autocomplete="off" />
            <span class="wd-booking__kbd">${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K</span>
          </div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field">${ICON.cal}<div><span class="wd-booking__label">${esc(config.field2Label)} <span style="font-weight:300;opacity:.6">(facultatif)</span></span><span class="wd-booking__value">${esc(config.field2Value)}</span></div></div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field">${ICON.person}<div><span class="wd-booking__label">${esc(config.field3Label)} <span style="font-weight:300;opacity:.6">(facultatif)</span></span><span class="wd-booking__value">${esc(config.field3Value)}</span></div></div>
          ${config.field4 ? `
            <div class="wd-booking__sep"></div>
            <div class="wd-booking__field">${ICON.presentation}<div><span class="wd-booking__label">${esc(config.field4.label)} <span style="font-weight:300;opacity:.6">(facultatif)</span></span><span class="wd-booking__value">${esc(config.field4.value)}</span></div></div>
          ` : ''}
          <a href="#" class="wd-btn wd-btn--primary wd-booking__cta">${esc(btn)}</a>
        </div>
```

Continue with the rest of the existing render output (dropdown HTML stays the same)

- [ ] **Step 3: Add event listener in connectedCallback**

Replace the existing `connectedCallback` or add if it doesn't exist (before `render()` method):

```javascript
    connectedCallback() {
      if (this._listenerAdded) return;
      this._listenerAdded = true;
      
      document.addEventListener('search-mode-change', (e) => {
        this.handleModeChange(e.detail.mode);
      });
      
      super.connectedCallback();
    }
```

- [ ] **Step 4: Add handleModeChange method with fade transition**

Add after the `render()` method:

```javascript
    handleModeChange(mode) {
      const fields = this.querySelector('.wd-booking__fields');
      if (!fields) return;
      
      // Fade out
      fields.style.transition = 'opacity 100ms ease';
      fields.style.opacity = '0';
      
      setTimeout(() => {
        // Update mode
        this.setAttribute('mode', mode);
        this._mode = mode;
        
        // Re-render
        const newHTML = this.render();
        this.innerHTML = newHTML;
        
        // Re-attach afterRender listeners
        if (this.afterRender) this.afterRender();
        
        // Fade in
        const newFields = this.querySelector('.wd-booking__fields');
        if (newFields) {
          newFields.style.opacity = '0';
          setTimeout(() => {
            newFields.style.transition = 'opacity 100ms ease';
            newFields.style.opacity = '1';
          }, 10);
        }
      }, 100);
    }
```

- [ ] **Step 5: Test mode switching updates fields**

Browser console:
```javascript
document.dispatchEvent(new CustomEvent('search-mode-change', { detail: { mode: 'restaurant' } }));
```

Expected:
- Fields fade out
- Field 2 label changes to "Quand ?"
- Field 3 label changes to "Combien de couverts ?"
- Fields fade in

- [ ] **Step 6: Test all three modes**

Console:
```javascript
// Test restaurant mode
document.dispatchEvent(new CustomEvent('search-mode-change', { detail: { mode: 'restaurant' } }));
// Wait 300ms, then test meeting mode
setTimeout(() => {
  document.dispatchEvent(new CustomEvent('search-mode-change', { detail: { mode: 'meeting' } }));
}, 300);
```

Expected:
- Restaurant mode shows 3 fields (destination, quand, couverts)
- Meeting mode shows 4 fields (destination, dates, participants, type d'événement)

- [ ] **Step 7: Commit booking component changes**

```bash
git add core/components/components.js
git commit -m "feat: add mode switching to wd-booking component"
```

---

## Task 5: Integrate Tabs into Homepage

**Files:**
- Modify: `pages/pullman/brand-homepage.html:32-34`

- [ ] **Step 1: Add spacing wrapper for tabs + booking**

Replace lines 32-33 (the `<wd-booking>` element) with:

```html
<!-- ===== SEARCH WIDGET ===== -->
<div style="padding: var(--spacing-xl, 32px) 0;">
  <wd-search-tabs active="sejour"></wd-search-tabs>
  <div style="margin-top: var(--spacing-xl, 32px);">
    <wd-booking cta="Rechercher"></wd-booking>
  </div>
</div>
```

- [ ] **Step 2: Verify spacing in browser**

Reload page, measure:
- Distance from hero to tabs: 32px
- Distance from tabs to booking: 32px
- Tabs are horizontally centered

- [ ] **Step 3: Test tab clicks update booking fields**

Click each tab and verify:
- "Séjour" → standard hotel search fields
- "Restaurant" → restaurant-specific fields
- "Meeting & Événement" → meeting fields with 4th dropdown

- [ ] **Step 4: Test keyboard navigation**

Keyboard flow:
1. Tab to reach first search tab
2. Arrow keys or Tab to move between tabs
3. Enter to activate a tab
4. Tab again to reach destination field

Expected: All steps work, focus indicators visible

- [ ] **Step 5: Commit homepage integration**

```bash
git add pages/pullman/brand-homepage.html
git commit -m "feat: integrate search tabs into homepage"
```

---

## Task 6: Add Dropdown Chip Adaptation (Optional Field Behavior)

**Files:**
- Modify: `core/components/components.js:424-429` (chip definitions in wd-booking)

- [ ] **Step 1: Define mode-specific chip sets**

After the constructor in `wd-booking` class, add:

```javascript
    _getChipsForMode(mode) {
      const chipSets = {
        sejour: [
          { id: 'spa', icon: SEARCH_ICON.wellness, label: 'Détente & spa' },
          { id: 'gastronomie', icon: SEARCH_ICON.gastro, label: 'Gastronomie' },
          { id: 'famille', icon: SEARCH_ICON.family, label: 'En famille' },
          { id: 'business', icon: SEARCH_ICON.business, label: 'Business' },
          { id: 'romantique', icon: SEARCH_ICON.romance, label: 'Romantique' },
          { id: 'culture', icon: SEARCH_ICON.culture, label: 'Culture' }
        ],
        restaurant: [
          { id: 'gastronomie', icon: SEARCH_ICON.gastro, label: 'Gastronomie' },
          { id: 'brunch', icon: SEARCH_ICON.gastro, label: 'Brunch' },
          { id: 'bar', icon: SEARCH_ICON.gastro, label: 'Bar' },
          { id: 'bistro', icon: SEARCH_ICON.gastro, label: 'Bistro' },
          { id: 'rooftop', icon: SEARCH_ICON.gastro, label: 'Rooftop' }
        ],
        meeting: [
          { id: 'seminaire', icon: SEARCH_ICON.business, label: 'Séminaire' },
          { id: 'conference', icon: SEARCH_ICON.business, label: 'Conférence' },
          { id: 'cocktail', icon: SEARCH_ICON.gastro, label: 'Cocktail' },
          { id: 'teambuilding', icon: SEARCH_ICON.family, label: 'Team building' },
          { id: 'reunion', icon: SEARCH_ICON.business, label: 'Réunion' }
        ]
      };
      return chipSets[mode] || chipSets.sejour;
    }
```

- [ ] **Step 2: Update chip rendering in dropdown**

In the `render()` method, replace the hardcoded chips (lines 424-429) with:

```javascript
                <div class="wd-booking__dd-chips">
                  ${this._getChipsForMode(mode).map(chip => 
                    `<button class="wd-booking__dd-chip" data-chip="${chip.id}" type="button"><span class="wd-booking__dd-chip-icon">${chip.icon}</span>${esc(chip.label)}</button>`
                  ).join("")}
                </div>
```

- [ ] **Step 3: Test chips change with mode**

Click "Séjour" tab, open search dropdown:
Expected chips: Détente & spa, Gastronomie, En famille, Business, Romantique, Culture

Click "Restaurant" tab, open dropdown:
Expected chips: Gastronomie, Brunch, Bar, Bistro, Rooftop

Click "Meeting" tab, open dropdown:
Expected chips: Séminaire, Conférence, Cocktail, Team building, Réunion

- [ ] **Step 4: Commit chip adaptation**

```bash
git add core/components/components.js
git commit -m "feat: adapt dropdown chips based on search mode"
```

---

## Task 7: End-to-End Testing

**Files:**
- No file changes (manual testing)

- [ ] **Step 1: Test full user journey - Séjour mode**

1. Load homepage
2. Verify "Séjour" tab is active by default
3. Click destination field
4. Verify dropdown shows hotel chips (spa, gastronomie, famille, business, romantique, culture)
5. Type "Paris" in destination
6. Verify autocomplete suggestions appear
7. Click dates field → verify placeholder "JJ/MM/AAAA → JJ/MM/AAAA"
8. Click voyageurs field → verify placeholder "1 personne, 1 chambre"
9. Click "Rechercher" button
10. Verify search executes (or shows validation if destination empty)

Expected: All steps work as in original V1

- [ ] **Step 2: Test full user journey - Restaurant mode**

1. Click "Restaurant" tab
2. Verify tab becomes active with underline
3. Verify fields fade and update (200ms transition)
4. Click destination field → type "Lyon"
5. Open dropdown → verify restaurant chips (Gastronomie, Brunch, Bar, Bistro, Rooftop)
6. Click "Quand ?" field → verify placeholder "JJ/MM/AAAA à HH:MM"
7. Click "Combien de couverts ?" field → verify placeholder "2 personnes"
8. Verify only 3 fields visible (no 4th field)
9. Click "Rechercher"

Expected: All fields adapt to restaurant mode, dropdown shows restaurant chips

- [ ] **Step 3: Test full user journey - Meeting mode**

1. Click "Meeting & Événement" tab
2. Verify active state updates
3. Verify fields transition smoothly
4. Click destination → type "Dubai"
5. Open dropdown → verify meeting chips (Séminaire, Conférence, Cocktail, Team building, Réunion)
6. Click "Du ... au ..." field → verify date range placeholder
7. Click "Nombre de participants ?" field → verify placeholder "10 participants"
8. Verify 4th field appears: "Type d'événement (facultatif)"
9. Click 4th field → verify dropdown with options (Séminaire, Conférence, Cocktail, Team building, Réunion, Autre)
10. Click "Rechercher"

Expected: All 4 fields visible, event type dropdown works

- [ ] **Step 4: Test destination persistence across modes**

1. Select "Séjour" tab
2. Type "Singapour" in destination field
3. Switch to "Restaurant" tab
4. Verify "Singapour" is still in destination field
5. Switch to "Meeting" tab
6. Verify "Singapour" is still there

Expected: Destination value persists across all mode changes

- [ ] **Step 5: Test keyboard navigation**

1. Tab to first tab button (Séjour)
2. Press Enter → verify it activates (if already active, moves to next)
3. Press Tab → move to Restaurant tab
4. Press Enter → verify Restaurant activates and fields update
5. Tab to Meeting tab
6. Press Enter → verify Meeting activates
7. Continue tabbing → verify focus moves to destination field

Expected: Full keyboard navigation works, Enter key activates tabs

- [ ] **Step 6: Test screen reader announcements (manual with VoiceOver/NVDA)**

Enable screen reader:
1. Click each tab
2. Verify announcement: "Séjour, tab, selected" / "Restaurant, tab, selected" / "Meeting & Événement, tab, selected"
3. Verify field labels are announced correctly in each mode

Expected: All ARIA attributes work, announcements are clear

- [ ] **Step 7: Test mobile responsive behavior**

Resize browser to 375px width:
1. Verify tabs stack or wrap appropriately
2. Verify tab font size is readable
3. Verify icons remain visible
4. Verify search fields adapt to mobile layout
5. Verify all interactions still work on touch

Expected: Mobile layout works, no overflow, touch targets adequate

- [ ] **Step 8: Test edge cases**

1. Click same active tab twice → verify no double-dispatch or errors
2. Rapidly switch between tabs → verify no race conditions or visual glitches
3. Open dropdown, then switch tabs → verify dropdown closes gracefully
4. Type in destination, switch tabs mid-typing → verify typing state is preserved
5. Refresh page → verify default "Séjour" tab is active

Expected: All edge cases handled gracefully

- [ ] **Step 9: Performance check**

Browser DevTools Performance tab:
1. Record while switching between all 3 tabs
2. Verify transition is smooth (60fps)
3. Verify no long tasks or jank
4. Verify re-render completes under 200ms

Expected: Smooth 60fps transitions, no performance issues

- [ ] **Step 10: Cross-browser testing**

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

Verify for each:
- Tabs render correctly
- Styles match design
- Transitions are smooth
- Events fire correctly
- Keyboard nav works

Expected: Works identically in all browsers

---

## Task 8: Final Documentation and Cleanup

**Files:**
- Create: `docs/search-tabs-usage.md`

- [ ] **Step 1: Write usage documentation**

Create `docs/search-tabs-usage.md`:

```markdown
# Search Tabs Usage Guide

## Component: `<wd-search-tabs>`

Tabbed navigation for switching between search modes (Séjour, Restaurant, Meeting & Événement).

### Usage

\`\`\`html
<wd-search-tabs active="sejour"></wd-search-tabs>
\`\`\`

### Attributes

- `active` (optional, default: `"sejour"`) — Initial active tab
  - Values: `"sejour"` | `"restaurant"` | `"meeting"`

### Events

- `search-mode-change` — Dispatched when user clicks a tab
  - `event.detail.mode` — New mode value

### Example Integration

\`\`\`html
<wd-hero ...></wd-hero>

<div style="padding: var(--spacing-xl) 0;">
  <wd-search-tabs active="sejour"></wd-search-tabs>
  <div style="margin-top: var(--spacing-xl);">
    <wd-booking cta="Rechercher"></wd-booking>
  </div>
</div>
\`\`\`

### Booking Component Integration

The `<wd-booking>` component automatically listens for `search-mode-change` events and adapts its fields:

**Séjour mode:**
- Destination + Dates + Voyageurs

**Restaurant mode:**
- Destination + Date/Heure + Couverts

**Meeting mode:**
- Destination + Dates + Participants + Type d'événement

### Customization

Override CSS custom properties:

\`\`\`css
.wd-search-tab {
  --tab-active-color: #your-brand-color;
}
\`\`\`
```

- [ ] **Step 2: Add inline code comments**

Review `core/components/components.js` and add comments:
- Above `wd-search-tabs` definition: explain purpose
- Above `_fieldConfigs`: explain mode structure
- Above `handleModeChange`: explain transition logic

- [ ] **Step 3: Remove temporary test code**

Check for any console.log statements or test code added during development:

```bash
grep -n "console.log" core/components/components.js
```

Remove any found.

- [ ] **Step 4: Update CHANGELOG or docs/LEARNINGS.md**

Add entry to `docs/LEARNINGS.md` (or create if doesn't exist):

```markdown
## 2026-07-24: Search Tabs Implementation

### What we built
- Tab navigation above search bar with 3 modes (Séjour, Restaurant, Meeting)
- Event-driven communication between `wd-search-tabs` and `wd-booking`
- Adaptive search fields with smooth fade transitions
- Mode-specific dropdown chips
- Full keyboard accessibility

### Key decisions
- Standalone component approach (not integrated into booking)
- Pure event-driven communication (no shared state)
- Field configs as object map (easy to extend)
- 200ms fade transition for field changes

### Challenges solved
- Preserving destination value across mode changes
- Smooth fade transitions without flicker
- 4th field only in meeting mode (conditional rendering)
- Icon alignment and responsive behavior
```

- [ ] **Step 5: Final code review**

Review each modified file for:
- [ ] No console.log statements
- [ ] No placeholder TODOs
- [ ] Consistent indentation
- [ ] Clear variable names
- [ ] Comments where logic is non-obvious

- [ ] **Step 6: Final commit and tag**

```bash
git add docs/search-tabs-usage.md docs/LEARNINGS.md core/components/components.js
git commit -m "docs: add search tabs usage guide and update learnings"
git tag -a v2.0-search-tabs -m "V2: Search tabs feature complete"
```

---

## Spec Coverage Review

✅ **New Component `<wd-search-tabs>`** — Task 2  
✅ **Modified Component `<wd-booking>`** — Task 4  
✅ **Tab Styling** — Task 3  
✅ **Icons** — Task 1  
✅ **Event Communication** — Tasks 2, 4  
✅ **Field Configurations** — Task 4, Step 1  
✅ **Fade Transitions** — Task 4, Step 4  
✅ **Dropdown Adaptations** — Task 6  
✅ **Keyboard Navigation** — Task 7, Step 5  
✅ **Screen Reader Support** — Task 7, Step 6  
✅ **Responsive Behavior** — Task 3, Step 7 + Task 7, Step 7  
✅ **Homepage Integration** — Task 5  
✅ **Testing Checklist** — Task 7 (all steps)  
✅ **Documentation** — Task 8  

All spec requirements covered.

---

## Success Criteria

✅ User can switch between 3 search modes via tabs  
✅ Search fields adapt to selected mode  
✅ Destination value persists across mode changes  
✅ Visual design matches Pullman brand (uses welDS tokens)  
✅ Transitions are smooth (200ms fade)  
✅ Keyboard navigation works (Tab, Enter, arrow keys)  
✅ Screen readers announce mode changes (ARIA attributes)  
✅ Dropdown content adapts to mode (chips change)  
✅ No breaking changes to existing homepage functionality
