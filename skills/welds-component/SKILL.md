---
name: welds-component
description: Crée OU maintient un composant du kit welDS (master <wd-*> agnostique). UN skill, plusieurs MODES passés en argument — create | variant | update | audit. Déclencheurs — "crée un composant welDS", "nouveau master wd-*", "ajoute un composant au kit", "ajoute une variante à wd-card", "mets à jour le composant wd-footer", "modifie un master partagé", "audite les composants welDS", "vérifie le 0 hex / refs mortes". À NE PAS confondre avec welds-create-template (qui assemble une PAGE) ni welds-fill-template (qui REMPLIT une page). Ici on travaille la BRIQUE, pas la page. Base agnostique = core/components/components.js + core/styles/base.css ; spécificités de marque = couches brands/<marque>/.
---

# welds-component — créer & maintenir les composants du kit welDS

## But
Travailler la **brique** (`<wd-*>`), pas la page. Le kit repose sur une **base agnostique partagée**
(`core/components/components.js` + `core/styles/base.css`, pilotée par les tokens) et des **couches par
marque** (`brands/<marque>/`). Ce skill garantit qu'on **enrichit la base sans jamais la dupliquer ni y
réintroduire une marque**.

**Modèle : chacun sa base.** Le plugin n'est qu'un **point de départ** ; une fois installé, le designer
fait évoluer SA propre copie de `core/` avec ses composants et ses pages. **Pas de propagation centrale**
→ le **rayon d'impact d'un changement est LOCAL** (les pages/templates du designer), jamais global. Donc
ni version ni changelog à gérer : on raisonne sur l'arbo locale.

Lire AVANT d'agir : `core/components/components.js` (base `WdEl` + `Carousel` + objet `ICON` NEUTRE),
`core/styles/base.css`, `core/tokens/base.css`+`brands.css`, `docs/DESIGN.md` + `docs/BRANDING.md` +
`docs/LEARNINGS.md`. Localiser le projet par son CONTENU (`core/components/components.js` +
`core/tokens/brands.css`), pas par le nom du dossier.

## Le MODE (argument)
- **`create`** — ajouter un nouveau master agnostique.
- **`variant`** — ajouter une variante (attribut `variant="…"`) ou une spécificité de marque.
- **`update`** — modifier un master partagé (avec contrôle du RAYON D'IMPACT).
- **`deprecate`** — retirer proprement un master devenu inutile (vérif 0 consommateur).
- **`audit`** — qualité : 0 hex, refs mortes, parité tokens, a11y conditionnelle.
Si aucun mode n'est donné, demander lequel (ou déduire de la demande).

## Outillage (à utiliser dans les modes)
- `scripts/catalog.sh` → régénère `docs/COMPONENTS.md` = **catalogue** (chaque `<wd-*>` + ses attributs).
  C'est l'**anti-doublon** (create), le **rayon d'impact** (update) et le **CONTRAT D'ATTRIBUTS** (les
  jetons de contenu d'un gabarit reprennent ces attributs).
- `scripts/snapshot.sh save|check core/components.html storybook` → **régression visuelle** : `save`
  fige une référence PNG du storybook, `check` la re-rend et diff au pixel. Sert à prouver qu'un
  changement n'a **rien cassé ailleurs** dans la bibliothèque.

## Règles non-négociables (toutes branches)
1. **Base AGNOSTIQUE.** Aucune marque dans `components.js`/`base.css` : pas de logo, police, label ou
   couleur d'une marque en dur. Le logo par défaut (`ICON.wordmark/mono`) est un PLACEHOLDER neutre ;
   la vraie marque vient de `window.WD_BRAND` + `brands/<marque>/`.
2. **Light DOM + tokens.** `extends WdEl` (attributs seuls) ou `extends HTMLElement`/`Carousel` (consomme
   ses enfants : lire `[...this.children]` AVANT d'écrire `innerHTML`). **0 hex** (couleurs via
   `var(--color-*)` / alias) — seule exception : couleur d'un asset externe (logo RS, éco #117846).
3. **Préfixe `wd-` AGNOSTIQUE.** Jamais de préfixe de marque (`so-`, `mga-`) sur un composant.
4. **Ne pas inventer.** Un master doit correspondre à un vrai master du DS Figma. Une Frame (pas un
   composant) = layout inline dans la page, pas un faux master.

## Principe « base + variants » — comment gérer une différence
1. **Couleur / police / espacement** → rien à coder : tokens (`tokens/brands.css`), automatique.
2. **Élément en plus/moins** → **attribut optionnel** sur le master (rendu si présent ; l'autre marque
   ne le passe pas → inchangée).
3. **Variante de layout** (même rôle, structure différente) → attribut **`variant="…"`** = une branche
   dans le MÊME master.
4. **Spécificité d'une seule marque** (logo, vraies polices, ajustement mesuré) → **couche
   `brands/<marque>/<marque>.css`** (ou `.js` pour le logo). Jamais un fork du composant.

---

## MODE create
0. **Contexte Figma REQUIS** : vérifier que c'est un **vrai master du DS Figma** (pas une Frame → sinon
   inline dans la page, règle « ne pas inventer »). Sans accès Figma, ne pas créer « au jugé ».
1. **Anti-doublon** : `scripts/catalog.sh` → consulter `docs/COMPONENTS.md` ; vérifier que le composant
   n'existe pas déjà (et qu'aucun master ne peut le couvrir par variante).
2. Le coder dans `core/components/components.js` (base `WdEl`/`Carousel`), styles dans
   `core/styles/base.css` (tokens, 0 hex). L'ajouter à la liste `display:block`.
