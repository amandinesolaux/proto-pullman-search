---
name: welds-fill-template
description: REMPLIT un template welDS existant (ex. templates/sofitel/hotel-homepage.html) avec le contenu réel d'un hôtel — remplace les jetons {{...}} et le lorem ipsum par le vrai nom, adresse, chambres, prix, photos, textes. Déclencheurs — "remplis le template avec l'hôtel X", "alimente le template welDS", "génère la page de l'hôtel X à partir du template", "instancie le template hotel homepage pour <hôtel>", "mets le contenu de <hôtel> dans le template". À NE PAS confondre avec welds-create-template (qui CRÉE un nouveau type de page). Contenu = URL prod (texte + IDs image Scene7) + Figma si besoin.
---

# welds-fill-template — Remplir un template welDS

## But

Prendre un **template existant** (`templates/<type>.html`, fait de composants `<wd-*>` avec des
jetons `{{...}}` et du lorem ipsum) et le **remplir avec le contenu réel d'un hôtel** pour produire
une page finie. On ne touche PAS à la structure ni aux composants — uniquement le contenu.

## Projet de référence

**Localiser le projet par son CONTENU, pas son nom de dossier** : le dossier qui contient
`core/components/components.js` ET `core/tokens/brands.css` (`find ~ -name brands.css -path '*/tokens/*'`).
Il peut s'appeler `Template-1.0`, `accor-hotel-templates`, etc.
- `templates/<marque>/` — les templates disponibles (voir `templates/README.md`).
- `pages/sofitel/hotel-homepage-new-york.html` — exemple d'un template **déjà rempli** (Sofitel New York) : modèle de ce à quoi
  doit ressembler le résultat.
- `scripts/` — outillage : `render.sh`, `dump-state.sh`, `probe-img.sh` (voir `scripts/README.md`).
- `docs/DESIGN.md` — pièges, conventions, ids Scene7.
- `docs/BRANDING.md` — adapter le kit à une autre marque (3 étapes). `docs/brand-presets.md` — réglages de
  marque déjà validés (réutiliser). `docs/LEARNINGS.md` — journal d'apprentissage du kit.

## Accompagnement (autres marques) & auto-amélioration

Cette skill n'est PAS centralisée : chaque designer a sa copie et l'adapte. Deux comportements à tenir
**à chaque usage**, pour accompagner les autres marques et faire grossir le kit avec les besoins réels.

### Accompagnement marque (pointeurs légers, pas un wizard)
Au moment de la marque (Discovery point 3), si la marque **n'est pas Sofitel** :
1. Lire `docs/brand-presets.md` : si la marque y a déjà un preset **validé**, le réutiliser (polices, logo
   `WD_BRAND`, devise, quirks) — ne rien re-demander.
2. Sinon renvoyer au `docs/BRANDING.md` et faire 3 contrôles automatiques, puis **signaler ce qui manque**
   (sans dérouler un pas-à-pas) :
   - la classe `brand-<marque>` existe-t-elle dans `core/tokens/brands.css` ?
   - les `.woff2` de la marque sont-ils dans `/assets` + `@font-face` dans `welds.css` ? (sinon police système)
   - `window.WD_BRAND` (logo/mono) est-il défini avant `components.js` ? (sinon logo Sofitel)
   Lister les manques comme limites assumées, ne pas bloquer.

### Boucle d'apprentissage (3 mécanismes)
- **Au début** : lire `docs/LEARNINGS.md` + `docs/brand-presets.md`, appliquer ce qui s'applique.
- **À la fin** :
  - **Journal** : si un quirk/piège/fix/besoin **non-évident** est apparu, ajouter UNE entrée datée
    dans `docs/LEARNINGS.md` (format dans le fichier). Inclure les besoins non couverts (backlog).
  - **Presets** : si un réglage de marque a été validé (polices OK, logo, devise), créer/MAJ son bloc
    dans `docs/brand-presets.md`.
  - **Auto-édition du SKILL.md (sur validation)** : si un apprentissage est assez **général** pour
    devenir une règle ou un item de DoD durable, le **PROPOSER** au designer (1-2 lignes), et n'éditer
    ce `SKILL.md` qu'**après son OK**. Jamais de réécriture silencieuse (éviter la dérive).

## Procédure

