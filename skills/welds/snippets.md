# welDS — 12 atomes HTML/CSS (standalone)

Snippets prêts à copier-coller pour un prototypage rapide. Tous les atomes utilisent
**exclusivement les CSS variables welDS** — aucun hex, aucun px hardcodé hors tokens.

> **Prerequis** — importe `base.css` + `brands.css` dans ton entry, et mets la classe
> `brand-brandbook` (ou autre) sur ton `<body>`.

---

## 1. Button (button-bb)

3 variants (primary, secondary, tertiary). **Un seul primary par écran.**

```html
<button class="welds-button welds-button--primary">Primary label</button>
<button class="welds-button welds-button--secondary">Secondary label</button>
<button class="welds-button welds-button--tertiary">Tertiary label</button>
```

```css
.welds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  border: 1px solid transparent;
  border-radius: var(--radius-element-full, 9999px);
  font-family: var(--font-family-label);
  font-size: var(--font-size-label-md);
  line-height: var(--line-height-label-md);
  letter-spacing: var(--letter-spacing-label);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.welds-button--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.welds-button--primary:hover { background: var(--color-hover-primary); }
.welds-button--secondary {
  background: var(--color-surface);
  color: var(--color-on-surface-hi);
  border-color: var(--color-outline-mid);
}
.welds-button--secondary:hover { background: var(--color-hover-surface-container-low); }
.welds-button--tertiary {
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-hi);
}
.welds-button--tertiary:hover { background: var(--color-hover-surface-container-low); }
```

---

## 2. Input text

Pour les **logins**, utiliser `type="password"` avec `input-text` — PAS `input-password`
(qui est un composant dédié à la registration, pas inclus ici).

```html
<label class="welds-input-label" for="email">Email</label>
<input class="welds-input" id="email" type="email" placeholder="you@accor.com" />

<label class="welds-input-label" for="pwd">Mot de passe</label>
<input class="welds-input" id="pwd" type="password" placeholder="••••••••" />
```

```css
.welds-input-label {
  display: block;
  font-family: var(--font-family-label);
  font-size: var(--font-size-label-md);
  line-height: var(--line-height-label-md);
  color: var(--color-on-surface-hi);
  margin-bottom: 8px;
}
.welds-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: var(--color-surface);
  color: var(--color-on-surface-hi);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  border: 1px solid var(--color-outline-low);
  border-radius: var(--radius-element-sm, 4px);
  outline: none;
  transition: border-color 0.15s ease;
}
.welds-input:focus {
  border-color: var(--color-focus);
}
.welds-input::placeholder {
  color: var(--color-on-surface-low);
}
```

---

## 3. Checkbox

```html
<label class="welds-checkbox">
  <input type="checkbox" />
  <span class="welds-checkbox__box"></span>
  <span class="welds-checkbox__label">Se souvenir de moi</span>
</label>
```

```css
.welds-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  color: var(--color-on-surface-hi);
}
.welds-checkbox input { position: absolute; opacity: 0; pointer-events: none; }
.welds-checkbox__box {
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-outline-hi);
  border-radius: var(--radius-element-xs, 2px);
  background: var(--color-surface);
  transition: border-color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.welds-checkbox input:checked ~ .welds-checkbox__box {
  background: var(--color-primary);
  border-color: var(--color-primary);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='white' d='M7.5 13.5l-3-3 1-1 2 2 5-5 1 1z'/></svg>");
  background-repeat: no-repeat;
  background-position: center;
}
.welds-checkbox input:focus ~ .welds-checkbox__box {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

---

## 4. Radio

```html
<label class="welds-radio">
  <input type="radio" name="brand" value="sofitel" />
  <span class="welds-radio__dot"></span>
  <span class="welds-radio__label">Sofitel</span>
</label>
```

```css
.welds-radio {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  color: var(--color-on-surface-hi);
}
.welds-radio input { position: absolute; opacity: 0; pointer-events: none; }
.welds-radio__dot {
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-outline-hi);
  border-radius: 50%;
  background: var(--color-surface);
  position: relative;
  flex-shrink: 0;
}
.welds-radio input:checked ~ .welds-radio__dot::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--color-primary);
}
.welds-radio input:checked ~ .welds-radio__dot { border-color: var(--color-primary); }
```

---

## 5. Link

Variant `default` (underlined) ou `icon` (avec flèche).

```html
<a class="welds-link" href="#">Link label</a>
<a class="welds-link welds-link--icon" href="#">
  Link label
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M13 8l-4-4M13 8l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</a>
```

```css
.welds-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-family-link);
  font-size: var(--font-size-link-md);
  line-height: var(--line-height-link-md);
  letter-spacing: var(--letter-spacing-link);
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.welds-link:hover { color: var(--color-hover-link); }
.welds-link--icon { text-decoration: none; }
```

---

## 6. Badge

```html
<span class="welds-badge">New</span>
<span class="welds-badge welds-badge--success">Confirmed</span>
<span class="welds-badge welds-badge--danger">Cancelled</span>
```

```css
.welds-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--color-accent-container-low);
  color: var(--color-on-accent-container);
  font-family: var(--font-family-caption);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
  letter-spacing: var(--letter-spacing-caption);
  border-radius: var(--radius-element-full, 9999px);
}
.welds-badge--success {
  background: var(--color-success-container-low, var(--color-accent-container-low));
  color: var(--color-on-success-container-low, var(--color-on-accent-container));
}
.welds-badge--danger {
  background: var(--color-danger-container-low);
  color: var(--color-on-danger-container-low);
}
```

---

## 7. Chip

```html
<span class="welds-chip">Paris</span>
<button class="welds-chip welds-chip--dismissable">
  Luxury
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</button>
```

```css
.welds-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-hi);
  font-family: var(--font-family-label);
  font-size: var(--font-size-label-md);
  line-height: var(--line-height-label-md);
  border: 1px solid var(--color-outline-low);
  border-radius: var(--radius-element-full, 9999px);
  cursor: pointer;
}
.welds-chip:hover { background: var(--color-hover-surface-container-low); }
.welds-chip--dismissable { padding-right: 12px; border: 0; background-color: transparent; }
```

---

## 8. Card

```html
<article class="welds-card">
  <h3 class="welds-card__title">Titre de la carte</h3>
  <p class="welds-card__body">Description ou contenu de la carte.</p>
