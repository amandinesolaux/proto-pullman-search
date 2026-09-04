// Les hôtels de la carte ne sont plus authorés ici : ils dérivent de REGION_HOTELS
// (components.js), qui est la source unique. components.js est chargé avant ce
// fichier et publie window.PULLMAN_HOTELS_MAP. Le repli à vide évite une erreur
// si un jour la carte est chargée seule.
const PULLMAN_HOTELS_MAP = window.PULLMAN_HOTELS_MAP || [];


const CONTINENT_BOUNDS = {
  europe:          [[34, -15], [62, 40]],
  asie:            [[-12, 60], [48, 150]],
  'moyen-orient':  [[10, 20], [45, 65]],
  afrique:         [[-38, -22], [40, 55]],
  ameriques:       [[-42, -90], [32, -30]],
  oceanie:         [[-48, 108], [-8, 182]],
};

let _bookingMap = null;
let _markers = [];
let _currentContinent = null;
// Hôtel dont le détail est ouvert, pour pouvoir le réafficher après un recalcul des pins.
let _detailHotel = null;
// Minuterie du message « cet hôtel ne propose pas … », pour le retirer après lecture.
let _avisTimer = null;
// Zone géographique courante — la carte ne connaissait que le continent, alors que la
// liste sait descendre au pays, à la ville et à l'hôtel. Choisir « Chine » n'avait donc
// aucun effet sur la carte, qui restait sur l'Asie entière.
let _currentScope = {};
// Vue d'où l'on a ouvert une card, pour y revenir en la fermant. Sans elle, fermer
// renvoyait toujours au continent : après s'être approché d'une ville à deux hôtels, on
// perdait la vue qui permettait justement de les distinguer.
let _vueAvantDetail = null;

// L'hôtel appartient-il à la zone affichée ? Pays puis continent — le périmètre exact de
// getResultsPool(), qui décide de la liste. Y ajouter la ville ou l'hôtel sélectionné
// désaccordait les deux vues : la carte écartait des hôtels que la liste affichait.
function _dansLaZone(hotel, scope) {
  const s = scope || {};
  if (s.hotel) return hotel.name === s.hotel;
  if (s.city) return hotel.city === s.city;
  if (s.country) return hotel.country === s.country;
  if (s.continent) return hotel.continent === s.continent;
  return true;
}
// Une zone est-elle définie ? Sert à savoir s'il faut mettre en avant et recadrer.
function _zoneDefinie(scope) {
  const s = scope || {};
  return !!(s.hotel || s.city || s.country || s.continent);
}
let _currentCriteria = null;

