# Discovery Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-state visual wizard that helps undecided Pullman homepage visitors discover destinations through 2 questions (Avec qui voyagez-vous? / Quel type de voyage?) and shows 3 personalized recommendations.

**Architecture:** Single Web Component (`wd-discovery-wizard`) extending `WdEl` base class. Component transforms through 3 states in one container section: Q1 → Q2 → Results. Uses JSON data file for questions/destinations. CSS transitions handle state changes. Filtering algorithm matches user selections to destination tags.

**Tech Stack:** Vanilla JS Web Components (WdEl base), CSS with Figma tokens, JSON data, existing Pullman carousel integration

---

## File Structure

**New files:**
- `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/brands/pullman/discovery-data.json` - Questions and destinations data
- `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/core/styles/discovery-wizard.css` - All component styles

**Modified files:**
- `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/core/components/components.js` - Add wd-discovery-wizard component definition
- `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/pages/pullman/brand-homepage-tabs.html` - Add component after hero, link stylesheet

---

### Task 1: Create Discovery Data JSON

**Files:**
- Create: `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/brands/pullman/discovery-data.json`

- [ ] **Step 1: Create data file with questions structure**

```json
{
  "questions": {
    "q1": {
      "title": "Avec qui voyagez-vous ?",
      "subtitle": "Répondez à 2 questions rapides pour découvrir votre prochaine destination",
      "options": [
        {
          "value": "solo",
          "label": "Solo",
          "icon": "person",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "couple",
          "label": "En couple",
          "icon": "person",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_2810-66:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "family",
          "label": "En famille",
          "icon": "person",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "friends",
          "label": "Entre amis",
          "icon": "person",
          "image": "https://m.ahstatic.com/is/image/accorhotels/GettyImages-1187421561:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "business",
          "label": "Business",
          "icon": "presentation",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_0626-10:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        }
      ]
    },
    "q2": {
      "title": "Quel type de voyage ?",
      "subtitle": "Sélectionnez l'expérience qui vous inspire",
      "options": [
        {
          "value": "wellness",
          "label": "Détente & Wellness",
          "icon": "bed",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "culture",
          "label": "Découverte culturelle",
          "icon": "pin",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_7014-44:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "city",
          "label": "City break",
          "icon": "pin",
          "image": "https://m.ahstatic.com/is/image/accorhotels/GettyImages-1187421561:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "gastro",
          "label": "Gastronomie",
          "icon": "utensils",
          "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        },
        {
          "value": "events",
          "label": "Business & Events",
          "icon": "presentation",
          "image": "https://m.ahstatic.com/is/image/accorhotels/PullmanEvent:16by9?fmt=jpg&wid=600&hei=338&qlt=80"
        }
      ]
    }
  },
  "destinations": []
}
```

- [ ] **Step 2: Add destinations array with full data**

Add this to the file after the `"questions"` object (replace `"destinations": []`):