### 0. Discovery (5 questions)
1. **Quel template** ? (`templates/sofitel/hotel-homepage.html`, …)
2. **Quel hôtel** ? (nom + id Accor + URL prod)
3. **Marque** ? → `body.brand-<marque>`. **Valider** qu'elle existe dans `core/tokens/brands.css`
   (sofitel, fairmont, ibis, pullman, novotel, mgallery, movenpick, handwritten, raffles,
   swissotel, all, brandbook). **Couleurs ET noms de police** se re-skinnent tout seuls. Si la marque
   n'est pas Sofitel, 2 actions (voir `docs/BRANDING.md`) : (a) déposer ses `.woff2` dans `/assets` +
   `@font-face` (sinon police système) ; (b) définir `window.WD_BRAND = {name, wordmark, mono}` avant
   `components.js` pour le logo/monogramme (sinon ceux de Sofitel s'affichent).
4. **Langue / devise** ? (cohérence sur toute la page). ⚠ Le chrome d'UI est **codé en dur en
   français** dans components.js (« Réserver », « Rechercher », « À partir de », « Choisir cette
   chambre »…) : remplir les jetons ne suffit pas à changer de langue. Rester FR, ou signaler les
   libellés non surchargés comme limite assumée (certains sont surchargeables : `rate-label`,
   `conditions`, `cta`, `link` sur wd-room-card).
5. **Fichier de sortie** ? (défaut `pages/<marque>/<id>.html`)

### 1. Choisir le template + la cible
- Créer le dossier de sortie s'il manque (`mkdir -p hotels`) puis copier le template dedans.
  La profondeur `../` (CSS/JS) n'est valable que pour un dossier à **1 niveau** sous la racine
  (`hotels/`, `templates/<marque>/`) ; toute autre profondeur casse les liens.

### 2. Récupérer le contenu
- **URL prod** (`curl -sL` ou WebFetch) : nom exact, adresse, téléphone, e-mail, intitulés et
  descriptions des chambres, offres, restauration, FAQ. Le prix « à partir de » se charge en JS
  (souvent absent du HTML statique) → prix plausibles croissants par gamme si indisponibles.
- **Images** : extraire les IDs Scene7 du HTML prod (motifs `m.ahstatic.com/is/image/accorhotels/<ID>`,
  ex. `2509_acf_066`, `2511_acf_960`). Mapper chaque emplacement (héro, chambres, restaurant,
  fitness, offres, réunions) à une vraie photo cohérente.
- **Figma** (si dispo) : vérifier les valeurs exactes (devise, libellés) en source de vérité.

### 3. Remplir
- Remplacer chaque `{{JETON}}` par sa valeur, chaque bloc lorem ipsum par la vraie prose.
- Mettre la bonne classe brand (`brand-sofitel`, `brand-pullman`, …).
- Cohérence langue/devise sur toute la page (ex. tout en € ou tout en $, pas de mélange). Dates du
  moteur = vraies dates (ex. `17/06/26 → 18/06/26`), pas « Arrivée → Départ ».

### 4. Choisir/valider les images (piège)
- Scene7 renvoie parfois un placeholder en 200 pour un ID invalide. Valider avec le script :
  `scripts/probe-img.sh <ID...>` → flag « petit » (< 10 ko = placeholder) et « doublon » (même md5 =
  même photo à deux endroits, ex. chambre accessible == supérieure → à éviter).
- Les bonnes photos resto/bar/petit-déj sont sur les pages détail prod (`R001.restaurant.html`,
  `breakfast.html`), pas dans le shoot général des chambres.

### 5. Vérifier — DIMENSIONNER l'effort (les agents coûtent cher en tokens)
La vérif par équipe d'agents est le 1er poste de coût (≈ 70k-240k tokens par passe). Caler l'effort
sur l'enjeu, ne pas lancer l'escouade pour un détail :
- **Remplissage standard** → rendu headless + `dump-state.sh` (0 jeton/lorem, 0 erreur) + relecture
  visuelle des sections. **0 agent** la plupart du temps.
- **Doute sur un point** (onglets↔catégories, devise, image) → **1 agent** ciblé.
- **Gros lot / page sensible** → quelques agents (dimensions, contenu, comportement). L'a11y (agent
  « Ada ») seulement si testeurs assistive-tech ou cap vers la prod.
Toujours faire la boucle headless de base :
```sh
scripts/render.sh pages/<marque>/<id>.html       # PNG ; BANDS=1 pour relire par bandes
scripts/dump-state.sh pages/<marque>/<id>.html   # erreurs console + jetons {{}} & lorem restants
```

## Definition of Done (à cocher AVANT de livrer)
- [ ] `dump-state.sh` : **0 jeton `{{}}`** et **0 « lorem ipsum »** restants, **0 erreur console**.
- [ ] **Toutes les images chargent** (probe-img : aucun « petit », aucun doublon non voulu).
- [ ] **Devise homogène** sur toute la page (pas de mélange € / $).
- [ ] Bonne **classe brand** sur `<body>` (couleurs + noms de police OK). Si marque ≠ Sofitel : `@font-face`
      de la marque ajoutés ET `window.WD_BRAND` (logo/mono) défini, sinon le défaut Sofitel s'affiche (voir `docs/BRANDING.md`).
- [ ] **Onglets ↔ catégories** : chaque onglet d'un carrousel (`tabs=`) a ≥ 1 carte avec le bon
      `category=` (mots-clés : chambre/suite/accessible/voir tout). Relire CHAQUE onglet au rendu —
      un onglet vide est invisible pour dump-state.
- [ ] Chaque section relue visuellement (render + bandes).
- [ ] **Auto-amélioration** : `docs/LEARNINGS.md` complété si un point non-évident est apparu ; preset de
      la marque créé/MAJ dans `docs/brand-presets.md` ; règle générale durable proposée au designer (édition
      du SKILL.md seulement sur son OK).
- [ ] Limites assumées **explicitées** (prix fictifs, photo générique, langue/logo non surchargés…).

> Les **dates du moteur** (« 17/06/26 → 18/06/26 ») sont fixées dans `components.js` (placeholder de
> proto), PAS un jeton : ne pas les toucher en remplissant, elles ne dépendent pas de l'hôtel.

## Rapport final
Court : hôtel rempli, template utilisé, photos retenues (IDs), limites assumées (prix fictifs,
absence de photo spécifique…).


## Mode PLUGIN (kit embarqué)
Quand ce skill tourne depuis le plugin installé, le kit agnostique est embarqué dans `${CLAUDE_PLUGIN_ROOT}/core` (+ `${CLAUDE_PLUGIN_ROOT}/scripts`, `/docs`). Au 1er usage dans un projet vide : **scaffolder** = copier `${CLAUDE_PLUGIN_ROOT}/core` → `./core` et `${CLAUDE_PLUGIN_ROOT}/scripts` → `./scripts`. Les couches `brands/<marque>/`, templates `templates/<marque>/` et pages `pages/<marque>/` sont créés par le designer. **Polices sous licence à déposer dans `brands/<marque>/fonts/`** (sinon fallback OSS).
