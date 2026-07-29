/* ============================================================
   welDS — FRAMEWORK de composants (base AGNOSTIQUE, aucune marque, AUCUN master).
   Ce fichier ne fournit que la machinerie pour créer des masters <wd-*> :
   bases de composant, helper d'enregistrement, jeu d'icônes, surcharge de marque.
   → Crée TES masters via la skill « welds-component » (ils s'ajoutent plus bas,
     dans le même IIFE, et réutilisent WdEl / def / ICON / les helpers de marque).
   Light DOM → core/styles/base.css + la couche brands/<marque> s'appliquent.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Base 1 : composant à ATTRIBUTS seuls ----------
     Définir render() (HTML string) et, au besoin, afterRender() (listeners). */
  class WdEl extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const html = this.render ? this.render() : null;
      if (html != null) this.innerHTML = html;
      if (this.afterRender) this.afterRender();
    }
    attr(n, d) { return this.getAttribute(n) != null ? this.getAttribute(n) : (d != null ? d : ""); }
    has(n) { return this.hasAttribute(n); }
    list(n) { const v = this.getAttribute(n); return v ? v.split("|").map(s => s.trim()).filter(Boolean) : []; }
  }

  /* ---------- Base 2 : composant qui CONSOMME ses enfants ----------
     (carrousel, galerie, accordéon…). On capture this.children AVANT d'écrire
     innerHTML (sinon ils sont détruits). Définir build(items) → HTML string. */
  class WdChildEl extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      this.items = [...this.children];
      const html = this.build ? this.build(this.items) : null;
      if (html != null) this.innerHTML = html;
      if (this.afterRender) this.afterRender();
    }
    attr(n, d) { return this.getAttribute(n) != null ? this.getAttribute(n) : (d != null ? d : ""); }
    has(n) { return this.hasAttribute(n); }
    list(n) { const v = this.getAttribute(n); return v ? v.split("|").map(s => s.trim()).filter(Boolean) : []; }
  }

  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const def = (tag, cls) => { if (!customElements.get(tag)) customElements.define(tag, cls); };

  /* ---------- Jeu d'icônes partagé (réutilisable par tes masters) ---------- */
  const ICON = {
    wordmark: `<svg class="wd-wordmark" viewBox="0 0 172 14" fill="none" aria-hidden="true" focusable="false"><text x="0" y="11" font-family="system-ui, sans-serif" font-size="11" letter-spacing="4" fill="currentColor">BRAND</text></svg>`,
    mono: `<svg viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false"><path d="M22 5 L39 22 L22 39 L5 22 Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    sparkles: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="currentColor" opacity="0.2"/><path d="M19 4l.5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5L19 4zM19 16l.5 1.5L21 18l-1.5.5L19 20l-.5-1.5L17 18l1.5-.5L19 16z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="currentColor"/></svg>`,
    person: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><circle cx="8" cy="5" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M3.6 13c0-2.4 2-3.9 4.4-3.9S12.4 10.6 12.4 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`,
    hearts: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    family: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="9" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3"/><circle cx="16.5" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M16.5 12a3.5 3.5 0 0 1 3.5 3.5V20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    group: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="9" cy="7" r="2.5" stroke="currentColor" stroke-width="1.3"/><circle cx="15" cy="7" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 19v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M13 18a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    briefcase: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke="currentColor" stroke-width="1.3"/><path d="M3 12h18" stroke="currentColor" stroke-width="1.3"/><rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1"/></svg>`,
    chevL: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevR: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    arrowR: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 12h13M12.5 6.5L18 12l-5.5 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevD: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" style="vertical-align:-1px"><path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.3" stroke="currentColor" stroke-width="1.2"/><path d="M8 12.2l2.6 2.6L16.2 9.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    close: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    cal: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 9h17M8 3.5v3M16 3.5v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    usr: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 19c0-3.3 2.9-5.4 6.5-5.4s6.5 2.1 6.5 5.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.4"/></svg>`,
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 4h3l1.6 4-2 1.4a11 11 0 0 0 5 5l1.4-2 4 1.6v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    bed: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M3 20v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1h6v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8M3 12V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    utensils: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M7 2v10a2 2 0 1 0 4 0V2M7 5h4M17 2v4a3 3 0 0 1-3 3v13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    presentation: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><rect x="2" y="3" width="20" height="14" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M9 22l3-5 3 5M7 22h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  /* ---- Surcharge de marque (logo + nom) : window.WD_BRAND = { name, wordmark, mono } ----
     Résolu AU RENDER (pas figé au boot). Priorité : attribut de l'élément > window.WD_BRAND
     > défaut NEUTRE (ICON placeholder). SVG en currentColor ; mono viewBox 0 0 44 44 ;
     wordmark ratio ~172×14. La couche brands/<marque>.js définit window.WD_BRAND. */
  const brandCfg = () => (typeof window !== "undefined" && window.WD_BRAND) || {};
  const brandName = () => brandCfg().name || "Brand";
  const wordmark = el => (el && el.getAttribute("wordmark")) || brandCfg().wordmark || ICON.wordmark;
  const monogram = el => (el && el.getAttribute("mono")) || brandCfg().mono || ICON.mono;

  /* ============================================================
     ↓↓↓  TES MASTERS <wd-*>  ↓↓↓
     Ajoute-les ICI (dans cet IIFE → accès à WdEl / WdChildEl / def / esc / ICON /
     brandName / wordmark / monogram). Utilise la skill « welds-component » (mode create).

     Exemple minimal (composant à attributs) :
       def("wd-hello", class extends WdEl {
         render() { return `<p class="t-sans-md">${esc(this.attr("name", "monde"))}</p>`; }
       });

     Composant qui consomme ses enfants (carrousel/galerie) : extends WdChildEl,
     définir build(items). Voir docs/COMPONENTS.md + docs/DESIGN.md pour les patterns.
     Règle d'or : 0 hex (couleurs via var(--*) / currentColor), logo via window.WD_BRAND.
     ============================================================ */

  /* ===================== MASTERS ===================== */

  /* ---------- wd-header ---------- */
  def("wd-header", class extends WdEl {
    render() {
      const items = this.list("nav");
      const lang = this.attr("lang", "EN");
      const currency = this.attr("currency", "USD ($)");
      const dropdowns = (this.attr("dropdowns") || "").split("|").map(s => s.trim()).filter(Boolean);
      const bookingEngine = this.has("booking-engine");

      return `<header class="wd-header">
        <div class="wd-header__top">
          <div class="wd-header__top-inner">
            <a href="#" class="wd-header__logo" aria-label="${brandName()} home">${wordmark(this)}</a>
            ${bookingEngine ? `
            <div class="wd-header__booking">
              <div class="wd-header__booking-tabs">
                <button class="wd-header__booking-tab wd-header__booking-tab--active" data-tab="hotels">Hôtels</button>
                <button class="wd-header__booking-tab" data-tab="meetings">Meetings</button>
                <button class="wd-header__booking-tab" data-tab="experiences">Expériences</button>
              </div>
              <div class="wd-header__booking-search">
                <button class="wd-header__booking-field">
                  <span class="wd-header__booking-field-label">Destination</span>
                  <span class="wd-header__booking-field-value">Où allez-vous ?</span>
                </button>
                <div class="wd-header__booking-sep"></div>
                <button class="wd-header__booking-field">
                  <span class="wd-header__booking-field-label">Arrivée</span>
                  <span class="wd-header__booking-field-value">Ajouter des dates</span>
                </button>
                <div class="wd-header__booking-sep"></div>
                <button class="wd-header__booking-field">
                  <span class="wd-header__booking-field-label">Départ</span>
                  <span class="wd-header__booking-field-value">Ajouter des dates</span>
                </button>
                <div class="wd-header__booking-sep"></div>
                <button class="wd-header__booking-field">
                  <span class="wd-header__booking-field-label">Voyageurs</span>
                  <span class="wd-header__booking-field-value">Ajouter des voyageurs</span>
                </button>
                <button class="wd-header__booking-btn" aria-label="Rechercher">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            ` : ''}
            <div class="wd-header__top-right">
              <div class="wd-header__params">
                <a href="#" class="wd-header__param">${esc(lang)}</a>
                <a href="#" class="wd-header__param">${esc(currency)}</a>
              </div>
              <a href="#" class="wd-header__account" aria-label="Account">${ICON.person} <span class="wd-header__account-label">Me connecter / m'inscrire</span></a>
            </div>
          </div>
        </div>
        <div class="wd-header__bottom">
          <nav class="wd-header__bottom-inner" aria-label="Main">
            ${items.map(i => {
              const hasChev = dropdowns.includes(i);
              return `<a href="#" class="wd-header__link">${esc(i)}${hasChev ? ` ${ICON.chevD}` : ""}</a>`;
            }).join("")}
          </nav>
        </div>
      </header>`;
    }
  });

  /* ---------- wd-hero ---------- */
  def("wd-hero", class extends WdEl {
    render() {
      const img = this.attr("img", "");
      const kicker = this.attr("kicker");
      const title = this.attr("title", brandName());
      const subtitle = this.attr("subtitle");
      const cta1 = this.attr("cta1");
      const cta2 = this.attr("cta2");
      const caption = this.attr("caption");
      const copy = this.attr("copyright");
      return `<section class="wd-hero" style="background-image:url('${img}')">
        <div class="wd-hero__overlay"></div>
        <div class="wd-hero__content">
          ${kicker ? `<p class="t-eyebrow wd-hero__kicker">${esc(kicker)}</p>` : ""}
          <h1 class="t-serif-2xl wd-hero__title">${esc(title)}</h1>
          ${subtitle ? `<p class="t-sans-md wd-hero__sub">${esc(subtitle)}</p>` : ""}
          ${cta1 || cta2 ? `<div class="wd-hero__actions">
            ${cta1 ? `<a href="#" class="wd-btn wd-btn--primary">${esc(cta1)}</a>` : ""}
            ${cta2 ? `<a href="#" class="wd-btn wd-btn--outline">${esc(cta2)}</a>` : ""}
          </div>` : ""}
        </div>
        ${caption || copy ? `<div class="wd-hero__caption"><span>${esc(caption || "")}</span><span>${esc(copy || "")}</span></div>` : ""}
        <div class="wd-hero__pager">1 / 3</div>
      </section>`;
    }
  });

  /* ---------- wd-booking ---------- */
  const SEARCH_ICON = {
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    building: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="8" y="7" width="3" height="3" rx=".5" stroke="currentColor" stroke-width="1.1"/><rect x="13" y="7" width="3" height="3" rx=".5" stroke="currentColor" stroke-width="1.1"/><rect x="8" y="13" width="3" height="3" rx=".5" stroke="currentColor" stroke-width="1.1"/><rect x="13" y="13" width="3" height="3" rx=".5" stroke="currentColor" stroke-width="1.1"/></svg>`,
    landmark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="13" width="6" height="8" rx=".5" stroke="currentColor" stroke-width="1.3"/></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2.9 5.8 6.4.9-4.6 4.5 1.1 6.4L12 16.3l-5.8 3.3 1.1-6.4L2.7 8.7l6.4-.9L12 2z" fill="currentColor"/></svg>`,
    search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    wifi: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19.5h.01M5.64 11.64a9 9 0 0 1 12.72 0M2.1 8.1a14 14 0 0 1 19.8 0M8.53 14.53a5 5 0 0 1 6.94 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    workspace: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 19v2M17 19v2M9 9h6M9 12h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    train: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.3"/><path d="M4 11h16M12 3v8M8 15.5h.01M16 15.5h.01M6 19l-2 3M18 19l2 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    parking: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M9 16V8h4a3 3 0 0 1 0 6H9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    restaurant: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3v6c0 1.7 1.3 3 3 3h1v9M11 3v18M17 3c0 4-2 6-2 9s2 5 2 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    meeting: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="7" width="20" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="13" r="2" stroke="currentColor" stroke-width="1.2"/></svg>`,
    wellness: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21c-3-2.5-8-6.2-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 4.8-5 8.5-8 11z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13c1.5-1.5 3-3.5 3-5.5a2.5 2.5 0 0 0-3-2.4A2.5 2.5 0 0 0 9 7.5c0 2 1.5 4 3 5.5z" fill="currentColor" opacity=".15"/></svg>`,
    gastro: `<svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z"/></svg>`,
    business: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke="currentColor" stroke-width="1.3"/><path d="M3 12h18" stroke="currentColor" stroke-width="1.3"/><rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1"/></svg>`,
    family: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3"/><circle cx="16.5" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M16.5 12a3.5 3.5 0 0 1 3.5 3.5V20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    eco: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 8C8 10 7 18 7 18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M7 18S9 8 19 4c0 0 1 8-5 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 4c-10 4-12 14-12 14" stroke="currentColor" stroke-width="0" fill="currentColor" opacity=".08"/></svg>`,
    seminar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M7 9l3 2.5L13 8l4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    romance: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    culture: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21v-6h6v6" stroke="currentColor" stroke-width="1.3"/><path d="M9 10h1M14 10h1M9 13h1M14 13h1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    beach: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.5 19H3M21 19h-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M12 3v16" stroke="currentColor" stroke-width="1.3"/><path d="M12 3c-4 2-6 6-6 9h12c0-3-2-7-6-9z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M2 22c2-1 3-2 5-2s3 1 5 2c2-1 3-2 5-2s3 1 5 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    luxury: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2L9.5 9H2l6 4.5L5.5 21 12 16.5 18.5 21 16 13.5 22 9h-7.5L12 2z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity=".12"/></svg>`,
    fitness: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 6.5a2 2 0 0 1 2-2h1v15h-1a2 2 0 0 1-2-2v-11zM14.5 4.5h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1v-15zM9.5 12h5M2 10v4M22 10v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    pet: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="16" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="11" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="19" cy="11" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M12 20c-4 0-6-3-6-6 0-2 2-4 6-4s6 2 6 4c0 3-2 6-6 6z" stroke="currentColor" stroke-width="1.2"/></svg>`,
    accessible: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="1.8" stroke="currentColor" stroke-width="1.2"/><path d="M9 10h6l-1 5h-2M10 15a4 4 0 1 0 5.5-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    pool: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M2 21c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 15V6a2 2 0 0 1 4 0M12 15V6a2 2 0 0 1 4 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    spa: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21c0-4 3-9 9-11-1 6-5 9-9 11z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 21c0-4-3-9-9-11 1 6 5 9 9 11z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 21v-6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    yoga: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8" stroke="currentColor" stroke-width="1.2"/><path d="M12 8v5M4 20l8-3 8 3M6 12h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    terrace: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10h18L12 3 3 10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 10v11M7 21h10M6 14h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    garden: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 22v-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M12 15c-3 0-5-2-5-5 3 0 5 2 5 5zM12 12c0-3 2-5 5-5 0 3-2 5-5 5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
    bar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14l-7 8-7-8zM12 12v7M8 21h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    rooftop: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 21V10l9-6 9 6v11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 21h18M8 21v-5h8v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="12" cy="10" r="1" fill="currentColor"/></svg>`,
    kids: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M12 7v7M8 10h8M9 21l3-4 3 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    shuttle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M3 11h18M8 6V6" stroke="currentColor" stroke-width="1.3"/><circle cx="7.5" cy="18.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="16.5" cy="18.5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>`,
    concierge: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 18h16M6 18v-3a6 6 0 0 1 12 0v3M12 6V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="21" r="0" fill="currentColor"/></svg>`,
    bike: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="17" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="18" cy="17" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M6 17l3.5-7h5l-2.5 7M9 10h4M14.5 10l2 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    dining: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8L12 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M6 18c0 2 2.7 3 6 3s6-1 6-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  };

  const TAG_TO_ICON = {
    'spa': 'spa', 'piscine': 'pool', 'yoga': 'yoga', 'fitness': 'fitness', 'hammam': 'spa',
    'terrasse': 'terrace', 'jardin': 'garden', 'restaurant': 'restaurant', 'restaurant étoilé': 'dining',
    'bar': 'bar', 'rooftop': 'rooftop', 'brunch': 'restaurant', 'kids club': 'kids', 'plage': 'beach',
    'animaux acceptés': 'pet', 'navette': 'shuttle', 'parking': 'parking', 'salle de réunion': 'meeting',
    'business center': 'business', 'coworking': 'workspace', 'wi-fi': 'wifi', 'conciergerie': 'concierge',
    'voiturier': 'concierge', 'vélos': 'bike'
  };

  const FILTER_TABS = [
    { id: "wellness", icon: "wellness", label: "Bien-être" },
    { id: "gastro", icon: "gastro", label: "Gastronomie" },
    { id: "business", icon: "business", label: "Professionnel" },
    { id: "family", icon: "family", label: "Famille" },
    { id: "eco", icon: "eco", label: "Éco-responsable" },
    { id: "meeting", icon: "seminar", label: "Séminaire" },
  ];

  const MOCK_RECENTS = [
    { dest: "Paris, France", meta: "2 adultes, 1 chambre" },
    { dest: "Détente bord de mer en France", meta: "1 personne, 1 chambre" },
  ];

  /* ---------- Recherches récentes (persistées via localStorage) ---------- */
  const RECENTS_KEY = 'wd_recent_searches';
  const RECENTS_MAX = 6;
  const normStr = (s) => (s || '').toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const getRecents = () => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (raw === null) { localStorage.setItem(RECENTS_KEY, JSON.stringify(MOCK_RECENTS)); return MOCK_RECENTS.slice(); }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return MOCK_RECENTS.slice(); }
  };
  const saveRecents = (list) => { try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)); } catch (_) {} };
  const addRecent = (entry) => {
    if (!entry || !entry.dest) return;
    const dest = entry.dest.trim();
    if (!dest) return;
    let list = getRecents().filter(r => normStr(r.dest) !== normStr(dest));
    list.unshift({ dest: dest, meta: entry.meta || 'Recherche récente', q: entry.q || dest });
    if (list.length > RECENTS_MAX) list = list.slice(0, RECENTS_MAX);
    saveRecents(list);
  };
  const removeRecent = (dest) => { saveRecents(getRecents().filter(r => normStr(r.dest) !== normStr(dest))); };

  const MOCK_HOTELS = [
    { name: "Pullman Paris Montparnasse", loc: "Paris, France", badge: "Nouveau", lat: 48.8422, lng: 2.3219, stars: 4, price: 189, region: "europe", img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
    { name: "Pullman Paris Tour Eiffel", loc: "Paris, France", badge: "Rénové", lat: 48.8559, lng: 2.2930, stars: 5, price: 259, region: "europe", img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
    { name: "Pullman Dubai Creek City Centre", loc: "Dubaï, EAU", badge: "Nouveau", lat: 25.2532, lng: 55.3320, stars: 5, price: 199, region: "moyen-orient", img: "https://m.ahstatic.com/is/image/accorhotels/6556-1:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
    { name: "Pullman Singapore Orchard", loc: "Singapour", badge: null, lat: 1.3048, lng: 103.8318, stars: 5, price: 229, region: "asie", img: "https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
  ];

  const MOCK_PROMOS = [
    { title: "Business Pass — Jusqu'à 25% sur vos séjours", desc: "Conditions flexibles pour vos voyages d'affaires." },
    { title: "Weekends Pullman — Profitez de nos tarifs détente", desc: "Spa, gastronomie et art de vivre pour un break mérité." },
  ];

  const MOCK_AUTOCOMPLETE = {
    destinations: [
      { name: "France", country: "", count: 22, type: "Pays", lat: 46.6, lng: 2.5, zoom: 5 },
      { name: "Espagne", country: "", count: 4, type: "Pays", lat: 40.4, lng: -3.7, zoom: 5 },
      { name: "Maroc", country: "", count: 3, type: "Pays", lat: 31.8, lng: -7.1, zoom: 5 },
      { name: "Royaume-Uni", country: "", count: 5, type: "Pays", lat: 51.5, lng: -0.1, zoom: 5 },
      { name: "Émirats arabes unis", country: "", count: 6, type: "Pays", lat: 25.2, lng: 55.3, zoom: 6 },
      { name: "Thaïlande", country: "", count: 4, type: "Pays", lat: 13.7, lng: 100.5, zoom: 5 },
      { name: "Indonésie", country: "", count: 3, type: "Pays", lat: -5.0, lng: 115.0, zoom: 4 },
      { name: "Japon", country: "", count: 2, type: "Pays", lat: 35.6, lng: 139.7, zoom: 5 },
      { name: "Singapour", country: "Singapour", count: 3, type: "Ville", lat: 1.3, lng: 103.8 },
      { name: "Paris", country: "France", count: 12, type: "Ville" },
      { name: "Parme", country: "Italie", count: 1, type: "Ville" },
      { name: "Lyon", country: "France", count: 3, type: "Ville" },
      { name: "Londres", country: "Royaume-Uni", count: 5, type: "Ville" },
      { name: "Lisbonne", country: "Portugal", count: 2, type: "Ville" },
      { name: "Marseille", country: "France", count: 2, type: "Ville" },
      { name: "Marrakech", country: "Maroc", count: 3, type: "Ville" },
      { name: "Nice", country: "France", count: 2, type: "Ville" },
      { name: "Bordeaux", country: "France", count: 1, type: "Ville" },
      { name: "Barcelone", country: "Espagne", count: 4, type: "Ville" },
      { name: "Berlin", country: "Allemagne", count: 2, type: "Ville" },
      { name: "Dubaï", country: "Émirats arabes unis", count: 6, type: "Ville" },
      { name: "Dubai", country: "Émirats arabes unis", count: 6, type: "Ville" },
      { name: "New York", country: "États-Unis", count: 2, type: "Ville" },
      { name: "Tokyo", country: "Japon", count: 2, type: "Ville" },
      { name: "Bangkok", country: "Thaïlande", count: 4, type: "Ville" },
      { name: "Bali", country: "Indonésie", count: 3, type: "Île" },
      { name: "Côte d'Azur", country: "France", count: 4, type: "Région" },
    ],
    hotels: [
      { name: "Pullman Paris Montparnasse", loc: "Paris, France", lat: 48.8422, lng: 2.3219, stars: 4, price: 189, region: "europe", tags: ["business", "culture", "gastro"], services: ["pool", "gym", "restaurant", "bar", "meeting-room", "parking", "wifi", "room-service", "concierge", "laundry", "ev-charging"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Paris Tour Eiffel", loc: "Paris, France", lat: 48.8559, lng: 2.2930, stars: 5, price: 259, region: "europe", tags: ["romance", "luxury", "culture"], services: ["pool", "spa", "gym", "restaurant", "bar", "rooftop", "room-service", "concierge", "valet", "wifi", "laundry", "pet-friendly"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Paris Bercy", loc: "Paris, France", lat: 48.8396, lng: 2.3826, stars: 4, price: 175, region: "europe", tags: ["business", "meeting"], services: ["meeting-room", "business-center", "gym", "restaurant", "bar", "parking", "wifi", "room-service", "laundry", "ev-charging", "coworking"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Lyon Part-Dieu", loc: "Lyon, France", lat: 45.7602, lng: 4.8590, stars: 4, price: 159, region: "europe", tags: ["business", "gastro"], services: ["restaurant", "bar", "meeting-room", "business-center", "gym", "parking", "wifi", "room-service", "laundry", "shuttle"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Lyon Centre", loc: "Lyon, France", lat: 45.7640, lng: 4.8357, stars: 4, price: 169, region: "europe", tags: ["gastro", "culture", "wellness"], services: ["spa", "pool", "gym", "restaurant", "bar", "terrace", "wifi", "room-service", "concierge", "laundry", "pet-friendly"], img: "https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Marseille Provence", loc: "Marseille, France", lat: 43.4370, lng: 5.2148, stars: 4, price: 145, region: "europe", tags: ["beach", "gastro", "family", "wellness"], services: ["pool", "spa", "restaurant", "bar", "terrace", "kids-club", "parking", "wifi", "room-service", "shuttle", "bike-rental", "gym"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Marrakech Palmeraie", loc: "Marrakech, Maroc", lat: 31.6690, lng: -7.9811, stars: 5, price: 179, region: "moyen-orient", tags: ["wellness", "romance", "luxury", "meeting"], services: ["spa", "pool", "gym", "restaurant", "bar", "golf", "meeting-room", "concierge", "valet", "wifi", "room-service", "kids-club", "terrace", "garden"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman London St Pancras", loc: "Londres, Royaume-Uni", lat: 51.5305, lng: -0.1240, stars: 5, price: 289, region: "europe", tags: ["business", "culture", "luxury"], services: ["gym", "restaurant", "bar", "meeting-room", "business-center", "concierge", "valet", "wifi", "room-service", "laundry", "pet-friendly"], img: "https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Barcelona Skipper", loc: "Barcelone, Espagne", lat: 41.3851, lng: 2.1994, stars: 5, price: 219, region: "europe", tags: ["beach", "gastro", "romance"], services: ["pool", "spa", "gym", "restaurant", "bar", "rooftop", "terrace", "wifi", "room-service", "concierge", "bike-rental", "pet-friendly"], img: "https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Dubai Creek City Centre", loc: "Dubaï, EAU", lat: 25.2532, lng: 55.3320, stars: 5, price: 199, region: "moyen-orient", tags: ["luxury", "business", "family"], services: ["pool", "spa", "gym", "restaurant", "bar", "rooftop", "meeting-room", "business-center", "kids-club", "concierge", "valet", "wifi", "room-service", "shuttle", "laundry"], img: "https://m.ahstatic.com/is/image/accorhotels/6556-1:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Singapore Orchard", loc: "Singapour", lat: 1.3048, lng: 103.8318, stars: 5, price: 229, region: "asie", tags: ["business", "luxury", "culture"], services: ["pool", "spa", "gym", "restaurant", "bar", "rooftop", "meeting-room", "business-center", "concierge", "valet", "wifi", "room-service", "laundry", "coworking"], img: "https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Nice Côte d'Azur", loc: "Nice, France", lat: 43.6653, lng: 7.2150, stars: 4, price: 185, region: "europe", tags: ["beach", "wellness", "romance"], services: ["pool", "spa", "gym", "restaurant", "bar", "terrace", "parking", "wifi", "room-service", "concierge", "bike-rental"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Bordeaux Lac", loc: "Bordeaux, France", lat: 44.8799, lng: -0.5640, stars: 4, price: 155, region: "europe", tags: ["gastro", "culture", "eco"], services: ["restaurant", "bar", "terrace", "meeting-room", "parking", "wifi", "room-service", "bike-rental", "ev-charging", "garden"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Bangkok Hotel G", loc: "Bangkok, Thaïlande", lat: 13.7248, lng: 100.5170, stars: 5, price: 139, region: "asie", tags: ["culture", "gastro", "family"], services: ["pool", "spa", "gym", "restaurant", "bar", "rooftop", "kids-club", "concierge", "wifi", "room-service", "shuttle", "laundry"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Bali Legian Beach", loc: "Bali, Indonésie", lat: -8.7055, lng: 115.1700, stars: 5, price: 159, region: "asie", tags: ["beach", "wellness", "romance", "family"], services: ["pool", "spa", "gym", "restaurant", "bar", "terrace", "kids-club", "garden", "concierge", "wifi", "room-service", "shuttle", "bike-rental", "yoga"], img: "https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
      { name: "Pullman Tokyo Tamachi", loc: "Tokyo, Japon", lat: 35.6453, lng: 139.7479, stars: 5, price: 249, region: "asie", tags: ["business", "culture", "luxury"], services: ["gym", "restaurant", "bar", "meeting-room", "business-center", "concierge", "wifi", "room-service", "laundry", "coworking"], img: "https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=200&hei=140" },
    ],
    lieux: [
      { name: "Montparnasse", type: "Quartier", loc: "Paris", lat: 48.8422, lng: 2.3266 },
      { name: "Tour Eiffel", type: "Monument", loc: "Paris", lat: 48.8584, lng: 2.2945 },
      { name: "Part-Dieu", type: "Quartier", loc: "Lyon", lat: 45.7602, lng: 4.8596 },
      { name: "Vieux Lyon", type: "Quartier", loc: "Lyon", lat: 45.7622, lng: 4.8269 },
      { name: "La Canebière", type: "Quartier", loc: "Marseille", lat: 43.2965, lng: 5.3698 },
      { name: "Las Ramblas", type: "Avenue", loc: "Barcelone", lat: 41.3809, lng: 2.1734 },
      { name: "Marina Bay", type: "Quartier", loc: "Singapour", lat: 1.2814, lng: 103.8586 },
      { name: "Palmeraie", type: "Quartier", loc: "Marrakech", lat: 31.6685, lng: -7.9536 },
      { name: "Promenade des Anglais", type: "Avenue", loc: "Nice", lat: 43.6953, lng: 7.2655 },
      { name: "Burj Khalifa", type: "Monument", loc: "Dubaï", lat: 25.1972, lng: 55.2744 },
    ],
    inspirations: [
      { title: "Week-end gastronomique à Lyon", tag: "Gastronomie", dest: "Lyon", icon: "gastro" },
      { title: "Les bouchons lyonnais incontournables", tag: "Gastronomie", dest: "Lyon", icon: "gastro" },
      { title: "Séminaire d'équipe à Lyon Part-Dieu", tag: "Business", dest: "Lyon", icon: "business" },
      { title: "Escapade romantique à Paris", tag: "Romance", dest: "Paris", icon: "romance" },
      { title: "Paris culturel — musées et galeries", tag: "Culture", dest: "Paris", icon: "culture" },
      { title: "Shopping & spa à Paris", tag: "Bien-être", dest: "Paris", icon: "wellness" },
      { title: "Incentive équipe à Marrakech", tag: "Business", dest: "Marrakech", icon: "seminar" },
      { title: "Détente & spa au cœur de la Palmeraie", tag: "Bien-être", dest: "Marrakech", icon: "wellness" },
      { title: "Découverte culinaire à Barcelone", tag: "Gastronomie", dest: "Barcelone", icon: "gastro" },
      { title: "Plage & rooftop à Barcelone", tag: "Détente", dest: "Barcelone", icon: "beach" },
      { title: "Afterwork sur la Côte d'Azur", tag: "Détente", dest: "Nice", icon: "beach" },
      { title: "Croisière & soirée à Dubaï", tag: "Luxe", dest: "Dubaï", icon: "luxury" },
      { title: "Business trip à Singapour", tag: "Business", dest: "Singapour", icon: "business" },
      { title: "Street food & temples à Bangkok", tag: "Culture", dest: "Bangkok", icon: "culture" },
      { title: "Retraite bien-être à Bali", tag: "Bien-être", dest: "Bali", icon: "wellness" },
      { title: "City break à Londres", tag: "Culture", dest: "Londres", icon: "culture" },
      { title: "Vignobles & gastronomie à Bordeaux", tag: "Gastronomie", dest: "Bordeaux", icon: "gastro" },
      { title: "Calanques & gastronomie à Marseille", tag: "Détente", dest: "Marseille", icon: "beach" },
      { title: "Tokyo entre tradition et modernité", tag: "Culture", dest: "Tokyo", icon: "culture" },
    ],
    intentions: [
      { title: "Hôtels avec spa & bien-être", keywords: ["spa", "bien-être", "wellness", "détente", "massage", "piscine", "relaxation"], icon: "wellness", filter: "wellness" },
      { title: "Séjour gastronomique", keywords: ["gastro", "restaurant", "cuisine", "chef", "gastronomie", "brunch", "dîner"], icon: "gastro", filter: "gastro" },
      { title: "Voyages en famille", keywords: ["famille", "enfant", "kids", "family", "activités", "enfants"], icon: "family", filter: "family" },
      { title: "Voyages d'affaires", keywords: ["business", "travail", "professionnel", "réunion", "bureau", "affaires"], icon: "business", filter: "business" },
      { title: "Hôtels éco-responsables", keywords: ["eco", "vert", "durable", "responsable", "nature", "green", "écologique"], icon: "eco", filter: "eco" },
      { title: "Séminaires & événements", keywords: ["séminaire", "meeting", "conférence", "event", "salle", "teambuilding"], icon: "seminar", filter: "meeting" },
      { title: "Escapade romantique", keywords: ["romance", "couple", "saint-valentin", "lune de miel", "amoureux", "romantique"], icon: "romance", filter: "romance" },
      { title: "Découverte culturelle", keywords: ["culture", "musée", "histoire", "patrimoine", "visite", "art"], icon: "culture", filter: "culture" },
      { title: "Vacances à la plage", keywords: ["plage", "beach", "mer", "soleil", "bord de mer", "côte"], icon: "beach", filter: "beach" },
      { title: "Expérience de luxe", keywords: ["luxe", "luxury", "premium", "prestige", "suite", "5 étoiles"], icon: "luxury", filter: "luxury" },
    ],
  };

  const THEME_DESTINATIONS = {
    wellness: [
      { city: "Marrakech", country: "Maroc", flag: "🇲🇦", tagline: "Hammam, soins d'argan et sérénité", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&h=500&fit=crop" },
      { city: "Bali", country: "Indonésie", flag: "🇮🇩", tagline: "Yoga au lever du soleil, spa au cœur de la jungle", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop" },
      { city: "Nice", country: "France", flag: "🇫🇷", tagline: "Thalasso et douceur méditerranéenne", img: "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=500&fit=crop" },
      { city: "Lyon", country: "France", flag: "🇫🇷", tagline: "Spa urbain au cœur de la Presqu'île", img: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=500&fit=crop" },
    ],
    gastro: [
      { city: "Barcelone", country: "Espagne", flag: "🇪🇸", tagline: "Tapas, marchés et étoiles Michelin", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop" },
      { city: "Lyon", country: "France", flag: "🇫🇷", tagline: "Capitale mondiale de la gastronomie", img: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=500&fit=crop" },
      { city: "Bordeaux", country: "France", flag: "🇫🇷", tagline: "Vignobles, bistrots et terroirs", img: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=500&fit=crop&crop=center" },
      { city: "Bangkok", country: "Thaïlande", flag: "🇹🇭", tagline: "Street food et saveurs épicées", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop" },
    ],
    family: [
      { city: "Bali", country: "Indonésie", flag: "🇮🇩", tagline: "Plage, temples et aventures tropicales", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop" },
      { city: "Dubaï", country: "EAU", flag: "🇦🇪", tagline: "Parcs, plages et émerveillement", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop" },
      { city: "Bangkok", country: "Thaïlande", flag: "🇹🇭", tagline: "Temples, marchés flottants et découvertes", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop" },
      { city: "Marseille", country: "France", flag: "🇫🇷", tagline: "Calanques, mer et grands espaces", img: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=500&fit=crop" },
    ],
    business: [
      { city: "Paris", country: "France", flag: "🇫🇷", tagline: "Au cœur des affaires européennes", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop" },
      { city: "Londres", country: "Royaume-Uni", flag: "🇬🇧", tagline: "La City et ses quartiers d'affaires", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop" },
      { city: "Singapour", country: "Singapour", flag: "🇸🇬", tagline: "Hub stratégique de l'Asie-Pacifique", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=500&fit=crop" },
      { city: "Tokyo", country: "Japon", flag: "🇯🇵", tagline: "Tradition et innovation au sommet", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop" },
    ],
    romance: [
      { city: "Paris", country: "France", flag: "🇫🇷", tagline: "La ville lumière, pour deux", img: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=500&fit=crop" },
      { city: "Barcelone", country: "Espagne", flag: "🇪🇸", tagline: "Couchers de soleil sur la Méditerranée", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop" },
      { city: "Marrakech", country: "Maroc", flag: "🇲🇦", tagline: "Nuits étoilées et riads enchanteurs", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&h=500&fit=crop" },
      { city: "Nice", country: "France", flag: "🇫🇷", tagline: "La Riviera, entre mer et collines", img: "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=500&fit=crop" },
    ],
    culture: [
      { city: "Paris", country: "France", flag: "🇫🇷", tagline: "Musées, galeries et art de vivre", img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=500&fit=crop" },
      { city: "Londres", country: "Royaume-Uni", flag: "🇬🇧", tagline: "Du British Museum aux galeries contemporaines", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop" },
      { city: "Tokyo", country: "Japon", flag: "🇯🇵", tagline: "Entre tradition ancestrale et modernité", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop" },
      { city: "Bangkok", country: "Thaïlande", flag: "🇹🇭", tagline: "Temples dorés et marchés nocturnes", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop" },
    ],
  };

  const PREVIEW_HOTELS = [
    { name:"Pullman Paris Montparnasse", loc:"Paris, France", lat:48.8422, lng:2.3219, stars:4, price:189, features:"Rooftop bar · Spa · Restaurant gastronomique", tags:["business","culture","gastro"], services:["pool","gym","restaurant","bar","meeting-room","parking","wifi","room-service","concierge","laundry","ev-charging"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Paris Tour Eiffel", loc:"Paris, France", lat:48.8559, lng:2.2930, stars:5, price:259, features:"Vue Tour Eiffel · Spa · Restaurant", tags:["romance","luxury","culture"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","room-service","concierge","valet","wifi","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Paris Bercy", loc:"Paris, France", lat:48.8396, lng:2.3826, stars:4, price:175, features:"AccorArena · Piscine · Business center", tags:["business","meeting"], services:["meeting-room","business-center","gym","restaurant","bar","parking","wifi","room-service","laundry","ev-charging","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lyon Part-Dieu", loc:"Lyon, France", lat:45.7602, lng:4.8590, stars:4, price:159, features:"Gare Part-Dieu · Restaurant · Fitness", tags:["business","gastro"], services:["restaurant","bar","meeting-room","business-center","gym","parking","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lyon Centre", loc:"Lyon, France", lat:45.7640, lng:4.8357, stars:4, price:169, features:"Presqu'île · Bar lounge · Spa", tags:["gastro","culture","wellness"], services:["spa","pool","gym","restaurant","bar","terrace","wifi","room-service","concierge","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Marseille Provence", loc:"Marseille, France", lat:43.4370, lng:5.2148, stars:4, price:145, features:"Aéroport · Piscine extérieure · Restaurant", tags:["beach","gastro","family"], services:["pool","spa","restaurant","bar","terrace","kids-club","parking","wifi","room-service","shuttle","bike-rental","gym"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Marrakech Palmeraie", loc:"Marrakech, Maroc", lat:31.6690, lng:-7.9811, stars:5, price:179, features:"Golf · Piscine · Spa · Jardins", tags:["wellness","romance","luxury","meeting"], services:["spa","pool","gym","restaurant","fine_dining","bar","golf","meeting-room","concierge","valet","wifi","room-service","kids-club","terrace","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman London St Pancras", loc:"Londres, Royaume-Uni", lat:51.5305, lng:-0.1240, stars:5, price:289, features:"King's Cross · Restaurant · Bar cocktails", tags:["business","culture","luxury"], services:["gym","restaurant","bar","meeting-room","business-center","concierge","valet","wifi","room-service","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Barcelona Skipper", loc:"Barcelone, Espagne", lat:41.3851, lng:2.1994, stars:5, price:219, features:"Front de mer · Piscine · Rooftop", tags:["beach","gastro","romance"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","terrace","wifi","room-service","concierge","bike-rental","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Dubai Creek", loc:"Dubaï, EAU", lat:25.2532, lng:55.3320, stars:5, price:199, features:"Creek views · Piscine · Spa · Restaurant", tags:["luxury","business","family"], services:["pool","spa","gym","restaurant","bar","rooftop","meeting-room","business-center","kids-club","concierge","valet","wifi","room-service","shuttle","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/6556-1:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Singapore Orchard", loc:"Singapour", lat:1.3048, lng:103.8318, stars:5, price:229, features:"Orchard Road · Piscine · Fitness 24h", tags:["business","luxury","culture"], services:["pool","spa","gym","restaurant","bar","rooftop","meeting-room","business-center","concierge","valet","wifi","room-service","laundry","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Nice Côte d'Azur", loc:"Nice, France", lat:43.6653, lng:7.2150, stars:4, price:185, features:"Promenade des Anglais · Piscine · Spa", tags:["beach","wellness","romance"], services:["pool","spa","gym","restaurant","bar","terrace","parking","wifi","room-service","concierge","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bordeaux Lac", loc:"Bordeaux, France", lat:44.8799, lng:-0.5640, stars:4, price:155, features:"Parc des expositions · Restaurant · Bar", tags:["gastro","culture","eco"], services:["restaurant","bar","terrace","meeting-room","parking","wifi","room-service","bike-rental","ev-charging","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bangkok Hotel G", loc:"Bangkok, Thaïlande", lat:13.7248, lng:100.5170, stars:5, price:139, features:"Silom · Rooftop pool · Sky bar", tags:["culture","gastro","family"], services:["pool","spa","gym","restaurant","bar","rooftop","kids-club","concierge","wifi","room-service","shuttle","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bali Legian Beach", loc:"Bali, Indonésie", lat:-8.7055, lng:115.1700, stars:5, price:159, features:"Plage privée · Piscine · Spa balinais", tags:["beach","wellness","romance","family"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","garden","concierge","wifi","room-service","shuttle","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Tokyo Tamachi", loc:"Tokyo, Japon", lat:35.6453, lng:139.7479, stars:5, price:249, features:"Shinagawa · Restaurant japonais · Fitness", tags:["business","culture","luxury"], services:["gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
  ];

  def("wd-booking", class extends WdEl {
    render() {
      const btn = this.attr("cta", "Rechercher");
      return `<div class="wd-booking">
        <div class="wd-booking__fields">
          <div class="wd-booking__field wd-booking__field--dest">
            <span class="wd-booking__search-icon-pulse">${SEARCH_ICON.search}</span>
            <div class="wd-booking__dest-static"><span class="wd-booking__label">${new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir'}, quelle sera votre prochaine escapade ?</span><span class="wd-booking__value wd-booking__value--typing"></span></div>
            <input type="text" class="wd-booking__dest-input" placeholder="Une destination, un hôtel, une envie..." autocomplete="off" />
            <span class="wd-booking__kbd">${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K</span>
          </div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field">${ICON.cal}<div><span class="wd-booking__label">À quelles dates ? <span style="font-weight:300;opacity:.6">(facultatif)</span></span><span class="wd-booking__value">JJ/MM/AAAA → JJ/MM/AAAA</span></div></div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field">${ICON.person}<div><span class="wd-booking__label">Combien serez-vous ? <span style="font-weight:300;opacity:.6">(facultatif)</span></span><span class="wd-booking__value">1 personne, 1 chambre</span></div></div>
          <a href="#" class="wd-btn wd-btn--primary wd-booking__cta">${esc(btn)}</a>
        </div>
        <a href="#" class="wd-booking__special">Special rates and accessibility ${ICON.chevD}</a>
        <div class="wd-booking__dropdown" data-state="closed">
          <div class="wd-booking__dd-body">
            <div class="wd-booking__dd-empty">
              <div class="wd-booking__dd-assistant">
                <p class="wd-booking__dd-assistant-msg">Pas encore de destination en tête ? Dites-nous ce qui vous inspire</p>
                <div class="wd-booking__dd-chips">
                  <button class="wd-booking__dd-chip" data-chip="spa" type="button"><span class="wd-booking__dd-chip-icon">${SEARCH_ICON.wellness}</span>Détente & spa</button>
                  <button class="wd-booking__dd-chip" data-chip="gastronomie" type="button"><span class="wd-booking__dd-chip-icon">${SEARCH_ICON.gastro}</span>Gastronomie</button>
                  <button class="wd-booking__dd-chip" data-chip="famille" type="button"><span class="wd-booking__dd-chip-icon">${SEARCH_ICON.family}</span>En famille</button>
                  <button class="wd-booking__dd-chip" data-chip="business" type="button"><span class="wd-booking__dd-chip-icon">${SEARCH_ICON.business}</span>Business</button>
                  <button class="wd-booking__dd-chip" data-chip="romantique" type="button"><span class="wd-booking__dd-chip-icon">${SEARCH_ICON.romance}</span>Romantique</button>
                  <button class="wd-booking__dd-chip" data-chip="culture" type="button"><span class="wd-booking__dd-chip-icon">${SEARCH_ICON.culture}</span>Culture</button>
                </div>
              </div>
              <div class="wd-booking__dd-cols">
                <div class="wd-booking__dd-left">
                  <h3 class="wd-booking__dd-section-title">Vos explorations récentes</h3>
                  <ul class="wd-booking__dd-recent-list">
                    ${getRecents().map(r => `<li class="wd-booking__dd-recent-item">
                      <span class="wd-booking__dd-recent-icon">${SEARCH_ICON.clock}</span>
                      <div class="wd-booking__dd-recent-text">
                        <span class="wd-booking__dd-recent-dest">${esc(r.dest)}</span>
                        <span class="wd-booking__dd-recent-meta">${esc(r.meta)}</span>
                      </div>
                      <button class="wd-booking__dd-recent-close" type="button" aria-label="Supprimer">${ICON.close}</button>
                    </li>`).join("")}
                  </ul>
                </div>
                <div class="wd-booking__dd-right">
                  <h3 class="wd-booking__dd-section-title">Nos hôtels récents ou rénovés</h3>
                  <div class="wd-booking__dd-hotels">
                    ${MOCK_HOTELS.map(h => `<a href="#" class="wd-booking__dd-hotel-row">
                      <img class="wd-booking__dd-hotel-thumb" src="${h.img}" alt="${esc(h.name)}" />
                      <div class="wd-booking__dd-hotel-info">
                        ${h.badge ? `<span class="wd-booking__dd-hotel-badge">${esc(h.badge)}</span>` : ""}
                        <span class="wd-booking__dd-hotel-name">${esc(h.name)}</span>
                        <span class="wd-booking__dd-hotel-loc">${esc(h.loc)}</span>
                      </div>
                    </a>`).join("")}
                  </div>
                  <a href="#" class="wd-booking__dd-see-all-hotels">Voir tous les hôtels</a>
                </div>
              </div>
            </div>
            <div class="wd-booking__dd-inspiration" style="display:none">
              <div class="wd-booking__dd-inspi-header">
                <span class="wd-booking__dd-inspi-icon"></span>
                <span class="wd-booking__dd-inspi-title"></span>
              </div>
              <p class="wd-booking__dd-inspi-prompt">Où aimeriez-vous vivre cette expérience ?</p>
              <div class="wd-booking__dd-inspi-grid"></div>
            </div>
            <div class="wd-booking__dd-preview" style="display:none">
              <div class="wd-booking__dd-preview-header">
                <div class="wd-booking__dd-preview-category">
                  <span class="wd-booking__dd-preview-category-icon"></span>
                  <span class="wd-booking__dd-preview-category-label"></span>
                </div>
                <div class="wd-booking__dd-preview-tags"></div>
              </div>
              <div class="wd-booking__dd-preview-layout">
                <div class="wd-booking__dd-preview-list"></div>
                <div class="wd-booking__dd-preview-map-col">
                  <div class="wd-booking__dd-preview-geo"></div>
                  <div class="wd-booking__dd-preview-map" id="wd-preview-map"></div>
                </div>
              </div>
              <div class="wd-booking__dd-preview-footer">
                <span class="wd-booking__dd-preview-count"></span>
                <div class="wd-booking__dd-preview-footer-actions">
                  <button class="wd-booking__dd-preview-back" type="button">Modifier ma recherche</button>
                  <a class="wd-booking__dd-preview-cta" href="#">Voir tous les résultats</a>
                </div>
              </div>
            </div>
            <div class="wd-booking__dd-autocomplete" style="display:none">
              <div class="wd-booking__dd-ac-group wd-booking__dd-ac-group--proximity" data-group="proximity" style="display:none">
                <div class="wd-booking__dd-proximity-banner">
                  <span class="wd-booking__dd-proximity-icon">${ICON.pin}</span>
                  <div class="wd-booking__dd-proximity-text">
                    <span class="wd-booking__dd-proximity-title">Hôtels à proximité</span>
                    <span class="wd-booking__dd-proximity-sub">Basé sur votre position actuelle</span>
                  </div>
                  <span class="wd-booking__dd-proximity-arrow">→</span>
                </div>
              </div>
              <div class="wd-booking__dd-cols">
                <div class="wd-booking__dd-left">
                  <div class="wd-booking__dd-ac-group" data-group="destinations">
                    <h3 class="wd-booking__dd-section-title">${ICON.pin} Destinations</h3>
                    <ul class="wd-booking__dd-ac-list"></ul>
                  </div>
                  <div class="wd-booking__dd-ac-group" data-group="lieux">
                    <h3 class="wd-booking__dd-section-title">${SEARCH_ICON.landmark} Lieux d'intérêt</h3>
                    <ul class="wd-booking__dd-ac-list"></ul>
                  </div>
                </div>
                <div class="wd-booking__dd-right">
                  <div class="wd-booking__dd-ac-group" data-group="hotels">
                    <h3 class="wd-booking__dd-section-title">${SEARCH_ICON.building} Hôtels</h3>
                    <ul class="wd-booking__dd-ac-hotels"></ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="wd-booking__datepicker" data-state="closed">
          <div class="wd-booking__dp-body">
            <div class="wd-booking__dp-header">
              <button class="wd-booking__dp-nav wd-booking__dp-prev" aria-label="Mois précédent">${ICON.chevL || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</button>
              <div class="wd-booking__dp-months-title">
                <span class="wd-booking__dp-month-label"></span>
                <span class="wd-booking__dp-month-label"></span>
              </div>
              <button class="wd-booking__dp-nav wd-booking__dp-next" aria-label="Mois suivant">${ICON.chevR || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</button>
            </div>
            <div class="wd-booking__dp-calendars">
              <div class="wd-booking__dp-month">
                <div class="wd-booking__dp-weekdays"><span>Lu</span><span>Ma</span><span>Me</span><span>Je</span><span>Ve</span><span>Sa</span><span>Di</span></div>
                <div class="wd-booking__dp-grid" data-month="0"></div>
              </div>
              <div class="wd-booking__dp-month">
                <div class="wd-booking__dp-weekdays"><span>Lu</span><span>Ma</span><span>Me</span><span>Je</span><span>Ve</span><span>Sa</span><span>Di</span></div>
                <div class="wd-booking__dp-grid" data-month="1"></div>
              </div>
            </div>
            <div class="wd-booking__dp-footer">
              <div class="wd-booking__dp-flex-options">
                <button class="wd-booking__dp-flex-chip wd-booking__dp-flex-chip--active" data-flex="0">Dates exactes</button>
                <button class="wd-booking__dp-flex-chip" data-flex="1">+/- 1 jour</button>
                <button class="wd-booking__dp-flex-chip" data-flex="2">+/- 2 jours</button>
                <button class="wd-booking__dp-flex-chip" data-flex="3">+/- 3 jours</button>
                <button class="wd-booking__dp-flex-chip" data-flex="7">+/- 7 jours</button>
              </div>
              <div class="wd-booking__dp-actions">
                <button class="wd-booking__dp-clear">Effacer</button>
                <button class="wd-booking__dp-apply">Appliquer</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }

    afterRender() {
      const dropdown = this.querySelector('.wd-booking__dropdown');
      const destField = this.querySelector('.wd-booking__field--dest');
      const destStatic = this.querySelector('.wd-booking__dest-static');
      const destInput = this.querySelector('.wd-booking__dest-input');
      const emptyPanel = this.querySelector('.wd-booking__dd-empty');
      const inspiPanel = this.querySelector('.wd-booking__dd-inspiration');
      const acPanel = this.querySelector('.wd-booking__dd-autocomplete');
      const typingEl = this.querySelector('.wd-booking__value--typing');
      const TYPING_SUGGESTIONS = [
        "Un spa relaxant à Marrakech ?",
        "Week-end gastro à Lyon ?",
        "Escapade romantique à Paris ?",
        "Séminaire d'équipe à Barcelone ?",
        "Découverte culturelle à Tokyo ?",
        "Vacances en famille à Bali ?",
        "City break à Londres ?",
        "Rooftop avec vue à Dubaï ?",
      ];
      let typingIdx = 0, typingCharIdx = 0, typingDir = 1, typingTimer = null;
      const typingTick = () => {
        const word = TYPING_SUGGESTIONS[typingIdx];
        if (typingDir === 1) {
          typingCharIdx++;
          typingEl.textContent = word.substring(0, typingCharIdx);
          if (typingCharIdx >= word.length) {
            typingDir = 0;
            typingTimer = setTimeout(typingTick, 3000);
            return;
          }
          typingTimer = setTimeout(typingTick, 80 + Math.random() * 50);
        } else if (typingDir === 0) {
          typingDir = -1;
          typingTick();
        } else {
          typingCharIdx--;
          typingEl.textContent = word.substring(0, typingCharIdx);
          if (typingCharIdx <= 0) {
            typingDir = 1;
            typingIdx = (typingIdx + 1) % TYPING_SUGGESTIONS.length;
            typingTimer = setTimeout(typingTick, 600);
            return;
          }
          typingTimer = setTimeout(typingTick, 35);
        }
      };
      typingTimer = setTimeout(typingTick, 800);

      const open = () => {
        if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
        dropdown.dataset.state = 'open';
        destField.classList.add('wd-booking__field--editing');
        destStatic.style.display = 'none';
        destInput.style.display = 'block';
        if (selectedDest) { destInput.value = selectedDest; }
        setTimeout(() => { destInput.focus(); destInput.select(); }, 50);
      };
      const close = () => {
        dropdown.dataset.state = 'closed';
        destField.classList.remove('wd-booking__field--editing');
        destInput.style.display = 'none';
        destStatic.style.display = '';
        if (selectedDest) {
          destInput.value = selectedDest;
        } else {
          destInput.value = '';
          destField.classList.remove('wd-booking__field--selected');
          const label = destStatic.querySelector('.wd-booking__label');
          if (label) label.textContent = new Date().getHours() < 18 ? 'Bonjour, quelle sera votre prochaine escapade ?' : 'Bonsoir, quelle sera votre prochaine escapade ?';
          typingIdx = (typingIdx + 1) % TYPING_SUGGESTIONS.length;
          typingCharIdx = 0; typingDir = 1;
          typingTimer = setTimeout(typingTick, 600);
        }
        showEmpty();
      };
      let selectedDest = null;
      const selectDest = (name) => {
        selectedDest = name;
        dropdown.dataset.state = 'closed';
        destField.classList.remove('wd-booking__field--editing');
        destField.classList.add('wd-booking__field--selected');
        destInput.style.display = 'none';
        destInput.value = name;
        destStatic.style.display = '';
        const label = destStatic.querySelector('.wd-booking__label');
        if (label) label.textContent = name;
        typingEl.textContent = '';
        if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
        showEmpty();
        destInput.dispatchEvent(new Event('input', {bubbles: true}));
        setTimeout(() => { const fields = destField.parentElement; const dateField = fields ? fields.querySelectorAll('.wd-booking__field')[1] : null; if (dateField) dateField.click(); }, 300);
      };

      // ===== DATE PICKER LOGIC =====
      const datepicker = this.querySelector('.wd-booking__datepicker');
      const dpGrids = datepicker.querySelectorAll('.wd-booking__dp-grid');
      const dpMonthLabels = datepicker.querySelectorAll('.wd-booking__dp-month-label');
      const allFields = this.querySelectorAll('.wd-booking__field');
      const dateField = allFields[1];
      const dateLabel = dateField ? dateField.querySelector('.wd-booking__label') : null;
      const dateValue = dateField ? dateField.querySelector('.wd-booking__value') : null;

      const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
      const MONTH_SHORT = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
      const today = new Date(); today.setHours(0,0,0,0);
      let dpMonth = today.getMonth();
      let dpYear = today.getFullYear();
      let dpCheckIn = null;
      let dpCheckOut = null;
      let dpHover = null;
      let dpFlex = 0;

      const isSameDay = (a, b) => a && b && a.getTime() === b.getTime();
      const isBetween = (d, start, end) => d > start && d < end;

      const renderCalendars = () => {
        for (let m = 0; m < 2; m++) {
          const month = (dpMonth + m) % 12;
          const year = dpYear + Math.floor((dpMonth + m) / 12);
          dpMonthLabels[m].textContent = MONTH_NAMES[month] + ' ' + year;

          const firstDay = new Date(year, month, 1);
          let startDay = firstDay.getDay(); // 0=Sun
          startDay = startDay === 0 ? 6 : startDay - 1; // convert to Mon=0
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          let html = '';
          for (let i = 0; i < startDay; i++) html += '<span class="wd-booking__dp-day wd-booking__dp-day--empty"></span>';
          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isPast = date < today;
            const isToday = isSameDay(date, today);
            const isCheckIn = isSameDay(date, dpCheckIn);
            const isCheckOut = isSameDay(date, dpCheckOut);
            const inRange = dpCheckIn && dpCheckOut && isBetween(date, dpCheckIn, dpCheckOut);
            const inPreview = dpCheckIn && !dpCheckOut && dpHover && date > dpCheckIn && date <= dpHover;

            let cls = 'wd-booking__dp-day';
            if (isPast) cls += ' wd-booking__dp-day--past';
            if (isToday) cls += ' wd-booking__dp-day--today';
            if (isCheckIn) cls += ' wd-booking__dp-day--checkin';
            if (isCheckOut) cls += ' wd-booking__dp-day--checkout';
            if (inRange || inPreview) cls += ' wd-booking__dp-day--inrange';

            html += `<span class="${cls}" data-date="${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}">${d}</span>`;
          }
          dpGrids[m].innerHTML = html;
        }
      };

      const formatDateField = () => {
        if (!dpCheckIn) {
          dateField.classList.remove('wd-booking__field--selected');
          if (dateLabel) dateLabel.innerHTML = 'À quelles dates ? <span style="font-weight:300;opacity:.6">(facultatif)</span>';
          if (dateValue) dateValue.textContent = 'JJ/MM/AAAA → JJ/MM/AAAA';
          return;
        }
        dateField.classList.add('wd-booking__field--selected');
        const fmtD = (dt) => dt.getDate() + ' ' + MONTH_SHORT[dt.getMonth()];
        if (dpCheckIn && dpCheckOut) {
          const sameYear = dpCheckIn.getFullYear() === dpCheckOut.getFullYear();
          if (dateLabel) dateLabel.textContent = fmtD(dpCheckIn) + ' → ' + fmtD(dpCheckOut) + (sameYear ? ' ' + dpCheckOut.getFullYear() : '');
          if (dateValue) dateValue.textContent = dpFlex > 0 ? '+/- ' + dpFlex + ' jour' + (dpFlex > 1 ? 's' : '') : '';
        } else {
          if (dateLabel) dateLabel.textContent = fmtD(dpCheckIn) + ' → ...';
          if (dateValue) dateValue.textContent = 'Sélectionnez le check-out';
        }
      };

      const openDatePicker = () => {
        if (dropdown.dataset.state === 'open') {
          dropdown.dataset.state = 'closed';
          destField.classList.remove('wd-booking__field--editing');
          destInput.style.display = 'none';
          destStatic.style.display = '';
        }
        datepicker.dataset.state = 'open';
        dateField.classList.add('wd-booking__field--editing');
        renderCalendars();
      };

      const closeDatePicker = () => {
        datepicker.dataset.state = 'closed';
        dateField.classList.remove('wd-booking__field--editing');
        formatDateField();
        destInput.dispatchEvent(new Event('input', {bubbles: true}));
      };

      if (dateField) {
        dateField.style.cursor = 'pointer';
        dateField.addEventListener('click', (e) => {
          e.stopPropagation();
          if (datepicker.dataset.state === 'open') closeDatePicker();
          else openDatePicker();
        });
      }

      datepicker.addEventListener('click', (e) => {
        e.stopPropagation();
        const day = e.target.closest('.wd-booking__dp-day');
        if (day && !day.classList.contains('wd-booking__dp-day--past') && !day.classList.contains('wd-booking__dp-day--empty')) {
          const [y, m, d] = day.dataset.date.split('-').map(Number);
          const clicked = new Date(y, m - 1, d);
          if (!dpCheckIn || (dpCheckIn && dpCheckOut) || clicked < dpCheckIn) {
            dpCheckIn = clicked;
            dpCheckOut = null;
          } else {
            dpCheckOut = clicked;
          }
          dpHover = null;
          renderCalendars();
          formatDateField();
          if (dpCheckIn && dpCheckOut) {
            setTimeout(() => closeDatePicker(), 400);
          }
          return;
        }
        if (e.target.closest('.wd-booking__dp-prev')) {
          const minMonth = today.getMonth();
          const minYear = today.getFullYear();
          if (dpYear > minYear || (dpYear === minYear && dpMonth > minMonth)) {
            dpMonth--;
            if (dpMonth < 0) { dpMonth = 11; dpYear--; }
            renderCalendars();
          }
          return;
        }
        if (e.target.closest('.wd-booking__dp-next')) {
          dpMonth++;
          if (dpMonth > 11) { dpMonth = 0; dpYear++; }
          renderCalendars();
          return;
        }
        const flexChip = e.target.closest('.wd-booking__dp-flex-chip');
        if (flexChip) {
          dpFlex = parseInt(flexChip.dataset.flex);
          datepicker.querySelectorAll('.wd-booking__dp-flex-chip').forEach(c => c.classList.remove('wd-booking__dp-flex-chip--active'));
          flexChip.classList.add('wd-booking__dp-flex-chip--active');
          formatDateField();
          return;
        }
        if (e.target.closest('.wd-booking__dp-clear')) {
          dpCheckIn = null; dpCheckOut = null; dpHover = null; dpFlex = 0;
          datepicker.querySelectorAll('.wd-booking__dp-flex-chip').forEach(c => c.classList.remove('wd-booking__dp-flex-chip--active'));
          datepicker.querySelector('[data-flex="0"]').classList.add('wd-booking__dp-flex-chip--active');
          renderCalendars();
          formatDateField();
          return;
        }
        if (e.target.closest('.wd-booking__dp-apply')) {
          closeDatePicker();
          return;
        }
      });

      datepicker.addEventListener('mouseover', (e) => {
        const day = e.target.closest('.wd-booking__dp-day');
        if (day && dpCheckIn && !dpCheckOut && !day.classList.contains('wd-booking__dp-day--past') && !day.classList.contains('wd-booking__dp-day--empty')) {
          const [y, m, d] = day.dataset.date.split('-').map(Number);
          dpHover = new Date(y, m - 1, d);
          datepicker.querySelectorAll('.wd-booking__dp-day').forEach(el => {
            if (el.classList.contains('wd-booking__dp-day--empty') || el.classList.contains('wd-booking__dp-day--past')) return;
            const [ey, em, ed] = el.dataset.date.split('-').map(Number);
            const elDate = new Date(ey, em - 1, ed);
            const inPreview = elDate > dpCheckIn && elDate <= dpHover;
            el.classList.toggle('wd-booking__dp-day--inrange', inPreview);
          });
        }
      });

      document.addEventListener('click', (e) => {
        if (datepicker.dataset.state === 'open' && !datepicker.contains(e.target) && !dateField.contains(e.target)) {
          closeDatePicker();
        }
      });
      // ===== END DATE PICKER =====

      const previewPanel = dropdown.querySelector('.wd-booking__dd-preview');
      const recentListEl = this.querySelector('.wd-booking__dd-recent-list');
      const renderRecents = () => {
        if (!recentListEl) return;
        const items = getRecents();
        if (!items.length) {
          recentListEl.innerHTML = '<li class="wd-booking__dd-recent-empty">Aucune recherche récente pour le moment.</li>';
          return;
        }
        recentListEl.innerHTML = items.map(r => `<li class="wd-booking__dd-recent-item" data-q="${esc(r.q || r.dest)}">
          <span class="wd-booking__dd-recent-icon">${SEARCH_ICON.clock}</span>
          <div class="wd-booking__dd-recent-text">
            <span class="wd-booking__dd-recent-dest">${esc(r.dest)}</span>
            <span class="wd-booking__dd-recent-meta">${esc(r.meta)}</span>
          </div>
          <button class="wd-booking__dd-recent-close" type="button" aria-label="Supprimer">${ICON.close}</button>
        </li>`).join('');
      };
      const showEmpty = () => { renderRecents(); emptyPanel.style.display = ''; inspiPanel.style.display = 'none'; acPanel.style.display = 'none'; previewPanel.style.display = 'none'; };
      const buildRecentMeta = () => {
        const fmtD = (dt) => dt.getDate() + ' ' + MONTH_SHORT[dt.getMonth()];
        if (dpCheckIn && dpCheckOut) return fmtD(dpCheckIn) + ' → ' + fmtD(dpCheckOut);
        if (dpCheckIn) return 'À partir du ' + fmtD(dpCheckIn);
        return 'Dates flexibles';
      };
      const recordSearch = (dest, q) => { if (dest) addRecent({ dest: dest, meta: buildRecentMeta(), q: q || dest }); };
      const showAC = () => { emptyPanel.style.display = 'none'; inspiPanel.style.display = 'none'; acPanel.style.display = ''; previewPanel.style.display = 'none'; };
      const showInspi = () => { emptyPanel.style.display = 'none'; inspiPanel.style.display = ''; acPanel.style.display = 'none'; previewPanel.style.display = 'none'; };

      const THEME_META = {
        wellness: { label:'Détente & spa', tags:['wellness','spa'], relatedTags:['Spa','Piscine','Yoga','Fitness','Terrasse','Jardin'] },
        gastro:   { label:'Gastronomie', tags:['gastro'], relatedTags:['Restaurant','Restaurant étoilé','Bar','Rooftop','Terrasse'] },
        family:   { label:'En famille', tags:['family'], relatedTags:['Piscine','Kids club','Jardin','Animaux acceptés','Navette','Parking'] },
        business: { label:'Business', tags:['business','meeting'], relatedTags:['Salle de réunion','Business center','Coworking','Parking','Navette'] },
        romance:  { label:'Romantique', tags:['romance'], relatedTags:['Spa','Rooftop','Restaurant étoilé','Terrasse','Animaux acceptés'] },
        culture:  { label:'Culture', tags:['culture'], relatedTags:['Conciergerie','Restaurant','Vélos','Terrasse','Bar'] },
      };

      let previewMapMarkers = [];

      const showPreview = (theme) => {
        emptyPanel.style.display = 'none'; inspiPanel.style.display = 'none'; acPanel.style.display = 'none'; previewPanel.style.display = '';
        const meta = THEME_META[theme] || { label: theme, tags:[theme], relatedTags:[] };
        const filtered = PREVIEW_HOTELS.filter(h => h.tags.some(t => meta.tags.includes(t)));

        const categoryIcon = previewPanel.querySelector('.wd-booking__dd-preview-category-icon');
        const categoryLabel = previewPanel.querySelector('.wd-booking__dd-preview-category-label');
        const tagsEl = previewPanel.querySelector('.wd-booking__dd-preview-tags');
        const intention = MOCK_AUTOCOMPLETE.intentions.find(i => i.filter === theme);
        if (categoryIcon && intention) categoryIcon.innerHTML = SEARCH_ICON[intention.icon] || '';
        if (categoryLabel) categoryLabel.textContent = meta.label;
        const listEl = previewPanel.querySelector('.wd-booking__dd-preview-list');
        const countEl = previewPanel.querySelector('.wd-booking__dd-preview-count');
        const ctaEl = previewPanel.querySelector('.wd-booking__dd-preview-cta');
        let activeTags = [];
        let activeGeo = null;

        const geoEl = previewPanel.querySelector('.wd-booking__dd-preview-geo');
        const getCountry = (loc) => { const parts = loc.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : loc; };
        const geoGroups = {};
        filtered.forEach(h => { const c = getCountry(h.loc); geoGroups[c] = (geoGroups[c] || 0) + 1; });
        if (Object.keys(geoGroups).length > 1) {
          geoEl.innerHTML = Object.entries(geoGroups).map(([c, n]) =>
            `<button class="wd-booking__dd-preview-geo-chip" data-geo="${esc(c)}" type="button">${esc(c)} (${n})</button>`
          ).join('') + '<button class="wd-booking__dd-preview-geo-clear" type="button">Toutes</button>';
          geoEl.style.display = '';
          geoEl.addEventListener('click', (e) => {
            const chip = e.target.closest('.wd-booking__dd-preview-geo-chip');
            const clear = e.target.closest('.wd-booking__dd-preview-geo-clear');
            if (chip) {
              const geo = chip.dataset.geo;
              activeGeo = activeGeo === geo ? null : geo;
            } else if (clear) {
              activeGeo = null;
            } else return;
            geoEl.querySelectorAll('.wd-booking__dd-preview-geo-chip').forEach(c => c.classList.toggle('wd-booking__dd-preview-geo-chip--active', c.dataset.geo === activeGeo));
            geoEl.querySelector('.wd-booking__dd-preview-geo-clear').classList.toggle('wd-booking__dd-preview-geo-clear--active', !activeGeo);
            const result = getSubFiltered();
            renderResults(result);
            renderMap(result);
          });
        } else {
          geoEl.style.display = 'none';
        }

        const TAG_TO_SERVICE = {
          'piscine':'pool','spa':'spa','fitness':'gym','yoga':'yoga','hammam':'spa',
          'restaurant':'restaurant','bar':'bar','rooftop':'rooftop','terrasse':'terrace','brunch':'restaurant',
          'kids club':'kids-club','jardin':'garden','plage':'beach','navette':'shuttle',
          'salle de réunion':'meeting-room','coworking':'coworking','business center':'business-center','wi-fi':'wifi','parking':'parking',
          'conciergerie':'concierge','voiturier':'valet','vélos':'bike-rental','restaurant étoilé':'fine_dining',
          'animaux acceptés':'pet-friendly','pet-friendly':'pet-friendly'
        };
        const getSubFiltered = () => {
          let base = filtered;
          if (activeGeo) base = base.filter(h => getCountry(h.loc) === activeGeo);
          if (!activeTags.length) return base;
          const result = base.filter(h => {
            const svc = (h.services || []).join(' ').toLowerCase();
            const feat = (h.features || '').toLowerCase();
            return activeTags.every(t => {
              const tl = t.toLowerCase();
              const mapped = TAG_TO_SERVICE[tl];
              if (mapped && svc.includes(mapped)) return true;
              return feat.includes(tl) || svc.includes(tl);
            });
          });
          return result;
        };

        const highlightMarker = (idx) => {
          previewMapMarkers.forEach((m, j) => {
            const el = m.getElement();
            if (!el) return;
            const pin = el.querySelector('.wd-preview-pin');
            if (j === idx) { pin.classList.add('wd-preview-pin--active'); m.setZIndexOffset(1000); }
            else { pin.classList.remove('wd-preview-pin--active'); m.setZIndexOffset(0); }
          });
        };

        const renderCardList = (hotels) => hotels.map((h, i) => `<div class="wd-booking__dd-preview-card" data-idx="${i}">
            <img class="wd-booking__dd-preview-card-img" src="${h.img}" alt="${esc(h.name)}" loading="lazy" />
            <div class="wd-booking__dd-preview-card-info">
              <span class="wd-booking__dd-preview-card-name">${esc(h.name)}${h.services && h.services.includes('pet-friendly') ? ' <span class="wd-booking__dd-preview-card-pet" title="Animaux acceptés">🐾</span>' : ''}</span>
              <span class="wd-booking__dd-preview-card-loc">${esc(h.loc)}</span>
              <div class="wd-booking__dd-preview-card-features">${h.features.split(' · ').map(f => `<span class="wd-booking__dd-preview-card-tag">${esc(f)}</span>`).join('')}</div>
              <span class="wd-booking__dd-preview-card-price">à partir de <strong>${h.price} EUR</strong> / nuit</span>
            </div>
          </div>`).join('');

        const renderResults = (hotels) => {
          if (hotels.length) {
            listEl.innerHTML = renderCardList(hotels);
            countEl.textContent = hotels.length + ' hôtel' + (hotels.length > 1 ? 's' : '') + ' correspond' + (hotels.length > 1 ? 'ent' : '') + ' à votre recherche';
            ctaEl.textContent = 'Explorer les ' + hotels.length + ' hôtels';
          } else {
            const suggestions = filtered.slice(0, 3);
            listEl.innerHTML = "<div class=\"wd-booking__dd-preview-empty\">" +
              "<div class=\"wd-booking__dd-preview-empty-icon\"><svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,.4)\" stroke-width=\"1.5\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.35-4.35\"/></svg></div>" +
              "<span class=\"wd-booking__dd-preview-empty-title\">Aucun résultat pour cette combinaison</span>" +
              "<span class=\"wd-booking__dd-preview-empty-sub\">Essayez avec un seul filtre, ou découvrez nos suggestions ci-dessous</span>" +
              "<div class=\"wd-booking__dd-preview-empty-actions\">" +
              "<button type=\"button\" class=\"wd-booking__dd-preview-empty-reset\">Réinitialiser les filtres</button>" +
              "</div></div>" +
              "<div class=\"wd-booking__dd-preview-suggest-label\">Suggestions " + esc(meta.label) + "</div>" +
              renderCardList(suggestions);
            listEl.querySelector(".wd-booking__dd-preview-empty-reset").addEventListener("click", function() {
              activeTags = [];
              tagsEl.querySelectorAll(".wd-booking__dd-preview-tag--active").forEach(function(t) { t.classList.remove("wd-booking__dd-preview-tag--active"); });
              renderResults(filtered);
              renderMap(filtered);
            });
            countEl.textContent = suggestions.length + " suggestion" + (suggestions.length > 1 ? "s" : "") + " " + meta.label;
            ctaEl.textContent = "Explorer tous les hôtels " + meta.label;
          }
          ctaEl.href = searchBase + '?theme=' + encodeURIComponent(theme) + (activeTags.length ? '&tags=' + activeTags.map(encodeURIComponent).join(',') : '');
        };

        const renderMap = (hotels) => {
          const mapEl = previewPanel.querySelector('#wd-preview-map');
          if (!mapEl) return;
          const doRender = () => {
            if (mapEl._leaflet_id) { mapEl._map.remove(); delete mapEl._leaflet_id; }
            const map = L.map(mapEl, { zoomControl: false, attributionControl: false }).setView([46.5, 2.5], 3);
            mapEl._map = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
            previewMapMarkers = [];
            hotels.forEach((h, i) => {
              var shortName = h.name.replace('Pullman ', '');
              var html = '<div class="wd-preview-pin"><span class="wd-preview-pin-dot"></span>' + esc(shortName) + '</div>';
              const icon = L.divIcon({ className:'', html: html, iconSize: null, iconAnchor:[12,12] });
              const m = L.marker([h.lat, h.lng], { icon: icon, interactive: true }).addTo(map);
              previewMapMarkers.push(m);
              m.on('mouseover', () => { highlightMarker(i); const card = listEl.querySelector('[data-idx="'+i+'"]'); if(card) { card.classList.add('wd-booking__dd-preview-card--active'); card.scrollIntoView({ block:'nearest', behavior:'smooth' }); } });
              m.on('mouseout', () => { highlightMarker(-1); const card = listEl.querySelector('[data-idx="'+i+'"]'); if(card) card.classList.remove('wd-booking__dd-preview-card--active'); });
              m.on('click', () => { window.location.href = searchBase + '?q=' + encodeURIComponent(h.name.split(' ').slice(1).join(' ')); });
            });
            if (hotels.length === 1) {
              map.setView([hotels[0].lat, hotels[0].lng], 5, { animate: true });
            } else if (hotels.length) {
              var lats = hotels.map(function(h){ return h.lat; });
              var lngs = hotels.map(function(h){ return h.lng; });
              var medLat = lats.slice().sort(function(a,b){return a-b;})[Math.floor(lats.length/2)];
              var medLng = lngs.slice().sort(function(a,b){return a-b;})[Math.floor(lngs.length/2)];
              var nearby = hotels.filter(function(h){ return Math.abs(h.lat - medLat) < 25 && Math.abs(h.lng - medLng) < 40; });
              var focus = nearby.length >= Math.ceil(hotels.length * 0.6) ? nearby : hotels;
              var focusMarkers = focus.map(function(h){ return previewMapMarkers[hotels.indexOf(h)]; });
              var g = L.featureGroup(focusMarkers);
              map.fitBounds(g.getBounds().pad(0.25), { maxZoom: 8, animate: true, duration: 0.4 });
            }
            setTimeout(() => map.invalidateSize(), 120);
          };
          if (window.L) { setTimeout(doRender, 50); }
          else {
            const css = document.createElement('link'); css.rel='stylesheet'; css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
            const js = document.createElement('script'); js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            js.onload = () => setTimeout(doRender, 50);
            document.head.appendChild(js);
          }
        };

        if (tagsEl) {
          tagsEl.innerHTML = meta.relatedTags.map(function(t) {
            var ic = TAG_TO_ICON[t.toLowerCase()];
            var icHtml = ic && SEARCH_ICON[ic] ? '<span class="wd-booking__dd-preview-tag-icon">' + SEARCH_ICON[ic] + '</span>' : '';
            return '<button type="button" class="wd-booking__dd-preview-tag" data-tag="' + esc(t) + '">' + icHtml + esc(t) + '</button>';
          }).join('') + '<button type="button" class="wd-booking__dd-preview-tag-clear" style="display:none">Effacer</button>';
          const clearBtn = tagsEl.querySelector('.wd-booking__dd-preview-tag-clear');
          const updateTagUI = function() {
            clearBtn.style.display = activeTags.length ? '' : 'none';
            const sub = getSubFiltered();
            renderResults(sub);
            renderMap(sub.length ? sub : filtered.slice(0, 3));
          };
          tagsEl.addEventListener('click', function(e) {
            const btn = e.target.closest('.wd-booking__dd-preview-tag');
            if (e.target.closest('.wd-booking__dd-preview-tag-clear')) {
              activeTags = [];
              tagsEl.querySelectorAll('.wd-booking__dd-preview-tag--active').forEach(function(t) { t.classList.remove('wd-booking__dd-preview-tag--active'); });
              updateTagUI();
              return;
            }
            if (!btn) return;
            const tag = btn.dataset.tag;
            const idx = activeTags.indexOf(tag);
            if (idx >= 0) { activeTags.splice(idx, 1); btn.classList.remove('wd-booking__dd-preview-tag--active'); }
            else { activeTags.push(tag); btn.classList.add('wd-booking__dd-preview-tag--active'); }
            updateTagUI();
          });
        }

        renderResults(filtered);
        renderMap(filtered);

        listEl.onmouseenter = null; listEl.onmouseleave = null;
        listEl.addEventListener('mouseover', (e) => { const card = e.target.closest('.wd-booking__dd-preview-card'); if(card) { highlightMarker(+card.dataset.idx); card.classList.add('wd-booking__dd-preview-card--active'); } });
        listEl.addEventListener('mouseout', (e) => { const card = e.target.closest('.wd-booking__dd-preview-card'); if(card) { highlightMarker(-1); card.classList.remove('wd-booking__dd-preview-card--active'); } });
        listEl.addEventListener('click', (e) => { const card = e.target.closest('.wd-booking__dd-preview-card'); if (card) { const idx = +card.dataset.idx; const sub = getSubFiltered(); const h = sub[idx]; if (h) { window.location.href = searchBase + '?q=' + encodeURIComponent(h.name.split(' ').slice(1).join(' ')); } } });
      };

      const showCountryPreview = (countryName) => {
        emptyPanel.style.display = 'none'; inspiPanel.style.display = 'none'; acPanel.style.display = 'none'; previewPanel.style.display = '';
        const countryNorm = norm(countryName);
        const hotelsInCountry = PREVIEW_HOTELS.filter(h => norm(h.loc).includes(countryNorm));
        const countryData = MOCK_AUTOCOMPLETE.destinations.find(d => d.type === 'Pays' && norm(d.name) === countryNorm);

        const categoryIcon = previewPanel.querySelector('.wd-booking__dd-preview-category-icon');
        const categoryLabel = previewPanel.querySelector('.wd-booking__dd-preview-category-label');
        const tagsEl = previewPanel.querySelector('.wd-booking__dd-preview-tags');
        const listEl = previewPanel.querySelector('.wd-booking__dd-preview-list');
        const countEl = previewPanel.querySelector('.wd-booking__dd-preview-count');
        const ctaEl = previewPanel.querySelector('.wd-booking__dd-preview-cta');

        if (categoryIcon) categoryIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" stroke="currentColor" stroke-width="1.3"/></svg>`;
        if (categoryLabel) categoryLabel.textContent = countryName;

        const cities = [...new Set(hotelsInCountry.map(h => h.loc.split(',')[0].trim()))];
        if (tagsEl) {
          tagsEl.innerHTML = cities.map(c => `<button type="button" class="wd-booking__dd-preview-tag" data-tag="${esc(c)}">${esc(c)}</button>`).join('') + '<button type="button" class="wd-booking__dd-preview-tag-clear" style="display:none">Effacer</button>';
          let activeCityTags = [];
          const clearBtn = tagsEl.querySelector('.wd-booking__dd-preview-tag-clear');
          const getFiltered = () => {
            if (!activeCityTags.length) return hotelsInCountry;
            return hotelsInCountry.filter(h => activeCityTags.some(c => h.loc.includes(c)));
          };
          const updateUI = () => {
            clearBtn.style.display = activeCityTags.length ? '' : 'none';
            const filtered = getFiltered();
            renderCountryResults(filtered);
            renderCountryMap(filtered.length ? filtered : hotelsInCountry, countryData);
          };
          tagsEl.addEventListener('click', (ev) => {
            if (ev.target.closest('.wd-booking__dd-preview-tag-clear')) { activeCityTags = []; tagsEl.querySelectorAll('.wd-booking__dd-preview-tag--active').forEach(t => t.classList.remove('wd-booking__dd-preview-tag--active')); updateUI(); return; }
            const btn = ev.target.closest('.wd-booking__dd-preview-tag');
            if (!btn) return;
            const tag = btn.dataset.tag;
            const idx = activeCityTags.indexOf(tag);
            if (idx >= 0) { activeCityTags.splice(idx, 1); btn.classList.remove('wd-booking__dd-preview-tag--active'); }
            else { activeCityTags.push(tag); btn.classList.add('wd-booking__dd-preview-tag--active'); }
            updateUI();
          });
        }

        const renderCountryResults = (hotels) => {
          listEl.innerHTML = hotels.map((h, i) => `<div class="wd-booking__dd-preview-card" data-idx="${i}">
            <img class="wd-booking__dd-preview-card-img" src="${h.img}" alt="${esc(h.name)}" loading="lazy" />
            <div class="wd-booking__dd-preview-card-info">
              <span class="wd-booking__dd-preview-card-name">${esc(h.name)}${h.services && h.services.includes('pet-friendly') ? ' <span class="wd-booking__dd-preview-card-pet" title="Animaux acceptés">🐾</span>' : ''}</span>
              <span class="wd-booking__dd-preview-card-loc">${esc(h.loc)}</span>
              <div class="wd-booking__dd-preview-card-features">${h.features.split(' · ').map(f => `<span class="wd-booking__dd-preview-card-tag">${esc(f)}</span>`).join('')}</div>
              <span class="wd-booking__dd-preview-card-price">à partir de <strong>${h.price} EUR</strong> / nuit</span>
            </div>
          </div>`).join('');
          countEl.textContent = hotels.length + ' hôtel' + (hotels.length > 1 ? 's' : '') + ' en ' + countryName;
          ctaEl.textContent = 'Explorer les ' + hotels.length + ' hôtels';
          ctaEl.href = searchBase + '?q=' + encodeURIComponent(countryName);
        };

        const renderCountryMap = (hotels, cData) => {
          const mapEl = previewPanel.querySelector('#wd-preview-map');
          if (!mapEl) return;
          const doRender = () => {
            if (mapEl._leaflet_id) { mapEl._map.remove(); delete mapEl._leaflet_id; }
            const centerLat = cData ? cData.lat : 46.5;
            const centerLng = cData ? cData.lng : 2.5;
            const zoom = cData ? cData.zoom : 5;
            const map = L.map(mapEl, { zoomControl: false, attributionControl: false }).setView([centerLat, centerLng], zoom);
            mapEl._map = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
            previewMapMarkers = [];
            hotels.forEach((h, i) => {
              const shortName = h.name.replace('Pullman ', '');
              const html = '<div class="wd-preview-pin"><span class="wd-preview-pin-dot"></span>' + esc(shortName) + '</div>';
              const icon = L.divIcon({ className:'', html: html, iconSize: null, iconAnchor:[12,12] });
              const m = L.marker([h.lat, h.lng], { icon: icon, interactive: true }).addTo(map);
              previewMapMarkers.push(m);
              m.on('mouseover', () => { const el = m.getElement(); if(el) el.querySelector('.wd-preview-pin').classList.add('wd-preview-pin--active'); const card = listEl.querySelector('[data-idx="'+i+'"]'); if(card) { card.classList.add('wd-booking__dd-preview-card--active'); card.scrollIntoView({ block:'nearest', behavior:'smooth' }); } });
              m.on('mouseout', () => { const el = m.getElement(); if(el) el.querySelector('.wd-preview-pin').classList.remove('wd-preview-pin--active'); const card = listEl.querySelector('[data-idx="'+i+'"]'); if(card) card.classList.remove('wd-booking__dd-preview-card--active'); });
              m.on('click', () => { selectDest(h.loc.split(',')[0].trim()); });
            });
            if (hotels.length > 1) {
              const g = L.featureGroup(previewMapMarkers);
              map.fitBounds(g.getBounds().pad(0.2), { maxZoom: zoom + 1, animate: true, duration: 0.4 });
            }
            setTimeout(() => map.invalidateSize(), 120);
          };
          if (window.L) { setTimeout(doRender, 50); }
          else {
            const css = document.createElement('link'); css.rel='stylesheet'; css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
            const js = document.createElement('script'); js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            js.onload = () => setTimeout(doRender, 50);
            document.head.appendChild(js);
          }
        };

        renderCountryResults(hotelsInCountry);
        renderCountryMap(hotelsInCountry, countryData);

        listEl.addEventListener('mouseover', (ev) => { const card = ev.target.closest('.wd-booking__dd-preview-card'); if(card) { const idx = +card.dataset.idx; card.classList.add('wd-booking__dd-preview-card--active'); if(previewMapMarkers[idx]) { const el = previewMapMarkers[idx].getElement(); if(el) el.querySelector('.wd-preview-pin').classList.add('wd-preview-pin--active'); } } });
        listEl.addEventListener('mouseout', (ev) => { const card = ev.target.closest('.wd-booking__dd-preview-card'); if(card) { card.classList.remove('wd-booking__dd-preview-card--active'); previewMapMarkers.forEach(m => { const el = m.getElement(); if(el) el.querySelector('.wd-preview-pin').classList.remove('wd-preview-pin--active'); }); } });
        listEl.addEventListener('click', (ev) => { const card = ev.target.closest('.wd-booking__dd-preview-card'); if(card) { const idx = +card.dataset.idx; const h = hotelsInCountry[idx]; if(h) selectDest(h.loc.split(',')[0].trim()); } });
      };

      const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      };
      const fmtDist = (km) => km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';

      const showDestPreview = (destName, lieuData) => {
        emptyPanel.style.display = 'none'; inspiPanel.style.display = 'none'; acPanel.style.display = 'none'; previewPanel.style.display = '';
        const destNorm = norm(destName);
        const hotels = PREVIEW_HOTELS.filter(h => norm(h.loc).includes(destNorm));
        if (!hotels.length) { selectDest(destName); return; }

        const headerEl = previewPanel.querySelector('.wd-booking__dd-preview-header');
        const listEl = previewPanel.querySelector('.wd-booking__dd-preview-list');
        const footerEl = previewPanel.querySelector('.wd-booking__dd-preview-footer');

        const headerTitle = lieuData ? `${lieuData.name} <span style="opacity:.5;font-weight:400;font-size:14px">· ${lieuData.type}, ${destName}</span>` : destName;
        const headerIcon = lieuData ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--pul-highlight,#5FEF91)" opacity=".2" stroke="var(--pul-highlight,#5FEF91)" stroke-width="1.3"/><circle cx="12" cy="9" r="2.5" fill="var(--pul-highlight,#5FEF91)"/></svg>` : SEARCH_ICON.search;
        headerEl.innerHTML = `<div style="display:flex;align-items:center;gap:10px">${headerIcon}<span style="font-size:18px;font-weight:600;color:#fff">${headerTitle}</span></div>`;

        const renderCards = (list) => {
          listEl.innerHTML = list.map((h, i) => {
            const shortName = h.name.replace('Pullman ', '');
            const dist = lieuData ? fmtDist(haversine(lieuData.lat, lieuData.lng, h.lat, h.lng)) : '';
            return `<div class="wd-booking__dd-preview-card" data-idx="${i}"><img src="${h.img}" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:4px"><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(shortName)}${h.services && h.services.includes('pet-friendly') ? ' <span class="wd-booking__dd-preview-card-pet" title="Animaux acceptés">🐾</span>' : ''}</div><div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">${esc(h.loc)}${dist ? ` · <span style="color:var(--pul-highlight,#5FEF91);font-weight:500">à ${dist}</span>` : ''}</div><div class="wd-booking__dd-preview-card-features">${h.features.split(' · ').slice(0,3).map(f => `<span class="wd-booking__dd-preview-card-tag">${esc(f)}</span>`).join('')}</div></div><div style="text-align:right"><div style="font-size:13px;font-weight:600;color:#fff">${h.price} €</div><div style="font-size:10px;color:rgba(255,255,255,.4)">/ nuit</div></div></div>`;
          }).join('');
        };

        const renderMap = (list) => {
          const mapEl = previewPanel.querySelector('#wd-preview-map');
          if (!mapEl) return;
          const doRender = () => {
            if (mapEl._leaflet_id) { mapEl._map.remove(); delete mapEl._leaflet_id; }
            mapEl.innerHTML = '';
            const centerLat = lieuData ? lieuData.lat : list.reduce((s,h) => s+h.lat, 0) / list.length;
            const centerLng = lieuData ? lieuData.lng : list.reduce((s,h) => s+h.lng, 0) / list.length;
            const zoom = lieuData ? 13 : 12;
            const map = L.map(mapEl, { zoomControl: false, attributionControl: false }).setView([centerLat, centerLng], zoom);
            mapEl._map = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
            previewMapMarkers = [];

            if (lieuData) {
              const lieuIcon = L.divIcon({ className: '', html: `<div class="wd-preview-pin" style="background:var(--pul-highlight,#5FEF91);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(95,239,145,.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="#1a2a1e"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
              L.marker([lieuData.lat, lieuData.lng], { icon: lieuIcon }).addTo(map).bindTooltip(lieuData.name, { permanent: true, direction: 'top', offset: [0, -16], className: 'wd-preview-pin-tooltip' });
            }

            list.forEach((h, i) => {
              const shortName = h.name.replace('Pullman ', '');
              const icon = L.divIcon({ className: '', html: `<div class="wd-preview-pin"><div class="wd-preview-pin-dot"></div></div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
              const m = L.marker([h.lat, h.lng], { icon }).addTo(map);
              m.bindTooltip(shortName, { direction: 'top', offset: [0, -14] });
              m.on('mouseover', () => { const el = m.getElement(); if(el) el.querySelector('.wd-preview-pin').classList.add('wd-preview-pin--active'); const card = listEl.querySelector(`[data-idx="${i}"]`); if(card) { card.classList.add('wd-booking__dd-preview-card--active'); card.scrollIntoView({block:'nearest'}); } });
              m.on('mouseout', () => { const el = m.getElement(); if(el) el.querySelector('.wd-preview-pin').classList.remove('wd-preview-pin--active'); listEl.querySelectorAll('.wd-booking__dd-preview-card--active').forEach(c => c.classList.remove('wd-booking__dd-preview-card--active')); });
              m.on('click', () => selectDest(h.loc.split(',')[0].trim()));
              previewMapMarkers.push(m);
            });

            if (list.length > 1 && !lieuData) {
              const bounds = L.latLngBounds(list.map(h => [h.lat, h.lng]));
              map.fitBounds(bounds, { padding: [30, 30] });
            }
            setTimeout(() => map.invalidateSize(), 120);
          };
          if (window.L) { setTimeout(doRender, 60); }
          else {
            const css = document.createElement('link'); css.rel='stylesheet'; css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
            const js = document.createElement('script'); js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            js.onload = () => setTimeout(doRender, 60);
            document.head.appendChild(js);
          }
        };

        renderCards(hotels);
        renderMap(hotels);

        footerEl.innerHTML = `<span style="color:var(--pul-highlight,#5FEF91);font-size:13px;font-style:italic">${hotels.length} hôtel${hotels.length > 1 ? 's' : ''} ${lieuData ? 'près de ' + lieuData.name : 'à ' + destName}</span><button class="wd-booking__dd-preview-cta" style="padding:10px 24px;border:none;border-radius:6px;background:#5FEF91;color:#1a2a1e;font-weight:600;font-size:13px;cursor:pointer">Explorer les ${hotels.length} hôtel${hotels.length > 1 ? 's' : ''}</button>`;
        footerEl.querySelector('.wd-booking__dd-preview-cta')?.addEventListener('click', () => selectDest(destName));

        listEl.addEventListener('mouseover', (ev) => { const card = ev.target.closest('.wd-booking__dd-preview-card'); if(card) { card.classList.add('wd-booking__dd-preview-card--active'); const idx = +card.dataset.idx; if(previewMapMarkers[idx]) { const el = previewMapMarkers[idx].getElement(); if(el) el.querySelector('.wd-preview-pin').classList.add('wd-preview-pin--active'); } } });
        listEl.addEventListener('mouseout', (ev) => { const card = ev.target.closest('.wd-booking__dd-preview-card'); if(card) { card.classList.remove('wd-booking__dd-preview-card--active'); previewMapMarkers.forEach(m => { const el = m.getElement(); if(el) el.querySelector('.wd-preview-pin').classList.remove('wd-preview-pin--active'); }); } });
        listEl.addEventListener('click', (ev) => { const card = ev.target.closest('.wd-booking__dd-preview-card'); if(card) { const idx = +card.dataset.idx; const h = hotels[idx]; if(h) selectDest(h.loc.split(',')[0].trim()); } });
      };

      const renderInspirationCards = (theme) => {
        const dests = THEME_DESTINATIONS[theme] || [];
        const intention = MOCK_AUTOCOMPLETE.intentions.find(i => i.filter === theme);
        const iconEl = inspiPanel.querySelector('.wd-booking__dd-inspi-icon');
        const titleEl = inspiPanel.querySelector('.wd-booking__dd-inspi-title');
        const grid = inspiPanel.querySelector('.wd-booking__dd-inspi-grid');
        if (iconEl && intention) iconEl.innerHTML = SEARCH_ICON[intention.icon] || '';
        if (titleEl && intention) titleEl.textContent = intention.title;
        if (grid) {
          grid.innerHTML = dests.map((d, i) => `<button class="wd-booking__dd-inspi-card" data-city="${esc(d.city)}" data-theme="${esc(theme)}" type="button" style="background-image:url('${d.img}');animation-delay:${i * 60}ms">
            <div class="wd-booking__dd-inspi-card-overlay">
              <span class="wd-booking__dd-inspi-card-flag">${d.flag}</span>
              <span class="wd-booking__dd-inspi-card-city">${esc(d.city)}</span>
              <span class="wd-booking__dd-inspi-card-tagline">${esc(d.tagline)}</span>
            </div>
          </button>`).join('');
        }
      };

      destField.addEventListener('click', () => { if (dropdown.dataset.state !== 'open') open(); });
      document.addEventListener('mousedown', e => {
        if (dropdown.dataset.state === 'open' && !e.target.closest('.wd-booking')) close();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && dropdown.dataset.state === 'open') close();
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (dropdown.dataset.state !== 'open') open(); else destInput.focus(); }
      });

      if (recentListEl) {
        recentListEl.addEventListener('click', e => {
          const closeBtn = e.target.closest('.wd-booking__dd-recent-close');
          if (!closeBtn) return;
          e.stopPropagation();
          const item = closeBtn.closest('.wd-booking__dd-recent-item');
          const dest = item?.querySelector('.wd-booking__dd-recent-dest')?.textContent;
          if (dest) removeRecent(dest);
          renderRecents();
        });
      }

      const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const highlight = (text, q) => {
        if (!q) return esc(text);
        const nq = norm(q), nt = norm(text);
        const idx = nt.indexOf(nq);
        if (idx === -1) return esc(text);
        return esc(text.substring(0, idx)) + '<mark class="wd-booking__dd-highlight">' + esc(text.substring(idx, idx + q.length)) + '</mark>' + esc(text.substring(idx + q.length));
      };

      let activeTheme = null;

      const THEME_MAP = {
        spa: "wellness", gastronomie: "gastro", famille: "family",
        business: "business", romantique: "romance", culture: "culture",
      };

      const SERVICE_SYNONYMS = {
        "pool": ["piscine", "piscines", "bassin", "baignade", "nager", "swimming", "pool"],
        "spa": ["spa", "hammam", "sauna", "jacuzzi", "bain", "bains", "soin", "soins", "massage", "massages", "bien-être", "bien etre", "wellness"],
        "gym": ["gym", "salle de sport", "sport", "fitness", "musculation", "salle de fitness"],
        "restaurant": ["restaurant", "restaurants", "dîner", "diner", "déjeuner", "dejeuner", "petit-déjeuner", "petit dejeuner", "buffet", "table", "gastronomique"],
        "bar": ["bar", "cocktail", "cocktails", "lounge", "happy hour"],
        "rooftop": ["rooftop", "toit-terrasse", "toit terrasse", "vue panoramique", "vue", "skybar"],
        "terrace": ["terrasse", "terrasses", "extérieur", "exterieur", "plein air", "en terrasse"],
        "meeting-room": ["salle de réunion", "salle de reunion", "salle de conférence", "salle de conference", "meeting", "séminaire", "seminaire", "réunion", "reunion", "conférence", "conference", "boardroom"],
        "business-center": ["business center", "centre d'affaires", "centre affaires", "espace business"],
        "coworking": ["coworking", "co-working", "espace de travail", "espace travail", "travailler", "wifi pro", "workstation"],
        "parking": ["parking", "garage", "stationnement", "voiture", "se garer"],
        "kids-club": ["club enfants", "club enfant", "kids club", "kids", "enfants", "aire de jeux", "jeux enfants", "garderie", "baby-sitting", "babysitting"],
        "concierge": ["conciergerie", "concierge", "assistance", "réception 24h"],
        "valet": ["voiturier", "valet", "valet parking"],
        "wifi": ["wifi", "wi-fi", "internet", "connexion"],
        "room-service": ["room service", "service en chambre", "service chambre", "plateau repas"],
        "shuttle": ["navette", "shuttle", "transfert", "transfert aéroport", "transfert aeroport", "navette aéroport"],
        "laundry": ["blanchisserie", "pressing", "laverie", "linge", "repassage", "nettoyage"],
        "pet-friendly": ["animaux", "animal", "chien", "chiens", "chat", "pet", "pet-friendly", "animaux acceptés", "animaux admis"],
        "ev-charging": ["borne de recharge", "recharge électrique", "recharge electrique", "voiture électrique", "voiture electrique", "borne", "ev", "tesla"],
        "bike-rental": ["vélo", "velo", "vélos", "velos", "location vélo", "location velo", "bicyclette", "cycling"],
        "golf": ["golf", "parcours de golf", "green"],
        "yoga": ["yoga", "méditation", "meditation", "pilates", "stretching"],
        "garden": ["jardin", "jardins", "parc", "espace vert", "verdure"]
      };
      const SERVICE_LABELS = {
        "pool": "Piscine", "spa": "Spa & bien-être", "gym": "Salle de sport", "restaurant": "Restaurant",
        "bar": "Bar & lounge", "rooftop": "Rooftop", "terrace": "Terrasse", "meeting-room": "Salle de réunion",
        "business-center": "Business center", "coworking": "Espace coworking", "parking": "Parking",
        "kids-club": "Club enfants", "concierge": "Conciergerie", "valet": "Voiturier",
        "wifi": "WiFi", "room-service": "Room service", "shuttle": "Navette",
        "laundry": "Blanchisserie", "pet-friendly": "Animaux acceptés", "ev-charging": "Borne de recharge",
        "bike-rental": "Location vélos", "golf": "Golf", "yoga": "Yoga & méditation", "garden": "Jardin"
      };

      const filterAC = (q, theme) => {
        let ql = norm(q);
        const proximityPatterns = [/proche\s+d[eu']\s*(?:la\s+|l['']|du\s+|des\s+)?(.+)/i, /pr[eè]s\s+d[eu']\s*(?:la\s+|l['']|du\s+|des\s+)?(.+)/i, /[àa]\s+c[oô]t[eé]\s+d[eu']\s*(?:la\s+|l['']|du\s+|des\s+)?(.+)/i, /autour\s+d[eu']\s*(?:la\s+|l['']|du\s+|des\s+)?(.+)/i, /near\s+(?:the\s+)?(.+)/i];
        let proximitySubject = null;
        for (const pat of proximityPatterns) {
          const m = q.match(pat);
          if (m && m[1] && m[1].trim().length > 1) { proximitySubject = m[1].trim(); break; }
        }

        const servicePatterns = [/avec\s+(?:un[e]?\s+|la\s+|le\s+|l['']|des\s+|du\s+)?(.+)/i, /proposant\s+(?:un[e]?\s+|la\s+|le\s+|l['']|des\s+|du\s+)?(.+)/i, /(?:qui\s+)?(?:dispose|offre|propose)[nt]?\s+(?:d['']un[e]?\s+|d['']|de\s+la\s+|du\s+|des\s+)?(.+)/i, /(?:with|having)\s+(?:a\s+)?(.+)/i, /(?:où|ou)\s+(?:il y a|on peut|je peux)\s+(.+)/i];
        let serviceSubject = null;
        for (const pat of servicePatterns) {
          const m = q.match(pat);
          if (m && m[1] && m[1].trim().length > 1) { serviceSubject = m[1].trim(); break; }
        }

        let matchedServiceKeys = [];
        let locationFromQuery = null;
        if (serviceSubject) {
          const locPatterns = [/\s+[àa]\s+(.+)$/i, /\s+sur\s+(.+)$/i, /\s+en\s+(.+)$/i, /\s+dans\s+(.+)$/i, /\s+at\s+(.+)$/i, /\s+in\s+(.+)$/i];
          let serviceOnly = serviceSubject;
          for (const lp of locPatterns) {
            const lm = serviceSubject.match(lp);
            if (lm && lm[1] && lm[1].trim().length > 1) {
              locationFromQuery = lm[1].trim();
              serviceOnly = serviceSubject.substring(0, lm.index).trim();
              break;
            }
          }
          if (!locationFromQuery) {
            const beforeService = q.substring(0, q.toLowerCase().indexOf(serviceSubject.toLowerCase())).trim();
            for (const lp of locPatterns) {
              const lm = beforeService.match(lp);
              if (lm && lm[1] && lm[1].trim().length > 1) { locationFromQuery = lm[1].trim(); break; }
            }
          }
          const serviceParts = serviceOnly.split(/\s+et\s+|\s+and\s+|\s*,\s*/i).map(s => s.trim()).filter(Boolean);
          for (const part of serviceParts) {
            const ns = norm(part);
            for (const [key, syns] of Object.entries(SERVICE_SYNONYMS)) {
              if (!matchedServiceKeys.includes(key) && syns.some(s => ns.includes(norm(s)) || norm(s).includes(ns))) { matchedServiceKeys.push(key); break; }
            }
          }
        }
        if (!matchedServiceKeys.length && !serviceSubject) {
          const nql = norm(q);
          for (const [key, syns] of Object.entries(SERVICE_SYNONYMS)) {
            if (syns.some(s => nql.includes(norm(s)))) { matchedServiceKeys.push(key); }
          }
          if (matchedServiceKeys.length) {
            const locPatterns2 = [/\s+[àa]\s+(.+?)(?:\s+avec|\s+proposant|$)/i, /\s+sur\s+(.+?)(?:\s+avec|\s+proposant|$)/i, /\s+en\s+(.+?)(?:\s+avec|\s+proposant|$)/i, /\s+dans\s+(.+?)(?:\s+avec|\s+proposant|$)/i];
            for (const lp of locPatterns2) {
              const lm = q.match(lp);
              if (lm && lm[1] && lm[1].trim().length > 1) { locationFromQuery = lm[1].trim(); break; }
            }
          }
        }

        let effectiveQ = q;
        if (proximitySubject) { effectiveQ = proximitySubject; ql = norm(effectiveQ); }
        else if (matchedServiceKeys.length && locationFromQuery) { effectiveQ = locationFromQuery; ql = norm(effectiveQ); }
        else if (matchedServiceKeys.length) { effectiveQ = ''; ql = ''; }
        const textMatch = (s) => ql ? norm(s).includes(ql) : false;

        const themeFilter = theme || null;
        const intentionForTheme = themeFilter ? MOCK_AUTOCOMPLETE.intentions.find(i => i.filter === themeFilter) : null;
        const themeKeywords = intentionForTheme ? intentionForTheme.keywords : [];

        let destItems, hotelItems, lieuItems, inspiItems, intentionItems;

        if (themeFilter && !q) {
          destItems = [];
          hotelItems = MOCK_AUTOCOMPLETE.hotels.filter(h => h.tags && h.tags.includes(themeFilter));
          lieuItems = [];
          inspiItems = MOCK_AUTOCOMPLETE.inspirations.filter(i => {
            const iIcon = i.icon || '';
            return iIcon === (intentionForTheme?.icon || '') || themeKeywords.some(k => norm(i.tag).includes(norm(k)) || norm(i.title).includes(norm(k)));
          });
          intentionItems = intentionForTheme ? [intentionForTheme] : [];
        } else if (themeFilter && q) {
          destItems = MOCK_AUTOCOMPLETE.destinations.filter(d => textMatch(d.name) || (d.country && textMatch(d.country)));
          destItems.sort((a, b) => (a.type === 'Pays' ? 0 : 1) - (b.type === 'Pays' ? 0 : 1));
          hotelItems = MOCK_AUTOCOMPLETE.hotels.filter(h => (h.tags && h.tags.includes(themeFilter)) && (textMatch(h.name) || textMatch(h.loc)));
          if (!hotelItems.length) hotelItems = MOCK_AUTOCOMPLETE.hotels.filter(h => h.tags && h.tags.includes(themeFilter));
          lieuItems = MOCK_AUTOCOMPLETE.lieux.filter(l => textMatch(l.name) || textMatch(l.loc));
          inspiItems = MOCK_AUTOCOMPLETE.inspirations.filter(i => {
            const iIcon = i.icon || '';
            const matchesTheme = iIcon === (intentionForTheme?.icon || '') || themeKeywords.some(k => norm(i.tag).includes(norm(k)));
            return matchesTheme && (textMatch(i.dest) || textMatch(i.title));
          });
          intentionItems = MOCK_AUTOCOMPLETE.intentions.filter(i => i.filter === themeFilter || i.keywords.some(k => textMatch(k) || k.includes(ql)));
        } else {
          const genericHotelTerms = ["hotel", "hôtel", "hotels", "hôtels", "pullman", "séjour", "sejour", "chambre", "nuit", "réserver", "reserver"];
          const isGenericHotel = !matchedServiceKeys.length && genericHotelTerms.some(t => norm(t).includes(ql) || ql.includes(norm(t)));
          const tagSynonyms = { beach: ["ocean", "océan", "mer", "plage", "bord de mer", "littoral", "côte", "cote", "maritime"], wellness: ["spa", "bien-être", "bien etre", "detente", "détente", "massage", "piscine"], gastro: ["restaurant", "gastronomie", "cuisine", "chef", "brunch"], romance: ["romantique", "couple", "amoureux", "lune de miel"], business: ["affaire", "travail", "bureau", "réunion", "reunion"], culture: ["musée", "musee", "histoire", "patrimoine", "monument"], family: ["famille", "enfant", "enfants", "kids"] };
          let tagMatch = null;
          if (!matchedServiceKeys.length) {
            for (const [tag, syns] of Object.entries(tagSynonyms)) { if (syns.some(s => ql.includes(norm(s)) || norm(s).includes(ql))) { tagMatch = tag; break; } }
          }
          destItems = matchedServiceKeys.length && !locationFromQuery ? [] : MOCK_AUTOCOMPLETE.destinations.filter(d => textMatch(d.name) || (d.country && textMatch(d.country)));
          destItems.sort((a, b) => (a.type === 'Pays' ? 0 : 1) - (b.type === 'Pays' ? 0 : 1));
          if (matchedServiceKeys.length) {
            const locNorm = locationFromQuery ? norm(locationFromQuery) : null;
            const withService = MOCK_AUTOCOMPLETE.hotels.filter(h => h.services && matchedServiceKeys.every(k => h.services.includes(k)));
            if (locNorm) {
              const inLoc = withService.filter(h => norm(h.loc).includes(locNorm) || norm(h.name).includes(locNorm));
              const others = withService.filter(h => !norm(h.loc).includes(locNorm) && !norm(h.name).includes(locNorm));
              hotelItems = inLoc.concat(others);
            } else {
              hotelItems = withService;
            }
            if (locNorm && !destItems.length) {
              destItems = MOCK_AUTOCOMPLETE.destinations.filter(d => norm(d.name).includes(locNorm) || norm(d.country).includes(locNorm));
            }
          } else {
            hotelItems = isGenericHotel ? MOCK_AUTOCOMPLETE.hotels : tagMatch ? MOCK_AUTOCOMPLETE.hotels.filter(h => h.tags && h.tags.includes(tagMatch)) : MOCK_AUTOCOMPLETE.hotels.filter(h => textMatch(h.name) || textMatch(h.loc) || (h.tags && h.tags.some(t => t.includes(ql))));
          }
          lieuItems = matchedServiceKeys.length && !locationFromQuery ? [] : MOCK_AUTOCOMPLETE.lieux.filter(l => textMatch(l.name) || textMatch(l.loc));
          inspiItems = matchedServiceKeys.length ? [] : MOCK_AUTOCOMPLETE.inspirations.filter(i => textMatch(i.dest) || textMatch(i.title) || textMatch(i.tag));
          intentionItems = matchedServiceKeys.length ? [] : MOCK_AUTOCOMPLETE.intentions.filter(i => i.keywords.some(k => textMatch(k) || k.includes(ql)));
        }

        const totalResults = destItems.length + hotelItems.length + lieuItems.length + inspiItems.length + intentionItems.length;
        const noResultsEl = acPanel.querySelector('.wd-booking__dd-no-results');

        if (totalResults === 0) {
          if (noResultsEl) noResultsEl.style.display = '';
          else {
            const div = document.createElement('div');
            div.className = 'wd-booking__dd-no-results';
            div.innerHTML = `<p class="wd-booking__dd-no-results-msg">${SEARCH_ICON.search} Aucun résultat pour « <strong>${esc(q || '')}</strong> »</p><p class="wd-booking__dd-no-results-hint">Essayez un autre mot-clé ou explorez nos inspirations</p>`;
            acPanel.prepend(div);
          }
        } else {
          if (noResultsEl) noResultsEl.style.display = 'none';
        }

        const origQl = norm(q);
        const proximityTerms = ["proche", "proches", "proximite", "proximité", "pres de", "près de", "a cote", "à côté", "autour de", "nearby", "around", "near", "ici", "coin"];
        const isProximity = proximitySubject || proximityTerms.some(t => origQl.includes(norm(t)));
        const proximityGroup = acPanel.querySelector('[data-group="proximity"]');
        if (isProximity) {
          proximityGroup.style.display = '';
          const proxTitle = proximityGroup.querySelector('.wd-booking__dd-proximity-title');
          const proxSub = proximityGroup.querySelector('.wd-booking__dd-proximity-sub');
          if (proximitySubject) {
            proxTitle.textContent = 'Hôtels à proximité de ' + proximitySubject.charAt(0).toUpperCase() + proximitySubject.slice(1);
            proxSub.textContent = 'Voir les établissements les plus proches';
          } else {
            proxTitle.textContent = 'Hôtels à proximité';
            proxSub.textContent = 'Basé sur votre position actuelle';
          }
        } else {
          proximityGroup.style.display = 'none';
        }

        const destGroup = acPanel.querySelector('[data-group="destinations"]');
        const destList = destGroup.querySelector('.wd-booking__dd-ac-list');
        if (!destItems.length) { destGroup.style.display = 'none'; }
        else {
          destGroup.style.display = '';
          destList.innerHTML = destItems.map(d => {
            const dNorm = norm(d.name);
            const isCountry = d.type === 'Pays';
            let hotelsInDest;
            if (isCountry) {
              hotelsInDest = MOCK_AUTOCOMPLETE.hotels.filter(h => norm(h.loc).includes(dNorm));
            } else {
              hotelsInDest = MOCK_AUTOCOMPLETE.hotels.filter(h => norm(h.loc).includes(dNorm));
            }
            if (matchedServiceKeys.length) hotelsInDest = hotelsInDest.filter(h => h.services && matchedServiceKeys.every(k => h.services.includes(k)));
            const hotelCount = hotelsInDest.length || d.count;
            const hotelNames = hotelsInDest.length ? hotelsInDest.map(h => h.name.replace('Pullman ', '')).join(', ') : '';
            const icon = isCountry ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" stroke="currentColor" stroke-width="1.3"/></svg>` : SEARCH_ICON.search;
            const label = isCountry ? highlight(d.name, effectiveQ) : highlight(d.name + (d.country ? ', ' + d.country : ''), effectiveQ);
            const typeTag = isCountry ? `<span class="wd-booking__dd-ac-type-tag">Pays</span>` : (d.type === 'Région' || d.type === 'Île' ? `<span class="wd-booking__dd-ac-type-tag">${esc(d.type)}</span>` : '');
            return `<li class="wd-booking__dd-ac-item${isCountry ? ' wd-booking__dd-ac-item--country' : ''}" data-dest-type="${esc(d.type)}" data-dest-name="${esc(d.name)}">${icon}<span class="wd-booking__dd-ac-name">${label}${typeTag}${hotelNames ? `<span class="wd-booking__dd-ac-dest-hotels">${esc(hotelNames)}</span>` : ''}</span><span class="wd-booking__dd-ac-count">${hotelCount} hôtel${hotelCount > 1 ? 's' : ''}</span></li>`;
          }).join('');
        }

        const lieuGroup = acPanel.querySelector('[data-group="lieux"]');
        const lieuList = lieuGroup.querySelector('.wd-booking__dd-ac-list');
        if (!lieuItems.length) { lieuGroup.style.display = 'none'; }
        else {
          lieuGroup.style.display = '';
          lieuList.innerHTML = lieuItems.map(l => `<li class="wd-booking__dd-ac-item" data-loc="${esc(l.loc)}">${SEARCH_ICON.search}<span class="wd-booking__dd-ac-name">${highlight(l.name, effectiveQ)}</span><span class="wd-booking__dd-ac-tag">${esc(l.type)} · ${esc(l.loc)}</span></li>`).join('');
        }

        const hotelGroup = acPanel.querySelector('[data-group="hotels"]');
        const hotelList = hotelGroup.querySelector('.wd-booking__dd-ac-hotels');
        if (!hotelItems.length) { hotelGroup.style.display = 'none'; }
        else {
          hotelGroup.style.display = '';
          const locNormForBadge = locationFromQuery ? norm(locationFromQuery) : null;
          hotelList.innerHTML = hotelItems.slice(0, 5).map(h => {
            const isLocMatch = locNormForBadge && (norm(h.loc).includes(locNormForBadge) || norm(h.name).includes(locNormForBadge));
            return `<a href="#" class="wd-booking__dd-hotel-row">
            <img class="wd-booking__dd-hotel-thumb" src="${h.img}" alt="${esc(h.name)}" />
            <div class="wd-booking__dd-hotel-info">
              <span class="wd-booking__dd-hotel-name">${highlight(h.name, effectiveQ)}${isLocMatch ? `<span class="wd-booking__dd-hotel-loc-badge">${esc(locationFromQuery)}</span>` : ''}</span>
              <span class="wd-booking__dd-hotel-loc">${esc(h.loc)}</span>
              ${matchedServiceKeys.length && h.services && matchedServiceKeys.every(k => h.services.includes(k)) ? `<span class="wd-booking__dd-hotel-tags wd-booking__dd-hotel-tags--service">${matchedServiceKeys.map(k => `<span class="wd-booking__dd-service-badge"><span class="wd-booking__dd-service-dot"></span>${esc(SERVICE_LABELS[k] || k)}</span>`).join('')}${h.services.filter(s => !matchedServiceKeys.includes(s)).slice(0, 3).map(s => `<span class="wd-booking__dd-service-pill">${esc(SERVICE_LABELS[s] || s)}</span>`).join('')}</span>` : h.tags ? `<span class="wd-booking__dd-hotel-tags">${h.tags.slice(0, 2).map(t => { const intention = MOCK_AUTOCOMPLETE.intentions.find(i => i.filter === t); return intention ? esc(intention.title.split(' ').slice(0, 2).join(' ')) : ''; }).filter(Boolean).join(' · ')}</span>` : ''}
            </div>
          </a>`;
          }).join('');
        }

        const acCols = acPanel.querySelector('.wd-booking__dd-cols');
        if (acCols) {
          const leftEmpty = destGroup.style.display === 'none' && lieuGroup.style.display === 'none';
          const rightEmpty = hotelGroup.style.display === 'none';
          if (leftEmpty && !rightEmpty) { acCols.style.gridTemplateColumns = '1fr'; hotelGroup.style.maxWidth = '100%'; }
          else if (rightEmpty && !leftEmpty) { acCols.style.gridTemplateColumns = '1fr'; }
          else { acCols.style.gridTemplateColumns = ''; hotelGroup.style.maxWidth = ''; }
        }
      };

      destInput.addEventListener('input', () => {
        const q = destInput.value.trim();
        if (q.length >= 1) { showAC(); filterAC(q, activeTheme); }
        else if (activeTheme) { showAC(); filterAC('', activeTheme); }
        else { showEmpty(); }
      });

      const backBtn = previewPanel.querySelector('.wd-booking__dd-preview-back');
      if (backBtn) backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeTheme) {
          activeTheme = null;
          this.querySelectorAll('.wd-booking__dd-chip--active').forEach(c => c.classList.remove('wd-booking__dd-chip--active'));
        }
        destInput.value = '';
        showEmpty();
        destInput.focus();
      });

      const searchBase = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + 'search-results.html';
      const goToSearch = (q) => { if (q && q !== 'nearby') recordSearch(q, q); const url = searchBase + (q ? '?q=' + encodeURIComponent(q) : ''); try { const a = document.createElement('a'); a.href = url; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove(); } catch(_) { window.location.href = url; } };
      const goToTheme = (theme) => { const label = (THEME_META[theme] && THEME_META[theme].label) || theme; recordSearch(label, theme); const url = searchBase + '?theme=' + encodeURIComponent(theme); try { const a = document.createElement('a'); a.href = url; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove(); } catch(_) { window.location.href = url; } };

      const chips = this.querySelectorAll('.wd-booking__dd-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const keyword = chip.dataset.chip;
          const theme = THEME_MAP[keyword] || keyword;
          if (activeTheme === theme) {
            activeTheme = null;
            chips.forEach(c => c.classList.remove('wd-booking__dd-chip--active'));
            destInput.value = '';
            showEmpty();
          } else {
            activeTheme = theme;
            chips.forEach(c => c.classList.remove('wd-booking__dd-chip--active'));
            chip.classList.add('wd-booking__dd-chip--active');
            destInput.value = '';
            showPreview(theme);
          }
        });
      });

      const ctaBtn = this.querySelector('.wd-booking__cta');
      if (ctaBtn) {
        const updateCTAHref = () => {
          let href;
          if (activeTheme) { href = searchBase + '?theme=' + encodeURIComponent(activeTheme); }
          else { const q = selectedDest || destInput.value.trim(); href = searchBase + (q ? '?q=' + encodeURIComponent(q) : ''); }
          const fmtISO = (dt) => dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0');
          if (dpCheckIn) href += (href.includes('?') ? '&' : '?') + 'checkin=' + fmtISO(dpCheckIn);
          if (dpCheckOut) href += '&checkout=' + fmtISO(dpCheckOut);
          if (dpFlex > 0) href += '&flex=' + dpFlex;
          ctaBtn.href = href;
        };
        updateCTAHref();
        destInput.addEventListener('input', updateCTAHref);
        ctaBtn.addEventListener('click', () => {
          if (activeTheme) { const label = (THEME_META[activeTheme] && THEME_META[activeTheme].label) || activeTheme; recordSearch(label, activeTheme); }
          else { const q = (selectedDest || destInput.value).trim(); if (q) recordSearch(q, q); }
        });
      }

      this.addEventListener('click', (e) => {
        const inspiCard = e.target.closest('.wd-booking__dd-inspi-card');
        if (inspiCard) { const city = inspiCard.dataset.city; const th = inspiCard.dataset.theme; if (city) recordSearch(city, city); window.location.href = searchBase + '?theme=' + encodeURIComponent(th) + '&q=' + encodeURIComponent(city); return; }
        const proxBanner = e.target.closest('.wd-booking__dd-proximity-banner');
        if (proxBanner) { goToSearch('nearby'); return; }
        const destItem = e.target.closest('.wd-booking__dd-ac-item');
        if (destItem) {
          if (destItem.dataset.destType === 'Pays') {
            showCountryPreview(destItem.dataset.destName);
            return;
          }
          if (destItem.dataset.loc) {
            const lieuName = destItem.querySelector('.wd-booking__dd-ac-name')?.textContent.split('·')[0].trim();
            const lieuObj = MOCK_AUTOCOMPLETE.lieux.find(l => norm(l.name) === norm(lieuName));
            if (lieuObj) { showDestPreview(lieuObj.loc, lieuObj); return; }
            selectDest(destItem.dataset.loc);
            return;
          }
          const destName = destItem.dataset.destName || destItem.querySelector('.wd-booking__dd-ac-name')?.textContent.split(',')[0].trim();
          if (destName) {
            const destNorm = norm(destName);
            const hotelsCount = PREVIEW_HOTELS.filter(h => norm(h.loc).includes(destNorm)).length;
            if (hotelsCount >= 2) { showDestPreview(destName, null); }
            else { selectDest(destName); }
          }
          return;
        }
        const hotelRow = e.target.closest('.wd-booking__dd-hotel-row');
        if (hotelRow) { e.preventDefault(); const n = hotelRow.querySelector('.wd-booking__dd-hotel-name'); if (n) { selectDest(n.textContent.trim()); } return; }
        const recentItem = e.target.closest('.wd-booking__dd-recent-item');
        if (recentItem && !e.target.closest('.wd-booking__dd-recent-close')) { const q = recentItem.dataset.q || recentItem.querySelector('.wd-booking__dd-recent-dest')?.textContent.split(',')[0].trim(); if (q) goToSearch(q); return; }
        const promoItem = e.target.closest('.wd-booking__dd-promo-card');
        if (promoItem) { const t = promoItem.querySelector('.wd-booking__dd-promo-title'); if (t) { const m = t.textContent.match(/à\s+(.+)/i); goToSearch(m ? m[1] : ''); } return; }
        const seeAll = e.target.closest('.wd-booking__dd-see-all-hotels');
        if (seeAll) { e.preventDefault(); goToSearch(''); return; }
      });
    }
  });

  /* ---------- wd-section-heading ---------- */
  def("wd-section-heading", class extends WdEl {
    render() {
      const kicker = this.attr("kicker");
      const title = this.attr("title");
      const desc = this.attr("desc");
      const link = this.attr("link");
      const linkLabel = this.attr("link-label", "Link label");
      return `<div class="wd-sh">
        ${kicker ? `<p class="t-eyebrow">${esc(kicker)}</p>` : ""}
        <h2 class="t-serif-lg pul-title">${esc(title)}</h2>
        ${desc ? `<p class="t-sans-md wd-sh__desc">${esc(desc)}</p>` : ""}
        ${link ? `<a href="#" class="wd-link wd-link--green">${esc(linkLabel)} ${ICON.arrowR}</a>` : ""}
      </div>`;
    }
  });

  /* ---------- wd-dest-card ---------- */
  def("wd-dest-card", class extends WdEl {
    render() {
      const img = this.attr("img", "");
      const kicker = this.attr("kicker", "Kicker");
      const title = this.attr("title", "Title");
      const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
      return `<a href="${base}search-results.html?q=${encodeURIComponent(title)}" class="wd-dest-card" style="background-image:url('${img}')">
        <div class="wd-dest-card__overlay">
          <div class="wd-dest-card__overlay-gradient"></div>
          <div class="wd-dest-card__overlay-solid">
            <div class="wd-dest-card__text">
              <span class="wd-dest-card__kicker">${esc(kicker)}</span>
              <span class="wd-dest-card__title">${esc(title)}</span>
            </div>
          </div>
        </div>
      </a>`;
    }
  });

  /* ---------- wd-carousel ---------- */
  def("wd-carousel", class extends WdChildEl {
    build(items) {
      const title = this.attr("title");
      const tabs = this.list("tabs");
      const seeall = this.attr("seeall");
      const showmap = this.has("showmap");
      return `<div class="wd-carousel">
        ${title ? `<div class="wd-carousel__header">
          <div class="wd-sh">
            <h2 class="t-serif-lg pul-title">${esc(title)}</h2>
            ${tabs.length ? `<div class="wd-carousel__tabs">${tabs.map((t,i) => `<button class="wd-carousel__tab${i===0 ? " is-active" : ""}">${esc(t)} <span class="wd-carousel__count">(24)</span></button>`).join("")}</div>` : ""}
          </div>
          <div class="wd-carousel__controls">
            ${showmap ? `<button class="wd-btn wd-btn--outline wd-carousel__map">${ICON.pin} Show map</button>` : ""}
            ${seeall ? `<a href="#" class="wd-link wd-link--green">${esc(seeall)} ${ICON.arrowR}</a>` : ""}
          </div>
        </div>` : ""}
        <div class="wd-carousel__track">${items.map(i => i.outerHTML).join("")}</div>
        <div class="wd-carousel__footer"><div class="wd-carousel__dots"><span class="is-active"></span><span></span><span></span></div><span class="wd-carousel__pager">1 / ${items.length || 3}</span></div>
      </div>`;
    }
  });

  /* ---------- wd-editorial ---------- */
  def("wd-editorial", class extends WdEl {
    render() {
      const img = this.attr("img", "");
      const kicker = this.attr("kicker");
      const title = this.attr("title", "Title");
      const desc = this.attr("desc", "");
      const cta = this.attr("cta");
      const imgLeft = this.has("image-left");
      const caption = this.attr("caption");
      const pager = this.attr("pager");
      const white = this.has("white");
      return `<div class="wd-editorial${imgLeft ? " wd-editorial--img-left" : ""}${white ? " wd-editorial--white" : ""}">
        <div class="wd-editorial__img"><img src="${img}" alt="" loading="lazy"/>${caption ? `<span class="wd-editorial__caption">${esc(caption)}</span>` : ""}</div>
        <div class="wd-editorial__body">
          ${kicker ? `<p class="t-eyebrow">${esc(kicker)}</p>` : ""}
          <h3 class="t-serif-md wd-editorial__title">${esc(title)}</h3>
          ${desc ? `<p class="t-sans-md">${esc(desc)}</p>` : ""}
          ${cta ? `<a href="#" class="wd-link">${esc(cta)} ${ICON.arrowR}</a>` : ""}
          ${pager ? `<div class="wd-editorial__nav"><button class="wd-editorial__arrow" aria-label="Diapositive précédente">${ICON.chevL}</button><span class="wd-editorial__pager">${esc(pager)}</span><button class="wd-editorial__arrow" aria-label="Diapositive suivante">${ICON.chevR}</button></div>` : ""}
        </div>
      </div>`;
    }
  });

  /* ---------- wd-callout-section ---------- */
  def("wd-callout-section", class extends WdChildEl {
    build(items) {
      const title = this.attr("title");
      const desc = this.attr("desc");
      const link = this.attr("link");
      return `<div class="wd-callout-section">
        <div class="wd-sh">
          <h2 class="t-serif-lg pul-title">${esc(title)}</h2>
          ${desc ? `<p class="t-sans-md wd-sh__desc">${esc(desc)}</p>` : ""}
          ${link ? `<a href="#" class="wd-link wd-link--green">${esc(link)} ${ICON.arrowR}</a>` : ""}
        </div>
        <div class="wd-callout-section__track">${items.map(i => i.outerHTML).join("")}</div>
      </div>`;
    }
  });

  /* ---------- wd-callout-card ---------- */
  def("wd-callout-card", class extends WdEl {
    render() {
      const img = this.attr("img", "");
      const title = this.attr("title", "Title");
      const desc = this.attr("desc", "");
      const cta = this.attr("cta", "Button label");
      return `<a href="#" class="wd-callout-card">
        <div class="wd-callout-card__img"><img src="${img}" alt="" loading="lazy"/></div>
        <div class="wd-callout-card__body">
          <h3 class="wd-callout-card__title">${esc(title)}</h3>
          <p class="t-sans-md">${esc(desc)}</p>
        </div>
      </a>`;
    }
  });

  /* ---------- wd-marketing ---------- */
  def("wd-marketing", class extends WdEl {
    render() {
      const title = this.attr("title", "Title");
      const desc = this.attr("desc");
      const link = this.attr("link");
      const linkLabel = this.attr("link-label", "See all");
      const tabs = this.list("tabs");
      const img = this.attr("img", "");
      const kicker = this.attr("kicker");
      const cardTitle = this.attr("card-title", "");
      const cardDesc = this.attr("card-desc", "");
      const cta = this.attr("cta");
      const caption = this.attr("caption");
      return `<section class="wd-marketing">
        <div class="wd-marketing__header">
          <div>
            <h2 class="t-sans-xl pul-title">${esc(title)}</h2>
            ${desc ? `<p class="t-sans-md wd-sh__desc">${esc(desc)}</p>` : ""}
          </div>
          ${link ? `<a href="#" class="wd-link wd-link--green">${esc(linkLabel)} ${ICON.arrowR}</a>` : ""}
        </div>
        ${tabs.length ? `<div class="wd-marketing__tabs">${tabs.map((t,i) => `<button class="wd-marketing__tab${i===0 ? " is-active" : ""}">${esc(t)} <span class="wd-carousel__count">(24)</span></button>`).join("")}</div>` : ""}
        <div class="wd-marketing__content">
          <div class="wd-marketing__img"><img src="${img}" alt="" loading="lazy"/>${caption ? `<span class="wd-editorial__caption">${esc(caption)}</span>` : ""}</div>
          <div class="wd-marketing__body">
            ${kicker ? `<p class="t-eyebrow">${esc(kicker)}</p>` : ""}
            ${cardTitle ? `<h3 class="t-serif-lg pul-title">${esc(cardTitle)}</h3>` : ""}
            ${cardDesc ? `<p class="t-sans-md">${esc(cardDesc)}</p>` : ""}
            ${cta ? `<a href="#" class="wd-btn wd-btn--outline">${esc(cta)}</a>` : ""}
          </div>
        </div>
        <div class="wd-carousel__footer"><div class="wd-carousel__dots"><span class="is-active"></span><span></span><span></span></div><span class="wd-carousel__pager">1 / 4</span></div>
      </section>`;
    }
  });

  /* ---------- wd-highlight-v2 ---------- */
  def("wd-highlight-v2", class extends WdEl {
    render() {
      const img = this.attr("img", "");
      const kicker = this.attr("kicker");
      const title = this.attr("title", "Title");
      const desc = this.attr("desc", "");
      const cta1 = this.attr("cta1");
      const cta2 = this.attr("cta2");
      const caption = this.attr("caption");
      return `<div class="wd-highlight-v2">
        <div class="wd-highlight-v2__img"><img src="${img}" alt="" loading="lazy"/>${caption ? `<span class="wd-editorial__caption">${esc(caption)}</span>` : ""}</div>
        <div class="wd-highlight-v2__body">
          ${kicker ? `<p class="t-eyebrow" style="color:var(--pul-muted)">${esc(kicker)}</p>` : ""}
          <h3 class="t-serif-md pul-title">${esc(title)}</h3>
          ${desc ? `<p class="t-sans-md">${esc(desc)}</p>` : ""}
          <div class="wd-highlight-v2__actions">
            ${cta1 ? `<a href="#" class="wd-btn wd-btn--primary">${esc(cta1)} ${ICON.arrowR}</a>` : ""}
            ${cta2 ? `<a href="#" class="wd-btn wd-btn--outline">${esc(cta2)} ${ICON.arrowR}</a>` : ""}
          </div>
        </div>
      </div>`;
    }
  });

  /* ---------- wd-billboard ---------- */
  def("wd-billboard", class extends WdEl {
    render() {
      const kicker = this.attr("kicker");
      const title = this.attr("title", "Title");
      const desc = this.attr("desc", "");
      const img = this.attr("img", "");
      return `<div class="wd-billboard">
        <div class="wd-billboard__body">
          ${kicker ? `<p class="t-eyebrow">${esc(kicker)}</p>` : ""}
          <h2 class="t-serif-lg">${esc(title)}</h2>
          ${desc ? `<p class="t-sans-md">${esc(desc)}</p>` : ""}
        </div>
        <div class="wd-billboard__img"><img src="${img}" alt="" loading="lazy"/></div>
      </div>`;
    }
  });

  /* ---------- wd-social ---------- */
  def("wd-social", class extends WdChildEl {
    build(items) {
      const title = this.attr("title", "#pullman");
      const desc = this.attr("desc");
      const post = this.attr("post");
      return `<section class="wd-social">
        <div class="wd-social__header">
          <h2 class="t-sans-xl pul-title">${esc(title)}</h2>
          ${desc ? `<p class="t-sans-md">${esc(desc)}</p>` : ""}
        </div>
        <div class="wd-social__grid">
          <div class="wd-social__tiles">${items.map(i => `<div class="wd-social__tile">${i.outerHTML || i.innerHTML}</div>`).join("")}</div>
          ${post ? `<div class="wd-social__post"><p class="t-sans-md">${esc(post)}</p></div>` : ""}
        </div>
        <div class="wd-social__icons">
          <a href="#" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
          <a href="#" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a>
          <a href="#" aria-label="Pinterest"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4c0 2.5-1.5 4-3 4-1 0-1.5-.8-1.2-1.8l1-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <a href="#" aria-label="YouTube"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M10 8.5l5.5 3.5-5.5 3.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></a>
          <a href="#" aria-label="X"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L20 4h-2l-5.2 6.3L8 4z" stroke="currentColor" stroke-width="1.3"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M8 11v5M8 8v.01M12 16v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
        </div>
      </section>`;
    }
  });

  /* ---------- wd-loyalty ---------- */
  def("wd-loyalty", class extends WdEl {
    render() {
      const title = this.attr("title", "Title");
      const benefits = this.list("benefits");
      const cta1 = this.attr("cta1", "Join for free");
      const cta2 = this.attr("cta2", "Learn more");
      const img = this.attr("img", "");
      const caption = this.attr("caption");
      return `<div class="wd-loyalty">
        <div class="wd-loyalty__body">
          <h2 class="t-serif-lg">${esc(title)}</h2>
          ${benefits.length ? `<ul class="wd-loyalty__list">${benefits.map(b => `<li class="t-sans-md">${ICON.check} ${esc(b)}</li>`).join("")}</ul>` : ""}
          <div class="wd-loyalty__actions">
            <a href="#" class="wd-btn wd-btn--dark">${esc(cta1)}</a>
            <a href="#" class="wd-btn wd-btn--outline">${esc(cta2)}</a>
          </div>
        </div>
        <div class="wd-loyalty__img"><img src="${img}" alt="" loading="lazy"/>${caption ? `<span class="wd-editorial__caption">${esc(caption)}</span>` : ""}</div>
      </div>`;
    }
  });

  /* ---------- wd-footer ---------- */
  def("wd-footer", class extends WdEl {
    render() {
      const brand = brandName();
      return `<footer class="wd-footer">
        <nav class="wd-footer__breadcrumb"><a href="#">Index</a> ${ICON.chevR} <a href="#">Second page</a> ${ICON.chevR} <a href="#">Third page</a> ${ICON.chevR} <span>Current page</span></nav>
        <div class="wd-footer__logo">${wordmark(this)}</div>
        <div class="wd-footer__newsletter">
          <div class="wd-footer__nl-left">
            <h3 class="t-sans-lg">Exclusive offers</h3>
            <p class="t-sans-sm">Unlock Insider Access: ${brand}'s Exclusive Newsletter</p>
            <form class="wd-footer__form"><input type="email" placeholder="Email adress" class="wd-footer__input"/><button type="submit" class="wd-btn wd-btn--outline">Sign up ${ICON.arrowR}</button></form>
          </div>
          <div class="wd-footer__nl-right">
            <h3 class="t-sans-lg">Need help?</h3>
            <a href="#" class="t-sans-md">Manage bookings</a>
            <a href="#" class="t-sans-md">Assistance</a>
            <a href="#" class="t-sans-md">Book by phone</a>
          </div>
        </div>
        <div class="wd-footer__links">
          <div><h4>Company</h4><a href="#">Accor Group</a><a href="#">Management & franchises</a><a href="#">Careers</a><a href="#">Sustainable development</a><a href="#">Affiliate programme</a></div>
          <div><h4>Professional Solutions</h4><a href="#">Business Travel</a><a href="#">Meetings & Events</a><a href="#">Travel professionals</a></div>
          <div><h4>Navigation</h4><a href="#">Web accessibility</a><a href="#">Site map</a><a href="#">All our services</a></div>
          <div><h4>Mobile App</h4><a href="#">Mobile services</a><a href="#">iOS app</a><a href="#">Android app</a></div>
        </div>
        <div class="wd-footer__social">
          <a href="#" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
          <a href="#" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/></svg></a>
          <a href="#" aria-label="Pinterest"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/></svg></a>
          <a href="#" aria-label="YouTube"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M10 8.5l5.5 3.5-5.5 3.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></a>
          <a href="#" aria-label="X"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L20 4h-2l-5.2 6.3L8 4z" stroke="currentColor" stroke-width="1.3"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M8 11v5M8 8v.01M12 16v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
        </div>
        <div class="wd-footer__portfolio">
          <div class="wd-footer__all-logo"><svg viewBox="0 0 80 40" fill="none" aria-hidden="true"><text x="10" y="28" font-family="system-ui" font-size="20" font-weight="700" fill="currentColor">ALL</text><text x="10" y="38" font-family="system-ui" font-size="8" fill="currentColor">ACCOR</text></svg></div>
          <div class="wd-footer__brands">
            <div class="wd-footer__tier"><span>Luxury</span><span>(11)</span></div>
            <div class="wd-footer__tier"><span>Premium</span><span>(11)</span></div>
            <div class="wd-footer__tier"><span>Midscale</span><span>(11)</span></div>
            <div class="wd-footer__tier"><span>Economy</span><span>(11)</span></div>
            <div class="wd-footer__tier"><span>Lifestyle<br/>by Ennismore</span><span>(11)</span></div>
          </div>
        </div>
        <div class="wd-footer__legal">
          <p class="t-sans-sm">Terms & Conditions &nbsp; Adagio Terms & Conditions &nbsp; Privacy &nbsp; Legal notice</p>
          <p class="t-sans-sm" style="color:var(--pul-muted)">© Accor 2019</p>
        </div>
      </footer>`;
    }
  });

  /* ---------- wd-booking-tabs (Airbnb-style search avec tabs) ---------- */
  def("wd-booking-tabs", class extends WdEl {
    render() {
      const tabs = this.attr("tabs", "Hôtels|Expériences|Lieux de réception|Services").split("|");
      const activeTab = this.attr("active-tab", "0");

      return `<div class="wd-booking-tabs">
        <div class="wd-booking-tabs__nav">
          ${tabs.map((tab, i) => `
            <button class="wd-booking-tabs__tab ${i === parseInt(activeTab) ? 'wd-booking-tabs__tab--active' : ''}"
                    data-tab="${i}" type="button">
              <span class="wd-booking-tabs__tab-icon">${this._getTabIcon(i)}</span>
              ${esc(tab)}
            </button>
          `).join('')}
        </div>
        <div class="wd-booking-tabs__panels">
          ${tabs.map((tab, i) => `
            <div class="wd-booking-tabs__panel ${i === parseInt(activeTab) ? 'wd-booking-tabs__panel--active' : ''}"
                 data-panel="${i}">
              ${this._renderPanel(i, tab)}
            </div>
          `).join('')}
        </div>
      </div>`;
    }

    _getTabIcon(index) {
      const icons = [
        // Hôtels - Building élégant
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="6" width="16" height="16" rx="1"/>
          <path d="M4 10h16M8 6V4M12 6V4M16 6V4"/>
          <circle cx="8" cy="14" r="0.5" fill="currentColor"/>
          <circle cx="12" cy="14" r="0.5" fill="currentColor"/>
          <circle cx="16" cy="14" r="0.5" fill="currentColor"/>
          <circle cx="8" cy="18" r="0.5" fill="currentColor"/>
          <circle cx="12" cy="18" r="0.5" fill="currentColor"/>
          <circle cx="16" cy="18" r="0.5" fill="currentColor"/>
        </svg>`,
        // Expériences - Globe/Compass
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 3v18M3 12h18"/>
          <path d="M8 8l8 8M16 8l-8 8"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>`,
        // Lieux de réception - Chandelier
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4"/>
          <path d="M8 8c0-2 1-3 4-3s4 1 4 3-1 3-4 3-4-1-4-3z"/>
          <path d="M6 12c0-2 1.5-4 6-4s6 2 6 4-1.5 4-6 4-6-2-6-4z"/>
          <path d="M12 16v4M8 20h8"/>
        </svg>`,
        // Services - Cloche concierge
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 18h12M12 3v2"/>
          <path d="M5 18c0-4 2-7 7-7s7 3 7 7"/>
          <circle cx="12" cy="6" r="2"/>
        </svg>`
      ];
      return icons[index] || icons[0];
    }

    _renderPanel(index, tabName) {
      // Panel 0: Hôtels (search complète)
      if (index === 0) {
        return `
          <div class="wd-booking-tabs__search-bar">
            <div class="wd-booking-tabs__field wd-booking-tabs__field--destination">
              <svg class="wd-booking-tabs__field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <div class="wd-booking-tabs__field-content">
                <label class="wd-booking-tabs__label">Où allez-vous ?</label>
                <input type="text" class="wd-booking-tabs__input" placeholder="Destination, Nom d'hôtel" />
              </div>
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field wd-booking-tabs__field--dates">
              <svg class="wd-booking-tabs__field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div class="wd-booking-tabs__field-content">
                <label class="wd-booking-tabs__label">À quelles dates ?</label>
                <input type="text" class="wd-booking-tabs__input" placeholder="27 juillet → 28 juillet" readonly />
              </div>
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field wd-booking-tabs__field--guests">
              <svg class="wd-booking-tabs__field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <div class="wd-booking-tabs__field-content">
                <label class="wd-booking-tabs__label">Combien serez-vous ?</label>
                <input type="text" class="wd-booking-tabs__input" placeholder="1 Chambre(s) - 1 Invité(s)" readonly />
              </div>
            </div>
            <button class="wd-booking-tabs__search-btn" type="button">
              <span class="wd-booking-tabs__search-text">Rechercher</span>
            </button>
          </div>
          <div class="wd-booking-tabs__more">
            <button class="wd-booking-tabs__more-link" type="button">Plus de critères</button>
          </div>
        `;
      }

      // Panel 1: Expériences
      if (index === 1) {
        return `
          <div class="wd-booking-tabs__search-bar">
            <div class="wd-booking-tabs__field wd-booking-tabs__field--large">
              <svg class="wd-booking-tabs__field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <div class="wd-booking-tabs__field-content">
                <label class="wd-booking-tabs__label">Où souhaitez-vous vivre des expériences ?</label>
                <input type="text" class="wd-booking-tabs__input" placeholder="Destination" />
              </div>
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field">
              <svg class="wd-booking-tabs__field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div class="wd-booking-tabs__field-content">
                <label class="wd-booking-tabs__label">Date</label>
                <input type="text" class="wd-booking-tabs__input" placeholder="Ajouter une date" readonly />
              </div>
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field">
              <svg class="wd-booking-tabs__field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <div class="wd-booking-tabs__field-content">
                <label class="wd-booking-tabs__label">Participants</label>
                <input type="text" class="wd-booking-tabs__input" placeholder="Ajouter participants" readonly />
              </div>
            </div>
            <button class="wd-booking-tabs__search-btn" type="button">
              <span class="wd-booking-tabs__search-text">Rechercher</span>
            </button>
          </div>
        `;
      }

      // Panel 2: Lieux de réception
      if (index === 2) {
        return `
          <div class="wd-booking-tabs__search-bar">
            <div class="wd-booking-tabs__field wd-booking-tabs__field--destination">
              <label class="wd-booking-tabs__label">Destination</label>
              <input type="text" class="wd-booking-tabs__input" placeholder="Rechercher un lieu" />
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field">
              <label class="wd-booking-tabs__label">Date de l'événement</label>
              <input type="text" class="wd-booking-tabs__input" placeholder="Quand ?" readonly />
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field">
              <label class="wd-booking-tabs__label">Participants</label>
              <input type="text" class="wd-booking-tabs__input" placeholder="Nombre de personnes" readonly />
            </div>
            <button class="wd-booking-tabs__search-btn" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span class="wd-booking-tabs__search-text">Rechercher</span>
            </button>
          </div>
        `;
      }

      // Panel 3: Services
      if (index === 3) {
        return `
          <div class="wd-booking-tabs__search-bar">
            <div class="wd-booking-tabs__field wd-booking-tabs__field--xlarge">
              <label class="wd-booking-tabs__label">Quel service recherchez-vous ?</label>
              <input type="text" class="wd-booking-tabs__input" placeholder="Spa, restaurant, salle de sport..." />
            </div>
            <div class="wd-booking-tabs__separator"></div>
            <div class="wd-booking-tabs__field">
              <label class="wd-booking-tabs__label">Ville</label>
              <input type="text" class="wd-booking-tabs__input" placeholder="Où ?" />
            </div>
            <button class="wd-booking-tabs__search-btn" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span class="wd-booking-tabs__search-text">Rechercher</span>
            </button>
          </div>
        `;
      }

      return '';
    }

    connectedCallback() {
      super.connectedCallback();

      // Gestion du switch de tabs
      this.addEventListener('click', (e) => {
        const tab = e.target.closest('.wd-booking-tabs__tab');
        if (tab) {
          const tabIndex = tab.dataset.tab;

          // Update tabs
          this.querySelectorAll('.wd-booking-tabs__tab').forEach(t =>
            t.classList.remove('wd-booking-tabs__tab--active')
          );
          tab.classList.add('wd-booking-tabs__tab--active');

          // Update panels
          this.querySelectorAll('.wd-booking-tabs__panel').forEach(p =>
            p.classList.remove('wd-booking-tabs__panel--active')
          );
          const panel = this.querySelector(`[data-panel="${tabIndex}"]`);
          if (panel) panel.classList.add('wd-booking-tabs__panel--active');
        }
      });
    }
  });

  /* ---------- wd-discovery-wizard ---------- */
  def("wd-discovery-wizard", class extends WdEl {
    constructor() {
      super();
      this.state = {
        currentStep: 1,
        carouselIndex: 2,
        selectedWho: null,
        selectedType: null,
        selectedMonth: null,
        selectedDuration: null,
        selectedServices: [],
        results: []
      };
      this.questions = null;
      this.destinations = null;
    }

    async connectedCallback() {
      await this.loadData();
      this.render();
    }

    async loadData() {
      // Données inline pour éviter fetch en file://
      const data = {"questions":{"q1":{"title":"Avec qui voyagez-vous ?","subtitle":"Répondez à 2 questions rapides pour découvrir votre prochaine destination","options":[{"value":"solo","label":"Solo","icon":"person","image":"../../assets/images/discovery/solo.jpg"},{"value":"couple","label":"En couple","icon":"hearts","image":"../../assets/images/discovery/couple.jpg"},{"value":"family","label":"En famille","icon":"family","image":"../../assets/images/discovery/family.jpg"},{"value":"friends","label":"Entre amis","icon":"group","image":"../../assets/images/discovery/friends.jpg"},{"value":"business","label":"Business","icon":"briefcase","image":"../../assets/images/discovery/business.jpg"}]},"q2":{"title":"Quel type de voyage ?","subtitle":"Sélectionnez l'expérience qui vous inspire","options":[{"value":"wellness","label":"Détente & Wellness","icon":"bed","image":"../../assets/images/discovery/wellness.jpg"},{"value":"culture","label":"Découverte culturelle","icon":"pin","image":"../../assets/images/discovery/culture.jpg"},{"value":"city","label":"City break","icon":"pin","image":"../../assets/images/discovery/city.jpg"},{"value":"gastro","label":"Gastronomie","icon":"utensils","image":"../../assets/images/discovery/gastro.jpg"},{"value":"events","label":"Business & Events","icon":"presentation","image":"../../assets/images/discovery/events.jpg"}]}},"destinations":[{"id":"paris","name":"Paris","image":"https://m.ahstatic.com/is/image/accorhotels/GettyImages-1187421561:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["couple","solo","friends"],"type":["culture","gastro","city"],"descriptions":{"couple-city":"Parfait pour un city break en couple","couple-culture":"Idéal pour une découverte culturelle à deux","couple-gastro":"Parfait pour une escapade gastronomique en couple","solo-city":"Idéal pour un city break en solo","solo-culture":"Parfait pour une découverte culturelle en solo","solo-gastro":"Idéal pour une escapade gastronomique en solo","friends-city":"Parfait pour un city break entre amis","friends-culture":"Idéal pour une découverte culturelle entre amis","friends-gastro":"Parfait pour une escapade gastronomique entre amis"}},{"id":"singapore","name":"Singapour","image":"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["couple","solo","friends","business"],"type":["city","gastro","culture","events"],"descriptions":{"couple-city":"Parfait pour un city break en couple","solo-city":"Idéal pour un city break en solo","friends-city":"Parfait pour un city break entre amis","business-events":"Idéal pour un voyage business","couple-gastro":"Parfait pour une escapade gastronomique en couple","solo-gastro":"Idéal pour une escapade gastronomique en solo","friends-gastro":"Parfait pour une escapade gastronomique entre amis","couple-culture":"Idéal pour une découverte culturelle à deux","solo-culture":"Parfait pour une découverte culturelle en solo","friends-culture":"Idéal pour une découverte culturelle entre amis"}},{"id":"bali","name":"Bali","image":"https://m.ahstatic.com/is/image/accorhotels/6556-1:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["couple","family","friends"],"type":["wellness","culture"],"descriptions":{"couple-wellness":"Parfait pour un séjour détente en couple","family-wellness":"Idéal pour des vacances détente en famille","friends-wellness":"Parfait pour un séjour détente entre amis","couple-culture":"Idéal pour une découverte culturelle à deux","family-culture":"Parfait pour une découverte culturelle en famille","friends-culture":"Idéal pour une découverte culturelle entre amis"}},{"id":"dubai","name":"Dubaï","image":"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["couple","family","business"],"type":["city","wellness","events"],"descriptions":{"couple-city":"Parfait pour un city break en couple","family-city":"Idéal pour un city break en famille","business-events":"Parfait pour un voyage business","couple-wellness":"Idéal pour un séjour détente en couple","family-wellness":"Parfait pour des vacances détente en famille"}},{"id":"shanghai","name":"Shanghai","image":"https://m.ahstatic.com/is/image/accorhotels/aja_p_2810-66:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["solo","friends","business"],"type":["city","culture","events"],"descriptions":{"solo-city":"Idéal pour un city break en solo","friends-city":"Parfait pour un city break entre amis","business-events":"Parfait pour un voyage business","solo-culture":"Idéal pour une découverte culturelle en solo","friends-culture":"Parfait pour une découverte culturelle entre amis"}},{"id":"sao-paulo","name":"São Paulo","image":"https://m.ahstatic.com/is/image/accorhotels/aja_p_0626-10:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["solo","friends","business"],"type":["city","gastro","events"],"descriptions":{"solo-city":"Idéal pour un city break en solo","friends-city":"Parfait pour un city break entre amis","business-events":"Parfait pour un voyage business","solo-gastro":"Idéal pour une escapade gastronomique en solo","friends-gastro":"Parfait pour une escapade gastronomique entre amis"}},{"id":"sydney","name":"Sydney","image":"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["couple","family","friends"],"type":["city","culture","wellness"],"descriptions":{"couple-city":"Parfait pour un city break en couple","family-city":"Idéal pour un city break en famille","friends-city":"Parfait pour un city break entre amis","couple-culture":"Idéal pour une découverte culturelle à deux","family-culture":"Parfait pour une découverte culturelle en famille","friends-culture":"Idéal pour une découverte culturelle entre amis","couple-wellness":"Parfait pour un séjour détente en couple","family-wellness":"Idéal pour des vacances détente en famille","friends-wellness":"Parfait pour un séjour détente entre amis"}},{"id":"toulouse","name":"Toulouse","image":"https://m.ahstatic.com/is/image/accorhotels/aja_p_7014-44:9by16?fmt=jpg&wid=480&hei=853&qlt=80","who":["couple","solo","friends"],"type":["city","culture","gastro"],"descriptions":{"couple-city":"Parfait pour un city break en couple","solo-city":"Idéal pour un city break en solo","friends-city":"Parfait pour un city break entre amis","couple-culture":"Idéal pour une découverte culturelle à deux","solo-culture":"Parfait pour une découverte culturelle en solo","friends-culture":"Idéal pour une découverte culturelle entre amis","couple-gastro":"Parfait pour une escapade gastronomique en couple","solo-gastro":"Idéal pour une escapade gastronomique en solo","friends-gastro":"Parfait pour une escapade gastronomique entre amis"}}]};
      this.questions = data.questions;
      this.destinations = data.destinations;
    }

    render() {
      if (this.state.currentStep === 1) {
        this.renderQuestion1();
      } else if (this.state.currentStep === 2) {
        this.renderQuestion2();
      } else if (this.state.currentStep === 3) {
        this.renderResults();
      }
    }

    renderQuestion1() {
      const q = this.questions.q1;
      this.innerHTML = `
        <section class="wd-discovery">
          <div class="wd-discovery__container">
            <h2 class="wd-discovery__title">${q.title}</h2>
            <p class="wd-discovery__subtitle">${q.subtitle}</p>
            <div class="wd-discovery__grid">
              ${q.options.map(opt => `
                <button class="wd-discovery__card" data-value="${opt.value}">
                  <img class="wd-discovery__card-bg" src="${opt.image}" alt="${opt.label}" loading="lazy" />
                  <div class="wd-discovery__card-content">
                    ${ICON[opt.icon]}
                    <span class="wd-discovery__card-label">${opt.label}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>
        </section>
      `;
      this.attachCardListeners();
    }

    renderQuestion2() {
      const q = this.questions.q2;
      const whoLabel = this.questions.q1.options.find(o => o.value === this.state.selectedWho)?.label || '';
      this.innerHTML = `
        <section class="wd-discovery">
          <div class="wd-discovery__container">
            <h2 class="wd-discovery__title">${q.title}</h2>
            <p class="wd-discovery__subtitle">
              ${q.subtitle}
              <span class="wd-discovery__breadcrumb">${whoLabel} ></span>
            </p>
            <div class="wd-discovery__grid">
              ${q.options.map(opt => `
                <button class="wd-discovery__card" data-value="${opt.value}">
                  <img class="wd-discovery__card-bg" src="${opt.image}" alt="${opt.label}" loading="lazy" />
                  <div class="wd-discovery__card-content">
                    ${ICON[opt.icon] || ''}
                    <span class="wd-discovery__card-label">${opt.label}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>
        </section>
      `;
      this.attachCardListeners();
    }

    renderResults() {
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

      const message = `Pour un ${typeLabels[this.state.selectedType]} ${whoLabels[this.state.selectedWho]}`;
      const typeLabel = this.questions.q2.options.find(o => o.value === this.state.selectedType)?.label || this.state.selectedType;

      this.innerHTML = `
        <section class="wd-discovery">
          <div class="wd-discovery__container">
            <h2 class="wd-discovery__title">Vos destinations recommandées</h2>
            <p class="wd-discovery__subtitle-personalized">${message}</p>
            <button class="wd-discovery__restart">
              ${ICON.chevL}
              Recommencer
            </button>
            <div class="wd-discovery__results">
              ${this.state.results.map(dest => {
                const descKey = `${this.state.selectedWho}-${this.state.selectedType}`;
                const description = dest.descriptions[descKey] || dest.descriptions[Object.keys(dest.descriptions)[0]];
                return `
                  <div class="wd-discovery__dest-card">
                    <img class="wd-discovery__dest-image" src="${dest.image}" alt="${dest.name}" loading="lazy" />
                    <div class="wd-discovery__dest-content">
                      <span class="wd-discovery__dest-tag">${typeLabel}</span>
                      <h3 class="wd-discovery__dest-title">${dest.name}</h3>
                      <p class="wd-discovery__dest-desc">${description}</p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <a href="#destinations" class="wd-discovery__cta">
              Voir toutes les destinations ${this.state.selectedType}
              ${ICON.arrowR}
            </a>
          </div>
        </section>
      `;

      this.querySelector('.wd-discovery__restart')?.addEventListener('click', () => this.restart());
      this.querySelector('.wd-discovery__cta')?.addEventListener('click', (e) => this.handleCTA(e));
    }

    attachCardListeners() {
      this.querySelectorAll('.wd-discovery__card').forEach(card => {
        card.addEventListener('click', () => {
          const value = card.dataset.value;
          if (this.state.currentStep === 1) {
            this.state.selectedWho = value;
            this.state.currentStep = 2;
            this.render();
          } else if (this.state.currentStep === 2) {
            this.state.selectedType = value;
            this.filterDestinations();
            this.state.currentStep = 3;
            this.render();
          }
        });
      });
    }

    filterDestinations() {
      let matches = this.destinations.filter(d =>
        d.who.includes(this.state.selectedWho) && d.type.includes(this.state.selectedType)
      );

      if (matches.length < 3) {
        matches = this.destinations.filter(d => d.type.includes(this.state.selectedType));
      }

      this.state.results = matches.slice(0, 3);
    }

    getNextStep(currentStep, state) {
      // Flux business divergent
      if (state.selectedWho === 'business') {
        switch (currentStep) {
          case 1:
            return 2;
          case 2:
            return 'business-location';
          case 'business-location':
            return 'business-dates';
          case 'business-dates':
            return 6;
          case 6:
            return 'results';
          default:
            return currentStep;
        }
      }

      // Flux standard pour solo/couple/family/friends
      switch (currentStep) {
        case 1:
          // Q1 → Q1.5 si family/friends, sinon Q2
          if (state.selectedWho === 'family' || state.selectedWho === 'friends') {
            return 1.5;
          }
          return 2;

        case 1.5:
          // Q1.5 → Q2
          return 2;

        case 2:
          // Q2 → Q3
          return 3;

        case 3:
          // Q3 → Q3.1 si "yes", Q3.2 si "no", Q3.3 si "multiple"
          if (state.destinationIdea === 'yes') {
            return 3.1;
          } else if (state.destinationIdea === 'no') {
            return 3.2;
          } else if (state.destinationIdea === 'multiple') {
            return 3.3;
          }
          return 3;

        case 3.1:
          // Q3.1 → Q4
          return 4;

        case 3.2:
          // Q3.2 → Q3.3
          return 3.3;

        case 3.3:
          // Q3.3 → Q4
          return 4;

        case 4:
          // Q4 → Q5
          return 5;

        case 5:
          // Q5 → Q6
          return 6;

        case 6:
          // Q6 → Résultats
          return 'results';

        default:
          return currentStep;
      }
    }

    restart() {
      this.state = {
        currentStep: 1,
        stepHistory: [],
        carouselIndex: 2,
        selectedWho: null,
        selectedYear: new Date().getFullYear(),
        showYearPicker: false,
        familyDetails: { adultsCount: null, childrenCount: null, childrenAges: [] },
        friendsDetails: { adultsCount: null },
        selectedTypes: [],
        destinationIdea: null,
        destinationInput: '',
        selectedRegions: [],
        selectedRegion: null,
        selectedMonth: null,
        selectedDuration: null,
        selectedServices: [],
        businessLocation: null,
        checkInDate: null,
        checkOutDate: null,
        results: []
      };
      const modalContent = this.querySelector('.wd-discovery-modal__content');
      if (modalContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.render();
        const newContent = tempDiv.querySelector('.wd-discovery-modal__content');
        if (newContent) {
          modalContent.innerHTML = newContent.innerHTML;
          this.afterRender();
        }
      }
      this.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    handleCTA(e) {
      e.preventDefault();
      const carousel = document.querySelector('.wd-carousel');
      if (carousel) {
        carousel.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const cards = document.querySelectorAll('wd-dest-card');
          cards.forEach(card => {
            const typeTags = card.getAttribute('type-tags') || '';
            const matches = typeTags.includes(this.state.selectedType);
            card.style.opacity = matches ? '1' : '0.3';
          });
        }, 500);
      }
    }
  });

  /* ---------- wd-discovery-modal ---------- */
  def("wd-discovery-modal", class extends WdEl {
    constructor() {
      super();
      this.isOpen = false;
      this.state = {
        currentStep: 1,
        stepHistory: [],
        selectedWho: null,
        selectedYear: new Date().getFullYear(),
        showYearPicker: false,
        familyDetails: { adultsCount: null, childrenCount: null, childrenAges: [] },
        friendsDetails: { adultsCount: null },
        selectedTypes: [],
        destinationIdea: null,
        destinationInput: '',
        selectedRegions: [],
        selectedRegion: null,
        businessLocation: null,
        checkInDate: null,
        checkOutDate: null,
        carouselIndex: 2
      };
      this.keydownHandler = null;
    }

    render() {
      if (this.state.currentStep === 1) {
        return this.renderQuestion1();
      } else if (this.state.currentStep === 1.5) {
        return this.renderQuestion1_5();
      } else if (this.state.currentStep === 2) {
        return this.renderQuestion2();
      } else if (this.state.currentStep === 'business-location') {
        return this.renderQuestion_BusinessLocation();
      } else if (this.state.currentStep === 'business-dates') {
        return this.renderQuestion_BusinessDates();
      } else if (this.state.currentStep === 3) {
        return this.renderQuestion3();
      } else if (this.state.currentStep === 3.1) {
        return this.renderQuestion3_OneDestination();
      } else if (this.state.currentStep === 3.2) {
        return this.renderQuestion3_MultipleDestinations();
      } else if (this.state.currentStep === 3.3) {
        return this.renderQuestion3_Regions();
      } else if (this.state.currentStep === 4) {
        return this.renderQuestion4_Period();
      } else if (this.state.currentStep === 5) {
        return this.renderQuestion5_Services();
      } else if (this.state.currentStep === 6) {
        return this.renderQuestion5_Services();
      }
      return '';
    }

    renderQuestion1() {
      const options = [
        { value: 'solo', label: 'Solo', image: '../../assets/images/discovery/solo.jpg' },
        { value: 'couple', label: 'En couple', image: '../../assets/images/discovery/couple.jpg' },
        { value: 'family', label: 'En famille', image: '../../assets/images/discovery/family.jpg' },
        { value: 'friends', label: 'Entre amis', image: '../../assets/images/discovery/friends.jpg' },
        { value: 'business', label: 'Business', image: '../../assets/images/discovery/business.jpg' }
      ];

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">1. Avec qui voyagez-vous ?</label>
              <div class="wd-discovery-modal__options">
                ${options.map((opt, i) => {
                  const isSelected = this.state.selectedWho === opt.value;
                  let className = 'wd-discovery-modal__option wd-discovery-modal__option--card';
                  const idx = this.state.carouselIndex;
                  const distance = Math.abs(i - idx);
                  const isLeft = i < idx;

                  if (i === idx) {
                    className += ' is-active';
                  } else if (i === (idx - 1 + options.length) % options.length) {
                    className += ' is-prev'; // Distance 1 gauche
                  } else if (i === (idx + 1) % options.length) {
                    className += ' is-next'; // Distance 1 droite
                  } else if (distance === 2 || (distance === options.length - 2)) {
                    className += isLeft ? ' is-hidden-left-1' : ' is-hidden-right-1'; // Distance 2
                  } else {
                    className += isLeft ? ' is-hidden-left' : ' is-hidden-right'; // Distance 3+
                  }

                  if (isSelected) {
                    className += ' is-selected';
                  }

                  const bgPosition = opt.value === 'business' ? 'center 30%' : 'center';
                  return `<button class="${className}" data-value="${opt.value}" data-index="${i}" style="background-image: url('${opt.image}'); background-size: cover; background-position: ${bgPosition};">
                    <div class="wd-discovery-modal__option-checkbox">
                      ${ICON.check}
                    </div>
                    <div class="wd-discovery-modal__option-content">
                      <span>${opt.label}</span>
                    </div>
                  </button>`;
                }).join('')}
              </div>
              <div class="wd-discovery-modal__carousel-nav">
                ${options.map((_, i) => `<button class="wd-discovery-modal__carousel-dot${i === this.state.carouselIndex ? ' is-active' : ''}" data-dot="${i}"></button>`).join('')}
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 1/7</div>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.selectedWho ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion1_5() {
      const isFamilyMode = this.state.selectedWho === 'family';
      const title = isFamilyMode ? 'Parlez-nous de votre famille' : 'Combien serez-vous ?';

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">1. ${title}</label>

              ${isFamilyMode ? `
                <div class="wd-discovery-modal__form-group">
                  <label class="wd-discovery-modal__form-label">Nombre d'adultes</label>
                  <input type="number" min="1" max="10" class="wd-discovery-modal__form-input" id="familyAdultsCount" value="${this.state.familyDetails.adultsCount || ''}" />
                </div>
                <div class="wd-discovery-modal__form-group">
                  <label class="wd-discovery-modal__form-label">Nombre d'enfants</label>
                  <input type="number" min="0" max="10" class="wd-discovery-modal__form-input" id="childrenCount" value="${this.state.familyDetails.childrenCount || ''}" />
                </div>
                <div class="wd-discovery-modal__form-group" id="childrenAgesContainer" style="display: none;">
                  <label class="wd-discovery-modal__form-label">Âge des enfants</label>
                  <div id="childrenAgesInputs"></div>
                </div>
              ` : `
                <div class="wd-discovery-modal__form-group">
                  <label class="wd-discovery-modal__form-label">Nombre d'adultes</label>
                  <input type="number" min="2" max="20" class="wd-discovery-modal__form-input" id="adultsCount" value="${this.state.friendsDetails.adultsCount || ''}" />
                </div>
              `}
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 1/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion2() {
      let options = [
        { value: 'spa', label: 'Avoir un spa dans l\'hôtel', image: '../../assets/images/discovery/wellness.jpg' },
        { value: 'restaurant', label: 'Avoir un restaurant dans l\'hôtel', image: '../../assets/images/discovery/gastro.jpg' },
        { value: 'workspace', label: 'Avoir un espace de travail dans l\'hôtel', image: '../../assets/images/discovery/business.jpg' },
        { value: 'meeting-room', label: 'Avoir une salle de réunion', image: '../../assets/images/discovery/business.jpg' },
        { value: 'coworking', label: 'Avoir un espace de coworking', image: '../../assets/images/discovery/business.jpg' },
        { value: 'kids', label: 'Avoir un espace pour enfants', image: '../../assets/images/discovery/kids.jpg' },
        { value: 'local', label: 'Profiter de la vie locale', image: '../../assets/images/discovery/culture.jpg' }
      ];

      if (this.state.selectedWho === 'business') {
        // Business : retirer "espace de travail" (workspace), garder salle de réunion
        // et coworking, et les placer en premier.
        options = options.filter(o => o.value !== 'workspace');
        const businessOptions = options.filter(o => ['meeting-room', 'coworking'].includes(o.value));
        const otherOptions = options.filter(o => !['meeting-room', 'coworking'].includes(o.value));
        options = [...businessOptions, ...otherOptions];
      } else {
        // Autres parcours : retirer "salle de réunion" et "espace de coworking".
        options = options.filter(o => !['meeting-room', 'coworking'].includes(o.value));
      }

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Choisissez une ou plusieurs destinations qui vous inspirent</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">2. Qu'est-ce qui est important pour vous pour ce séjour ? (sélection multiple possible)</label>

              <div class="wd-discovery-modal__options">
                ${options.map((opt, i) => {
                  const isSelected = this.state.selectedTypes.includes(opt.value);
                  let className = 'wd-discovery-modal__option';

                  // Positionnement carousel 3D pour Q3
                  if (i === this.state.carouselIndex) {
                    className += ' is-active';
                  } else if (i === this.state.carouselIndex - 1 || (this.state.carouselIndex === 0 && i === options.length - 1)) {
                    className += ' is-prev';
                  } else if (i === this.state.carouselIndex + 1 || (this.state.carouselIndex === options.length - 1 && i === 0)) {
                    className += ' is-next';
                  } else if (i < this.state.carouselIndex) {
                    className += ' is-hidden-left';
                  } else {
                    className += ' is-hidden-right';
                  }

                  if (isSelected) {
                    className += ' is-selected';
                  }

                  return `<button class="${className}" data-value="${opt.value}" data-index="${i}" style="background-image: url('${opt.image}')">
                    <div class="wd-discovery-modal__option-checkbox">
                      ${ICON.check}
                    </div>
                    <div class="wd-discovery-modal__option-content">
                      <span>${opt.label}</span>
                    </div>
                  </button>`;
                }).join('')}
              </div>

              <div class="wd-discovery-modal__carousel-nav">
                ${options.map((_, i) => `<button class="wd-discovery-modal__carousel-dot${i === this.state.carouselIndex ? ' is-active' : ''}" data-dot="${i}"></button>`).join('')}
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 2/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.selectedTypes.length > 0 ? ' is-active' : ''}" aria-label="Continuer">
                Continuer${this.state.selectedTypes.length > 0 ? ` (${this.state.selectedTypes.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion3() {
      const options = [
        { value: 'yes', label: 'Oui, j\'ai des idées de destination en tête' },
        { value: 'no', label: 'Non, je n\'ai pas encore d\'idées' }
      ];

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">3. Avez-vous des idées de destination ?</label>

              <div class="wd-discovery-modal__options wd-discovery-modal__options--list">
                ${options.map(opt => {
                  const isSelected = this.state.destinationIdea === opt.value;
                  return `<button class="wd-discovery-modal__option wd-discovery-modal__option--choice${isSelected ? ' is-selected' : ''}" data-value="${opt.value}">
                    <div class="wd-discovery-modal__option-checkbox">
                      ${ICON.check}
                    </div>
                    <div class="wd-discovery-modal__option-content">
                      <span>${opt.label}</span>
                    </div>
                  </button>`;
                }).join('')}
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 3/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.destinationIdea ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion3_OneDestination() {
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">Quelle destination vous fait envie ?</label>

              <div class="wd-discovery-modal__form-group">
                <input type="text" class="wd-discovery-modal__form-input" id="destinationInput" placeholder="Ex: Paris, Tokyo, New York..." value="${this.state.destinationInput}" />
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 4/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.destinationInput.length > 0 ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion3_MultipleDestinations() {
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">Entre quelles destinations hésitez-vous ?</label>

              <div class="wd-discovery-modal__form-group">
                <textarea class="wd-discovery-modal__form-input wd-discovery-modal__form-textarea" id="destinationInput" placeholder="Ex: Paris, Tokyo et New York" rows="3">${this.state.destinationInput}</textarea>
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 4/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.destinationInput.length > 0 ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion3_Regions() {
      const options = [
        { value: 'europe', label: 'Europe', image: '../../assets/images/destination/Europe.avif' },
        { value: 'asia', label: 'Asie', image: '../../assets/images/destination/asie.avif' },
        { value: 'africa', label: 'Afrique', image: '../../assets/images/destination/africa.avif' },
        { value: 'north-america', label: 'Amérique du Nord', image: '../../assets/images/destination/america.avif' },
        { value: 'latin-america', label: 'Amérique Latine', image: '../../assets/images/destination/ameriquelatine.avif' },
        { value: 'oceania', label: 'Océanie', image: '../../assets/images/destination/oceanie.avif' }
      ];

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">4. Quelles régions du monde vous attirent le plus ?</label>

              <div class="wd-discovery-modal__options">
                ${options.map((opt, i) => {
                  const isSelected = this.state.selectedRegions.includes(opt.value);
                  let className = 'wd-discovery-modal__option wd-discovery-modal__option--card';
                  const idx = this.state.carouselIndex;
                  const distance = Math.abs(i - idx);
                  const isLeft = i < idx;

                  if (i === idx) {
                    className += ' is-active';
                  } else if (i === (idx - 1 + options.length) % options.length) {
                    className += ' is-prev';
                  } else if (i === (idx + 1) % options.length) {
                    className += ' is-next';
                  } else if (distance === 2 || (distance === options.length - 2)) {
                    className += isLeft ? ' is-hidden-left-1' : ' is-hidden-right-1';
                  } else {
                    className += isLeft ? ' is-hidden-left' : ' is-hidden-right';
                  }

                  if (isSelected) {
                    className += ' is-selected';
                  }

                  return `<button class="${className}" data-value="${opt.value}" data-index="${i}" style="background-image: url('${opt.image}'); background-size: cover; background-position: center;">
                    <div class="wd-discovery-modal__option-checkbox">
                      ${ICON.check}
                    </div>
                    <div class="wd-discovery-modal__option-content">
                      <span>${opt.label}</span>
                    </div>
                  </button>`;
                }).join('')}
              </div>

              <div class="wd-discovery-modal__carousel-nav">
                ${options.map((_, i) => `<button class="wd-discovery-modal__carousel-dot${i === this.state.carouselIndex ? ' is-active' : ''}" data-dot="${i}"></button>`).join('')}
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 4/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.selectedRegions.length > 0 ? ' is-active' : ''}" aria-label="Continuer">
                Continuer${this.state.selectedRegions.length > 0 ? ` (${this.state.selectedRegions.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      `;
    }


    generateMonthDays(monthIndex, year) {
      const firstDay = new Date(year, monthIndex, 1).getDay();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

      const days = [];

      // Jours du mois précédent
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

      // Jours du mois suivant
      const remainingDays = 42 - days.length;
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          day,
          isOtherMonth: true,
          isWeekend: false
        });
      }

      return days;
    }

    renderQuestion4_Period() {
      const monthsData = [
        { value: 'janvier', label: 'Jan', fullLabel: 'Janvier', monthIndex: 0 },
        { value: 'fevrier', label: 'Fév', fullLabel: 'Février', monthIndex: 1 },
        { value: 'mars', label: 'Mar', fullLabel: 'Mars', monthIndex: 2 },
        { value: 'avril', label: 'Avr', fullLabel: 'Avril', monthIndex: 3 },
        { value: 'mai', label: 'Mai', fullLabel: 'Mai', monthIndex: 4 },
        { value: 'juin', label: 'Jun', fullLabel: 'Juin', monthIndex: 5 },
        { value: 'juillet', label: 'Jul', fullLabel: 'Juillet', monthIndex: 6 },
        { value: 'aout', label: 'Aoû', fullLabel: 'Août', monthIndex: 7 },
        { value: 'septembre', label: 'Sep', fullLabel: 'Septembre', monthIndex: 8 },
        { value: 'octobre', label: 'Oct', fullLabel: 'Octobre', monthIndex: 9 },
        { value: 'novembre', label: 'Nov', fullLabel: 'Novembre', monthIndex: 10 },
        { value: 'decembre', label: 'Déc', fullLabel: 'Décembre', monthIndex: 11 }
      ];

      const durations = [
        { value: '1week', label: 'Une semaine' },
        { value: '2weeks', label: 'Deux semaines' },
        { value: '3weeks', label: 'Trois semaines' },
        { value: 'more', label: 'Plus de trois semaines' },
        { value: 'advice', label: 'Conseillez-moi' }
      ];

      const currentYear = new Date().getFullYear();
      const selectedYear = this.state.selectedYear || currentYear;
      const showYearPicker = this.state.showYearPicker || false;

      // Générer années: current -2 à current +10
      const years = [];
      for (let y = currentYear - 2; y <= currentYear + 10; y++) {
        years.push(y);
      }

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">5. À quelle période et pour quelle durée souhaitez-vous partir ?</label>

              <!-- Période -->
              <div class="wd-discovery-modal__form-section">
                <div class="wd-discovery-modal__calendar-header">
                  <button class="wd-discovery-modal__calendar-toggle" data-action="toggle-picker">
                    ${showYearPicker ? `${selectedYear}` : `${monthsData.find(m => m.value === this.state.selectedMonth)?.fullLabel || ''} ${selectedYear}`}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>

                ${showYearPicker ? `
                  <div class="wd-discovery-modal__year-grid">
                    ${years.map(year => `
                      <button
                        class="wd-discovery-modal__year-option${selectedYear === year ? ' is-selected' : ''}"
                        data-year="${year}"
                      >
                        ${year}
                      </button>
                    `).join('')}
                  </div>
                ` : `
                  <div class="wd-discovery-modal__month-grid">
                    ${monthsData.map(month => `
                      <button
                        class="wd-discovery-modal__month-option${this.state.selectedMonth === month.value ? ' is-selected' : ''}"
                        data-month="${month.value}"
                      >
                        ${month.label}
                      </button>
                    `).join('')}
                  </div>
                `}
              </div>

              <!-- Durée -->
              <div class="wd-discovery-modal__form-section">
                <label class="wd-discovery-modal__form-label">Durée</label>
                <div class="wd-discovery-modal__select-grid">
                  ${durations.map(duration => `
                    <button
                      class="wd-discovery-modal__select-option${this.state.selectedDuration === duration.value ? ' is-selected' : ''}"
                      data-value="${duration.value}"
                      data-type="duration"
                    >
                      ${duration.label}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 5/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.selectedMonth && this.state.selectedDuration ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }


    renderQuestion5_Services() {
      const services = [
        { value: 'pets', label: 'Animaux' },
        { value: 'accessibility', label: 'Accès handicapés' },
        { value: 'parking', label: 'Parking' },
        { value: 'kids-club', label: 'Club enfants' }
      ];

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">6. Quels services sont importants pour vous ? <span style="font-weight: 400; color: #888;">(optionnel)</span></label>

              <div class="wd-discovery-modal__select-grid">
                ${services.map(service => `
                  <button 
                    class="wd-discovery-modal__select-option${this.state.selectedServices.includes(service.value) ? ' is-selected' : ''}" 
                    data-value="${service.value}"
                    data-type="service"
                  >
                    ${service.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 6/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue is-active" aria-label="Continuer">
                Continuer${this.state.selectedServices.length > 0 ? ` (${this.state.selectedServices.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion_BusinessLocation() {
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Précisez votre destination pour un voyage d'affaires</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">Dans quelle ville ou région souhaitez-vous séjourner ?</label>

              <div class="wd-discovery-modal__form-group">
                <input type="text" class="wd-discovery-modal__form-input" id="businessLocationInput" placeholder="Ex: Paris, Tokyo, Singapour..." value="${this.state.businessLocation || ''}" />
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 3/6</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.businessLocation && this.state.businessLocation.length > 0 ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion_BusinessDates() {
      const monthsData = [
        { value: 'janvier', label: 'Jan', fullLabel: 'Janvier', monthIndex: 0 },
        { value: 'fevrier', label: 'Fév', fullLabel: 'Février', monthIndex: 1 },
        { value: 'mars', label: 'Mar', fullLabel: 'Mars', monthIndex: 2 },
        { value: 'avril', label: 'Avr', fullLabel: 'Avril', monthIndex: 3 },
        { value: 'mai', label: 'Mai', fullLabel: 'Mai', monthIndex: 4 },
        { value: 'juin', label: 'Jun', fullLabel: 'Juin', monthIndex: 5 },
        { value: 'juillet', label: 'Jul', fullLabel: 'Juillet', monthIndex: 6 },
        { value: 'aout', label: 'Aoû', fullLabel: 'Août', monthIndex: 7 },
        { value: 'septembre', label: 'Sep', fullLabel: 'Septembre', monthIndex: 8 },
        { value: 'octobre', label: 'Oct', fullLabel: 'Octobre', monthIndex: 9 },
        { value: 'novembre', label: 'Nov', fullLabel: 'Novembre', monthIndex: 10 },
        { value: 'decembre', label: 'Déc', fullLabel: 'Décembre', monthIndex: 11 }
      ];

      const currentYear = new Date().getFullYear();
      const hasValidDates = this.state.checkInDate && this.state.checkOutDate && new Date(this.state.checkOutDate) > new Date(this.state.checkInDate);

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">Trouvez votre prochaine inspiration</h2>
            <p class="wd-discovery-modal__subtitle">Précisez vos dates de séjour</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">Quelles sont vos dates d'arrivée et de départ ?</label>

              <div class="wd-discovery-modal__form-group">
                <label for="checkInDate">Date d'arrivée</label>
                <input type="date" class="wd-discovery-modal__form-input" id="checkInDate" value="${this.state.checkInDate || ''}" min="${currentYear}-01-01" />
              </div>

              <div class="wd-discovery-modal__form-group">
                <label for="checkOutDate">Date de départ</label>
                <input type="date" class="wd-discovery-modal__form-input" id="checkOutDate" value="${this.state.checkOutDate || ''}" min="${this.state.checkInDate || `${currentYear}-01-01`}" />
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 4/6</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${hasValidDates ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    afterRender() {
      console.log('🔄 afterRender called, currentStep:', this.state.currentStep, 'selectedWho:', this.state.selectedWho);
      this.modal = this.querySelector('.wd-discovery-modal');
      this.modalContent = this.querySelector('.wd-discovery-modal__content');

      // Utiliser la délégation d'événements sur le composant lui-même
      // pour éviter de réattacher les listeners à chaque afterRender()
      if (!this._mainListenersAttached) {
        // Bouton close via délégation
        this.addEventListener('click', (e) => {
          if (e.target.closest('.wd-discovery-modal__close')) {
            e.stopPropagation();
            console.log('Close button clicked');
            this.close();
          }
        });

        // Backdrop via délégation
        this.addEventListener('click', (e) => {
          const modal = e.target.closest('.wd-discovery-modal');
          if (modal && e.target === modal) {
            console.log('Backdrop clicked, closing modal');
            this.close();
          }
        });

        this._mainListenersAttached = true;
      }

      // Question 1.5: Inputs pour famille ou amis
      if (this.state.currentStep === 1.5) {
        const isFamilyMode = this.state.selectedWho === 'family';

        if (isFamilyMode) {
          // Input nombre d'adultes (famille)
          const familyAdultsCountInput = this.querySelector('#familyAdultsCount');
          if (familyAdultsCountInput) {
            familyAdultsCountInput.addEventListener('input', (e) => {
              const count = parseInt(e.target.value) || 0;
              this.state.familyDetails.adultsCount = count >= 1 ? count : null;
              this.updateContinueButton();
            });
          }

          // Input nombre d'enfants
          const childrenCountInput = this.querySelector('#childrenCount');
          const childrenAgesContainer = this.querySelector('#childrenAgesContainer');
          const childrenAgesInputs = this.querySelector('#childrenAgesInputs');

          if (childrenCountInput) {
            // Fonction pour afficher/masquer les inputs d'âge
            const updateAgeInputs = (count) => {
              // Afficher/masquer les inputs d'âge
              if (count > 0) {
                childrenAgesContainer.style.display = 'block';
                childrenAgesInputs.innerHTML = '';

                // Créer un input pour chaque enfant
                for (let i = 0; i < count; i++) {
                  const ageInput = document.createElement('div');
                  ageInput.className = 'wd-discovery-modal__form-group';
                  ageInput.innerHTML = `
                    <label class="wd-discovery-modal__form-label">Âge de l'enfant ${i + 1}</label>
                    <input type="number" min="0" max="17" class="wd-discovery-modal__form-input child-age-input" data-index="${i}" value="${this.state.familyDetails.childrenAges[i] || ''}" />
                  `;
                  childrenAgesInputs.appendChild(ageInput);
                }

                // Ajouter les event listeners aux inputs d'âge
                childrenAgesInputs.querySelectorAll('.child-age-input').forEach(input => {
                  input.addEventListener('input', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    const age = parseInt(e.target.value);
                    if (!isNaN(age) && age >= 0 && age <= 17) {
                      this.state.familyDetails.childrenAges[index] = age;
                    }
                    this.updateContinueButton();
                  });
                });
              } else {
                childrenAgesContainer.style.display = 'none';
                this.state.familyDetails.childrenAges = [];
              }

              this.updateContinueButton();
            };

            // Event listener pour le changement du nombre d'enfants
            childrenCountInput.addEventListener('input', (e) => {
              const count = parseInt(e.target.value) || 0;
              this.state.familyDetails.childrenCount = count > 0 ? count : null;
              updateAgeInputs(count);
            });

            // Si on a déjà un nombre d'enfants (retour depuis Q2), afficher les inputs
            if (this.state.familyDetails.childrenCount) {
              updateAgeInputs(this.state.familyDetails.childrenCount);
            }
          }
        } else {
          // Input nombre d'adultes (mode amis)
          const adultsCountInput = this.querySelector('#adultsCount');
          if (adultsCountInput) {
            adultsCountInput.addEventListener('input', (e) => {
              const count = parseInt(e.target.value) || 0;
              this.state.friendsDetails.adultsCount = count >= 2 ? count : null;
              this.updateContinueButton();
            });
          }
        }
      }

      // Question 3: Choix des idées de destination (one/multiple/none)
      if (this.state.currentStep === 3) {
        this.querySelectorAll('.wd-discovery-modal__option--choice').forEach(option => {
          option.addEventListener('click', () => {
            const value = option.dataset.value;
            this.state.destinationIdea = value;

            // Retirer la sélection précédente
            this.querySelectorAll('.wd-discovery-modal__option--choice').forEach(opt => {
              opt.classList.remove('is-selected');
            });

            // Ajouter la sélection à la carte cliquée
            option.classList.add('is-selected');

            // Activer le bouton continuer
            const continueBtn = this.querySelector('.wd-discovery-modal__continue');
            if (continueBtn) {
              continueBtn.classList.add('is-active');
            }
          });
        });
      }

      // Question 3.1 et 3.2: Input texte pour destination(s)
      if (this.state.currentStep === 3.1 || this.state.currentStep === 3.2) {
        const destinationInput = this.querySelector('#destinationInput');
        if (destinationInput) {
          destinationInput.addEventListener('input', (e) => {
            this.state.destinationInput = e.target.value;

            const continueBtn = this.querySelector('.wd-discovery-modal__continue');
            if (continueBtn) {
              if (e.target.value.length > 0) {
                continueBtn.classList.add('is-active');
              } else {
                continueBtn.classList.remove('is-active');
              }
            }
          });
        }
      }

      // Bouton "Retour"
      const backBtn = this.querySelector('.wd-discovery-modal__back');
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('=== BACK BUTTON CLICKED ===');
          console.log('Current step:', this.state.currentStep);
          console.log('Step history:', this.state.stepHistory);

          // Dépiler l'historique
          if (this.state.stepHistory.length > 0) {
            const previousStep = this.state.stepHistory.pop();
            console.log('Going back to step:', previousStep);
            this.state.currentStep = previousStep;

            // Centrer carousel pour Q1, Q2, Q3.3
            if (previousStep === 1 || previousStep === 2 || previousStep === 3.3) {
              this.state.carouselIndex = 2;
            }

            // Re-render
            const modalContent = this.querySelector('.wd-discovery-modal__content');
            if (modalContent) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = this.render();
              const newContent = tempDiv.querySelector('.wd-discovery-modal__content');

              if (newContent) {
                modalContent.innerHTML = newContent.innerHTML;
                this.afterRender();
              }
            }
          }
        });
      }

      // Bouton "Recommencer"
      const resetBtn = this.querySelector('.wd-discovery-modal__reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.restart();
        });
      }

      // Carousel navigation par dots
      this.querySelectorAll('.wd-discovery-modal__carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          this.state.carouselIndex = parseInt(dot.dataset.dot);
          this.updateCarouselPosition();
        });
      });

      // Bouton "Continuer"
      const continueBtn = this.querySelector('.wd-discovery-modal__continue');
      if (continueBtn) {
        continueBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('=== CONTINUE BUTTON CLICKED ===');
          console.log('Current step:', this.state.currentStep);
          console.log('Button has is-active class?', continueBtn.classList.contains('is-active'));
          console.log('State selectedWho:', this.state.selectedWho);

          // Pousser l'étape actuelle dans l'historique avant de naviguer
          this.state.stepHistory.push(this.state.currentStep);

          // Obtenir la prochaine étape via la fonction centralisée
          const nextStep = this.getNextStep(this.state.currentStep, this.state);

          if (nextStep === 'results') {
            console.log('Closing modal with final selection');
            this.close();
            console.log('Sélection complète:', this.state);
            return;
          }

          console.log('Advancing from', this.state.currentStep, 'to', nextStep);
          this.state.currentStep = nextStep;

          // Centrer carousel pour Q2, Q3.2, Q3.3
          if (nextStep === 2 || nextStep === 3.2 || nextStep === 3.3) {
            this.state.carouselIndex = 2;
          }

          // Re-render
          const modalContent = this.querySelector('.wd-discovery-modal__content');
          if (modalContent) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.render();
            const newContent = tempDiv.querySelector('.wd-discovery-modal__content');

            if (newContent) {
              modalContent.innerHTML = newContent.innerHTML;
              this.afterRender();
            }
          }
        });
      }

      // Navigation par clic sur n'importe quelle card
      this.querySelectorAll('.wd-discovery-modal__option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const clickedIndex = parseInt(option.dataset.index);
          const value = option.dataset.value;
          console.log('Card clicked! Index:', clickedIndex, 'Value:', value, 'Step:', this.state.currentStep);
          console.log('DEBUG: About to check if step === 3, step is:', this.state.currentStep, 'type:', typeof this.state.currentStep);

          // Q3: Options à choix unique (yes/no) sans carousel
          if (this.state.currentStep === 3) {
            console.log('Q3 option clicked:', value);
            // Retirer la sélection de toutes les options
            this.querySelectorAll('.wd-discovery-modal__option').forEach(opt => {
              opt.classList.remove('is-selected');
            });

            // Sélectionner l'option cliquée
            this.state.destinationIdea = value;
            option.classList.add('is-selected');

            // Activer le bouton Continue
            const continueBtn = this.querySelector('.wd-discovery-modal__continue');
            if (continueBtn) {
              continueBtn.classList.add('is-active');
            }
            return;
          }

          // Q2 et Q3.3: Multi-sélection carousel (clic sur carte active = toggle, autre = navigation)
          if (this.state.currentStep === 2 || this.state.currentStep === 3.3) {
            if (clickedIndex === this.state.carouselIndex) {
              // Clic sur carte active → toggle sélection
              console.log('Active card clicked, toggling selection');

              if (this.state.currentStep === 2) {
                const index = this.state.selectedTypes.indexOf(value);
                if (index > -1) {
                  // Déjà sélectionné → retirer
                  this.state.selectedTypes.splice(index, 1);
                  option.classList.remove('is-selected');
                } else {
                  // Pas sélectionné → ajouter
                  this.state.selectedTypes.push(value);
                  option.classList.add('is-selected');
                }
                console.log('Updated selectedTypes:', this.state.selectedTypes);

                // Mettre à jour le bouton Continue
                const continueBtn = this.querySelector('.wd-discovery-modal__continue');
                if (continueBtn) {
                  if (this.state.selectedTypes.length > 0) {
                    continueBtn.classList.add('is-active');
                    continueBtn.textContent = `Continuer (${this.state.selectedTypes.length})`;
                  } else {
                    continueBtn.classList.remove('is-active');
                    continueBtn.textContent = 'Continuer';
                  }
                }
              } else if (this.state.currentStep === 3.3) {
                const index = this.state.selectedRegions.indexOf(value);
                if (index > -1) {
                  // Déjà sélectionné → retirer
                  this.state.selectedRegions.splice(index, 1);
                  option.classList.remove('is-selected');
                } else {
                  // Pas sélectionné → ajouter
                  this.state.selectedRegions.push(value);
                  option.classList.add('is-selected');
                }
                console.log('Updated selectedRegions:', this.state.selectedRegions);

                // Mettre à jour le bouton Continue
                const continueBtn = this.querySelector('.wd-discovery-modal__continue');
                if (continueBtn) {
                  if (this.state.selectedRegions.length > 0) {
                    continueBtn.classList.add('is-active');
                    continueBtn.textContent = `Continuer (${this.state.selectedRegions.length})`;
                  } else {
                    continueBtn.classList.remove('is-active');
                    continueBtn.textContent = 'Continuer';
                  }
                }
              }
            } else {
              // Clic sur carte non-active → navigation
              console.log('Not active card, navigating to:', clickedIndex);
              this.state.carouselIndex = clickedIndex;
              this.updateCarouselPosition();
            }
          }
          // Q1: Carousel avec sélection sur carte active (SINGLE SELECT)
          else if (this.state.currentStep === 1) {
            if (clickedIndex === this.state.carouselIndex) {
              console.log('Q1: Active card clicked, value:', value);
              // Retirer la sélection de toutes les cartes
              this.querySelectorAll('.wd-discovery-modal__option').forEach(opt => {
                opt.classList.remove('is-selected');
              });

              this.state.selectedWho = value;
              console.log('Set selectedWho to:', value);
              // Ajouter feedback visuel
              option.classList.add('is-selected');
              const continueBtn = this.querySelector('.wd-discovery-modal__continue');
              if (continueBtn) {
                continueBtn.classList.add('is-active');
              }
            } else {
              // Clic sur carte non-active → navigation
              console.log('Q1: Not active card, navigating to:', clickedIndex);
              this.state.carouselIndex = clickedIndex;
              this.updateCarouselPosition();
            }
          } else {
            // Navigation vers la carte cliquée (Q1)
            console.log('Not active card, navigating to:', clickedIndex);
            this.state.carouselIndex = clickedIndex;
            this.updateCarouselPosition();
          }
        });
      });

      // Swipe gesture support
      let touchStartX = 0;
      let touchEndX = 0;
      const optionsContainer = this.querySelector('.wd-discovery-modal__options');

      if (optionsContainer) {
        optionsContainer.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        });

        optionsContainer.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          this.handleSwipe();
        });

        // Navigation clavier (gauche/droite)
        // Nettoyer l'ancien listener avant d'en créer un nouveau
        if (this.keydownHandler) {
          document.removeEventListener('keydown', this.keydownHandler);
        }

        this.keydownHandler = (e) => {
          if (!this.isOpen) return;
          // Q1: 5 (qui), Q2: 5 (style), Q3: 5 (types) - tous ont carousel
          const totalOptions = this.state.currentStep === 1 ? 5 : (this.state.currentStep === 2 ? 5 : 5);

          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.state.carouselIndex = (this.state.carouselIndex - 1 + totalOptions) % totalOptions;
            this.updateCarouselPosition();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.state.carouselIndex = (this.state.carouselIndex + 1) % totalOptions;
            this.updateCarouselPosition();
          }
        };

        document.addEventListener('keydown', this.keydownHandler);

        // Navigation molette horizontale
        optionsContainer.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            // Q1: 5 (qui), Q2: 5 (style), Q3: 5 (types) - tous ont carousel
            const totalOptions = this.state.currentStep === 1 ? 5 : (this.state.currentStep === 2 ? 5 : 5);

            if (e.deltaX > 10) {
              // Molette vers la droite
              this.state.carouselIndex = (this.state.carouselIndex + 1) % totalOptions;
              this.updateCarouselPosition();
            } else if (e.deltaX < -10) {
              // Molette vers la gauche
              this.state.carouselIndex = (this.state.carouselIndex - 1 + totalOptions) % totalOptions;
              this.updateCarouselPosition();
            }
          }
        }, { passive: false });
      }

      // Handler global pour Q4 et Q5 (délégation au niveau du composant)
      if (!this._q4q5ListenerAttached) {
        console.log('🔧 Q4/Q5 event listener attached');
        this.addEventListener('click', (e) => {
          console.log('🖱️ Click in modal, target:', e.target.tagName, e.target.textContent?.substring(0, 20));

          // Q4: Toggle entre vue mois et vue années
          const toggleBtn = e.target.closest('[data-action="toggle-picker"]');
          if (toggleBtn && this.state.currentStep === 4) {
            this.state.showYearPicker = !this.state.showYearPicker;
            const modalContent = this.querySelector('.wd-discovery-modal__content');
            if (modalContent) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = this.render();
              const newContent = tempDiv.querySelector('.wd-discovery-modal__content');
              if (newContent) {
                modalContent.innerHTML = newContent.innerHTML;
                this.afterRender();
              }
            }
            return;
          }

          // Q4: Sélection année
          const yearBtn = e.target.closest('[data-year]');
          if (yearBtn && this.state.currentStep === 4) {
            const year = parseInt(yearBtn.dataset.year);
            this.state.selectedYear = year;
            this.state.showYearPicker = false;
            const modalContent = this.querySelector('.wd-discovery-modal__content');
            if (modalContent) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = this.render();
              const newContent = tempDiv.querySelector('.wd-discovery-modal__content');
              if (newContent) {
                modalContent.innerHTML = newContent.innerHTML;
                this.afterRender();
              }
            }
            return;
          }

          // Q4: Sélection mois
          const monthBtn = e.target.closest('[data-month]');
          if (monthBtn && this.state.currentStep === 4) {
            const monthValue = monthBtn.dataset.month;
            this.state.selectedMonth = monthValue;

            // Activer Continue si durée aussi sélectionnée
            const continueBtn = this.querySelector('.wd-discovery-modal__continue');
            if (continueBtn && this.state.selectedMonth && this.state.selectedDuration) {
              continueBtn.classList.add('is-active');
            }

            const modalContent = this.querySelector('.wd-discovery-modal__content');
            if (modalContent) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = this.render();
              const newContent = tempDiv.querySelector('.wd-discovery-modal__content');
              if (newContent) {
                modalContent.innerHTML = newContent.innerHTML;
                this.afterRender();
              }
            }
            return;
          }

          // Q4: sélection durée
          const durationBtn = e.target.closest('[data-type="duration"]');
          if (durationBtn && this.state.currentStep === 4) {
            const value = durationBtn.dataset.value;
            console.log('Duration button clicked:', value);

            this.querySelectorAll('[data-type="duration"]').forEach(b => b.classList.remove('is-selected'));
            durationBtn.classList.add('is-selected');
            this.state.selectedDuration = value;
            console.log('✅ Duration selected:', value);

            // Activer Continue
            const continueBtn = this.querySelector('.wd-discovery-modal__continue');
            console.log('State après clic:', { month: this.state.selectedMonth, duration: this.state.selectedDuration });

            if (continueBtn && this.state.selectedMonth && this.state.selectedDuration) {
              continueBtn.classList.add('is-active');
              console.log('✅ Continue activé');
            } else if (continueBtn) {
              continueBtn.classList.remove('is-active');
            }
          }

          // Q5: sélection services
          const q5Btn = e.target.closest('[data-type="service"]');
          if (q5Btn && this.state.currentStep === 5) {
            const value = q5Btn.dataset.value;

            if (this.state.selectedServices.includes(value)) {
              this.state.selectedServices = this.state.selectedServices.filter(s => s !== value);
              q5Btn.classList.remove('is-selected');
            } else {
              this.state.selectedServices.push(value);
              q5Btn.classList.add('is-selected');
            }

            const continueBtn = this.querySelector('.wd-discovery-modal__continue');
            if (continueBtn) {
              continueBtn.textContent = this.state.selectedServices.length > 0 
                ? `Continuer (${this.state.selectedServices.length})` 
                : 'Continuer';
            }
          }
        });
        
        this._q4q5ListenerAttached = true;
      }


    }

    // Mise à jour de la position du carousel sans recréer le HTML (pour animation fluide)
    updateCarouselPosition() {
      const options = this.querySelectorAll('.wd-discovery-modal__option');
      const dots = this.querySelectorAll('.wd-discovery-modal__carousel-dot');
      const totalOptions = options.length;
      const idx = this.state.carouselIndex;

      options.forEach((option, i) => {
        // Retirer toutes les classes de position
        option.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden-left', 'is-hidden-right', 'is-hidden-left-1', 'is-hidden-right-1');

        // Calcul circulaire de la distance avec modulo
        let diff = i - idx;
        // Normaliser la distance dans [-totalOptions/2, totalOptions/2]
        if (diff > totalOptions / 2) {
          diff -= totalOptions;
        } else if (diff < -totalOptions / 2) {
          diff += totalOptions;
        }

        if (diff === 0) {
          // Carte active au centre
          option.classList.add('is-active');
        } else if (diff === 1) {
          // Carte immédiatement à droite
          option.classList.add('is-next');
        } else if (diff === -1) {
          // Carte immédiatement à gauche
          option.classList.add('is-prev');
        } else if (diff === 2) {
          // Carte distance 2 à droite
          option.classList.add('is-hidden-right-1');
        } else if (diff === -2) {
          // Carte distance 2 à gauche
          option.classList.add('is-hidden-left-1');
        } else if (diff > 0) {
          // Toutes les autres cartes à droite
          option.classList.add('is-hidden-right');
        } else {
          // Toutes les autres cartes à gauche
          option.classList.add('is-hidden-left');
        }
      });

      // Mettre à jour les dots
      dots.forEach((dot, i) => {
        if (i === this.state.carouselIndex) {
          dot.classList.add('is-active');
        } else {
          dot.classList.remove('is-active');
        }
      });
    }

    handleSwipe() {
      const totalOptions = this.state.currentStep === 1 ? 5 : (this.state.currentStep === 2 ? 5 : 0);
      if (totalOptions === 0) return; // Q3 n'a pas de carousel
      if (touchEndX < touchStartX - 50) {
        // Swipe left
        this.state.carouselIndex = (this.state.carouselIndex + 1) % totalOptions;
        this.updateCarouselPosition();
      }
      if (touchEndX > touchStartX + 50) {
        // Swipe right
        this.state.carouselIndex = (this.state.carouselIndex - 1 + totalOptions) % totalOptions;
        this.updateCarouselPosition();
      }
    }

    updateContinueButton() {
      if (this.state.currentStep !== 1.5) return;

      const continueBtn = this.querySelector('.wd-discovery-modal__continue');
      if (!continueBtn) return;

      const isFamilyMode = this.state.selectedWho === 'family';
      let isValid = false;

      if (isFamilyMode) {
        // Mode famille : vérifier que adultsCount >= 1, childrenCount > 0 et qu'on a tous les âges
        const adultsCount = this.state.familyDetails.adultsCount;
        const childrenCount = this.state.familyDetails.childrenCount;
        if (adultsCount && adultsCount >= 1 && childrenCount && childrenCount > 0) {
          const ages = this.state.familyDetails.childrenAges;
          // Tous les âges doivent être renseignés (entre 0 et 17)
          isValid = ages.length === childrenCount && ages.every(age => typeof age === 'number' && age >= 0 && age <= 17);
        }
      } else {
        // Mode amis : vérifier que adultsCount >= 2
        const count = this.state.friendsDetails.adultsCount;
        isValid = count && count >= 2;
      }

      if (isValid) {
        continueBtn.classList.add('is-active');
      } else {
        continueBtn.classList.remove('is-active');
      }
    }

    getNextStep(currentStep, state) {
      // Flux business divergent
      if (state.selectedWho === 'business') {
        switch (currentStep) {
          case 1:
            return 2;
          case 2:
            return 'business-location';
          case 'business-location':
            return 'business-dates';
          case 'business-dates':
            return 6;
          case 6:
            return 'results';
          default:
            return currentStep;
        }
      }

      // Flux standard pour solo/couple/family/friends
      switch (currentStep) {
        case 1:
          // Q1 → Q1.5 si family/friends, sinon Q2
          if (state.selectedWho === 'family' || state.selectedWho === 'friends') {
            return 1.5;
          }
          return 2;

        case 1.5:
          // Q1.5 → Q2
          return 2;

        case 2:
          // Q2 → Q3
          return 3;

        case 3:
          // Q3 → Q3.1 si "yes", Q3.2 si "no", Q3.3 si "multiple"
          if (state.destinationIdea === 'yes') {
            return 3.1;
          } else if (state.destinationIdea === 'no') {
            return 3.2;
          } else if (state.destinationIdea === 'multiple') {
            return 3.3;
          }
          return 3;

        case 3.1:
          // Q3.1 → Q4
          return 4;

        case 3.2:
          // Q3.2 → Q3.3
          return 3.3;

        case 3.3:
          // Q3.3 → Q4
          return 4;

        case 4:
          // Q4 → Q5
          return 5;

        case 5:
          // Q5 → Q6
          return 6;

        case 6:
          // Q6 → Résultats
          return 'results';

        default:
          return currentStep;
      }
    }

    restart() {
      this.state = {
        currentStep: 1,
        stepHistory: [],
        carouselIndex: 2,
        selectedWho: null,
        selectedYear: new Date().getFullYear(),
        showYearPicker: false,
        familyDetails: { adultsCount: null, childrenCount: null, childrenAges: [] },
        friendsDetails: { adultsCount: null },
        selectedTypes: [],
        destinationIdea: null,
        destinationInput: '',
        selectedRegions: [],
        selectedRegion: null,
        selectedMonth: null,
        selectedDuration: null,
        selectedServices: [],
        businessLocation: null,
        checkInDate: null,
        checkOutDate: null,
        results: []
      };
      const modalContent = this.querySelector('.wd-discovery-modal__content');
      if (modalContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.render();
        const newContent = tempDiv.querySelector('.wd-discovery-modal__content');
        if (newContent) {
          modalContent.innerHTML = newContent.innerHTML;
          this.afterRender();
        }
      }
    }

    open() {
      this.isOpen = true;
      this.modal.classList.add('wd-discovery-modal--active');
      document.body.style.overflow = 'hidden';
    }

    close() {
      console.log('=== CLOSE() CALLED ===');
      console.trace();
      this.isOpen = false;
      this.modal.classList.remove('wd-discovery-modal--active');
      document.body.style.overflow = '';

      // Nettoyer le listener clavier
      if (this.keydownHandler) {
        document.removeEventListener('keydown', this.keydownHandler);
        this.keydownHandler = null;
      }

      this.state = {
        currentStep: 1,
        selectedWho: null,
        selectedTravelStyles: [],
        selectedTypes: [],
        familyDetails: { childrenCount: null, childrenAges: [] },
        friendsDetails: { adultsCount: null },
        destinationIdea: null,
        destinationInput: '',
        selectedRegions: [],
        carouselIndex: 0
      };
    }
  });

  // Liens placeholder (href="#") : cliquables mais ne sautent pas en haut de page.
  // N'affecte pas les ancres de section (href="#id") ni les liens tel:.
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

})();