</article>
```

```css
.welds-card {
  background: var(--color-surface);
  color: var(--color-on-surface-hi);
  border-radius: var(--radius-container-md, 16px);
  padding: 24px;
}
.welds-card__title {
  margin: 0 0 8px;
  font-family: var(--font-family-display);
  font-weight: 700;
  font-size: var(--font-size-display-md);
  line-height: var(--line-height-display-md);
  letter-spacing: var(--letter-spacing-display-condensed);
  color: var(--color-on-surface-hi);
}
.welds-card__body {
  margin: 0;
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  color: var(--color-on-surface-mid);
}
```

---

## 9. Banner

```html
<div class="welds-banner welds-banner--neutral">
  Une annonce discrète, low emphasis.
</div>
<div class="welds-banner welds-banner--warning">
  Attention : cette réservation expire bientôt.
</div>
```

```css
.welds-banner {
  padding: 16px;
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-hi);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  border-radius: var(--radius-container-low, 8px);
  border-left: 4px solid var(--color-outline-mid);
}
.welds-banner--warning {
  background: var(--color-warning-container, var(--color-surface-container-low));
  color: var(--color-on-warning-container, var(--color-on-surface-hi));
  border-left-color: var(--color-warning);
}
.welds-banner--danger {
  background: var(--color-danger-container-low);
  color: var(--color-on-danger-container-low);
  border-left-color: var(--color-danger);
}
```

---

## 10. Modal

```html
<div class="welds-modal-backdrop">
  <div class="welds-modal" role="dialog" aria-modal="true">
    <h2 class="welds-modal__title">Confirmer la réservation</h2>
    <p class="welds-modal__body">Votre séjour du 12 au 18 juin sera validé.</p>
    <div class="welds-modal__actions">
      <button class="welds-button welds-button--secondary">Annuler</button>
      <button class="welds-button welds-button--primary">Confirmer</button>
    </div>
  </div>
</div>
```

```css
.welds-modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--color-overlay-mid, rgba(0,0,0,0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.welds-modal {
  background: var(--color-surface);
  color: var(--color-on-surface-hi);
  border-radius: var(--radius-container-md, 16px);
  padding: 32px;
  max-width: 480px;
  width: 100%;
}
.welds-modal__title {
  margin: 0 0 16px;
  font-family: var(--font-family-display);
  font-weight: 700;
  font-size: var(--font-size-display-md);
  line-height: var(--line-height-display-md);
  letter-spacing: var(--letter-spacing-display-condensed);
  color: var(--color-on-surface-hi);
}
.welds-modal__body {
  margin: 0 0 24px;
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  color: var(--color-on-surface-mid);
}
.welds-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

---

## 11. Avatar

```html
<div class="welds-avatar">AJ</div>
<img class="welds-avatar" src="/avatar.jpg" alt="Adrian" />
```

```css
.welds-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-container-low);
  color: var(--color-on-primary-container);
  font-family: var(--font-family-label);
  font-size: var(--font-size-label-md);
  font-weight: 500;
  line-height: 1;
  object-fit: cover;
  overflow: hidden;
}
```

---

## 12. Separator

```html
<hr class="welds-separator" />
```

```css
.welds-separator {
  margin: 0;
  border: 0;
  height: 1px;
  background: var(--color-outline-low);
}
```

---

## Section layout pattern (bonus)

Pour assembler un écran, utilise la stack spacing welDS :

```html
<section class="welds-section">
  <header class="welds-section__header">
    <span class="welds-section__kicker">Kicker</span>
    <h2 class="welds-section__title">Section primary title</h2>
  </header>
  <div class="welds-section__body">
    <!-- content -->
  </div>
</section>
```

```css
.welds-section {
  padding: 48px 32px;
  background: var(--color-surface);
  color: var(--color-on-surface-hi);
}
.welds-section__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-stack-xs);
  text-align: center;
  margin-bottom: var(--spacing-stack-xl);
}
.welds-section__kicker {
  font-family: var(--font-family-detail);
  font-size: var(--font-size-detail);
  line-height: var(--line-height-detail);
  letter-spacing: var(--letter-spacing-detail);
  color: var(--color-on-surface-low);
  text-transform: uppercase;
}
.welds-section__title {
  margin: 0;
  font-family: var(--font-family-display);
  font-weight: 700;
  font-size: var(--font-size-display-lg);
  line-height: var(--line-height-display-lg);
  letter-spacing: var(--letter-spacing-display-wide);
  color: var(--color-on-surface-hi);
}
```

---

**Au-delà de ces 12 atomes** (heading-hero, billboard, booking-engine, callout-hotel,
card-offer, carousel, slideshow-dual, etc.) → le designer a besoin du **MCP welDS complet**.
Ce starter est intentionnellement limité pour du prototypage rapide.
