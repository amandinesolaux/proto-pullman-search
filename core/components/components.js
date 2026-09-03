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
  /* Profil de l'utilisateur connecté — source unique partagée (header, wizard, booking) */
  const WD_USER_PROFILE = {
    firstName: 'Lisa',
    lastName: 'Draper',
    fullName: 'Lisa Draper',
    loyaltyStatus: 'Gold',
    loyaltyPoints: 2450,
    // Visuels de destination évocateurs (et non des photos d'hôtel) : c'est le lieu qui donne envie
    wishlist: [
      { name: 'Bangkok', country: 'Thaïlande', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&h=225&fit=crop' }, // Grand Palais
      { name: 'Bali', country: 'Indonésie', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=225&fit=crop' },   // Tanah Lot au coucher du soleil
      { name: 'Tokyo', country: 'Japon', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop' }        // ruelle néon
    ],
    familyMembers: [
      { firstName: 'Léo', age: 6 },
      { firstName: 'Emma', age: 3 }
    ],
    pastStays: [
      { hotel: 'Pullman Paris Montparnasse', location: 'Paris, France', date: '2025-03' },
      { hotel: 'Pullman Bali Legian Beach', location: 'Bali, Indonésie', date: '2024-08' }
    ]
  };

  def("wd-header", class extends WdEl {
    constructor() {
      super();
      this.isLoggedIn = false;
      this._accountOutside = null;
    }

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
                <button class="wd-header__booking-tab" data-tab="restaurants">Restaurants</button>
                <button class="wd-header__booking-tab" data-tab="reunions">Réunions</button>
                <button class="wd-header__booking-tab" data-tab="celebrations">Célébrations</button>
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
              <div class="wd-header__account-wrap">
                <button type="button" class="wd-header__account${this.isLoggedIn ? ' wd-header__account--logged' : ''}" aria-haspopup="true" aria-expanded="false" aria-label="Compte">
                  ${this.isLoggedIn
                    ? `<span class="wd-header__avatar">${ICON.person}<span class="wd-header__avatar-dot"></span></span><span class="wd-header__account-label">${WD_USER_PROFILE.fullName}</span>`
                    : `${ICON.person} <span class="wd-header__account-label">Me connecter / m'inscrire</span>`}
                </button>
                ${this._renderAccountMenu()}
              </div>
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

    _renderAccountMenu() {
      const links = `
        <nav class="wd-account__links">
          <a href="#" class="wd-account__link">Vos réservations</a>
          <hr class="wd-account__sep"/>
          <a href="#" class="wd-account__link">Avantages et statut</a>
          <a href="#" class="wd-account__link">Gagner et utiliser des points</a>
          <hr class="wd-account__sep"/>
          <a href="#" class="wd-account__link">Aide et support</a>
        </nav>`;

      const body = this.isLoggedIn
        ? `
          <p class="wd-account__greeting">Bonjour ${WD_USER_PROFILE.firstName} 👋</p>
          <p class="wd-account__greeting-sub">Ravi de vous revoir.</p>
          ${links}`
        : `
          <div class="wd-account-card">
            <div class="wd-account-card__head">
              <span class="wd-account-card__logo">All</span>
              <span class="wd-account-card__title">Le programme de fidélité</span>
            </div>
            <p class="wd-account-card__desc">Économisez dès votre première réservation grâce au tarif membre.</p>
            <button type="button" class="wd-account-card__cta" data-account-action="register">M'inscrire gratuitement ${ICON.arrowR}</button>
          </div>
          <button type="button" class="wd-account__login" data-account-action="login">Me connecter ${ICON.arrowR}</button>
          ${links}`;

      return `
        <div class="wd-header__account-menu" role="dialog" aria-label="Mon compte" hidden>
          <button type="button" class="wd-header__account-menu-close" data-account-action="close" aria-label="Fermer">${ICON.close}</button>
          ${body}
        </div>`;
    }

    afterRender() {
      const wrap = this.querySelector('.wd-header__account-wrap');
      if (!wrap) return;
      const btn = wrap.querySelector('.wd-header__account');
      const menu = wrap.querySelector('.wd-header__account-menu');

      const openMenu = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
      const closeMenu = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.hidden ? openMenu() : closeMenu();
      });

      menu.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = e.target.closest('[data-account-action]');
        if (!action) return;
        const type = action.dataset.accountAction;
        if (type === 'close') { closeMenu(); }
        else if (type === 'login') {
          this.isLoggedIn = true;
          this._rerenderHeader(); // reflète l'état connecté (pill + menu)
        }
        // 'register' : placeholder (aucune action dans le prototype)
      });

      // Fermeture au clic extérieur / Échap
      this._accountOutside && document.removeEventListener('click', this._accountOutside);
      this._accountOutside = (e) => {
        if (menu.hidden) return;
        if (!this.contains(e.target)) closeMenu();
        else if (!e.target.closest('.wd-header__account-wrap')) closeMenu();
      };
      document.addEventListener('click', this._accountOutside);

      this._accountKeydown && document.removeEventListener('keydown', this._accountKeydown);
      this._accountKeydown = (e) => { if (e.key === 'Escape' && !menu.hidden) closeMenu(); };
      document.addEventListener('keydown', this._accountKeydown);
    }

    _rerenderHeader() {
      this.innerHTML = this.render();
      this.afterRender();
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

  // MOCK_HOTELS supprimé : ses 4 hôtels existaient déjà dans PREVIEW_HOTELS, si bien que
  // l'autocomplétion comptait Paris, Dubaï et Singapour deux fois (5 hôtels à Paris au
  // lieu de 3). Aucun autre code ne s'en servait.

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
    // ═══════════════════ AFRICA ═══════════════════
    { name:"Pullman Dakar Teranga", loc:"Dakar, Sénégal", stars:5, price:155, features:"Front de mer · Piscine · Terrasse panoramique", tags:["beach","culture","business"], services:["pool","spa","gym","restaurant","bar","terrace","meeting-room","concierge","wifi","room-service","parking","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/dakar/0921.html" },
    { name:"Pullman Abidjan", loc:"Abidjan, Côte d'Ivoire", stars:5, price:165, features:"Lagune Ébrié · Piscine · Restaurant africain", tags:["business","culture","gastro"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","shuttle","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/abidjan/1146.html" },
    { name:"Pullman Mazagan Royal Golf & Spa", loc:"El Jadida, Maroc", stars:5, price:195, features:"Golf · Plage · Spa · Casino", tags:["beach","wellness","romance","family","luxury"], services:["pool","spa","gym","restaurant","fine_dining","bar","golf","kids-club","garden","concierge","wifi","room-service","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Marrakech Palmeraie", loc:"Marrakech, Maroc", stars:5, price:179, features:"Golf · Piscine · Spa · Jardins", tags:["wellness","romance","luxury","meeting"], services:["spa","pool","gym","restaurant","fine_dining","bar","golf","meeting-room","concierge","valet","wifi","room-service","kids-club","terrace","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Kinshasa Grand Hôtel", loc:"Kinshasa, RD Congo", stars:5, price:185, features:"Centre-ville · Piscine · Business center", tags:["business","meeting","culture"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lubumbashi Grand Karavia", loc:"Lubumbashi, RD Congo", stars:5, price:175, features:"Lac Kipopo · Piscine · Restaurant", tags:["business","meeting"], services:["pool","gym","restaurant","bar","meeting-room","business-center","parking","wifi","room-service","laundry","shuttle","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Nairobi Upper Hill", loc:"Nairobi, Kenya", stars:5, price:159, features:"Upper Hill · Piscine · Spa · Restaurant", tags:["business","culture","wellness"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","shuttle","laundry","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Cape Town", loc:"Le Cap, Afrique du Sud", stars:5, price:189, features:"Waterfront · Piscine · Restaurant · Vue mer", tags:["luxury","culture","gastro","romance"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","concierge","wifi","room-service","parking","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/cape-town/6556.html" },
    // ═══════════════════ AMERICAS ═══════════════════
    { name:"Pullman Miami Airport", loc:"Miami, États-Unis", stars:4, price:199, features:"Aéroport · Piscine · Bar lounge", tags:["business","beach","family"], services:["pool","gym","restaurant","bar","meeting-room","business-center","parking","wifi","room-service","shuttle","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman São Paulo Vila Olímpia", loc:"São Paulo, Brésil", stars:5, price:149, features:"Vila Olímpia · Rooftop · Restaurant", tags:["business","gastro","culture"], services:["pool","gym","restaurant","bar","rooftop","meeting-room","business-center","concierge","wifi","room-service","laundry","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman São Paulo Ibirapuera", loc:"São Paulo, Brésil", stars:5, price:139, features:"Parc Ibirapuera · Piscine · Spa", tags:["wellness","culture","family"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","concierge","wifi","room-service","parking","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman São Paulo Guarulhos Airport", loc:"Guarulhos, Brésil", stars:4, price:119, features:"Aéroport · Business center · Restaurant", tags:["business","meeting"], services:["gym","restaurant","bar","meeting-room","business-center","wifi","room-service","shuttle","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman RJ São Conrado", loc:"Rio de Janeiro, Brésil", stars:5, price:169, features:"São Conrado · Plage · Piscine · Vue mer", tags:["beach","romance","culture"], services:["pool","spa","gym","restaurant","bar","terrace","concierge","wifi","room-service","parking","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Rosario City Center", loc:"Rosario, Argentine", stars:5, price:129, features:"Centre-ville · Piscine · Restaurant", tags:["business","culture","gastro"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Santiago El Bosque", loc:"Santiago, Chili", stars:5, price:159, features:"El Bosque · Piscine · Restaurant · Spa", tags:["business","luxury","gastro"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Santiago Vitacura", loc:"Santiago, Chili", stars:5, price:149, features:"Vitacura · Piscine · Fitness · Restaurant", tags:["business","culture"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Viña del Mar San Martín", loc:"Viña del Mar, Chili", stars:5, price:169, features:"Front de mer · Casino · Piscine · Restaurant", tags:["beach","romance","gastro","luxury"], services:["pool","spa","gym","restaurant","bar","terrace","concierge","wifi","room-service","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lima San Isidro", loc:"Lima, Pérou", stars:5, price:159, features:"San Isidro · Restaurant · Piscine · Spa", tags:["business","gastro","luxury"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lima Miraflores", loc:"Lima, Pérou", stars:5, price:149, features:"Miraflores · Vue océan · Restaurant", tags:["culture","romance","gastro"], services:["pool","gym","restaurant","bar","terrace","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ EUROPE — FRANCE ═══════════════════
    { name:"Pullman Paris Montparnasse", loc:"Paris, France", stars:4, price:189, features:"Rooftop bar · Spa · Restaurant gastronomique", tags:["business","culture","gastro"], services:["pool","gym","restaurant","bar","meeting-room","parking","wifi","room-service","concierge","laundry","ev-charging"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/paris/8189.html" },
    { name:"Pullman Paris Tour Eiffel", loc:"Paris, France", stars:5, price:259, features:"Vue Tour Eiffel · Spa · Restaurant", tags:["romance","luxury","culture"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","room-service","concierge","valet","wifi","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/paris/7229.html" },
    { name:"Pullman Paris Centre - Bercy", loc:"Paris, France", stars:4, price:175, features:"AccorArena · Piscine · Business center", tags:["business","meeting"], services:["meeting-room","business-center","gym","restaurant","bar","parking","wifi","room-service","laundry","ev-charging","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/paris/2192.html" },
    { name:"Pullman Paris La Défense", loc:"Paris La Défense, France", stars:5, price:219, features:"La Défense · Restaurant · Bar panoramique", tags:["business","luxury","meeting"], services:["gym","restaurant","fine_dining","bar","rooftop","meeting-room","business-center","concierge","wifi","room-service","laundry","valet","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/paris-la-defense/0576.html" },
    { name:"Pullman Lyon Part-Dieu", loc:"Lyon, France", stars:4, price:159, features:"Gare Part-Dieu · Restaurant · Fitness", tags:["business","gastro"], services:["restaurant","bar","meeting-room","business-center","gym","parking","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280", url:"https://pullman.accor.com/fr/hotels/lyon/C177.html" },
    { name:"Pullman Marseille Provence", loc:"Marseille, France", stars:4, price:145, features:"Aéroport · Piscine extérieure · Restaurant", tags:["beach","gastro","family"], services:["pool","spa","restaurant","bar","terrace","kids-club","parking","wifi","room-service","shuttle","bike-rental","gym"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Nice Côte d'Azur", loc:"Nice, France", stars:4, price:185, features:"Promenade des Anglais · Piscine · Spa", tags:["beach","wellness","romance"], services:["pool","spa","gym","restaurant","bar","terrace","parking","wifi","room-service","concierge","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bordeaux Lac", loc:"Bordeaux, France", stars:4, price:155, features:"Parc des expositions · Restaurant · Bar", tags:["gastro","culture","eco"], services:["restaurant","bar","terrace","meeting-room","parking","wifi","room-service","bike-rental","ev-charging","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Toulouse Airport", loc:"Toulouse, France", stars:4, price:139, features:"Aéroport · Piscine · Restaurant · Terrasse", tags:["business","meeting"], services:["pool","gym","restaurant","bar","terrace","meeting-room","business-center","parking","wifi","room-service","shuttle","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Cannes Mandelieu", loc:"Cannes, France", stars:4, price:175, features:"Royal Casino · Golf · Piscine · Spa", tags:["luxury","romance","wellness","gastro"], services:["pool","spa","gym","restaurant","bar","golf","terrace","meeting-room","parking","wifi","room-service","concierge","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Montpellier Centre", loc:"Montpellier, France", stars:4, price:149, features:"Centre historique · Restaurant · Bar", tags:["culture","gastro","business"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ EUROPE — OTHER ═══════════════════
    { name:"Pullman London St Pancras", loc:"Londres, Royaume-Uni", stars:5, price:289, features:"King's Cross · Restaurant · Bar cocktails", tags:["business","culture","luxury"], services:["gym","restaurant","bar","meeting-room","business-center","concierge","valet","wifi","room-service","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Liverpool", loc:"Liverpool, Royaume-Uni", stars:4, price:179, features:"Kings Dock · Restaurant · Bar · Vue port", tags:["culture","business","gastro"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Berlin Schweizerhof", loc:"Berlin, Allemagne", stars:5, price:199, features:"Ku'damm · Spa · Restaurant · Bar", tags:["culture","luxury","business"], services:["spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","pet-friendly","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Cologne", loc:"Cologne, Allemagne", stars:4, price:169, features:"Cathédrale · Restaurant · Bar · Fitness", tags:["culture","business","gastro"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Munich", loc:"Munich, Allemagne", stars:4, price:189, features:"Centre-ville · Restaurant · Spa · Fitness", tags:["business","culture","luxury"], services:["spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","parking","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Stuttgart Fontana", loc:"Stuttgart, Allemagne", stars:4, price:169, features:"Centre-ville · Restaurant · Bar · Fitness", tags:["business","meeting"], services:["gym","restaurant","bar","meeting-room","business-center","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Barcelona Skipper", loc:"Barcelone, Espagne", stars:5, price:219, features:"Front de mer · Piscine · Rooftop", tags:["beach","gastro","romance"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","terrace","wifi","room-service","concierge","bike-rental","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Brussels Centre Midi", loc:"Bruxelles, Belgique", stars:4, price:159, features:"Gare du Midi · Restaurant · Bar", tags:["business","culture"], services:["gym","restaurant","bar","meeting-room","business-center","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Eindhoven Cocagne", loc:"Eindhoven, Pays-Bas", stars:4, price:159, features:"Centre-ville · Design · Restaurant · Bar", tags:["business","culture"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Budapest", loc:"Budapest, Hongrie", stars:5, price:169, features:"Opéra · Restaurant · Spa · Fitness", tags:["culture","luxury","romance"], services:["spa","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bucharest World Trade Center", loc:"Bucarest, Roumanie", stars:5, price:139, features:"WTC · Piscine · Restaurant · Spa", tags:["business","meeting","culture"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Riga Old Town", loc:"Riga, Lettonie", stars:5, price:149, features:"Vieille ville · Restaurant · Bar · Spa", tags:["culture","luxury","romance"], services:["spa","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Zagreb", loc:"Zagreb, Croatie", stars:5, price:149, features:"Centre-ville · Spa · Restaurant · Fitness", tags:["culture","business","wellness"], services:["spa","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Tbilisi", loc:"Tbilissi, Géorgie", stars:5, price:129, features:"Centre-ville · Piscine · Spa · Restaurant", tags:["culture","luxury","wellness"], services:["pool","spa","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Istanbul", loc:"Istanbul, Turquie", stars:5, price:159, features:"Bosphore · Piscine · Spa · Restaurant", tags:["culture","luxury","gastro","romance"], services:["pool","spa","gym","restaurant","fine_dining","bar","meeting-room","concierge","wifi","room-service","parking","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Basel Europe", loc:"Bâle, Suisse", stars:5, price:229, features:"Centre-ville · Restaurant · Bar · Fitness", tags:["business","luxury","culture"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Gorni Okol", loc:"Gorni Okol, Bulgarie", stars:5, price:119, features:"Montagne · Spa · Piscine · Nature", tags:["wellness","eco","family"], services:["pool","spa","gym","restaurant","bar","garden","kids-club","wifi","room-service","parking","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ MIDDLE EAST ═══════════════════
    { name:"Pullman Dubai Creek City Centre", loc:"Dubaï, EAU", stars:5, price:199, features:"Creek views · Piscine · Spa · Restaurant", tags:["luxury","business","family"], services:["pool","spa","gym","restaurant","bar","rooftop","meeting-room","business-center","kids-club","concierge","valet","wifi","room-service","shuttle","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/6556-1:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Dubai Downtown", loc:"Dubaï, EAU", stars:5, price:219, features:"Burj Khalifa · Piscine · Spa", tags:["luxury","romance","family"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","kids-club","concierge","valet","wifi","room-service","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Dubai JLT", loc:"Dubaï, EAU", stars:5, price:179, features:"JLT · Piscine · Restaurant · Fitness", tags:["business","meeting"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Sharjah", loc:"Sharjah, EAU", stars:4, price:139, features:"Centre-ville · Piscine · Restaurant", tags:["business","family"], services:["pool","gym","restaurant","bar","meeting-room","kids-club","wifi","room-service","parking","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Resort Al Marjan Island", loc:"Ras Al Khaimah, EAU", stars:5, price:249, features:"Plage privée · Piscine · Spa · Golf", tags:["beach","luxury","wellness","family","romance"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","golf","kids-club","garden","concierge","wifi","room-service","parking","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman ZamZam Makkah", loc:"La Mecque, Arabie Saoudite", stars:5, price:299, features:"Mosquée Al-Haram · Restaurant · Vue", tags:["luxury","culture"], services:["restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","valet","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman ZamZam Madinah", loc:"Médine, Arabie Saoudite", stars:5, price:249, features:"Mosquée du Prophète · Restaurant · Vue", tags:["luxury","culture"], services:["restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","valet","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Doha West Bay", loc:"Doha, Qatar", stars:5, price:209, features:"West Bay · Piscine · Spa · Restaurant", tags:["luxury","business","meeting"], services:["pool","spa","gym","restaurant","fine_dining","bar","rooftop","meeting-room","business-center","concierge","valet","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ ASIA — THAILAND ═══════════════════
    { name:"Pullman Bangkok Hotel G", loc:"Bangkok, Thaïlande", stars:5, price:139, features:"Silom · Rooftop pool · Sky bar", tags:["culture","gastro","family"], services:["pool","spa","gym","restaurant","bar","rooftop","kids-club","concierge","wifi","room-service","shuttle","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bangkok King Power", loc:"Bangkok, Thaïlande", stars:5, price:149, features:"King Power · Piscine · Spa · Restaurant", tags:["business","luxury","culture"], services:["pool","spa","gym","restaurant","fine_dining","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Pattaya Hotel G", loc:"Pattaya, Thaïlande", stars:5, price:119, features:"Plage · Piscine · Restaurant · Bar", tags:["beach","family","gastro"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","concierge","wifi","room-service","shuttle","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Khao Lak Resort", loc:"Phang Nga, Thaïlande", stars:5, price:159, features:"Plage privée · Piscine · Spa · Nature", tags:["beach","wellness","romance","family","eco"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","garden","concierge","wifi","room-service","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Phuket Arcadia Naithon Beach", loc:"Phuket, Thaïlande", stars:5, price:179, features:"Naithon Beach · Piscine · Spa · Villas", tags:["beach","luxury","wellness","romance"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","garden","concierge","wifi","room-service","shuttle","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Phuket Panwa Beach Resort", loc:"Phuket, Thaïlande", stars:5, price:189, features:"Cape Panwa · Piscine à débordement · Spa", tags:["beach","luxury","romance","wellness"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","garden","kids-club","concierge","wifi","room-service","shuttle","yoga","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Phuket Karon Beach Resort", loc:"Phuket, Thaïlande", stars:5, price:169, features:"Karon Beach · Piscine · Restaurant · Spa", tags:["beach","family","wellness"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","garden","concierge","wifi","room-service","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Khon Kaen Raja Orchid", loc:"Khon Kaen, Thaïlande", stars:5, price:99, features:"Centre-ville · Piscine · Restaurant", tags:["business","culture"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ ASIA — INDONESIA ═══════════════════
    { name:"Pullman Bali Legian Beach", loc:"Bali, Indonésie", stars:5, price:159, features:"Plage privée · Piscine · Spa balinais", tags:["beach","wellness","romance","family"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","garden","concierge","wifi","room-service","shuttle","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lombok Merujani Mandalika", loc:"Lombok, Indonésie", stars:5, price:149, features:"Mandalika · Plage · Piscine · Resort", tags:["beach","wellness","romance","eco"], services:["pool","spa","gym","restaurant","bar","terrace","garden","concierge","wifi","room-service","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Jakarta Indonesia Thamrin", loc:"Jakarta, Indonésie", stars:5, price:119, features:"Thamrin · Piscine · Spa · Restaurant", tags:["business","luxury","culture"], services:["pool","spa","gym","restaurant","fine_dining","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Jakarta Central Park", loc:"Jakarta, Indonésie", stars:5, price:109, features:"Central Park · Piscine · Restaurant", tags:["business","meeting","culture"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bandung Grand Central", loc:"Bandung, Indonésie", stars:5, price:99, features:"Centre-ville · Restaurant · Piscine", tags:["business","culture","gastro"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Ciawi Vimala Hills", loc:"Bogor, Indonésie", stars:5, price:129, features:"Collines · Piscine · Spa · Nature", tags:["wellness","eco","family"], services:["pool","spa","gym","restaurant","bar","garden","kids-club","meeting-room","wifi","room-service","parking","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ ASIA — VIETNAM ═══════════════════
    { name:"Pullman Hanoi", loc:"Hanoï, Vietnam", stars:5, price:119, features:"West Lake · Piscine · Spa · Restaurant", tags:["culture","luxury","gastro"], services:["pool","spa","gym","restaurant","fine_dining","bar","meeting-room","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Saigon Centre", loc:"Hô Chi Minh-Ville, Vietnam", stars:5, price:109, features:"District 1 · Piscine · Rooftop · Restaurant", tags:["business","culture","gastro"], services:["pool","gym","restaurant","bar","rooftop","meeting-room","business-center","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Danang Beach Resort", loc:"Danang, Vietnam", stars:5, price:139, features:"Plage · Piscine · Spa · Resort", tags:["beach","wellness","family","romance"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","garden","concierge","wifi","room-service","shuttle","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Hai Phong", loc:"Hai Phong, Vietnam", stars:5, price:99, features:"Centre-ville · Restaurant · Piscine", tags:["business","culture"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Phu Quoc Beach Resort", loc:"Phu Quoc, Vietnam", stars:5, price:159, features:"Plage privée · Piscine · Spa · Villas", tags:["beach","luxury","wellness","romance","family"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","kids-club","garden","concierge","wifi","room-service","shuttle","yoga","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Vung Tau", loc:"Vung Tau, Vietnam", stars:5, price:119, features:"Plage · Piscine · Restaurant · Bar", tags:["beach","family","gastro"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","concierge","wifi","room-service","parking","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ ASIA — OTHER ═══════════════════
    { name:"Pullman Singapore Orchard", loc:"Singapour", stars:5, price:229, features:"Orchard Road · Piscine · Fitness 24h", tags:["business","luxury","culture"], services:["pool","spa","gym","restaurant","bar","rooftop","meeting-room","business-center","concierge","valet","wifi","room-service","laundry","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Singapore Hill Street", loc:"Singapour", stars:5, price:219, features:"Hill Street · Restaurant · Bar · Spa", tags:["culture","luxury","business"], services:["spa","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Tokyo Tamachi", loc:"Tokyo, Japon", stars:5, price:249, features:"Shinagawa · Restaurant japonais · Fitness", tags:["business","culture","luxury"], services:["gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","coworking"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"The Ambassador Seoul - A Pullman Hotel", loc:"Séoul, Corée du Sud", stars:5, price:189, features:"Insadong · Restaurant · Spa · Résidences", tags:["culture","luxury","business"], services:["spa","gym","restaurant","fine_dining","bar","meeting-room","concierge","wifi","room-service","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Kuala Lumpur City Centre", loc:"Kuala Lumpur, Malaisie", stars:5, price:129, features:"KLCC · Piscine · Spa · Restaurant", tags:["business","luxury","culture"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Kuching", loc:"Kuching, Malaisie", stars:5, price:99, features:"Waterfront · Piscine · Restaurant", tags:["culture","business","eco"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Miri Waterfront", loc:"Miri, Malaisie", stars:5, price:89, features:"Waterfront · Piscine · Restaurant", tags:["business","culture"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman New Delhi Aerocity", loc:"New Delhi, Inde", stars:5, price:129, features:"Aéroport · Piscine · Spa ayurvédique", tags:["business","wellness","culture"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","shuttle","laundry","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Chennai Anna Salai", loc:"Chennai, Inde", stars:5, price:109, features:"Anna Salai · Piscine · Spa · Restaurant", tags:["business","culture","wellness"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Maldives Maamutaa", loc:"Maldives", stars:5, price:599, features:"Villas sur pilotis · Spa · All inclusive", tags:["beach","luxury","romance","wellness"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","garden","concierge","wifi","room-service","yoga","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Luang Prabang", loc:"Luang Prabang, Laos", stars:5, price:179, features:"UNESCO · Piscine · Spa · Nature", tags:["culture","wellness","romance","eco"], services:["pool","spa","gym","restaurant","bar","garden","concierge","wifi","room-service","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Yangon", loc:"Yangon, Myanmar", stars:5, price:109, features:"Centre-ville · Piscine · Spa · Restaurant", tags:["culture","business","luxury"], services:["pool","spa","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ ASIA — CHINA ═══════════════════
    { name:"Pullman Shanghai South", loc:"Shanghai, Chine", stars:5, price:139, features:"Xujiahui · Piscine · Restaurant · Spa", tags:["business","luxury","culture"], services:["pool","spa","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Shanghai Jing'an", loc:"Shanghai, Chine", stars:5, price:149, features:"Jing'an · Restaurant · Bar · Piscine", tags:["business","luxury","gastro"], services:["pool","spa","gym","restaurant","fine_dining","bar","meeting-room","concierge","wifi","room-service","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Beijing South", loc:"Pékin, Chine", stars:5, price:129, features:"Sud de Pékin · Piscine · Restaurant", tags:["business","culture","meeting"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry","shuttle","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Guangzhou Baiyun Airport", loc:"Guangzhou, Chine", stars:5, price:119, features:"Aéroport · Piscine · Restaurant", tags:["business","meeting"], services:["pool","gym","restaurant","bar","meeting-room","business-center","wifi","room-service","shuttle","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Sanya Yalong Bay", loc:"Sanya, Chine", stars:5, price:199, features:"Yalong Bay · Plage · Piscine · Spa", tags:["beach","luxury","romance","family","wellness"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","kids-club","garden","concierge","wifi","room-service","shuttle","yoga","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Oceanview Sanya Bay", loc:"Sanya, Chine", stars:5, price:179, features:"Sanya Bay · Vue océan · Piscine · Spa", tags:["beach","family","wellness","romance"], services:["pool","spa","gym","restaurant","bar","terrace","kids-club","concierge","wifi","room-service","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Lijiang Resort & Spa", loc:"Lijiang, Chine", stars:5, price:169, features:"Vieille ville · Spa · Piscine · Montagne", tags:["culture","wellness","romance","eco"], services:["pool","spa","gym","restaurant","bar","garden","concierge","wifi","room-service","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Zhangjiajie", loc:"Zhangjiajie, Chine", stars:5, price:139, features:"Avatar Mountains · Piscine · Spa · Nature", tags:["eco","culture","wellness"], services:["pool","spa","gym","restaurant","bar","garden","concierge","wifi","room-service","parking","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"The Park Lane Hong Kong", loc:"Hong Kong, Chine", stars:5, price:259, features:"Causeway Bay · Victoria Park · Restaurant", tags:["luxury","culture","business","gastro"], services:["gym","restaurant","fine_dining","bar","meeting-room","concierge","wifi","room-service","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Resort Xishuangbanna", loc:"Xishuangbanna, Chine", stars:5, price:149, features:"Forêt tropicale · Piscine · Spa · Nature", tags:["eco","wellness","family","culture"], services:["pool","spa","gym","restaurant","bar","garden","kids-club","concierge","wifi","room-service","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Haikou", loc:"Haikou, Chine", stars:5, price:129, features:"Centre-ville · Piscine · Restaurant", tags:["business","culture","beach"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Nanjing Lukou Airport", loc:"Nanjing, Chine", stars:5, price:109, features:"Aéroport · Piscine · Restaurant", tags:["business","meeting"], services:["pool","gym","restaurant","bar","meeting-room","business-center","wifi","room-service","shuttle","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Dali Resort", loc:"Dali, Chine", stars:5, price:159, features:"Lac Erhai · Montagne · Spa · Piscine", tags:["eco","wellness","romance","culture"], services:["pool","spa","gym","restaurant","bar","garden","concierge","wifi","room-service","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    // ═══════════════════ OCEANIA ═══════════════════
    { name:"Pullman Melbourne Albert Park", loc:"Melbourne, Australie", stars:5, price:209, features:"Albert Park · Piscine · Restaurant", tags:["culture","gastro","wellness"], services:["pool","spa","gym","restaurant","bar","terrace","meeting-room","concierge","wifi","room-service","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Melbourne City Centre", loc:"Melbourne, Australie", stars:5, price:199, features:"Centre-ville · Restaurant · Bar · Fitness", tags:["business","culture","gastro"], services:["gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Sydney Hyde Park", loc:"Sydney, Australie", stars:5, price:229, features:"Hyde Park · Restaurant · Bar rooftop", tags:["culture","luxury","business"], services:["gym","restaurant","bar","rooftop","meeting-room","business-center","concierge","wifi","room-service","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman at Sydney Olympic Park", loc:"Sydney, Australie", stars:5, price:189, features:"Olympic Park · Piscine · Restaurant", tags:["business","meeting","family"], services:["pool","gym","restaurant","bar","meeting-room","business-center","concierge","wifi","room-service","parking","laundry"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Quay Grand Sydney Harbour", loc:"Sydney, Australie", stars:5, price:349, features:"Circular Quay · Vue Opéra · Suites", tags:["luxury","romance","culture"], services:["gym","restaurant","bar","concierge","wifi","room-service","laundry","valet"], img:"https://m.ahstatic.com/is/image/accorhotels/6556-1:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Sydney Airport", loc:"Sydney, Australie", stars:4, price:179, features:"Aéroport · Restaurant · Bar · Fitness", tags:["business","meeting"], services:["gym","restaurant","bar","meeting-room","business-center","wifi","room-service","shuttle","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Reef Hotel Casino", loc:"Cairns, Australie", stars:5, price:199, features:"Grande Barrière · Casino · Piscine · Spa", tags:["beach","luxury","culture","family"], services:["pool","spa","gym","restaurant","fine_dining","bar","kids-club","concierge","wifi","room-service","parking","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Cairns International", loc:"Cairns, Australie", stars:5, price:189, features:"Grande Barrière · Piscine · Restaurant", tags:["beach","culture","family"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","parking","laundry","shuttle"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Palm Cove Sea Temple", loc:"Palm Cove, Australie", stars:5, price:239, features:"Plage tropicale · Piscine · Spa · Golf", tags:["beach","luxury","wellness","romance"], services:["pool","spa","gym","restaurant","bar","terrace","golf","garden","concierge","wifi","room-service","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Port Douglas Sea Temple", loc:"Port Douglas, Australie", stars:5, price:249, features:"Daintree · Plage · Piscine · Spa", tags:["beach","luxury","wellness","eco","romance"], services:["pool","spa","gym","restaurant","bar","terrace","garden","concierge","wifi","room-service","parking","bike-rental","yoga"], img:"https://m.ahstatic.com/is/image/accorhotels/pullman-dinner-2:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Bunker Bay Resort", loc:"Margaret River, Australie", stars:5, price:269, features:"Bunker Bay · Plage · Spa · Vignobles", tags:["beach","luxury","wellness","romance","gastro"], services:["pool","spa","gym","restaurant","fine_dining","bar","terrace","garden","concierge","wifi","room-service","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Magenta Shores Resort", loc:"Central Coast, Australie", stars:5, price:219, features:"Plage · Golf · Piscine · Spa", tags:["beach","wellness","family"], services:["pool","spa","gym","restaurant","bar","golf","terrace","kids-club","garden","concierge","wifi","room-service","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6409-72:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Adelaide", loc:"Adélaïde, Australie", stars:5, price:189, features:"Centre-ville · Restaurant · Bar · Fitness", tags:["business","culture","gastro"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/HCM_P_4528724:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Brisbane King George Square", loc:"Brisbane, Australie", stars:5, price:199, features:"Centre-ville · Restaurant · Piscine", tags:["business","culture"], services:["pool","gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6783-26:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Brisbane Airport", loc:"Brisbane, Australie", stars:4, price:169, features:"Aéroport · Restaurant · Fitness", tags:["business","meeting"], services:["gym","restaurant","bar","meeting-room","wifi","room-service","shuttle","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_7258-60:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Sails in the Desert - Pullman", loc:"Ayers Rock, Australie", stars:5, price:299, features:"Uluru · Piscine · Restaurant · Désert", tags:["culture","luxury","eco"], services:["pool","gym","restaurant","bar","terrace","concierge","wifi","room-service","shuttle","garden"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Auckland Hotel & Apartments", loc:"Auckland, Nouvelle-Zélande", stars:5, price:209, features:"Waterfront · Restaurant · Bar · Fitness", tags:["business","culture","luxury"], services:["gym","restaurant","bar","meeting-room","concierge","wifi","room-service","laundry","pet-friendly"], img:"https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Auckland Airport", loc:"Auckland, Nouvelle-Zélande", stars:4, price:179, features:"Aéroport · Restaurant · Fitness", tags:["business","meeting"], services:["gym","restaurant","bar","meeting-room","wifi","room-service","shuttle","laundry","parking"], img:"https://m.ahstatic.com/is/image/accorhotels/Pullman-bar:1by1?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
    { name:"Pullman Rotorua", loc:"Rotorua, Nouvelle-Zélande", stars:5, price:189, features:"Sources thermales · Spa · Piscine · Nature", tags:["wellness","eco","culture","family"], services:["pool","spa","gym","restaurant","bar","garden","kids-club","concierge","wifi","room-service","parking","bike-rental"], img:"https://m.ahstatic.com/is/image/accorhotels/PullmanHeritageImage:6by5?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  //  SOURCE UNIQUE DES HÔTELS
  //  REGION_HOTELS est la seule liste authorée. La carte en dérive (WD_HOTELS →
  //  PULLMAN_HOTELS_MAP) au lieu d'entretenir son propre jeu : cette duplication
  //  faisait qu'un hôtel pouvait exister dans la liste sans pin sur la carte, et
  //  que le rattrapage « zéro résultat » divergeait entre les deux vues.
  // ═══════════════════════════════════════════════════════════════════════════

  // Critère (ce que l'utilisateur coche) → service(s) (ce que l'hôtel déclare).
  // « center » n'a volontairement aucun service : on ne sait pas le déduire des données.
  const CRITERIA_TO_SERVICES = {
    pool: ['pool'], spa: ['spa'], gym: ['gym'], beach: ['beach'],
    breakfast: ['breakfast'], restaurant: ['restaurant'], bar: ['bar','rooftop'],
    center: [], parking: ['parking'], pets: ['pets'],
    family: ['family', 'kids-club'], meeting: ['meeting-rooms'],
  };

  // Vocabulaire inverse : permet d'exposer à la carte des identifiants de critères
  // sans qu'ils soient authorés une seconde fois.
  const SERVICES_TO_CRITERIA = (() => {
    const m = {};
    for (const [crit, svcs] of Object.entries(CRITERIA_TO_SERVICES))
      for (const s of svcs) (m[s] = m[s] || []).push(crit);
    return m;
  })();

  const REGION_HOTELS = [
    { id:'europe', label:'Europe', img:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=200&h=200&fit=crop', hotels: [
      { name:'Pullman Bordeaux Lac', loc:'Bordeaux, France', country:'France', img:'HCM_P_1340478', imgs:['HCM_P_1340478','HCM_P_9115564','aja_p_4919-32','HCM_P_6246722'], href:'https://pullman.accor.com/fr/hotels/bordeaux-le-lac/0669.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','garden','family'] },
      { name:'Pullman Cannes Mandelieu', loc:'Mandelieu, France', country:'France', img:'1168-1', imgs:['1168-1','aja_p_2612-38','HCM_P_2542733','aja_p_2612-39'], href:'https://pullman.accor.com/fr/hotels/mandelieu-la-napoule/1168.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','golf','garden','beach','kids-club','family'] },
      { name:'Pullman Lyon', loc:'Lyon, France', country:'France', img:'HCM_P_4125103', imgs:['HCM_P_4125103','2604_acf_805','aja_p_6783-34','HCM_P_5339340'], href:'https://pullman.accor.com/fr/hotels/lyon/C177.html', services:['restaurant','bar','parking','meeting-rooms','coworking','gym','wifi','breakfast','garden','pets','family'] },
      { name:'Pullman Montpellier Centre', loc:'Montpellier, France', country:'France', img:'aja_p_6825-55', imgs:['aja_p_6825-55','aja_p_6756-89','aja_p_6756-36','aja_p_6757-23'], href:'https://pullman.accor.com/fr/hotels/montpellier/1294.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Paris Centre - Bercy', loc:'Paris, France', country:'France', img:'HCM_P_7730696', imgs:['HCM_P_7730696','aja_p_2868-40','aja_p_5690-66','aja_p_6886-87'], href:'https://pullman.accor.com/fr/hotels/paris/2192.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Paris La Défense', loc:'Paris La Défense, France', country:'France', img:'HCM_P_4713972', imgs:['HCM_P_4713972','aja_p_4535-63','aja_p_2642-05','aja_p_5586-29'], href:'https://pullman.accor.com/fr/hotels/paris/3013.html', services:['restaurant','bar','parking','meeting-rooms','coworking','gym','wifi','breakfast','pets','family'] },
      { name:'Pullman Paris Tour Eiffel', loc:'Paris, France', country:'France', img:'HCM_P_6302978', imgs:['HCM_P_6302978','HCM_P_5125199','HCM_P_9944733','HCM_P_9089299'], href:'https://pullman.accor.com/fr/hotels/paris/7229.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','garden'] },
      { name:'Pullman Paris Montparnasse', loc:'Paris, France', country:'France', img:'HCM_P_1448143', imgs:['HCM_P_1448143','aja_p_6180-81','aja_p_6286-89','aja_p_6158-21'], href:'https://pullman.accor.com/fr/hotels/paris/8189.html', services:['restaurant','bar','rooftop','parking','meeting-rooms','gym','wifi','breakfast','pets','family'] },
      { name:'Pullman Toulouse Airport', loc:'Toulouse, France', country:'France', img:'HCM_P_9842792', imgs:['HCM_P_9842792','HCM_P_3903765','HCM_P_1909175','HCM_P_0021671'], href:'https://pullman.accor.com/fr/hotels/toulouse/0565.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','family'] },
      { name:'Pullman Berlin Schweizerhof', loc:'Berlin, Allemagne', country:'Allemagne', img:'HCM_P_0024306', imgs:['HCM_P_0024306','aja_p_4345-48','aja_p_4345-36','HCM_P_7434364'], href:'https://pullman.accor.com/fr/hotels/berlin/5347.html', services:['restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Cologne', loc:'Cologne, Allemagne', country:'Allemagne', img:'aja_p_4777-23', imgs:['aja_p_4777-23','aja_p_1701-27','aja_p_4777-31','aja_p_4777-26'], href:'https://pullman.accor.com/fr/hotels/koeln/5366.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Munich', loc:'Munich, Allemagne', country:'Allemagne', img:'HCM_P_5706025', imgs:['HCM_P_5706025','HCM_P_1215376','HCM_P_5147628','HCM_P_6965392'], href:'https://pullman.accor.com/fr/hotels/munich/8657.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Stuttgart Fontana', loc:'Stuttgart, Allemagne', country:'Allemagne', img:'aja_p_6902-04', imgs:['aja_p_6902-04','aja_p_6146-33','aja_p_6146-30','aja_p_6355-64'], href:'https://pullman.accor.com/fr/hotels/stuttgart/5425.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast','garden','pets'] },
      { name:'Pullman Brussels Centre Midi', loc:'Bruxelles, Belgique', country:'Belgique', img:'HCM_P_9624550', imgs:['HCM_P_9624550','HCM_P_9147662','HCM_P_1582844','aja_p_6393-86'], href:'https://pullman.accor.com/fr/hotels/brussels/7431.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Bucharest WTC', loc:'Bucarest, Roumanie', country:'Roumanie', img:'HCM_P_6874187', imgs:['HCM_P_6874187','aja_p_4069-32','aja_p_4069-35','HCM_P_5719851'], href:'https://pullman.accor.com/fr/hotels/bucharest/1714.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Budapest', loc:'Budapest, Hongrie', country:'Hongrie', img:'HCM_P_5545881', imgs:['HCM_P_5545881','HCM_P_0019684-1','HCM_P_8301675','HCM_P_8949187'], href:'https://pullman.accor.com/fr/hotels/budapest/C319.html', services:['restaurant','bar','rooftop','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Eindhoven Cocagne', loc:'Eindhoven, Pays-Bas', country:'Pays-Bas', img:'aja_p_2109-36', imgs:['aja_p_2109-36','aja_p_5152-20','aja_p_2336-09','aja_p_7027-53'], href:'https://pullman.accor.com/fr/hotels/eindhoven/5374.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Basel Europe', loc:'Bâle, Suisse', country:'Suisse', img:'aja_p_3176-51', imgs:['aja_p_3176-51','aja_p_4798-51','aja_p_4798-35','aja_p_4798-26'], href:'https://pullman.accor.com/fr/hotels/basel/5921.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Liverpool', loc:'Liverpool, Royaume-Uni', country:'Royaume-Uni', img:'aja_p_3897-28', imgs:['aja_p_3897-28','aja_p_3897-26','aja_p_6201-04','aja_p_6201-15'], href:'https://pullman.accor.com/fr/hotels/liverpool/9227.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman London St Pancras', loc:'Londres, Royaume-Uni', country:'Royaume-Uni', img:'aja_p_5227-26', imgs:['aja_p_5227-26','aja_p_3009-24','aja_p_3009-37','HCM_P_9731618'], href:'https://pullman.accor.com/fr/hotels/london/5309.html', services:['restaurant','bar','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Istanbul', loc:'Istanbul, Turquie', country:'Turquie', img:'aja_p_3849-06', imgs:['aja_p_3849-06','aja_p_3849-39','aja_p_3849-35','aja_p_3849-07'], href:'https://pullman.accor.com/fr/hotels/istanbul/9429.html', services:['restaurant','bar','pool','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Riga Old Town', loc:'Riga, Lettonie', country:'Lettonie', img:'HCM_P_1895951', imgs:['HCM_P_1895951','HCM_P_8831152','HCM_P_5387839','HCM_P_9412686'], href:'https://pullman.accor.com/fr/hotels/riga/9619.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Tbilisi Axis Towers', loc:'Tbilissi, Géorgie', country:'Géorgie', img:'aja_p_6321-41', imgs:['aja_p_6321-41','aja_p_6271-09','aja_p_6271-12','aja_p_6271-03'], href:'https://pullman.accor.com/fr/hotels/tbilisi/A1F1.html', services:['restaurant','bar','pool','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Zagreb', loc:'Zagreb, Croatie', country:'Croatie', img:'HCM_P_2775778', imgs:['HCM_P_2775778','HCM_P_5109785','HCM_P_3307072','HCM_P_1289569'], href:'https://pullman.accor.com/fr/hotels/zagreb/C030.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Gorni Okol', loc:'Gorni Okol, Bulgarie', country:'Bulgarie', img:'aja_p_6736-09', imgs:['aja_p_6736-09','aja_p_6736-71','aja_p_6737-02','aja_p_6736-24'], href:'https://pullman.accor.com/fr/hotels/gorni-okol/B364.html', services:['restaurant','bar','pool','spa','parking','meeting-rooms','gym','wifi','breakfast','garden','pets','family'] },
    ]},
    { id:'asie', label:'Asie', img:'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=200&h=200&fit=crop', hotels: [
      { name:'Pullman Bangkok Hotel G', loc:'Bangkok, Thaïlande', country:'Thaïlande', img:'aja_p_4648-59', imgs:['aja_p_4648-59','HCM_P_0019587','aja_p_2555-19','aja_p_2555-28'], href:'https://pullman.accor.com/fr/hotels/bangkok/3616.html', badge:'RÉNOVÉ', services:['pool','restaurant','bar','spa','gym','meeting-rooms','wifi','breakfast'] },
      { name:'Pullman Bangkok King Power', loc:'Bangkok, Thaïlande', country:'Thaïlande', img:'HCM_P_0021714', imgs:['HCM_P_0021714','aja_p_4069-18','HCM_P_9788388','aja_p_4873-03'], href:'https://pullman.accor.com/fr/hotels/bangkok/6323.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Khon Kaen Raja Orchid', loc:'Khon Kaen, Thaïlande', country:'Thaïlande', img:'aja_p_3572-02', imgs:['aja_p_3572-02','aja_p_3572-20','aja_p_3572-18','aja_p_3572-11'], href:'https://pullman.accor.com/fr/hotels/khon-kaen/1877.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Khao Lak Resort', loc:'Phang Nga, Thaïlande', country:'Thaïlande', img:'HCM_P_1554785', imgs:['HCM_P_1554785','HCM_P_8518535','HCM_P_6265718','aja_p_5568-49'], href:'https://pullman.accor.com/fr/hotels/phang-nga/B436.html', services:['pool','restaurant','bar','spa','beach','kids-club','gym','wifi','breakfast','garden','family'] },
      { name:'Pullman Pattaya Hotel G', loc:'Pattaya, Thaïlande', country:'Thaïlande', img:'HCM_P_7523610', imgs:['HCM_P_7523610','HCM_P_7051842','HCM_P_8980556','HCM_P_5187191'], href:'https://pullman.accor.com/fr/hotels/pattaya/7540.html', services:['pool','restaurant','bar','spa','beach','gym','meeting-rooms','wifi','breakfast','family'] },
      { name:'Pullman Phuket Arcadia', loc:'Phuket, Thaïlande', country:'Thaïlande', img:'aja_p_5366-99', imgs:['aja_p_5366-99','aja_p_3130-32','aja_p_4065-36','HCM_P_2335857'], href:'https://pullman.accor.com/fr/hotels/phuket/7488.html', services:['pool','restaurant','bar','spa','beach','kids-club','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','pets','family'] },
      { name:'Pullman Phuket Panwa Beach', loc:'Phuket, Thaïlande', country:'Thaïlande', img:'aja_p_5468-90', imgs:['aja_p_5468-90','aja_p_6699-26','aja_p_6699-31','HCM_P_8842618'], href:'https://pullman.accor.com/fr/hotels/phuket/A2E5.html', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast','garden','family'] },
      { name:'Pullman Bali Legian Beach', loc:'Bali, Indonésie', country:'Indonésie', img:'HCM_P_7887571', imgs:['HCM_P_7887571','aja_p_4277-60','HCM_P_9666750','HCM_P_4604926'], href:'https://pullman.accor.com/fr/hotels/legian/6556.html', services:['pool','restaurant','bar','spa','beach','gym','meeting-rooms','wifi','breakfast','family'] },
      { name:'Pullman Bandung Grand Central', loc:'Bandung, Indonésie', country:'Indonésie', img:'aja_p_5545-01', imgs:['aja_p_5545-01','aja_p_5545-05','aja_p_5545-04','aja_p_6408-92'], href:'https://pullman.accor.com/fr/hotels/bandung/9109.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets','kids-club','family'] },
      { name:'Pullman Ciawi Vimala Hills', loc:'Bogor, Indonésie', country:'Indonésie', img:'9061-1', imgs:['9061-1','aja_p_5382-19','aja_p_5382-11','aja_p_5382-17'], href:'https://pullman.accor.com/fr/hotels/bogor/9061.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','garden','golf','kids-club','family'] },
      { name:'Pullman Jakarta Central Park', loc:'Jakarta, Indonésie', country:'Indonésie', img:'aja_p_6625-02', imgs:['aja_p_6625-02','HCM_P_4953930','HCM_P_3603093','aja_p_6625-13'], href:'https://pullman.accor.com/fr/hotels/jakarta/7536.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Jakarta Indonesia', loc:'Jakarta, Indonésie', country:'Indonésie', img:'aja_p_4809-09', imgs:['aja_p_4809-09','aja_p_4815-65','aja_p_4809-45','aja_p_4809-35'], href:'https://pullman.accor.com/fr/hotels/jakarta/8491.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Lombok Merujani', loc:'Lombok, Indonésie', country:'Indonésie', img:'aja_p_6419-71', imgs:['aja_p_6419-71','aja_p_6419-80','aja_p_6419-81','aja_p_6419-84'], href:'https://pullman.accor.com/fr/hotels/central-lombok/A1K2.html', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast','garden'] },
      { name:'Pullman Danang Beach Resort', loc:'Danang, Vietnam', country:'Vietnam', img:'HCM_P_6539226', imgs:['HCM_P_6539226','HCM_P_5206090','aja_p_4925-44','HCM_P_4480132'], href:'https://pullman.accor.com/fr/hotels/danang/8838.html', services:['pool','restaurant','bar','spa','beach','gym','meeting-rooms','wifi','breakfast','family'] },
      { name:'Pullman Hai Phong', loc:'Hai Phong, Vietnam', country:'Vietnam', img:'HCM_P_3916085', imgs:['HCM_P_3916085','HCM_P_6418404','HCM_P_3986099','HCM_P_4743659'], href:'https://pullman.accor.com/fr/hotels/hai-phong/B4S6.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Hanoi', loc:'Hanoï, Vietnam', country:'Vietnam', img:'aja_p_4458-36', imgs:['aja_p_4458-36','aja_p_4458-46','aja_p_4458-45','aja_p_2844-50'], href:'https://pullman.accor.com/fr/hotels/hanoi/7579.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Saigon Centre', loc:'Hô Chi Minh-Ville, Vietnam', country:'Vietnam', img:'HCM_P_1916388', imgs:['HCM_P_1916388','HCM_P_1166495','HCM_P_2143851','HCM_P_2902992'], href:'https://pullman.accor.com/fr/hotels/ho-chi-minh/7489.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','rooftop'] },
      { name:'Pullman Phu Quoc Beach Resort', loc:'Phu Quoc, Vietnam', country:'Vietnam', img:'aja_p_5547-83', imgs:['aja_p_5547-83','aja_p_5369-79','aja_p_6459-73','aja_p_5547-55'], href:'https://pullman.accor.com/fr/hotels/phu-quoc/A248.html', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast','garden','pets'] },
      { name:'Pullman Vung Tau', loc:'Vung Tau, Vietnam', country:'Vietnam', img:'aja_p_3776-35', imgs:['aja_p_3776-35','HCM_P_3728191','HCM_P_3358492','HCM_P_6591913'], href:'https://pullman.accor.com/fr/hotels/ho-chi-minh/7133.html', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast'] },
      { name:'Pullman Beijing South', loc:'Pékin, Chine', country:'Chine', img:'HCM_P_2636398', imgs:['HCM_P_2636398','HCM_P_7848684','HCM_P_8540418','HCM_P_4571788'], href:'https://pullman.accor.com/fr/hotels/beijing/7025.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Lijiang Resort & Spa', loc:'Lijiang, Chine', country:'Chine', img:'aja_p_2311-18', imgs:['aja_p_2311-18','aja_p_2311-45','aja_p_2311-44','aja_p_2311-31'], href:'https://pullman.accor.com/fr/hotels/lijiang/7231.html', services:['pool','restaurant','bar','spa','parking','gym','wifi','breakfast','garden','pets'] },
      { name:'Pullman Oceanview Sanya Bay', loc:'Sanya, Chine', country:'Chine', img:'7126-1', imgs:['7126-1','aja_p_5968-20','aja_p_5968-30','aja_p_5968-33'], href:'https://pullman.accor.com/fr/hotels/sanya/7126.html', services:['pool','restaurant','bar','spa','beach','parking','gym','wifi','breakfast','family'] },
      { name:'Pullman Shanghai Jing\'an', loc:'Shanghai, Chine', country:'Chine', img:'HCM_P_5664798', imgs:['HCM_P_5664798','HCM_P_8133382','HCM_P_6821008','HCM_P_6028104'], href:'https://pullman.accor.com/fr/hotels/shanghai/7598.html', services:['restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Shanghai Central', loc:'Shanghai, Chine', country:'Chine', img:'met_p_a059-67', imgs:['met_p_a059-67','HCM_P_7104588','HCM_P_1549425','met_p_a059-72'], href:'https://pullman.accor.com/fr/hotels/shanghai/7298.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Guangzhou Baiyun Airport', loc:'Guangzhou, Chine', country:'Chine', img:'aja_p_3825-02', imgs:['aja_p_3825-02','HCM_P_0025184','HCM_P_0025180','HCM_P_0024795'], href:'https://pullman.accor.com/fr/hotels/guangzhou/B2W3.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','family'] },
      { name:'Pullman Zhangjiajie', loc:'Zhangjiajie, Chine', country:'Chine', img:'HCM_P_1160915', imgs:['HCM_P_1160915','HCM_P_1065746','aja_p_2857-33','HCM_P_4544124'], href:'https://pullman.accor.com/fr/hotels/zhangjiajie/7934.html', services:['pool','restaurant','bar','spa','parking','gym','wifi','breakfast','garden'] },
      { name:'Pullman Guiyang', loc:'Guiyang, Chine', country:'Chine', img:'aja_p_2780-48', imgs:['aja_p_2780-48','HCM_P_1139379','HCM_P_1820085','HCM_P_8518371'], href:'https://pullman.accor.com/fr/hotels/guiyang/8275.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Dali', loc:'Dali, Chine', country:'Chine', img:'aja_p_6146-38', imgs:['aja_p_6146-38','aja_p_6146-68','aja_p_6146-73','aja_p_6146-56'], href:'https://pullman.accor.com/fr/hotels/dali/8627.html', services:['pool','restaurant','bar','spa','parking','gym','wifi','breakfast','garden'] },
      { name:'Pullman New Delhi Aerocity', loc:'New Delhi, Inde', country:'Inde', img:'aja_p_6506-12', imgs:['aja_p_6506-12','HCM_P_7890969','HCM_P_1778268','aja_p_3918-36'], href:'https://pullman.accor.com/fr/hotels/new-delhi/7559.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle'] },
      { name:'Pullman Chennai Anna Salai', loc:'Chennai, Inde', country:'Inde', img:'HCM_P_4907674', imgs:['HCM_P_4907674','HCM_P_1053974','HCM_P_6692614','HCM_P_8457596'], href:'https://pullman.accor.com/fr/hotels/chennai/C460.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets','family'] },
      { name:'Pullman Kuala Lumpur City Centre', loc:'Kuala Lumpur, Malaisie', country:'Malaisie', img:'aja_p_4439-60', imgs:['aja_p_4439-60','HCM_P_6886768','HCM_P_7340247','HCM_P_7068755'], href:'https://pullman.accor.com/fr/hotels/kuala-lumpur/A0C5.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Kuching', loc:'Kuching, Malaisie', country:'Malaisie', img:'HCM_P_7588157', imgs:['HCM_P_7588157','HCM_P_2208421','HCM_P_6588904','HCM_P_3488026'], href:'https://pullman.accor.com/fr/hotels/kuching-sarawak/6332.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Miri Waterfront', loc:'Miri, Malaisie', country:'Malaisie', img:'aja_p_3964-04', imgs:['aja_p_3964-04','aja_p_3964-29','aja_p_3964-38','aja_p_3964-22'], href:'https://pullman.accor.com/fr/hotels/miri/9731.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Singapore Hill Street', loc:'Singapour', country:'Singapour', img:'HCM_P_0020377', imgs:['HCM_P_0020377','aja_p_6825-77','aja_p_6825-78','aja_p_6825-70'], href:'https://pullman.accor.com/fr/hotels/singapore/B5L7.html', services:['restaurant','bar','gym','meeting-rooms','wifi','breakfast'] },
      { name:'Pullman Singapore Orchard', loc:'Singapour', country:'Singapour', img:'aja_p_6600-45', imgs:['aja_p_6600-45','aja_p_6600-46','aja_p_6439-75','aja_p_6547-71'], href:'https://pullman.accor.com/fr/hotels/singapore/B9H8.html', services:['pool','restaurant','bar','spa','gym','meeting-rooms','wifi','breakfast','rooftop','family'] },
      { name:'Pullman Maldives Maamutaa', loc:'Maldives', country:'Maldives', img:'aja_p_5241-71', imgs:['aja_p_5241-71','aja_p_5379-13','aja_p_6353-68','aja_p_5437-80'], href:'https://pullman.accor.com/fr/hotels/maamutaa-island/9924.html', badge:'NOUVEAU', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast','garden','pets'] },
      { name:'Pullman Luang Prabang', loc:'Luang Prabang, Laos', country:'Laos', img:'aja_p_4935-28', imgs:['aja_p_4935-28','aja_p_4924-73','aja_p_4924-78','aja_p_4924-84'], href:'https://pullman.accor.com/fr/hotels/luang-prabang/9112.html', services:['pool','restaurant','bar','spa','gym','wifi','breakfast','garden','kids-club','family'] },
      { name:'Pullman Seoul', loc:'Séoul, Corée du Sud', country:'Corée du Sud', img:'aja_p_6049-58', imgs:['aja_p_6049-58','aja_p_6049-59','aja_p_6049-53','HCM_P_9986753'], href:'https://pullman.accor.com/fr/hotels/seoul/0966.html', services:['restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Tokyo Tamachi', loc:'Tokyo, Japon', country:'Japon', img:'aja_p_6187-84', imgs:['aja_p_6187-84','aja_p_6273-97','aja_p_6794-91','aja_p_4773-31'], href:'https://pullman.accor.com/fr/hotels/tokyo/B137.html', services:['restaurant','bar','gym','meeting-rooms','wifi','breakfast','pets'] },
    ]},
    { id:'moyen-orient', label:'Moyen-Orient', img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=200&fit=crop', hotels: [
      { name:'Pullman Dubai Creek City Centre', loc:'Dubaï, EAU', country:'EAU', img:'aja_p_2749-07', imgs:['aja_p_2749-07','aja_p_5151-78','aja_p_5151-79','aja_p_2691-24'], href:'https://pullman.accor.com/fr/hotels/dubai/2022.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Dubai Downtown', loc:'Dubaï, EAU', country:'EAU', img:'aja_p_6634-93', imgs:['aja_p_6634-93','aja_p_6634-48','aja_p_6634-46','aja_p_6634-59'], href:'https://pullman.accor.com/fr/hotels/dubai/B8D7.html', services:['pool','restaurant','bar','rooftop','spa','parking','meeting-rooms','coworking','gym','wifi','breakfast','airport-shuttle'] },
      { name:'Pullman Dubai JLT', loc:'Dubaï, EAU', country:'EAU', img:'HCM_P_8176030', imgs:['HCM_P_8176030','HCM_P_5148731','HCM_P_2506445','HCM_P_5449696'], href:'https://pullman.accor.com/fr/hotels/dubai/6305.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Resort Al Marjan Island', loc:'Ras Al Khaimah, EAU', country:'EAU', img:'HCM_P_5994204', imgs:['HCM_P_5994204','HCM_P_3258657','HCM_P_7887866','HCM_P_8513125'], href:'https://pullman.accor.com/fr/hotels/ras-al-khaimah/A0D2.html', services:['pool','restaurant','bar','spa','beach','parking','meeting-rooms','gym','wifi','breakfast','garden','family'] },
      { name:'Pullman Sharjah', loc:'Sharjah, EAU', country:'EAU', img:'aja_p_6247-02', imgs:['aja_p_6247-02','aja_p_6126-58','aja_p_6126-68','aja_p_6126-53'], href:'https://pullman.accor.com/fr/hotels/sharjah/A0R4.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Doha West Bay', loc:'Doha, Qatar', country:'Qatar', img:'HCM_P_7456281', imgs:['HCM_P_7456281','HCM_P_4610275','aja_p_6343-86','aja_p_6343-91'], href:'https://pullman.accor.com/fr/hotels/doha/8112.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman ZamZam Makkah', loc:'La Mecque, Arabie Saoudite', country:'Arabie Saoudite', img:'HCM_P_0015943', imgs:['HCM_P_0015943','HCM_P_0015929','HCM_P_0015911','aja_p_3901-18'], href:'https://pullman.accor.com/fr/hotels/makkah/6036.html', services:['restaurant','bar','parking','meeting-rooms','wifi','breakfast'] },
      { name:'Pullman ZamZam Madinah', loc:'Médine, Arabie Saoudite', country:'Arabie Saoudite', img:'aja_p_3895-55', imgs:['aja_p_3895-55','aja_p_3895-48','aja_p_3895-49','HCM_P_0018439'], href:'https://pullman.accor.com/fr/hotels/al-madinah-al-munawarah/9245.html', services:['restaurant','bar','parking','meeting-rooms','wifi','breakfast','family'] },
    ]},
    { id:'oceanie', label:'Océanie', img:'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=200&h=200&fit=crop', hotels: [
      { name:'Pullman Adelaide', loc:'Adélaïde, Australie', country:'Australie', img:'aja_p_5134-80', imgs:['aja_p_5134-80','HCM_P_7387246','HCM_P_5876504','aja_p_6235-44'], href:'https://pullman.accor.com/fr/hotels/adelaide/B217.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Sydney Hyde Park', loc:'Sydney, Australie', country:'Australie', img:'HCM_P_0028770-99', imgs:['HCM_P_0028770-99','aja_p_6076-61','aja_p_6076-68','HCM_P_0028765-25'], href:'https://pullman.accor.com/fr/hotels/sydney/8763.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman Quay Grand Sydney Harbour', loc:'Sydney, Australie', country:'Australie', img:'aja_p_5512-89', imgs:['aja_p_5512-89','aja_p_4316-08','HCM_P_1300312','HCM_P_7227326'], href:'https://pullman.accor.com/fr/hotels/sydney/8779.html', services:['restaurant','bar','pool','parking','gym','wifi','breakfast','garden'] },
      { name:'Pullman Sydney Airport', loc:'Sydney, Australie', country:'Australie', img:'aja_p_4651-21', imgs:['aja_p_4651-21','aja_p_4657-47','aja_p_3972-39','aja_p_3972-29'], href:'https://pullman.accor.com/fr/hotels/sydney/9522.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','pets','family'] },
      { name:'Pullman Sydney Olympic Park', loc:'Sydney, Australie', country:'Australie', img:'HCM_P_4720280', imgs:['HCM_P_4720280','HCM_P_9301615','aja_p_4588-46','HCM_P_8746092'], href:'https://pullman.accor.com/fr/hotels/sydney/6411.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Sydney Penrith', loc:'Sydney, Australie', country:'Australie', img:'HCM_P_9901521', imgs:['HCM_P_9901521','aja_p_6867-42','aja_p_6867-31','aja_p_6867-32'], href:'https://pullman.accor.com/fr/hotels/sydney/C0F1.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast','golf','garden'] },
      { name:'Pullman Brisbane King George Sq.', loc:'Brisbane, Australie', country:'Australie', img:'HCM_P_0028771-68', imgs:['HCM_P_0028771-68','aja_p_3837-07','aja_p_3837-13','HCM_P_3748639'], href:'https://pullman.accor.com/fr/hotels/brisbane/8784.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast','pets','family'] },
      { name:'Pullman Brisbane Airport', loc:'Brisbane, Australie', country:'Australie', img:'aja_p_4486-76', imgs:['aja_p_4486-76','aja_p_4486-72','aja_p_4486-66','aja_p_4486-56'], href:'https://pullman.accor.com/fr/hotels/brisbane/9559.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle'] },
      { name:'Pullman Cairns International', loc:'Cairns, Australie', country:'Australie', img:'aja_p_6031-68', imgs:['aja_p_6031-68','HCM_P_1529221','HCM_P_8427247','aja_p_6036-04'], href:'https://pullman.accor.com/fr/hotels/cairns/8772.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Reef Hotel Casino', loc:'Cairns, Australie', country:'Australie', img:'HCM_P_8302451', imgs:['HCM_P_8302451','HCM_P_8819705','HCM_P_7184023','HCM_P_2032379'], href:'https://pullman.accor.com/fr/hotels/cairns/2901.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast','casino','pets'] },
      { name:'Pullman Bunker Bay Resort', loc:'Margaret River, Australie', country:'Australie', img:'HCM_P_8807216', imgs:['HCM_P_8807216','aja_p_4996-69','aja_p_4996-67','HCM_P_5522893'], href:'https://pullman.accor.com/fr/hotels/naturaliste/8775.html', services:['pool','restaurant','bar','spa','beach','parking','gym','wifi','breakfast','garden'] },
      { name:'Pullman Melbourne City Centre', loc:'Melbourne, Australie', country:'Australie', img:'aja_p_5163-76', imgs:['aja_p_5163-76','aja_p_5163-47','aja_p_5163-50','aja_p_5163-30'], href:'https://pullman.accor.com/fr/hotels/melbourne/3028.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Melbourne Albert Park', loc:'Melbourne, Australie', country:'Australie', img:'HCM_P_0028769-2', imgs:['HCM_P_0028769-2','aja_p_3011-55','aja_p_3011-51','HCM_P_0028770-2'], href:'https://pullman.accor.com/fr/hotels/melbourne/8788.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast','garden','pets','family'] },
      { name:'Pullman Magenta Shores Resort', loc:'Magenta, Australie', country:'Australie', img:'HCM_P_0018068', imgs:['HCM_P_0018068','aja_p_6200-86','aja_p_2563-14','aja_p_3442-58'], href:'https://pullman.accor.com/fr/hotels/magenta/8791.html', services:['pool','restaurant','bar','spa','beach','parking','gym','wifi','breakfast','golf','garden'] },
      { name:'Pullman Palm Cove Sea Temple', loc:'Palm Cove, Australie', country:'Australie', img:'HCM_P_4660559', imgs:['HCM_P_4660559','HCM_P_9948288','HCM_P_5393553','aja_p_4378-29'], href:'https://pullman.accor.com/fr/hotels/palm-cove/8761.html', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast','garden'] },
      { name:'Pullman Port Douglas Sea Temple', loc:'Port Douglas, Australie', country:'Australie', img:'HCM_P_7592048', imgs:['HCM_P_7592048','aja_p_4988-52','HCM_P_4803310','aja_p_4988-43'], href:'https://pullman.accor.com/fr/hotels/port-douglas/8762.html', services:['pool','restaurant','bar','spa','beach','gym','wifi','breakfast','garden','pets'] },
      { name:'Pullman Sails in the Desert', loc:'Ayers Rock, Australie', country:'Australie', img:'aja_p_2376-55', imgs:['aja_p_2376-55','aja_p_2607-54','aja_p_2607-53','aja_p_2920-49'], href:'https://pullman.accor.com/fr/hotels/yulara/8606.html', services:['pool','restaurant','bar','parking','gym','wifi','breakfast','garden','family'] },
      { name:'Pullman Auckland Hotel & Apts', loc:'Auckland, Nouvelle-Zélande', country:'Nouvelle-Zélande', img:'aja_p_6787-95', imgs:['aja_p_6787-95','aja_p_6787-90','aja_p_6826-69','aja_p_6826-68'], href:'https://pullman.accor.com/fr/hotels/auckland/8219.html', services:['restaurant','bar','pool','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Auckland Airport', loc:'Auckland, Nouvelle-Zélande', country:'Nouvelle-Zélande', img:'HCM_P_4048188', imgs:['HCM_P_4048188','HCM_P_0019724','HCM_P_2721024','aja_p_7078-85'], href:'https://pullman.accor.com/fr/hotels/auckland/A8U9.html', services:['restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','pets'] },
      { name:'Pullman Rotorua', loc:'Rotorua, Nouvelle-Zélande', country:'Nouvelle-Zélande', img:'aja_p_5336-56', imgs:['aja_p_5336-56','aja_p_5336-57','aja_p_5301-83','aja_p_5336-50'], href:'https://pullman.accor.com/fr/hotels/rotorua/A7W3.html', services:['restaurant','bar','pool','spa','parking','gym','wifi','breakfast','garden'] },
    ]},
    { id:'ameriques', label:'Amériques', img:'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=200&h=200&fit=crop', hotels: [
      { name:'Pullman São Paulo Vila Olímpia', loc:'São Paulo, Brésil', country:'Brésil', img:'HCM_P_2616072', imgs:['HCM_P_2616072','aja_p_4719-10','HCM_P_8104296','HCM_P_3373661'], href:'https://pullman.accor.com/fr/hotels/sao-paulo/8938.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','family'] },
      { name:'Pullman São Paulo Ibirapuera', loc:'São Paulo, Brésil', country:'Brésil', img:'aja_p_4277-55', imgs:['aja_p_4277-55','aja_p_4609-77','aja_p_2393-22','HCM_P_7582481'], href:'https://pullman.accor.com/fr/hotels/sao-paulo/2125.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman São Paulo Guarulhos Airport', loc:'Guarulhos, Brésil', country:'Brésil', img:'HCM_P_8881295', imgs:['HCM_P_8881295','aja_p_4217-31','aja_p_4487-51','HCM_P_5753211'], href:'https://pullman.accor.com/fr/hotels/sao-paulo/8923.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','family'] },
      { name:'Pullman Lima Miraflores', loc:'Lima, Pérou', country:'Pérou', img:'aja_p_6055-47', imgs:['aja_p_6055-47','aja_p_6207-26','aja_p_6345-53','aja_p_6207-28'], href:'https://pullman.accor.com/fr/hotels/lima/B464.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Lima San Isidro', loc:'Lima, Pérou', country:'Pérou', img:'aja_p_6206-02', imgs:['aja_p_6206-02','aja_p_6206-27','aja_p_6206-33','aja_p_6206-34'], href:'https://pullman.accor.com/fr/hotels/lima/B462.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Santiago El Bosque', loc:'Santiago, Chili', country:'Chili', img:'aja_p_6389-64', imgs:['aja_p_6389-64','aja_p_6918-85','aja_p_6389-66','aja_p_6154-67'], href:'https://pullman.accor.com/fr/hotels/santiago/B461.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Santiago Vitacura', loc:'Santiago, Chili', country:'Chili', img:'aja_p_6341-93', imgs:['aja_p_6341-93','aja_p_6341-84','aja_p_6341-81','aja_p_5994-74'], href:'https://pullman.accor.com/fr/hotels/santiago/B470.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Viña del Mar', loc:'Viña del Mar, Chili', country:'Chili', img:'aja_p_5134-84', imgs:['aja_p_5134-84','aja_p_5131-69','aja_p_6807-98','HCM_P_4683760'], href:'https://pullman.accor.com/fr/hotels/vina-del-mar/B463.html', services:['pool','restaurant','bar','spa','beach','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Miami Airport', loc:'Miami, États-Unis', country:'États-Unis', img:'aja_p_4248-17', imgs:['aja_p_4248-17','aja_p_3936-12','aja_p_3936-13','aja_p_3141-04'], href:'https://pullman.accor.com/fr/hotels/miami/0889.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','airport-shuttle','family'] },
      { name:'Pullman Rosario City Center', loc:'Rosario, Argentine', country:'Argentine', img:'aja_p_1934-18', imgs:['aja_p_1934-18','aja_p_1934-28','aja_p_1934-31','aja_p_1934-45'], href:'https://pullman.accor.com/fr/hotels/rosario/6784.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast'] },
    ]},
    { id:'afrique', label:'Afrique', img:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200&h=200&fit=crop', hotels: [
      { name:'Pullman Marrakech Palmeraie', loc:'Marrakech, Maroc', country:'Maroc', img:'aja_p_0795-31', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','golf','garden','pets'] },
      { name:'Pullman Mazagan Royal Golf & Spa', loc:'El Jadida, Maroc', country:'Maroc', img:'aja_p_6645-45', imgs:['aja_p_6645-45','aja_p_5066-24','aja_p_6645-49','aja_p_6645-38'], href:'https://pullman.accor.com/fr/hotels/el-jadida/2960.html', services:['pool','restaurant','bar','spa','beach','parking','meeting-rooms','gym','wifi','breakfast','golf','garden','family'] },
      { name:'Pullman Abidjan', loc:'Abidjan, Côte d\'Ivoire', country:'Côte d\'Ivoire', img:'HCM_P_9207481', imgs:['HCM_P_9207481','aja_p_4970-20','HCM_P_6188544','aja_p_4954-72'], href:'https://pullman.accor.com/fr/hotels/abidjan/1146.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Cape Town', loc:'Le Cap, Afrique du Sud', country:'Afrique du Sud', img:'HCM_P_1079779', imgs:['HCM_P_1079779','HCM_P_1194670','HCM_P_6275612','HCM_P_9357632'], href:'https://pullman.accor.com/fr/hotels/cape-town/C0H1.html', services:['pool','restaurant','bar','spa','parking','meeting-rooms','gym','wifi','breakfast','pets'] },
      { name:'Pullman Dakar Teranga', loc:'Dakar, Sénégal', country:'Sénégal', img:'aja_p_4585-30', imgs:['aja_p_4585-30','aja_p_4247-50','aja_p_4247-52','aja_p_5749-04'], href:'https://pullman.accor.com/fr/hotels/dakar/0563.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Kinshasa Grand Hôtel', loc:'Kinshasa, RD Congo', country:'RD Congo', img:'HCM_P_8092766', imgs:['HCM_P_8092766','aja_p_3524-28','HCM_P_0017756','HCM_P_4945397'], href:'https://pullman.accor.com/fr/hotels/kinshasa/9635.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
      { name:'Pullman Lubumbashi Grand Karavia', loc:'Lubumbashi, RD Congo', country:'RD Congo', img:'HCM_P_8522877', imgs:['HCM_P_8522877','HCM_P_2959460','HCM_P_4268007','HCM_P_2930159'], href:'https://pullman.accor.com/fr/hotels/lubumbashi/A0T4.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast','garden','pets'] },
      { name:'Pullman Nairobi Upper Hill', loc:'Nairobi, Kenya', country:'Kenya', img:'HCM_P_2981785', imgs:['HCM_P_2981785','HCM_P_1900918','HCM_P_4059122','HCM_P_1029376'], href:'https://pullman.accor.com/fr/hotels/nairobi/C0D4.html', services:['pool','restaurant','bar','parking','meeting-rooms','gym','wifi','breakfast'] },
    ]},
  ];

  // Position réelle de l'hôtel quand on la connaît.
  const HOTEL_COORDS = {
    "Pullman Paris Montparnasse": [48.841, 2.322],
    "Pullman Paris Tour Eiffel": [48.8584, 2.2945],
    "Pullman Paris La Défense": [48.8928, 2.2378],
    "Pullman Lyon": [45.76, 4.857],
    "Pullman London St Pancras": [51.5308, -0.1238],
    "Pullman Berlin Schweizerhof": [52.5033, 13.3317],
    "Pullman Barcelona Skipper": [41.3788, 2.1912],
    "Pullman Budapest": [47.5032, 19.0609],
    "Pullman Singapore Orchard": [1.3048, 103.8318],
    "Pullman Tokyo Tamachi": [35.6478, 139.7472],
    "Pullman Bangkok Hotel G": [13.7248, 100.5315],
    "Pullman Phuket Arcadia": [8.0475, 98.2761],
    "Pullman Bali Legian Beach": [-8.7072, 115.1689],
    "Pullman Shanghai Jing'an": [31.2252, 121.4491],
    "Pullman Kuala Lumpur": [3.157, 101.7117],
    "Pullman New Delhi Aerocity": [28.5537, 77.1184],
    "Pullman Hanoi": [21.04, 105.8019],
    "Pullman Dubai Creek": [25.2305, 55.3273],
    "Pullman Dubai Downtown": [25.1972, 55.2744],
    "Pullman Istanbul": [41.0391, 28.9877],
    "Pullman Marrakech Palmeraie": [31.6538, -8.026],
    "Pullman Cape Town": [-33.9022, 18.4172],
    "Pullman Dakar Teranga": [14.7247, -17.4676],
    "Pullman Nairobi": [-1.2762, 36.8029],
    "Pullman São Paulo Vila Olímpia": [-23.5933, -46.6753],
    "Pullman Lima San Isidro": [-12.0984, -77.0347],
    "Pullman Santiago El Bosque": [-33.4372, -70.6506],
    "Pullman Miami Airport": [25.7953, -80.2772],
    "Pullman Sydney Hyde Park": [-33.8715, 151.2116],
    "Pullman Melbourne": [-37.8142, 144.9632],
    "Pullman Auckland": [-36.8442, 174.7633],
    "Pullman Cairns": [-16.9203, 145.771],
  };

  // Repli : centre-ville. Moins précis qu'une position d'hôtel, mais très au-dessus
  // du repli au centre du PAYS qu'utilisait la page de résultats.
  const CITY_COORDS = {
    'Paris': [48.8566, 2.3522],
    'Paris La Défense': [48.8918, 2.2379],
    'Bordeaux': [44.8378, -0.5792],
    'Mandelieu': [43.5460, 6.9380],
    'Montpellier': [43.6108, 3.8767],
    'Toulouse': [43.6047, 1.4442],
    'Lyon': [45.7640, 4.8357],
    'Marseille': [43.2965, 5.3698],
    'Nice': [43.7102, 7.2620],
    'Berlin': [52.5200, 13.4050],
    'Cologne': [50.9375, 6.9603],
    'Munich': [48.1351, 11.5820],
    'Stuttgart': [48.7758, 9.1829],
    'Dresde': [51.0504, 13.7373],
    'Bruxelles': [50.8476, 4.3572],
    'Barcelone': [41.3874, 2.1686],
    'Madrid': [40.4168, -3.7038],
    'Londres': [51.5074, -0.1278],
    'Liverpool': [53.4084, -2.9916],
    'Rome': [41.9028, 12.4964],
    'Milan': [45.4642, 9.1900],
    'Vienne': [48.2082, 16.3738],
    'Bucarest': [44.4268, 26.1025],
    'Eindhoven': [51.4416, 5.4697],
    'Amsterdam': [52.3676, 4.9041],
    'Bâle': [47.5596, 7.5886],
    'Genève': [46.2044, 6.1432],
    'Riga': [56.9496, 24.1052],
    'Tbilissi': [41.7151, 44.8271],
    'Zagreb': [45.8150, 15.9819],
    'Gorni Okol': [42.5333, 23.4167],
    'Istanbul': [41.0082, 28.9784],
    'Lisbonne': [38.7223, -9.1393],
    'Prague': [50.0755, 14.4378],
    'Varsovie': [52.2297, 21.0122],
    'Budapest': [47.4979, 19.0402],
  
    'Bangkok': [13.7563, 100.5018],
    'Khon Kaen': [16.4419, 102.8360],
    'Phang Nga': [8.4500, 98.5300],
    'Pattaya': [12.9236, 100.8825],
    'Phuket': [7.8804, 98.3923],
    'Bali': [-8.4095, 115.1889],
    'Bandung': [-6.9175, 107.6191],
    'Bogor': [-6.5950, 106.8166],
    'Jakarta': [-6.2088, 106.8456],
    'Lombok': [-8.6500, 116.3242],
    'Danang': [16.0544, 108.2022],
    'Hai Phong': [20.8449, 106.6881],
    'Hô Chi Minh-Ville': [10.8231, 106.6297],
    'Phu Quoc': [10.2270, 103.9670],
    'Vung Tau': [10.3460, 107.0843],
    'Hanoï': [21.0278, 105.8342],
    'Pékin': [39.9042, 116.4074],
    'Shanghai': [31.2304, 121.4737],
    'Lijiang': [26.8721, 100.2299],
    'Sanya': [18.2528, 109.5119],
    'Guangzhou': [23.1291, 113.2644],
    'Zhangjiajie': [29.1170, 110.4790],
    'Guiyang': [26.6470, 106.6302],
    'Dali': [25.6065, 100.2676],
    'Tokyo': [35.6762, 139.6503],
    'Séoul': [37.5665, 126.9780],
    'Singapour': [1.3521, 103.8198],
    'Kuala Lumpur': [3.1390, 101.6869],
    'Kuching': [1.5533, 110.3592],
    'Miri': [4.3995, 113.9914],
    'Chennai': [13.0827, 80.2707],
    'New Delhi': [28.6139, 77.2090],
    'Maldives': [3.2028, 73.2207],
    'Luang Prabang': [19.8867, 102.1350],
  
    'Dubaï': [25.2048, 55.2708],
    'Ras Al Khaimah': [25.7895, 55.9432],
    'Sharjah': [25.3463, 55.4209],
    'Doha': [25.2854, 51.5310],
    'La Mecque': [21.3891, 39.8579],
    'Médine': [24.5247, 39.5692],
  
    'Sydney': [-33.8688, 151.2093],
    'Melbourne': [-37.8136, 144.9631],
    'Adélaïde': [-34.9285, 138.6007],
    'Brisbane': [-27.4698, 153.0251],
    'Cairns': [-16.9186, 145.7781],
    'Margaret River': [-33.9550, 115.0750],
    'Magenta': [-33.6900, 151.2100],
    'Palm Cove': [-16.7423, 145.6710],
    'Port Douglas': [-16.4834, 145.4650],
    'Ayers Rock': [-25.3444, 131.0369],
    'Auckland': [-36.8485, 174.7633],
    'Rotorua': [-38.1368, 176.2497],
  
    'São Paulo': [-23.5505, -46.6333],
    'Guarulhos': [-23.4538, -46.5333],
    'Rio de Janeiro': [-22.9068, -43.1729],
    'Buenos Aires': [-34.6037, -58.3816],
    'Rosario': [-32.9442, -60.6505],
    'Santiago': [-33.4489, -70.6693],
    'Viña del Mar': [-33.0245, -71.5518],
    'Mexico': [19.4326, -99.1332],
    'Miami': [25.7617, -80.1918],
    'Lima': [-12.0464, -77.0428],
  
    'Nairobi': [-1.2921, 36.8219],
    'Le Cap': [-33.9249, 18.4241],
    'Le Caire': [30.0444, 31.2357],
    'Marrakech': [31.6295, -7.9811],
    'Casablanca': [33.5731, -7.5898],
    'El Jadida': [33.2549, -8.5060],
    'Dakar': [14.7167, -17.4677],
    'Abidjan': [5.3600, -4.0083],
    'Kinshasa': [-4.4419, 15.2663],
    'Lubumbashi': [-11.6876, 27.5026]
  };

  const cityOf = (h) => h.loc.split(',')[0].trim();

  // Décalage déterministe (jamais Math.random : les pins ne doivent pas bouger d'un
  // rendu à l'autre). Sert uniquement à déplier les hôtels d'une même ville.
  const spread = (seed, i) => {
    let n = 0;
    for (let k = 0; k < seed.length; k++) n = (n * 31 + seed.charCodeAt(k)) >>> 0;
    const a = ((n % 360) + i * 77) * Math.PI / 180;
    return [Math.cos(a) * 0.035, Math.sin(a) * 0.045];
  };

  // Index des préfixes ambigus, calculé une fois : la carte nommait certains hôtels
  // de façon tronquée (« Pullman Nairobi » pour « Pullman Nairobi Upper Hill »). On
  // récupère leur position réelle, mais seulement si un seul hôtel correspond.
  // Même fonction de hachage que celle qu'utilisait la page de résultats : les prix
  // et notes déjà affichés ne changent pas.
  const hashName = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

  const ALL_NAMES = REGION_HOTELS.flatMap(r => r.hotels.map(h => h.name));
  const UNAMBIGUOUS_PREFIX = Object.keys(HOTEL_COORDS)
    .filter(k => ALL_NAMES.filter(n => n.startsWith(k)).length === 1);

  // Liste canonique, enrichie une seule fois au chargement.
  const WD_HOTELS = (() => {
    const seen = {};
    return REGION_HOTELS.flatMap(r => r.hotels.map(h => {
      const city = cityOf(h);
      const idx = (seen[city] = (seen[city] || 0) + 1) - 1;
      let lat = null, lng = null, exact = false;
      const prefix = UNAMBIGUOUS_PREFIX.find(k => h.name.startsWith(k));
      if (HOTEL_COORDS[h.name]) { [lat, lng] = HOTEL_COORDS[h.name]; exact = true; }
      else if (prefix) { [lat, lng] = HOTEL_COORDS[prefix]; exact = true; }
      else if (CITY_COORDS[city]) {
        const [dx, dy] = spread(h.name, idx);
        lat = CITY_COORDS[city][0] + dx; lng = CITY_COORDS[city][1] + dy;
      }
      const services = h.services || [];
      // Prix / note / avis : valeurs de prototype, dérivées du nom pour être stables.
      // Calculées ici et non chez chaque consommateur, sinon la carte et la liste de
      // résultats affichent deux prix différents pour le même hôtel.
      const n = hashName(h.name);
      return Object.assign({}, h, { city: city, region: r.id, lat: lat, lng: lng,
        exactCoords: exact,
        price: 129 + n % 170,
        rating: ((79 + n % 17) / 10).toFixed(1),
        reviews: 150 + n % 1900,
        amenities: [...new Set(services.flatMap(s => SERVICES_TO_CRITERIA[s] || []))] });
    }));
  })();

  // Lien de réservation ALL, relevé sur all.accor.com et vérifié :
  //   .../booking/fr/pullman/hotel/<code>?dateIn=AAAA-MM-JJ&nights=N&compositions=P
  // dateIn et nights sont bien repris ; compositions vaut le nombre total de VOYAGEURS
  // (compositions=2 affiche « 2 personnes »), pas le nombre de chambres. « adults » est
  // ignoré. Le redirecteur lien_externe.svlt du site Pullman jette ces paramètres : on
  // vise donc directement la fiche booking.
  window.WD_ALL_BOOKING_URL = (hotel, opts) => {
    const m = (hotel && hotel.href || '').match(/\/([A-Za-z0-9]{4})\.html?$/);
    if (!m) return null;
    const o = opts || {};
    const p = new URLSearchParams();
    if (o.checkin && o.nights > 0) { p.set('dateIn', o.checkin); p.set('nights', String(o.nights)); }
    if (o.guests > 0) p.set('compositions', String(o.guests));
    const qs = p.toString();
    return 'https://all.accor.com/booking/fr/pullman/hotel/' + m[1] + (qs ? '?' + qs : '');
  };

  // Critères qu'aucun service ne peut satisfaire — « Centre-ville » n'a pas d'équivalent
  // dans les données. La liste les ignore ; la carte doit faire pareil, sans quoi cocher
  // « Centre-ville » grisait tous les pins alors que la liste affichait tout.
  window.WD_CRITERIA_SANS_SERVICE = Object.keys(CRITERIA_TO_SERVICES)
    .filter(id => !(CRITERIA_TO_SERVICES[id] || []).length);

  // Base media Accor, exposée pour que la carte compose ses visuels sans redéclarer l'URL.
  const IMG_BASE = 'https://m.ahstatic.com/is/image/accorhotels/';
  window.WD_IMG_BASE = IMG_BASE;
  // Clé image sans suffixe de ratio : toutes les photos d'hôtel n'ont pas de rendu
  // « :1by1 » ou « :16by9 » côté Accor — celle du Pullman Munich renvoyait un 403.
  // La clé nue fonctionne toujours, et le cadrage est de toute façon assuré en CSS
  // par aspect-ratio + object-fit sur le conteneur.
  window.WD_IMG_KEY = (h) => (h.img || 'aja_p_6783-26').split(':')[0];
  // Galerie : les photos propres à cet hôtel, relevées sur sa fiche pullman.accor.com.
  // La première est la photo principale, celle qui s'affichait seule jusqu'ici. Repli sur
  // elle seule pour un hôtel sans galerie — la card fonctionne alors comme avant.
  window.WD_IMG_KEYS = (h) => {
    const l = (h.imgs && h.imgs.length ? h.imgs : [window.WD_IMG_KEY(h)]);
    return l.map(k => String(k).split(':')[0]);
  };

  // Vue carte : même contenu, forme attendue par booking-map.js. On y transporte aussi
  // l'image, le lien et le prix, pour que l'encart de la carte affiche exactement ce que
  // montre la carte de résultats — plus de placeholder gris ni de lien mort.
  window.WD_HOTELS = WD_HOTELS;
  window.PULLMAN_HOTELS_MAP = WD_HOTELS
    .filter(h => h.lat !== null && h.lng !== null)
    .map(h => ({ name: h.name, city: h.city, country: h.country,
      lat: h.lat, lng: h.lng, continent: h.region, amenities: h.amenities,
      img: h.img, imgs: h.imgs, href: h.href, price: h.price, rating: h.rating,
      reviews: h.reviews, services: h.services, badge: h.badge }));

  def("wd-booking", class extends WdEl {
    render() {
      const btn = this.attr("cta", "Rechercher");
      return `<div class="wd-booking">
        <button class="wd-booking__plein-fermer" type="button" data-ferme-plein-ecran aria-label="Fermer la recherche"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="wd-booking__tabs">
          <button class="wd-booking__tab wd-booking__tab--active" data-tab="hotels">Hôtels<span class="wd-booking__tab-line"></span></button>
          <button class="wd-booking__tab" data-tab="restaurants">Restaurants<span class="wd-booking__tab-line"></span></button>
          <button class="wd-booking__tab" data-tab="reunions">Réunions<span class="wd-booking__tab-line"></span></button>
          <button class="wd-booking__tab" data-tab="celebrations">Célébrations<span class="wd-booking__tab-line"></span></button>
        </div>
        <div class="wd-booking__fields">
          <div class="wd-booking__field wd-booking__field--dest">
            <svg class="wd-booking__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
            <div class="wd-booking__dest-wrap">
              <span class="wd-booking__label">Que recherchez-vous ?</span>
              <div class="wd-booking__dest-input-row">
                <div class="wd-booking__dest-chips" id="wd-dest-chips"></div>
                <input type="search" class="wd-booking__dest-input" placeholder="Une destination, un hôtel, une envie..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="search" enterkeyhint="search" aria-label="Que recherchez-vous ?" />
              </div>
            </div>
            <button class="wd-booking__dest-clear" id="wd-dest-clear" type="button" title="Effacer la recherche" aria-label="Effacer toute la recherche"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
            <button class="wd-booking__map-toggle" title="Voir la carte" type="button"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg></button>
          </div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field wd-booking__field--dates"><svg class="wd-booking__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="1.5"/><path d="M3 9h18M8 3v3M16 3v3" stroke-linecap="round"/></svg><div><span class="wd-booking__label">À quelles dates ?</span><span class="wd-booking__value">01/04/2025 &nbsp;<svg width="12" height="9" viewBox="0 0 14 9" fill="none" style="vertical-align:-1px"><path d="M1 4.5h12M9 1l4 3.5L9 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>&nbsp; 02/04/2025</span></div></div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field wd-booking__field--guests" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-controls="wd-guests-panel"><svg class="wd-booking__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 18v-2h18v2M3 16V14a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M7 12V9.5A1.5 1.5 0 0 1 8.5 8h7a1.5 1.5 0 0 1 1.5 1.5V12" stroke-linecap="round" stroke-linejoin="round"/></svg><div><span class="wd-booking__label">Combien serez-vous ?</span><span class="wd-booking__value">1 personne, 1 chambre</span></div></div>
          <a href="#" class="wd-btn wd-btn--primary wd-booking__cta">${esc(btn)}</a>
        </div>
        <div class="wd-booking__special-rates"><span class="wd-booking__special-rates-line"></span><a href="#" class="wd-booking__special-rates-link">Special rates and accessibility <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a><span class="wd-booking__special-rates-line"></span></div>
        <div class="wd-booking__dropdown" data-state="closed">
          <div class="wd-booking__dd-body">
            <div class="wd-booking__dd-suggestions" id="wd-suggestions" style="display:none">
              <div class="wd-booking__dd-suggestions-list" id="wd-suggestions-list"></div>
            </div>
            <div class="wd-booking__dd-search-panel" id="wd-search-panel">
              <div class="wd-booking__dd-two-cols">
                <div class="wd-booking__dd-dest-col">
                  <button class="wd-booking__filtres-btn" type="button" data-ouvre-filtres><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span>Filtres</span><span class="wd-booking__filtres-compte" hidden></span></button>\n                  <h3 class="wd-booking__dd-col-title">Destination</h3>
                  <div class="wd-booking__dd-continents" id="wd-continents"></div>
                  <nav class="wd-booking__dd-breadcrumb" id="wd-breadcrumb" aria-label="Navigation destination"></nav>
                  <div class="wd-booking__dd-dest-list" id="wd-dest-list"></div>
                </div>
                <div class="wd-booking__dd-criteria-col">
                  <button class="wd-booking__filtres-fermer" type="button" data-ferme-filtres aria-label="Fermer les filtres"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
                  <h3 class="wd-booking__dd-col-title">Critères</h3>
                  <div class="wd-booking__dd-criteria-list" id="wd-criteria-list"></div>\n                  <div class="wd-booking__filtres-pied"><button type="button" class="wd-booking__filtres-effacer" data-filtres-effacer>Tout effacer</button><button type="button" class="wd-booking__filtres-appliquer" data-ferme-filtres>Appliquer</button></div>
                </div>
              </div>
            </div>
            <div class="wd-booking__dd-mapview" style="display:none">
              <div class="wd-booking__dd-two-cols">
                <div class="wd-booking__dd-map-col">
                  <button class="wd-booking__filtres-btn" type="button" data-ouvre-filtres><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span>Filtres</span><span class="wd-booking__filtres-compte" hidden></span></button>\n                  <h3 class="wd-booking__dd-col-title">Carte</h3>
                  <div class="wd-booking__dd-mapview-continents" id="wd-mapview-continents"></div>
                  <div class="wd-booking__dd-mapview-wrap">
                    <div id="wd-booking-map" class="wd-booking__dd-map"></div>
                  </div>
                </div>
                <div class="wd-booking__dd-criteria-col">
                  <button class="wd-booking__filtres-fermer" type="button" data-ferme-filtres aria-label="Fermer les filtres"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
                  <div class="wd-booking__dd-criteria-header">
                    <h3 class="wd-booking__dd-col-title">Critères</h3>
                    <button class="wd-booking__dd-clear-filters" id="wd-clear-map-filters" type="button">Retirer tout</button>
                  </div>
                  <div class="wd-booking__dd-mapview-criteria" id="wd-mapview-criteria"></div>\n                  <div class="wd-booking__filtres-pied"><button type="button" class="wd-booking__filtres-effacer" data-filtres-effacer>Tout effacer</button><button type="button" class="wd-booking__filtres-appliquer" data-ferme-filtres>Appliquer</button></div>
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
        <div class="wd-booking__guests" id="wd-guests-panel" data-state="closed" role="dialog" aria-label="Voyageurs et chambres">
          <div class="wd-booking__gp-body">
            <div class="wd-booking__gp-rooms" id="wd-gp-rooms"></div>
            <button type="button" class="wd-booking__gp-add" id="wd-gp-add">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              Ajouter une chambre
            </button>
            <div class="wd-booking__gp-footer">
              <p class="wd-booking__gp-hint" id="wd-gp-hint"></p>
              <div class="wd-booking__gp-actions">
                <button type="button" class="wd-booking__dp-clear wd-booking__gp-reset">Réinitialiser</button>
                <button type="button" class="wd-booking__dp-apply wd-booking__gp-apply">Appliquer</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }

    afterRender() {
      const progressiveMode = this.hasAttribute('progressive'); // divulgation progressive : continents seuls à l'ouverture
      const bookingTabs = this.querySelectorAll('.wd-booking__tab');
      const bookingFields = this.querySelector('.wd-booking__fields');
      const destStaticLabel = this.querySelector('.wd-booking__label');
      const destStaticTyping = this.querySelector('.wd-booking__value--typing');
      const TAB_CONFIG = {
        hotels: { label: 'Où voyagez-vous ? (obligatoire)', placeholder: 'Destination, nom d\'hôtel', value: 'Destination, nom d\'hôtel', guests: 'Combien serez-vous ?' },
        restaurants: { label: 'Où manger ?', placeholder: 'Restaurant, cuisine, ville...', value: 'Restaurant, cuisine, ville...', guests: 'Combien serez-vous ?' },
        reunions: { label: 'Organisez votre réunion', placeholder: 'Ville, hôtel, type de réunion...', value: 'Ville, hôtel, type de réunion...', guests: 'Combien de participants ?' },
        celebrations: { label: 'Célébrez un moment unique', placeholder: 'Ville, hôtel, type de célébration...', value: 'Ville, hôtel, type de célébration...', guests: 'Combien d\'invités ?' },
      };
      const guestsLabel = this.querySelector('.wd-booking__field--guests .wd-booking__label');
      bookingTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          bookingTabs.forEach(t => t.classList.remove('wd-booking__tab--active'));
          tab.classList.add('wd-booking__tab--active');
          searchState.activeTab = tab.dataset.tab;
          const cfg = TAB_CONFIG[tab.dataset.tab];
          if (cfg && destStaticLabel) destStaticLabel.textContent = cfg.label;
          if (cfg && destStaticTyping) destStaticTyping.textContent = cfg.value;
          const inp = this.querySelector('.wd-booking__dest-input');
          if (cfg && inp) inp.placeholder = cfg.placeholder;
          if (cfg && guestsLabel) guestsLabel.textContent = cfg.guests;
          // L'onglet Restaurants a maintenant ses propres critères : ses chips s'affichent
          // comme les autres. Elles étaient masquées du temps où il n'en avait aucun.
          const chips = this.querySelector('#wd-dest-chips');
          if (chips) chips.style.display = '';
          const dropdown = this.querySelector('.wd-booking__dropdown');
          if (dropdown && dropdown.dataset.state === 'open') renderPanel();
          // La vue carte a son propre panneau de critères et sa propre lecture des pins :
          // seule la vue liste était rafraîchie, si bien qu'après un passage sur
          // Restaurants la carte proposait encore piscine, spa et parking, gardait « Spa »
          // coché et mettait en avant les hôtels qui en ont un.
          if (renderMapPanel) renderMapPanel();
          if (typeof updateBookingMapCriteria === 'function') updateBookingMapCriteria(getActiveCriteria());
        });
      });

      const dropdown = this.querySelector('.wd-booking__dropdown');
      const destField = this.querySelector('.wd-booking__field--dest');
      const destInput = this.querySelector('.wd-booking__dest-input');

      // Zone géographique telle que la carte doit la comprendre. Elle recopie exactement
      // le périmètre de getResultsPool(), qui décide de la liste : pays déplié s'il y en
      // a un, continent sinon. Ni la ville ni l'hôtel sélectionné n'en font partie — la
      // liste ne s'y restreint pas non plus (taper « Paris » y affiche les 9 hôtels de
      // France), et les faire entrer ici rétrécissait la carte à 3 pins pour la même
      // recherche. Toute divergence entre les deux vues commence ici.
      const zoneCarte = () => ({
        continent: searchState.continent,
        country: searchState.expandedCountry || null,
        // La ville revient dans la zone, mais cette fois la liste la connaît aussi : c'est
        // ce qui manquait la première fois, et faisait diverger les deux vues.
        city: searchState.city || null,
        // L'hôtel ouvert restreint la zone : son pin reste en avant, ses voisins
        // s'estompent. C'est ce qui permet de voir lequel on regarde.
        hotel: searchState.selectedHotel || null
      });

      const searchState = {
        continent: null,
        showAll: false, // « Tous les continents » choisi explicitement (mode progressif)
        country: null,
        city: null,
        criteria: new Set(),
        freeText: '',
        expandedCountry: null,
        selectedHotel: null,
        activeTab: 'hotels',
        // Table choisie dans la liste, sur l'onglet Restaurants. Distincte de l'hôtel :
        // on cherche un lieu où manger, pas où dormir.
        selectedResto: null,
        tabCriteria: {
          hotels: new Set(),
          restaurants: new Set(),
          reunions: new Set(),

          celebrations: new Set(),
        },
      };

      const CRITERIA_GROUPS = {
        // Onglet Restaurants : le vocabulaire vient de core/data/restaurants.js, relevé
        // sur les fiches Pullman. Il est défini là-bas et non ici, parce qu'il ne vaut que
        // par les données qui le portent — chaque libellé correspond à un champ renseigné.
        restaurants: window.WD_RESTO_CRITERIA || [],
        hotels: [
          { group: 'Bien-être & Loisirs', items: [
            { id: 'pool', label: 'Piscine' },
            { id: 'spa', label: 'Spa' },
            { id: 'gym', label: 'Fitness' },
            { id: 'beach', label: 'Bord de mer' },
          ]},
          { group: 'Restauration', items: [
            { id: 'breakfast', label: 'Petit-déjeuner inclus' },
            { id: 'restaurant', label: 'Restaurant' },
            { id: 'bar', label: 'Bar / Rooftop' },
          ]},
          { group: 'Pratique', items: [
            { id: 'center', label: 'Centre-ville' },
            { id: 'parking', label: 'Parking' },
            { id: 'pets', label: 'Animaux acceptés' },
          ]},
          { group: 'Séjour', items: [
            { id: 'family', label: 'Famille / Kids club' },
            { id: 'meeting', label: 'Salles de réunion' },
          ]},
        ],
        // Onglet Réunions : le vocabulaire vient de core/data/reunions.js, relevé dans les
        // tableaux de capacités publiés par Pullman. Les critères précédents — écran,
        // wifi, traiteur, coworking — étaient inventés : aucune donnée ne permettait de
        // les vérifier, et ils auraient filtré au hasard.
        reunions: window.WD_REUNION_CRITERIA || [],
        celebrations: [
          { group: 'Type de célébration', items: [
            { id: 'c-wedding', label: 'Mariage' },
            { id: 'c-birthday', label: 'Anniversaire' },
            { id: 'c-evjf', label: 'EVJF / EVG' },
            { id: 'c-babyshower', label: 'Baby shower' },
          ]},
          { group: 'Type d\'espace', items: [
            { id: 'c-garden', label: 'Jardin & extérieur' },
            { id: 'c-rooftop', label: 'Rooftop' },
            { id: 'c-hall', label: 'Salle de réception' },
            { id: 'c-beach', label: 'Bord de mer' },
          ]},
          { group: 'Services', items: [
            { id: 'c-catering', label: 'Traiteur festif' },
            { id: 'c-hosting', label: 'Hébergement pour les invités' },
            { id: 'c-deco', label: 'Décoration' },
            { id: 'c-music', label: 'Musique / DJ' },
          ]},
        ],
      };
      const getActiveCriteriaGroups = () => CRITERIA_GROUPS[searchState.activeTab] || [];
      const getActiveCriteriaList = () => getActiveCriteriaGroups().flatMap(g => g.items);
      const getActiveCriteria = () => searchState.tabCriteria[searchState.activeTab] || searchState.tabCriteria.hotels;
      const CRITERIA_LIST = CRITERIA_GROUPS.hotels.flatMap(g => g.items);

      const SUGGESTIONS_DB = [
        'Paris avec piscine', 'Meilleurs hôtels Paris', 'Paris en famille',
        'Bali spa & wellness', 'Bali lune de miel', 'Bali resort tout inclus',
        'Dubai rooftop bar', 'Dubai avec piscine', 'Dubai en famille',
        'Bangkok centre-ville', 'Bangkok avec spa', 'Bangkok gastronomie',
        'Marrakech spa', 'Marrakech golf', 'Marrakech en couple',
        'Lyon gastronomie', 'Lyon business', 'Lyon centre-ville',
        'Nice bord de mer', 'Nice avec piscine', 'Nice en famille',
        'Sydney centre-ville', 'Sydney avec vue', 'Sydney en famille',
        'Phuket resort', 'Phuket plage', 'Phuket en famille',
        'São Paulo business', 'Lima gastronomie', 'Santiago en famille',
      ];

      // Données structurées régions > pays > hôtels

      const imgBase = 'https://m.ahstatic.com/is/image/accorhotels/';
      const getMatchingHotels = (continentId, countryName, criteria) => {
        const region = REGION_HOTELS.find(r => r.id === continentId);
        if (!region) return [];
        let hotels = region.hotels;
        if (countryName) hotels = hotels.filter(h => h.country === countryName);
        return hotels;
      };

      const getRegion = () => REGION_HOTELS.find(r => r.id === searchState.continent);
      const getCountries = () => {
        const region = getRegion();
        if (!region) return [];
        return [...new Set(region.hotels.map(h => h.country))].sort();
      };
      const getCities = () => {
        const region = getRegion();
        if (!region) return [];
        let hotels = region.hotels;
        if (searchState.country) hotels = hotels.filter(h => h.country === searchState.country);
        return [...new Set(hotels.map(h => h.loc.split(',')[0].trim()))].sort();
      };
      const getFilteredHotels = () => {
        const region = getRegion();
        if (!region) return [];
        let hotels = region.hotels;
        if (searchState.country) hotels = hotels.filter(h => h.country === searchState.country);
        if (searchState.city) hotels = hotels.filter(h => h.loc.split(',')[0].trim() === searchState.city);
        return hotels;
      };
      const buildChips = () => {
        const chips = [];
        if (searchState.selectedHotel) {
          chips.push({ type: 'hotel', id: searchState.selectedHotel, label: searchState.selectedHotel, icon: '<svg viewBox="0 0 14 14" class="wd-booking__chip-icon"><path d="M2 11V5.5L7 2l5 3.5V11H9V8H5v3H2z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>' });
        } else if (searchState.city) {
          chips.push({ type: 'city', id: searchState.city, label: searchState.city });
        } else if (searchState.expandedCountry) {
          chips.push({ type: 'country', id: searchState.expandedCountry, label: searchState.expandedCountry });
        } else if (searchState.continent) {
          const r = getRegion();
          if (r) chips.push({ type: 'continent', id: searchState.continent, label: r.label });
        }
        if (searchState.activeTab === 'restaurants' && searchState.selectedResto) {
          chips.push({ type: 'resto', id: searchState.selectedResto, label: searchState.selectedResto });
        }
        const activeCriteria = getActiveCriteria();
        const activeCriteriaList = getActiveCriteriaList();
        activeCriteria.forEach(cId => {
          const c = activeCriteriaList.find(x => x.id === cId);
          if (c) chips.push({ type: 'criteria', id: cId, label: c.label });
        });
        return chips;
      };
      const removeChip = (type, id) => {
        if (type === 'continent') { searchState.continent = null; searchState.expandedCountry = null; searchState.selectedHotel = null; }
        else if (type === 'country') { searchState.expandedCountry = null; searchState.city = null; searchState.selectedHotel = null; }
        else if (type === 'city') { searchState.city = null; searchState.selectedHotel = null; }
        else if (type === 'hotel') { searchState.selectedHotel = null; }
        else if (type === 'resto') { searchState.selectedResto = null; }
        else if (type === 'criteria') { getActiveCriteria().delete(id); }
        renderPanel();
      };
      const getSuggestions = (text) => {
        if (!text || text.length < 2) return [];
        const lower = text.toLowerCase();
        let pool = SUGGESTIONS_DB;
        if (searchState.city) {
          pool = pool.filter(s => s.toLowerCase().startsWith(searchState.city.toLowerCase()));
        } else if (searchState.country) {
          const citiesInCountry = REGION_HOTELS.flatMap(r => r.hotels)
            .filter(h => h.country === searchState.country)
            .map(h => h.loc.split(',')[0].trim().toLowerCase());
          pool = pool.filter(s => citiesInCountry.some(c => s.toLowerCase().startsWith(c)));
        }
        return pool.filter(s => s.toLowerCase().includes(lower)).slice(0, 5);
      };

      const continentsEl = this.querySelector('#wd-continents');
      const breadcrumbEl = this.querySelector('#wd-breadcrumb');
      const destListEl = this.querySelector('#wd-dest-list');
      const criteriaListEl = this.querySelector('#wd-criteria-list');
      const chipsEl = this.querySelector('#wd-dest-chips');
      const suggestionsEl = this.querySelector('#wd-suggestions');
      const suggestionsListEl = this.querySelector('#wd-suggestions-list');
      const searchPanelEl = this.querySelector('#wd-search-panel');

      const renderContinents = () => {
        // Mode progressif : une carte « Tous les continents » ouvre la vue complète sans choisir de zone
        const allActive = searchState.showAll && !searchState.continent;
        const ALL_IMG = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop'; // Terre vue de l'espace
        const allCard = !progressiveMode ? '' :
          '<button class="wd-booking__dd-continent wd-booking__dd-continent--all' + (allActive ? ' wd-booking__dd-continent--active' : '') + '" data-continent="__all__" type="button" role="tab" aria-selected="' + allActive + '">' +
            '<img class="wd-booking__dd-continent-img" src="' + ALL_IMG + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'none\';this.parentElement.querySelector(\'.wd-booking__dd-continent-fallback\').style.display=\'flex\'" />' +
            '<div class="wd-booking__dd-continent-overlay"></div>' +
            '<span class="wd-booking__dd-continent-fallback" style="display:none">Tous les continents</span>' +
            '<span class="wd-booking__dd-continent-label">Tous les continents</span>' +
          '</button>';
        continentsEl.innerHTML = allCard + REGION_HOTELS.map(r => {
          const active = r.id === searchState.continent;
          return '<button class="wd-booking__dd-continent' + (active ? ' wd-booking__dd-continent--active' : '') + '" data-continent="' + r.id + '" type="button" role="tab" aria-selected="' + active + '">' +
            '<img class="wd-booking__dd-continent-img" src="' + r.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'none\';this.parentElement.querySelector(\'.wd-booking__dd-continent-fallback\').style.display=\'flex\'" />' +
            '<div class="wd-booking__dd-continent-overlay"></div>' +
            '<span class="wd-booking__dd-continent-fallback" style="display:none">' + esc(r.label) + '</span>' +
            '<span class="wd-booking__dd-continent-label">' + esc(r.label) + '</span>' +
            '</button>';
        }).join('');
      };

      const renderBreadcrumb = () => {
        const parts = [];
        const region = getRegion();
        if (region) parts.push({ label: region.label, level: 'continent' });
        if (searchState.country) parts.push({ label: searchState.country, level: 'country' });
        if (searchState.city) parts.push({ label: searchState.city, level: 'city' });
        if (parts.length <= 1) { breadcrumbEl.innerHTML = ''; return; }
        breadcrumbEl.innerHTML = parts.map((p, i) => {
          const isLast = i === parts.length - 1;
          const sep = i > 0 ? '<span class="wd-booking__dd-breadcrumb-sep">/</span>' : '';
          if (isLast) return sep + '<span class="wd-booking__dd-breadcrumb-item wd-booking__dd-breadcrumb-item--current">' + esc(p.label) + '</span>';
          return sep + '<button class="wd-booking__dd-breadcrumb-item" data-level="' + p.level + '" type="button">' + esc(p.label) + '</button>';
        }).join('');
      };

      const CRITERIA_KEYWORDS = {
        'piscine': 'pool', 'pool': 'pool', 'swimming': 'pool',
        'spa': 'spa', 'wellness': 'spa', 'bien-être': 'spa', 'bien être': 'spa',
        'fitness': 'gym', 'gym': 'gym', 'sport': 'gym', 'salle de sport': 'gym',
        'plage': 'beach', 'bord de mer': 'beach', 'beach': 'beach', 'mer': 'beach', 'ocean': 'beach',
        'centre-ville': 'center', 'centre ville': 'center', 'downtown': 'center', 'centre': 'center',
        'petit-déjeuner': 'breakfast', 'petit déjeuner': 'breakfast', 'breakfast': 'breakfast', 'petit dej': 'breakfast',
        'restaurant': 'restaurant', 'gastronomie': 'restaurant', 'gastro': 'restaurant',
        'bar': 'bar', 'rooftop': 'bar', 'cocktail': 'bar',
        'parking': 'parking', 'voiture': 'parking',
        'animaux': 'pets', 'chien': 'pets', 'chat': 'pets', 'pet': 'pets', 'pets': 'pets', 'dog': 'pets',
        'famille': 'family', 'enfant': 'family', 'enfants': 'family', 'kids': 'family', 'family': 'family',
        'réunion': 'meeting', 'reunion': 'meeting', 'meeting': 'meeting', 'business': 'meeting', 'séminaire': 'meeting', 'seminaire': 'meeting',
      };
      const CONTINENT_KEYWORDS = {};
      REGION_HOTELS.forEach(r => { CONTINENT_KEYWORDS[r.label.toLowerCase()] = r.id; });
      Object.assign(CONTINENT_KEYWORDS, {
        'amérique': 'ameriques', 'amerique': 'ameriques', 'america': 'ameriques',
        'amérique du nord': 'ameriques', 'amérique latine': 'ameriques', 'amérique du sud': 'ameriques',
        'asie du sud': 'asie', 'asie du sud-est': 'asie', 'asia': 'asie',
        'moyen orient': 'moyen-orient', 'middle east': 'moyen-orient',
        'océanie': 'oceanie', 'pacifique': 'oceanie', 'pacific': 'oceanie',
        'africa': 'afrique',
      });
      const ALL_COUNTRIES = [...new Set(REGION_HOTELS.flatMap(r => r.hotels.map(h => h.country)))];
      const ALL_CITIES = [...new Set(REGION_HOTELS.flatMap(r => r.hotels.map(h => h.loc.split(',')[0].trim())))];

      const parseQuery = (text) => {
        const lower = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const lowerRaw = text.toLowerCase();
        const result = { continent: null, country: null, city: null, criteria: [], remaining: '' };
        let remaining = lowerRaw;
        const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        for (const city of ALL_CITIES.sort((a, b) => b.length - a.length)) {
          if (lowerRaw.includes(city.toLowerCase())) {
            result.city = city;
            const region = REGION_HOTELS.find(r => r.hotels.some(h => h.loc.split(',')[0].trim() === city));
            const hotel = region ? region.hotels.find(h => h.loc.split(',')[0].trim() === city) : null;
            if (region) result.continent = region.id;
            if (hotel) result.country = hotel.country;
            remaining = remaining.replace(new RegExp(escRe(city), 'gi'), ' ');
            break;
          }
        }
        if (!result.city) {
          for (const country of ALL_COUNTRIES.sort((a, b) => b.length - a.length)) {
            if (lowerRaw.includes(country.toLowerCase())) {
              result.country = country;
              const region = REGION_HOTELS.find(r => r.hotels.some(h => h.country === country));
              if (region) result.continent = region.id;
              remaining = remaining.replace(new RegExp(escRe(country), 'gi'), ' ');
              break;
            }
          }
        }
        if (!result.continent) {
          const sortedContinents = Object.entries(CONTINENT_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
          for (const [label, id] of sortedContinents) {
            const labelNorm = label.normalize('NFD').replace(/[̀-ͯ]/g, '');
            if (lower.includes(labelNorm)) {
              result.continent = id;
              remaining = remaining.replace(new RegExp(escRe(label), 'gi'), ' ');
              break;
            }
          }
        }

        const sortedKeys = Object.keys(CRITERIA_KEYWORDS).sort((a, b) => b.length - a.length);
        for (const kw of sortedKeys) {
          const kwNorm = kw.normalize('NFD').replace(/[̀-ͯ]/g, '');
          const re = new RegExp('(?:^|[\\s,])' + escRe(kwNorm) + '(?:$|[\\s,])', 'i');
          if (re.test(lower)) {
            const cId = CRITERIA_KEYWORDS[kw];
            if (!result.criteria.includes(cId)) result.criteria.push(cId);
            remaining = remaining.replace(new RegExp(escRe(kw), 'gi'), ' ');
          }
        }
        result.remaining = remaining.replace(/\b(avec|en|et|un|une|le|la|les|des|du|de|pour|à|a|au|hôtel|hotel)\b/gi, ' ').replace(/\s+/g, ' ').trim();
        return result;
      };

      const hotelMatchesCriteria = (h) => {
        const active = getActiveCriteria();
        if (!active.size) return true;
        if (!h.services) return false;
        for (const cId of active) {
          const svcs = CRITERIA_TO_SERVICES[cId];
          if (!svcs || !svcs.length) continue;
          if (!svcs.some(s => h.services.includes(s))) return false;
        }
        return true;
      };

      // Pool d'hôtels correspondant au périmètre géographique courant (hors critères)
      const getResultsPool = () => {
        const allHotels = REGION_HOTELS.flatMap(r => r.hotels);
        if (searchState.selectedHotel) {
          // L'hôtel choisi est le périmètre : c'est lui qu'on regarde. Renvoyer tout son
          // pays donnait un compteur qui contredisait la chip.
          const region = getRegion();
          const base = region ? region.hotels : allHotels;
          return { pool: base.filter(h => h.name === searchState.selectedHotel), label: searchState.selectedHotel };
        } else if (searchState.city) {
          // La ville est un périmètre à part entière depuis qu'on peut la choisir sur la
          // carte. Elle passe avant le pays : c'est le choix le plus précis.
          const region = getRegion();
          const base = region ? region.hotels : allHotels;
          return { pool: base.filter(h => h.loc.split(',')[0].trim() === searchState.city), label: searchState.city };
        } else if (searchState.expandedCountry) {
          const region = getRegion();
          return { pool: region ? region.hotels.filter(h => h.country === searchState.expandedCountry) : [], label: searchState.expandedCountry };
        } else if (searchState.continent) {
          const region = getRegion();
          return { pool: region ? region.hotels : [], label: region ? region.label : '' };
        }
        const countryCount = new Set(allHotels.map(h => h.country)).size;
        return { pool: allHotels, label: countryCount + ' pays' };
      };

      // Un hôtel matche-t-il un sous-ensemble donné de critères ?
      const matchesCriteriaSet = (h, ids) => {
        if (!h.services) return false;
        for (const id of ids) {
          const svcs = CRITERIA_TO_SERVICES[id];
          if (!svcs || !svcs.length) continue;
          if (!svcs.some(s => h.services.includes(s))) return false;
        }
        return true;
      };

      // Zero-result recovery : quel critère, une fois retiré, débloque le plus d'hôtels ?
      // Renvoie null quand il y a des résultats — donc rien à proposer. La carte s'en sert
      // pour porter les mêmes actions dans son message d'écartement, plutôt que d'afficher
      // un second bloc par-dessus le premier.
      // Même rattrapage, sur les tables : quel critère, une fois retiré, en débloque le
      // plus ? La suggestion porte sur des lieux de restauration, pas sur des hôtels.
      const assouplissementRestos = () => {
        const active = getActiveCriteria();
        if (!active.size) return null;
        const pool = restosDuPerimetre();
        if (!pool.length) return null;
        if (pool.some(restoMatchesCriteria)) return null;      // il reste des tables
        const liste = getActiveCriteriaList();
        const ids = [...active];
        let best = null;
        // Un lieu répond-il à un sous-ensemble de critères ? Même règle que le filtre :
        // ET entre les groupes, OU à l'intérieur.
        const repond = (v, ids2) => getActiveCriteriaGroups().every(g => {
          const coches = g.items.map(it => it.id).filter(id => ids2.has(id));
          if (!coches.length) return true;
          return coches.some(id => id === v.type || v.cuisines.indexOf(id) >= 0 || v.tags.indexOf(id) >= 0);
        });
        ids.forEach(cId => {
          const reduits = new Set(ids.filter(x => x !== cId));
          const gardes = pool.filter(v => repond(v, reduits));
          if (gardes.length && (!best || gardes.length > best.count)) {
            const c = liste.find(x => x.id === cId);
            best = { id: cId, label: c ? c.label : cId, count: gardes.length, hotel: { name: gardes[0].nom } };
          }
        });
        return { best };
      };

      const chercherAssouplissement = () => {
        if (searchState.activeTab === 'restaurants') return assouplissementRestos();
        // Les critères des autres onglets ne se lisent pas sur les services d'un hôtel :
        // les leur appliquer donnerait un rattrapage qui ne veut rien dire.
        if (searchState.activeTab !== 'hotels') return null;
        const active = getActiveCriteria();
        if (!active.size) return null;
        const { pool } = getResultsPool();
        if (!pool.length) return null;                                 // pas de destination -> rien à suggérer
        if (pool.filter(hotelMatchesCriteria).length > 0) return null; // il y a des résultats -> pas de message
        const list = getActiveCriteriaList();
        const activeIds = [...active];
        const labelFor = (id) => { const c = list.find(x => x.id === id); return c ? c.label : id; };
        let best = null;
        activeIds.forEach(cId => {
          const svcs = CRITERIA_TO_SERVICES[cId];
          if (!svcs || !svcs.length) return;                           // critère non filtrant -> le retirer ne débloque rien
          const reduced = activeIds.filter(x => x !== cId);
          const matches = pool.filter(h => matchesCriteriaSet(h, reduced));
          if (matches.length && (!best || matches.length > best.count)) {
            best = { id: cId, label: labelFor(cId), count: matches.length, hotel: matches[0] };
          }
        });
        return { best };                                               // best peut être null : aucun critère ne débloque
      };

      const renderRelaxation = () => {
        const r = chercherAssouplissement();
        return r ? buildNoResultBlock(r.best) : '';
      };

      // Markup partagé du bloc « aucun résultat » (vue liste et vue carte)
      const buildNoResultBlock = (best) => {
        const info = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.6" r=".7" fill="currentColor" stroke="none"/></svg>';
        let body;
        if (best) {
          const plural = best.count > 1;
          const namePart = plural ? '' : ' : <strong>' + esc(best.hotel.name) + '</strong>';
          body = '<div class="wd-booking__dd-noresult-row">' +
            '<p class="wd-booking__dd-noresult-text">En retirant <strong>« ' + esc(best.label) + ' »</strong>, <strong>' + best.count + ' hôtel' + (plural ? 's' : '') + '</strong> correspond' + (plural ? 'raient' : 'rait') + namePart + '.</p>' +
            '<div class="wd-booking__dd-noresult-actions">' +
            '<button type="button" class="wd-booking__dd-noresult-relax" data-criteria="' + best.id + '">Retirer « ' + esc(best.label) + ' »</button>' +
            '<button type="button" class="wd-booking__dd-noresult-reset">Réinitialiser les critères</button>' +
            '</div></div>';
        } else {
          body = '<div class="wd-booking__dd-noresult-row">' +
            '<p class="wd-booking__dd-noresult-text">Aucun de vos critères ne peut être assoupli pour trouver un hôtel ici.</p>' +
            '<div class="wd-booking__dd-noresult-actions">' +
            '<button type="button" class="wd-booking__dd-noresult-reset">Réinitialiser les critères</button>' +
            '</div></div>';
        }
        return '<div class="wd-booking__dd-noresult" role="status" aria-live="polite">' +
          '<div class="wd-booking__dd-noresult-head">' + info +
          '<span class="wd-booking__dd-noresult-title">Aucun hôtel ne correspond à tous vos critères</span></div>' +
          body + '</div>';
      };

      // La vue carte affiche le même rattrapage que la liste, parce qu'elle affiche
      // désormais les mêmes hôtels : même périmètre (getResultsPool) et même lecture des
      // critères (via les services). Elle avait sa propre version, qui testait les
      // critères directement contre `amenities` et ignorait le pays choisi. « Centre-ville »
      // n'étant dans les amenities d'aucun hôtel, elle déclarait la carte vide quand la
      // liste annonçait 9 hôtels en Chine — et proposait de retirer ce critère au nom des
      // 39 hôtels de l'Asie entière.

      // Divulgation progressive : y a-t-il un périmètre de recherche actif (continent, pays, hôtel, ville, saisie) ?
      const hasSearchScope = () => !!(
        searchState.continent || searchState.showAll || searchState.expandedCountry || searchState.selectedHotel ||
        searchState.city || (searchState.freeText && searchState.freeText.trim().length >= 1)
      );
      // État intermédiaire = mode progressif ET aucun périmètre choisi -> on n'affiche que les continents
      const isIntermediate = () => progressiveMode && !hasSearchScope();

      // ===== Recherches récentes — persistées en localStorage, reprise en un clic (façon Airbnb).
      // L'état est capturé en continu (debounce) : pas besoin d'avoir cliqué « Rechercher ».
      const RECENT_KEY = 'wd-recent-searches';
      // Une seule entrée : la dernière recherche, dans son état le plus affiné (pas de doublons de raffinement)
      const loadRecents = () => { try { return (JSON.parse(localStorage.getItem(RECENT_KEY)) || []).filter(r => r && r.geoLabel).slice(0, 1); } catch (e) { return []; } };
      const storeRecents = (list) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 1))); } catch (e) {} };
      const fmtRecentDay = (iso) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(iso));
      const buildRecentEntry = () => {
        const active = getActiveCriteria();
        const list = getActiveCriteriaList();
        const criteriaLabels = [...active].map(id => { const c = list.find(x => x.id === id); return c ? c.label : id; });
        const region = getRegion();
        let geoLabel = '';
        if (searchState.selectedHotel) geoLabel = searchState.selectedHotel;
        else if (searchState.expandedCountry) geoLabel = searchState.expandedCountry;
        else if (searchState.city) geoLabel = searchState.city;
        else if (region) geoLabel = region.label;
        else if (searchState.showAll) geoLabel = 'Tous les continents';
        else if (searchState.freeText.trim()) geoLabel = searchState.freeText.trim();
        const checkin = dpCheckIn ? dpCheckIn.toISOString() : null;
        const checkout = dpCheckOut ? dpCheckOut.toISOString() : null;
        if (!geoLabel) return null; // pas de destination -> rien à reprendre (et on ne clobber pas la dernière vraie recherche)
        return {
          ts: Date.now(), tab: searchState.activeTab,
          geo: { continent: searchState.continent, showAll: searchState.showAll, country: searchState.expandedCountry, city: searchState.city, hotel: searchState.selectedHotel, freeText: searchState.freeText.trim() },
          geoLabel, criteria: [...active], criteriaLabels, checkin, checkout, flex: dpFlex
        };
      };
      const saveRecentNow = () => {
        try {
          const entry = buildRecentEntry();
          if (!entry) return;
          storeRecents([entry]); // remplace : chaque raffinement met à jour LA recherche retenue
        } catch (e) {}
      };
      let recentTimer = null;
      const scheduleRecentSave = () => { clearTimeout(recentTimer); recentTimer = setTimeout(saveRecentNow, 800); };
      const applyRecent = (r) => {
        if (!r) return;
        if (r.tab && r.tab !== searchState.activeTab) {
          const tabBtn = this.querySelector('.wd-booking__tab[data-tab="' + r.tab + '"]');
          if (tabBtn) tabBtn.click();
        }
        searchState.continent = r.geo.continent || null;
        searchState.showAll = !!r.geo.showAll;
        searchState.expandedCountry = r.geo.country || null;
        searchState.city = r.geo.city || null;
        searchState.selectedHotel = r.geo.hotel || null;
        searchState.freeText = '';
        destInput.value = '';
        const set = getActiveCriteria();
        set.clear();
        (r.criteria || []).forEach(id => set.add(id));
        dpCheckIn = r.checkin ? new Date(r.checkin) : null;
        dpCheckOut = r.checkout ? new Date(r.checkout) : null;
        dpFlex = r.flex || 0;
        formatDateField();
        renderPanel();
      };

      // Hôtels du périmètre courant, du point de vue des réunions : ce sont des hôtels
      // qu'on compte ici, un espace de réunion n'ayant pas d'existence hors du sien.
      const reunionsDuPerimetre = () => {
        const tous = window.WD_REUNIONS || [];
        if (searchState.selectedHotel) return tous.filter(r => r.hotel === searchState.selectedHotel);
        if (searchState.city) return tous.filter(r => r.ville === searchState.city);
        if (searchState.expandedCountry) return tous.filter(r => r.pays === searchState.expandedCountry);
        if (searchState.continent) return tous.filter(r => r.region === searchState.continent);
        return tous;
      };

      // ET entre les groupes, OU à l'intérieur — même règle que les restaurants. Les
      // tranches de capacité ou de nombre de salles s'additionnent donc au lieu de
      // s'annuler quand on en coche deux.
      const reunionMatchesCriteria = (r) => {
        const actifs = getActiveCriteria();
        if (!actifs.size) return true;
        const teste = (id) => {
          switch (id) {
            case 'cap-100':  return r.capaciteMax > 0 && r.capaciteMax < 100;
            case 'cap-300':  return r.capaciteMax >= 100 && r.capaciteMax < 300;
            case 'cap-800':  return r.capaciteMax >= 300 && r.capaciteMax < 800;
            case 'cap-plus': return r.capaciteMax >= 800;
            case 'salles-3':    return r.nbSalles <= 3;
            case 'salles-9':    return r.nbSalles >= 4 && r.nbSalles <= 9;
            case 'salles-plus': return r.nbSalles >= 10;
            case 'grande-salle': return r.surfaceMax >= 1000;
            default: return false;
          }
        };
        return getActiveCriteriaGroups().every(g => {
          const coches = g.items.map(it => it.id).filter(id => actifs.has(id));
          if (!coches.length) return true;
          return coches.some(teste);
        });
      };

      // Lieux de restauration du périmètre courant. Même géographie que la liste d'hôtels
      // — pays déplié s'il y en a un, continent sinon — pour que les deux onglets ne se
      // contredisent pas quand on passe de l'un à l'autre.
      const restosDuPerimetre = () => {
        const tous = searchState.selectedResto
          ? (window.WD_RESTAURANTS || []).filter(v => v.nom === searchState.selectedResto)
          : (window.WD_RESTAURANTS || []);
        if (searchState.selectedHotel) return tous.filter(v => v.hotel === searchState.selectedHotel);
        if (searchState.city) return tous.filter(v => v.ville === searchState.city);
        if (searchState.expandedCountry) return tous.filter(v => v.pays === searchState.expandedCountry);
        if (searchState.continent) return tous.filter(v => v.region === searchState.continent);
        return tous;
      };

      // ET entre les groupes, OU à l'intérieur d'un groupe. Cocher « Italienne » et
      // « Japonaise » cherche l'une ou l'autre, jamais les deux à la fois — un lieu n'a
      // qu'une cuisine. Mais cocher « Rooftop » et « Italienne » demande bien les deux.
      const restoMatchesCriteria = (v) => {
        const actifs = getActiveCriteria();
        if (!actifs.size) return true;
        return getActiveCriteriaGroups().every(g => {
          const coches = g.items.map(it => it.id).filter(id => actifs.has(id));
          if (!coches.length) return true;
          return coches.some(id => id === v.type || v.cuisines.indexOf(id) >= 0 || v.tags.indexOf(id) >= 0);
        });
      };

      // Intitulé du compte : on nomme ce qu'on a filtré. « Restaurants et bars » tant que
      // le type n'est pas choisi, l'un ou l'autre dès qu'il l'est.
      const motLieux = (n) => {
        const a = getActiveCriteria();
        const resto = a.has('restaurant'), bar = a.has('bar');
        if (resto && !bar) return 'restaurant' + (n > 1 ? 's' : '');
        if (bar && !resto) return 'bar' + (n > 1 ? 's' : '');
        return n > 1 ? 'restaurants et bars' : 'restaurant ou bar';
      };

      const renderResultsCount = () => {
        if (searchState.activeTab === 'reunions') {
          const r = reunionsDuPerimetre().filter(reunionMatchesCriteria);
          const n = r.length;
          const salles = r.reduce((t, x) => t + x.nbSalles, 0);
          const { label } = getResultsPool();
          let d = '<span class="wd-booking__dd-results-count-number">' + n + '</span> hôtel' + (n > 1 ? 's' : '');
          // On dit aussi le nombre d'espaces : c'est ce qu'on cherche, l'hôtel n'est que
          // l'endroit où ils se trouvent.
          if (salles) d += ' · ' + salles + ' salle' + (salles > 1 ? 's' : '');
          const actifs = getActiveCriteria();
          if (actifs.size) {
            const liste = getActiveCriteriaList();
            const dits = [...actifs].map(id => (liste.find(x => x.id === id) || {}).label).filter(Boolean);
            if (dits.length) d += ' ' + dits.join(', ').toLowerCase();
          }
          if (label) {
            d += '<span class="wd-booking__dd-results-count-sep">—</span>' +
              '<span class="wd-booking__dd-results-count-label">' + esc(label) + '</span>';
          }
          return '<div class="wd-booking__dd-results-count">' + d + '</div>';
        }
        if (searchState.activeTab === 'restaurants') {
          const lieux = restosDuPerimetre().filter(restoMatchesCriteria);
          const n = lieux.length;
          const { label } = getResultsPool();
          const actifs = getActiveCriteria();
          const dits = [];
          if (actifs.size) {
            const liste = getActiveCriteriaList();
            actifs.forEach(id => {
              const c = liste.find(x => x.id === id);
              // Le type est déjà dit par le mot compté : on ne le répète pas.
              if (c && id !== 'restaurant' && id !== 'bar') dits.push(c.label.toLowerCase());
            });
          }
          let d = '<span class="wd-booking__dd-results-count-number">' + n + '</span> ' + motLieux(n);
          if (dits.length) d += ' ' + dits.join(', ');
          if (label) {
            d += '<span class="wd-booking__dd-results-count-sep">—</span>' +
              '<span class="wd-booking__dd-results-count-label">' + esc(label) + '</span>';
          }
          return '<div class="wd-booking__dd-results-count">' + d + '</div>';
        }
        const { pool, label } = getResultsPool();
        const count = pool.filter(hotelMatchesCriteria).length;
        const activeCriteria = getActiveCriteria();
        const criteriaLabels = [];
        if (activeCriteria.size) {
          const list = getActiveCriteriaList();
          activeCriteria.forEach(cId => {
            const c = list.find(x => x.id === cId);
            if (c) criteriaLabels.push(c.label.toLowerCase());
          });
        }
        let desc = '<span class="wd-booking__dd-results-count-number">' + count + '</span> hôtel' + (count > 1 ? 's' : '');
        if (criteriaLabels.length) {
          desc += ' ' + criteriaLabels.join(', ');
        }
        if (label) {
          desc += '<span class="wd-booking__dd-results-count-sep">—</span>' +
            '<span class="wd-booking__dd-results-count-label">' + esc(label) + '</span>';
        }
        return '<div class="wd-booking__dd-results-count">' + desc + '</div>';
      };

      // Termes trop génériques pour filtrer (tous les hôtels correspondent) -> on garde l'affichage par défaut
      const GENERIC_QUERY_TERMS = new Set(['hotel', 'hotels', 'hôtel', 'hôtels', 'hotellerie', 'hôtellerie', 'pullman']);
      const isGenericQuery = (q) => { const t = (q || '').trim(); return t.length > 0 && t.split(/\s+/).every(w => GENERIC_QUERY_TERMS.has(w)); };
      let lastScrolledCountry = null; // évite de re-scroller à chaque re-rendu (critères, etc.)
      const renderDestList = () => {
        const query = searchState.freeText.toLowerCase();
        if (isIntermediate()) {
          // Continents seuls + reprise des recherches récentes ; le repère chiffré reste en pied
          const clockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7.5v5l3.5 2"/></svg>';
          const delIcon = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>';
          const recents = loadRecents();
          let html = '';
          if (recents.length) {
            html += '<div class="wd-booking__dd-section-title">Reprendre votre recherche</div>';
            html += recents.map((r, i) => {
              // Dates (avec repli), puis services recherchés
              let datePart;
              if (r.checkin && r.checkout) datePart = fmtRecentDay(r.checkin) + ' – ' + fmtRecentDay(r.checkout) + (r.flex ? ' · ±' + r.flex + 'j' : '');
              else if (r.checkin) datePart = 'dès le ' + fmtRecentDay(r.checkin);
              else datePart = 'Dates flexibles';
              const servicePart = (r.criteriaLabels && r.criteriaLabels.length) ? r.criteriaLabels.join(', ') : null;
              const subParts = [datePart, servicePart].filter(Boolean);
              return '<div class="wd-booking__dd-recent-row">' +
                '<button type="button" class="wd-booking__dd-recent" data-recent="' + i + '">' +
                  '<span class="wd-booking__dd-recent-icon">' + clockIcon + '</span>' +
                  '<span class="wd-booking__dd-recent-main">' +
                    '<span class="wd-booking__dd-recent-title">' + esc(r.geoLabel || 'Recherche') + '</span>' +
                    '<span class="wd-booking__dd-recent-sub">' + esc(subParts.join('  ·  ')) + '</span>' +
                  '</span>' +
                '</button>' +
                '<button type="button" class="wd-booking__dd-recent-del" data-recent-del="' + i + '" aria-label="Supprimer cette recherche récente">' + delIcon + '</button>' +
              '</div>';
            }).join('');
          }
          // Touchpoint wishlist — réservé au compte connecté (contenu personnel), avec le nombre
          // d'hôtels par destination pour annoncer ce que donne le clic (pas de promesse vide).
          // Un seul raccourci à la fois, le plus pertinent : tant qu'aucune recherche n'a été faite
          // on propose la wishlist ; dès qu'il y a une recherche à reprendre, elle prend le relais.
          const isConnected = !!(document.querySelector('wd-header') || {}).isLoggedIn;
          const allH = REGION_HOTELS.flatMap(r => r.hotels);
          const wish = (!recents.length && isConnected && WD_USER_PROFILE && WD_USER_PROFILE.wishlist ? WD_USER_PROFILE.wishlist : [])
            .map(d => ({ ...d, count: allH.filter(h => h.loc.split(',')[0].trim() === d.name).length }))
            .filter(d => d.count > 0); // on n'affiche jamais un raccourci qui mènerait à 0 résultat
          if (wish.length) {
            html += '<div class="wd-booking__dd-wish-head">' +
              '<span class="wd-booking__dd-section-title wd-booking__dd-wish-title" id="wd-wish-label">Votre wishlist</span>' +
              '<span class="wd-booking__dd-wish-count">' + wish.length + ' destination' + (wish.length > 1 ? 's' : '') + '</span>' +
              '</div>';
            html += '<ul class="wd-booking__dd-wish-row" role="list" aria-labelledby="wd-wish-label">' + wish.map(d => {
              const label = d.count + ' hôtel' + (d.count > 1 ? 's' : '');
              return '<li>' +
                '<button type="button" class="wd-booking__dd-wish" data-wish-city="' + esc(d.name) + '" aria-label="' + esc(d.name) + ', ' + label + ' — voir les résultats">' +
                  '<img class="wd-booking__dd-wish-img" src="' + d.image + '" alt="" loading="lazy" />' +
                  '<span class="wd-booking__dd-wish-overlay"></span>' +
                  '<span class="wd-booking__dd-wish-text">' +
                    '<span class="wd-booking__dd-wish-name">' + esc(d.name) + '</span>' +
                    '<span class="wd-booking__dd-wish-meta">' + label + '</span>' +
                  '</span>' +
                '</button></li>';
            }).join('') + '</ul>';
          }
          // Pas de compteur global en état intermédiaire (peu pertinent tant qu'aucune zone n'est choisie)
          destListEl.innerHTML = html;
          return;
        }
        if (!searchState.continent) {
          const allHotels = REGION_HOTELS.flatMap(r => r.hotels);
          const allCountries = [...new Set(allHotels.map(h => h.country))].sort();
          const allCities = [...new Set(allHotels.map(h => h.loc.split(',')[0].trim()))].sort();
          let html = '';
          if (query.length >= 1 && !isGenericQuery(query)) {
            const parsed = parseQuery(searchState.freeText);
            let filteredHotels = allHotels;
            if (parsed.continent) filteredHotels = filteredHotels.filter(h => {
              const r = REGION_HOTELS.find(rr => rr.hotels.includes(h));
              return r && r.id === parsed.continent;
            });
            if (parsed.country) filteredHotels = filteredHotels.filter(h => h.country === parsed.country);
            if (parsed.city) filteredHotels = filteredHotels.filter(h => h.loc.split(',')[0].trim() === parsed.city);
            const hasParsedGeo = parsed.continent || parsed.country || parsed.city;
            const hasParsedCriteria = parsed.criteria.length > 0;
            if (hasParsedGeo || hasParsedCriteria) {
              html += '<div class="wd-booking__dd-dest-subtitle">' + filteredHotels.length + ' hotel' + (filteredHotels.length > 1 ? 's' : '') + ' trouve' + (filteredHotels.length > 1 ? 's' : '') + '</div>';
              html += filteredHotels.slice(0, 8).map(h => {
                const imgKey = h.img.includes(':') ? h.img : h.img + ':1by1';
                return '<a href="' + (h.href || '#') + '" class="wd-booking__dd-hotel-row">' +
                  '<img class="wd-booking__dd-hotel-thumb" src="' + imgBase + imgKey + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" alt="' + esc(h.name) + '" loading="lazy" />' +
                  '<div class="wd-booking__dd-hotel-info">' +
                  '<span class="wd-booking__dd-hotel-name">' + esc(h.name) + '</span>' +
                  '<span class="wd-booking__dd-hotel-loc">' + esc(h.loc.split(',')[0].trim()) + '<span class="wd-booking__dd-hotel-country">' + esc(h.loc.includes(',') ? h.loc.split(',').slice(1).join(',').trim() : '') + '</span></span>' +
                  '</div></a>';
              }).join('');
            } else {
              const matchedCountries = allCountries.filter(c => c.toLowerCase().includes(query));
              const matchedCities = allCities.filter(c => c.toLowerCase().includes(query));
              const matchedHotels = allHotels.filter(h => h.name.toLowerCase().includes(query));
              if (matchedCountries.length) {
                html += '<div class="wd-booking__dd-dest-subtitle">Pays</div>';
                html += matchedCountries.map(c => {
                  const count = allHotels.filter(h => h.country === c).length;
                  const region = REGION_HOTELS.find(r => r.hotels.some(h => h.country === c));
                  return '<button class="wd-booking__dd-dest-item" data-dest-type="country-global" data-dest-country="' + esc(c) + '" data-dest-continent="' + (region ? region.id : '') + '" type="button">' +
                    esc(c) +
                    '<span class="wd-booking__dd-dest-item-count">' + count + ' hôtel' + (count > 1 ? 's' : '') + '</span>' +
                    '<span class="wd-booking__dd-dest-item-arrow"><svg viewBox="0 0 12 12"><polyline points="4,2 8,6 4,10"/></svg></span>' +
                    '</button>';
                }).join('');
              }
              if (matchedCities.length) {
                html += '<div class="wd-booking__dd-dest-subtitle">Villes</div>';
                html += matchedCities.map(c => {
                  const hotel = allHotels.find(h => h.loc.split(',')[0].trim() === c);
                  const region = REGION_HOTELS.find(r => r.hotels.some(h => h.loc.split(',')[0].trim() === c));
                  const country = hotel ? hotel.country : '';
                  return '<button class="wd-booking__dd-dest-item" data-dest-type="city-global" data-dest-city="' + esc(c) + '" data-dest-country="' + esc(country) + '" data-dest-continent="' + (region ? region.id : '') + '" type="button">' +
                    esc(c) +
                    '<span class="wd-booking__dd-dest-item-count">' + esc(country) + '</span>' +
                    '</button>';
                }).join('');
              }
              if (matchedHotels.length) {
                html += '<div class="wd-booking__dd-dest-subtitle">Hotels</div>';
                html += matchedHotels.slice(0, 5).map(h => {
                  const imgKey = h.img.includes(':') ? h.img : h.img + ':1by1';
                  return '<a href="' + (h.href || '#') + '" class="wd-booking__dd-hotel-row">' +
                    '<img class="wd-booking__dd-hotel-thumb" src="' + imgBase + imgKey + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" alt="' + esc(h.name) + '" loading="lazy" />' +
                    '<div class="wd-booking__dd-hotel-info">' +
                    '<span class="wd-booking__dd-hotel-name">' + esc(h.name) + '</span>' +
                    '<span class="wd-booking__dd-hotel-loc">' + esc(h.loc.split(',')[0].trim()) + '<span class="wd-booking__dd-hotel-country">' + esc(h.loc.includes(',') ? h.loc.split(',').slice(1).join(',').trim() : '') + '</span></span>' +
                    '</div></a>';
                }).join('');
              }
            }
            if (!html) html = '<div class="wd-booking__dd-dest-subtitle">Aucun resultat</div>';
          } else {
            const hasC = getActiveCriteria().size > 0;
            html = '<div class="wd-booking__dd-dest-subtitle">Pays</div>';
            html += allCountries.map(c => {
              const inCountry = allHotels.filter(h => h.country === c);
              const count = hasC ? inCountry.filter(hotelMatchesCriteria).length : inCountry.length;
              if (hasC && count === 0) return '';
              const region = REGION_HOTELS.find(r => r.hotels.some(h => h.country === c));
              return '<button class="wd-booking__dd-dest-item" data-dest-type="country-global" data-dest-country="' + esc(c) + '" data-dest-continent="' + (region ? region.id : '') + '" type="button">' +
                esc(c) +
                '<span class="wd-booking__dd-dest-item-count">' + count + ' hôtel' + (count > 1 ? 's' : '') + '</span>' +
                '<span class="wd-booking__dd-dest-item-arrow"><svg viewBox="0 0 12 12"><polyline points="4,2 8,6 4,10"/></svg></span>' +
                '</button>';
            }).join('');
          }
          destListEl.innerHTML = renderRelaxation() + html + '<div class="wd-booking__dd-results-bar">' + renderResultsCount() + '</div>';
          return;
        }
        const countries = getCountries();
        const region = getRegion();
        const hasCriteria = getActiveCriteria().size > 0;
        // Onglet Restaurants : on compte des lieux de restauration, pas des hôtels. Les
        // critères de cet onglet ne se lisent pas sur les services d'un hôtel — les leur
        // appliquer donnait des comptes qui ne voulaient rien dire, et cachait des pays
        // qui ont pourtant des tables.
        const surRestos = searchState.activeTab === 'restaurants';
        const surReunions = searchState.activeTab === 'reunions';
        const lieuxDe = (nomHotel) => (window.WD_RESTAURANTS || [])
          .filter(v => v.hotel === nomHotel && restoMatchesCriteria(v));
        // Un hôtel répond côté réunions s'il a des espaces et qu'ils satisfont les
        // critères. Ceux qui n'en publient pas ne sont pas des candidats.
        const reunionDe = (nomHotel) => (window.WD_REUNIONS || [])
          .filter(r => r.hotel === nomHotel && reunionMatchesCriteria(r));
        const countryListHtml = countries.map(c => {
          const allInCountry = region.hotels.filter(h => h.country === c);
          const pertinent = (h) => surRestos ? lieuxDe(h.name).length > 0
            : surReunions ? reunionDe(h.name).length > 0
            : hotelMatchesCriteria(h);
          const hotelsInCountry = (hasCriteria || surReunions) ? allInCountry.filter(pertinent) : allInCountry;
          const count = surRestos
            ? allInCountry.reduce((n, h) => n + lieuxDe(h.name).length, 0)
            : hotelsInCountry.length;
          if (hasCriteria && count === 0 && searchState.expandedCountry !== c) return '';
          const isExpanded = searchState.expandedCountry === c;
          let html = '<button class="wd-booking__dd-dest-item' + (isExpanded ? ' wd-booking__dd-dest-item--expanded' : '') + (hasCriteria && count === 0 ? ' wd-booking__dd-dest-item--empty' : '') + '" data-dest-type="country" data-dest-value="' + esc(c) + '" type="button">' +
            esc(c) +
            '<span class="wd-booking__dd-dest-item-count">' + count + ' ' +
              (surRestos ? motLieux(count) : 'hôtel' + (count > 1 ? 's' : '')) + '</span>' +
            '<span class="wd-booking__dd-dest-item-arrow"><svg viewBox="0 0 12 12"><polyline points="4,2 8,6 4,10"/></svg></span>' +
            '</button>';
          if (isExpanded && surRestos) {
            // On propose des tables, pas des hôtels : c'est ce qu'on cherche ici. L'hôtel
            // n'est plus le résultat, il devient le lieu où la table se trouve.
            const tables = allInCountry.flatMap(hh => lieuxDe(hh.name).map(v => ({ v, hh })));
            html += '<div class="wd-booking__dd-country-hotels">' +
              (tables.length
                ? tables.map(({ v, hh }) => {
                    const cle = window.WD_IMG_KEY ? window.WD_IMG_KEY(hh) : (hh.img || '').split(':')[0];
                    const choisie = searchState.selectedResto === v.nom;
                    const dits = [v.type === 'bar' ? 'Bar' : 'Restaurant']
                      .concat(v.cuisines.concat(v.tags).slice(0, 2).map(id => {
                        const c = getActiveCriteriaList().find(x => x.id === id);
                        return c ? c.label : id;
                      })).join(' · ');
                    return '<button type="button" class="wd-booking__dd-hotel-row' +
                      (choisie ? ' wd-booking__dd-hotel-row--selected' : '') +
                      '" data-dest-type="resto" data-resto-name="' + esc(v.nom) + '">' +
                      '<img class="wd-booking__dd-hotel-thumb" src="' + imgBase + cle + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" alt="" loading="lazy" />' +
                      '<div class="wd-booking__dd-hotel-info">' +
                        '<span class="wd-booking__dd-hotel-name">' + esc(v.nom) + '</span>' +
                        '<span class="wd-booking__dd-hotel-loc">' + esc(dits) +
                          '<span class="wd-booking__dd-hotel-country">' + esc(hh.name) + '</span></span>' +
                      '</div></button>';
                  }).join('')
                : '<p class="wd-booking__dd-country-empty">Aucune table ne répond à vos critères dans ce pays.</p>') +
            '</div>';
          } else if (isExpanded) {
            const displayHotels = hasCriteria ? hotelsInCountry : allInCountry;
            html += '<div class="wd-booking__dd-country-hotels">' +
              (displayHotels.length ? displayHotels : allInCountry).map(h => {
                const imgKey = h.img.includes(':') ? h.img : h.img + ':1by1';
                const isSelected = searchState.selectedHotel === h.name;
                // Sur l'onglet Restaurants, un hôtel est pertinent s'il a au moins un lieu
                // qui répond ; ses services propres n'ont rien à dire ici.
                const dimmed = (hasCriteria || surReunions) && !pertinent(h);
                return '<button type="button" class="wd-booking__dd-hotel-row' + (isSelected ? ' wd-booking__dd-hotel-row--selected' : '') + (dimmed ? ' wd-booking__dd-hotel-row--dimmed' : '') + '" data-dest-type="hotel" data-hotel-name="' + esc(h.name) + '" data-hotel-href="' + esc(h.href || '') + '">' +
                  '<img class="wd-booking__dd-hotel-thumb" src="' + imgBase + imgKey + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=400&hei=280" alt="' + esc(h.name) + '" loading="lazy" />' +
                  '<div class="wd-booking__dd-hotel-info">' +
                  (h.badge ? '<span class="wd-booking__dd-hotel-badge wd-booking__dd-hotel-badge--' + (h.badge === 'RÉNOVÉ' ? 'renovated' : 'new') + '">' + h.badge + '</span>' : '') +
                  '<span class="wd-booking__dd-hotel-name">' + esc(h.name) + '</span>' +
                  '<span class="wd-booking__dd-hotel-loc">' + esc(h.loc.split(',')[0].trim()) + '<span class="wd-booking__dd-hotel-country">' + esc(h.loc.includes(',') ? h.loc.split(',').slice(1).join(',').trim() : '') + '</span></span>' +
                  '</div></button>';
              }).join('') +
              '</div>';
          }
          return html;
        }).join('');
        destListEl.innerHTML = renderRelaxation() + '<div class="wd-booking__dd-dest-subtitle">Pays</div>' + countryListHtml + '<div class="wd-booking__dd-results-bar">' + renderResultsCount() + '</div>';
        // Auto-scroll vers le pays nouvellement déplié (dans le panneau seulement, une fois par sélection)
        if (searchState.expandedCountry && searchState.expandedCountry !== lastScrolledCountry) {
          lastScrolledCountry = searchState.expandedCountry;
          const target = destListEl.querySelector('.wd-booking__dd-dest-item--expanded');
          const scroller = destListEl.closest('.wd-booking__dd-dest-col');
          if (target && scroller) {
            setTimeout(() => {
              const delta = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
              scroller.scrollTop = scroller.scrollTop + delta - 6;
            }, 0);
          }
        } else if (!searchState.expandedCountry) {
          lastScrolledCountry = null;
        }
      };

      const renderCriteria = () => {
        if (isIntermediate()) { criteriaListEl.innerHTML = ''; return; }
        const groups = getActiveCriteriaGroups();
        const activeCriteria = getActiveCriteria();
        if (!groups.length) { criteriaListEl.innerHTML = ''; return; }
        criteriaListEl.innerHTML = groups.map(g => {
          const groupItems = g.items.map(c => {
            const checked = activeCriteria.has(c.id);
            return '<button class="wd-booking__dd-criteria-item' + (checked ? ' wd-booking__dd-criteria-item--checked' : '') + '" data-criteria="' + c.id + '" type="button" role="checkbox" aria-checked="' + checked + '">' +
              '<span class="wd-booking__dd-criteria-check"></span>' +
              esc(c.label) +
              '</button>';
          }).join('');
          return '<div class="wd-booking__dd-group-label">' + esc(g.group) + '</div>' + groupItems;
        }).join('');
      };

      // Bouton « tout effacer » (façon Spotify) : visible dès qu'il y a une recherche en cours
      const clearBtn = this.querySelector('#wd-dest-clear');
      const updateClearBtn = () => {
        if (!clearBtn) return;
        const hasSomething = buildChips().length > 0 || (searchState.freeText && searchState.freeText.trim().length > 0);
        clearBtn.classList.toggle('wd-booking__dest-clear--visible', hasSomething);
      };
      const clearAllSearch = () => {
        searchState.continent = null;
        searchState.showAll = false;
        searchState.country = null;
        searchState.city = null;
        searchState.expandedCountry = null;
        searchState.selectedHotel = null;
        searchState.freeText = '';
        getActiveCriteria().clear();
        destInput.value = '';
        suggestionsEl.style.display = 'none';
        if (!(ddMapview && ddMapview.style.display !== 'none')) searchPanelEl.style.display = '';
        renderPanel();
        destInput.focus();
      };

      const MAX_VISIBLE_CHIPS = 3;
      const renderChips = () => {
        updateClearBtn();
        const chips = buildChips();
        if (!chips.length) {
          chipsEl.innerHTML = '';
          return;
        }
        const closeIcon = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>';
        const visible = chips.slice(0, MAX_VISIBLE_CHIPS);
        const overflow = chips.length - MAX_VISIBLE_CHIPS;
        let html = visible.map(c =>
          '<span class="wd-booking__dest-chip">' +
          (c.icon || '') + esc(c.label) +
          '<button class="wd-booking__dest-chip-close" data-chip-type="' + c.type + '" data-chip-id="' + esc(c.id) + '" type="button" aria-label="Supprimer ' + esc(c.label) + '">' + closeIcon + '</button>' +
          '</span>'
        ).join('');
        if (overflow > 0) {
          html += '<span class="wd-booking__dest-chip wd-booking__dest-chip--more">+' + overflow + '</span>';
        }
        chipsEl.innerHTML = html;
      };

      const searchIcon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="5"/><line x1="10" y1="10" x2="14.5" y2="14.5" stroke-linecap="round"/></svg>';
      const renderSuggestions = (text) => {
        const results = getSuggestions(text);
        if (!results.length) { suggestionsEl.style.display = 'none'; return; }
        suggestionsEl.style.display = '';
        const lower = text.toLowerCase();
        suggestionsListEl.innerHTML = results.map(s => {
          const idx = s.toLowerCase().indexOf(lower);
          let highlighted = esc(s);
          if (idx >= 0) {
            highlighted = esc(s.substring(0, idx)) + '<mark>' + esc(s.substring(idx, idx + text.length)) + '</mark>' + esc(s.substring(idx + text.length));
          }
          return '<button class="wd-booking__dd-suggestion" data-suggestion="' + esc(s) + '" type="button">' +
            '<span class="wd-booking__dd-suggestion-icon">' + searchIcon + '</span>' +
            highlighted +
            '</button>';
        }).join('');
      };

      const renderPanel = () => {
        renderContinents();
        renderBreadcrumb();
        renderDestList();
        renderCriteria();
        renderChips();
        // La carte s'aligne sur la zone de la liste à chaque redessin. C'est le seul
        // endroit qui voit passer tous les changements de destination — les rattraper un
        // par un nous a coûté quatre correctifs.
        if (typeof window.WD_SYNC_ZONE === 'function') window.WD_SYNC_ZONE(zoneCarte());
        if (typeof majFiltres === 'function') majFiltres();
        // État de divulgation porté par le composant (robuste aux re-rendus du panneau)
        if (progressiveMode) this.dataset.disclosure = isIntermediate() ? 'intermediate' : 'full';
        scheduleRecentSave(); // capture continue de la recherche en cours (même sans clic sur « Rechercher »)
      };

      // Sur mobile, chercher est une tâche à part entière : le panneau prend tout l'écran
      // au lieu de se glisser sous une barre de 56 px. C'est le composant entier qui
      // bascule, pas seulement le panneau — les trois champs restent ainsi atteignables
      // au pouce pendant qu'on affine, au lieu d'être repoussés hors du cadre.
      const surMobile = () => window.matchMedia('(max-width: 767px)').matches;

      // Le clavier ne réduit pas la fenêtre : il se pose dessus. Un panneau en position
      // fixed garde donc ses 844 px pendant qu'on n'en voit plus que 370 — la liste des
      // destinations et le bouton « Rechercher » se retrouvent sous le clavier, hors
      // d'atteinte. visualViewport est la seule mesure qui dise ce qui reste visible ;
      // le panneau s'y ajuste, et se retrouve entier au-dessus du clavier.
      const vueVisible = window.visualViewport;
      const suivreClavier = () => {
        if (!vueVisible || !this.dataset.pleinEcran) return;
        this.style.setProperty('--wd-vue-visible', Math.round(vueVisible.height) + 'px');
      };
      const basculerPleinEcran = (actif) => {
        if (actif && surMobile()) {
          this.dataset.pleinEcran = '1';
          // On bloque le défilement de la page derrière : sans cela, faire défiler la
          // liste des destinations entraîne la page et on perd le panneau de vue.
          document.body.style.overflow = 'hidden';
          if (vueVisible) {
            suivreClavier();
            vueVisible.addEventListener('resize', suivreClavier);
            vueVisible.addEventListener('scroll', suivreClavier);
          }
        } else {
          delete this.dataset.pleinEcran;
          document.body.style.overflow = '';
          this.style.removeProperty('--wd-vue-visible');
          if (vueVisible) {
            vueVisible.removeEventListener('resize', suivreClavier);
            vueVisible.removeEventListener('scroll', suivreClavier);
          }
        }
      };

      // ── Feuille de filtres, sur mobile ────────────────────────────────────────────
      // Les critères quittent le fil du panneau : ils y allongeaient la page sans qu'on
      // les cherche, alors qu'on vient d'abord choisir une destination. Ils s'ouvrent
      // maintenant par un bouton dédié, dans une feuille qu'on applique.
      const feuilleFiltres = (ouverte) => {
        if (ouverte) {
          this.dataset.filtres = '1';
          document.body.style.overflow = 'hidden';
        } else {
          delete this.dataset.filtres;
          // On ne relâche le défilement que si le panneau plein écran ne l'exige plus.
          if (!this.dataset.pleinEcran) document.body.style.overflow = '';
        }
      };

      // Le nombre de critères cochés se lit sur le bouton, et le pied de feuille annonce
      // ce qu'on obtiendra : appliquer sans savoir combien de résultats attendent oblige
      // à fermer pour vérifier.
      const majFiltres = () => {
        const n = getActiveCriteria().size;
        this.querySelectorAll('.wd-booking__filtres-compte').forEach(e => {
          e.textContent = n; e.hidden = n === 0;
        });
        const compteur = this.querySelector('.wd-booking__dd-results-count-number');
        const total = compteur ? compteur.textContent.trim() : null;
        this.querySelectorAll('.wd-booking__filtres-appliquer').forEach(e => {
          e.textContent = total ? (total > 1 ? 'Voir les ' + total + ' résultats' : 'Voir le résultat') : 'Appliquer';
        });
      };

      this.addEventListener('click', (e) => {
        if (e.target.closest('[data-ouvre-filtres]')) { e.preventDefault(); feuilleFiltres(true); majFiltres(); return; }
        if (e.target.closest('[data-ferme-filtres]')) { e.preventDefault(); feuilleFiltres(false); return; }
        if (e.target.closest('[data-ferme-plein-ecran]')) { e.preventDefault(); close(); return; }
        if (e.target.closest('[data-filtres-effacer]')) {
          e.preventDefault();
          getActiveCriteria().clear();
          renderPanel();
          if (renderMapPanel) renderMapPanel();
          if (typeof updateBookingMapCriteria === 'function') updateBookingMapCriteria(getActiveCriteria());
          majFiltres();
        }
      });
      // Échap ferme la feuille avant le panneau : c'est la couche la plus haute.
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.dataset.filtres) { e.stopPropagation(); feuilleFiltres(false); }
      });

      const open = () => {
        dropdown.dataset.state = 'open';
        basculerPleinEcran(true);
        destField.classList.add('wd-booking__field--editing');
        suggestionsEl.style.display = 'none';
        if (!(ddMapview && ddMapview.style.display !== 'none')) {
          searchPanelEl.style.display = '';
        }
        renderPanel();
        // On ne prend pas le focus sur mobile : cela ferait surgir le clavier par-dessus
        // le panneau qu'on vient d'ouvrir, avant même d'avoir vu les destinations.
        if (!surMobile()) setTimeout(() => { destInput.focus(); }, 50);
      };
      const close = () => {
        dropdown.dataset.state = 'closed';
        feuilleFiltres(false);
        basculerPleinEcran(false);
        destField.classList.remove('wd-booking__field--editing');
        renderChips();
        saveRecentNow(); // flush immédiat : la recherche est retenue même si l'utilisateur part sans chercher
      };

      continentsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.wd-booking__dd-continent');
        if (!btn) return;
        if (btn.dataset.continent === '__all__') {
          // Toggle : re-cliquer « Tous les continents » désélectionne
          const wasAll = searchState.showAll && !searchState.continent;
          searchState.showAll = !wasAll;
          searchState.continent = null;
        } else {
          // Toggle : re-cliquer le continent actif le désélectionne (retour à l'état initial)
          const same = searchState.continent === btn.dataset.continent;
          searchState.continent = same ? null : btn.dataset.continent;
          searchState.showAll = false;
        }
        searchState.expandedCountry = null;
        searchState.selectedHotel = null;
        renderPanel();
      });
      breadcrumbEl.addEventListener('click', (e) => {
        const item = e.target.closest('.wd-booking__dd-breadcrumb-item');
        if (!item || item.classList.contains('wd-booking__dd-breadcrumb-item--current')) return;
        searchState.expandedCountry = null;
        renderPanel();
      });
      destListEl.addEventListener('click', (e) => {
        const recentDel = e.target.closest('[data-recent-del]');
        if (recentDel) {
          e.preventDefault();
          const list = loadRecents();
          list.splice(parseInt(recentDel.dataset.recentDel, 10), 1);
          storeRecents(list);
          renderPanel();
          return;
        }
        // Wishlist : on part directement sur les résultats de la destination sauvegardée
        const wishBtn = e.target.closest('[data-wish-city]');
        if (wishBtn) {
          e.preventDefault();
          const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + 'search-results.html';
          const iso = (dt) => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
          const p = new URLSearchParams();
          p.set('city', wishBtn.dataset.wishCity);
          const crit = [...getActiveCriteria()];
          if (crit.length) p.set('criteria', crit.join(','));
          if (dpCheckIn) p.set('checkin', iso(dpCheckIn));
          if (dpCheckOut) p.set('checkout', iso(dpCheckOut));
          window.location.href = base + '?' + p.toString();
          return;
        }
        const recentBtn = e.target.closest('[data-recent]');
        if (recentBtn) {
          e.preventDefault();
          applyRecent(loadRecents()[parseInt(recentBtn.dataset.recent, 10)]);
          return;
        }
        const relaxBtn = e.target.closest('.wd-booking__dd-noresult-relax');
        if (relaxBtn) {
          e.preventDefault();
          getActiveCriteria().delete(relaxBtn.dataset.criteria);
          renderPanel();
          return;
        }
        const resetBtn = e.target.closest('.wd-booking__dd-noresult-reset');
        if (resetBtn) {
          e.preventDefault();
          getActiveCriteria().clear();
          renderPanel();
          return;
        }
        const restoRow = e.target.closest('[data-dest-type="resto"]');
        if (restoRow) {
          e.preventDefault();
          const nom = restoRow.dataset.restoName;
          searchState.selectedResto = searchState.selectedResto === nom ? null : nom;
          renderDestList();
          renderChips();
          scheduleRecentSave();
          return;
        }
        const hotelRow = e.target.closest('.wd-booking__dd-hotel-row');
        if (hotelRow) {
          e.preventDefault();
          const name = hotelRow.dataset.hotelName;
          searchState.selectedHotel = searchState.selectedHotel === name ? null : name;
          renderDestList();
          renderChips();
          scheduleRecentSave(); // la sélection d'hôtel fait partie de la recherche à retenir
          return;
        }
        const item = e.target.closest('.wd-booking__dd-dest-item');
        if (!item) return;
        e.preventDefault();
        const type = item.dataset.destType;
        const value = item.dataset.destValue;
        if (type === 'country') {
          searchState.expandedCountry = searchState.expandedCountry === value ? null : value;
          searchState.selectedHotel = null;
          scheduleRecentSave(); // idem pour le pays déplié
          renderDestList();
          renderChips();
          return;
        }
        else if (type === 'country-global') {
          searchState.continent = item.dataset.destContinent;
          searchState.expandedCountry = item.dataset.destCountry;
          searchState.selectedHotel = null;
          destInput.value = '';
          searchState.freeText = '';
        }
        else if (type === 'city-global') {
          searchState.continent = item.dataset.destContinent;
          searchState.expandedCountry = item.dataset.destCountry;
          searchState.selectedHotel = null;
          destInput.value = '';
          searchState.freeText = '';
        }
        renderPanel();
      });
      criteriaListEl.addEventListener('click', (e) => {
        const item = e.target.closest('.wd-booking__dd-criteria-item');
        if (!item) return;
        const id = item.dataset.criteria;
        const activeCriteria = getActiveCriteria();
        if (activeCriteria.has(id)) activeCriteria.delete(id);
        else activeCriteria.add(id);
        renderPanel();
      });
      chipsEl.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.wd-booking__dest-chip-close');
        if (!closeBtn) return;
        e.stopPropagation();
        removeChip(closeBtn.dataset.chipType, closeBtn.dataset.chipId);
      });
      let parseTimeout = null;
      let renderMapPanel = null;
      const isMapViewActive = () => ddMapview && ddMapview.style.display !== 'none';
      destInput.addEventListener('input', () => {
        const val = destInput.value.trim();
        searchState.freeText = val;
        updateClearBtn();
        clearTimeout(parseTimeout);
        if (isMapViewActive()) {
          if (val.length >= 2) {
            parseTimeout = setTimeout(() => {
              const parsed = parseQuery(val);
              let changed = false;
              parsed.criteria.forEach(cId => {
                if (!getActiveCriteria().has(cId)) { getActiveCriteria().add(cId); changed = true; }
              });
              if (parsed.continent && searchState.continent !== parsed.continent) {
                searchState.continent = parsed.continent;
                changed = true;
              }
              if (changed) {
                destInput.value = '';
                searchState.freeText = '';
                renderMapPanel();
                renderChips();
                if (typeof updateBookingMapContinent === 'function') {
                  updateBookingMapContinent(searchState.continent, getActiveCriteria(), zoneCarte());
                } else if (typeof updateBookingMapCriteria === 'function') {
                  updateBookingMapCriteria(getActiveCriteria());
                }
                destInput.focus();
              }
            }, 600);
          }
          return;
        }
        if (val.length >= 1 && !searchState.continent) {
          suggestionsEl.style.display = 'none';
          searchPanelEl.style.display = '';
          parseTimeout = setTimeout(() => {
            const parsed = parseQuery(val);
            let changed = false;
            parsed.criteria.forEach(cId => {
              if (!getActiveCriteria().has(cId)) { getActiveCriteria().add(cId); changed = true; }
            });
            if (parsed.continent && !searchState.continent) { searchState.continent = parsed.continent; changed = true; }
            // Un pays détecté filtre directement le pays (chip + liste dépliée), pas seulement le continent
            if (parsed.country && !searchState.expandedCountry) { searchState.country = parsed.country; searchState.expandedCountry = parsed.country; changed = true; }
            if (parsed.city && !searchState.city) { searchState.city = parsed.city; changed = true; }
            if (changed) {
              destInput.value = '';
              searchState.freeText = '';
              renderPanel();
              destInput.focus();
              return;
            }
          }, 600);
          renderDestList();
        } else if (val.length >= 2) {
          renderSuggestions(val);
          searchPanelEl.style.display = 'none';
          // Continent déjà sélectionné : on parse quand même la saisie (critères, pays, ville)
          parseTimeout = setTimeout(() => {
            const parsed = parseQuery(val);
            let changed = false;
            parsed.criteria.forEach(cId => { if (!getActiveCriteria().has(cId)) { getActiveCriteria().add(cId); changed = true; } });
            if (parsed.country && searchState.expandedCountry !== parsed.country) {
              if (parsed.continent) searchState.continent = parsed.continent;
              searchState.country = parsed.country;
              searchState.expandedCountry = parsed.country;
              changed = true;
            }
            if (parsed.city && !searchState.city) { searchState.city = parsed.city; changed = true; }
            if (changed) {
              destInput.value = '';
              searchState.freeText = '';
              suggestionsEl.style.display = 'none';
              searchPanelEl.style.display = '';
              renderPanel();
              destInput.focus();
            }
          }, 600);
        } else {
          suggestionsEl.style.display = 'none';
          searchPanelEl.style.display = '';
          if (!searchState.continent) renderDestList();
        }
      });
      suggestionsListEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.wd-booking__dd-suggestion');
        if (!btn) return;
        destInput.value = btn.dataset.suggestion;
        searchState.freeText = btn.dataset.suggestion;
        suggestionsEl.style.display = 'none';
        searchPanelEl.style.display = '';
        renderChips();
      });
      this.querySelector('.wd-booking__dropdown').addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { close(); e.stopPropagation(); }
      });
      continentsEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const btns = [...continentsEl.querySelectorAll('.wd-booking__dd-continent')];
          const idx = btns.indexOf(document.activeElement);
          if (idx < 0) return;
          const next = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
          if (btns[next]) { btns[next].focus(); e.preventDefault(); }
        }
      });

      renderPanel();

      const mapToggle = this.querySelector('.wd-booking__map-toggle');
      const ddMapview = this.querySelector('.wd-booking__dd-mapview');
      const mapViewContinents = this.querySelector('#wd-mapview-continents');
      const mapViewCriteria = this.querySelector('#wd-mapview-criteria');
      if (clearBtn) clearBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); clearAllSearch(); });
      updateClearBtn();
      let mapInitDone = false;
      if (mapToggle && ddMapview) {
        renderMapPanel = () => {
          // État de divulgation synchronisé aussi depuis la vue carte (critères / CTA wizard)
          if (progressiveMode) this.dataset.disclosure = isIntermediate() ? 'intermediate' : 'full';
          // Même carte « Tous les continents » que la vue liste (mode progressif)
          const allActive = !searchState.continent;
          const ALL_IMG = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop';
          const allCard = !progressiveMode ? '' :
            '<button class="wd-booking__dd-continent wd-booking__dd-continent--all' + (allActive ? ' wd-booking__dd-continent--active' : '') + '" data-continent="__all__" type="button">' +
              '<img class="wd-booking__dd-continent-img" src="' + ALL_IMG + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'none\';this.parentElement.querySelector(\'.wd-booking__dd-continent-fallback\').style.display=\'flex\'" />' +
              '<div class="wd-booking__dd-continent-overlay"></div>' +
              '<span class="wd-booking__dd-continent-fallback" style="display:none">Tous les continents</span>' +
              '<span class="wd-booking__dd-continent-label">Tous les continents</span>' +
            '</button>';
          mapViewContinents.innerHTML = allCard + REGION_HOTELS.map(r => {
            const active = r.id === searchState.continent;
            return '<button class="wd-booking__dd-continent' + (active ? ' wd-booking__dd-continent--active' : '') + '" data-continent="' + r.id + '" type="button">' +
              '<img class="wd-booking__dd-continent-img" src="' + r.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'none\';this.parentElement.querySelector(\'.wd-booking__dd-continent-fallback\').style.display=\'flex\'" />' +
              '<div class="wd-booking__dd-continent-overlay"></div>' +
              '<span class="wd-booking__dd-continent-fallback" style="display:none">' + esc(r.label) + '</span>' +
              '<span class="wd-booking__dd-continent-label">' + esc(r.label) + '</span>' +
              '</button>';
          }).join('');
          // Les critères de l'onglet courant, et non ceux des hôtels en dur : passer sur
          // Restaurants puis sur la carte faisait réapparaître piscine, spa et parking.
          mapViewCriteria.innerHTML = getActiveCriteriaGroups().map(g => {
            const groupItems = g.items.map(c => {
              const checked = getActiveCriteria().has(c.id);
              return '<button class="wd-booking__dd-criteria-item' + (checked ? ' wd-booking__dd-criteria-item--checked' : '') + '" data-criteria="' + c.id + '" type="button" role="checkbox" aria-checked="' + checked + '">' +
                '<span class="wd-booking__dd-criteria-check"></span>' + esc(c.label) + '</button>';
            }).join('');
            return '<div class="wd-booking__dd-group-label">' + esc(g.group) + '</div>' + groupItems;
          }).join('');
          // Le rattrapage de la vue carte est désormais rendu par la carte elle-même, dans
          // son panneau blanc — le même que celui qui annonce l'écartement d'un hôtel.
          // Le bloc en surimpression qui vivait ici faisait une seconde voix, qui finissait
          // par se superposer puis se succéder à la première.
        };

        // Actions du bloc de récupération (délégué sur la vue carte)
        const applyMapCriteriaChange = () => {
          renderMapPanel();
          renderPanel();
          if (typeof updateBookingMapCriteria === 'function') updateBookingMapCriteria(getActiveCriteria());
        };
        mapViewContinents.addEventListener('click', (e) => {
          const btn = e.target.closest('.wd-booking__dd-continent');
          if (!btn) return;
          const id = btn.dataset.continent;
          if (id === '__all__') {
            searchState.continent = null;
            searchState.showAll = true;
          } else {
            searchState.continent = searchState.continent === id ? null : id;
            searchState.showAll = false;
          }
          // Les quatre échelons de la destination tombent ensemble, comme en vue liste.
          // Seuls `country` et `city` étaient remis à zéro : `expandedCountry` survivait,
          // et c'est lui qui définit la zone. Choisir l'Océanie laissait donc la carte et
          // la liste sur la France, chip comprise.
          searchState.country = null;
          searchState.city = null;
          searchState.expandedCountry = null;
          searchState.selectedHotel = null;
          // renderPanel() et non renderChips() seul : le panneau liste se régénère aussi.
          // Il restait sinon figé sur la destination précédente — « 1 hôtel … — France »
          // affiché sous une carte déjà passée à l'Océanie.
          renderMapPanel();
          renderPanel();
          // `undefined` pour les critères : ils ne sont pas touchés par un changement de
          // destination, la carte garde ceux qu'elle a.
          if (typeof updateBookingMapContinent === 'function') {
            updateBookingMapContinent(searchState.continent, undefined, zoneCarte());
          }
        });
        mapViewCriteria.addEventListener('click', (e) => {
          const item = e.target.closest('.wd-booking__dd-criteria-item');
          if (!item) return;
          const id = item.dataset.criteria;
          const ac = getActiveCriteria();
          if (ac.has(id)) ac.delete(id);
          else ac.add(id);
          renderMapPanel();
          renderPanel();
          if (typeof updateBookingMapCriteria === 'function') updateBookingMapCriteria(ac);
        });

        // La carte élargit d'elle-même quand un critère vide le pays choisi : elle
        // remonte au continent pour montrer les hôtels qui répondent. La liste doit
        // suivre le même mouvement, sinon les deux vues se contrediraient à nouveau —
        // la carte sur l'Asie, les chips encore sur la Chine. Renvoie la nouvelle zone
        // pour que la carte reparte de celle que la liste vient d'adopter.
        // La carte affiche elle-même le rattrapage quand un critère écarte l'hôtel ouvert :
        // elle a besoin de la suggestion et des deux actions, qui restent calculées ici,
        // sur les données de la liste. Les faire transiter par le DOM aurait supposé que
        // le clic remonte jusqu'ici, ce que Leaflet n'assure pas dans son conteneur.
        window.WD_ASSOUPLISSEMENT = () => {
          const r = chercherAssouplissement();
          return r ? r.best : null;
        };
        window.WD_RETIRER_CRITERE = (id) => { getActiveCriteria().delete(id); applyMapCriteriaChange(); };
        window.WD_REINITIALISER_CRITERES = () => { getActiveCriteria().clear(); applyMapCriteriaChange(); };

        // La carte doit savoir sur quel onglet on se trouve, et ce qu'un hôtel propose à
        // manger : ses critères de restauration ne se lisent pas sur les services de
        // l'établissement. Elle interroge la liste plutôt que de refaire le calcul.
        window.WD_ONGLET = () => searchState.activeTab;
        // Le mot qui nomme ce qu'on compte, décidé par la liste : « restaurants et bars »,
        // ou « bars » seuls dès que le type est choisi. La carte ne le redevine pas.
        window.WD_MOT_LIEUX = (n) => motLieux(n);
        // Combien de tables répondent, dans une zone donnée.
        window.WD_TABLES_ZONE = (continent, country) => (window.WD_RESTAURANTS || [])
          .filter(v => (country ? v.pays === country : (continent ? v.region === continent : true)))
          .filter(restoMatchesCriteria).length;
        window.WD_LIEUX_HOTEL = (nomHotel) => (window.WD_RESTAURANTS || [])
          .filter(v => v.hotel === nomHotel && restoMatchesCriteria(v));
        // Espaces de réunion d'un hôtel, s'ils répondent aux critères cochés.
        window.WD_REUNION_HOTEL = (nomHotel) => (window.WD_REUNIONS || [])
          .filter(r => r.hotel === nomHotel && reunionMatchesCriteria(r));

        // Cliquer une ville sur la carte la porte dans le champ de recherche. On ne
        // recadre pas au passage : l'utilisateur vient d'y arriver, déplacer la vue sous
        // ses yeux serait lui reprendre ce qu'il a demandé.
        // Ouvrir la card d'un hôtel l'inscrit dans le champ ; la refermer rend la ville.
        window.WD_CHOISIR_HOTEL = (nom) => {
          if (searchState.selectedHotel === nom) return zoneCarte();
          searchState.selectedHotel = nom;
          renderPanel();
          if (renderMapPanel) renderMapPanel();
          return zoneCarte();
        };
        window.WD_OUBLIER_HOTEL = () => {
          if (!searchState.selectedHotel) return zoneCarte();
          searchState.selectedHotel = null;
          renderPanel();
          if (renderMapPanel) renderMapPanel();
          return zoneCarte();
        };

        window.WD_CHOISIR_VILLE = (ville, pays, continent) => {
          searchState.city = ville;
          if (continent && !searchState.continent) searchState.continent = continent;
          if (pays) { searchState.country = pays; searchState.expandedCountry = pays; }
          searchState.selectedHotel = null;
          renderPanel();
          if (renderMapPanel) renderMapPanel();
          scheduleRecentSave();
          return zoneCarte();
        };

        // Élargissement demandé par la carte quand on dézoome au-delà du périmètre courant.
        // `niveau` : 'country' ou 'continent'.
        window.WD_ELARGIR_A = (niveau) => {
          if (niveau === 'continent') {
            searchState.city = null;
            searchState.country = null;
            searchState.expandedCountry = null;
          } else {
            searchState.city = null;
          }
          searchState.selectedHotel = null;
          renderPanel();
          if (renderMapPanel) renderMapPanel();
          scheduleRecentSave();
          return zoneCarte();
        };

        window.WD_ELARGIR_AU_CONTINENT = () => {
          searchState.country = null;
          searchState.city = null;
          searchState.expandedCountry = null;
          searchState.selectedHotel = null;
          renderMapPanel();
          renderChips();
          return zoneCarte();
        };

        const clearFiltersBtn = this.querySelector('#wd-clear-map-filters');
        if (clearFiltersBtn) {
          clearFiltersBtn.addEventListener('click', () => {
            getActiveCriteria().clear();
            renderMapPanel();
            renderChips();
            if (typeof updateBookingMapCriteria === 'function') updateBookingMapCriteria(getActiveCriteria());
          });
        }

        mapToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const showing = ddMapview.style.display !== 'none';
          if (showing) {
            ddMapview.style.display = 'none';
            searchPanelEl.style.display = '';
          } else {
            ddMapview.style.display = '';
            searchPanelEl.style.display = 'none';
            suggestionsEl.style.display = 'none';
            renderMapPanel();
          }
          mapToggle.classList.toggle('wd-booking__map-toggle--active', !showing);
          // Sur mobile la carte prend toute la place restante : le CSS a besoin de savoir
          // quelle vue est ouverte, et Leaflet de réapprendre sa taille après le basculement.
          if (showing) delete this.dataset.vueCarte; else this.dataset.vueCarte = '1';
          if (window.WD_MAP_RESIZE) setTimeout(window.WD_MAP_RESIZE, 260);
          if (!showing && typeof initBookingMap === 'function') {
            setTimeout(() => {
              initBookingMap(searchState.continent, zoneCarte());
              // Reporter sur la carte les critères déjà cochés en vue liste
              if (getActiveCriteria().size && typeof updateBookingMapCriteria === 'function') {
                updateBookingMapCriteria(getActiveCriteria());
              }
            }, 200);
            mapInitDone = true;
          }
        });
      }

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
      // Séjour par défaut : ce soir → demain. Une recherche part ainsi toujours de dates
      // réelles, et le tarif affiché correspond à quelque chose. La restauration depuis
      // l'URL les remplace si la page en porte.
      const demain = new Date(today); demain.setDate(demain.getDate() + 1);
      let dpCheckIn = new Date(today);
      let dpCheckOut = demain;
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
        scheduleRecentSave(); // les dates font partie de la recherche à retenir
        if (!dpCheckIn) {
          dateField.classList.remove('wd-booking__field--selected');
          if (dateLabel) dateLabel.innerHTML = 'À quelles dates ? <span style="font-weight:300;opacity:.6">(facultatif)</span>';
          if (dateValue) dateValue.textContent = 'JJ/MM/AAAA → JJ/MM/AAAA';
          return;
        }
        // L'intitulé reste dans le label et la plage passe dans la valeur, comme le champ
        // voyageurs. Depuis que le séjour a une valeur par défaut, l'état « sélectionné »
        // est permanent : mettre la plage dans le label aurait supprimé pour de bon la
        // question « À quelles dates ? » et désaligné ce champ de ses voisins.
        dateField.classList.add('wd-booking__field--selected');
        const fmtD = (dt) => dt.getDate() + ' ' + MONTH_SHORT[dt.getMonth()];
        if (dateLabel) dateLabel.textContent = 'À quelles dates ?';
        if (dpCheckIn && dpCheckOut) {
          const sameYear = dpCheckIn.getFullYear() === dpCheckOut.getFullYear();
          const plage = fmtD(dpCheckIn) + ' → ' + fmtD(dpCheckOut) + (sameYear ? ' ' + dpCheckOut.getFullYear() : '');
          if (dateValue) dateValue.textContent = plage + (dpFlex > 0 ? '  ·  ±' + dpFlex + 'j' : '');
        } else {
          if (dateValue) dateValue.textContent = fmtD(dpCheckIn) + ' → sélectionnez le départ';
        }
      };

      const openDatePicker = () => {
        if (dropdown.dataset.state === 'open') {
          dropdown.dataset.state = 'closed';
          destField.classList.remove('wd-booking__field--editing');
        }
        // le champ Dates stoppe la propagation : on referme le panneau voyageurs explicitement
        if (guestsPanel && guestsPanel.dataset.state === 'open') closeGuests();
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
          // « Effacer » revient au séjour par défaut plutôt que de vider : une recherche
          // porte toujours des dates, sinon le tarif redeviendrait inaffichable et la
          // page de résultats afficherait autre chose que la barre.
          dpCheckIn = new Date(today);
          dpCheckOut = new Date(today); dpCheckOut.setDate(dpCheckOut.getDate() + 1);
          dpHover = null; dpFlex = 0;
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

      // La barre affiche les dates dès le chargement : sans cet appel elle gardait le
      // « 01/04/2025 → 02/04/2025 » figé dans le gabarit, sans rapport avec la recherche.
      formatDateField();
      // ===== END DATE PICKER =====

      // ===== VOYAGEURS / CHAMBRES =====
      // Bornes relevées sur le moteur de réservation Pullman (pullman.accor.com) :
      // 7 chambres max, 1 à 9 adultes et 0 à 6 enfants par chambre, âge requis de 0 à 11 ans
      // (12 ans et plus compte comme un adulte).
      const GP = { rooms: 7, adults: 9, children: 6, childAge: 11 };
      const guestsPanel = this.querySelector('.wd-booking__guests');
      const guestsField = allFields[2];
      const gpRoomsEl = this.querySelector('#wd-gp-rooms');
      const gpAddBtn = this.querySelector('#wd-gp-add');
      const gpHintEl = this.querySelector('#wd-gp-hint');
      const guestsValue = guestsField ? guestsField.querySelector('.wd-booking__value') : null;

      // Un enfant sans âge vaut null : on affiche le placeholder « - » comme Pullman,
      // et on empêche la validation tant qu'il en reste.
      const newRoom = () => ({ adults: 1, children: [] });
      let gpRooms = [newRoom()];

      const gpTotals = () => gpRooms.reduce((a, r) => ({
        adults: a.adults + r.adults,
        children: a.children + r.children.length
      }), { adults: 0, children: 0 });

      const gpMissingAges = () => gpRooms.reduce((n, r) => n + r.children.filter(a => a === null).length, 0);

      const plural = (n, s, p) => n + ' ' + (n > 1 ? (p || s + 's') : s);

      const gpSummary = () => {
        const { adults, children } = gpTotals();
        // « 1 personne » reste plus naturel que « 1 adulte » quand on voyage seul
        const who = (adults === 1 && !children) ? '1 personne'
          : [plural(adults, 'adulte'), children ? plural(children, 'enfant') : null].filter(Boolean).join(', ');
        return who + ', ' + plural(gpRooms.length, 'chambre');
      };

      const renderGuests = () => {
        const multi = gpRooms.length > 1;
        gpRoomsEl.innerHTML = gpRooms.map((room, i) => {
          const counter = (kind, label, val, min, max) =>
            '<div class="wd-booking__gp-counter">' +
              '<span class="wd-booking__gp-counter-label">' + label + '</span>' +
              '<div class="wd-booking__gp-counter-ctrl">' +
                '<button type="button" class="wd-booking__gp-btn" data-gp="minus" data-kind="' + kind + '" data-room="' + i + '"' +
                  (val <= min ? ' disabled' : '') + ' aria-label="Retirer un ' + label.toLowerCase().replace(/\(s\)/, '') + ' de la chambre ' + (i + 1) + '">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>' +
                '<span class="wd-booking__gp-count" aria-live="polite">' + val + '</span>' +
                '<button type="button" class="wd-booking__gp-btn" data-gp="plus" data-kind="' + kind + '" data-room="' + i + '"' +
                  (val >= max ? ' disabled' : '') + ' aria-label="Ajouter un ' + label.toLowerCase().replace(/\(s\)/, '') + ' à la chambre ' + (i + 1) + '">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>' +
              '</div>' +
            '</div>';

          const ages = room.children.map((age, j) =>
            '<label class="wd-booking__gp-age">' +
              '<span class="wd-booking__gp-age-label">Âge enfant ' + (j + 1) + '</span>' +
              '<select class="wd-booking__gp-age-select' + (age === null ? ' wd-booking__gp-age-select--empty' : '') + '" data-room="' + i + '" data-child="' + j + '">' +
                '<option value="">-</option>' +
                Array.from({ length: GP.childAge + 1 }, (_, a) =>
                  '<option value="' + a + '"' + (age === a ? ' selected' : '') + '>' + a + (a <= 1 ? ' an' : ' ans') + '</option>').join('') +
              '</select>' +
            '</label>').join('');

          return '<div class="wd-booking__gp-room">' +
            '<div class="wd-booking__gp-room-head">' +
              '<span class="wd-booking__gp-room-title">Chambre ' + (i + 1) + '</span>' +
              (multi ? '<button type="button" class="wd-booking__gp-remove" data-gp="remove-room" data-room="' + i + '">Supprimer</button>' : '') +
            '</div>' +
            counter('adults', 'Adulte(s)', room.adults, 1, GP.adults) +
            counter('children', 'Enfant(s)', room.children.length, 0, GP.children) +
            (ages ? '<div class="wd-booking__gp-ages">' + ages + '</div>' : '') +
          '</div>';
        }).join('');

        gpAddBtn.disabled = gpRooms.length >= GP.rooms;
        const missing = gpMissingAges();
        gpHintEl.textContent = missing
          ? 'Indiquez l’âge de ' + (missing > 1 ? 'chaque enfant' : 'l’enfant') + ' pour continuer.'
          : gpSummary();
        gpHintEl.classList.toggle('wd-booking__gp-hint--warn', missing > 0);
        const applyBtn = guestsPanel.querySelector('.wd-booking__gp-apply');
        if (applyBtn) applyBtn.disabled = missing > 0;
      };

      const formatGuestsField = () => { if (guestsValue) guestsValue.textContent = gpSummary(); };

      const openGuests = () => {
        if (dropdown.dataset.state === 'open') { dropdown.dataset.state = 'closed'; destField.classList.remove('wd-booking__field--editing'); }
        if (datepicker.dataset.state === 'open') closeDatePicker();
        guestsPanel.dataset.state = 'open';
        guestsField.classList.add('wd-booking__field--editing');
        guestsField.setAttribute('aria-expanded', 'true');
        renderGuests();
      };

      const closeGuests = () => {
        guestsPanel.dataset.state = 'closed';
        guestsField.classList.remove('wd-booking__field--editing');
        guestsField.setAttribute('aria-expanded', 'false');
        formatGuestsField();
        scheduleRecentSave();
      };

      if (guestsField && guestsPanel) {
        guestsField.style.cursor = 'pointer';
        guestsField.addEventListener('click', (e) => {
          e.stopPropagation();
          if (guestsPanel.dataset.state === 'open') closeGuests(); else openGuests();
        });
        guestsField.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); guestsField.click(); }
        });

        guestsPanel.addEventListener('click', (e) => {
          e.stopPropagation();
          const btn = e.target.closest('[data-gp]');
          if (!btn || btn.disabled) return;
          const i = Number(btn.dataset.room);
          const room = gpRooms[i];
          if (btn.dataset.gp === 'remove-room') { gpRooms.splice(i, 1); renderGuests(); return; }
          if (!room) return;
          const delta = btn.dataset.gp === 'plus' ? 1 : -1;
          if (btn.dataset.kind === 'adults') {
            room.adults = Math.min(GP.adults, Math.max(1, room.adults + delta));
          } else {
            if (delta > 0 && room.children.length < GP.children) room.children.push(null);
            else if (delta < 0) room.children.pop();
          }
          renderGuests();
        });

        guestsPanel.addEventListener('change', (e) => {
          const sel = e.target.closest('.wd-booking__gp-age-select');
          if (!sel) return;
          const room = gpRooms[Number(sel.dataset.room)];
          if (room) room.children[Number(sel.dataset.child)] = sel.value === '' ? null : Number(sel.value);
          renderGuests();
        });

        gpAddBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (gpRooms.length < GP.rooms) { gpRooms.push(newRoom()); renderGuests(); }
        });

        guestsPanel.querySelector('.wd-booking__gp-reset').addEventListener('click', (e) => {
          e.stopPropagation(); gpRooms = [newRoom()]; renderGuests();
        });
        guestsPanel.querySelector('.wd-booking__gp-apply').addEventListener('click', (e) => {
          e.stopPropagation(); if (!gpMissingAges()) closeGuests();
        });

        document.addEventListener('click', (e) => {
          if (guestsPanel.dataset.state === 'open' && !guestsPanel.contains(e.target) && !guestsField.contains(e.target)) closeGuests();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && guestsPanel.dataset.state === 'open') { closeGuests(); guestsField.focus(); }
        });
        formatGuestsField();
      }

      // Exposé pour la construction de l'URL de recherche
      this._guestsState = () => ({ rooms: gpRooms, totals: gpTotals(), summary: gpSummary() });
      // ===== FIN VOYAGEURS / CHAMBRES =====

      destField.addEventListener('click', () => { if (dropdown.dataset.state !== 'open') open(); });
      document.addEventListener('mousedown', e => {
        if (dropdown.dataset.state === 'open' && !e.target.closest('.wd-booking')) close();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && dropdown.dataset.state === 'open') close();
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (dropdown.dataset.state !== 'open') open(); else destInput.focus(); }
      });

      const ctaBtn = this.querySelector('.wd-booking__cta');
      if (ctaBtn) {
        const searchBase = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + 'search-results.html';
        const fmtISO = (dt) => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        // URL structurée construite au clic : l'état exact de la recherche est restaurable à l'arrivée
        ctaBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const p = new URLSearchParams();
          // L'onglet fait partie de la recherche : la page de résultats en dépend pour
          // savoir si elle liste des hôtels ou des tables.
          if (searchState.activeTab !== 'hotels') p.set('tab', searchState.activeTab);
          if (searchState.activeTab === 'restaurants' && searchState.selectedResto) p.set('resto', searchState.selectedResto);
          if (searchState.selectedHotel) p.set('hotel', searchState.selectedHotel);
          if (searchState.expandedCountry) p.set('country', searchState.expandedCountry);
          if (searchState.city) p.set('city', searchState.city);
          if (searchState.continent) p.set('continent', searchState.continent);
          else if (searchState.showAll) p.set('continent', 'all');
          const crit = [...getActiveCriteria()];
          if (crit.length) p.set('criteria', crit.join(','));
          const q = destInput.value.trim();
          if (q) p.set('q', q);
          if (dpCheckIn) p.set('checkin', fmtISO(dpCheckIn));
          if (dpCheckOut) p.set('checkout', fmtISO(dpCheckOut));
          if (dpFlex > 0) p.set('flex', String(dpFlex));
          // Occupation : on ne pousse dans l'URL que ce qui s'écarte du défaut (1 adulte, 1 chambre)
          const g = gpTotals();
          if (g.adults !== 1) p.set('adults', String(g.adults));
          if (g.children) p.set('children', String(g.children));
          if (gpRooms.length !== 1) p.set('rooms', String(gpRooms.length));
          const ages = gpRooms.flatMap(r => r.children).filter(a => a !== null);
          if (ages.length) p.set('ages', ages.join(','));
          const qs = p.toString();
          window.location.href = searchBase + (qs ? '?' + qs : '');
        });
      }

      // ===== Restauration de l'état depuis l'URL (page résultats / deep-link) =====
      (() => {
        const p = new URLSearchParams(window.location.search);
        if (![...p.keys()].length) return;
        let touched = false;
        const cont = p.get('continent');
        if (cont === 'all') { searchState.showAll = true; touched = true; }
        else if (cont && REGION_HOTELS.some(r => r.id === cont)) { searchState.continent = cont; touched = true; }
        const country = p.get('country');
        if (country) { searchState.country = country; searchState.expandedCountry = country; touched = true; }
        if (p.get('city')) { searchState.city = p.get('city'); touched = true; }
        if (p.get('hotel')) { searchState.selectedHotel = p.get('hotel'); touched = true; }
        (p.get('criteria') || '').split(',').filter(Boolean).forEach(id => { getActiveCriteria().add(id); touched = true; });
        if (p.get('checkin')) { dpCheckIn = new Date(p.get('checkin') + 'T12:00:00'); touched = true; }
        if (p.get('checkout')) { dpCheckOut = new Date(p.get('checkout') + 'T12:00:00'); touched = true; }
        if (p.get('flex')) { dpFlex = parseInt(p.get('flex'), 10) || 0; }
        // Occupation : on répartit les adultes puis les enfants sur les chambres demandées,
        // en respectant les mêmes bornes que le panneau (9 adultes / 6 enfants par chambre).
        const nRooms = Math.min(GP.rooms, Math.max(1, parseInt(p.get('rooms'), 10) || 1));
        const nAdults = Math.max(1, parseInt(p.get('adults'), 10) || 1);
        const nChildren = Math.max(0, parseInt(p.get('children'), 10) || 0);
        if (nRooms > 1 || nAdults > 1 || nChildren > 0) {
          const ages = (p.get('ages') || '').split(',').filter(s => s !== '').map(Number);
          // Chaque chambre part avec un adulte (aucune chambre ne peut être vide), puis on
          // répartit le reste — sinon 3 adultes sur 2 chambres en produirait 4.
          gpRooms = Array.from({ length: nRooms }, () => ({ adults: 1, children: [] }));
          let reste = Math.max(0, nAdults - nRooms);
          while (reste > 0) {
            const r = gpRooms.find(r => r.adults < GP.adults);
            if (!r) break;
            r.adults++; reste--;
          }
          for (let i = 0; i < nChildren; i++) {
            const r = gpRooms.find(r => r.children.length < GP.children);
            if (r) r.children.push(ages[i] === undefined ? null : ages[i]);
          }
          formatGuestsField();
          touched = true;
        }
        if (touched) { formatDateField(); renderChips(); }
      })();

      // Données de recherche exposées pour la page de résultats (source unique : REGION_HOTELS)
      window.WD_SEARCH_DATA = {
        regions: REGION_HOTELS,
        hotels: WD_HOTELS,            // liste à plat, géolocalisée : source unique
        criteriaToServices: CRITERIA_TO_SERVICES,
        criteriaGroups: CRITERIA_GROUPS,
        imgBase: imgBase
      };

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
          // Q3 : "oui, j'ai des idées" → on demande les destinations (3.2).
          //      "non, pas encore d'idées" → inspiration par régions (3.3),
          //      surtout PAS la question "entre quelles destinations hésitez-vous".
          //      "repartir de ma wishlist" (connecté) → écran wishlist.
          if (state.destinationIdea === 'yes') {
            return 3.2;
          } else if (state.destinationIdea === 'no') {
            return 3.3;
          } else if (state.destinationIdea === 'multiple') {
            return 3.3;
          } else if (state.destinationIdea === 'wishlist') {
            return 'wishlist';
          }
          return 3;

        case 3.1:
          // Q3.1 → Q4
          return 4;

        case 3.2:
          // Q3.2 (destinations saisies) → Q4 (période)
          return 4;

        case 3.3:
          // Q3.3 → Q4
          return 4;

        case 'wishlist':
          // Écran wishlist → Q5 (période), seulement si une destination est retenue
          return state.destinationInput ? 4 : 'wishlist';

        case 4:
          // Q4 → Q5
          return 5;

        case 5:
          // Q6 services (flux standard) → Résultats
          // (l'étape 6 n'est utilisée que par le flux business, qui affiche
          //  les services à l'étape 6)
          return 'results';

        case 6:
          // Q6 services (flux business) → Résultats
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
        familyDetails: { adultsCount: null, childrenCount: null, childrenAges: [], childrenNames: [] },
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
      this.state = this.getInitialState();
      this.keydownHandler = null;
    }

    // Source unique de l'état initial — utilisée par le constructeur, restart()
    // et close(). Évite tout state incomplet (champs undefined) après réouverture.
    getInitialState() {
      return {
        currentStep: 1,
        stepHistory: [],
        carouselIndex: 1,
        isConnected: false,
        userProfile: null,
        selectedStayType: null,
        selectedWho: null,
        selectedYear: new Date().getFullYear(),
        showYearPicker: false,
        familyDetails: { adultsCount: null, childrenCount: null, childrenAges: [], childrenNames: [] },
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
        results: [],
        // État événement (branche V2)
        eventFamily: null,
        eventSubType: null,
        eventVolume: null,
        eventNeeds: [],
        // État pro V2
        proContext: null,
        proNeeds: [],
        bleisureChoice: null,
        // État guide (mini-triage)
        guideWork: null,
        guideGroup: null
      };
    }

    // Vrai si la destination retenue correspond à une entrée de la wishlist
    // (utilisé pour l'état sélectionné des cartes et l'activation de "Continuer").
    _isWishlistSelected() {
      const wishlist = (this.state.userProfile && this.state.userProfile.wishlist) || [];
      return wishlist.some(d => (d.country ? `${d.name}, ${d.country}` : d.name) === this.state.destinationInput);
    }

    // Pré-remplit familyDetails depuis le profil connecté (enfants connus).
    _prefillFamilyFromProfile() {
      if (!this.state.isConnected || !this.state.userProfile) return;
      const members = this.state.userProfile.familyMembers;
      if (!Array.isArray(members) || members.length === 0) return;
      if (this.state.familyDetails.childrenCount) return;
      this.state.familyDetails.adultsCount = 2;
      this.state.familyDetails.childrenCount = members.length;
      this.state.familyDetails.childrenNames = members.map(m => m.firstName);
      this.state.familyDetails.childrenAges = members.map(m => m.age);
    }

    // Vrai seulement si connecté ET wishlist non vide (gate des features perso).
    _hasWishlist() {
      return !!(this.state.isConnected && this.state.userProfile
        && Array.isArray(this.state.userProfile.wishlist)
        && this.state.userProfile.wishlist.length > 0);
    }

    // Bascule l'état de connexion. À true, mocke userProfile (aucun appel API à
    // ce stade). À utiliser pour tester / brancher un vrai flux d'auth plus tard.
    setConnected(connected) {
      this.state.isConnected = !!connected;
      this.state.userProfile = connected ? this._mockUserProfile() : null;
    }

    // Profil factice (itérations futures : wishlist, prefill Q1.5, points…).
    _mockUserProfile() {
      return WD_USER_PROFILE; // source unique (voir en haut du fichier)
    }

    render() {
      const step = this.state.currentStep;
      if (step === 1) {
        return this.renderQuestion1();
      } else if (step === 1.5) {
        return this.renderQuestion1_5();
      } else if (step === 2) {
        return this.renderQuestion2();
      } else if (step === 'pro-location' || step === 'event-location') {
        return this.renderQuestion_BusinessLocation();
      } else if (step === 'pro-dates' || step === 'event-dates') {
        return this.renderQuestion_BusinessDates();
      } else if (step === 'business-location') {
        return this.renderQuestion_BusinessLocation();
      } else if (step === 'business-dates') {
        return this.renderQuestion_BusinessDates();
      } else if (step === 'pro-needs') {
        return this.renderProNeeds();
      } else if (step === 'pro-bleisure') {
        return this.renderProBleisure();
      } else if (step === 'event-family') {
        return this.renderEventFamily();
      } else if (step === 'event-subtype') {
        return this.renderEventSubtype();
      } else if (step === 'event-volume') {
        return this.renderEventVolume();
      } else if (step === 'event-needs') {
        return this.renderEventNeeds();
      } else if (step === 'guide-1') {
        return this.renderGuide1();
      } else if (step === 'guide-2') {
        return this.renderGuide2();
      } else if (step === 3) {
        return this.renderQuestion3();
      } else if (step === 3.1) {
        return this.renderQuestion3_OneDestination();
      } else if (step === 3.2) {
        return this.renderQuestion3_MultipleDestinations();
      } else if (step === 3.3) {
        return this.renderQuestion3_Regions();
      } else if (step === 'wishlist') {
        return this.renderQuestion3_Wishlist();
      } else if (step === 4) {
        return this.renderQuestion4_Period();
      } else if (step === 5) {
        return this.renderQuestion5_Services();
      } else if (step === 6) {
        return this.renderQuestion5_Services();
      } else if (step === 'results-loading') {
        return this.renderResultsLoading();
      } else if (step === 'results') {
        return this.renderResults();
      }
      return '';
    }

    _getStepTotal() {
      switch (this.state.selectedStayType) {
        case 'pro': return 5;
        case 'event': return 7;
        case 'guide': return 3;
        default: return 7;
      }
    }

    renderQuestion1() {
      const options = [
        { value: 'escapade', label: 'Une escapade', desc: 'Séjour loisir, détente, découverte', image: '../../assets/images/discovery/couple.avif' },
        { value: 'pro', label: 'Un déplacement pro', desc: 'Voyage d\'affaires, coworking', image: '../../assets/images/discovery/business.avif' },
        { value: 'event', label: 'Un événement', desc: 'Séminaire, mariage, célébration', image: '../../assets/images/Q1/event.webp' },
        { value: 'guide', label: 'Je me laisse guider', desc: 'Pas encore sûr ? On vous oriente', image: '../../assets/images/discovery/city.avif' }
      ];

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, quel séjour préparez-vous ?` : 'Quel séjour préparez-vous ?'}</h2>
            <p class="wd-discovery-modal__subtitle">Dites-nous ce qui vous amène et nous vous guiderons vers l'expérience Pullman idéale.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">1. Quel type de séjour préparez-vous ?</label>
              <div class="wd-discovery-modal__options">
                ${options.map((opt, i) => {
                  const isSelected = this.state.selectedStayType === opt.value;
                  let className = 'wd-discovery-modal__option wd-discovery-modal__option--card';
                  const idx = this.state.carouselIndex;

                  if (i === idx) {
                    className += ' is-active';
                  } else if (i === (idx - 1 + options.length) % options.length) {
                    className += ' is-prev';
                  } else if (i === (idx + 1) % options.length) {
                    className += ' is-next';
                  } else {
                    className += i < idx ? ' is-hidden-left-1' : ' is-hidden-right-1';
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
                      <small class="wd-discovery-modal__option-desc">${opt.desc}</small>
                    </div>
                  </button>`;
                }).join('')}
              </div>
              <div class="wd-discovery-modal__carousel-nav">
                ${options.map((_, i) => `<button class="wd-discovery-modal__carousel-dot${i === this.state.carouselIndex ? ' is-active' : ''}" data-dot="${i}"></button>`).join('')}
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 1/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${this.state.selectedStayType ? ' is-active' : ''}" aria-label="Continuer">
                Continuer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderQuestion1_5() {
      const whoOptions = [
        { value: 'solo', label: 'Solo' },
        { value: 'couple', label: 'En couple' },
        { value: 'family', label: 'En famille' },
        { value: 'friends', label: 'Entre amis' }
      ];

      const isFamilyMode = this.state.selectedWho === 'family';
      const isFriendsMode = this.state.selectedWho === 'friends';
      const needsDetails = isFamilyMode || isFriendsMode;

      if (isFamilyMode) this._prefillFamilyFromProfile();

      const hasPrefill = isFamilyMode && this.state.familyDetails.childrenNames.length > 0;
      const prefillValid = hasPrefill
        && this.state.familyDetails.adultsCount >= 1
        && this.state.familyDetails.childrenCount > 0
        && this.state.familyDetails.childrenAges.length === this.state.familyDetails.childrenCount;

      let canContinue = false;
      if (this.state.selectedWho === 'solo' || this.state.selectedWho === 'couple') {
        canContinue = true;
      } else if (isFamilyMode) {
        canContinue = prefillValid;
      } else if (isFriendsMode) {
        canContinue = this.state.friendsDetails.adultsCount >= 2;
      }

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, avec qui partez-vous ?` : 'Avec qui partez-vous ?'}</h2>
            <p class="wd-discovery-modal__subtitle">Dites-nous qui vous accompagne pour adapter nos suggestions.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">2. Avec qui voyagez-vous ?</label>
              <div class="wd-discovery-modal__chips" style="margin-bottom: 20px;">
                ${whoOptions.map(opt => `
                  <button class="wd-discovery-modal__chip${this.state.selectedWho === opt.value ? ' is-selected' : ''}" data-who="${opt.value}">${opt.label}</button>
                `).join('')}
              </div>

              ${isFamilyMode ? `
                <div class="wd-discovery-modal__form-group">
                  <label class="wd-discovery-modal__form-label">Nombre d'adultes</label>
                  <input type="number" min="1" max="10" class="wd-discovery-modal__form-input" id="familyAdultsCount" value="${this.state.familyDetails.adultsCount || ''}" />
                </div>
                <div class="wd-discovery-modal__form-group">
                  <label class="wd-discovery-modal__form-label">Nombre d'enfants</label>
                  <input type="number" min="0" max="10" class="wd-discovery-modal__form-input" id="childrenCount" value="${this.state.familyDetails.childrenCount || ''}" />
                </div>
                <div class="wd-discovery-modal__form-group" id="childrenAgesContainer" style="display: ${hasPrefill ? 'block' : 'none'};">
                  <label class="wd-discovery-modal__form-label">Âge des enfants</label>
                  <div id="childrenAgesInputs">
                    ${hasPrefill ? this.state.familyDetails.childrenNames.map((name, i) => `
                      <div class="wd-discovery-modal__form-group">
                        <label class="wd-discovery-modal__form-label wd-discovery-modal__form-label--subtle">Âge de ${name}</label>
                        <input type="number" min="0" max="17" class="wd-discovery-modal__form-input child-age-input" data-index="${i}" value="${this.state.familyDetails.childrenAges[i] != null ? this.state.familyDetails.childrenAges[i] : ''}" />
                      </div>
                    `).join('') : ''}
                  </div>
                </div>
              ` : ''}

              ${isFriendsMode ? `
                <div class="wd-discovery-modal__form-group">
                  <label class="wd-discovery-modal__form-label">Nombre d'adultes</label>
                  <input type="number" min="2" max="20" class="wd-discovery-modal__form-input" id="adultsCount" value="${this.state.friendsDetails.adultsCount || ''}" />
                </div>
              ` : ''}
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 2/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${canContinue ? ' is-active' : ''}" aria-label="Continuer">
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
        { value: 'meeting-room', label: 'Avoir une salle de réunion', image: '../../assets/images/Serviceshôtels/meetingroom.avif' },
        { value: 'coworking', label: 'Avoir un espace de coworking', image: '../../assets/images/Serviceshôtels/corwoking.avif' },
        { value: 'kids', label: 'Avoir un espace pour enfants', image: '../../assets/images/Serviceshôtels/kidsplayground.webp' },
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
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
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

      // Option hyperpersonnalisée : visible seulement si connecté avec wishlist non vide.
      if (this._hasWishlist()) {
        options.push({ value: 'wishlist', label: 'Repartir de ma wishlist' });
      }

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
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

    // Écran wishlist (destinationIdea === 'wishlist') : cartes cliquables des
    // destinations sauvegardées. Un clic sélectionne, "Continuer" mène à Q5.
    renderQuestion3_Wishlist() {
      const wishlist = (this.state.userProfile && this.state.userProfile.wishlist) || [];
      const hasSelection = this._isWishlistSelected();

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
            <p class="wd-discovery-modal__subtitle">Repartez d'une destination que vous avez sauvegardée.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">Votre wishlist</label>

              <div class="wd-discovery-modal__wishlist-grid">
                ${wishlist.map((dest, i) => {
                  const label = dest.country ? `${dest.name}, ${dest.country}` : dest.name;
                  const isSelected = this.state.destinationInput === label;
                  return `<button class="wd-discovery-modal__wishlist-card${isSelected ? ' is-selected' : ''}" data-wishlist-index="${i}" style="background-image: url('${dest.image || ''}')">
                    <span class="wd-discovery-modal__wishlist-card-overlay"></span>
                    <span class="wd-discovery-modal__wishlist-card-text">
                      <span class="wd-discovery-modal__wishlist-card-name">${dest.name}</span>
                      ${dest.country ? `<span class="wd-discovery-modal__wishlist-card-country">${dest.country}</span>` : ''}
                    </span>
                  </button>`;
                }).join('')}
              </div>

              <button type="button" class="wd-discovery-modal__wishlist-alt" data-wishlist-action="back-to-q3">
                Choisir une autre façon de rechercher
              </button>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape 4/7</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
              <button class="wd-discovery-modal__continue${hasSelection ? ' is-active' : ''}" aria-label="Continuer">
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
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
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
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
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
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">4. Quelles régions du monde vous attirent le plus&nbsp;?</label>

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

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
            <p class="wd-discovery-modal__subtitle">Répondez à quelques questions pour découvrir la destination qui vous correspond.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">5. À quelle période et pour quelle durée souhaitez-vous partir ?</label>

              <!-- Période (même composant que le date picker business, en sélection de mois) -->
              <div class="wd-discovery-modal__form-section">
                <label class="wd-discovery-modal__form-label">Période</label>
                <div class="wd-discovery-modal__daterange">
                  <button type="button" class="wd-discovery-modal__daterange-field" id="periodField" aria-haspopup="dialog" aria-expanded="false">
                    <span class="wd-discovery-modal__daterange-value${this.state.selectedMonth ? '' : ' is-placeholder'}" id="periodValue">
                      ${this.state.selectedMonth ? `${monthsData.find(m => m.value === this.state.selectedMonth)?.fullLabel || ''} ${selectedYear}` : 'Choisissez une période'}
                    </span>
                    <span class="wd-discovery-modal__daterange-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                    </span>
                  </button>

                  <div class="wd-discovery-modal__calendar wd-discovery-modal__calendar--months" id="periodCalendar" role="dialog" aria-label="Choisir une période" hidden>
                    <div class="wd-discovery-modal__calendar-nav">
                      <button type="button" class="wd-discovery-modal__calendar-arrow" data-pnav="-1" aria-label="Année précédente">${ICON.chevL}</button>
                      <span class="wd-discovery-modal__calendar-title" id="periodYearTitle"></span>
                      <button type="button" class="wd-discovery-modal__calendar-arrow" data-pnav="1" aria-label="Année suivante">${ICON.chevR}</button>
                    </div>
                    <div class="wd-discovery-modal__month-picker" id="periodMonths"></div>
                  </div>
                </div>
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
      // Options non liées à l'âge : toujours affichées, inchangées.
      const baseServices = [
        { value: 'pets', label: 'Animaux acceptés' },
        { value: 'accessibility', label: 'Accès handicapés' },
        { value: 'parking', label: 'Parking' }
      ];

      let services;
      if (this.state.selectedWho === 'family') {
        // Filtrage strict selon les âges collectés en Q1.5 (childrenAges).
        const ages = Array.isArray(this.state.familyDetails && this.state.familyDetails.childrenAges)
          ? this.state.familyDetails.childrenAges
          : [];
        const hasAgeIn = (min, max) => ages.some(a => typeof a === 'number' && a >= min && a <= max);

        const ageServices = [];
        if (hasAgeIn(0, 2)) ageServices.push({ value: 'baby-bed', label: 'Lit bébé' });
        if (hasAgeIn(0, 2)) ageServices.push({ value: 'high-chair', label: 'Chaise haute' });
        if (hasAgeIn(2, 11)) ageServices.push({ value: 'kids-pool', label: 'Pataugeoire / piscine sécurisée' });
        if (hasAgeIn(3, 11)) ageServices.push({ value: 'kids-club', label: 'Club enfants' });

        services = [...baseServices, ...ageServices];
      } else {
        // Profils solo/couple/business/friends : Q6 inchangé (comportement d'origine).
        services = [...baseServices, { value: 'kids-club', label: 'Club enfants' }];
      }

      // Anti "service fantôme" : purge du state toute option sélectionnée mais
      // plus visible (ex. retour arrière + changement d'âge en Q1.5).
      const visibleValues = services.map(s => s.value);
      this.state.selectedServices = this.state.selectedServices.filter(v => visibleValues.includes(v));

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, trouvez votre prochain hôtel` : 'Trouvez votre prochain hôtel'}</h2>
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

    _buildRecapItems() {
      const items = [];
      const stayLabels = { escapade:'Escapade', pro:'Déplacement pro', event:'Événement', guide:'Guide' };
      if (this.state.selectedStayType) {
        items.push({ label:'Séjour', value: stayLabels[this.state.selectedStayType] || this.state.selectedStayType });
      }
      if (this.state.selectedStayType === 'escapade') {
        const whoLabels = { solo:'Solo', couple:'En couple', family:'En famille', friends:'Entre amis' };
        if (this.state.selectedWho) {
          items.push({ label:'Voyageur', value: whoLabels[this.state.selectedWho] || this.state.selectedWho });
        }
      }

      if (this.state.selectedWho === 'family' && this.state.familyDetails.childrenCount) {
        const adults = this.state.familyDetails.adultsCount || 2;
        const kids = this.state.familyDetails.childrenCount;
        const names = this.state.familyDetails.childrenNames || [];
        const kidsStr = names.length > 0 ? names.join(', ') : `${kids} enfant${kids > 1 ? 's' : ''}`;
        items.push({ label:'Composition', value:`${adults} adulte${adults > 1 ? 's' : ''}, ${kidsStr}` });
      } else if (this.state.selectedWho === 'friends' && this.state.friendsDetails.adultsCount) {
        items.push({ label:'Groupe', value:`${this.state.friendsDetails.adultsCount} personnes` });
      }

      if (this.state.selectedTypes.length > 0) {
        const typeLabels = { detente:'Détente & bien-être', aventure:'Aventure & découverte', culture:'Culture & patrimoine', gastronomie:'Gastronomie', romantique:'Romantique', nature:'Nature & évasion', nightlife:'Nightlife', sport:'Sport & activités', business:'Business & networking', 'meeting-room':'Salle de réunion', 'team-building':'Team building', coworking:'Co-working', 'business-dining':'Restaurant d\'affaires', spa:'Spa', restaurant:'Restaurant', workspace:'Espace de travail', kids:'Espace enfants', local:'Vie locale' };
        items.push({ label:'Type de séjour', value: this.state.selectedTypes.map(t => typeLabels[t] || t).join(', ') });
      }

      const regionLabels = { europe:'Europe', asia:'Asie', africa:'Afrique', 'north-america':'Amérique du Nord', 'latin-america':'Amérique Latine', oceania:'Océanie' };
      if (this.state.destinationInput) {
        items.push({ label:'Destination', value: this.state.destinationInput });
      } else if (this.state.selectedRegions && this.state.selectedRegions.length > 0) {
        items.push({ label:'Régions', value: this.state.selectedRegions.map(r => regionLabels[r] || r).join(', ') });
      } else if (this.state.businessLocation) {
        items.push({ label:'Destination', value: this.state.businessLocation });
      }

      const monthLabels = { janvier:'Janvier', fevrier:'Février', mars:'Mars', avril:'Avril', mai:'Mai', juin:'Juin', juillet:'Juillet', aout:'Août', septembre:'Septembre', octobre:'Octobre', novembre:'Novembre', decembre:'Décembre' };
      if (this.state.selectedMonth) {
        items.push({ label:'Période', value:`${monthLabels[this.state.selectedMonth] || this.state.selectedMonth} ${this.state.selectedYear || new Date().getFullYear()}` });
      } else if (this.state.checkInDate && this.state.checkOutDate) {
        const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long' });
        items.push({ label:'Dates', value:`${fmt(this.state.checkInDate)} — ${fmt(this.state.checkOutDate)}` });
      }

      const durationLabels = { '1week':'Une semaine', '2weeks':'Deux semaines', '3weeks':'Trois semaines', more:'Plus de trois semaines', advice:'Conseillez-moi' };
      if (this.state.selectedDuration) {
        items.push({ label:'Durée', value: durationLabels[this.state.selectedDuration] || this.state.selectedDuration });
      }

      if (this.state.selectedServices.length > 0) {
        const svcLabels = { pets:'Animaux acceptés', accessibility:'Accès handicapés', parking:'Parking', 'baby-bed':'Lit bébé', 'high-chair':'Chaise haute', 'kids-pool':'Pataugeoire', 'kids-club':'Club enfants' };
        items.push({ label:'Services', value: this.state.selectedServices.map(s => svcLabels[s] || s).join(', ') });
      }

      // Pro-specific recap
      if (this.state.selectedStayType === 'pro') {
        const ctxLabels = { solo:'Solo', team:'En équipe', client:'Rencontre client' };
        if (this.state.proContext) {
          items.push({ label:'Contexte', value: ctxLabels[this.state.proContext] || this.state.proContext });
        }
        if (this.state.proNeeds && this.state.proNeeds.length > 0) {
          const needLabels = { 'work-room':'Chambre équipée', coworking:'Coworking', 'meeting-small':'Salle de réunion', spa:'Spa', restaurant:'Restaurant', local:'Vie locale' };
          items.push({ label:'Besoins pro', value: this.state.proNeeds.map(n => needLabels[n] || n).join(', ') });
        }
        if (this.state.bleisureChoice) {
          items.push({ label:'Bleisure', value: this.state.bleisureChoice === 'yes' ? 'Séjour prolongé' : 'Non' });
        }
      }

      // Event-specific recap
      if (this.state.selectedStayType === 'event') {
        const famLabels = { pro:'Événement professionnel', celebration:'Célébration privée' };
        if (this.state.eventFamily) {
          items.push({ label:'Type', value: famLabels[this.state.eventFamily] || this.state.eventFamily });
        }
        const subLabels = { seminar:'Séminaire / réunion', conference:'Conférence / congrès', teambuilding:'Team building', corporate:'Événement d\'entreprise', wedding:'Mariage', 'evg-evjf':'EVG / EVJF', birthday:'Anniversaire', other:'Autre célébration' };
        if (this.state.eventSubType) {
          items.push({ label:'Format', value: subLabels[this.state.eventSubType] || this.state.eventSubType });
        }
        const volLabels = { small:'Moins de 20', medium:'20 – 50', large:'50 – 150', xlarge:'150+' };
        if (this.state.eventVolume) {
          items.push({ label:'Participants', value: volLabels[this.state.eventVolume] || this.state.eventVolume });
        }
        if (this.state.eventNeeds && this.state.eventNeeds.length > 0) {
          const enLabels = { 'meeting-room':'Salle de réunion', plenary:'Plénière', coworking:'Coworking', catering:'Restauration', rooms:'Nuitées', av:'Matériel AV', reception:'Espace réception', traiteur:'Traiteur', rooftop:'Soirée / rooftop' };
          items.push({ label:'Prestations', value: this.state.eventNeeds.map(n => enLabels[n] || n).join(', ') });
        }
      }

      return items;
    }

    _matchHotels() {
      const whoToTags = { solo:['culture','wellness'], couple:['romance','luxury'], family:['family','beach','wellness'], friends:['culture','gastro','beach'], business:['business','meeting'] };
      const profileTags = whoToTags[this.state.selectedWho] || [];
      const typeTags = this.state.selectedTypes || [];
      const typeToTag = { detente:'wellness', aventure:'culture', culture:'culture', gastronomie:'gastro', romantique:'romance', nature:'eco', spa:'wellness', restaurant:'gastro', nightlife:'culture', sport:'wellness', 'meeting-room':'meeting', 'team-building':'meeting', coworking:'business', 'business-dining':'gastro', kids:'family', local:'culture' };

      const dest = (this.state.destinationInput || this.state.businessLocation || '').toLowerCase().trim();
      const regions = (this.state.selectedRegions || []);

      const regionCountries = {
        europe: ['france','espagne','royaume-uni','italie','allemagne','portugal','grèce','suisse','belgique','pays-bas','autriche','hongrie','roumanie','lettonie','croatie','géorgie','turquie','bulgarie','lyon','paris','bordeaux','marseille','nice','barcelone','londres','berlin','munich','cologne','stuttgart','bruxelles','eindhoven','budapest','bucarest','riga','zagreb','tbilissi','istanbul','bâle','toulouse','cannes','montpellier','liverpool','la défense','gorni okol'],
        asia: ['thaïlande','japon','chine','inde','indonésie','singapour','vietnam','cambodge','malaisie','maldives','laos','myanmar','corée du sud','bali','lombok','bangkok','pattaya','phuket','phang nga','khon kaen','tokyo','séoul','shanghai','pékin','guangzhou','sanya','lijiang','zhangjiajie','hong kong','xishuangbanna','haikou','nanjing','dali','jakarta','bandung','bogor','hanoï','hô chi minh','danang','hai phong','phu quoc','vung tau','kuala lumpur','kuching','miri','new delhi','chennai','luang prabang','yangon'],
        africa: ['maroc','afrique du sud','sénégal','kenya','côte d\'ivoire','rd congo','abidjan','dakar','kinshasa','lubumbashi','nairobi','le cap','marrakech','el jadida'],
        'north-america': ['états-unis','canada','mexique','new york','los angeles','miami','montréal'],
        'latin-america': ['brésil','argentine','colombie','pérou','chili','são paulo','rio de janeiro','guarulhos','rosario','santiago','viña del mar','lima'],
        oceania: ['australie','nouvelle-zélande','fidji','sydney','melbourne','cairns','palm cove','port douglas','margaret river','central coast','adélaïde','brisbane','ayers rock','auckland','rotorua'],
        'middle-east': ['émirats','eau','dubaï','qatar','arabie saoudite','oman','abu dhabi','sharjah','ras al khaimah','la mecque','médine','doha']
      };

      const isInRegions = (loc, regs) => regs.some(r => (regionCountries[r] || []).some(c => loc.includes(c)));
      const findRegion = (loc) => Object.keys(regionCountries).find(r => regionCountries[r].some(c => loc.includes(c)));

      const destRegion = dest ? findRegion(dest) : null;

      const scored = PREVIEW_HOTELS.map(hotel => {
        let score = 0;
        const htags = hotel.tags || [];
        const hsvc = hotel.services || [];
        const loc = hotel.loc.toLowerCase();
        let matchesDest = false;
        let sameRegionAsDest = false;

        if (dest) {
          const destCity = dest.split(',')[0].trim();
          const locCity = loc.split(',')[0].trim();
          if (locCity === destCity || loc.includes(destCity) || destCity.includes(locCity)) {
            score += 25;
            matchesDest = true;
          } else if (loc.includes(dest.split(',').pop().trim())) {
            score += 15;
            sameRegionAsDest = true;
          }
          if (destRegion) {
            const hotelRegion = findRegion(loc);
            if (hotelRegion === destRegion) {
              score += 10;
              sameRegionAsDest = true;
            }
          }
        }

        const inRegion = regions.length > 0 && isInRegions(loc, regions);
        if (inRegion) score += 15;

        profileTags.forEach(t => { if (htags.includes(t)) score += 2; });
        typeTags.forEach(t => {
          if (htags.includes(typeToTag[t] || t)) score += 3;
        });

        if (this.state.selectedStayType === 'event') {
          if (htags.includes('meeting')) score += 5;
          if (hsvc.includes('meeting-room') || hsvc.includes('banquet')) score += 4;
        }
        if (this.state.selectedStayType === 'pro') {
          if (htags.includes('business')) score += 4;
          if (hsvc.includes('meeting-room') || hsvc.includes('coworking')) score += 3;
        }

        (this.state.selectedServices || []).forEach(s => {
          const mapped = { pets:'pet-friendly', parking:'parking', 'kids-club':'kids-club', 'kids-pool':'pool', 'baby-bed':'room-service', 'high-chair':'restaurant', accessibility:'concierge' };
          if (hsvc.includes(mapped[s] || s)) score += 2;
        });

        return { ...hotel, score, inRegion, matchesDest, sameRegionAsDest };
      });

      if (dest) {
        const exact = scored.filter(h => h.matchesDest).sort((a, b) => b.score - a.score);
        const sameRegion = scored.filter(h => !h.matchesDest && h.sameRegionAsDest).sort((a, b) => b.score - a.score);
        return [...exact, ...sameRegion].slice(0, 3);
      }

      if (regions.length > 0) {
        const inRegion = scored.filter(h => h.inRegion).sort((a, b) => b.score - a.score);
        return inRegion.slice(0, 3);
      }

      return scored.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    _generateRecommendation(hotels) {
      const who = { solo:'un voyageur solo', couple:'un couple', family:'une famille', friends:'un groupe d\'amis', business:'un voyage d\'affaires' };
      const whoStr = who[this.state.selectedWho] || 'vous';

      const regionLabels = { europe:'Europe', asia:'Asie', africa:'Afrique', 'north-america':'Amérique du Nord', 'latin-america':'Amérique Latine', oceania:'Océanie' };
      const regions = (this.state.selectedRegions || []).map(r => regionLabels[r] || r);
      const dest = this.state.destinationInput || this.state.businessLocation || (regions.length > 0 ? regions[0] : '');

      const types = this.state.selectedTypes || [];
      const typeLabels = { detente:'détente', aventure:'aventure', culture:'culture', gastronomie:'gastronomie', romantique:'romantique', nature:'nature', spa:'spa & bien-être', restaurant:'gastronomie', workspace:'espace de travail', 'meeting-room':'réunions', coworking:'co-working', kids:'activités enfants', local:'vie locale', nightlife:'sorties', sport:'sport', business:'business', 'team-building':'team building', 'business-dining':'gastronomie d\'affaires' };
      const typeStr = types.length > 0 ? types.map(t => typeLabels[t] || t).slice(0, 2).join(' et ') : '';

      if (this.state.selectedStayType === 'pro') {
        const ctxLabels = { solo:'un déplacement solo', team:'un séjour en équipe', client:'une rencontre client' };
        const ctxStr = ctxLabels[this.state.proContext] || 'un voyage d\'affaires';
        let text = `Pour ${ctxStr}`;
        if (dest) text += ` à ${dest}`;
        text += `, nous avons sélectionné ${hotels.length} établissement${hotels.length > 1 ? 's' : ''} alliant confort et productivité. `;
        if (this.state.bleisureChoice === 'yes') text += 'Bonus : chaque hôtel offre de belles options pour prolonger votre séjour côté loisirs. ';
        if (hotels.length > 0) text += `Notre recommandation : le ${hotels[0].name} — ${hotels[0].features.split(' · ')[0].toLowerCase()}.`;
        return text;
      }

      if (this.state.selectedStayType === 'event') {
        const famLabels = { pro:'votre événement professionnel', celebration:'votre célébration' };
        const famStr = famLabels[this.state.eventFamily] || 'votre événement';
        const volLabels = { small:'un petit groupe', medium:'une trentaine de personnes', large:'un grand groupe', xlarge:'un très grand événement' };
        const volStr = volLabels[this.state.eventVolume] || '';
        let text = `Pour ${famStr}`;
        if (dest) text += ` à ${dest}`;
        if (volStr) text += ` avec ${volStr}`;
        text += `, nous avons identifié ${hotels.length} établissement${hotels.length > 1 ? 's' : ''} avec les espaces et services adaptés. `;
        if (hotels.length > 0) text += `Notre coup de cœur : le ${hotels[0].name} — ${hotels[0].features.split(' · ')[0].toLowerCase()}.`;
        return text;
      }

      let text = `Pour ${whoStr}`;
      if (dest) text += ` à destination ${dest.includes(',') ? 'de ' : 'd\''}${dest}`;
      if (typeStr) text += ` en quête de ${typeStr}`;
      text += `, nous avons sélectionné ${hotels.length} établissement${hotels.length > 1 ? 's' : ''} qui correspond${hotels.length > 1 ? 'ent' : ''} parfaitement à vos envies. `;

      if (hotels.length > 0) {
        const top = hotels[0];
        text += `Notre coup de cœur : le ${top.name}, ${top.features.split(' · ')[0].toLowerCase()} — un choix idéal pour votre séjour.`;
      }
      return text;
    }

    _buildOrbitCards() {
      const cards = [];

      const whoImages = { solo:'../../assets/images/discovery/solo.jpg', couple:'../../assets/images/discovery/couple.jpg', family:'../../assets/images/discovery/family.jpg', friends:'../../assets/images/discovery/friendtravel.avif', business:'../../assets/images/discovery/businesstravel.avif' };
      const whoLabels = { solo:'Solo', couple:'En couple', family:'En famille', friends:'Entre amis', business:'Business' };
      if (this.state.selectedWho) {
        cards.push({ image: whoImages[this.state.selectedWho], label: whoLabels[this.state.selectedWho] });
      }

      const typeImages = { detente:'../../assets/images/discovery/wellness.jpg', aventure:'../../assets/images/discovery/culture.jpg', culture:'../../assets/images/discovery/culture.jpg', gastronomie:'../../assets/images/discovery/gastro.jpg', romantique:'../../assets/images/discovery/couple.jpg', nature:'../../assets/images/discovery/wellness.jpg', spa:'../../assets/images/discovery/wellness.jpg', restaurant:'../../assets/images/discovery/gastro.jpg', workspace:'../../assets/images/discovery/business.jpg', 'meeting-room':'../../assets/images/Serviceshôtels/meetingroom.avif', coworking:'../../assets/images/Serviceshôtels/corwoking.avif', kids:'../../assets/images/Serviceshôtels/kidsplayground.webp', local:'../../assets/images/discovery/culture.jpg' };
      const typeLabelsShort = { detente:'Détente', aventure:'Aventure', culture:'Culture', gastronomie:'Gastronomie', romantique:'Romantique', nature:'Nature', spa:'Spa', restaurant:'Restaurant', workspace:'Workspace', 'meeting-room':'Réunion', coworking:'Coworking', kids:'Enfants', local:'Vie locale' };
      (this.state.selectedTypes || []).forEach(t => {
        cards.push({ image: typeImages[t] || '../../assets/images/discovery/wellness.jpg', label: typeLabelsShort[t] || t });
      });

      // Pro-specific orbit cards
      if (this.state.selectedStayType === 'pro') {
        const ctxImages = { solo:'../../assets/images/discovery/business.avif', team:'../../assets/images/Serviceshôtels/meetingroom.avif', client:'../../assets/images/discovery/business.avif' };
        const ctxLabels = { solo:'Solo', team:'Équipe', client:'Client' };
        if (this.state.proContext) {
          cards.push({ image: ctxImages[this.state.proContext] || '../../assets/images/discovery/business.avif', label: ctxLabels[this.state.proContext] || 'Pro' });
        }
        if (this.state.bleisureChoice === 'yes') {
          cards.push({ image: '../../assets/images/discovery/couple.avif', label: 'Bleisure' });
        }
      }

      // Event-specific orbit cards
      if (this.state.selectedStayType === 'event') {
        const famImages = { pro:'../../assets/images/Serviceshôtels/meetingroom.avif', celebration:'../../assets/images/Q1/event.webp' };
        const famLabels = { pro:'Pro', celebration:'Célébration' };
        if (this.state.eventFamily) {
          cards.push({ image: famImages[this.state.eventFamily] || '../../assets/images/Q1/event.webp', label: famLabels[this.state.eventFamily] || 'Événement' });
        }
      }

      if (this.state.businessLocation) {
        cards.push({ image: '../../assets/images/discovery/culture.jpg', label: this.state.businessLocation.split(',')[0] });
      } else if (this.state.destinationInput) {
        const wishlist = (this.state.userProfile && this.state.userProfile.wishlist) || [];
        const match = wishlist.find(w => (w.country ? `${w.name}, ${w.country}` : w.name) === this.state.destinationInput);
        cards.push({ image: match ? match.image : '../../assets/images/discovery/culture.jpg', label: this.state.destinationInput.split(',')[0] });
      } else if (this.state.selectedRegions && this.state.selectedRegions.length > 0) {
        const regionImages = { europe:'../../assets/images/destination/Europe.avif', asia:'../../assets/images/destination/asie.avif', africa:'../../assets/images/destination/africa.avif', 'north-america':'../../assets/images/destination/america.avif', 'latin-america':'../../assets/images/destination/ameriquelatine.avif', oceania:'../../assets/images/destination/oceanie.avif' };
        const regionLabels = { europe:'Europe', asia:'Asie', africa:'Afrique', 'north-america':'Am. du Nord', 'latin-america':'Am. Latine', oceania:'Océanie' };
        this.state.selectedRegions.forEach(r => {
          cards.push({ image: regionImages[r] || '../../assets/images/discovery/culture.jpg', label: regionLabels[r] || r });
        });
      }

      return cards;
    }

    renderResultsLoading() {
      const items = this._buildRecapItems();
      const firstName = this.state.isConnected && this.state.userProfile ? this.state.userProfile.firstName : '';
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>

            <div class="wd-discovery-modal__results-loading">
              <div class="wd-discovery-modal__loading-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#e8e8e8" stroke-width="2"/>
                  <circle cx="24" cy="24" r="20" stroke="#3F5E5A" stroke-width="2" stroke-linecap="round" stroke-dasharray="126" stroke-dashoffset="90" class="wd-discovery-modal__loading-spinner"/>
                </svg>
              </div>
              <h2 class="wd-discovery-modal__results-loading-title">${firstName ? `${firstName}, nous cherchons` : 'Nous cherchons'} votre hôtel idéal</h2>
              <p class="wd-discovery-modal__results-loading-subtitle">Analyse de vos préférences en cours...</p>

              <div class="wd-discovery-modal__loading-recap">
                ${items.map((item, i) => `
                  <div class="wd-discovery-modal__loading-chip" style="animation-delay: ${i * 0.4}s;">
                    <span class="wd-discovery-modal__loading-chip-label">${item.label}</span>
                    <span class="wd-discovery-modal__loading-chip-value">${item.value}</span>
                  </div>
                `).join('')}
              </div>

              <div class="wd-discovery-modal__loading-bar">
                <div class="wd-discovery-modal__loading-bar-fill"></div>
              </div>
              <p class="wd-discovery-modal__loading-step">Comparaison de 120+ hôtels Pullman...</p>
            </div>
          </div>
        </div>
      `;
    }

    _startResultsLoading() {
      setTimeout(() => {
        this.state.stepHistory.push('results-loading');
        this.state.currentStep = 'results';
        this.state.matchedHotels = this._matchHotels();
        this._rerenderContent();
        const mc = this.querySelector('.wd-discovery-modal__content');
        if (mc) mc.scrollTop = 0;
      }, 7000);
    }

    renderResults() {
      const items = this._buildRecapItems();
      const hotels = this.state.matchedHotels || this._matchHotels();
      const recommendation = this._generateRecommendation(hotels);
      const firstName = (this.state.isConnected && this.state.userProfile) ? this.state.userProfile.firstName : '';

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>

            <div class="wd-discovery-modal__results">
              <h2 class="wd-discovery-modal__results-title">${firstName ? `${firstName}, voici` : 'Voici'} nos recommandations</h2>

              <div class="wd-discovery-modal__results-ai-msg">
                <div class="wd-discovery-modal__results-ai-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#ffffff"/></svg>
                </div>
                <div class="wd-discovery-modal__results-ai-bubble">
                  <span class="wd-discovery-modal__results-ai-name">Concierge Pullman</span>
                  <p class="wd-discovery-modal__results-ai-text">${recommendation}</p>
                  <div class="wd-discovery-modal__results-ai-recap">
                    ${items.map(item => `
                      <div class="wd-discovery-modal__results-recap-row">
                        <span class="wd-discovery-modal__results-recap-row-label">${item.label}</span>
                        <span class="wd-discovery-modal__results-recap-row-value">${item.value}</span>
                      </div>
                    `).join('')}
                  </div>
                  <button class="wd-discovery-modal__results-edit" aria-label="Modifier mes critères">Modifier mes critères</button>
                </div>
              </div>

              <div class="wd-discovery-modal__results-hotels">
                ${hotels.map((hotel, i) => `
                  <div class="wd-discovery-modal__results-hotel-card">
                    ${i === 0 ? '<span class="wd-discovery-modal__results-hotel-badge">Coup de cœur</span>' : ''}
                    <img class="wd-discovery-modal__results-hotel-img" src="${hotel.img}" alt="${hotel.name}" loading="lazy" />
                    <div class="wd-discovery-modal__results-hotel-info">
                      <h4 class="wd-discovery-modal__results-hotel-name">${hotel.name}</h4>
                      <p class="wd-discovery-modal__results-hotel-loc">${hotel.loc}</p>
                      <p class="wd-discovery-modal__results-hotel-features">${hotel.features}</p>
                      <div class="wd-discovery-modal__results-hotel-bottom">
                        <span class="wd-discovery-modal__results-hotel-price">À partir de <strong>${hotel.price} €</strong> / nuit</span>
                        <div class="wd-discovery-modal__results-hotel-actions">
                          <a href="${hotel.url || '#'}" class="wd-discovery-modal__results-hotel-cta" ${hotel.url ? 'target="_blank" rel="noopener noreferrer"' : ''}>Découvrir l'hôtel →</a>
                          <a href="${hotel.url || '#'}" class="wd-discovery-modal__results-hotel-book" ${hotel.url ? 'target="_blank" rel="noopener noreferrer"' : ''}>Réserver</a>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>

            </div>

            <div class="wd-discovery-modal__footer">
              <button class="wd-discovery-modal__back" aria-label="Retour">
                Retour
              </button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">
                Recommencer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    _getStepNumber() {
      const stepMap = {
        1: 1,
        1.5: 2,
        2: 3,
        3: 4, 3.1: 4, 3.2: 4, 3.3: 4, 'wishlist': 4,
        4: 5,
        5: 6,
        'pro-location': 2, 'pro-dates': 3, 'pro-needs': 4, 'pro-bleisure': 5,
        'event-family': 2, 'event-subtype': 3, 'event-location': 4, 'event-dates': 5, 'event-volume': 6, 'event-needs': 7,
        'guide-1': 2, 'guide-2': 3
      };
      return stepMap[this.state.currentStep] || '?';
    }

    renderQuestion_BusinessLocation() {
      const isEvent = this.state.selectedStayType === 'event';
      const title = isEvent ? 'Où souhaitez-vous organiser votre événement ?' : 'Où vous rendez-vous ?';
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${this.state.isConnected && this.state.userProfile ? `${this.state.userProfile.firstName}, ${title.toLowerCase()}` : title}</h2>
            <p class="wd-discovery-modal__subtitle">Précisez votre destination pour trouver le Pullman idéal.</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">Dans quelle ville ou région ?</label>

              <div class="wd-discovery-modal__form-group wd-discovery-modal__autocomplete">
                <input type="text" class="wd-discovery-modal__form-input" id="businessLocationInput" placeholder="Ex: Paris, Lyon, Singapour..." value="${this.state.businessLocation || ''}" autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="businessLocationList" />
                <ul class="wd-discovery-modal__autocomplete-list" id="businessLocationList" role="listbox" hidden></ul>
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
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

      const hasValidDates = this.state.checkInDate && this.state.checkOutDate && new Date(this.state.checkOutDate) > new Date(this.state.checkInDate);
      const isEvent = this.state.selectedStayType === 'event';
      const firstName = this.state.isConnected && this.state.userProfile ? this.state.userProfile.firstName : '';
      const dateTitle = isEvent
        ? (firstName ? `${firstName}, quand a lieu votre événement ?` : 'Quand a lieu votre événement ?')
        : (firstName ? `${firstName}, quelles sont vos dates ?` : 'Quelles sont vos dates ?');
      const dateSubtitle = isEvent
        ? 'Indiquez les dates de votre événement pour vérifier la disponibilité des espaces.'
        : 'Précisez vos dates de séjour.';
      const dateLabel = isEvent
        ? 'Dates de l\'événement'
        : 'Quelles sont vos dates d\'arrivée et de départ ?';

      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">
              ${ICON.close}
            </button>
            <h2 class="wd-discovery-modal__title">${dateTitle}</h2>
            <p class="wd-discovery-modal__subtitle">${dateSubtitle}</p>

            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">${dateLabel}</label>

              <div class="wd-discovery-modal__daterange">
                <button type="button" class="wd-discovery-modal__daterange-field" id="dateRangeField" aria-haspopup="dialog" aria-expanded="false">
                  <span class="wd-discovery-modal__daterange-value" id="dateRangeValue">Arrivée — Départ</span>
                  <span class="wd-discovery-modal__daterange-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                  </span>
                </button>

                <div class="wd-discovery-modal__calendar wd-discovery-modal__calendar--range" id="dateRangeCalendar" role="dialog" aria-label="Choisir vos dates" hidden>
                  <div class="wd-discovery-modal__calendar-nav">
                    <button type="button" class="wd-discovery-modal__calendar-arrow" data-nav="-1" aria-label="Mois précédent">${ICON.chevL}</button>
                    <span class="wd-discovery-modal__calendar-title" id="calendarTitle"></span>
                    <button type="button" class="wd-discovery-modal__calendar-arrow" data-nav="1" aria-label="Mois suivant">${ICON.chevR}</button>
                  </div>
                  <div class="wd-discovery-modal__calendar-weekdays">
                    <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                  </div>
                  <div class="wd-discovery-modal__calendar-days" id="calendarDays"></div>
                  <div class="wd-discovery-modal__calendar-hint" id="calendarHint">Sélectionnez votre date d'arrivée</div>
                </div>
              </div>
            </div>

            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
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

    // ── Stub renderers V2 (Phase 1 : écrans placeholder) ──

    _renderStubScreen(title, subtitle, label, options, selectedKey, stateField) {
      const selected = this.state[stateField];
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">${ICON.close}</button>
            <h2 class="wd-discovery-modal__title">${title}</h2>
            <p class="wd-discovery-modal__subtitle">${subtitle}</p>
            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">${label}</label>
              <div class="wd-discovery-modal__chips" style="margin-top: 12px;">
                ${options.map(opt => `
                  <button class="wd-discovery-modal__chip${opt.desc ? ' wd-discovery-modal__chip--rich' : ''}${selected === opt.value ? ' is-selected' : ''}" data-stub-value="${opt.value}" data-stub-field="${stateField}"><span class="wd-discovery-modal__chip-label">${opt.label}</span>${opt.desc ? `<span class="wd-discovery-modal__chip-desc">${opt.desc}</span>` : ''}</button>
                `).join('')}
              </div>
            </div>
            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">Retour</button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">Recommencer</button>
              <button class="wd-discovery-modal__continue${selected ? ' is-active' : ''}" aria-label="Continuer">Continuer</button>
            </div>
          </div>
        </div>`;
    }

    _renderMultiSelectScreen(title, subtitle, label, options, stateField) {
      const selected = this.state[stateField] || [];
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">${ICON.close}</button>
            <h2 class="wd-discovery-modal__title">${title}</h2>
            <p class="wd-discovery-modal__subtitle">${subtitle}</p>
            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label">${label}</label>
              <div class="wd-discovery-modal__chips" style="margin-top: 12px;">
                ${options.map(opt => {
                  const isSel = selected.includes(opt.value);
                  return `
                  <button class="wd-discovery-modal__chip${isSel ? ' is-selected' : ''}" data-multi-value="${opt.value}" data-multi-field="${stateField}">${opt.label}</button>`;
                }).join('')}
              </div>
            </div>
            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">Retour</button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">Recommencer</button>
              <button class="wd-discovery-modal__continue${selected.length > 0 ? ' is-active' : ''}" aria-label="Continuer">Continuer</button>
            </div>
          </div>
        </div>`;
    }

    renderProNeeds() {
      const contextOptions = [
        { value: 'solo', label: 'Solo' },
        { value: 'team', label: 'En équipe' },
        { value: 'client', label: 'Rencontre client' }
      ];
      const needsOptions = [
        { value: 'work-room', label: 'Chambre équipée pour travailler' },
        { value: 'coworking', label: 'Café hybride / co-working' },
        { value: 'pullman-nook', label: 'Petit recoin Pullman (pod)' },
        { value: 'meeting-small', label: 'Salle de réunion / studio' },
        { value: 'hybrid', label: 'Réunion hybride (visio)' },
        { value: 'restaurant', label: 'Restauration toute la journée' },
        { value: 'spa', label: 'Spa & fitness (pass journée)' },
        { value: 'local', label: 'Découverte locale' }
      ];
      const ctx = this.state.proContext;
      const needs = this.state.proNeeds || [];
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">${ICON.close}</button>
            <h2 class="wd-discovery-modal__title">De quoi avez-vous besoin ?</h2>
            <p class="wd-discovery-modal__subtitle">Sélectionnez votre contexte puis les services souhaités.</p>
            <div class="wd-discovery-modal__question">
              <label class="wd-discovery-modal__question-label" style="margin-bottom: 8px;">Contexte</label>
              <div class="wd-discovery-modal__chips" style="margin-bottom: 20px;">
                ${contextOptions.map(opt => `
                  <button class="wd-discovery-modal__chip${ctx === opt.value ? ' is-selected' : ''}" data-stub-value="${opt.value}" data-stub-field="proContext">${opt.label}</button>
                `).join('')}
              </div>
              <label class="wd-discovery-modal__question-label" style="margin-bottom: 8px;">Services</label>
              <div class="wd-discovery-modal__chips">
                ${needsOptions.map(opt => {
                  const isSel = needs.includes(opt.value);
                  return `<button class="wd-discovery-modal__chip${isSel ? ' is-selected' : ''}" data-multi-value="${opt.value}" data-multi-field="proNeeds">${opt.label}</button>`;
                }).join('')}
              </div>
            </div>
            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">Retour</button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">Recommencer</button>
              <button class="wd-discovery-modal__continue${ctx && needs.length > 0 ? ' is-active' : ''}" aria-label="Continuer">Continuer</button>
            </div>
          </div>
        </div>`;
    }

    renderProBleisure() {
      return this._renderSelectCards(
        'Et si vous restiez un peu plus ?',
        `Découvrez ce que Pullman ${this.state.businessLocation || ''} vous réserve au-delà du travail.`,
        [
          { value: 'yes', label: 'Prolonger mon séjour', desc: 'Détente, découverte, escapade après le travail', image: '../../assets/images/discovery/wellness.avif' },
          { value: 'no', label: 'Pas cette fois', desc: 'Retour direct après la mission', image: '../../assets/images/discovery/businesstravel.avif' }
        ],
        'bleisureChoice'
      );
    }

    _renderSelectCards(title, subtitle, options, stateField) {
      const selected = this.state[stateField];
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">${ICON.close}</button>
            <h2 class="wd-discovery-modal__title">${title}</h2>
            <p class="wd-discovery-modal__subtitle">${subtitle}</p>
            <div class="wd-discovery-modal__question">
              <div class="wd-discovery-modal__select-cards">
                ${options.map(opt => `
                  <button class="wd-discovery-modal__select-card${selected === opt.value ? ' is-selected' : ''}" data-stub-value="${opt.value}" data-stub-field="${stateField}">
                    <div class="wd-discovery-modal__select-card-img" style="background-image: url('${opt.image}');"></div>
                    <div class="wd-discovery-modal__select-card-body">
                      <span class="wd-discovery-modal__select-card-label">${opt.label}</span>
                      <small class="wd-discovery-modal__select-card-desc">${opt.desc}</small>
                    </div>
                    <div class="wd-discovery-modal__select-card-check">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M6 10l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">Retour</button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">Recommencer</button>
              <button class="wd-discovery-modal__continue${selected ? ' is-active' : ''}" aria-label="Continuer">Continuer</button>
            </div>
          </div>
        </div>`;
    }

    renderEventFamily() {
      return this._renderSelectCards(
        'Quel type d\'événement ?',
        'Deux univers, deux ambiances — choisissez celui qui vous correspond.',
        [
          { value: 'pro', label: 'Événement professionnel', desc: 'Séminaire, conférence, team building, lancement...', image: '../../assets/images/Serviceshôtels/meetingroom.avif' },
          { value: 'celebration', label: 'Célébration privée', desc: 'Mariage, anniversaire, EVG/EVJF...', image: '../../assets/images/Q1/event.webp' }
        ],
        'eventFamily'
      );
    }

    renderEventSubtype() {
      const isPro = this.state.eventFamily === 'pro';
      const options = isPro
        ? [
            { value: 'seminar', label: 'Séminaire', desc: 'Réunion, formation', image: '../../assets/images/Serviceshôtels/meetingroom.avif' },
            { value: 'conference', label: 'Conférence', desc: 'Congrès, salon', image: '../../assets/images/discovery/events.avif' },
            { value: 'teambuilding', label: 'Team building', desc: 'Cohésion, activités', image: '../../assets/images/discovery/friendtravel.avif' },
            { value: 'corporate', label: 'Événement corporate', desc: 'Lancement, gala', image: '../../assets/images/discovery/business.avif' }
          ]
        : [
            { value: 'wedding', label: 'Mariage', desc: 'Cérémonie & réception', image: '../../assets/images/Q1/event.webp' },
            { value: 'evg-evjf', label: 'EVG / EVJF', desc: 'Enterrement de vie', image: '../../assets/images/discovery/friends.avif' },
            { value: 'birthday', label: 'Anniversaire', desc: 'Fête & célébration', image: '../../assets/images/discovery/gastro.avif' },
            { value: 'other', label: 'Autre célébration', desc: 'Baptême, fiançailles...', image: '../../assets/images/discovery/couple.avif' }
          ];
      const selected = this.state.eventSubType;
      const idx = this.state.carouselIndex ?? 0;
      return `
        <div class="wd-discovery-modal">
          <div class="wd-discovery-modal__content">
            <button class="wd-discovery-modal__close" aria-label="Fermer">${ICON.close}</button>
            <h2 class="wd-discovery-modal__title">Précisez votre événement</h2>
            <p class="wd-discovery-modal__subtitle">${isPro ? 'Quel format professionnel envisagez-vous ?' : 'Quelle célébration préparez-vous ?'}</p>
            <div class="wd-discovery-modal__question">
              <div class="wd-discovery-modal__options">
                ${options.map((opt, i) => {
                  let className = 'wd-discovery-modal__option wd-discovery-modal__option--card';
                  if (i === idx) className += ' is-active';
                  else if (i === (idx - 1 + options.length) % options.length) className += ' is-prev';
                  else if (i === (idx + 1) % options.length) className += ' is-next';
                  else className += i < idx ? ' is-hidden-left-1' : ' is-hidden-right-1';
                  if (selected === opt.value) className += ' is-selected';
                  return `<button class="${className}" data-value="${opt.value}" data-index="${i}" style="background-image: url('${opt.image}'); background-size: cover; background-position: center;">
                    <div class="wd-discovery-modal__option-checkbox">${ICON.check}</div>
                    <div class="wd-discovery-modal__option-content">
                      <span>${opt.label}</span>
                      <small class="wd-discovery-modal__option-desc">${opt.desc}</small>
                    </div>
                  </button>`;
                }).join('')}
              </div>
              <div class="wd-discovery-modal__carousel-nav">
                ${options.map((_, i) => `<button class="wd-discovery-modal__carousel-dot${i === idx ? ' is-active' : ''}" data-dot="${i}"></button>`).join('')}
              </div>
            </div>
            <div class="wd-discovery-modal__footer">
              <div class="wd-discovery-modal__stepper">Étape ${this._getStepNumber()}/${this._getStepTotal()}</div>
              <button class="wd-discovery-modal__back" aria-label="Retour">Retour</button>
              <button class="wd-discovery-modal__reset" aria-label="Recommencer">Recommencer</button>
              <button class="wd-discovery-modal__continue${selected ? ' is-active' : ''}" aria-label="Continuer">Continuer</button>
            </div>
          </div>
        </div>`;
    }

    renderEventVolume() {
      return this._renderStubScreen(
        'Combien de participants ?',
        'Le nombre d\'invités nous aide à dimensionner les espaces et services.',
        'Volume',
        [
          { value: 'small', label: 'Moins de 20' },
          { value: 'medium', label: '20 – 50' },
          { value: 'large', label: '50 – 150' },
          { value: 'xlarge', label: '150+' }
        ],
        'eventVolume', 'eventVolume'
      );
    }

    renderEventNeeds() {
      const isPro = this.state.eventFamily === 'pro';
      const options = isPro
        ? [
            { value: 'meeting-room', label: 'Salle de réunion / studio' },
            { value: 'plenary', label: 'Espace modulable grande envergure' },
            { value: 'hybrid', label: 'Réunion hybride (tech immersive)' },
            { value: 'catering', label: 'Banquets & traiteur' },
            { value: 'outdoor', label: 'Espaces verts / terrasse' },
            { value: 'rooms', label: 'Nuitées invités' },
            { value: 'av', label: 'Matériel AV & scénographie' },
            { value: 'connect', label: 'Pullman Connect (plateforme)' }
          ]
        : [
            { value: 'reception', label: 'Espace réception / salle de bal' },
            { value: 'catering', label: 'Banquets & traiteur' },
            { value: 'outdoor', label: 'Espaces verts / terrasse / rooftop' },
            { value: 'rooms', label: 'Hébergement invités' },
            { value: 'spa', label: 'Spa & bien-être' },
            { value: 'av', label: 'Décoration & scénographie' }
          ];
      return this._renderMultiSelectScreen(
        'De quoi avez-vous besoin ?',
        isPro ? 'Sélectionnez les prestations pour votre événement professionnel.' : 'Sélectionnez les prestations pour votre célébration.',
        'Besoins',
        options,
        'eventNeeds'
      );
    }

    renderGuide1() {
      return this._renderSelectCards(
        'On vous guide !',
        'Quelques questions rapides pour vous orienter vers la bonne expérience.',
        [
          { value: 'yes', label: 'Professionnel', desc: 'Voyage d\'affaires, séminaire, réunion', image: '../../assets/images/discovery/business.avif' },
          { value: 'no', label: 'Personnel', desc: 'Escapade, vacances, découverte', image: '../../assets/images/discovery/couple.avif' }
        ],
        'guideWork'
      );
    }

    renderGuide2() {
      return this._renderSelectCards(
        'Précisons ensemble',
        'Une dernière question pour vous orienter.',
        [
          { value: 'yes', label: 'Un événement', desc: 'Groupe, séminaire, célébration', image: '../../assets/images/discovery/events.avif' },
          { value: 'no', label: 'Un séjour individuel', desc: 'Déplacement solo ou en duo', image: '../../assets/images/discovery/solo.avif' }
        ],
        'guideGroup'
      );
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

      // Question 1.5: chips "avec qui" + inputs famille/amis
      if (this.state.currentStep === 1.5) {
        this.querySelectorAll('.wd-discovery-modal__chip[data-who]').forEach(chip => {
          chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const who = chip.dataset.who;
            this.state.selectedWho = who;
            this._rerenderContent();
            const mc = this.querySelector('.wd-discovery-modal__content');
            if (mc) mc.scrollTop = 0;
          });
        });

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
                const names = this.state.familyDetails.childrenNames || [];
                for (let i = 0; i < count; i++) {
                  const childLabel = names[i] ? `Âge de ${names[i]}` : `Âge de l'enfant ${i + 1}`;
                  const ageInput = document.createElement('div');
                  ageInput.className = 'wd-discovery-modal__form-group';
                  ageInput.innerHTML = `
                    <label class="wd-discovery-modal__form-label wd-discovery-modal__form-label--subtle">${childLabel}</label>
                    <input type="number" min="0" max="17" class="wd-discovery-modal__form-input child-age-input" data-index="${i}" value="${this.state.familyDetails.childrenAges[i] != null ? this.state.familyDetails.childrenAges[i] : ''}" />
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

      // Écran wishlist : sélection d'une destination sauvegardée → saut à Q5
      if (this.state.currentStep === 'wishlist') {
        const wishlist = (this.state.userProfile && this.state.userProfile.wishlist) || [];

        this.querySelectorAll('.wd-discovery-modal__wishlist-card').forEach(card => {
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            const dest = wishlist[parseInt(card.dataset.wishlistIndex)];
            if (!dest) return;
            // Sélection simple (pattern habituel du wizard) : "Continuer" mène à Q5.
            // Réutilise destinationInput (comme l'écran "hésitation") : pas de cas
            // spécial côté Résultats.
            this.state.destinationInput = dest.country ? `${dest.name}, ${dest.country}` : dest.name;
            this._rerenderContent();
          });
        });

        // Lien discret : revenir à Q3 (conserve Q1/Q1.5/Q2 déjà répondus)
        const altLink = this.querySelector('[data-wishlist-action="back-to-q3"]');
        if (altLink) {
          altLink.addEventListener('click', (e) => {
            e.stopPropagation();
            this.state.currentStep = 3;
            // Dépile l'entrée Q3 poussée à l'aller pour ne pas la dupliquer.
            if (this.state.stepHistory[this.state.stepHistory.length - 1] === 3) {
              this.state.stepHistory.pop();
            }
            this._rerenderContent();
          });
        }
      }

      // Business : champ ville/région avec autocomplete (villes Pullman + texte libre)
      if (this.state.currentStep === 'business-location' || this.state.currentStep === 'pro-location' || this.state.currentStep === 'event-location') {
        const input = this.querySelector('#businessLocationInput');
        const list = this.querySelector('#businessLocationList');
        const continueBtn = this.querySelector('.wd-discovery-modal__continue');

        if (input && list) {
          const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          const esc = s => (s || '').replace(/"/g, '&quot;');
          const cap = s => (s || '').replace(/\b\p{L}/gu, m => m.toUpperCase());

          // Catalogue des villes Pullman, agrégé depuis les hôtels (ville → pays + nb d'hôtels)
          const cityMap = new Map();
          PREVIEW_HOTELS.forEach(h => {
            const [rawCity, rawCountry] = (h.loc || '').split(',');
            const city = (rawCity || '').trim();
            if (!city) return;
            const country = (rawCountry || '').trim();
            if (!cityMap.has(city)) cityMap.set(city, { city, country, count: 0 });
            cityMap.get(city).count++;
          });
          const pullmanCities = [...cityMap.values()];
          const findCity = name => pullmanCities.find(c => norm(c.city) === norm(name));

          // Quartiers & lieux emblématiques (rattachés à une ville Pullman)
          const lieux = (MOCK_AUTOCOMPLETE.lieux || []);

          // Régions → villes Pullman réellement présentes
          const regions = [
            { name: 'Île-de-France', cities: ['Paris', 'Paris La Défense'] },
            { name: 'Côte d\'Azur', cities: ['Nice', 'Cannes'] },
            { name: 'Provence', cities: ['Marseille', 'Cannes', 'Nice'] },
            { name: 'Occitanie', cities: ['Toulouse', 'Montpellier'] },
            { name: 'Nouvelle-Aquitaine', cities: ['Bordeaux'] },
            { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon'] },
            { name: 'Asie du Sud-Est', cities: ['Bangkok', 'Singapour', 'Bali', 'Hô Chi Minh-Ville', 'Kuala Lumpur'] },
            { name: 'Moyen-Orient', cities: ['Dubaï', 'Doha', 'Ras Al Khaimah', 'Sharjah'] },
            { name: 'Maghreb', cities: ['Marrakech', 'El Jadida'] },
            { name: 'Océan Indien', cities: ['Maldives'] }
          ].filter(r => r.cities.some(findCity));

          // Villes SANS Pullman → alternatives Pullman les plus proches
          const nearby = {
            'nantes': ['Bordeaux', 'Paris'],
            'lille': ['Paris', 'Bruxelles'],
            'strasbourg': ['Paris', 'Munich'],
            'rennes': ['Paris', 'Bordeaux'],
            'grenoble': ['Lyon'],
            'nancy': ['Paris'],
            'rouen': ['Paris'],
            'clermont-ferrand': ['Lyon'],
            'dijon': ['Lyon', 'Paris'],
            'genève': ['Lyon', 'Bâle'],
            'amsterdam': ['Eindhoven', 'Bruxelles'],
            'madrid': ['Barcelone'],
            'new york': ['Miami']
          };

          // Destinations populaires (affichées au focus / si aucune saisie)
          const popular = ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Londres', 'Barcelone', 'Dubaï', 'Marrakech', 'Singapour', 'Bangkok', 'Tokyo']
            .map(findCity).filter(Boolean);

          const ICONS = {
            city: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>',
            region: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/></svg>',
            lieu: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h6"/></svg>'
          };

          let activeIndex = -1;

          const setContinue = (on) => { if (continueBtn) continueBtn.classList.toggle('is-active', on); };

          const closeList = () => {
            list.hidden = true;
            list.innerHTML = '';
            activeIndex = -1;
            input.setAttribute('aria-expanded', 'false');
          };

          const openList = () => {
            list.hidden = false;
            activeIndex = -1;
            input.setAttribute('aria-expanded', 'true');
            // Ouvre vers le haut si la place manque sous le champ (modale scrollable)
            const content = input.closest('.wd-discovery-modal__content');
            const inputRect = input.getBoundingClientRect();
            const boundBottom = content ? content.getBoundingClientRect().bottom : window.innerHeight;
            const boundTop = content ? content.getBoundingClientRect().top : 0;
            const needed = Math.min(list.scrollHeight, 260) + 12;
            const spaceBelow = boundBottom - inputRect.bottom;
            const spaceAbove = inputRect.top - boundTop;
            list.classList.toggle('is-up', spaceBelow < needed && spaceAbove > spaceBelow);
          };

          const selectCity = (city) => {
            input.value = city;
            this.state.businessLocation = city;
            setContinue(true);
            closeList();
          };

          const groupLi = (label) => `<li class="wd-discovery-modal__autocomplete-group" role="presentation">${label}</li>`;

          const itemLi = (value, labelHtml, meta, kind) => `<li class="wd-discovery-modal__autocomplete-item" role="option" data-city="${esc(value)}"><span class="wd-discovery-modal__ac-icon">${ICONS[kind] || ICONS.city}</span><span class="wd-discovery-modal__ac-text"><span class="wd-discovery-modal__ac-name">${labelHtml}</span>${meta ? `<span class="wd-discovery-modal__ac-meta">${meta}</span>` : ''}</span></li>`;

          const cityMeta = (c) => {
            const hotels = c.count > 1 ? `${c.count} hôtels` : '1 hôtel';
            return c.country ? `${c.country} · ${hotels}` : hotels;
          };

          const renderList = (rawQuery) => {
            const query = (rawQuery || '').trim();
            const q = norm(query);
            const hi = (name) => {
              if (!q) return name;
              const i = norm(name).indexOf(q);
              return i < 0 ? name : `${name.slice(0, i)}<strong>${name.slice(i, i + query.length)}</strong>${name.slice(i + query.length)}`;
            };

            let html = '';

            if (!q) {
              html += groupLi('Destinations populaires');
              html += popular.map(c => itemLi(c.city, c.city, cityMeta(c), 'city')).join('');
              list.innerHTML = html;
              openList();
              return;
            }

            const cityMatches = pullmanCities.filter(c => norm(c.city).includes(q))
              .sort((a, b) => norm(a.city).indexOf(q) - norm(b.city).indexOf(q) || b.count - a.count);
            const regionMatches = regions.filter(r => norm(r.name).includes(q));
            const lieuMatches = lieux.filter(l => norm(l.name).includes(q));

            if (cityMatches.length) {
              html += groupLi('Villes Pullman');
              html += cityMatches.slice(0, 6).map(c => itemLi(c.city, hi(c.city), cityMeta(c), 'city')).join('');
            }
            if (regionMatches.length) {
              html += groupLi('Régions');
              html += regionMatches.slice(0, 3).map(r => itemLi(r.name, hi(r.name), `${r.cities.filter(findCity).length} villes Pullman`, 'region')).join('');
            }
            if (lieuMatches.length) {
              html += groupLi('Quartiers & lieux');
              html += lieuMatches.slice(0, 4).map(l => itemLi(l.name, hi(l.name), `${l.type} · ${l.loc}`, 'lieu')).join('');
            }

            if (!html) {
              const nearKey = Object.keys(nearby).find(k => norm(k).includes(q) || q.includes(norm(k)));
              if (nearKey) {
                html += `<li class="wd-discovery-modal__autocomplete-empty" role="presentation">Pas d'hôtel Pullman à <strong>${cap(nearKey)}</strong>. Voici les Pullman les plus proches :</li>`;
                html += nearby[nearKey].map(name => {
                  const c = findCity(name);
                  return itemLi(name, name, c ? cityMeta(c) : '', 'city');
                }).join('');
              } else {
                html += `<li class="wd-discovery-modal__autocomplete-empty" role="presentation">Aucun Pullman ne correspond à «&nbsp;${query}&nbsp;». Découvrez nos destinations :</li>`;
                html += popular.slice(0, 6).map(c => itemLi(c.city, c.city, cityMeta(c), 'city')).join('');
              }
            }

            list.innerHTML = html;
            openList();
          };

          const setActive = (delta) => {
            const items = [...list.querySelectorAll('.wd-discovery-modal__autocomplete-item')];
            if (items.length === 0) return;
            items.forEach(el => el.classList.remove('is-active'));
            activeIndex = (activeIndex + delta + items.length) % items.length;
            items[activeIndex].classList.add('is-active');
            items[activeIndex].scrollIntoView({ block: 'nearest' });
          };

          input.addEventListener('input', (e) => {
            const value = e.target.value;
            this.state.businessLocation = value.trim() ? value : null;
            setContinue(value.trim().length > 0);
            renderList(value);
          });

          input.addEventListener('keydown', (e) => {
            if (list.hidden) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(-1); }
            else if (e.key === 'Enter' && activeIndex >= 0) {
              e.preventDefault();
              const item = list.querySelectorAll('.wd-discovery-modal__autocomplete-item')[activeIndex];
              if (item) selectCity(item.dataset.city);
            } else if (e.key === 'Escape') {
              closeList();
            }
          });

          // mousedown (avant blur) pour que le clic sélectionne bien l'item
          list.addEventListener('mousedown', (e) => {
            const item = e.target.closest('.wd-discovery-modal__autocomplete-item');
            if (!item) return;
            e.preventDefault();
            selectCity(item.dataset.city);
          });

          input.addEventListener('focus', () => { renderList(input.value); });
          input.addEventListener('blur', () => { setTimeout(closeList, 120); });
        }
      }

      // Business : sélecteur de dates (arrivée → départ) en un seul champ, UI Pullman
      if (['business-dates', 'pro-dates', 'event-dates'].includes(this.state.currentStep)) {
        const field = this.querySelector('#dateRangeField');
        const valueEl = this.querySelector('#dateRangeValue');
        const calendar = this.querySelector('#dateRangeCalendar');
        const title = this.querySelector('#calendarTitle');
        const daysEl = this.querySelector('#calendarDays');
        const hint = this.querySelector('#calendarHint');
        const continueBtn = this.querySelector('.wd-discovery-modal__continue');

        if (field && calendar && daysEl) {
          const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
          const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
          const pad = n => String(n).padStart(2, '0');
          const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());
          const fmt = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS_SHORT[m - 1]} ${y}`; };

          // Vue courante : mois de l'arrivée si déjà choisie, sinon mois en cours
          const start = this.state.checkInDate ? this.state.checkInDate.split('-').map(Number) : null;
          let viewY = start ? start[0] : today.getFullYear();
          let viewM = start ? start[1] - 1 : today.getMonth();

          const updateField = () => {
            const { checkInDate, checkOutDate } = this.state;
            if (checkInDate && checkOutDate) {
              valueEl.textContent = `${fmt(checkInDate)} → ${fmt(checkOutDate)}`;
              valueEl.classList.remove('is-placeholder');
            } else if (checkInDate) {
              valueEl.textContent = `${fmt(checkInDate)} → …`;
              valueEl.classList.remove('is-placeholder');
            } else {
              valueEl.textContent = 'Arrivée — Départ';
              valueEl.classList.add('is-placeholder');
            }
            const valid = checkInDate && checkOutDate && checkOutDate > checkInDate;
            if (continueBtn) continueBtn.classList.toggle('is-active', !!valid);
          };

          const updateHint = () => {
            if (!this.state.checkInDate || this.state.checkOutDate) hint.textContent = "Sélectionnez votre date d'arrivée";
            else hint.textContent = 'Sélectionnez votre date de départ';
          };

          const renderDays = () => {
            title.textContent = `${MONTHS[viewM]} ${viewY}`;
            const firstDay = new Date(viewY, viewM, 1).getDay();      // 0 = dimanche
            const offset = (firstDay + 6) % 7;                        // grille lundi → dimanche
            const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
            const { checkInDate, checkOutDate } = this.state;

            let html = '';
            for (let i = 0; i < offset; i++) html += '<span class="wd-discovery-modal__day is-empty"></span>';
            for (let d = 1; d <= daysInMonth; d++) {
              const iso = toISO(viewY, viewM, d);
              const cls = ['wd-discovery-modal__day'];
              if (iso < todayISO) cls.push('is-disabled');
              if (iso === todayISO) cls.push('is-today');
              if (iso === checkInDate) cls.push(checkOutDate ? 'is-start' : 'is-single');
              if (iso === checkOutDate) cls.push('is-end');
              if (checkInDate && checkOutDate && iso > checkInDate && iso < checkOutDate) cls.push('is-in-range');
              html += `<button type="button" class="${cls.join(' ')}" data-date="${iso}"${iso < todayISO ? ' disabled' : ''}>${d}</button>`;
            }
            daysEl.innerHTML = html;

            // Bornes de navigation : pas de mois entièrement passé
            const prevBtn = calendar.querySelector('[data-nav="-1"]');
            const atCurrentMonth = viewY === today.getFullYear() && viewM === today.getMonth();
            prevBtn.disabled = atCurrentMonth;
          };

          const openCal = () => { calendar.hidden = false; field.setAttribute('aria-expanded', 'true'); renderDays(); updateHint(); };
          const closeCal = () => { calendar.hidden = true; field.setAttribute('aria-expanded', 'false'); };

          field.addEventListener('click', (e) => {
            e.stopPropagation();
            calendar.hidden ? openCal() : closeCal();
          });

          calendar.addEventListener('click', (e) => {
            e.stopPropagation();
            const nav = e.target.closest('[data-nav]');
            if (nav && !nav.disabled) {
              viewM += parseInt(nav.dataset.nav);
              if (viewM < 0) { viewM = 11; viewY--; }
              else if (viewM > 11) { viewM = 0; viewY++; }
              renderDays();
              return;
            }
            const dayBtn = e.target.closest('.wd-discovery-modal__day');
            if (!dayBtn || dayBtn.disabled || dayBtn.classList.contains('is-empty')) return;
            const iso = dayBtn.dataset.date;

            if (!this.state.checkInDate || this.state.checkOutDate) {
              // Nouveau départ
              this.state.checkInDate = iso;
              this.state.checkOutDate = null;
            } else if (iso <= this.state.checkInDate) {
              // Clic avant/sur l'arrivée → redéfinit l'arrivée
              this.state.checkInDate = iso;
            } else {
              this.state.checkOutDate = iso;
            }

            renderDays();
            updateField();
            updateHint();

            // Fermeture auto quand la plage est complète
            if (this.state.checkInDate && this.state.checkOutDate) {
              setTimeout(closeCal, 250);
            }
          });

          // Fermeture au clic extérieur
          this._dateRangeOutside && document.removeEventListener('click', this._dateRangeOutside);
          this._dateRangeOutside = (e) => {
            if (!this.contains(e.target)) return;
            if (calendar.hidden) return;
            if (!e.target.closest('.wd-discovery-modal__daterange')) closeCal();
          };
          document.addEventListener('click', this._dateRangeOutside);

          updateField();
        }
      }

      // Q5 (période) : sélection du MOIS avec le même composant calendrier (nav par année)
      if (this.state.currentStep === 4) {
        const pField = this.querySelector('#periodField');
        const pCal = this.querySelector('#periodCalendar');
        const pTitle = this.querySelector('#periodYearTitle');
        const pMonths = this.querySelector('#periodMonths');
        const pValue = this.querySelector('#periodValue');
        const continueBtn = this.querySelector('.wd-discovery-modal__continue');

        if (pField && pCal && pMonths) {
          const SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          const FULL = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
          const VALUES = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
          const now = new Date();
          const curY = now.getFullYear();
          const curM = now.getMonth();
          let viewY = this.state.selectedYear || curY;

          const updateContinue = () => {
            if (continueBtn) continueBtn.classList.toggle('is-active', !!(this.state.selectedMonth && this.state.selectedDuration));
          };
          const updateValue = () => {
            if (this.state.selectedMonth) {
              const i = VALUES.indexOf(this.state.selectedMonth);
              pValue.textContent = `${FULL[i]} ${this.state.selectedYear || curY}`;
              pValue.classList.remove('is-placeholder');
            } else {
              pValue.textContent = 'Choisissez une période';
              pValue.classList.add('is-placeholder');
            }
          };
          const renderMonths = () => {
            pTitle.textContent = viewY;
            let html = '';
            for (let i = 0; i < 12; i++) {
              const disabled = viewY === curY && i < curM;
              const selected = this.state.selectedMonth === VALUES[i] && (this.state.selectedYear || curY) === viewY;
              const cls = ['wd-discovery-modal__month-cell'];
              if (disabled) cls.push('is-disabled');
              if (selected) cls.push('is-selected');
              html += `<button type="button" class="${cls.join(' ')}" data-pmonth="${i}"${disabled ? ' disabled' : ''}>${SHORT[i]}</button>`;
            }
            pMonths.innerHTML = html;
            const prev = pCal.querySelector('[data-pnav="-1"]');
            const next = pCal.querySelector('[data-pnav="1"]');
            prev.disabled = viewY <= curY;
            next.disabled = viewY >= curY + 10;
          };
          const openCal = () => { pCal.hidden = false; pField.setAttribute('aria-expanded', 'true'); renderMonths(); };
          const closeCal = () => { pCal.hidden = true; pField.setAttribute('aria-expanded', 'false'); };

          pField.addEventListener('click', (e) => { e.stopPropagation(); pCal.hidden ? openCal() : closeCal(); });

          pCal.addEventListener('click', (e) => {
            e.stopPropagation();
            const nav = e.target.closest('[data-pnav]');
            if (nav && !nav.disabled) { viewY += parseInt(nav.dataset.pnav); renderMonths(); return; }
            const cell = e.target.closest('.wd-discovery-modal__month-cell');
            if (!cell || cell.disabled) return;
            const i = parseInt(cell.dataset.pmonth);
            this.state.selectedMonth = VALUES[i];
            this.state.selectedYear = viewY;
            renderMonths();
            updateValue();
            updateContinue();
            setTimeout(closeCal, 200);
          });

          this._periodOutside && document.removeEventListener('click', this._periodOutside);
          this._periodOutside = (e) => {
            if (!this.contains(e.target)) return;
            if (pCal.hidden) return;
            if (!e.target.closest('.wd-discovery-modal__daterange')) closeCal();
          };
          document.addEventListener('click', this._periodOutside);

          updateValue();
          updateContinue();
        }
      }

      // Handlers génériques pour chips stub (single select)
      this.querySelectorAll('[data-stub-value]').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const field = chip.dataset.stubField;
          const value = chip.dataset.stubValue;
          this.state[field] = value;
          this._rerenderContent();
        });
      });

      // Handlers génériques pour chips multi-select
      this.querySelectorAll('[data-multi-value]').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const field = chip.dataset.multiField;
          const value = chip.dataset.multiValue;
          if (!Array.isArray(this.state[field])) this.state[field] = [];
          const idx = this.state[field].indexOf(value);
          if (idx >= 0) {
            this.state[field].splice(idx, 1);
          } else {
            this.state[field].push(value);
          }
          this._rerenderContent();
        });
      });

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

            if (previousStep === 1) {
              this.state.carouselIndex = 1;
            } else if (previousStep === 2 || previousStep === 3.3) {
              this.state.carouselIndex = (previousStep === 2 && this.state.selectedStayType === 'pro') ? 0 : 2;
            }

            // Re-render + scroll en haut (évite un décalage visuel hérité
            // de l'étape précédente, par ex. wishlist après Q5 scrollée).
            this._rerenderContent();
            const mc = this.querySelector('.wd-discovery-modal__content');
            if (mc) mc.scrollTop = 0;
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
          if (!continueBtn.classList.contains('is-active')) return;

          // Pousser l'étape actuelle dans l'historique avant de naviguer
          this.state.stepHistory.push(this.state.currentStep);

          // Obtenir la prochaine étape via la fonction centralisée
          const nextStep = this.getNextStep(this.state.currentStep, this.state);

          if (nextStep === 'results') {
            console.log('Navigating to results loading...');
            this.state.currentStep = 'results-loading';
            this._rerenderContent();
            const mc2 = this.querySelector('.wd-discovery-modal__content');
            if (mc2) mc2.scrollTop = 0;
            this._startResultsLoading();
            return;
          }

          console.log('Advancing from', this.state.currentStep, 'to', nextStep);
          this.state.currentStep = nextStep;

          if (nextStep === 2 || nextStep === 3.2 || nextStep === 3.3) {
            this.state.carouselIndex = 2;
          }
          if (nextStep === 'event-subtype') {
            this.state.carouselIndex = 0;
          }

          // Re-render + scroll en haut pour la nouvelle étape
          this._rerenderContent();
          const mc = this.querySelector('.wd-discovery-modal__content');
          if (mc) mc.scrollTop = 0;
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
              this.querySelectorAll('.wd-discovery-modal__option').forEach(opt => {
                opt.classList.remove('is-selected');
              });

              this.state.selectedStayType = value;
              this.state.selectedWho = value === 'pro' ? 'business' : null;
              this.state.eventFamily = null;
              this.state.eventSubType = null;
              this.state.proContext = null;
              this.state.proNeeds = [];
              this.state.bleisureChoice = null;
              this.state.guideWork = null;
              this.state.guideGroup = null;
              console.log('Set selectedStayType to:', value);
              option.classList.add('is-selected');
              const continueBtn = this.querySelector('.wd-discovery-modal__continue');
              if (continueBtn) {
                continueBtn.classList.add('is-active');
              }
              const stepper = this.querySelector('.wd-discovery-modal__stepper');
              if (stepper) {
                stepper.textContent = `Étape 1/${this._getStepTotal()}`;
              }
            } else {
              console.log('Q1: Not active card, navigating to:', clickedIndex);
              this.state.carouselIndex = clickedIndex;
              this.updateCarouselPosition();
            }
          }
          // Event Subtype: Carousel single-select
          else if (this.state.currentStep === 'event-subtype') {
            if (clickedIndex === this.state.carouselIndex) {
              this.querySelectorAll('.wd-discovery-modal__option').forEach(opt => {
                opt.classList.remove('is-selected');
              });
              this.state.eventSubType = value;
              option.classList.add('is-selected');
              const continueBtn = this.querySelector('.wd-discovery-modal__continue');
              if (continueBtn) continueBtn.classList.add('is-active');
            } else {
              this.state.carouselIndex = clickedIndex;
              this.updateCarouselPosition();
            }
          } else {
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
          const totalOptions = this.state.currentStep === 1 ? 4 : (this.state.currentStep === 2 ? 5 : 5);

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

          // Q6 (services) : rendu à l'étape 5 (flux standard) ou 6 (flux business)
          const q5Btn = e.target.closest('[data-type="service"]');
          if (q5Btn && (this.state.currentStep === 5 || this.state.currentStep === 6)) {
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

      if (this.state.currentStep === 'results') {
        const editBtn = this.querySelector('.wd-discovery-modal__results-edit');
        if (editBtn) {
          editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.state.stepHistory.length > 0) {
              const prevStep = this.state.stepHistory.pop();
              this.state.currentStep = prevStep === 'results-loading' && this.state.stepHistory.length > 0
                ? this.state.stepHistory.pop() : prevStep;
              this._rerenderContent();
              const mc = this.querySelector('.wd-discovery-modal__content');
              if (mc) mc.scrollTop = 0;
            }
          });
        }

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
      const totalOptions = this.state.currentStep === 1 ? 4 : (this.state.currentStep === 2 ? 5 : 0);
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

    // Point d'entrée : orchestre deux dimensions de branchement INDÉPENDANTES.
    //   1. le profil (selectedWho) — choix fait dans le wizard (Q1)
    //   2. la connexion (isConnected) — connue avant le wizard
    // Chaque dimension a sa propre méthode de résolution ; elles ne sont pas
    // fusionnées en une seule condition, pour rester lisibles et extensibles.
    getNextStep(currentStep, state) {
      // Dimension 1 — profil
      const next = this._getNextStepByProfile(currentStep, state);
      // Dimension 2 — connexion (sans effet pour l'instant : renvoie `next` tel quel)
      return this._resolveConnectionRouting(currentStep, next, state);
    }

    // Dimension "connexion" : couche dédiée où vivra le branchement selon
    // state.isConnected (wishlist, points fidélité, prefill…). Aujourd'hui
    // volontairement transparente — aucun changement de comportement.
    _resolveConnectionRouting(currentStep, next, state) {
      if (!state.isConnected) return next; // parcours identique à l'existant
      // TODO (itérations futures) : ajuster `next` selon state.userProfile.
      return next;
    }

    _getNextStepByProfile(currentStep, state) {
      // Q1 → branche selon selectedStayType
      if (currentStep === 1) {
        switch (state.selectedStayType) {
          case 'escapade': return 1.5;
          case 'pro':
            state.selectedWho = 'business';
            return 'pro-location';
          case 'event':
            state.selectedWho = 'business';
            return 'event-family';
          case 'guide': return 'guide-1';
          default: return 1;
        }
      }

      // ── Branche Escapade (flux loisir, ex-V1) ──
      if (state.selectedStayType === 'escapade') {
        switch (currentStep) {
          case 1.5: return 2;
          case 2: return 3;
          case 3:
            if (state.destinationIdea === 'yes') return 3.2;
            if (state.destinationIdea === 'no' || state.destinationIdea === 'multiple') return 3.3;
            if (state.destinationIdea === 'wishlist') return 'wishlist';
            return 3;
          case 3.1: return 4;
          case 3.2: return 4;
          case 3.3: return 4;
          case 'wishlist': return state.destinationInput ? 4 : 'wishlist';
          case 4: return 5;
          case 5: return 'results';
          default: return currentStep;
        }
      }

      // ── Branche Pro ──
      if (state.selectedStayType === 'pro') {
        switch (currentStep) {
          case 'pro-location': return 'pro-dates';
          case 'pro-dates': return 'pro-needs';
          case 'pro-needs': return 'pro-bleisure';
          case 'pro-bleisure': return 'results';
          default: return currentStep;
        }
      }

      // ── Branche Événement ──
      if (state.selectedStayType === 'event') {
        switch (currentStep) {
          case 'event-family': return 'event-subtype';
          case 'event-subtype': return 'event-location';
          case 'event-location': return 'event-dates';
          case 'event-dates': return 'event-volume';
          case 'event-volume': return 'event-needs';
          case 'event-needs': return 'results';
          default: return currentStep;
        }
      }

      // ── Branche Guide (mini-triage) ──
      if (state.selectedStayType === 'guide') {
        if (currentStep === 'guide-1') {
          if (state.guideWork === 'no') {
            state.selectedStayType = 'escapade';
            return 1.5;
          }
          return 'guide-2';
        }
        if (currentStep === 'guide-2') {
          if (state.guideGroup === 'yes') {
            state.selectedStayType = 'event';
            return 'event-family';
          }
          state.selectedStayType = 'pro';
          state.selectedWho = 'business';
          return 'pro-location';
        }
        return currentStep;
      }

      return currentStep;
    }

    restart() {
      this.state = this.getInitialState();
      this._rerenderContent();
    }

    // Re-rend le contenu de la modale à partir de l'état courant (remplace le
    // pattern tempDiv → innerHTML → afterRender répété dans les handlers).
    _rerenderContent() {
      const modalContent = this.querySelector('.wd-discovery-modal__content');
      if (!modalContent) return;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.render();
      const newContent = tempDiv.querySelector('.wd-discovery-modal__content');
      if (newContent) {
        modalContent.innerHTML = newContent.innerHTML;
        this.afterRender();
      }
    }

    open() {
      this.isOpen = true;
      // Synchronise la dimension "connexion" avec l'état de connexion du header
      // (la connexion est connue avant le wizard). Dans ce prototype, un
      // utilisateur connecté (WD_USER_PROFILE) dispose d'une wishlist mockée.
      const header = document.querySelector('wd-header');
      const connected = !!(header && header.isLoggedIn);
      if (connected !== this.state.isConnected) {
        this.setConnected(connected);
        this._rerenderContent();
      }
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

      // Réinitialisation complète (même forme que le constructeur / restart)
      // pour éviter tout champ undefined à la réouverture.
      this.state = this.getInitialState();
    }
  });

  // Liens placeholder (href="#") : cliquables mais ne sautent pas en haut de page.
  // N'affecte pas les ancres de section (href="#id") ni les liens tel:.
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

})();