```json
"destinations": [
  {
    "id": "paris",
    "name": "Paris",
    "image": "https://m.ahstatic.com/is/image/accorhotels/GettyImages-1187421561:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["couple", "solo", "friends"],
    "type": ["culture", "gastro", "city"],
    "descriptions": {
      "couple-city": "Parfait pour un city break en couple",
      "couple-culture": "Idéal pour une découverte culturelle à deux",
      "couple-gastro": "Parfait pour une escapade gastronomique en couple",
      "solo-city": "Idéal pour un city break en solo",
      "solo-culture": "Parfait pour une découverte culturelle en solo",
      "solo-gastro": "Idéal pour une escapade gastronomique en solo",
      "friends-city": "Parfait pour un city break entre amis",
      "friends-culture": "Idéal pour une découverte culturelle entre amis",
      "friends-gastro": "Parfait pour une escapade gastronomique entre amis"
    }
  },
  {
    "id": "singapore",
    "name": "Singapour",
    "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_1029-36:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["couple", "solo", "friends", "business"],
    "type": ["city", "gastro", "culture", "events"],
    "descriptions": {
      "couple-city": "Parfait pour un city break en couple",
      "solo-city": "Idéal pour un city break en solo",
      "friends-city": "Parfait pour un city break entre amis",
      "business-events": "Idéal pour un voyage business",
      "couple-gastro": "Parfait pour une escapade gastronomique en couple",
      "solo-gastro": "Idéal pour une escapade gastronomique en solo",
      "friends-gastro": "Parfait pour une escapade gastronomique entre amis",
      "couple-culture": "Idéal pour une découverte culturelle à deux",
      "solo-culture": "Parfait pour une découverte culturelle en solo",
      "friends-culture": "Idéal pour une découverte culturelle entre amis"
    }
  },
  {
    "id": "bali",
    "name": "Bali",
    "image": "https://m.ahstatic.com/is/image/accorhotels/6556-1:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["couple", "family", "friends"],
    "type": ["wellness", "culture"],
    "descriptions": {
      "couple-wellness": "Parfait pour un séjour détente en couple",
      "family-wellness": "Idéal pour des vacances détente en famille",
      "friends-wellness": "Parfait pour un séjour détente entre amis",
      "couple-culture": "Idéal pour une découverte culturelle à deux",
      "family-culture": "Parfait pour une découverte culturelle en famille",
      "friends-culture": "Idéal pour une découverte culturelle entre amis"
    }
  },
  {
    "id": "dubai",
    "name": "Dubaï",
    "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_6935-96:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["couple", "family", "business"],
    "type": ["city", "wellness", "events"],
    "descriptions": {
      "couple-city": "Parfait pour un city break en couple",
      "family-city": "Idéal pour un city break en famille",
      "business-events": "Parfait pour un voyage business",
      "couple-wellness": "Idéal pour un séjour détente en couple",
      "family-wellness": "Parfait pour des vacances détente en famille"
    }
  },
  {
    "id": "shanghai",
    "name": "Shanghai",
    "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_2810-66:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["solo", "friends", "business"],
    "type": ["city", "culture", "events"],
    "descriptions": {
      "solo-city": "Idéal pour un city break en solo",
      "friends-city": "Parfait pour un city break entre amis",
      "business-events": "Parfait pour un voyage business",
      "solo-culture": "Idéal pour une découverte culturelle en solo",
      "friends-culture": "Parfait pour une découverte culturelle entre amis"
    }
  },
  {
    "id": "sao-paulo",
    "name": "São Paulo",
    "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_0626-10:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["solo", "friends", "business"],
    "type": ["city", "gastro", "events"],
    "descriptions": {
      "solo-city": "Idéal pour un city break en solo",
      "friends-city": "Parfait pour un city break entre amis",
      "business-events": "Parfait pour un voyage business",
      "solo-gastro": "Idéal pour une escapade gastronomique en solo",
      "friends-gastro": "Parfait pour une escapade gastronomique entre amis"
    }
  },
  {
    "id": "sydney",
    "name": "Sydney",
    "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_0795-31:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["couple", "family", "friends"],
    "type": ["city", "culture", "wellness"],
    "descriptions": {
      "couple-city": "Parfait pour un city break en couple",
      "family-city": "Idéal pour un city break en famille",
      "friends-city": "Parfait pour un city break entre amis",
      "couple-culture": "Idéal pour une découverte culturelle à deux",
      "family-culture": "Parfait pour une découverte culturelle en famille",
      "friends-culture": "Idéal pour une découverte culturelle entre amis",
      "couple-wellness": "Parfait pour un séjour détente en couple",
      "family-wellness": "Idéal pour des vacances détente en famille",
      "friends-wellness": "Parfait pour un séjour détente entre amis"
    }
  },
  {
    "id": "toulouse",
    "name": "Toulouse",
    "image": "https://m.ahstatic.com/is/image/accorhotels/aja_p_7014-44:9by16?fmt=jpg&wid=480&hei=853&qlt=80",
    "who": ["couple", "solo", "friends", "business"],
    "type": ["city", "culture", "gastro"],
    "descriptions": {
      "couple-city": "Parfait pour un city break en couple",
      "solo-city": "Idéal pour un city break en solo",
      "friends-city": "Parfait pour un city break entre amis",
      "couple-culture": "Idéal pour une découverte culturelle à deux",
      "solo-culture": "Parfait pour une découverte culturelle en solo",
      "friends-culture": "Idéal pour une découverte culturelle entre amis",
      "couple-gastro": "Parfait pour une escapade gastronomique en couple",
      "solo-gastro": "Idéal pour une escapade gastronomique en solo",
      "friends-gastro": "Parfait pour une escapade gastronomique entre amis"
    }
  }
]
```

- [ ] **Step 3: Verify JSON syntax**

Run: `cat /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2/brands/pullman/discovery-data.json | python3 -m json.tool > /dev/null`
Expected: No output (valid JSON)