function _makeSmallIcon(greyed) {
  return L.divIcon({
    className: 'pullman-map-marker' + (greyed ? ' pullman-map-marker--greyed' : ''),
    html: '<div class="pullman-dot' + (greyed ? ' pullman-dot--greyed' : '') + '"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// `nombre` : plus de un quand le pin réunit les hôtels d'une même ville.
function _makeLargeIcon(cityName, greyed, nombre) {
  return L.divIcon({
    className: 'pullman-map-marker pullman-map-marker--labeled' + (greyed ? ' pullman-map-marker--greyed' : ''),
    html: '<div class="pullman-dot pullman-dot--large' + (greyed ? ' pullman-dot--greyed' : '') + '"></div>' +
          '<span class="pullman-label">' + cityName +
          (nombre > 1 ? '<span class="pullman-label__compte">· ' + nombre + '</span>' : '') + '</span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// Défilement des photos, posé une seule fois sur le document. Délégué plutôt qu'attaché
// à chaque card : la card de la carte est reconstruite à chaque changement de critère, et
// la page de résultats fabrique les siennes de son côté — un seul gestionnaire les sert
// toutes, sans avoir à être réinstallé.
function _installerGalerie() {
  if (document.documentElement.dataset.wdGalerie) return;
  document.documentElement.dataset.wdGalerie = '1';
  // Déplier la liste des restaurants et bars, en revenir, ou en choisir un — auquel cas
  // la card se referme sur ce lieu et lui donne sa photo. Le geste de la navigation
  // séquentielle, mais après le choix plutôt qu'à sa place.
  document.addEventListener('click', (e) => {
    const carte = e.target.closest('.pullman-popup');
    if (!carte) return;
    if (e.target.closest('[data-lieux-deplier]')) {
      e.preventDefault(); carte.classList.add('pullman-popup--deplie');
      const l = carte.querySelector('.pullman-popup__lieux'); if (l) l.hidden = false;
      return;
    }
    if (e.target.closest('[data-lieux-replier]')) {
      e.preventDefault(); carte.classList.remove('pullman-popup--deplie');
      return;
    }
    const choix = e.target.closest('[data-lieu]');
    if (choix) {
      e.preventDefault();
      carte.classList.remove('pullman-popup--deplie');
      // La vitrine reprend le lieu choisi : son nom, son qualificatif, sa photo.
      const vitrine = carte.querySelector('[data-lieu-vitrine]');
      if (vitrine) {
        const nom = vitrine.querySelector('.pullman-popup__table-nom');
        const typ = vitrine.querySelector('.pullman-popup__table-type');
        if (nom) nom.textContent = choix.querySelector('.pullman-popup__lieu-nom').textContent;
        if (typ) typ.textContent = choix.querySelector('.pullman-popup__lieu-type').textContent;
      }
      carte.querySelectorAll('[data-lieu]').forEach(b => b.removeAttribute('data-on'));
      choix.setAttribute('data-on', '');
      const i = Number(choix.dataset.lieuPhoto);
      if (i >= 0) {
        const pt = carte.querySelector('.pullman-popup__point[data-point="' + i + '"]');
        if (pt) pt.click();
      }
    }
  });

  document.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-photo],[data-point]');
    if (!bouton) return;
    // On repère le conteneur par son marqueur, pas par une classe : la card de la carte
    // et celle de la page de résultats n'ont pas la même mise en page, mais toutes deux
    // portent `data-galerie` et se pilotent pareil.
    const media = bouton.closest('[data-galerie]');
    if (!media) return;
    e.preventDefault();
    const photos = [...media.querySelectorAll('img')];
    const points = [...media.querySelectorAll('.pullman-popup__point')];
    if (photos.length < 2) return;
    const courant = Math.max(0, photos.findIndex(i => i.hasAttribute('data-on')));
    const cible = bouton.dataset.point !== undefined
      ? Number(bouton.dataset.point)
      : (courant + Number(bouton.dataset.photo) + photos.length) % photos.length;
    photos.forEach((im, i) => {
      if (i === cible) { im.removeAttribute('loading'); im.setAttribute('data-on', ''); }
      else im.removeAttribute('data-on');
    });
    points.forEach((pt, i) => i === cible ? pt.setAttribute('data-on', '') : pt.removeAttribute('data-on'));
  });
}

// Posés dès le chargement, et non à la première ouverture d'une card. La page de
// résultats affiche ses cards sans jamais passer par wdHotelPopupHTML : son gestionnaire
// de galerie manquait, et les styles des points et des chevrons avec — ils s'y affichaient
// en blocs bruts, hors de la photo.
_installerGalerie();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _addStyle);
else _addStyle();

function _addStyle() {
  _installerGalerie();
  if (document.getElementById('pullman-map-style')) return;
  const style = document.createElement('style');
  style.id = 'pullman-map-style';
  style.textContent =
    '.pullman-dot{width:10px;height:10px;background:#5FEF91;border-radius:50%;border:2px solid #1a2220;box-shadow:0 0 6px rgba(95,239,145,.5),0 1px 3px rgba(0,0,0,.4);transition:all .3s;cursor:pointer}' +
    '.pullman-dot--large{width:14px;height:14px;box-shadow:0 0 12px rgba(95,239,145,.7),0 0 24px rgba(95,239,145,.3),0 2px 6px rgba(0,0,0,.4);animation:pullman-pulse 2s ease-in-out infinite}' +
    '.pullman-dot--greyed{background:#666;box-shadow:0 0 4px rgba(100,100,100,.3),0 1px 2px rgba(0,0,0,.3)}' +
    '.pullman-dot--large.pullman-dot--greyed{background:#666;box-shadow:0 0 6px rgba(100,100,100,.3),0 1px 3px rgba(0,0,0,.3);animation:none}' +
    '.pullman-map-marker--greyed .pullman-label{color:rgba(255,255,255,.4)}' +
    // Masquée, pas supprimée : le pin reste cliquable et le nom revient au survol.
    '.pullman-label{transition:opacity .15s}' +
    '.pullman-label--masquee{opacity:0;pointer-events:none}' +
    '.pullman-map-marker:hover .pullman-label--masquee{opacity:1}' +
    // Le pin survolé passe devant, sinon son nom réapparaît sous ceux des voisins.
    '.pullman-map-marker:hover{z-index:10000 !important}' +
    // Le compte se lit dans le nom, sans pastille : une puce blanche sur la carte pesait
    // plus lourd que la ville qu'elle qualifie.
    '.pullman-label__compte{margin-left:4px;font-weight:400;opacity:.65}' +
    // Pin sélectionné : sans bulle au-dessus de lui, il lui faut sa propre marque
    '.pullman-map-marker--selected .pullman-dot{width:16px;height:16px;background:#fff;border-color:#5FEF91;box-shadow:0 0 0 4px rgba(95,239,145,.35),0 2px 8px rgba(0,0,0,.5)}' +
    // ── Panneau de détail, ancré à gauche de la carte ──────────────────────────
    // Il ne masque plus le pin : la carte est recentrée pour que l'hôtel tombe à droite.
    // Hauteur plafonnée à celle de la carte : avec tous les services affichés, le panneau
    // dépassait le cadre (371px pour 340). Il défile plutôt que de déborder —
    // disableScrollPropagation empêche ce défilement de zoomer la carte.
    // Cadre fixe, contenu défilant à l'intérieur : avec tous les services affichés, le
    // panneau dépassait la carte (371px pour 340). Le bouton de fermeture reste sur le
    // cadre, sinon il partirait avec le défilement.
    '.wd-map-detail{position:absolute;top:12px;left:12px;width:' + WD_DETAIL_W + 'px;z-index:800;' +
      'max-height:calc(100% - 24px);display:flex;flex-direction:column;overflow:hidden;' +
      'background:#fff;box-shadow:0 12px 38px rgba(0,0,0,.45);' +
      'opacity:0;transform:translateX(-12px);pointer-events:none;transition:opacity .2s,transform .2s}' +
    '.wd-map-detail__scroll{display:flex;flex-direction:column;min-height:0;' +
      'overflow-y:auto;overscroll-behavior:contain;' +
      'scrollbar-width:thin;scrollbar-color:rgba(68,80,71,.35) transparent}' +
    // Photo en 21:9 dans le panneau, contre 16:9 ailleurs. La carte du dropdown est figée
    // à 340px : le panneau doit tenir dans 316 sans jamais faire défiler. Le plafond de
    // badges est un COMPTE, mais la contrainte est une LARGEUR — quatre libellés longs
    // (« Salles de réunion », « Petit-déjeuner ») passent sur deux lignes. On dimensionne
    // donc pour ce pire cas, et c'est la photo qui cède, jamais le prix ni les boutons.
    '.wd-map-detail .pullman-popup__media{flex:0 0 auto;aspect-ratio:21/9}' +
    '.wd-map-detail .pullman-popup__body{flex:0 0 auto}' +
    // Place réservée pour deux lignes de badges, qu'il y en ait une ou deux : sans elle
    // la card changeait de hauteur au gré des libellés cochés, et le panneau sautait
    // sous le curseur pendant qu'on règle ses filtres.
    '.wd-map-detail .pullman-popup__tags{min-height:44px;align-content:flex-start}' +
    // Liste des tables, onglet Restaurants. Hauteur réservée pour trois lignes, comme les
    // badges ailleurs : la card ne doit pas changer de taille selon l'hôtel cliqué.
    '.pullman-popup__tables{display:flex;flex-direction:column;gap:8px;margin:10px 0 0}' +
    // Deux lignes de table plus la mention du reste, réservées qu'elles servent ou non :
    // la card ne doit pas changer de taille selon l'hôtel cliqué.
    // Une rangée plus la mention du reste, réservées qu'elles servent ou non.
    '.wd-map-detail .pullman-popup__tables{min-height:62px;justify-content:flex-start}' +
    // Même 21:9 que la card hôtel : à 32:9 la photo de la table était une bande où l'on
    // ne distinguait rien. Les 42 px que cela coûte sont repris sur le pied de card, dont
    // le bouton devient un lien.
    // Nom sur sa ligne, qualification sous lui. Les mettre côte à côte les tronquait tous
    // les deux — « Blue Lemon » lui-même n'y tenait pas. La hauteur que cela coûte est
    // reprise sur la photo, qui n'est que celle de l'hôtel.
    '.pullman-popup__table{display:flex;flex-direction:column;gap:0;min-width:0}' +
    // Le nom prend la place libre et la qualification cède la première : l'inverse
    // tronquait « LE VERTIGO ROOFTOP BAR » en « LE VERTIGO ROO… » pour laisser voir
    // « Bar · Rooftop & vue · Bor… », deux moitiés illisibles au lieu d'un nom entier.
    // `.leaflet-container a` de Leaflet vaut (0,1,1) et l'emportait sur ma classe seule :
    // les noms de tables s'affichaient dans le bleu de lien par défaut. On double le
    // sélecteur — dans le conteneur Leaflet et hors de lui, la page de résultats n'en
    // ayant pas autour de ses cards. Troisième fois que cette feuille nous prend de
    // vitesse : avant elle, la croix de fermeture et les liens de l'encart.
    '.leaflet-container a.pullman-popup__table-nom,a.pullman-popup__table-nom,' +
    '.pullman-popup__table-nom{font-family:var(--font-sans,sans-serif);font-size:12.5px;font-weight:600;' +
      'color:#445047;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.leaflet-container a.pullman-popup__table-nom:hover,a.pullman-popup__table-nom:hover{text-decoration:underline;color:#28332B}' +
    // Une seule ligne, comme le nom : « Restaurant · Végétarienne & healthy · Bord de
    // piscine » passait sur deux et faisait déborder la card de 23 px.
    '.pullman-popup__table-type{font-family:var(--font-sans,sans-serif);font-size:11px;' +
      'color:rgba(68,80,71,.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.pullman-popup__tables-reste{margin:2px 0 0;font-family:var(--font-sans,sans-serif);font-size:11px;' +
      'font-style:italic;color:rgba(68,80,71,.6)}' +
    // Dans le panneau seulement, les chevrons démarrent sous la croix : viser à côté d'elle
    // ne doit pas faire défiler les photos alors qu'on cherchait à fermer. Ailleurs — la
    // bande de 150 px des cards de résultats — ce retrait mangerait un tiers de la hauteur.
    '.wd-map-detail .pullman-popup__nav{top:42px}' +
    '.wd-map-detail__scroll::-webkit-scrollbar{width:6px}' +
    '.wd-map-detail__scroll::-webkit-scrollbar-thumb{background:rgba(68,80,71,.35);border-radius:100px}' +
    '.wd-map-detail__scroll::-webkit-scrollbar-track{background:transparent}' +
    '.wd-map-detail[data-state="open"]{opacity:1;transform:none;pointer-events:auto}' +
    // Message d'écartement : même emplacement que le détail, mais sans photo — il informe,
    // il ne présente pas un hôtel.
    // Plus large que la card hôtel : celle-ci est calée à 288 pour que sa photo, ses badges
    // et ses boutons tiennent dans les 316 px de haut de la carte — l'élargir la ferait
    // défiler à nouveau. Le message n'a pas de photo : la place gagnée sert à respirer.
    // Plafond conservé, contrairement au réglage précédent qui l'annulait : sans lui un
    // message très long n'aurait pas défilé, il aurait été coupé net par le bord de la
    // carte, boutons compris. Le cas ne se présente pas — 295 px mesurés pour 316 — mais
    // la troncature silencieuse est le mauvais échec à retenir.
    // Le compteur devient un bouton : il annonçait des lieux sans jamais y mener.
    '.pullman-popup__tables-reste{border:none;background:none;padding:0;font:inherit;text-align:left;color:#445047;text-decoration:underline;text-underline-offset:2px;cursor:pointer}' +
    'button.pullman-popup__tables-reste:hover{color:#28332B}' +
    // Deux colonnes, une ligne par lieu : sept tiennent dans la hauteur d'une card sans
    // photo, là où le format d'origine en montrait un seul.
    // display:none et non l'attribut hidden : la classe pose display:flex et l'emporte
    // sur le hidden du navigateur — la liste restait affichée sous la card.
    '.pullman-popup__lieux{display:none;padding:12px 14px 14px;flex-direction:column;gap:10px}' +
    '.pullman-popup__lieux-liste{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px}' +
    '.pullman-popup__lieu{border:none;background:none;padding:3px 0;font:inherit;text-align:left;cursor:pointer;display:flex;flex-direction:column;min-width:0}' +
    '.pullman-popup__lieu:hover .pullman-popup__lieu-nom{text-decoration:underline;text-underline-offset:2px}' +
    '.pullman-popup__lieu[data-on] .pullman-popup__lieu-nom{color:#28332B}' +
    '.pullman-popup__lieu-nom{font-family:var(--font-sans,sans-serif);font-size:11.5px;font-weight:600;color:#445047;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.pullman-popup__lieu-type{font-family:var(--font-sans,sans-serif);font-size:10.5px;color:rgba(68,80,71,.68);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.pullman-popup__lieux-pied{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:9px;border-top:1px solid #BCCABE}' +
    '.pullman-popup__lieux-retour{border:none;background:none;padding:0;font-family:var(--font-sans,sans-serif);font-size:11.5px;color:rgba(68,80,71,.8);text-decoration:underline;text-underline-offset:2px;cursor:pointer}' +
    '.pullman-popup--deplie .pullman-popup__media,' +
    '.pullman-popup--deplie .pullman-popup__location,' +
    '.pullman-popup--deplie .pullman-popup__tables,' +
    '.pullman-popup--deplie .pullman-popup__foot{display:none}' +
    '.pullman-popup--deplie .pullman-popup__lieux{display:flex}' +
    '.pullman-popup--deplie .pullman-popup__body{padding-bottom:0}' +
    '.wd-map-detail--avis{width:344px;overflow-y:auto;overscroll-behavior:contain}' +
    // L'air se prend en hauteur : marges hautes et basses plus généreuses que les côtés,
    // interlignes plus amples, et de vrais intervalles entre le titre, le texte et les
    // actions. La largeur, elle, ne bouge plus.
    '.wd-map-detail__avis{padding:26px 24px 24px}' +
    // Seul le titre s'écarte de la croix ; le reste occupe toute la largeur.
    '.wd-map-detail__avis-titre{padding-right:30px;margin:0 0 14px;font-family:var(--font-sans,sans-serif);font-size:14px;font-weight:700;line-height:1.45;color:#445047}' +
    '.wd-map-detail__avis-suite{margin:0;font-family:var(--font-sans,sans-serif);font-size:12.5px;line-height:1.7;color:rgba(68,80,71,.78)}' +
    '.wd-map-detail__avis-suite strong{color:#445047}' +
    // Mêmes formes que les actions de la card hôtel : pilule pour l'action, lien pour le
    // recours. Les boutons du bloc vert sont taillés pour un fond sombre ; ici le fond est
    // blanc et ils y disparaîtraient.
    // Les deux boutons ne tiennent pas côte à côte, même élargi, et le retour à la ligne
    // les laissait flotter chacun sur son bord. On les empile donc, pleine largeur,
    // l'action d'abord.
    '.wd-map-detail__avis-actions{display:flex;flex-direction:column;align-items:stretch;gap:14px;margin-top:26px}' +
    '.wd-map-detail__avis-relax{font-family:var(--font-sans,sans-serif);font-size:12.5px;font-weight:500;' +
      'padding:13px 20px;border:1px solid #445047;border-radius:100px;background:transparent;color:#445047;' +
      'cursor:pointer;text-align:center;transition:background .15s,color .15s}' +
    '.wd-map-detail__avis-relax:hover{background:#445047;color:#fff}' +
    '.wd-map-detail__avis-reset{font-family:var(--font-sans,sans-serif);font-size:12.5px;font-weight:400;' +
      'padding:0;border:none;background:transparent;color:rgba(68,80,71,.78);text-decoration:underline;' +
      'text-underline-offset:2px;cursor:pointer;text-align:center}' +
    '.wd-map-detail__avis-reset:hover{color:#445047}' +
    // La croix est claire sur la photo du détail ; ici le fond est blanc, il lui faut
    // l'inverse pour rester visible.
    '.wd-map-detail--avis .wd-map-detail__close{background-color:rgba(68,80,71,.12);' +
      'background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 12 12%27 fill=%27none%27 stroke=%27%23445047%27 stroke-width=%271.8%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M3 3 L9 9 M9 3 L3 9%27/%3E%3C/svg%3E")}' +
    '.wd-map-detail--avis .wd-map-detail__close:hover{background-color:rgba(68,80,71,.24)}' +
    // z-index 5 et non 2 : le chevron « photo suivante » couvre toute la hauteur du bord
    // droit, croix comprise. À z-index égal c'est lui qui l'emportait, étant plus bas dans
    // le document — cliquer la croix faisait défiler les photos au lieu de fermer.
    '.wd-map-detail__close{position:absolute;top:8px;right:8px;z-index:5;width:26px;height:26px;padding:0;' +
      'border:none;border-radius:100px;background-color:rgba(0,0,0,.55);cursor:pointer;' +
      'background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 12 12%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-width=%271.8%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M3 3 L9 9 M9 3 L3 9%27/%3E%3C/svg%3E");' +
      'background-repeat:no-repeat;background-position:center;background-size:11px 11px;transition:background-color .15s}' +
    '.wd-map-detail__close:hover{background-color:rgba(0,0,0,.8)}' +
    '.wd-map-detail__close:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
    '@media (prefers-reduced-motion: reduce){.wd-map-detail{transition:none}}' +
    '.pullman-label{position:absolute;left:18px;top:50%;transform:translateY(-50%);white-space:nowrap;font-family:var(--font-sans,sans-serif);font-size:11px;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.8),0 0 2px rgba(0,0,0,.6);pointer-events:none}' +
    '@keyframes pullman-pulse{0%,100%{box-shadow:0 0 12px rgba(95,239,145,.7),0 0 24px rgba(95,239,145,.3),0 2px 6px rgba(0,0,0,.4)}50%{box-shadow:0 0 18px rgba(95,239,145,.9),0 0 36px rgba(95,239,145,.4),0 2px 6px rgba(0,0,0,.4)}}' +
    // ── Encart hôtel ──────────────────────────────────────────────────────────
    // Même langage que les cartes de la page de résultats : fond #1a2220, aucun radius,
    // le vert réservé au prix et à l'action. La bordure verte décorative d'avant entrait
    // en concurrence avec les pins, eux aussi verts.
    // Carte blanche : sur surface claire, les tokens Pullman donnent #445047 pour le texte
    // (--color-on-surface-hi) et #BCCABE pour les filets (--color-outline-low).
    // Aucune bordure : la carte blanche est posée sur une carte sombre, elle s'en
    // détache d'elle-même. Le filet #BCCABE des tokens vaut pour une surface claire
    // sur page claire ; ici il se lisait comme un contour blanc et laissait 1px de
    // blanc autour de la photo. L'ombre porte seule la séparation.
    '.pullman-popup-card .leaflet-popup-content-wrapper{background:#fff;border:none;border-radius:0;padding:0;overflow:hidden;box-shadow:0 12px 38px rgba(0,0,0,.45)}' +
    '.pullman-popup-card .leaflet-popup-content{margin:0;width:264px!important;color:#445047}' +
    '.pullman-popup-card .leaflet-popup-tip{background:#fff;border:none;box-shadow:none}' +
    // Leaflet impose « .leaflet-popup-content p { margin: 1.3em 0 } » depuis son CDN.
    // Sa spécificité (0,1,1) bat une simple classe : on la neutralise à (0,2,1), sinon
    // chaque paragraphe ajoute ~35px de vide invisible dans l'encart.
    '.pullman-popup-card .leaflet-popup-content p{margin:0}' +
    '.pullman-popup__media{position:relative;display:block;width:100%;aspect-ratio:16/9;background:#E7EDE8}' +
    // Les photos se superposent : la card garde exactement la même hauteur, quelle qu'en
    // soit la photo affichée — c'est la contrainte qui gouverne ce panneau.
    '.pullman-popup__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;' +
      'opacity:0;transition:opacity .25s}' +
    '.pullman-popup__img[data-on]{opacity:1}' +
    '.pullman-popup__points{position:absolute;left:0;right:0;bottom:7px;z-index:2;' +
      'display:flex;justify-content:center;gap:5px;pointer-events:auto}' +
    '.pullman-popup__point{width:5px;height:5px;padding:0;border:none;border-radius:50%;cursor:pointer;' +
      'background:rgba(255,255,255,.5);box-shadow:0 1px 2px rgba(0,0,0,.45);transition:background .2s,width .2s}' +
    '.pullman-popup__point[data-on]{background:#fff;width:14px;border-radius:100px}' +
    // Chevrons discrets, révélés au survol : ils ne doivent pas concurrencer la photo.
    '.pullman-popup__nav{position:absolute;top:0;bottom:0;width:34px;z-index:2;padding:0;border:none;' +
      'background:transparent;cursor:pointer;opacity:0;transition:opacity .2s}' +
    '.pullman-popup__media:hover .pullman-popup__nav{opacity:1}' +
    '.pullman-popup__nav:focus-visible{opacity:1;outline:2px solid #fff;outline-offset:-4px}' +
    '.pullman-popup__nav::before{content:"";position:absolute;top:50%;left:50%;width:8px;height:8px;' +
      'border-left:1.8px solid #fff;border-bottom:1.8px solid #fff;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}' +
    '.pullman-popup__nav--prev{left:0}' +
    '.pullman-popup__nav--prev::before{transform:translate(-40%,-50%) rotate(45deg)}' +
    '.pullman-popup__nav--next{right:0}' +
    '.pullman-popup__nav--next::before{transform:translate(-60%,-50%) rotate(-135deg)}' +
    // Badge « Nouveau » posé sur la photo : voile sombre, seul endroit où le blanc reste lisible
    '.pullman-popup__badge{position:absolute;top:8px;left:8px;padding:3px 8px;background:rgba(0,0,0,.62);font-family:var(--font-sans,sans-serif);font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#fff}' +
    '.pullman-popup__body{padding:11px 14px 12px;display:flex;flex-direction:column;gap:5px}' +
    '.pullman-popup__name{font-family:var(--font-sans,sans-serif);font-size:13px;font-weight:700;color:#445047;margin:0;line-height:1.3}' +
    // Le nom mène à la fiche. Deux classes dans le sélecteur, pas une : dans le
    // conteneur Leaflet, `.leaflet-container a` impose son bleu à (0,1,1) et une
    // classe seule ne suffit jamais — le piège s'est déjà refermé trois fois ici.
    '.pullman-popup__body .pullman-popup__name a{color:#445047;text-decoration:none}' +
    '.pullman-popup__body .pullman-popup__name a:hover{color:#445047;text-decoration:underline;text-underline-offset:3px}' +
    // Opacité .78 et non .62 : sur blanc, .62 tombait à 3,16:1, sous le seuil AA de
    // 4,5:1 pour ce corps de 11px. À .78 on est à 4,7:1.
    '.pullman-popup__location{font-family:var(--font-sans,sans-serif);font-size:11px;color:rgba(68,80,71,.78);margin:0;display:flex;align-items:center;gap:5px;min-width:0}' +
    '.pullman-popup__location svg{flex-shrink:0}' +
    '.pullman-popup__location>span:first-of-type{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.pullman-popup__score{flex-shrink:0;margin-left:auto;padding:1px 6px;background:#445047;font-size:11px;font-weight:700;color:#fff}' +
    // Services de l'hôtel. Par défaut en gris-vert discret : c'est de l'information, pas
    // une réponse à une demande. Ceux que l'utilisateur a cochés passent au vert de
    // marque — en fond, jamais en texte, #5FEF91 étant illisible sur blanc.
    '.pullman-popup__tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:1px}' +
    '.pullman-popup__tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:rgba(68,80,71,.08);font-family:var(--font-sans,sans-serif);font-size:10px;font-weight:500;color:#445047;white-space:nowrap}' +
    '.pullman-popup__tag--match{background:rgba(95,239,145,.32);font-weight:600;color:#2F4034}' +
    // « +N » : un compte, pas un service — fond transparent et filet, pour qu'il ne se
    // lise pas comme un équipement de plus. Le survol révèle lesquels.
    '.pullman-popup__tag--plus{background:transparent;border:1px solid rgba(68,80,71,.28);color:rgba(68,80,71,.78);cursor:default}' +
    // align-items:center et non baseline : le CTA est lui-même un conteneur flex, et
    // l'alignement sur la ligne de base d'un flex imbriqué ajoutait ~40px de vide.
    // Deux actions : le prix passe sur sa propre ligne, sinon les trois éléments se
    // comprimeraient sur 236px utiles.
    '.pullman-popup__foot{display:flex;flex-direction:column;align-items:stretch;gap:9px;margin-top:2px;padding-top:9px;border-top:1px solid #BCCABE}' +
    // Groupe calé à droite, 12px entre le lien et le bouton
    '.pullman-popup__actions{display:flex;align-items:center;justify-content:flex-end;gap:12px}' +
    // Même paire que les cards de résultats : bouton contour puis lien fléché, repris
    // du design system Accor. Sélecteur à 2 classes, sinon Leaflet impose son bleu.
    '.pullman-popup-card .pullman-popup__link{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-sans,sans-serif);font-size:11px;font-weight:500;color:#445047;text-decoration:none;white-space:nowrap;transition:gap .15s}' +
    '.pullman-popup-card .pullman-popup__link:hover{gap:9px;color:#445047}' +
    '.pullman-popup__price{font-family:var(--font-sans,sans-serif);font-size:15px;font-weight:700;color:#445047;line-height:1;margin:0}' +
    '.pullman-popup__price span{font-size:10.5px;font-weight:400;color:rgba(68,80,71,.78)}' +
    // Sans dates, on dit pourquoi il n'y a pas de prix plutôt que de laisser un vide
    '.pullman-popup__nodate{font-family:var(--font-sans,sans-serif);font-size:11px;color:rgba(68,80,71,.78)}' +
    // Bouton plein plutôt que lien : c'est la paire du CTA primaire (fond #5FEF91,
    // texte #445047), la seule façon d'employer le vert de marque sur fond blanc.
    // Sélecteur à 2 classes : Leaflet impose « .leaflet-container a { color:#0078A8 } »
    // en (0,1,1), qui battait une classe seule — le CTA ressortait en bleu Leaflet.
    '.pullman-popup-card .pullman-popup__cta{display:inline-flex;align-items:center;justify-content:center;padding:7px 16px;border:1px solid #445047;border-radius:100px;background:transparent;font-family:var(--font-sans,sans-serif);font-size:11px;font-weight:500;color:#445047;text-decoration:none;transition:background .15s,color .15s;white-space:nowrap}' +
    '.pullman-popup-card .pullman-popup__cta:hover{background:#445047;color:#fff}' +
    // Fermeture : elle est posée sur la photo, donc aucune couleur de texte seule ne peut
    // être fiable — selon le cliché elle disparaît. On lui donne un voile sombre, comme
    // le badge. Sélecteur à 3 classes : Leaflet applique « .leaflet-container
    // a.leaflet-popup-close-button » en (0,2,1), qui l'emportait et la laissait en gris
    // Tahoma sur fond transparent.
    // La croix est un tracé SVG, pas le caractère « × » : ce glyphe s'aligne sur l'axe
    // mathématique de la police et tombait 1,7px sous le centre du cercle. Un tracé est
    // centré par construction, et ne dépend pas des métriques de la police.
    '.leaflet-container .pullman-popup-card a.leaflet-popup-close-button{' +
      'top:8px;right:8px;width:26px;height:26px;padding:0;border-radius:100px;font-size:0;' +
      'background-color:rgba(0,0,0,.55);' +
      'background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 12 12%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-width=%271.8%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M3 3 L9 9 M9 3 L3 9%27/%3E%3C/svg%3E");' +
      'background-repeat:no-repeat;background-position:center;background-size:11px 11px;' +
      'transition:background-color .15s}' +
    '.leaflet-container .pullman-popup-card a.leaflet-popup-close-button:hover{background-color:rgba(0,0,0,.8)}' +
    '.leaflet-container .pullman-popup-card a.leaflet-popup-close-button:focus-visible{outline:2px solid #fff;outline-offset:2px}';
  document.head.appendChild(style);
}

// Libellés des critères, pour nommer en clair ce qui a fait correspondre l'hôtel.
const WD_CRITERIA_LABELS = {
  pool: 'Piscine', spa: 'Spa', gym: 'Salle de sport', beach: 'Bord de mer',
  breakfast: 'Petit-déjeuner', restaurant: 'Restaurant', bar: 'Bar',
  center: 'Centre-ville', parking: 'Parking', pets: 'Animaux acceptés',
  family: 'Famille', meeting: 'Salles de réunion'
};

// Encart hôtel, partagé par la carte du dropdown et celle de la page de résultats.
// Un seul encart pour les deux : c'est la même information, elle doit se présenter
// de la même façon. `active` (Set ou tableau) liste les critères cochés : on n'affiche
// que ceux-là, pour répondre à « pourquoi cet hôtel apparaît-il ? ».
// showPrice est faux par défaut : un tarif n'a de sens qu'une fois les dates et
// l'occupation connues. Sur la carte d'exploration (dropdown), on n'en affiche jamais.
// `stay` porte le séjour recherché ({checkin, nights, guests}) : il alimente le lien de
// réservation ALL pour que l'utilisateur n'ait pas à ressaisir ses dates.
function wdHotelPopupHTML(h, active, showPrice, stay) {
  // La page de résultats construit sa carte elle-même et ne passe jamais par
  // initBookingMap() : sans cet appel, l'encart y serait affiché sans ses styles.
  _addStyle();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const base = window.WD_IMG_BASE || 'https://m.ahstatic.com/is/image/accorhotels/';
  const key = window.WD_IMG_KEY ? window.WD_IMG_KEY(h) : (h.img || 'aja_p_6783-26').split(':')[0];
  // Largeur seule : imposer « hei » fait combler le cadre de blanc par le serveur quand
  // la photo est en portrait. Le recadrage 16:9 est fait par .pullman-popup__media.
  const img = base + key + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=528';
  // Toutes les photos de l'hôtel, la principale en tête. Un seul visuel donnait une card
  // muette sur ce qu'on vient voir : l'établissement.
  const cles = window.WD_IMG_KEYS ? window.WD_IMG_KEYS(h) : [key];
  const photos = cles.map(k => base + k + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=528');
  const pin = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const arrow = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  const check = '<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5 4.8 9 10 3.5"/></svg>';

  // Tous les services de l'hôtel, pas seulement ceux qu'on a filtrés : la card dit ce
  // qu'il offre. Ceux que l'utilisateur a cochés passent en vert et en tête, marqués
  // d'une coche — on voit d'un coup ce qui répond à sa demande et ce qu'il y a en plus.
  const ids = active ? [...active] : [];
  const services = (h.amenities || []).filter(id => WD_CRITERIA_LABELS[id]);
  const retenus = services.filter(id => ids.includes(id));
  const autres = services.filter(id => !ids.includes(id));
  // Les services cochés passent devant, mais le plafond vaut pour eux aussi : le laisser
  // céder quand ils étaient nombreux (huit critères cochés) donnait trois rangées de
  // badges, et il fallait faire défiler la card pour atteindre le prix et les boutons.
  // Le surplus est annoncé par un « +N », qui les liste au survol.
  const ordonnes = retenus.concat(autres);
  const visibles = ordonnes.slice(0, WD_TAGS_MAX);
  const restants = ordonnes.length - visibles.length;
  const tags = visibles.map(id =>
      ids.includes(id)
        ? '<span class="pullman-popup__tag pullman-popup__tag--match">' + check + esc(WD_CRITERIA_LABELS[id]) + '</span>'
        : '<span class="pullman-popup__tag">' + esc(WD_CRITERIA_LABELS[id]) + '</span>')
    .concat(restants > 0
      ? ['<span class="pullman-popup__tag pullman-popup__tag--plus" title="' + esc(ordonnes.slice(visibles.length).map(i => WD_CRITERIA_LABELS[i]).join(', ')) + '">+' + restants + '</span>']
      : [])
    .join('');

  // Onglet Restaurants : la card présente les tables de l'hôtel, et non ses services.
  // Une seule mise en avant depuis que la photo est revenue en 21:9 : elle prend 42 px,
  // et une rangée de table en coûte 43. Mesure faite, deux rangées réclamaient 20 px de
  // défilement. Le reste est annoncé, jamais escamoté, et la liste entière est à un clic
  // sur la page de résultats.
  // Onglet Réunions : la card présente les espaces de l'hôtel — les deux plus grands,
  // avec leur surface et ce qu'ils accueillent en théâtre. Le reste est annoncé.
  let tables = '';
  const surReunions = _surReunions();
  if (surReunions) {
    const r = _reunionDe(h.name);
    if (r) {
      // Uniquement les visuels des espaces, sans compléter avec ceux de l'hôtel : sur une
      // card de réunion, une chambre ou un lobby en deuxième vignette dit autre chose que
      // ce qu'on est venu voir. Les deux hôtels qui n'en publient pas gardent le visuel de
      // l'hôtel, faute de mieux.
      const cles = (r.imgs || []).filter(Boolean).slice(0, 4);
      if (cles.length) {
        photos.length = 0;
        cles.forEach(k => photos.push(base + k + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=528'));
      }
      // Les salles sont triées par surface : la plus grande dit le mieux ce que le lieu
      // permet. À égalité, on garde l'ordre publié par Pullman.
      const rangees = (r.salles || []).slice().sort((a, b2) => (b2[1] || 0) - (a[1] || 0));
      // Une seule, comme les cards restaurants : la hauteur réservée est la même, et les
      // noms de salles sont longs — « MONTAIGNE AB / ROHAN ABC » tient rarement sur une
      // ligne. À deux, mesure faite, 99 cards sur 110 réclamaient de faire défiler.
      const vus = rangees.slice(0, 1);
      const reste = rangees.length - vus.length;
      tables = '<div class="pullman-popup__tables">' +
        vus.map(sa => {
          const bouts = [];
          if (sa[1]) bouts.push(sa[1] + ' m²');
          if (sa[3]) bouts.push('jusqu\u2019à ' + sa[3] + ' en théâtre');
          else if (sa[7]) bouts.push('jusqu\u2019à ' + sa[7] + ' en banquet');
          return '<div class="pullman-popup__table">' +
            '<span class="pullman-popup__table-nom">' + esc(sa[0]) + '</span>' +
            '<span class="pullman-popup__table-type">' + esc(bouts.join(' · ') || 'capacité non publiée') + '</span>' +
          '</div>';
        }).join('') +
        (reste > 0 ? '<p class="pullman-popup__tables-reste">et ' + reste + ' autre' + (reste > 1 ? 's' : '') + ' salle' + (reste > 1 ? 's' : '') + '</p>' : '') +
      '</div>';
    } else {
      tables = '<div class="pullman-popup__tables"><p class="pullman-popup__tables-reste">' +
        'Aucun espace ne répond à vos critères.</p></div>';
    }
  }

  const surRestos = _surRestos();
  if (surRestos) {
    const lieux = _lieuxDe(h.name);
    // La card montre les tables : ce sont leurs photos qu'on met en tête, celles de
    // l'hôtel derrière. Sans cela on présentait un lobby pour parler d'un rooftop.
    const clesTables = lieux.map(v => v.img).filter(Boolean);
    if (clesTables.length) {
      const melange = clesTables.concat(cles.filter(k => clesTables.indexOf(k) < 0)).slice(0, 4);
      photos.length = 0;
      melange.forEach(k => photos.push(base + k + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=528'));
    }
    // Le qualificatif d'un lieu : sa cuisine si elle est déclarée, son cadre sinon.
    // Les bars n'ont jamais de cuisine renseignée chez Accor.
    const qualifie = (v, n) => [v.type === 'bar' ? 'Bar' : 'Restaurant']
      .concat(v.cuisines.concat(v.tags).slice(0, n).map(_libelleResto)).join(' · ');
    // « 3 restaurants · 2 bars » plutôt qu'un nom collectif. Aucun ne convenait : « table »
    // ne couvre pas un bar de piscine, et Pullman lui-même titre « Restaurants et vie
    // nocturne ». Compter par type dit la composition sans avoir à déplier.
    const composition = (liste) => {
      const r = liste.filter(v => v.type !== 'bar').length, b = liste.length - r;
      return [r ? r + ' restaurant' + (r > 1 ? 's' : '') : null,
              b ? b + ' bar' + (b > 1 ? 's' : '') : null].filter(Boolean).join(' · ');
    };
    // Chaque lieu retrouve sa photo dans la galerie : c'est la récompense du clic, et
    // ce qui manquait à une liste qui ne dit que des noms.
    const indexPhoto = (v) => {
      if (!v.img) return -1;
      const i = photos.findIndex(u => u.indexOf(v.img) >= 0);
      return i;
    };
    const premier = lieux[0];
    const autres = lieux.slice(1);
    tables = '<div class="pullman-popup__tables">' +
      (lieux.length
        ? '<div class="pullman-popup__table" data-lieu-vitrine>' +
            (premier.url
              ? '<a class="pullman-popup__table-nom" href="' + esc(premier.url) + '" target="_blank" rel="noopener">' + esc(premier.nom) + '</a>'
              : '<span class="pullman-popup__table-nom">' + esc(premier.nom) + '</span>') +
            '<span class="pullman-popup__table-type">' + esc(qualifie(premier, 2)) + '</span>' +
          '</div>' +
          (autres.length
            ? '<button type="button" class="pullman-popup__tables-reste" data-lieux-deplier>et ' + esc(composition(autres)) + '</button>'
            : '')
        : '<p class="pullman-popup__tables-reste">Aucun restaurant ni bar ne répond à vos critères.</p>') +
    '</div>' +
    // L'état déplié : pas de photo, une ligne par lieu, deux colonnes. C'est ce qui
    // permet d'en montrer sept sans jamais faire défiler la card.
    (lieux.length > 1
      ? '<div class="pullman-popup__lieux" hidden>' +
          '<div class="pullman-popup__lieux-liste">' +
            lieux.map((v, i) =>
              '<button type="button" class="pullman-popup__lieu" data-lieu="' + i + '" data-lieu-photo="' + indexPhoto(v) + '">' +
                '<span class="pullman-popup__lieu-nom">' + esc(v.nom) + '</span>' +
                '<span class="pullman-popup__lieu-type">' + esc(qualifie(v, 1)) + '</span>' +
              '</button>').join('') +
          '</div>' +
          '<div class="pullman-popup__lieux-pied">' +
            '<button type="button" class="pullman-popup__lieux-retour" data-lieux-replier>Revenir</button>' +
            '<a class="pullman-popup__link" href="search-results.html?tab=restaurants&hotel=' + encodeURIComponent(h.name) + '">Voir dans la liste</a>' +
          '</div>' +
        '</div>'
      : '');
  }

  // Deux destinations distinctes : la fiche hôtel sur le site de marque, et la
  // réservation sur ALL. Sans href on n'affiche aucun lien plutôt qu'un lien mort.
  const bookUrl = window.WD_ALL_BOOKING_URL ? window.WD_ALL_BOOKING_URL(h, stay) : null;
  // « Réserver » en dernier, donc à droite : l'action principale occupe la position
  // terminale du regard, et le lien de consultation la précède.
  // Sur l'onglet Restaurants, une seule sortie : la fiche de l'hôtel qui héberge la table.
  // En lien et non en pilule : les noms des tables sont déjà des liens, et la pilule
  // coûtait 23 px de haut qui manquaient à la photo.
  const ctaResto = h.href
    ? '<div class="pullman-popup__actions">' +
        '<a class="pullman-popup__link" href="' + esc(h.href) + '" target="_blank" rel="noopener">Voir l\u2019hôtel ' + arrow + '</a>' +
      '</div>'
    : '';
  const cta = h.href
    ? '<div class="pullman-popup__actions">' +
        '<a class="pullman-popup__link" href="' + esc(h.href) + '" target="_blank" rel="noopener">Voir l’hôtel ' + arrow + '</a>' +
        (bookUrl ? '<a class="pullman-popup__cta" href="' + esc(bookUrl) + '" target="_blank" rel="noopener">Réserver</a>' : '') +
      '</div>'
    : '';

  return '<article class="pullman-popup' + ((surRestos || surReunions) ? ' pullman-popup--restos' : '') + '">' +
    '<div class="pullman-popup__media"' + (photos.length > 1 ? ' data-galerie' : '') + '>' +
      photos.map((u, i) =>
        // Seule la première est chargée d'emblée : les suivantes ne servent qu'à qui
        // fait défiler, et la card s'ouvre au clic sur un pin — on ne fait pas payer
        // trois photos à chaque ouverture.
        '<img class="pullman-popup__img" src="' + u + '" alt="' + esc(h.name) + '"' +
        (i === 0 ? ' data-on' : '') + (i === 0 ? '' : ' loading="lazy"') + '/>').join('') +
      (photos.length > 1
        ? '<button type="button" class="pullman-popup__nav pullman-popup__nav--prev" data-photo="-1" aria-label="Photo précédente"></button>' +
          '<button type="button" class="pullman-popup__nav pullman-popup__nav--next" data-photo="1" aria-label="Photo suivante"></button>' +
          '<div class="pullman-popup__points">' +
            photos.map((u, i) => '<button type="button" class="pullman-popup__point" data-point="' + i + '"' +
              (i === 0 ? ' data-on' : '') + ' aria-label="Photo ' + (i + 1) + ' sur ' + photos.length + '"></button>').join('') +
          '</div>'
        : '') +
      (h.badge ? '<span class="pullman-popup__badge">' + esc(h.badge) + '</span>' : '') +
    '</div>' +
    '<div class="pullman-popup__body">' +
      '<h3 class="pullman-popup__name">' + (h.href
        ? '<a href="' + esc(h.href) + '" target="_blank" rel="noopener">' + esc(h.name) + '</a>'
        : esc(h.name)) + '</h3>' +
      // Lieu et note sur une seule ligne : même registre (identité de l'hôtel), et
      // l'encart gagne une rangée sur une carte où la place est comptée.
      '<p class="pullman-popup__location">' + pin +
        '<span>' + esc(h.city || '') + (h.country ? ', ' + esc(h.country) : '') + '</span>' +
        (h.rating ? '<span class="pullman-popup__score">' + esc(h.rating) + '</span>' : '') +
      '</p>' +
      ((surRestos || surReunions) ? tables : (tags ? '<div class="pullman-popup__tags">' + tags + '</div>' : '')) +
      // Pied de card : un prix par nuit n'a rien à faire là quand on cherche une table,
      // ni un bouton de réservation de chambre. Reste le lien vers l'hôtel, qui situe.
      '<div class="pullman-popup__foot">' +
        ((surRestos || surReunions)
          ? ''
          : (showPrice && h.price
              ? '<p class="pullman-popup__price">' + esc(h.price) + ' € <span>/ nuit</span></p>'
              : '<span class="pullman-popup__nodate">Tarifs selon vos dates</span>')) +
        ((surRestos || surReunions) ? ctaResto : cta) + '</div>' +
    '</div>' +
  '</article>';
}
window.wdHotelPopupHTML = wdHotelPopupHTML;

// ── Panneau de détail latéral (carte du dropdown) ────────────────────────────────
// Largeur du panneau, reprise telle quelle par le décalage de centrage.
const WD_DETAIL_W = 288;
// Zoom au clic sur un hôtel. À 11 on tombait dans le quartier, sans repère : on ne
// savait plus où l'on se trouvait dans le pays. À 6 la forme du pays reste lisible et
// le pin s'y situe.
const WD_ZOOM_HOTEL = 6;
// En dessous de ce zoom, les hôtels d'une même ville ne font qu'un pin. Au-dessus, ils se
// séparent : à 6 on voit la forme du pays, c'est assez fin pour les distinguer.
const WD_ZOOM_VILLES = 6;
// Nombre de services affichés dans l'encart. Au-delà, un « +N » prend le relais.
// 3 et non 4 : avec le « +N », quatre badges débordaient sur une seconde ligne, et
// c'est cette ligne supplémentaire qui obligeait à faire défiler le panneau.
const WD_TAGS_MAX = 3;

// Signale qu'un message d'écartement occupe la carte. Le bloc « aucun résultat » de la
// vue carte s'efface alors : il dit la même chose, au même instant, et les deux se
// superposaient. Il reprend sa place dès que l'avis s'en va.
// `revenir` : refaire le chemin inverse, du pin vers la vue du continent. On ne le fait
// qu'à la fermeture volontaire — pas quand les pins sont recalculés, puisque le cadrage
// est alors déjà refait par _renderMarkers.
function _fermerDetail(revenir) {
  const p = document.getElementById('wd-map-detail');
  const etaitOuvert = p && p.dataset.state === 'open';
  if (p) { p.dataset.state = 'closed'; p.innerHTML = ''; }
  _detailHotel = null;
  clearTimeout(_avisTimer);
  _markers.forEach(m => m._icon && m._icon.classList.remove('pullman-map-marker--selected'));
  // Refermer rend la ville : le champ ne doit pas rester sur un hôtel qu'on ne regarde
  // plus. Seulement à la fermeture voulue — un recalcul des pins n'est pas un abandon.
  if (revenir && typeof window.WD_OUBLIER_HOTEL === 'function') window.WD_OUBLIER_HOTEL();
  if (revenir && etaitOuvert) {
    // On rend la vue telle qu'elle était avant l'ouverture : la ville si l'on s'y était
    // approché, le continent si l'on venait de là. Y revenir toujours par le continent
    // faisait perdre le cadrage qu'on venait d'obtenir.
    if (_vueAvantDetail) _bookingMap.flyTo(_vueAvantDetail.centre, _vueAvantDetail.zoom, { duration: .7 });
    else _vueContinent(true);
    // Oubliée seulement à la fermeture voulue. Un recalcul des pins passe aussi par ici,
    // avec `revenir` à faux, et effaçait la vue mémorisée avant qu'on s'en serve : le
    // retour se faisait alors sur la zone courante au lieu de l'endroit d'où l'on venait.
    _vueAvantDetail = null;
  }
}

// Conteneur du panneau, créé une fois. Détail et message le partagent : ils occupent la
// même place et doivent tous deux être isolés des événements de la carte.
function _panneauDetail() {
  const conteneur = document.getElementById('wd-booking-map');
  if (!conteneur || !_bookingMap) return null;
  let p = document.getElementById('wd-map-detail');
  if (p) return p;
  p = document.createElement('aside');
  p.id = 'wd-map-detail';
  // On reprend la classe que Leaflet posait sur ses bulles : tous les styles de l'encart
  // y sont accrochés (.pullman-popup-card .pullman-popup__cta, etc.). Sans elle, le
  // panneau perdait les CTA et retombait sur les liens bleus de Leaflet.
  p.className = 'wd-map-detail pullman-popup-card';
  p.setAttribute('role', 'dialog');
  p.setAttribute('aria-label', 'Détail de l’hôtel');
  conteneur.appendChild(p);
  // Le panneau vit DANS le conteneur de la carte : sans cela, tout clic dedans remonte
  // jusqu'à Leaflet, qui le prend pour un clic sur la carte et referme le panneau.
  L.DomEvent.disableClickPropagation(p);
  L.DomEvent.disableScrollPropagation(p);
  p.addEventListener('click', (e) => {
    if (e.target.closest('[data-detail-close]')) { e.preventDefault(); _fermerDetail(true); return; }
    // Rattrapage porté par le message : on appelle la liste, seule à savoir décocher un
    // critère et rejouer les deux vues. Le clic ne peut pas remonter jusqu'à elle depuis
    // le conteneur Leaflet, d'où l'appel direct.
    const relax = e.target.closest('[data-avis-relax]');
    if (relax) {
      e.preventDefault();
      if (typeof window.WD_RETIRER_CRITERE === 'function') window.WD_RETIRER_CRITERE(relax.dataset.avisRelax);
      return;
    }
    if (e.target.closest('[data-avis-reset]')) {
      e.preventDefault();
      if (typeof window.WD_REINITIALISER_CRITERES === 'function') window.WD_REINITIALISER_CRITERES();
    }
  });
  return p;
}

// Sommes-nous sur l'onglet Restaurants ? La carte y montre les mêmes pins — un lieu de
// restauration n'a pas d'adresse propre, il est à l'hôtel — mais ce qu'elle met en avant
// et ce qu'elle raconte dans sa card changent.
function _surRestos() {
  return typeof window.WD_ONGLET === 'function' && window.WD_ONGLET() === 'restaurants';
}
function _surReunions() {
  return typeof window.WD_ONGLET === 'function' && window.WD_ONGLET() === 'reunions';
}
// Espaces de réunion d'un hôtel, tels que la liste les retient.
function _reunionDe(nomHotel) {
  const r = typeof window.WD_REUNION_HOTEL === 'function' ? (window.WD_REUNION_HOTEL(nomHotel) || []) : [];
  return r.length ? r[0] : null;
}
// Les tables d'un hôtel qui répondent aux critères cochés. Le calcul est fait par la
// liste, seule à connaître la sémantique de ses filtres.
function _lieuxDe(nomHotel) {
  return typeof window.WD_LIEUX_HOTEL === 'function' ? (window.WD_LIEUX_HOTEL(nomHotel) || []) : [];
}
// Libellés des critères de restauration, repris du vocabulaire de la liste plutôt que
// redéclarés : un libellé qui diverge est un libellé qui vieillit mal.
function _libelleResto(id) {
  const groupes = window.WD_RESTO_CRITERIA || [];
  for (const g of groupes) {
    const it = g.items.find(x => x.id === id);
    if (it) return it.label;
  }
  return id;
}

// Critères que l'hôtel ne satisfait pas. Les critères sans service associé sont écartés
// du calcul, exactement comme le fait la vue liste : « Centre-ville » n'a pas
// d'équivalent dans les données, le cocher grisait donc tous les pins de la carte
// pendant que la liste, elle, continuait d'afficher tout le catalogue.
function _criteresManquants(hotel, criteriaSet) {
  if (!criteriaSet || !criteriaSet.size) return [];
  const ignores = window.WD_CRITERIA_SANS_SERVICE || [];
  return [...criteriaSet].filter(c => !ignores.includes(c) && !(hotel.amenities || []).includes(c));
}

// Marque le pin de l'hôtel ouvert. Les marqueurs sont détruits et recréés à chaque
// recalcul, donc la classe doit être reposée à ce moment-là.
function _marquerPin(hotel) {
  _markers.forEach(m => m._icon && m._icon.classList.remove('pullman-map-marker--selected'));
  const mk = _markers.find(m => {
    const ll = m.getLatLng();
    return Math.abs(ll.lat - hotel.lat) < 1e-9 && Math.abs(ll.lng - hotel.lng) < 1e-9;
  });
  if (mk && mk._icon) mk._icon.classList.add('pullman-map-marker--selected');
}

// Le français ne dit pas « en » devant tout : « au Japon », « aux Pays-Bas »,
// « à Singapour », « au Moyen-Orient ». On ne liste que les exceptions, « en » couvrant
// le reste — pays féminins et pays à initiale vocalique.
const WD_ZONE_PREP = {
  Japon: 'au', Brésil: 'au', Maroc: 'au', Qatar: 'au', Vietnam: 'au', Sénégal: 'au',
  Laos: 'au', Chili: 'au', Pérou: 'au', Kenya: 'au', 'Royaume-Uni': 'au',
  'Moyen-Orient': 'au',
  'Pays-Bas': 'aux', 'États-Unis': 'aux', Maldives: 'aux', EAU: 'aux', Amériques: 'aux',
  Singapour: 'à',
};

// « en Chine », « au Japon » — la mention de lieu telle qu'elle s'insère dans une phrase.
function _enZone(scope) {
  const nom = _libelleZone(scope);
  if (!nom) return null;
  // Une ville ne prend pas d'article : « à Shanghai », jamais « en Shanghai ».
  const prep = (scope && scope.city) ? 'à' : (WD_ZONE_PREP[nom] || 'en');
  return prep + ' ' + nom;
}

// Destination d'un élargissement, toujours un continent : « à l'Asie », « aux Amériques ».
const WD_VERS_CONTINENT = {
  Europe: "à l'Europe", Asie: "à l'Asie", Afrique: "à l'Afrique",
  'Océanie': "à l'Océanie", 'Amériques': 'aux Amériques', 'Moyen-Orient': 'au Moyen-Orient',
};

function _libelleZone(scope) {
  const s = scope || {};
  if (s.city) return s.city;
  if (s.country) return s.country;
  if (s.continent && window.WD_SEARCH_DATA) {
    return ((WD_SEARCH_DATA.regions || []).find(r => r.id === s.continent) || {}).label || null;
  }
  return null;
}

// Combien d'hôtels d'une zone satisfont les critères cochés.
function _conformes(scope, criteriaSet) {
  // Sur l'onglet Restaurants on compte des tables, pas des hôtels : un même établissement
  // peut en avoir trois qui répondent, et annoncer « 1 hôtel » n'aurait aucun sens pour
  // qui cherche où manger.
  if (_surRestos() && typeof window.WD_TABLES_ZONE === 'function') {
    const s = scope || {};
    return window.WD_TABLES_ZONE(s.continent, s.country);
  }
  // Sur l'onglet Réunions, on compte les hôtels dont les espaces répondent. Les tester
  // sur leurs services donnait zéro partout — aucun hôtel ne déclare « 100 à 300
  // personnes » comme un équipement — et la carte annonçait qu'aucun ne convenait alors
  // qu'elle en montrait de verts.
  if (_surReunions()) {
    return PULLMAN_HOTELS_MAP.filter(h => _dansLaZone(h, scope) && _reunionDe(h.name) !== null).length;
  }
  return PULLMAN_HOTELS_MAP.filter(h =>
    _dansLaZone(h, scope) && _criteresManquants(h, criteriaSet).length === 0).length;
}

// Le mot qui nomme ce qu'on compte. La liste le décide — « restaurants et bars », ou
// « bars » seuls quand le type est coché ; ailleurs, ce sont des hôtels.
function _motCompte(n) {
  if (_surRestos() && typeof window.WD_MOT_LIEUX === 'function') return window.WD_MOT_LIEUX(n);
  return 'hôtel' + (n > 1 ? 's' : '');
}

// Peinture du panneau d'avis. Les deux messages de la carte — celui qui écarte l'hôtel
// ouvert et celui du rattrapage général — passent par ici : la carte ne doit avoir qu'une
// seule façon de parler, et elle remplace le bloc en surimpression qui existait à côté.
// `reprise` : suggestion d'assouplissement ; sa présence fait apparaître les actions.
function _peindreAvis(titreHTML, suiteHTML, reprise) {
  const p = _panneauDetail();
  if (!p) return null;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const actions = reprise !== null
    ? '<div class="wd-map-detail__avis-actions">' +
        (reprise ? '<button type="button" class="wd-map-detail__avis-relax" data-avis-relax="' + esc(reprise.id) + '">Retirer « ' + esc(reprise.label) + ' »</button>' : '') +
        '<button type="button" class="wd-map-detail__avis-reset" data-avis-reset>Réinitialiser les critères</button>' +
      '</div>'
    : '';
  p.className = 'wd-map-detail wd-map-detail--avis';
  p.innerHTML =
    '<button type="button" class="wd-map-detail__close" data-detail-close aria-label="Fermer"></button>' +
    '<div class="wd-map-detail__avis" role="status">' +
      '<p class="wd-map-detail__avis-titre">' + titreHTML + '</p>' +
      '<p class="wd-map-detail__avis-suite">' + suiteHTML + '</p>' +
      actions +
    '</div>';
  p.dataset.state = 'open';
  return p;
}

// Rattrapage général : plus aucun hôtel ne répond, et aucune card n'était ouverte pour
// porter le message. Même panneau, au même endroit — c'est ce qui remplace le bloc vert
// qui s'affichait en surimpression au centre de la carte.
function _avisRattrapage(criteriaSet) {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // On compte dans la zone géographique, jamais dans « l'hôtel ouvert » : celui-ci la
  // réduirait à un établissement et tout compte y vaudrait zéro ou un.
  const geo = { continent: _currentScope.continent, country: _currentScope.country, city: _currentScope.city };
  const zone = _enZone(geo);
  const reprise = typeof window.WD_ASSOUPLISSEMENT === 'function' ? window.WD_ASSOUPLISSEMENT() : null;
  const quoi = _surRestos() ? 'Aucun restaurant ni bar' : 'Aucun hôtel';
  let suite = quoi + (zone ? ' ' + esc(zone) : '') + ' ne réunit ces critères.';
  if (reprise) {
    const pluriel = reprise.count > 1;
    suite += ' En retirant <strong>« ' + esc(reprise.label) + ' »</strong>, <strong>' +
      reprise.count + ' ' + _motCompte(reprise.count) + '</strong> correspondrai' + (pluriel ? 'ent' : 't') +
      (pluriel ? '' : ' : <strong>' + esc(reprise.hotel.name) + '</strong>') + '.';
  } else {
    suite += ' Aucun de vos critères ne peut être assoupli pour trouver ' +
      (_surRestos() ? 'un restaurant ni un bar' : 'un hôtel') + ' ici.';
  }
  clearTimeout(_avisTimer);
  _peindreAvis(_surRestos() ? 'Aucun restaurant ni bar ne correspond à tous vos critères'
                            : 'Aucun hôtel ne correspond à tous vos critères', suite, reprise);
}

// Message affiché quand un critère vient d'écarter l'hôtel ouvert. Il nomme l'hôtel et
// ce qui lui manque, puis situe ce qui reste dans la zone choisie — et, quand cette zone
// est vide, donne la sortie : retirer un critère, ou remonter au continent.
function _messageDetail(hotel, manquants, criteriaSet) {
  const p = _panneauDetail();
  if (!p) return;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Les libellés sont des noms de critères (« Animaux acceptés », « Salles de réunion ») :
  // on les cite entre guillemets plutôt que de les coudre dans la phrase, où ils se
  // liraient mal — « ne propose pas Animaux acceptés ».
  const libelles = manquants.map(id => '« ' + esc(WD_CRITERIA_LABELS[id] || id) + ' »');
  const quoi = libelles.length > 1
    ? 'ne répond pas aux critères ' + libelles.slice(0, -1).join(', ') + ' et ' + libelles[libelles.length - 1]
    : 'ne répond pas au critère ' + libelles[0];
  // On nomme la zone : le compte porte sur elle, alors que des pins verts d'ailleurs
  // restent visibles en arrière-plan. Sans cette précision, le chiffre annoncé
  // semblerait contredire ce qu'on voit. La zone est celle que l'utilisateur a choisie —
  // « Chine » et non « Asie » : lui répondre à l'échelle du continent reviendrait à
  // compter des hôtels qu'il a lui-même écartés.
  const geo = { continent: _currentScope.continent, country: _currentScope.country };
  const zone = _enZone(geo);
  const dansZone = _conformes(geo, criteriaSet);
  // Y a-t-il un cran au-dessus ? Seulement si la zone est plus étroite que le continent.
  const large = (geo.country || geo.city) && geo.continent ? { continent: geo.continent } : null;
  const dansLarge = large ? _conformes(large, criteriaSet) : 0;

  let suite;
  // Suggestion de rattrapage, quand il n'y a plus rien à montrer nulle part.
  let reprise = null;
  // Zone de repli : la carte y remonte d'elle-même quand la zone choisie est vide mais
  // que le continent, lui, a des réponses. Sans ce mouvement le message annonçait des
  // hôtels que la carte laissait hors cadre et en gris — on lisait « 3 hôtels en Asie »
  // devant une Chine entièrement grise.
  const elargir = dansZone === 0 && dansLarge > 0 ? large : null;

  // « Aucun restaurant ni bar » sur l'onglet Restaurants : on ne cherche pas un hôtel.
  const rien = _surRestos() ? 'Aucun restaurant ni bar' : 'Aucun hôtel';
  if (dansZone > 0) {
    suite = '<strong>' + dansZone + ' ' + _motCompte(dansZone) + '</strong>' +
      (zone ? ' ' + esc(zone) : '') + ' y répond' + (dansZone > 1 ? 'ent' : '') + '.';
  } else if (elargir) {
    const nomLarge = _libelleZone(large);
    suite = rien + (zone ? ' ' + esc(zone) : '') + ' ne réunit ces critères. ' +
      'La carte s\'élargit ' + esc(WD_VERS_CONTINENT[nomLarge] || 'à ' + nomLarge) +
      ', où <strong>' + dansLarge + ' ' + _motCompte(dansLarge) + '</strong> ' +
      (dansLarge > 1 ? 'répondent' : 'répond') + ' à vos critères.';
  } else {
    // Plus rien nulle part : ce message n'est plus une notification, c'est le rattrapage.
    // Il en reprend donc la phrase et les boutons, et le bloc vert ne prend pas le relais
    // derrière lui — les deux se succédaient à l'écran en disant la même chose.
    reprise = typeof window.WD_ASSOUPLISSEMENT === 'function' ? window.WD_ASSOUPLISSEMENT() : null;
    suite = rien + (zone ? ' ' + esc(zone) : '') +
      (large ? ' ni ' + esc(_enZone(large)) : '') + ' ne réunit ces critères.';
    if (reprise) {
      const pluriel = reprise.count > 1;
      suite += ' En retirant <strong>« ' + esc(reprise.label) + ' »</strong>, <strong>' +
        reprise.count + ' ' + _motCompte(reprise.count) + '</strong> correspondrai' +
        (pluriel ? 'ent' : 't') +
        (pluriel ? '' : ' : <strong>' + esc(reprise.hotel.name) + '</strong>') + '.';
    } else {
      suite += ' Aucun de vos critères ne peut être assoupli pour trouver ' +
        (_surRestos() ? 'un restaurant ni un bar' : 'un hôtel') + ' ici.';
    }
  }

  // L'élargissement précède l'affichage : reconstruire les pins commence par vider le
  // panneau, ce qui effacerait un message déjà posé. On remet `_detailHotel` à zéro
  // avant, pour que ce passage ne se croie pas devant un hôtel encore ouvert.
  _detailHotel = null;
  if (elargir) {
    // La liste adopte la même zone et nous rend la sienne : les chips, le compteur et la
    // carte doivent raconter la même chose une fois le mouvement terminé.
    const adoptee = typeof window.WD_ELARGIR_AU_CONTINENT === 'function'
      ? window.WD_ELARGIR_AU_CONTINENT() : null;
    _currentScope = adoptee || { continent: large.continent, country: null, city: null, hotel: null };
    // `false` : on ne recadre pas ici, le vol animé de fin s'en charge.
    _renderMarkers(_currentContinent, criteriaSet, false);
  }

  // Le rattrapage n'apparaît que dans le cas sans issue : ailleurs, la carte a de quoi
  // montrer et le message n'a qu'à informer.
  const porteLeRattrapage = dansZone === 0 && !elargir;
  const titre = _surRestos()
    // On ne dit pas « l'hôtel ne répond pas au critère » : ce sont ses lieux qui ne
    // répondent pas, et le critère coché est une cuisine ou un cadre, pas un service.
    ? 'Aucun restaurant ni bar du ' + esc(hotel.name) + ' ne répond à vos critères'
    : _surReunions()
      // Idem pour les réunions : ce sont ses espaces. Et il n'y a pas de « critère
      // manquant » à nommer — une capacité n'est pas un service absent — d'où le
      // « critère undefined » que produisait la formulation des hôtels.
      ? 'Les espaces du ' + esc(hotel.name) + ' ne répondent pas à vos critères'
      : esc(hotel.name) + ' ' + quoi;
  _peindreAvis(titre, suite, porteLeRattrapage ? reprise : null);
  clearTimeout(_avisTimer);
  // Un message qui informe s'efface après lecture. Un message qui porte les boutons de
  // rattrapage reste : le faire disparaître seul emporterait la seule sortie offerte.
  if (!porteLeRattrapage) {
    _avisTimer = setTimeout(() => {
      const el = document.getElementById('wd-map-detail');
      if (el && el.classList.contains('wd-map-detail--avis')) { el.dataset.state = 'closed'; el.innerHTML = ''; }
    }, 6000);
  }
  // On recadre sur la zone géographique et non sur `_currentScope` tel quel : celui-ci
  // peut encore désigner l'hôtel qu'on vient justement d'écarter, et on repartirait
  // alors sur lui. Après élargissement, c'est le continent qu'on cadre.
  _vueContinent(true, elargir || geo);
}

// `sansVol` : rafraîchir le contenu sans redéplacer la carte. Sert au réaffichage après
// un changement de filtres — on met à jour les critères satisfaits, sans bouger la vue
// que l'utilisateur est en train de regarder.
function _ouvrirDetail(hotel, criteriaSet, sansVol) {
  const p = _panneauDetail();
  if (!p) return;
  _detailHotel = hotel;
  clearTimeout(_avisTimer);
  p.className = 'wd-map-detail pullman-popup-card';
  p.innerHTML =
    '<button type="button" class="wd-map-detail__close" data-detail-close aria-label="Fermer"></button>' +
    '<div class="wd-map-detail__scroll">' + wdHotelPopupHTML(hotel, criteriaSet) + '</div>';
  p.dataset.state = 'open';
  // Le contenu change de hauteur selon le nombre de services : on repart du haut.
  const zone = p.querySelector('.wd-map-detail__scroll');
  if (zone) zone.scrollTop = 0;

  // Le pin sélectionné se distingue, puisqu'il n'a plus de bulle au-dessus de lui.
  _marquerPin(hotel);
  if (sansVol) return;

  // Le conteneur de cette carte change de taille (ouverture du panneau, bascule de vue) :
  // sans invalidateSize, Leaflet centre d'après une taille périmée et le pin part sur le
  // bord. On laisse ensuite Leaflet faire le décalage lui-même via le padding, plutôt que
  // de projeter à la main — il connaît la taille réelle, pas nous.
  _bookingMap.invalidateSize({ animate: false });
  // On retient d'où l'on vient, pour y revenir à la fermeture.
  _vueAvantDetail = { centre: _bookingMap.getCenter(), zoom: _bookingMap.getZoom() };
  // L'hôtel s'inscrit dans le champ de recherche. La liste, en se redessinant, repassera
  // la zone à la carte : son pin restera en avant et ses voisins s'estomperont.
  if (typeof window.WD_CHOISIR_HOTEL === 'function') window.WD_CHOISIR_HOTEL(hotel.name);
  const ll = L.latLng(hotel.lat, hotel.lng);
  // Jamais en deçà du zoom courant : venant d'une ville où l'on distinguait ses deux
  // hôtels, revenir au zoom 6 les recollait l'un sur l'autre et on ne savait plus lequel
  // on regardait. On se contente alors de recadrer sur celui qu'on ouvre.
  _bookingMap.flyToBounds(L.latLngBounds(ll, ll), {
    paddingTopLeft: [WD_DETAIL_W + 24, 24],
    paddingBottomRight: [24, 24],
    maxZoom: Math.max(WD_ZOOM_HOTEL, _bookingMap.getZoom()),
    duration: .6
  });
}

function initBookingMap(continentFilter, scope) {
  const mapElement = document.getElementById('wd-booking-map');
  if (!mapElement || typeof L === 'undefined') return;

  // Le continent courant n'était mémorisé que par updateBookingMapContinent : quand la
  // carte s'ouvrait déjà filtrée, il restait nul, et la fermeture du détail renvoyait
  // sur la vue du monde au lieu du continent affiché.
  _currentContinent = continentFilter || null;
  _currentScope = scope || { continent: _currentContinent };

  _addStyle();

  if (_bookingMap) {
    _bookingMap.remove();
    _bookingMap = null;
    _markers = [];
  }

  _bookingMap = L.map('wd-booking-map', {
    center: [20, 15],
    zoom: 2,
    minZoom: 2,
    maxZoom: 12,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: true,
    touchZoom: true,
    attributionControl: false,
  });

  L.control.zoom({ position: 'topright' }).addTo(_bookingMap);

  // Les étiquettes se recalculent à chaque déplacement : ce qui se chevauchait à un
  // endroit tient ailleurs. Et franchir le seuil de regroupement refait les pins, pour
  // que les villes à plusieurs hôtels se séparent en approchant.
  let _zoomPrecedent = null;
  _bookingMap.on('moveend', () => {
    const groupeAvant = _zoomPrecedent !== null && _zoomPrecedent < WD_ZOOM_VILLES;
    const groupeApres = _bookingMap.getZoom() < WD_ZOOM_VILLES;
    _zoomPrecedent = _bookingMap.getZoom();
    if (_zoomPrecedent !== null && groupeAvant !== groupeApres) _renderMarkers(_currentContinent, _currentCriteria, false);
    else _ajusterEtiquettes();
    _elargirSelonLaVue();
  });

  // Cliquer la carte hors d'un pin ferme aussi le détail : même geste, même retour.
  // Fonction explicite et non référence directe — Leaflet passe son événement en
  // premier argument, qui serait pris pour le drapeau « revenir ».
  _bookingMap.on('click', () => _fermerDetail(true));
  // maxZoom porté à 12 → 14 : à 12 on voyait encore la région, pas le quartier.
  _bookingMap.setMaxZoom(14);

  // Esri Dark Gray : gratuit sans clé (les tuiles CARTO sont désormais filigranées « API key required »)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
  }).addTo(_bookingMap);

  _renderMarkers(continentFilter, _currentCriteria);
}

function _renderMarkers(continentFilter, criteriaSet, refit = true) {
  if (!_bookingMap) return;

  // L'hôtel ouvert est retenu le temps de reconstruire les pins : on décide APRÈS s'il
  // a sa place. Le fermer d'office faisait disparaître le détail au moindre changement
  // de filtre, y compris quand l'hôtel satisfaisait toujours les critères cochés.
  const ouvert = _detailHotel;
  _fermerDetail(false);
  _markers.forEach(m => _bookingMap.removeLayer(m));
  _markers = [];

  // La mise en avant suit la zone, pas seulement le continent : choisir « Chine » ne
  // doit plus laisser toute l'Asie au premier plan.
  const isFiltered = _zoneDefinie(_currentScope);
  const hasCriteria = criteriaSet && criteriaSet.size > 0;

  // Sur l'onglet Réunions, un hôtel n'est candidat que s'il publie des espaces — et
  // qu'ils répondent. Ceux qui n'en publient pas sortent même sans critère coché : on ne
  // propose pas un hôtel sans salle à qui en cherche une.
  const conforme = (hotel) => _surReunions()
    ? _reunionDe(hotel.name) !== null
    : !hasCriteria || (_surRestos()
      // Sur l'onglet Restaurants, un hôtel est conforme s'il a au moins une table qui
      // répond. Ses propres services — piscine, parking — n'ont rien à dire ici, et les
      // tester contre des critères de restauration grisait toute la carte.
      ? _lieuxDe(hotel.name).length > 0
      : _criteresManquants(hotel, criteriaSet).length === 0);

  // À l'échelle d'un continent, deux Pullman d'une même ville posent deux pins au même
  // endroit et écrivent son nom deux fois — « Bangkok » par-dessus « Bangkok ». On les
  // réunit tant qu'on est dézoomé, et on les sépare dès qu'on entre dans le pays.
  const grouper = _bookingMap.getZoom() < WD_ZOOM_VILLES;
  const groupes = new Map();
  PULLMAN_HOTELS_MAP.forEach(hotel => {
    const cle = grouper ? (hotel.country + '|' + hotel.city) : hotel.name;
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(hotel);
  });

  // Combien d'hôtels par ville : sert à nommer les pins une fois séparés. « Singapour »
  // deux fois ne distingue rien ; « Singapore Hill Street » et « Singapore Orchard », si.
  const parVille = new Map();
  PULLMAN_HOTELS_MAP.forEach(h => {
    const k = h.country + '|' + h.city;
    parVille.set(k, (parVille.get(k) || 0) + 1);
  });

  groupes.forEach(lot => {
    const tete = lot[0];
    const inContinent = _dansLaZone(tete, _currentScope);
    // Un groupe répond si l'un des siens répond : le masquer parce que l'autre hôtel de
    // la ville ne correspond pas effacerait un résultat valable.
    const matchesCriteria = lot.some(conforme);
    const greyed = (hasCriteria || _surReunions()) && !matchesCriteria;
    const lat = lot.reduce((n, h) => n + h.lat, 0) / lot.length;
    const lng = lot.reduce((n, h) => n + h.lng, 0) / lot.length;
    // Groupé : le nom de la ville. Séparé dans une ville qui en compte plusieurs : le nom
    // de l'hôtel, sans le « Pullman » que porte déjà chaque pin de cette carte.
    const plusieurs = (parVille.get(tete.country + '|' + tete.city) || 1) > 1;
    const libelle = (!grouper && plusieurs) ? tete.name.replace(/^Pullman\s+/, '') : tete.city;
    const icon = isFiltered && inContinent
      ? _makeLargeIcon(libelle, greyed, lot.length > 1 ? lot.length : 0)
      : _makeSmallIcon(greyed);

    const marker = L.marker([lat, lng], {
      icon: icon,
      zIndexOffset: isFiltered && inContinent && !greyed ? 1000 : greyed ? -1000 : 0,
      opacity: isFiltered && !inContinent ? 0.25 : greyed ? 0.5 : 1,
      // Nombre d'hôtels réunis : sert à décider quel nom garder quand la place manque.
      wdTaille: lot.length,
    }).addTo(_bookingMap);

    // Panneau latéral plutôt qu'une bulle ancrée : posée sur le pin, elle masquait
    // justement ce qu'on cherche à voir — où se trouve l'hôtel et ce qu'il y a autour.
    // Une ville à plusieurs hôtels n'ouvre rien : elle s'approche, et les pins se
    // séparent d'eux-mêmes.
    marker.on('click', () => {
      // Cliquer un pin porte sa ville dans le champ de recherche : la carte et le champ
      // disent alors la même chose. La liste connaît ce périmètre, elle s'y restreint
      // aussi — c'est ce qui manquait la première fois qu'on a mis la ville dans la zone.
      _choisirVille(tete);
      if (lot.length > 1) {
        // On cadre sur les hôtels eux-mêmes, et non à un zoom fixe : les deux Pullman de
        // Singapour sont à 9 km, qui ne font que quelques pixels au zoom 6 — on croyait
        // que les pins ne s'étaient pas séparés alors qu'ils se touchaient.
        _bookingMap.flyToBounds(L.latLngBounds(lot.map(x => [x.lat, x.lng])),
          { padding: [80, 80], maxZoom: 13, duration: 0.9 });
      } else _ouvrirDetail(tete, criteriaSet);
    });

    _markers.push(marker);
  });

  // Le détail survit au changement de filtres tant que son hôtel reste pertinent :
  // toujours présent, dans le continent affiché, et satisfaisant les critères cochés.
  // Il est réaffiché sans vol, pour ne pas déplacer la vue sous les yeux de qui règle
  // ses filtres — mais son contenu est reconstruit, de sorte que les badges reflètent
  // les nouveaux critères.
  if (ouvert) {
    const encoreLa = PULLMAN_HOTELS_MAP.find(h => h.name === ouvert.name);
    // Conformité jugée comme pour les pins : par les tables sur l'onglet Restaurants,
    // par les services ailleurs. Les mélanger faisait remplacer par un message la card
    // d'un hôtel qui avait pourtant les tables demandées — ses services, eux, ne
    // satisfaisaient évidemment aucun critère de cuisine.
    const surRestos = _surRestos();
    const surReunions = _surReunions();
    const manquants = (hasCriteria && encoreLa && !surRestos && !surReunions)
      ? _criteresManquants(encoreLa, criteriaSet)
      : [];
    // Chaque onglet juge selon ce qu'il montre : les tables pour Restaurants, les espaces
    // pour Réunions, les services pour Hôtels. Les confondre remplaçait la card d'un
    // hôtel pourtant conforme par un message d'erreur.
    const ecarte = encoreLa && (surReunions
      ? _reunionDe(encoreLa.name) === null
      : hasCriteria && (surRestos
        ? _lieuxDe(encoreLa.name).length === 0
        : manquants.length > 0));
    const critereOk = !hasCriteria || (encoreLa && !ecarte);
    // Appartenance jugée sur la zone géographique, comme la liste — le continent seul
    // laissait passer un hôtel chinois alors que l'utilisateur avait choisi le Japon.
    const zoneOk = !encoreLa || _dansLaZone(encoreLa, _currentScope);
    if (encoreLa && critereOk && zoneOk) {
      _ouvrirDetail(encoreLa, criteriaSet, true);
    } else if (encoreLa && ecarte && zoneOk && !refit) {
      // L'hôtel vient d'être écarté par un critère : on le dit avant de partir. Sans
      // message, la card disparaissait sans raison visible et la carte restait zoomée
      // sur un hôtel qui ne correspondait plus.
      _messageDetail(encoreLa, manquants, criteriaSet);
    }
  }

  // Plus rien à montrer et rien d'affiché pour le dire : le panneau prend le relais. Un
  // second bloc s'en chargeait auparavant, en surimpression au centre de la carte — deux
  // manières de dire la même chose, qui finissaient par se succéder à l'écran.
  const panneau = document.getElementById('wd-map-detail');
  const rienAffiche = !panneau || panneau.dataset.state !== 'open';
  if (rienAffiche && hasCriteria &&
      _conformes({ continent: _currentScope.continent, country: _currentScope.country }, criteriaSet) === 0) {
    _avisRattrapage(criteriaSet);
  }

  _ajusterEtiquettes();

  // Recadrage uniquement quand la zone change (init / choix de continent) —
  // jamais sur un simple changement de critères : on respecte la vue de l'utilisateur.
  if (refit) _vueContinent(false);
}

// Porte la ville d'un pin dans le champ de recherche. La liste, en se redessinant,
// repassera la nouvelle zone à la carte par WD_SYNC_ZONE — on ne la met pas à jour ici.
function _choisirVille(hotel) {
  if (typeof window.WD_CHOISIR_VILLE !== 'function') return;
  if (_currentScope && _currentScope.city === hotel.city) return;
  window.WD_CHOISIR_VILLE(hotel.city, hotel.country, hotel.continent);
}

// Dézoomer au-delà de son périmètre le desserre. On ne se fonde pas sur un seuil de zoom
// — il ne veut rien dire, une ville chinoise et une île des Maldives ne tiennent pas à la
// même échelle — mais sur ce que la vue contient : dès qu'on voit d'autres villes, la
// ville n'est plus le bon périmètre ; dès qu'on voit d'autres pays, le pays non plus.
// Les pins de la nouvelle zone repassent alors en avant d'eux-mêmes.
function _elargirSelonLaVue() {
  if (!_bookingMap || !_currentScope) return;
  // Une card ouverte est un choix explicite : on ne le défait pas dans son dos.
  if (_currentScope.hotel) return;
  if (!_currentScope.city && !_currentScope.country) return;
  const bornes = _bookingMap.getBounds();
  const vus = PULLMAN_HOTELS_MAP.filter(h => bornes.contains([h.lat, h.lng]));
  if (vus.length < 2) return;
  const pays = new Set(vus.map(h => h.country));
  const villes = new Set(vus.map(h => h.city));
  let niveau = null;
  if (pays.size > 1 && _currentScope.country) niveau = 'continent';
  else if (villes.size > 1 && _currentScope.city) niveau = 'country';
  if (!niveau) return;
  if (typeof window.WD_ELARGIR_A === 'function') window.WD_ELARGIR_A(niveau);
}

// La liste appelle ceci chaque fois qu'elle se redessine. La carte s'aligne sur sa zone
// sans recadrer : elle n'a pas à déplacer la vue, seulement à ne plus la contredire.
//
// Une quinzaine d'endroits changent la destination — retirer une chip, déplier un pays,
// choisir un hôtel, saisir du texte — et deux seulement prévenaient la carte. D'où cette
// famille d'écarts qu'on a corrigés un par un : la Chine ignorée, l'onglet qui gardait
// les critères de l'autre, la chip retirée sans effet sur les pins. Une seule couture
// vaut mieux que treize rattrapages.
window.WD_SYNC_ZONE = (zone) => {
  if (!_bookingMap || !zone) return;
  const a = _currentScope || {}, b = zone;
  if (a.continent === b.continent && a.country === b.country && a.city === b.city && a.hotel === b.hotel) return;
  _currentScope = b;
  _renderMarkers(_currentContinent, _currentCriteria, false);
};

// N'affiche que les étiquettes qui tiennent sans se recouvrir. À l'échelle d'un
// continent, 39 noms de villes se marchaient dessus en Asie du Sud-Est : on en gardait
// tous les pins mais plus aucun nom lisible. Les autres se révèlent au survol, et
// reparaissent d'elles-mêmes dès que le zoom leur fait de la place.
function _ajusterEtiquettes() {
  const gardees = [];
  // Priorité aux pins mis en avant : si un nom doit céder, que ce soit celui d'un hôtel
  // qui ne répond pas aux critères. À égalité, les villes qui comptent le plus d'hôtels
  // gardent leur nom — ce sont les destinations qu'on cherche d'abord, et laisser
  // l'ordre d'insertion trancher revenait à tirer au sort.
  const ordonnes = _markers.slice().sort((a, b) =>
    (b.options.opacity || 0) - (a.options.opacity || 0) ||
    (b.options.wdTaille || 1) - (a.options.wdTaille || 1));
  ordonnes.forEach(m => {
    const el = m._icon && m._icon.querySelector('.pullman-label');
    if (!el) return;
    el.classList.remove('pullman-label--masquee');
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    // Deux pixels de marge : deux noms qui se frôlent se lisent aussi mal que deux noms
    // qui se chevauchent.
    const b = { l: r.left - 2, t: r.top - 2, r: r.right + 2, b: r.bottom + 2 };
    const heurte = gardees.some(g => b.l < g.r && g.l < b.r && b.t < g.b && g.t < b.b);
    if (heurte) el.classList.add('pullman-label--masquee');
    else gardees.push(b);
  });
}

// Cadrage de la zone courante — le continent choisi, ou le monde à défaut.
// Extrait de _renderMarkers pour que la fermeture du panneau puisse y revenir :
// c'est la même vue, elle ne doit pas être recalculée deux fois différemment.
// `scope` : cadrer sur une zone autre que la zone courante. Sert au retour après
// exclusion, où la zone courante désigne encore l'hôtel écarté.
function _vueContinent(anime, scope) {
  if (!_bookingMap || typeof PULLMAN_HOTELS_MAP === 'undefined') return;
  // On cadre sur la zone choisie — pays ou ville comprises — et non sur le seul
  // continent : sélectionner « Chine » cadrait jusqu'ici toute l'Asie.
  const zone = scope || _currentScope;
  const cible = PULLMAN_HOTELS_MAP.filter(h => _dansLaZone(h, zone));
  if (!cible.length) return;
  const bounds = L.latLngBounds(cible.map(h => [h.lat, h.lng]));
  _bookingMap.invalidateSize({ animate: false });
  _bookingMap.flyToBounds(bounds, {
    padding: _zoneDefinie(zone) ? [20, 20] : [10, 10],
    // Un seul hôtel dans la zone : sans plafond, flyToBounds irait au zoom maximum.
    maxZoom: cible.length === 1 ? WD_ZOOM_HOTEL : 12,
    animate: anime,
    duration: anime ? 1.0 : 0
  });
}

// `scope` : { continent, country, city, hotel } — la zone telle que la vue liste la
// comprend. Omis, on retombe sur le seul continent, pour ne pas casser les appels
// existants.
function updateBookingMapContinent(continentFilter, criteriaSet, scope) {
  _currentContinent = continentFilter;
  _currentScope = scope || { continent: continentFilter };
  if (criteriaSet !== undefined) _currentCriteria = criteriaSet;
  if (!_bookingMap) {
    initBookingMap(continentFilter, _currentScope);
    return;
  }
  _renderMarkers(continentFilter, _currentCriteria);
}

function updateBookingMapCriteria(criteriaSet) {
  _currentCriteria = criteriaSet;
  if (!_bookingMap) return;
  _renderMarkers(_currentContinent, criteriaSet, false); // critères seuls : la vue ne bouge pas
}

function refreshBookingMapSize() {
  if (_bookingMap) _bookingMap.invalidateSize();
}
window.WD_MAP_RESIZE = refreshBookingMapSize;

// Synchronise la sélection d'un pays avec le booking engine
function syncCountryToBooking(countryName) {
  // Chercher le conteneur de chips de destination
  const chipsContainer = document.getElementById('wd-dest-chips');

  if (chipsContainer) {
    // Supprimer toutes les chips existantes (notamment le continent)
    chipsContainer.innerHTML = '';

    // Créer une nouvelle chip pour le pays
    const chip = document.createElement('div');
    chip.className = 'wd-booking__dest-chip';
    chip.innerHTML = `
      <span>${countryName}</span>
      <button type="button" class="wd-booking__dest-chip-remove" aria-label="Retirer ${countryName}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;

    chipsContainer.appendChild(chip);

    // Ajouter l'event listener pour le bouton de suppression
    const removeBtn = chip.querySelector('.wd-booking__dest-chip-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        chip.remove();
      });
    }

    console.log('✅ Pays ajouté au booking engine:', countryName);
  }

  // Fermer la modal après sélection avec un petit délai pour voir l'animation
  setTimeout(() => {
    if (typeof closeMapModal === 'function') {
      closeMapModal();
    }
  }, 400);
}

// Génère la liste des pays avec leur nombre d'hôtels pour un continent donné
function getCountriesByContinent(continentFilter) {
  const hotels = continentFilter
    ? PULLMAN_HOTELS_MAP.filter(h => h.continent === continentFilter)
    : PULLMAN_HOTELS_MAP;

  const countryMap = new Map();

  hotels.forEach(hotel => {
    const count = countryMap.get(hotel.country) || 0;
    countryMap.set(hotel.country, count + 1);
  });

  // Trier par nombre d'hôtels (décroissant) puis par nom
  return Array.from(countryMap.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // Plus d'hôtels en premier
      return a[0].localeCompare(b[0], 'fr'); // Puis ordre alphabétique
    })
    .map(([country, count]) => ({ country, count }));
}

// Injecte la liste des pays dans l'interface et ajoute les event listeners
function renderCountryList(continentFilter) {
  const container = document.getElementById('country-list-container');
  if (!container) return;

  const countries = getCountriesByContinent(continentFilter);

  if (countries.length === 0) {
    container.innerHTML = '<p class="country-list__empty">Aucun hôtel dans cette région</p>';
    return;
  }

  const html = `
    <div class="country-list">
      <h4 class="country-list__title">PAYS</h4>
      <ul class="country-list__items">
        ${countries.map(({ country, count }) => `
          <li class="country-list__item" data-country="${country}">
            <button class="country-list__button">
              <span class="country-list__name">${country}</span>
              <span class="country-list__count">${count} hôtel${count > 1 ? 's' : ''}</span>
              <svg class="country-list__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  container.innerHTML = html;

  // Ajouter les event listeners
  container.querySelectorAll('.country-list__button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const country = button.closest('.country-list__item').dataset.country;

      // Mettre à jour la sélection visuelle
      container.querySelectorAll('.country-list__item').forEach(item => {
        item.classList.remove('is-selected');
      });
      button.closest('.country-list__item').classList.add('is-selected');

      // Synchroniser avec le booking engine
      syncCountryToBooking(country);

      // Filtrer la carte pour ne montrer que les hôtels de ce pays
      filterMapByCountry(country);

      console.log('🌍 Country selected:', country);
    });
  });
}

// Filtre la carte pour ne montrer que les hôtels d'un pays spécifique
function filterMapByCountry(country) {
  if (!_bookingMap) return;

  _markers.forEach(marker => {
    const hotel = PULLMAN_HOTELS_MAP.find(h =>
      Math.abs(h.lat - marker.getLatLng().lat) < 0.0001 &&
      Math.abs(h.lng - marker.getLatLng().lng) < 0.0001
    );

    if (hotel) {
      if (hotel.country === country) {
        marker.setOpacity(1);
        marker.setZIndexOffset(1000);
      } else {
        marker.setOpacity(0.25);
        marker.setZIndexOffset(-1000);
      }
    }
  });

  // Zoom sur les hôtels du pays sélectionné
  const countryHotels = PULLMAN_HOTELS_MAP.filter(h => h.country === country);
  if (countryHotels.length > 0) {
    const bounds = L.latLngBounds(countryHotels.map(h => [h.lat, h.lng]));
    _bookingMap.fitBounds(bounds, { padding: [50, 50], animate: true });
  }
}
