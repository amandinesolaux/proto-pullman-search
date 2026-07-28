---
name: welds-create-template
description: Crée un NOUVEAU template de page welDS (Accor/ALL) en reverse-engineering une maquette Figma + une URL de prod, assemblé en Web Components <wd-*>. Déclencheurs — "crée un template welDS", "nouveau template de page welDS", "template room details welDS", "template dining hub welDS", "reconstruis cette page Figma en welDS", "page hôtel iso à partir du Figma", "template pixel-perfect welDS", "intègre cette maquette Figma en HTML welDS". À NE PAS confondre avec welds-fill-template (qui REMPLIT un template existant avec le contenu d'un hôtel). Source de vérité = Figma. Vérification = rendu headless comparé à la capture Figma.
---

# welds-create-template — Créer un template de page welDS

## But

Construire un **nouveau type de page** (hotel homepage, room details, dining hub, offers, etc.)
en HTML/CSS/JS statique, **iso à une maquette Figma**, en assemblant les composants masters
`<wd-*>` welDS. Le livrable final est un **template PAR MARQUE** :
`templates/<marque>/<type-de-page>.html` (marque **figée** : `body.brand-<marque>` + couche
`brands/<marque>/`, jetons de **contenu** `{{...}}` + lorem), réutilisable ensuite via la skill
**welds-fill-template**.

**PRINCIPE — un template = UNE marque + UN type de page (pas générique).** Ex. « hotel homepage
**Sofitel** » sert à générer d'AUTRES hôtels Sofitel en injectant le contenu extrait des URL de prod
(nom, adresse, chambres, photos…). La **marque est figée** dans le template ; seuls les **jetons de
contenu** varient d'une instance à l'autre. Les **composants** restent agnostiques (core, partagés) ;
c'est l'ASSEMBLAGE qui est propre à la marque. Templates rangés `templates/<marque>/`, **hors plugin**
(le plugin ne distribue que l'agnostique ; chaque designer crée les templates de sa marque).

Ce skill est l'inverse du skill léger `welds` (prototypage 12 atomes sans Figma) : ici on fait
de l'**intégration pixel-perfect depuis Figma**, avec le MCP `figma-console` et une boucle de
vérification visuelle.

## Projet de référence (kit réutilisable)

**Localiser le projet par son CONTENU, pas par son nom de dossier** (il peut s'appeler
`Template-1.0`, `accor-hotel-templates`, n'importe quoi). Le repérer comme le dossier qui contient
à la fois `core/components/components.js` ET `core/tokens/brands.css`
(ex. `find ~ -name brands.css -path '*/tokens/*'`). Lire ces fichiers AVANT de commencer :
- `core/components/components.js` — tous les masters `<wd-*>` déjà codés (base `WdEl`, objet `ICON`).
- `core/styles/base.css` — styles + alias de tokens sur `body.brand-*`.
- `core/tokens/base.css` + `core/tokens/brands.css` — tokens welDS, valeurs par marque.
- `templates/sofitel/hotel-homepage.html` — exemple de template fini (structure + jetons).
- `scripts/` — outillage : `render.sh`, `dump-state.sh`, `probe-img.sh`, `figma-capture.md` (voir
  `scripts/README.md`).
- `docs/DESIGN.md` — apprentissages, pièges, mapping composants ↔ Figma, ids de nodes utiles.
- `docs/BRANDING.md` — adapter le kit à une autre marque. `docs/brand-presets.md` — réglages de marque validés.
  `docs/LEARNINGS.md` — journal d'apprentissage.

### Auto-amélioration (skill non centralisé, chacun sa copie)
Au **début** : lire `docs/LEARNINGS.md` + `docs/brand-presets.md`. À la **fin** : journaliser tout point
non-évident dans `docs/LEARNINGS.md`, sauver un preset de marque validé dans `docs/brand-presets.md`, et si un
apprentissage est assez général pour devenir une règle/DoD durable, le **PROPOSER** au designer puis
n'éditer ce `SKILL.md` qu'**après son OK** (jamais de réécriture silencieuse). Même mécanisme détaillé
dans la skill `welds-fill-template`.

### Base commune PARTAGÉE (principe central)

**Tous les templates partagent UN SEUL `core/components/components.js` + `core/styles/base.css` + `core/tokens/`.**
Un nouveau template (room details, dining hub…) **réutilise** ces fichiers communs et n'en fait
JAMAIS une copie. Conséquences :
- Un composant déjà codé (`wd-header`, `wd-footer`, `wd-card`, `wd-booking`…) se réutilise tel quel,
  partagé entre toutes les pages.
- Un composant manquant s'**ajoute au même `components.js` commun** (et son style à `core/styles/base.css`),
  pour que tous les templates en bénéficient. On n'écrit pas de composants par page.
- Chaque template HTML ne contient QUE la structure (assemblage de `<wd-*>` + layout inline) ; il
  charge les fichiers communs en `../../core/components/`, `../../core/styles/`, `../../core/tokens/` + sa couche `brands/<marque>/`.
- Avant de coder un nouveau master, vérifier qu'il n'existe pas déjà (et factoriser si deux pages
  ont besoin de la même chose).

**Préfixe `wd-` = AGNOSTIQUE de la marque** (welDS), pas `so-` (= sofitel dans le Figma). La marque
est portée par `body.brand-<marque>` + les tokens, jamais par le nom du composant. Ne JAMAIS
réintroduire un préfixe de marque sur un composant. (Les masters Figma, eux, sont nommés `so.*` côté
Sofitel — c'est leur nom dans le DS, pas le nôtre.)

**Structure du kit (base agnostique + couches par marque) :**
- `core/` = BASE AGNOSTIQUE partagée, **distribuée dans le plugin** (composants, base.css, tokens,
  storybook neutre, `core/assets/` = fallbacks OSS Playfair/Poppins). **Aucune marque dedans.**
- `brands/<marque>/` = couche de marque (**HORS plugin**) : `<marque>.css` (vraies `@font-face` +
  ajustements mesurés), `<marque>.js` (logo `window.WD_BRAND`), `fonts/` (polices **sous licence**, locales).
- `templates/<marque>/` = templates **PAR MARQUE** (**HORS plugin**), marque figée + jetons de contenu.
- `pages/<marque>/` = pages remplies. Une page (et un template) charge, dans l'ordre : `../../core/tokens/*`,
  `../../core/styles/base.css`, `../../brands/<marque>/<marque>.css`, puis (fin de body)
  `../../brands/<marque>/<marque>.js`, puis `../../core/components/components.js`.
  (`templates/<marque>/` et `pages/<marque>/` sont à la même profondeur → remplir = copier sans réécrire les chemins.)

**Ce que le re-skin par tokens couvre (et PAS) — voir `docs/BRANDING.md` :** les alias de `base.css`
sont sur `body[class*="brand-"]`, donc **COULEURS** et **NOMS de police** se re-skinnent automatiquement
pour toute marque de `core/tokens/brands.css`. Restent 2 actions par marque, **dans sa couche** : (1)
**polices** : déposer les `.woff2` **sous licence dans `brands/<marque>/fonts/`** + les `@font-face` dans
`brands/<marque>/<marque>.css` (sans eux → fallback OSS de la base, PAS une erreur ; **le dire au
designer**) ; (2) **logo** : `window.WD_BRAND = {name, wordmark, mono}` dans `brands/<marque>/<marque>.js`
(SVG en `currentColor`, mono `viewBox 0 0 44 44`). **Sans couche de marque → logo NEUTRE placeholder**
(plus de défaut Sofitel). Pour la brique elle-même (créer/maintenir un master), utiliser la skill
**welds-component**. Limites : graisses de titre et langue (FR) ne se re-skinnent pas (chantiers séparés).

**PRINCIPE MULTI-MARQUE — un composant qui diffère d'une marque à l'autre.** On **enrichit toujours la
base partagée ; jamais de copie par marque** (pas de `so-card` + `mga-card` ; `wd-` est agnostique
exprès). Choisir selon le TYPE de différence :
1. **Couleur / police / espacement / radius** → rien à coder, les tokens (`body.brand-*`) s'en chargent.
2. **Élément en plus ou en moins** (barre utilitaire, bouton, logo overlay) → **attribut optionnel**
   sur la base, rendu seulement si présent. L'autre marque ne le passe pas → inchangée pour elle.
3. **Vraie variante de layout** (même rôle, structure différente) → attribut `variant="…"` dans le
   **même** composant (une branche), pas un fork.
4. **Composant propre à une seule marque** (vrai master DS, ex. bandeau fidélité) → **nouveau master
   `wd-*`** partagé. Une **Frame** Figma (pas un composant) reste en **inline** (règle 2).
Pourquoi : base unique = un fix/amélioration profite à toutes les marques et tous les templates d'un
coup. Un « traitement de section » réutilisable (ex. `.wd-on-dark`) est un ajout piloté par les tokens, pas un hack.

## Règles non-négociables

1. **Figma = source de vérité — mais le VISIBLE prime.** Capturer la maquette et comparer le rendu, à
   chaque section. La prod (URL) sert pour les **comportements** + le **contenu** de secours, pas pour le
   visuel. **PIÈGE MAJEUR** : `figma_execute` lit des nœuds de texte **CACHÉS** ou **d'autres slides**
   (ex. un titre « MGallery Universe », un « Secondary section title » qui n'apparaissent PAS sur la slide
   rendue). → **Toujours valider la fidélité sur la CAPTURE rendue, jamais sur les `.characters` seuls.
   Ne JAMAIS ajouter un élément que la maquette VISIBLE ne montre pas.** (Erreur commise 2× sur MGallery.)
   **Le piège marche AUSSI à l'envers (sens « OUBLI »)** : ne jamais conclure « cet élément est caché /
   placeholder, je le saute » sur la seule foi de `figma_execute` → tu peux **omettre un élément pourtant
   VISIBLE**. Avant d'écarter quoi que ce soit, **re-capturer la section** et regarder. (Erreur commise sur
   Sofitel room-details : liste features du highlight + pilules de filtre des more-rooms, visibles, omises ;
   rattrapées par l'escouade QA.)
2. **Ne JAMAIS inventer de composant.** Chaque `<wd-*>` doit correspondre à un vrai master du DS
   Figma. Une section qui est une Frame (pas un composant) se fait en **layout inline** dans la
   page, pas via un faux master. (wd-eco / wd-editorial / wd-nearby-card ont été inventés puis
   supprimés — ne pas refaire.)
3. **Zéro hex hardcodé.** Couleurs via `var(--color-*)` (ou les alias `--ink`, `--accent`,
   `--tint`… définis sur `body.brand-*`). Exceptions assumées : couleurs d'un logo externe
   (réseaux sociaux, badge éco vert #117846) = contenu, pas thème.
4. **Tokens résolus sur l'élément qui porte la classe brand.** Définir les alias sur
   `body.brand-sofitel { ... }`, jamais sur `:root` (sinon résolution avec les valeurs brandbook).
   Piège jumeau : côté Sofitel `--color-surface-container-low` ET `-hi` valent **#FFFFFF** ; seul
   `-mid` vaut le crème #F7F6F3. Un fond « teinté » doit pointer sur `-mid`. **Toujours vérifier la
   valeur résolue** (getComputedStyle headless) quand un fond paraît absent.
5. **Vraies polices.** Romie (serif, titres) + GT America LV (sans), fichiers `/assets`, branchées
   en `@font-face`. `--font-serif/-sans/-meta` pointent sur `--font-family-display/-body` (par marque)
   avec Sofitel en fallback : ne pas re-figer Romie/GT en dur (casserait le re-skin par marque).
6. **Pas de dépendance externe.** Pas de Google Fonts ni CDN JS. Tout statique, ouvrable direct.
7. **Accessibilité — SELON L'ENJEU (pas par défaut sur un proto).** Pour un proto de test jetable,
   l'a11y profonde n'est PAS prioritaire (coût élevé, valeur faible). À faire SEULEMENT si : les
   testeurs utilisent une techno d'assistance, OU le proto part vers la prod. Le cas échéant :
   onglets-filtres `aria-pressed`, accordéons `aria-expanded`/`aria-controls`/`role=region`,
   boutons-icônes `aria-label`, SVG décoratifs `aria-hidden focusable=false`, `:focus-visible`,
   `aria-*` synchronisés avec l'état JS. (C'est le périmètre de l'agent « Ada », à ne déployer que dans ces cas.)
8. **Responsive.** Selon la réponse Discovery (Q7) : si **responsive demandé**, construire et vérifier
   **iso aux maquettes tablet (768) ET mobile (375)** fournies (chaque breakpoint = sa propre source de
   vérité). Si **desktop seul**, vérifier quand même qu'il n'y a **pas de débordement horizontal** en
   mobile (~390). Un full-bleed `100vw` exige `overflow-x: clip` sur `body`.

## Procédure

### Méthode : PLANIFIER puis EXÉCUTER EN AUTONOMIE
Créer une page = un gros lot. Pour être efficace : **d'abord un plan court présenté SEUL** (Discovery +
capture Figma + mapping sections → masters + nouveaux composants/inline + limites + **proposition
d'escouade QA** : agents, conso estimée, bénéfices — voir étape 4), **soumis au designer AVANT de toucher
au moindre fichier**. **Après validation, PROPOSER le mode auto** (auto-accept / shift+Tab) puis **exécuter
le build d'une traite, en autonomie** (capture → code → vérif headless → itère), sans re-confirmer chaque
étape. On ne s'arrête que pour un vrai point bloquant (asset introuvable, ambiguïté de contenu). Le plan
évite les allers-retours ; l'exécution autonome évite de hacher le travail. (Discovery ci-dessous = la
matière du plan.) Présenter le plan mélangé aux questions de Discovery = à éviter : un plan se voit SEUL.

**Checklist vivante (anti-oubli) :** dès le build lancé, **dérouler la Definition of Done en liste de
tâches** (TaskCreate) et la **cocher au fil de l'eau**. Ne JAMAIS dire « fini » tant que tous les items ne
sont pas cochés. La DoD est une PORTE à franchir, pas une liste à lire en diagonale (cf. oublis room-details).

### 0. Discovery (cadrer avant de coder)
Poser ces questions (passer les defaults si « fais au mieux ») :
1. **Nouveau template, ou remplir un existant ?** Si un template `templates/<marque>/<type>.html` existe
   déjà pour cette marque + ce type → on **REMPLIT** (skill `welds-fill-template`). Sinon → création.
2. **Type de page** ? Famille **Hotel** (hotel homepage, room details, dining hub…) ou **Brand**
   (homepage de marque). Le template sera **FIGÉ sur la marque**, pas générique (cf. principe ci-dessous).
3. **Quelle marque ?** → la **DEMANDER** (pas de défaut : un template = une marque + un type). → `body.brand-<marque>`.
4. **Les polices de la marque ?** → les **DEMANDER** : à déposer dans `brands/<marque>/fonts/` (noms exacts
   du `@font-face` de `brands/<marque>/<marque>.css`). Sans elles → fallback OSS (Playfair/Poppins), le **signaler**.
5. **Node(s) Figma** de la maquette ? = **SOURCE DE VÉRITÉ, obligatoire** (id ou « je l'ouvre dans Figma »).
6. **URL prod** ? → la **DEMANDER quand même**, en précisant qu'elle est **FACULTATIVE** et **pourquoi**
   (comportements interactifs + contenu de secours). Si la page n'existe pas en prod → on extrait tout du
   Figma. **Ne jamais l'EXIGER pour démarrer.**
7. **Responsive ?** Desktop seul, ou **tablet (768) + mobile (375)** ? → le **DEMANDER au début**.
   Si responsive → **demander les maquettes tablet ET mobile** (Figma) : on construit **iso à CHAQUE
   breakpoint** (pas une simple dérivation). Sinon → desktop seul. (Pour *dériver* le responsive SANS
   maquettes dédiées → skill `decline-responsive`.)
**NE PAS demander le niveau de fidélité** : on vise TOUJOURS le proto le plus robuste et pixel-perfect possible.
Langue / devise : défaut FR / € (cohérence sur toute la page).
Puis vérifier la connexion MCP : `figma_get_status({probe:true})` (fichier ouvert dans Figma
Desktop + plugin Desktop Bridge). Localiser le projet par son contenu (voir plus haut).

**Préconditions / BLOQUEURS à lever AVANT de promettre du pixel-perfect** (les nommer au designer) :
- **Pont Figma vivant** : le bridge WebSocket peut SAUTER en cours de session (MCP déconnecté) → plus
  de mesure ni d'extraction possible. Token REST Figma non configuré = le plugin est l'UNIQUE accès.
  Si le pont tombe → s'arrêter et demander de rouvrir le plugin, ne pas « deviner » la suite.
- **Source des images** : page prod ? → images/contenu de la prod. Proto sans prod ? → extraire le max
  du Figma (Scene7 IDs des fills, sinon export PNG/SVG). Sans ça, fidélité visuelle plafonnée.
- **Assets externes** : logos d'hôtels/marques posés sur des visuels, vidéos de hero (un proto statique
  ne reproduit pas le mouvement → still sombre), polices sous licence. Lister ce qui est hors d'atteinte.
- **Échelle** : le pixel-perfect se mesure à la **largeur exacte de la maquette** (souvent 1340), pas en
  miniature. Prévoir le temps/budget d'une boucle de diff par section (gros lot).

### 1. Capturer le Figma (source de vérité)
- `figma_capture_screenshot({nodeId, scale:2})` — capture le **runtime** du plugin (fiable).
- **Les gros frames (page entière) font timeout** sur export / `getNodeByIdAsync`. Capturer les
  **sous-nodes** : récupérer l'arbo avec `figma_execute` (walk shallow des children) puis capturer
  chaque section/composant par son id.
- Lire une valeur exacte (couleur, taille, texte) : `figma_execute` qui lit `fills` / `strokes` /
  `characters` / `fontSize` du node. (Le token REST n'est pas configuré → tout via le plugin.)
- `figma_execute` global (`figma.root.findAll`) sur tout le fichier = timeout. Scoper à une page
  (`getNodeByIdAsync(pageId)` puis `.findAll` sur la page) et wrapper en try/catch (certains
  nodes lèvent « Unknown node type »).

### 2. Mapper Figma → composants
- Pour chaque section de la maquette, trouver le master `<wd-*>` correspondant dans
  `core/components/components.js`. Masters existants (kit hotel homepage) :
  `wd-header` (nav immersive), `wd-quick-access` (sticky-bar noire), `wd-hero`, `wd-booking`,
  `wd-welcome`, `wd-slideshow`, `wd-rooms`/`wd-collection` (carrousels), `wd-room-card`/`wd-card`,
  `wd-section-heading`, `wd-highlight`, `wd-location`, `wd-faq`, `wd-footer`, `wd-mono`,
  `wd-social`.
- Si la maquette a un composant DS **non encore codé** → **DÉLÉGUER à la skill `welds-component` (mode
  `create`)** : c'est elle qui code le master agnostique (base `WdEl`/`Carousel`, `ICON`, 0 hex), l'ajoute
  au storybook + `docs/DESIGN.md`, et lance l'`audit`. Une seule logique de composant, pas de duplication.
  - Rappel base : composant à **attributs seuls** → `extends WdEl` ; composant qui **consomme ses enfants**
    (carrousel/galerie/accordéon) → `extends HTMLElement`, lire `[...this.children]` AVANT `innerHTML`
    (modèle `class Carousel`).
  - Si c'est une simple Frame (pas un composant DS) → **inline** dans la page, pas de faux master.
- **Contrat onglets ↔ catégories** (carrousels `wd-rooms`/`wd-collection`) : les libellés de
  `tabs="A|B|C"` sont mappés en mots-clés par `catOf()` (regex FR figé : voir tout/chambre/suite/
  accessible…) et croisés avec l'attribut `category="..."` des cartes. Une carte SANS `category`
  reste visible partout. Si tu ajoutes une catégorie → étendre `catOf()` ET vérifier que chaque
  onglet a ≥ 1 carte (un onglet sans carte affiche une section vide, invisible pour dump-state).

### 3. Construire la page
- Assembler les masters dans un HTML qui charge dans l'ordre : `core/tokens/base.css`,
  `core/tokens/brands.css`, `core/styles/base.css`, puis `core/components/components.js` en fin de body.
- `<body class="brand-sofitel">` (ou la marque voulue).
- Largeurs/rythmes welDS : conteneur `max-width:1340 / padding:0 64` (→ contenu 1212), sections
  `.wd-section` (padding 48 0). Carrousel : largeur de carte sur l'HÔTE (`wd-room-card, wd-card`),
  pas l'article interne.

### 4. Vérifier — DIMENSIONNER l'effort (les agents coûtent cher en tokens)
La vérif par équipe d'agents est le 1er poste de coût (≈ 70k-240k tokens par passe). Ne PAS lancer
l'escouade sur un détail.

**RÈGLE de dimensionnement par itération :**
- **1ère itération d'une NOUVELLE page** → **vérif COMPLÈTE** : TOUTES les vérifs nécessaires (tous les
  garde-fous de la section Qualité + escouade ciblée si gros lot). C'est le moment où on ne lésine pas.
- **Itérations SUIVANTES** (corrections) → **headless + diff CIBLÉ** sur ce qui a bougé, 0 agent par défaut.

Puis caler aussi sur l'enjeu du changement :
- **Petit changement** (1 tweak CSS, 1 libellé) → rendu headless + une mesure ciblée. **0 agent.**
- **Changement moyen** (1 composant, 1 section) → **1-2 agents** ciblés sur les angles concernés.
- **Gros lot iso Figma** (nouveau template, refonte) → **l'escouade** (3-5 agents : dimensions,
  couleurs, comportement, fidélité Figma — voir ci-dessous).
L'escouade est une boîte à outils : on déploie les bons spécialistes, pas tous à chaque fois.

**Sur un gros lot / cap luxe : PROPOSER l'escouade au designer DÈS LE PLAN (ne pas la sauter en décidant
seul).** Le coût est SON arbitrage, pas le tien. Dans le plan, présenter les agents avec **conso estimée +
bénéfice** (table ci-dessous, mesures réelles room-details), puis laisser trancher entre : escouade ciblée
(3) · escouade complète (4-5) · ou headless seul.

| Agent | Conso ~ | Bénéfice (ce qu'une vérif headless solo rate) |
|---|---|---|
| Fidélité Figma (visible) | ~25-65k | écarts typo/espacement/ratio **+ éléments VISIBLES omis** (piège règle 1) |
| Comportements JS | ~40-80k | onglets/sticky/carrousel/popover/moteur — **invisibles au screenshot** |
| Tokens / 0-hex / refs | ~40-90k | 0 hex, tokens résolus, 0 ref morte, cohérence storybook/template |
| (+ dimensions/typo mesurées) | ~40-80k | getComputedStyle vs Figma, échelle de marque |
| (+ robustesse contenu / a11y) | ~40-80k | texte long/court/vide, aria/focus si cap prod |

Justification : sur room-details, l'escouade ciblée (3 agents, ≈ 230k au total) a rattrapé 2 éléments
visibles omis qu'une vérif headless solo avait laissés passer — exactement le genre d'écart fatal en luxe.

Boucle headless (toujours, quel que soit le palier) — via les scripts du kit :
```sh
scripts/render.sh <page.html>            # PNG (flags GPU OK) ; BANDS=1 pour cropper par bandes
scripts/dump-state.sh <page.html>        # erreurs console + états sticky/aria/display + jetons restants
```
- **Comparer chaque section au screenshot Figma** (lire le PNG, cropper par bandes avec PIL si la
  page > 8000px). Itérer jusqu'à l'iso.
- **États JS** (filtres d'onglets, sticky au scroll, popovers) ne se reflètent PAS dans le
  screenshot → `dump-state.sh`. Pour le scroll, injecter `window.scrollTo` + dispatch d'events
  `scroll` dans un mini-harnais, puis dump-dom.
- **Si un élément ne peut pas être reproduit fidèlement** (logo officiel externe, etc.) → le DIRE,
  proposer des options (fournir l'asset, exporter du Figma, substitut DS). Ne pas livrer un
  à-peu-près en silence. (Secteur luxe : « on n'a pas le droit à l'erreur. »)

### 4bis. ISO PIXEL-PERFECT (quand le designer veut le rendu fidèle, pas « proche »)
**Leçon dure (MGallery) : réutiliser un master du kit + une image placeholder + juger sur une
miniature ⇒ « ça paraît loin ».** Le pixel-perfect ne s'obtient PAS à l'œil. Méthode obligatoire :

1. **MESURER d'abord, coder ensuite.** Pour CHAQUE section, extraire les specs Figma via `figma_execute`
   et les écrire dans une mini fiche avant de coder :
   - texte : `fontName` (famille+style), `fontSize`, `lineHeight`, `letterSpacing`, `fills` (couleur), casse.
   - bloc : `paddingTop/Right/Bottom/Left`, `itemSpacing` (gap), `width/height`, `cornerRadius`, fill de fond.
   - **Ne JAMAIS supposer l'échelle typo du kit** (Sofitel : t-serif-xl=48). Une autre marque a SA grille
     (ex. MGallery welcome titre=40, sous-titre=20). Appliquer les valeurs mesurées, pas celles du kit.
2. **IMAGES & CONTENU = depuis la source.** Si la page existe en prod → images/textes de la prod. **Si
   c'est un proto sans prod (maquette Figma seule) → extraire le MAXIMUM depuis Figma** : pour chaque
   `IMAGE` fill, lire l'`imageHash`/le nom → récupérer l'**ID Scene7** s'il est référencé, sinon
   `exportAsync` du node en PNG ; exporter les **logos/overlays** vectoriels en SVG. Jamais de placeholder
   d'une autre marque en livrable « iso » : c'est la 1re cause d'écart visuel.
3. **Masters SEULEMENT si 1:1.** Après mesure, si un `<wd-*>` correspond au pixel → l'utiliser. Sinon
   → construire la section **inline, mesurée** (le forçage CSS d'un master d'une autre marque plafonne
   la fidélité). Couleur de thème → token ; valeur marketing one-off (ex. bandeau `#A36159`) → exception
   documentée assumée (comme le vert éco), pas un token approchant.
4. **BOUCLE DE DIFF objective** (pas de jugement sur miniature) :
   ```sh
   scripts/render.sh page.html 1340           # rendu à la largeur de la maquette
   # crop de la section au même cadrage, puis :
   scripts/diff.sh figma_section.png render_section.png /tmp/cmp
   # -> % de différence + bandes les plus divergentes + côte-à-côte. Itérer jusqu'à diff ~0.
   ```
   Produire un **comparatif côte-à-côte** comme artefact partagé avec le designer.
5. **Limite réaliste** : « pixel-perfect » = visuellement indiscernable, pas byte-identique (l'antialiasing
   et le hinting diffèrent entre le moteur Figma et Chrome). Viser diff moyen < ~2-3% par section.

### 5. Extraire le gabarit (« gabariter » : page remplie → gabarit réutilisable)
**Terminologie — NE PAS confondre :**
- **tokens welDS** = variables CSS du design system (`--color-*`, `--font-*`, depuis `core/tokens/`). On n'y touche pas.
- **jetons de contenu** = les `{{...}}` mis à la place du contenu réel. C'est ce qu'on manipule ici.
- **Extraire le gabarit / gabariter** = remplacer le contenu réel d'une page validée par des jetons de
  contenu, pour pouvoir re-remplir avec un autre contenu via `welds-fill-template`.

À partir de la **page remplie validée** (`pages/<marque>/`), en faire une **copie gabarit** :
- Remplacer le contenu spécifique par des **jetons de contenu** `{{...}}` (nom, adresse, prix, IDs image…)
  et la prose par du lorem. **La marque reste FIGÉE** (on ne gabarite jamais la marque).
- **Noms des jetons = attributs des composants `<wd-*>` / propriétés du composant Figma, PAS inventés**
  (ex. `{{ROOM_1_NAME}}` car `wd-room-card` a l'attribut `name`). Groupés par section, répétitions numérotées.
- **Chemins inchangés** (`../../core/…`, `../../brands/<marque>/…`) : `templates/<marque>/` et
  `pages/<marque>/` sont à la **même profondeur** → remplir = copier sans réécrire les chemins.
- Sauver dans `templates/<marque>/<type>.html`, entrée dans `templates/README.md`.

**Page « one-off »** (ex. brand homepage = 1 seule par marque, jamais de 2e instance) → **NE PAS gabariter
par défaut** : présenter le point de vue (« la page remplie suffit, un gabarit n'aurait pas d'usage ») et
**demander validation** au designer avant d'en créer un (ou non).

## Images
CDN Accor Scene7 : `https://m.ahstatic.com/is/image/accorhotels/<ID>?wid=..&hei=..&fit=crop&qlt=85`.
Garder l'URL, ne mettre en jeton de contenu que l'`<ID>`. Valider avec `scripts/probe-img.sh <ID...>` (HTTP, taille,
md5 : flag « petit » = placeholder, « doublon » = même photo à deux endroits).

## Qualité — garde-fous (en plus de la boucle headless)
La construction est **itérative par section** (mesurer → coder → diff → section suivante), PAS un
waterfall « tout mesurer puis tout construire ». Pendant et après :
- **Robustesse au contenu — PENDANT la construction (en arrière-plan).** Chaque composant doit tenir
  avec du texte **long / court / champ vide / autre langue**. Y penser en codant chaque section, pas après.
- **Comportements interactifs testés.** Le screenshot ne capture pas les états JS : déclencher
  onglets / sticky au scroll / carrousel / popover (scroll + clic dans un harnais) et vérifier via `dump-state.sh`.
- **Images validées.** `scripts/probe-img.sh <ID…>` (poids, doublons, placeholders) + `width`/`height`
  sur chaque `<img>` pour éviter le décalage de mise en page (CLS).
- **Régression cross-page si un master est créé/modifié.** Un `<wd-*>` est PARTAGÉ : lister ses
  consommateurs (`grep -rl "<wd-X" pages/ templates/<marque>/ core/components.html`), les rendre AVANT/APRÈS,
  `diff.sh` → **~0 % ailleurs** que le changement voulu. (Détaillé dans `welds-component`, mode update.)
- **Test de REMPLISSAGE — APRÈS construction (clé de la robustesse).** Un template n'est valide que s'il
  est **réutilisable** : le remplir une fois avec un AUTRE contenu (autre hôtel) via `welds-fill-template`,
  et vérifier qu'il tient (pas de débordement, layout intact, 0 jeton oublié). Un template qui ne marche
  qu'avec son contenu d'origine n'est pas un template.
  - **Page « one-off »** (ex. brand homepage = 1 seule par marque, pas d'autre instance) → tester la
    robustesse avec du **contenu factice long / court / champ vide**, pas une 2e instance.
- **A11y — SUR DEMANDE** (testeurs assistive-tech ou cap prod) : alt, aria sur l'interactif, focus
  visible, contraste. Sinon, le **NOTER** comme hors périmètre, pas le zapper en silence.

## Auto-évaluation → amélioration (boucle obligatoire avant de livrer)
Ne PAS s'auto-féliciter. Avant de dire « fini », s'évaluer **honnêtement**, puis corriger, puis re-évaluer.
1. **Comparer au VISIBLE, section par section.** Capture maquette (rendue) vs rendu, côte à côte. PAS les
   nœuds de texte cachés (voir règle 1). Repérer ce qui diffère vraiment.
2. **Objectiver, pas juger à l'œil.** Pour chaque écart : **mesurer la valeur Figma** (taille, couleur,
   espacement, format) et **vérifier qu'elle est appliquée** (getComputedStyle headless). « Ça paraît bon »
   ne suffit pas — c'est l'erreur classique (cf. `docs/LEARNINGS.md`).
3. **Noter honnêtement par section** (ex. /10) + lister les écarts restants. **Ne pas sur-vendre
   « pixel-perfect ».** Distinguer ce qui est iso de ce qui est « proche » ou « limite assumée » (assets
   externes : logos, vidéo…).
4. **Améliorer** : corriger les écarts mesurés, re-rendre, re-évaluer. **Boucler** jusqu'au seuil
   (< ~2-3 % / iso visuel), ou jusqu'à ne plus avoir que des limites assumées explicitées.
5. **Reconnaître ses erreurs** : si une section a régressé ou qu'on a ajouté du non-visible, le DIRE et
   revenir en arrière (ex. hero MGallery sur-construit → retour à la slide visible).
Cette boucle est le cœur du skill : un proto luxe « n'a pas le droit à l'erreur » se gagne en s'auto-
critiquant, pas en se déclarant fini.

## Definition of Done (à cocher AVANT de livrer)
> **La dérouler en checklist de tâches vivante (TaskCreate) dès le build, et cocher au fil de l'eau.**
> C'est une PORTE : on ne livre pas tant qu'un item n'est pas coché ou explicitement marqué « hors périmètre ».
- [ ] **Auto-évaluation honnête** faite (note par section, écarts listés, rien de sur-vendu, aucun
      élément non-visible ajouté).
- [ ] Chaque section comparée au **screenshot Figma** correspondant (pas à une description).
- [ ] **Si pixel-perfect demandé** : specs mesurées appliquées (pas l'échelle du kit) ; images/contenu
      extraits de la source (Figma si proto) ; `scripts/diff.sh` < ~2-3% par section ; comparatif
      côte-à-côte fourni au designer. Aucun placeholder d'une autre marque dans un livrable « iso ».
- [ ] `scripts/dump-state.sh` : **0 erreur console**, états JS corrects.
- [ ] **0 hex** hors commentaires & hors exception éco
      (`grep -nE '#[0-9a-fA-F]{3,6}' core/styles/base.css | grep -vE '/\*|117846'`). Seul `#117846`
      (badge éco) est toléré ; tout autre résultat = à corriger.
- [ ] **0 référence CSS/JS morte** (sélecteur ou classe inutilisé après modif).
- [ ] **A11y** (CONDITIONNEL — seulement si testeurs assistive-tech ou cap prod, règle 7) : aria-* +
      focus-visible. Pour un proto de test classique, item ignoré (ne pas brûler des tokens dessus).
- [ ] **Responsive** : si demandé en Discovery → iso aux maquettes tablet (768) + mobile (375) ; sinon
      desktop + vérif « pas de scroll horizontal » en mobile (règle 8).
- [ ] **Tokens** résolus aux valeurs de marque attendues (getComputedStyle si doute — piège `--tint`).
- [ ] Gabarit extrait dans `templates/<marque>/` (jetons de contenu = attributs des composants), entrée à `templates/README.md`, `docs/DESIGN.md` mis à
      jour si un master a été ajouté (+ `components.html`).
- [ ] **Multi-marque** (voir `docs/BRANDING.md`) : aucun logo/police Sofitel en dur dans un nouveau master
      (logo via `window.WD_BRAND`/attribut + `|| ICON.*` ; police via `--font-serif/-sans/-meta`).
- [ ] Limites assumées **explicitées** (ce qui n'a pas pu être reproduit fidèlement).
- [ ] **Test de remplissage** réussi : template rempli une fois avec un AUTRE contenu/marque → layout
      intact, pas de débordement, **0 jeton oublié** (`dump-state.sh`).
- [ ] **Robustesse contenu** : tient avec texte long / court / champ vide (vérifié pendant la construction).
- [ ] **Comportements interactifs** déclenchés et vérifiés (onglets / sticky / carrousel / popover).
- [ ] **Images** validées (`probe-img.sh`) + `width`/`height` posés (pas de CLS).
- [ ] **Si un master a été créé/modifié** : rayon d'impact vérifié (consommateurs rendus, `diff.sh` ~0 % ailleurs).

## Rapport final
Court : type de page livré, nodes Figma utilisés, captures comparées, limites assumées, prochaines
pages possibles. Mentionner que `welds-fill-template` sert à le remplir.


## Mode PLUGIN (kit embarqué)
Quand ce skill tourne depuis le plugin installé, le kit agnostique est embarqué dans `${CLAUDE_PLUGIN_ROOT}/core` (+ `${CLAUDE_PLUGIN_ROOT}/scripts`, `/docs`). Au 1er usage dans un projet vide : **scaffolder** = copier `${CLAUDE_PLUGIN_ROOT}/core` → `./core` et `${CLAUDE_PLUGIN_ROOT}/scripts` → `./scripts`. Les couches `brands/<marque>/`, templates `templates/<marque>/` et pages `pages/<marque>/` sont créés par le designer. **Polices sous licence à déposer dans `brands/<marque>/fonts/`** (sinon fallback OSS).