- [ ] **Step 4: Commit data file**

```bash
cd /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2
git add brands/pullman/discovery-data.json
git commit -m "feat: add discovery wizard data (questions + destinations)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Create Discovery Wizard Stylesheet

**Files:**
- Create: `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/core/styles/discovery-wizard.css`

- [ ] **Step 1: Create base section styles**

```css
/* ============================================================
   WD-DISCOVERY-WIZARD — Visual discovery experience
   3 états : Q1 → Q2 → Results
   ============================================================ */

.wd-discovery {
  background: #f8f8f8;
  padding: 80px 64px;
  position: relative;
  overflow: hidden;
}

.wd-discovery__container {
  max-width: 1340px;
  margin: 0 auto;
  transition: opacity 400ms ease-in-out, transform 400ms ease-in-out;
}

.wd-discovery__container.state-exit {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

.wd-discovery__container.state-enter {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideIn 400ms ease-out forwards;
}

@keyframes fadeSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typography */
.wd-discovery__title {
  font-family: var(--font-family-heading, var(--font-sans));
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  color: #222;
  text-align: center;
  margin: 0 0 16px;
}

.wd-discovery__subtitle {
  font-family: var(--font-family-body, var(--font-sans));
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #717171;
  text-align: center;
  margin: 0 0 48px;
}

.wd-discovery__breadcrumb {
  color: #222;
  font-weight: 600;
  margin-left: 8px;
}

/* Restart button */
.wd-discovery__restart {
  position: absolute;
  top: 80px;
  right: 64px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 99px;
  font-family: var(--font-family-body, var(--font-sans));
  font-size: 14px;
  font-weight: 600;
  color: #222;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.wd-discovery__restart:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.2);
}
```

- [ ] **Step 2: Add discovery cards grid styles**

Append to file:

```css
/* Discovery cards (Q1 & Q2) */
.wd-discovery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.wd-discovery__card {
  position: relative;
  height: 240px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  background: transparent;
}

.wd-discovery__card-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wd-discovery__card-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%);
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wd-discovery__card:hover .wd-discovery__card-bg {
  transform: scale(1.05);
}

.wd-discovery__card:hover .wd-discovery__card-bg::after {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.wd-discovery__card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.wd-discovery__card-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
}

