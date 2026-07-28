# LEARNINGS — journal d'apprentissage du kit

Journal **append-only** alimenté par la skill (`welds-fill-template` / `welds-create-template`) à
chaque usage. But : que le kit devienne plus malin au fil des protos, sans dépendre d'un central.
Chaque designer a sa copie ; ce qui est ici reflète SES protos.

## Protocole (la skill suit ça)
- **Au début** d'un proto : lire ce fichier + `brand-presets.md`. Réutiliser ce qui s'applique.
- **À la fin** : si quelque chose de **non-évident** est apparu (quirk de marque, piège, fix, besoin
  manquant), ajouter UNE entrée datée ci-dessous. Court, actionnable.
- Si un apprentissage est **assez général** pour devenir une règle/DoD, la skill le **propose** au
  designer et ne modifie le `SKILL.md` qu'après son OK (voir section "Auto-amélioration" des SKILL.md).
- Format d'une entrée : `- [AAAA-MM-JJ] (marque) Apprentissage. → action/règle.`

## Quirks & pièges (re-skin, polices, logo)
- [2026-06-12] (mgallery) **Échelle typo MESURÉE (The Seasons LIGHT, pas l'échelle du kit)** : titres de
  section = **34px Light** (le kit met 48/400), hero = **48 Light**, welcome = **40 Light**, offre
  vedette « Family Memories » = 34 Light. → override `body.brand-mgallery .t-serif-xl {34/300}` + hero/offre.
  C'est LA leçon « ne pas supposer l'échelle du kit » : mesurer, sinon tout paraît trop gros/gras.
- [2026-06-12] (mgallery) Autres valeurs mesurées appliquées dans `brands/mgallery/mgallery.css` :
  bandeau fidélité **#A36159** (one-off marketing, pas un token) ; cartes callout 1 = **portrait 4:5**
  (403×504), callout 2 = **carré 1:1** (301) ; grille collector **gap 4px** ; newsletter = **fond blanc
  + titre encre** (PAS noir, mon hypothèse « de mémoire » était fausse) ; hero a un titre+sous-titre+CTA
  +caption+compteur (attributs optionnels ajoutés à `wd-hero`). Limites assumées : logos d'hôtels +
  vidéo hero = assets externes (image statique à la place). Résultat : 5145px vs 5222px maquette (~1.5 %).
- [2026-06-11] (toutes) `--font-serif/-sans/-meta` (welds.css) pointent sur les tokens de marque
  `--font-family-display/-body`. Le fallback inline de `var()` ne se déclenche **jamais** car `:root`
  (brandbook) définit déjà `--font-family-display` (= Montserrat). → ne pas compter sur le fallback
  inline comme filet ; une marque inconnue retombe sur Montserrat, pas sur Romie.
- [2026-06-11] (toutes) Sans les `.woff2` + `@font-face` d'une marque, sa police tombe en **système**
  (le nom existe dans les tokens mais aucune fonte chargée). Ce n'est **pas un bug**. → fournir les
  fichiers (voir `BRANDING.md`) ou assumer la limite.
- [2026-06-11] (toutes) **Équivalences de police libres** (quand la police sous licence manque) :
  télécharger un lookalike OSS en `.woff2` dans `/assets` (= statique, conforme « pas de CDN »), le
  déclarer sous une famille DÉDIÉE (`'Seasons Fallback'`, `'Cera Fallback'`), et l'insérer dans un stack
  scopé `body.brand-<marque>` : `vraie police, équivalence, polices Mac (Didot/Avenir), générique`. La
  vraie police déposée plus tard reprend la main sans rien changer. **Piège** : ne PAS construire le stack
  avec `var(--font-family-display)` — sa valeur (`'X', sans-serif`) contient un générique `sans-serif`
  qui court-circuite le fallback serif. Écrire les noms en clair. Équivalences éprouvées : The Seasons ≈
  **Playfair Display**, MGallery Cera ≈ **Poppins**, Cera ≈ Jost/Mulish aussi.
- [2026-06-11] (toutes) Le logo se surcharge via `window.WD_BRAND = {name, wordmark, mono}` (résolu
  au render). SVG **en `currentColor`** (sinon la couleur de marque ne s'applique pas), `mono` en
  `viewBox 0 0 44 44`, `wordmark` ratio ~172×14. → contrainte d'export à donner au designer.
- [2026-06-11] (toutes) Les **graisses** de titre ne se re-skinnent pas (welds.css fige `font-weight`
  sur `.t-serif-*`). Limite connue, hors scope branding.
- [2026-06-11] (mgallery) 1er **nouveau type de page** via create-template = **brand homepage**
  (`templates/brand-homepage.html`, exemple `mgallery-brand-homepage.html`). Composants DS **propres
  à la marque** (`mga.loyalty-info`, `mga.social-media`) → 2 nouveaux masters `wd-loyalty` /
  `wd-newsletter` ajoutés à la **base partagée** (jamais de copie par marque). Frames Figma (`offers`,
  « become a collector ») → **inline**, pas de faux master. → conforme au principe multi-marque.
- [2026-06-11] (mgallery) Différences de marque gérées **sans fork** : header EN/USD/account =
  **attributs optionnels** sur `wd-header` (Sofitel ne les passe pas → inchangé) ; sections noires =
  utilitaire `.wd-on-dark` (texte/onglets/pager basculent en blanc, onglets en **pilules**) ; logo
  emblème compact (≠ wordmark large) = **4 règles CSS scopées `body.brand-mgallery`**. Tout en tokens
  → re-skinnable. → c'est le principe « enrichir la base, jamais 2 copies ».
- [2026-06-11] (mgallery) Le **fond du bandeau fidélité** Figma (`#A36159`) n'est dans aucun token ;
  rendu via `var(--color-accent)` (`#97544C`), léger écart de teinte assumé. Règle : pas de hex one-off,
  on prend le token sémantique le plus proche et on le signale.
- [2026-06-11] (process) Gros lot (nouveau template) **vérifié headless + comparaison aux captures
  Figma, SANS escouade d'agents** : dimensionné car proto de test. Cohérent avec la règle de coût
  ci-dessous. L'escouade reste pour un cap prod / doute de fidélité réel.

- [2026-06-12] (sofitel) **2e type de page = room details** (`templates/sofitel/room-details.html`, node Figma
  5012:9295). 1 nouveau master `wd-amenities` (← DS `so.list-grid`, grille 3 col colGap 24/rowGap 48 mesurés,
  consomme des `<wd-amenity title items>`). 3 extensions **additives** (zéro régression homepage) : `wd-welcome`
  `facts="capacity:…|bed:…|surface:…|view:…"` (rangée infos chambre, icônes dédiées) ; `wd-highlight` booléen
  `image-left` ; carrousel `seeall` (lien droite du titre, `.wd-sh--split` — sans l'attribut, heading
  byte-identique). Échelle Sofitel = celle du kit (t-serif-xl 48, t-sans-xl 32/40) → mesures Figma confirmées
  identiques, PAS d'override (≠ MGallery). Vérif headless + comparaison captures, **sans escouade** (proto test).
- [2026-06-12] (process) **Régression d'un master partagé = la vérifier vraiment.** wd-welcome/wd-highlight/
  carrousel modifiés → rendu des consommateurs existants (homepage NY + MGallery) : 0 erreur, sections
  inchangées. La parade : rendre les attributs/variantes **optionnels** et garder le chemin « sans attribut »
  identique à l'octet (ternaire qui retombe sur le HTML d'origine). + **test de remplissage** avec un AUTRE
  contenu (Sofitel London, nom de chambre long, facts longs) = layout tient, 0 jeton.

- [2026-06-12] (process) **L'escouade QA a rattrapé un piège règle 1 dans le sens « OUBLI ».** Sur room-details
  j'avais écarté 2 éléments (liste features du highlight, pilules de filtre des more-rooms) en les jugeant
  « cachés/placeholder » d'après `figma_execute` — ALORS QU'ILS SONT VISIBLES sur la slide rendue. Une escouade
  ciblée (3 agents : fidélité Figma + comportements JS + tokens/hex/refs) les a repérés ; re-capture manuelle
  confirmée → corrigés. → Le piège « .characters vs visible » marche AUSSI à l'envers (omettre un visible).
  Toujours **re-capturer la section** avant de conclure « pas dans la maquette ». Et : **proposer l'escouade au
  designer** sur un gros lot / cap luxe (coût justifié), ne pas la sauter en décidant seul.
- [2026-06-12] (process) **Process attendu par le designer** : (1) plan formel présenté seul AVANT de coder
  (pas mélangé au Discovery), validé ; (2) **proposer le mode auto** (auto-accept) pour exécuter d'une traite.
  Les deux ont été oubliés au 1er passage room-details. Voir mémoire `plan-puis-mode-auto-au-debut`.

## Coût & dimensionnement de la vérification
- [2026-06-11] (process) La **vérif par équipe d'agents** est le 1er poste de coût en tokens (≈ 70k-240k
  par passe, mesuré). → DIMENSIONNER : petit changement = rendu headless + mesure, 0 agent ; moyen =
  1-2 agents ciblés ; gros lot iso Figma = l'escouade. Ne jamais lancer toute l'escouade pour un détail.
