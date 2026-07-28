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
    person: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><circle cx="8" cy="5" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M3.6 13c0-2.4 2-3.9 4.4-3.9S12.4 10.6 12.4 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`,
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
      return `<header class="wd-header">
        <div class="wd-header__top">
          <div class="wd-header__top-inner">
            <a href="#" class="wd-header__logo" aria-label="${brandName()} home">${wordmark(this)}</a>
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
  def("wd-booking", class extends WdEl {
    render() {
      const btn = this.attr("cta", "Rechercher");
      return `<div class="wd-booking">
        <div class="wd-booking__fields">
          <div class="wd-booking__field">${ICON.pin}<div><span class="wd-booking__label">Où voyagez-vous ? (obligatoire)</span><span class="wd-booking__value">Destination, nom d'hôtel</span></div></div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field">${ICON.cal}<div><span class="wd-booking__label">À quelles dates ?</span><span class="wd-booking__value">01/04/2025 → 02/04/2025</span></div></div>
          <div class="wd-booking__sep"></div>
          <div class="wd-booking__field">${ICON.person}<div><span class="wd-booking__label">Combien serez-vous ?</span><span class="wd-booking__value">1 personne, 1 chambre</span></div></div>
          <a href="#" class="wd-btn wd-btn--primary wd-booking__cta">${esc(btn)}</a>
        </div>
        <a href="#" class="wd-booking__special">Special rates and accessibility ${ICON.chevD}</a>
      </div>`;
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
      return `<a href="#" class="wd-dest-card" style="background-image:url('${img}')">
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

  // Liens placeholder (href="#") : cliquables mais ne sautent pas en haut de page.
  // N'affecte pas les ancres de section (href="#id") ni les liens tel:.
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

})();