.wd-discovery__card-icon {
  width: 32px;
  height: 32px;
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.wd-discovery__card-label {
  font-family: var(--font-family-body, var(--font-sans));
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 3: Add results section styles**

Append to file:

```css
/* Results section */
.wd-discovery__subtitle-personalized {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  text-align: center;
  margin: -32px 0 48px;
}

.wd-discovery__results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.wd-discovery__dest-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.wd-discovery__dest-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.wd-discovery__dest-card-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.wd-discovery__dest-card-content {
  padding: 20px;
  position: relative;
}

.wd-discovery__dest-tag {
  position: absolute;
  top: -14px;
  left: 20px;
  display: inline-block;
  padding: 4px 12px;
  background: rgba(95, 239, 145, 0.9);
  color: #445047;
  font-family: var(--font-family-body, var(--font-sans));
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.wd-discovery__dest-title {
  font-family: var(--font-family-heading, var(--font-sans));
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 12px 0 8px;
}

.wd-discovery__dest-desc {
  font-family: var(--font-family-body, var(--font-sans));
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #717171;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* CTA button */
.wd-discovery__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #5fef91 0%, #4cd67d 100%);
  color: #445047;
  border: none;
  border-radius: 99px;
  font-family: var(--font-family-body, var(--font-sans));
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(95, 239, 145, 0.3);
  margin: 0 auto;
  display: flex;
  width: fit-content;
}

.wd-discovery__cta:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(95, 239, 145, 0.4);
}

.wd-discovery__cta svg {
  width: 20px;
  height: 20px;
  color: currentColor;
}
```

- [ ] **Step 4: Add responsive styles**

Append to file:

```css
/* Responsive */
@media (max-width: 1024px) {
  .wd-discovery__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .wd-discovery__results {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .wd-discovery {
    padding: 40px 24px;
  }

  .wd-discovery__title {
    font-size: 28px;
  }

  .wd-discovery__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .wd-discovery__card {
    height: 200px;
  }

  .wd-discovery__results {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .wd-discovery__restart {
    top: 40px;
    right: 24px;
    font-size: 13px;
    padding: 8px 16px;
  }
}

/* Accessibility */
.wd-discovery__card:focus-visible,
.wd-discovery__dest-card:focus-visible,
.wd-discovery__cta:focus-visible,
.wd-discovery__restart:focus-visible {
  outline: 2px solid #5fef91;
  outline-offset: 2px;
}
```

- [ ] **Step 5: Commit stylesheet**

```bash
cd /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2
git add core/styles/discovery-wizard.css
git commit -m "feat: add discovery wizard stylesheet

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Implement wd-discovery-wizard Component

**Files:**
- Modify: `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/core/components/components.js`

- [ ] **Step 1: Add component definition after existing components**

Find the line with the last component definition (before the closing IIFE `})();`), then add this BEFORE the closing:

```javascript
/* ---------- wd-discovery-wizard ---------- */
def("wd-discovery-wizard", class extends WdEl {
  render() {
    return `
      <section class="wd-discovery" aria-live="polite">
        <div class="wd-discovery__container" id="discovery-container">
          <h2 class="wd-discovery__title">Trouvez votre prochaine inspiration</h2>
          <p class="wd-discovery__subtitle">Répondez à 2 questions rapides pour découvrir votre prochaine destination</p>
          <div class="wd-discovery__grid" id="discovery-grid"></div>
        </div>
      </section>
    `;
  }

  afterRender() {
    this.state = {
      currentStep: 1,
      selectedWho: null,
      selectedType: null,
      data: null
    };

    this.loadData();
  }

  async loadData() {
    try {
      const response = await fetch('/brands/pullman/discovery-data.json');
      this.state.data = await response.json();
      this.renderQuestion1();
    } catch (error) {
      console.error('Failed to load discovery data:', error);
    }
  }

  renderQuestion1() {
    const container = this.querySelector('#discovery-container');
    const grid = this.querySelector('#discovery-grid');
    
    const q1 = this.state.data.questions.q1;
    const cards = q1.options.map(opt => `
      <button class="wd-discovery__card" data-value="${opt.value}" aria-label="${opt.label}">
        <div class="wd-discovery__card-bg" style="background-image: url('${opt.image}')"></div>
        <div class="wd-discovery__card-content">
          ${ICON[opt.icon] || ICON.person}
          <span class="wd-discovery__card-label">${opt.label}</span>
        </div>
      </button>
    `).join('');

    grid.innerHTML = cards;

    grid.querySelectorAll('.wd-discovery__card').forEach(card => {
      card.addEventListener('click', () => {
        this.state.selectedWho = card.getAttribute('data-value');
        this.transitionToQuestion2();
      });
    });
  }

  transitionToQuestion2() {
    const container = this.querySelector('#discovery-container');
    container.classList.add('state-exit');

    setTimeout(() => {
      this.renderQuestion2();
      container.classList.remove('state-exit');
      container.classList.add('state-enter');
      
      setTimeout(() => {
        container.classList.remove('state-enter');
      }, 400);
    }, 400);
  }

  renderQuestion2() {
    const container = this.querySelector('#discovery-container');
    const q2 = this.state.data.questions.q2;
    
    const whoLabel = this.state.data.questions.q1.options.find(
      opt => opt.value === this.state.selectedWho
    ).label;

    const cards = q2.options.map(opt => `
      <button class="wd-discovery__card" data-value="${opt.value}" aria-label="${opt.label}">
        <div class="wd-discovery__card-bg" style="background-image: url('${opt.image}')"></div>
        <div class="wd-discovery__card-content">
          ${ICON[opt.icon] || ICON.pin}
          <span class="wd-discovery__card-label">${opt.label}</span>
        </div>
      </button>
    `).join('');

    container.innerHTML = `
      <h2 class="wd-discovery__title">${q2.title}</h2>
      <p class="wd-discovery__subtitle">${q2.subtitle} <span class="wd-discovery__breadcrumb">${whoLabel} ></span></p>
      <div class="wd-discovery__grid" id="discovery-grid">${cards}</div>
    `;

    container.querySelectorAll('.wd-discovery__card').forEach(card => {
      card.addEventListener('click', () => {
        this.state.selectedType = card.getAttribute('data-value');
        this.transitionToResults();
      });
    });
  }

  transitionToResults() {
    const container = this.querySelector('#discovery-container');
    container.classList.add('state-exit');

    setTimeout(() => {
      this.renderResults();
      container.classList.remove('state-exit');
      container.classList.add('state-enter');
      
      setTimeout(() => {
        container.classList.remove('state-enter');
      }, 400);
    }, 400);
  }

  renderResults() {
    const container = this.querySelector('#discovery-container');
    const results = this.filterDestinations();
    
    const whoLabel = this.state.data.questions.q1.options.find(
      opt => opt.value === this.state.selectedWho
    ).label.toLowerCase();
    
    const typeLabel = this.state.data.questions.q2.options.find(
      opt => opt.value === this.state.selectedType
    ).label.toLowerCase();

    const cards = results.map(dest => {
      const descKey = `${this.state.selectedWho}-${this.state.selectedType}`;
      const description = dest.descriptions[descKey] || 
                         dest.descriptions[Object.keys(dest.descriptions)[0]] ||
                         `Découvrez ${dest.name}`;

      return `
        <div class="wd-discovery__dest-card" role="article">
          <img src="${dest.image}" alt="${dest.name}" class="wd-discovery__dest-card-img">
          <div class="wd-discovery__dest-card-content">
            <span class="wd-discovery__dest-tag">${typeLabel}</span>
            <h3 class="wd-discovery__dest-title">${dest.name}</h3>
            <p class="wd-discovery__dest-desc">${description}</p>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <button class="wd-discovery__restart" id="restart-btn" aria-label="Recommencer">
        ${ICON.chevL} Recommencer
      </button>
      <h2 class="wd-discovery__title">Vos destinations recommandées</h2>
      <p class="wd-discovery__subtitle-personalized">Pour un ${typeLabel} ${whoLabel}</p>
      <div class="wd-discovery__results">${cards}</div>
      <a href="#destinations" class="wd-discovery__cta">
        Voir toutes les destinations ${typeLabel}
        ${ICON.arrowR}
      </a>
    `;

    const restartBtn = container.querySelector('#restart-btn');
    restartBtn.addEventListener('click', () => {
      this.restart();
    });

    const cta = container.querySelector('.wd-discovery__cta');
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToCarousel();
    });
  }

  filterDestinations() {
    const destinations = this.state.data.destinations;
    
    let matches = destinations.filter(d => 
      d.who.includes(this.state.selectedWho) && 
      d.type.includes(this.state.selectedType)
    );

    if (matches.length < 3) {
      matches = destinations.filter(d => 
        d.type.includes(this.state.selectedType)
      );
    }

    return matches.slice(0, 3);
  }

  restart() {
    this.state.selectedWho = null;
    this.state.selectedType = null;
    this.state.currentStep = 1;

    const container = this.querySelector('#discovery-container');
    container.classList.add('state-exit');

    setTimeout(() => {
      this.renderQuestion1();
      container.classList.remove('state-exit');
      container.classList.add('state-enter');
      
      setTimeout(() => {
        container.classList.remove('state-enter');
      }, 400);

      this.querySelector('.wd-discovery').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 400);
  }

  scrollToCarousel() {
    const carousel = document.querySelector('.wd-carousel, wd-carousel');
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        const carouselCards = document.querySelectorAll('wd-dest-card');
        carouselCards.forEach(card => {
          const kicker = card.getAttribute('kicker') || '';
          const matchesFilter = kicker.toLowerCase().includes(this.state.selectedType) ||
                               this.state.selectedType === 'city';
          card.style.opacity = matchesFilter ? '1' : '0.3';
          card.style.transition = 'opacity 0.3s ease';
        });
      }, 600);
    }
  }
});
```

- [ ] **Step 2: Verify syntax**

Run: `node -c /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2/core/components/components.js`
Expected: No output (valid syntax)

- [ ] **Step 3: Commit component**

```bash
cd /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2
git add core/components/components.js
git commit -m "feat: add wd-discovery-wizard component

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Integrate Component into Homepage