3. L'ajouter au storybook NEUTRE `core/components.html` (en `brand-brandbook`) + une note d'usage.
4. `docs/DESIGN.md` : consigner le mapping (master ↔ node Figma) ; `docs/LEARNINGS.md` si quirk.
5. Vérifier : `scripts/dump-state.sh` (0 erreur), `scripts/render.sh` du storybook.
6. **Régénérer le catalogue** (`scripts/catalog.sh`) et **figer la nouvelle référence visuelle**
   (`scripts/snapshot.sh save core/components.html storybook`).
7. **Lancer le mode `audit`** — obligatoire après chaque ajout de composant.

## MODE variant
- Préférer **enrichir** : `variant="…"` (branche dans le master) si la structure diffère ; sinon couche
  de marque pour un simple ajustement de valeurs. Étendre le storybook avec la variante.
- Si un contrat onglets↔catégories est touché (carrousels), étendre `catOf()` ET vérifier qu'aucun
  onglet ne se retrouve sans carte.

## MODE update (⚠ le plus risqué : un master est PARTAGÉ)
1. **RAYON D'IMPACT d'abord** (catalogue + consommateurs) : `docs/COMPONENTS.md` (via `catalog.sh`) pour
   les attributs ; puis lister les consommateurs :
   ```sh
   grep -rl "<wd-LECOMPOSANT" pages/ templates/ core/components.html
   ```
   (et les marques concernées via leurs couches `brands/*`).
2. **Baseline.** `scripts/snapshot.sh save core/components.html storybook` (référence de la bibliothèque)
   + rendre chaque page consommatrice AVANT modif (PNG gardé).
3. Modifier le master / le style.
4. **Régression auto + diff consommateurs.** `scripts/snapshot.sh check core/components.html storybook`
   (la bibliothèque) **et** `scripts/diff.sh baseline.png apres.png` sur chaque consommateur : le
   changement VOULU apparaît où c'est voulu, **~0 % ailleurs**. Une régression = un consommateur a bougé
   sans raison → corriger ou scoper (variante / couche de marque).
5. Si le changement n'est valable que pour une marque → le déplacer dans `brands/<marque>/`, pas dans la base.
6. Si des attributs ont changé → **régénérer le catalogue** (`catalog.sh`) et **re-`save`** la référence visuelle.

## MODE deprecate (retirer un master proprement)
1. **Vérifier 0 consommateur** : `grep -rl "<wd-LECOMPOSANT" pages/ templates/ core/components.html` doit
   être **vide**. S'il en reste → ne PAS supprimer (migrer/avertir d'abord).
2. Retirer : la `def("wd-…")` de `core/components/components.js`, ses styles de `core/styles/base.css`,
   son entrée du storybook `core/components.html`, et sa mention dans `docs/DESIGN.md`.
3. **Régénérer le catalogue** + `snapshot.sh check` (la suppression ne doit rien casser ailleurs) +
   `audit` (0 référence morte). Journaliser dans `docs/LEARNINGS.md` (comme wd-eco/wd-editorial retirés).

## MODE audit
**Quand :** **APRÈS CHAQUE ajout/modif** de composant (create / variant / update / deprecate), et sur demande.
- **Régénérer le catalogue** (`scripts/catalog.sh`) + **régression visuelle** (`scripts/snapshot.sh check
  core/components.html storybook` → diff ~0 % hors changement voulu).
- **0 hex** hors exceptions : `grep -nE '#[0-9a-fA-F]{3,6}' core/styles/base.css | grep -vE '/\*|117846'`.
- **0 référence morte** : sélecteur/classe CSS ou attribut JS inutilisé après une modif.
- **Parité tokens** : un alias résout bien à la valeur de marque attendue (getComputedStyle headless).
- **Base réellement agnostique** : `grep -niE 'sofitel|mgallery|romie|gt america|the seasons|cera' core/components/components.js core/styles/base.css` doit être **vide** (sinon = marque qui a fui dans la base → extraire en couche).
- **A11y** : CONDITIONNELLE (seulement si testeurs assistive-tech ou cap prod) — aria-*, focus-visible.

## Polices de marque (rappel à donner au designer)
Le plugin **n'embarque PAS** les polices sous licence. Si une couche `brands/<marque>/<marque>.css`
déclare des `@font-face`, **dire au designer de déposer ses `.woff2` dans `brands/<marque>/fonts/`**
(noms exacts du `@font-face`). Sans eux → fallback OSS de la base (Playfair/Poppins), pas une erreur.

## Auto-amélioration
À la fin, journaliser tout point non-évident dans `docs/LEARNINGS.md`. Si un apprentissage devient une
règle durable, la PROPOSER au designer avant d'éditer ce SKILL.md (jamais de réécriture silencieuse).

## Rapport final
Mode exécuté · composant(s) touché(s) · rayon d'impact (pages/marques) · diffs (régression = 0) ·
limites assumées · doc/storybook mis à jour.


## Mode PLUGIN (kit embarqué)
Quand ce skill tourne depuis le plugin installé, le kit agnostique est embarqué dans `${CLAUDE_PLUGIN_ROOT}/core` (+ `${CLAUDE_PLUGIN_ROOT}/scripts`, `/docs`). Au 1er usage dans un projet vide : **scaffolder** = copier `${CLAUDE_PLUGIN_ROOT}/core` → `./core` et `${CLAUDE_PLUGIN_ROOT}/scripts` → `./scripts`. Les couches `brands/<marque>/`, templates `templates/<marque>/` et pages `pages/<marque>/` sont créés par le designer. **Polices sous licence à déposer dans `brands/<marque>/fonts/`** (sinon fallback OSS).