- [2026-06-11] (process) **« Pixel-perfect » ne se juge PAS à l'œil sur miniature.** Sur MGallery j'ai
  validé « proche » sur des thumbnails réduites alors que c'était loin. Causes : (a) images placeholders
  d'une autre marque, (b) échelle typo du kit appliquée au lieu des valeurs Figma mesurées (welcome 48px
  au lieu de 40 ; sous-titre 16 au lieu de 20), (c) couleur token approchante (`#97544C`) au lieu de la
  vraie (`#A36159`), (d) masters Sofitel forcés. → **Méthode** : mesurer les specs Figma AVANT de coder,
  extraire images/contenu de la source (Figma si proto), masters seulement si 1:1 sinon inline mesuré, et
  **`scripts/diff.sh` (diff au pixel) au lieu du jugement à l'œil**. Cf. étape « 4bis » du SKILL.
- [2026-06-12] (process) **Le VISIBLE prime sur les données du composant.** 2× sur MGallery, `figma_execute`
  a renvoyé des nœuds de texte CACHÉS / d'autres slides (« Secondary section title », titre hero « MGallery
  Universe » + caption + « 1/3 ») absents de la slide RENDUE. J'ai bâti dessus → callout/hero sur-construits.
  → **Toujours valider sur la CAPTURE, jamais sur les `.characters` seuls ; ne pas ajouter un élément que
  la maquette visible ne montre pas.** + **boucle auto-évaluation → amélioration** : noter honnêtement par
  section, mesurer/vérifier, corriger, re-évaluer ; reconnaître une régression et revenir en arrière (hero
  ramené à l'image + header seuls). Intégré au SKILL (règle 1 + section « Auto-évaluation → amélioration »).
- [2026-06-11] (process) **Ada (accessibilité)** : peu utile sur un proto de test jetable (coût élevé,
  valeur faible). À déployer SEULEMENT si testeurs avec techno d'assistance OU cap vers la prod. Sortie
  de la DoD par défaut.

## Besoins / manques relevés (backlog des designers)
> Ajouter ici ce que la skill n'a pas su faire ou ce qu'un designer a demandé. Sert de feuille de
> route locale. Quand un besoin est traité, le cocher ou le déplacer en "Quirks".
- [ ] i18n : passer le chrome d'UI (FR codé en dur) à d'autres langues = chantier séparé.
- [ ] Récupération auto des prix réels depuis ALL : non fiable (JS + anti-bot + session). Pour
      l'instant : saisie manuelle des prix par le designer.