**Files:**
- Modify: `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/pages/pullman/brand-homepage-tabs.html:10`
- Modify: `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/pages/pullman/brand-homepage-tabs.html:33`

- [ ] **Step 1: Link stylesheet in head**

Add this line after line 10 (after `header-booking.css`):

```html
  <link rel="stylesheet" href="../../core/styles/discovery-wizard.css"/>
```

- [ ] **Step 2: Add component after hero section**

Add this after line 33 (after `</wd-hero>` closing tag):

```html

<!-- ===== DISCOVERY WIZARD ===== -->
<wd-discovery-wizard></wd-discovery-wizard>
```

- [ ] **Step 3: Verify HTML syntax**

Run: `grep -n "wd-discovery-wizard" /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2/pages/pullman/brand-homepage-tabs.html`
Expected: Shows line number with component tag

- [ ] **Step 4: Commit integration**

```bash
cd /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2
git add pages/pullman/brand-homepage-tabs.html
git commit -m "feat: integrate discovery wizard into homepage

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Manual Testing & Validation

**Files:**
- Test: `/Users/amandinesolaux/Desktop/PRO/Projets Claude/PROJETS/proto-factory-pullman-V2/pages/pullman/brand-homepage-tabs.html`

- [ ] **Step 1: Start local server**

Run: `cd /Users/amandinesolaux/Desktop/PRO/Projets\ Claude/PROJETS/proto-factory-pullman-V2 && python3 -m http.server 8000`
Expected: Server running on http://localhost:8000

- [ ] **Step 2: Open page in browser**

Navigate to: `http://localhost:8000/pages/pullman/brand-homepage-tabs.html`
Expected: Page loads without console errors

