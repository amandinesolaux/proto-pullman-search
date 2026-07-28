# DESIGN.md — Proto hôtel welDS (Sofitel New York)

Historique, décisions et apprentissages du projet. Sert de mémoire pour reconstruire d'autres
templates/pages. Les **procédures réutilisables** sont dans deux skills :
`welds-create-template` (créer un nouveau type de page) et `welds-fill-template` (remplir un
template existant). Ce fichier = le **récit + les pièges** de ce projet précis.

---

## 1. Contexte & objectif

Proto navigable de la page d'accueil hôtel **Sofitel New York** (id Accor 2185), pour un **test
utilisateur** : mesurer la compréhension du prix « **à partir de** » sur les cartes chambres et
dans le moteur de réservation. Reproduction **iso** d'une maquette Figma.

- **Source de vérité = Figma** (fichier « 🚧 SOFITEL [Discovery] »). La prod
  (`sofitel.accor.com/fr/hotels/2185.html`) sert pour les **comportements** interactifs et le
  **contenu** de secours.
- **Devise = euros (€)** partout (décision designer ; plus d'USD).
- **Secteur luxe → zéro erreur tolérée.** Toujours vérifier le rendu contre la capture Figma.

## 2. Architecture (type Storybook, sans build)

Statique, ouvrable direct dans le navigateur. Ordre de chargement : `core/tokens/base.css` →
`core/tokens/brands.css` → `core/styles/base.css` → `core/components/components.js` (fin de body).

```
Template-1.0/
├── pages/sofitel/hotel-homepage-new-york.html ← le proto rempli (Sofitel NY) = exemple de référence
├── templates/
│   ├── hotel-homepage.html      ← template (jetons {{…}} + lorem) du type "Hotel Homepage"
│   └── README.md                ← index des templates par type de page
├── core/components/components.js     ← masters <wd-*> (classe base WdEl + objet ICON)
├── components.html              ← bibliothèque des composants
├── core/styles/base.css             ← styles + alias de tokens sur body.brand-*
├── core/tokens/base.css + brands.css ← tokens welDS, valeurs par marque
└── assets/                      ← polices réelles (Romie, GT America)
```

**Web Components** (light DOM) : base `WdEl` (`connectedCallback`, `attr()`, `has()`, `list()`
pipe-séparé), objet `ICON` partagé (wordmark, mono, person, chevrons, cal, usr, close, pin, phone,
réseaux). Règle : **ne jamais inventer de composant** — chaque `<wd-*>` = un vrai master Figma ;
une Frame (pas un composant) se fait en layout inline.

**Maintenance proto ↔ template (option 1, choix designer).** Le proto
`pages/sofitel/hotel-homepage-new-york.html` et le template `templates/sofitel/hotel-homepage.html` partagent
`components.js` + `welds.css` → tout changement de **composant** (JS/CSS) s'applique aux deux
automatiquement (gratuit, rien à faire). Seule la **structure HTML** (sections, ordre, attributs,
layout inline) diffère (contenu réel vs `{{jetons}}`). Donc : **tout changement de structure du
proto doit être répliqué dans le template dans la même opération** (vrai contenu ↔ jeton). Pas de
génération automatique (option 2 = template + data → proto, non retenue pour l'instant).

## 3. Inventaire des composants (wd-* ↔ Figma)

**Préfixe `wd-` = welDS, agnostique de la marque** (avant : `so-` = sofitel). La marque est portée
par `body.brand-<marque>` + les tokens, pas par le nom du composant → un même `<wd-*>` sert Sofitel,
Fairmont, Ibis. Les masters Figma gardent leur nom `so.*` (c'est leur nom dans le DS Sofitel).

`wd-header` (nav immersive transparente sur le héro), `wd-quick-access` (**sticky-bar noire**,
voir §6), `wd-hero` (titre seul), `wd-booking` (moteur : champs blancs + bouton doré),
`wd-welcome` (monogramme + accroche + adresse/tél), `wd-slideshow`, `wd-rooms`/`wd-collection`
(carrousels filtrants), `wd-room-card` (bloc prix « à partir de ») / `wd-card` (éditoriale),
`wd-section-heading`, `wd-highlight`, `wd-location` (3 colonnes + carte pleine largeur), `wd-faq`
(2 colonnes), `wd-footer` (voir §7), `wd-mono`, `wd-social`.

## 4. Tokens welDS — pièges (les plus coûteux)

1. **Alias sur l'élément qui porte la classe brand, pas `:root`.** Un alias
   `--ink: var(--color-on-surface-hi)` posé sur `:root` se résout avec les valeurs **brandbook**
   (héritées de `<html>`) → rendu faux. Les alias sont sur **`body[class*="brand-"]`** (sélecteur
   GÉNÉRIQUE) : les **couleurs** se re-skinnent donc pour toute marque de `brands.css`
   (sofitel, fairmont, ibis, pullman…). **Limites multi-marque** : les **polices** (Romie / GT
   America) et le **logo** (`ICON.wordmark` / `ICON.mono`, SVG Sofitel) ne sont PAS portés par les
   tokens → une autre marque doit surcharger `--font-*` (bloc `body.brand-<marque>` après le
   générique) et fournir son wordmark.
2. **`--tint` résolvait en blanc.** Côté Sofitel, `--color-surface-container-low` ET `-hi` valent
   **#FFFFFF** ; seul `-mid` vaut le crème **#F7F6F3**. Un fond « teinté » (panneau bien-être,
   sticky-bar, footer) doit pointer sur `-mid`. Symptôme : un fond censé être crème est invisible.
   → **Vérifier la valeur résolue** (getComputedStyle headless) dès qu'un fond paraît absent.
3. **Zéro hex hardcodé** sauf logos externes (contenu, pas thème) : réseaux sociaux, badge éco vert
   `#117846`.
4. Sémantique : membre = `--color-loyalty`, promo = `--color-offer`, or = `--color-accent`
   (#916F41), noir = `--color-primary` (#030403), encre = `--color-on-surface-hi` (#29201E).

## 5. Polices & images

- **Polices réelles** : Romie (serif, titres) + GT America LV Thin/Regular (sans), fichiers
  `/assets`, `@font-face` dans welds.css. Ne PAS utiliser les tokens police welDS (= Montserrat,
  casse l'iso). Roboto a été retiré (plus de Google Fonts) → variable `--font-meta` sur la sans.
- **Images** : CDN Scene7 `m.ahstatic.com/is/image/accorhotels/<ID>?wid=..&hei=..&fit=crop&qlt=85`.
  Vérifier qu'un ID est une vraie image (HTTP 200 + > ~10 ko ; tailles d'octets différentes =
  photos différentes). Photos resto/bar/petit-déj = sur les pages détail prod, pas le shoot chambres.

## 6. Sticky-bar (maquette Figma node **3651:47072** « Hotels Navigation - .sticky-bar [NEW] »)

`wd-quick-access` reconstruit d'après la maquette (avant : version crème invisible, abandonnée).
Barre **NOIRE** fixée en haut (`.wd-sticky`, `position:fixed; top:0`, `translateY(-100%)` cachée),
apparaît quand l'hôte (0 px de haut, placé après le héro) a passé le haut du viewport
(`getBoundingClientRect().top <= 0`). États (sous-nodes Figma) :
- **Scroll up** (3651:47111) : liens d'ancrage blancs + bouton or « Réserver ».
- **Scroll down → Texte** (3651:47116) : nom de l'hôtel en serif + « Réserver ».
- **Ouvert** (core 3655:10119) : clic « Réserver » → panneau blanc qui descend (Où allez-vous /
  dates / personnes + Rechercher + « Plus de critères » + croix).

`data-state` up/down piloté par le **sens de défilement** (compare scrollY au précédent). Le header
condensé sticky a été **supprimé** (doublon). Piège vérifié : un `getBoundingClientRect()` lu trop
tôt (avant que le héro de 740 px soit posé) collait la barre à tort au chargement → init différée
(`load` + double rAF), seuil = top sticky.

## 7. Footer (maquette Figma page **1197:356119**, master **1197:356123**)

Fond **crème** (#F8F7F4 ≈ `--tint`). Structure (sous-nodes section 1 = `…26547`, section 2 =
`…26556`) :
1. Wordmark SOFITEL centré entre deux **fins traits** horizontaux.
2. Réseaux centrés : Facebook, YouTube, Instagram, TikTok, Spotify (5, tracés simple-icons propres,
   26 px). **Pas de LinkedIn** (absent prod).
3. Ligne 1 : « Offres exclusives » (newsletter, texte + bouton **contour** « S'abonner ») | « Besoin
   d'aide ? » (col 3).
4. Ligne 2 : 4 colonnes — Solutions professionnelles / Navigation (seulement « Accessibilité du
   Web ») / Société / Application mobile.
5. Logo **ALL** graphique « All » + « ACCOR » empilé (approximé), entre deux traits.
6. Portfolio marques : **nom du tier à gauche + marques en grille à droite** (en prod = logos ; ici
   en texte, asset logos non fournis — limite assumée et validée par le designer).
7. Légal : CGS / Confidentialité / Cookies / Plan du site / Mentions légales / Ne pas vendre mes
   informations personnelles.

## 8. Badge éco (maquette page **65:90847**)

Le DS **n'a pas de logo « Green Key »**. L'éco = composant `so.badge` « **Eco certified** » (node
150:122694) : pastille **verte #117846** + feuille. → badge « Établissement éco-certifié » (feuille
verte + pastille verte). Un faux logo Green Key dessiné à la main avait été refusé : leçon =
**vérifier le DS avant d'inventer un asset**, et **le dire si on ne sait pas reproduire**.

## 9. Méthodo de vérification (boucle headless ↔ Figma)

- **Capture Figma** : `figma_capture_screenshot({nodeId, scale:2})` (runtime plugin, fiable). Gros
  frames = timeout → capturer les **sous-nodes** par id (arbo via `figma_execute` shallow walk).
  Lire couleur/texte exacts via `figma_execute` (fills/strokes/characters). `findAll` global =
  timeout → scoper à une page + try/catch.
- **Rendu headless Chrome** (macOS) : `--headless=new --use-gl=angle --use-angle=swiftshader
  --enable-unsafe-swiftshader` (**GPU obligatoire** pour `backdrop-filter`), `--virtual-time-budget`,
  `--run-all-compositor-stages-before-draw`. Fenêtre max ~8000 px (limite SwiftShader) → cropper par
  bandes (PIL, **pas numpy**).
- **États JS** (filtres onglets, sticky scroll, popovers) **ne se reflètent pas** dans le
  screenshot → `--dump-dom` + grep classes / `display:none` / `aria-*`. Scroll = injecter
  `window.scrollTo` + dispatch d'events `scroll` dans un mini-harnais, puis dump-dom.
- À chaque lot : 0 erreur console, 0 hex hors commentaires, 0 référence CSS morte, comparaison
  visuelle section par section.

## 10. Journal des itérations (apprentissages clés)

- **Tokens brandbook au lieu de Sofitel** → alias déplacés sur `body.brand-sofitel` (§4.1).
- **Cartes carrousel compressées** → la largeur flex va sur l'**HÔTE** (`wd-room-card, wd-card`),
  pas sur l'article interne `.wd-room-card`.
- **Sticky-bar inventée** (fausse barre de recherche) → reproduire le réel, puis reconstruire
  d'après la maquette fournie (§6).
- **Composant inventé `wd-eco`** → supprimé. Règle : pas de faux master.
- **Lot « traite tous les points »** (~25 corrections) : nav header, labels booking, welcome
  (monogramme + adresse/tél), durable, réseaux noirs, footer, USD→€, a11y (onglets `aria-pressed`,
  FAQ `aria-expanded`/`role=region`, steppers étiquetés), perf (dimensions images, `.wd-section`,
  SVG factorisés, gap en token, CSS mort, Roboto retiré).
- **Passe QA adversariale** (workflow) → 5 défauts : sticky-bar fond blanc (`--tint`), `is-stuck` au
  chargement (race rAF), carte resto seule (840 px de vide → `.wd-track--single`), placeholder
  calendrier en faux-gras `<strong>`, rythme USP 24→32.
- **Pourquoi** (questions du designer) : labels booking en majuscules = `text-transform:uppercase`
  sur `.wd-bk-label` (retiré) ; CTA chambre pleine largeur = classe `wd-btn--block` (retirée).
- **Icônes TikTok/Spotify baveuses** → tracés simple-icons propres.
- **Green Key** → badge « Eco certified » du DS (§8).
- **Footer** refait d'après Figma (§7), pas la prod.
- **Moteur** : « Arrivée → Départ » → vraie date « 17/06/26 → 18/06/26 » (héro + panneau sticky).
- **Trait blanc** sous le bandeau nav immersif (`.wd-nav-band` border-bottom rgba blanc) → retiré.

## 11. Limites assumées

Prix « à partir de » plausibles (l'API prod charge les vrais en JS) ; date-picker = placeholder
« Calendrier à venir » (étape suivante) ; logos de marques du footer en texte (assets non fournis) ;
logo « All » approximé.

## 12. Pointeurs

- Créer un nouveau template de page → skill **welds-create-template**.
- Remplir un template avec un hôtel → skill **welds-fill-template**.
- Bibliothèque de composants → `components.html`. Template Hotel Homepage → `templates/`.

## 13. wd-calendar (date-picker 2 mois) — maquette Figma fichier « Untitled » node 33:25264

Sélection arrivée→départ, prix membre/nuit, « meilleur prix » vert (340 €), 5 états (chargement
skeleton ~1,2s, vide, partiel, complet 1 nuit, complet N nuits). Données prix juin/juillet 2026
codées en dur dans `components.js` (CAL_PRICES). Machine à états : VIDE/PARTIEL/COMPLET, invariant
checkOut > checkIn (clic sur date < arrivée = nouvelle arrivée ; range complet + clic = reset ;
reclic arrivée = désélection). Total = somme des nuits arrivée→veille du départ ; public = round(×1,13).
Hover preview beige en PARTIEL. Palette scopée **`--cal-*`** (hex exacts de la spec : beige #f3ede4,
vert #2f7a52/#e8f1ec, etc.) + tokens marque (`--ink-2`, `--accent`). Police grotesque neutre
(system-ui) par spec. Intégré comme **champ « dates » du booking** (`.wd-bk-field--cal` →
`<wd-calendar>`), donc présent dans le proto ET le template (composant partagé, pas de mirror HTML).

**⚠ Alignement jours/semaine** : le calendrier place les dates sur leur **vrai jour de semaine 2026**
(1er juin = lundi, 1er juillet = mercredi — fait vérifié). Si la maquette montre un décalage d'une
colonne, c'est la maquette qui a l'erreur ; un date-picker réel doit être calendairement exact.

**Navigation mois** : fenêtre de 2 mois pilotée par un état `view` + chevrons (délégation d'événements pour reconstruire la grille). Bornes : juin 2026 (min) → déc. 2027 (mois gauche max, ~18 mois). Prix générés par jour de semaine (CAL_BASE) au-delà de juin/juillet 2026 (qui gardent les prix EXACTS de la spec). La sélection persiste à travers la navigation.

**Reste possible** : câbler le champ dates du panneau sticky (`wd-quick-access`) sur le calendrier
(laissé en affichage statique pour l'instant).

---

## Extension — Template « Brand Homepage » (MGallery, 2026-06-11)

Premier **nouveau type de page** produit via `welds-create-template` : la **homepage de marque**
(`templates/brand-homepage.html`, exemple rempli `mgallery-brand-homepage.html`). Source de vérité
Figma `🚧 MGALLERY - [Discovery]`, node **6288:29302**. Construite en **EN / USD** (iso maquette) ;
footer en FR (i18n = chantier séparé).

**2 nouveaux masters partagés** (vrais composants DS MGallery) ajoutés à `core/components/components.js` :
- `wd-loyalty` (← `mga.loyalty-info`) : bandeau fidélité ALL, fond `var(--color-accent)`, logos
  « All × monogramme », bénéfices à coches, boutons plein + outline clair. Attributs : `title`,
  `benefits`, `cta`, `link`.
- `wd-newsletter` (← `mga.social-media`) : titre + image full-bleed + carte blanche (champ email).
  Attributs : `heading`, `title`, `text`, `image`, `placeholder`, `cta`.

**Réutilisé sans fork** (principe multi-marque, voir SKILL `welds-create-template`) :
- `wd-header` **étendu** par 3 attributs optionnels (`lang`, `currency`, `account`) → barre utilitaire
  de marque. Sofitel ne les passe pas → header inchangé.
- Sections sombres alternées via l'utilitaire `.wd-on-dark` (texte/onglets/pager en blanc, onglets de
  collection en **pilules**). Les Frames Figma (`offers`, « become a collector ») = **layout inline**.
- Logo MGallery = emblème **M + GALLERY** exporté du Figma, recoloré `currentColor`, branché par
  `window.WD_BRAND`. Proportions compactes → 4 règles CSS scopées `body.brand-mgallery`.

**Limites assumées** : polices The Seasons / MGallery Cera sous licence absentes → fallback système ;
footer FR ; titres de cartes en capitales sans (kit) vs serif Title Case (maquette) ; bandeau fidélité
`var(--color-accent)` `#97544C` vs `#A36159` Figma (léger écart) ; images = placeholders Scene7.
Tout en tokens (0 hex ajouté) → re-skinnable pour toute marque. Preset dans `brand-presets.md`.

## Extension — Template « Room Details » (Sofitel, 2026-06-12)

2e type de page via `welds-create-template` : **détail chambre/suite** (`templates/sofitel/room-details.html`,
exemple rempli `pages/sofitel/room-details-mexico-city.html`). Source de vérité Figma `🚧 SOFITEL [Discovery]`,
node **5012:9295** (1340×6308). Contenu **EN** (maquette + prod en anglais), chrome FR conservé (i18n séparé).
Prod : `sofitel.accor.com/en/hotels/9615/KGBLVZ.room.html`.

**Mapping sections → composants** : header immersif + hero + booking + nav d'ancres (`wd-header`/`wd-hero`/
`wd-booking`/`wd-quick-access`) · welcome-room (`wd-welcome`) · slideshow (`wd-slideshow`) · 2 highlights
(`wd-highlight`) · **Amenities** (`wd-amenities`, **nouveau master**) · More rooms (`wd-rooms`) · footer.

**1 nouveau master partagé** (vrai composant DS `so.list-grid`) ajouté à `core/components/components.js` :
- `wd-amenities` : grille d'équipements 3 colonnes (colGap 24, rowGap 48 = valeurs Figma). Consomme des
  enfants `<wd-amenity title items="a|b|c" more>` ; chaque cellule = titre + checklist (`ICON.check`) +
  lien « more » optionnel. `wd-amenity` = data-holder (ne rend rien seul).

**Étendu sans fork** (principe multi-marque — attributs/variantes additifs, Sofitel homepage inchangée) :
- `wd-welcome` : attribut **`facts`** optionnel (rangée icône + label : `capacity/bed/surface/view/cot/balcony`)
  pour le welcome-room ; lien « Read more » avec **chevron** (`.wd-welcome__link`, sans soulignement).
- `wd-highlight` : booléen **`image-left`** (inverse image/texte ; défaut = image à droite) + attribut
  **`features`** optionnel (liste à puces à check dorés entre texte et CTA, ex. `features="Sea view|Balcony"`).
- Carrousel (`wd-rooms`/`wd-collection`) : attribut **`seeall`** = lien « voir tout » aligné à droite du
  titre (`.wd-sh--split`) + attribut **`chips`** = pilules de filtre secondaires sous les onglets
  (`.wd-chips`, toggle visuel). Sans ces attributs → heading/track d'origine **byte-identiques** (zéro régression).

**Frames inline** (pas des composants DS) : wrappers des sections highlights / amenities / more-rooms.

**Limites assumées** : hero = **image fixe** (kit) et non le slideshow animé + bouton Butler de la maquette ;
éléments cachés de la slide non construits (bandeau « Celebrating Sofitel », ancre haute) ; chrome FR
(moteur de résa, sticky « Voir les tarifs », carte « Choisir cette chambre », pager) = i18n séparé.
Régression vérifiée : homepage NY + MGallery rendues, 0 erreur, welcome/highlight/rooms inchangés.
0 hex ajouté (icônes facts/amenities en `currentColor` → tokens). Test de remplissage (Sofitel London) OK.

**Escouade QA ciblée** (3 agents, à la demande du designer) : comportements JS **7/7 PASS** (onglets, pager,
choose-room→sticky, scroll sticky, moteur résa, slideshow, 0 erreur console) ; tokens/0-hex/refs **RAS**.
Fidélité Figma : a rattrapé **2 éléments VISIBLES omis** (j'avais jugé sur les `.characters` = piège règle 1,
sens « oubli ») → liste features du highlight Room Layout (Sea view/Balcony) + pilules de filtre des
more-rooms (Family/Club Millésime/Accessible), + chevron « Read more ». Tous corrigés et re-vérifiés sur la
capture rendue. Leçon : sur un gros lot / cap luxe, l'escouade vaut son coût ; ne pas la sauter en silence.