- [ ] **Step 3: Test Q1 → Q2 transition**

1. Scroll to Discovery Wizard section
2. Click "En couple" card
3. Verify: Smooth transition to Q2
4. Verify: Breadcrumb shows "En couple >"
Expected: Transition animates smoothly, Q2 renders correctly

- [ ] **Step 4: Test Q2 → Results transition**

1. Click "City break" card
2. Verify: Smooth transition to results
3. Verify: Title shows "Vos destinations recommandées"
4. Verify: Subtitle shows "Pour un city break en couple"
5. Verify: 3 destination cards render
6. Verify: Each card has image, tag, title, description
Expected: All elements render correctly with proper styling

- [ ] **Step 5: Test Recommencer button**

1. Click "← Recommencer" button
2. Verify: Returns to Q1
3. Verify: State is reset (no breadcrumb)
4. Verify: Scroll to top of section
Expected: Full reset to initial state

- [ ] **Step 6: Test CTA scroll & filter**

1. Complete flow (Q1 → Q2 → Results)
2. Click "Voir toutes les destinations city break" CTA
3. Verify: Smooth scroll to carousel
4. Verify: Matching destinations (Paris, Toulouse, etc.) at opacity 1
5. Verify: Non-matching destinations at opacity 0.3
Expected: Carousel filters visually

- [ ] **Step 7: Test responsive breakpoints**

1. Resize browser to 768px width
2. Verify: Cards stack in single column
3. Verify: Padding adjusts to 40px/24px
4. Verify: Title font-size reduces to 28px
Expected: Mobile layout applies correctly

- [ ] **Step 8: Test keyboard navigation**

1. Tab through Q1 cards
2. Verify: Focus outline visible (2px solid #5fef91)
3. Press Enter on focused card
4. Verify: Advances to Q2
Expected: Full keyboard accessibility

- [ ] **Step 9: Check browser console**

Open DevTools → Console tab
Expected: Zero errors, zero warnings

- [ ] **Step 10: Verify ARIA live region**

1. Open DevTools → Accessibility tab
2. Select `.wd-discovery` element
3. Verify: `aria-live="polite"` attribute present
Expected: Screen reader will announce state changes

---

## Completion Checklist

After all tasks:

- [ ] All commits follow conventional format
- [ ] No console errors in browser
- [ ] All transitions animate smoothly (400ms)
- [ ] Hover effects work on all cards
- [ ] Filtering algorithm returns correct destinations
- [ ] CTA scrolls to carousel and applies filter
- [ ] Restart button resets state completely
- [ ] Responsive layout works at 3 breakpoints
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all interactive elements

---

## Notes

**DRY violations to avoid:**
- Don't duplicate transition logic — use `transitionToX()` helper pattern
- Don't repeat icon SVG strings — use `ICON` object from base
- Don't hardcode label lookups — use `.find()` pattern from data

**YAGNI - features NOT included:**
- Back navigation (Q2 → Q1) — spec says V1 is linear only
- Analytics tracking — spec defers to future
- 3rd question — spec says 2 questions max
- Cookie persistence — spec says future enhancement

**Edge cases handled:**
- < 3 results: Array slice handles gracefully, shows 1-2 cards
- Missing description key: Fallback to first available or generic message
- Missing carousel: `scrollToCarousel()` checks existence before scrolling
- Data load failure: Console error logged, component renders empty

**Testing note:** Task 5 is manual because this is a visual component with animations and user interactions that automated tests can't easily validate. Each step verifies observable behavior that confirms the spec requirements.
