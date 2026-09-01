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
let _currentCriteria = null;

function _makeSmallIcon(greyed) {
  return L.divIcon({
    className: 'pullman-map-marker' + (greyed ? ' pullman-map-marker--greyed' : ''),
    html: '<div class="pullman-dot' + (greyed ? ' pullman-dot--greyed' : '') + '"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function _makeLargeIcon(cityName, greyed) {
  return L.divIcon({
    className: 'pullman-map-marker pullman-map-marker--labeled' + (greyed ? ' pullman-map-marker--greyed' : ''),
    html: '<div class="pullman-dot pullman-dot--large' + (greyed ? ' pullman-dot--greyed' : '') + '"></div>' +
          '<span class="pullman-label">' + cityName + '</span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function _addStyle() {
  if (document.getElementById('pullman-map-style')) return;
  const style = document.createElement('style');
  style.id = 'pullman-map-style';
  style.textContent =
    '.pullman-dot{width:10px;height:10px;background:#5FEF91;border-radius:50%;border:2px solid #1a2220;box-shadow:0 0 6px rgba(95,239,145,.5),0 1px 3px rgba(0,0,0,.4);transition:all .3s;cursor:pointer}' +
    '.pullman-dot--large{width:14px;height:14px;box-shadow:0 0 12px rgba(95,239,145,.7),0 0 24px rgba(95,239,145,.3),0 2px 6px rgba(0,0,0,.4);animation:pullman-pulse 2s ease-in-out infinite}' +
    '.pullman-dot--greyed{background:#666;box-shadow:0 0 4px rgba(100,100,100,.3),0 1px 2px rgba(0,0,0,.3)}' +
    '.pullman-dot--large.pullman-dot--greyed{background:#666;box-shadow:0 0 6px rgba(100,100,100,.3),0 1px 3px rgba(0,0,0,.3);animation:none}' +
    '.pullman-map-marker--greyed .pullman-label{color:rgba(255,255,255,.4)}' +
    // Pin sélectionné : sans bulle au-dessus de lui, il lui faut sa propre marque
    '.pullman-map-marker--selected .pullman-dot{width:16px;height:16px;background:#fff;border-color:#5FEF91;box-shadow:0 0 0 4px rgba(95,239,145,.35),0 2px 8px rgba(0,0,0,.5)}' +
    // ── Panneau de détail, ancré à gauche de la carte ──────────────────────────
    // Il ne masque plus le pin : la carte est recentrée pour que l'hôtel tombe à droite.
    '.wd-map-detail{position:absolute;top:12px;left:12px;width:' + WD_DETAIL_W + 'px;z-index:800;' +
      'background:#fff;box-shadow:0 12px 38px rgba(0,0,0,.45);' +
      'opacity:0;transform:translateX(-12px);pointer-events:none;transition:opacity .2s,transform .2s}' +
    '.wd-map-detail[data-state="open"]{opacity:1;transform:none;pointer-events:auto}' +
    '.wd-map-detail .pullman-popup__media{aspect-ratio:16/9}' +
    '.wd-map-detail__close{position:absolute;top:8px;right:8px;z-index:2;width:26px;height:26px;padding:0;' +
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
    '.pullman-popup__img{width:100%;height:100%;object-fit:cover;display:block}' +
    // Badge « Nouveau » posé sur la photo : voile sombre, seul endroit où le blanc reste lisible
    '.pullman-popup__badge{position:absolute;top:8px;left:8px;padding:3px 8px;background:rgba(0,0,0,.62);font-family:var(--font-sans,sans-serif);font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#fff}' +
    '.pullman-popup__body{padding:11px 14px 12px;display:flex;flex-direction:column;gap:5px}' +
    '.pullman-popup__name{font-family:var(--font-sans,sans-serif);font-size:13px;font-weight:700;color:#445047;margin:0;line-height:1.3}' +
    // Opacité .78 et non .62 : sur blanc, .62 tombait à 3,16:1, sous le seuil AA de
    // 4,5:1 pour ce corps de 11px. À .78 on est à 4,7:1.
    '.pullman-popup__location{font-family:var(--font-sans,sans-serif);font-size:11px;color:rgba(68,80,71,.78);margin:0;display:flex;align-items:center;gap:5px;min-width:0}' +
    '.pullman-popup__location svg{flex-shrink:0}' +
    '.pullman-popup__location>span:first-of-type{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.pullman-popup__score{flex-shrink:0;margin-left:auto;padding:1px 6px;background:#445047;font-size:11px;font-weight:700;color:#fff}' +
    // Critères satisfaits : le vert de marque reste, mais en fond léger avec le texte
    // #445047 par-dessus — #5FEF91 en couleur de texte sur blanc est illisible.
    '.pullman-popup__tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:1px}' +
    '.pullman-popup__tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:rgba(95,239,145,.24);font-family:var(--font-sans,sans-serif);font-size:10px;font-weight:600;color:#2F4034;white-space:nowrap}' +
    // align-items:center et non baseline : le CTA est lui-même un conteneur flex, et
    // l'alignement sur la ligne de base d'un flex imbriqué ajoutait ~40px de vide.
    // Deux actions : le prix passe sur sa propre ligne, sinon les trois éléments se
    // comprimeraient sur 236px utiles.
    '.pullman-popup__foot{display:flex;flex-direction:column;align-items:stretch;gap:9px;margin-top:2px;padding-top:9px;border-top:1px solid #BCCABE}' +
    '.pullman-popup__actions{display:flex;align-items:center;justify-content:space-between;gap:10px}' +
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
  const pin = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const arrow = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  const check = '<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5 4.8 9 10 3.5"/></svg>';

  const ids = active ? [...active] : [];
  const tags = ids.filter(id => (h.amenities || []).includes(id))
    .map(id => '<span class="pullman-popup__tag">' + check + esc(WD_CRITERIA_LABELS[id] || id) + '</span>').join('');

  // Deux destinations distinctes : la fiche hôtel sur le site de marque, et la
  // réservation sur ALL. Sans href on n'affiche aucun lien plutôt qu'un lien mort.
  const bookUrl = window.WD_ALL_BOOKING_URL ? window.WD_ALL_BOOKING_URL(h, stay) : null;
  const cta = h.href
    ? '<div class="pullman-popup__actions">' +
        (bookUrl ? '<a class="pullman-popup__cta" href="' + esc(bookUrl) + '" target="_blank" rel="noopener">Réserver</a>' : '') +
        '<a class="pullman-popup__link" href="' + esc(h.href) + '" target="_blank" rel="noopener">Voir l’hôtel ' + arrow + '</a>' +
      '</div>'
    : '';

  return '<article class="pullman-popup">' +
    '<div class="pullman-popup__media">' +
      '<img class="pullman-popup__img" src="' + img + '" alt="' + esc(h.name) + '" loading="lazy"/>' +
      (h.badge ? '<span class="pullman-popup__badge">' + esc(h.badge) + '</span>' : '') +
    '</div>' +
    '<div class="pullman-popup__body">' +
      '<h3 class="pullman-popup__name">' + esc(h.name) + '</h3>' +
      // Lieu et note sur une seule ligne : même registre (identité de l'hôtel), et
      // l'encart gagne une rangée sur une carte où la place est comptée.
      '<p class="pullman-popup__location">' + pin +
        '<span>' + esc(h.city || '') + (h.country ? ', ' + esc(h.country) : '') + '</span>' +
        (h.rating ? '<span class="pullman-popup__score">' + esc(h.rating) + '</span>' : '') +
      '</p>' +
      (tags ? '<div class="pullman-popup__tags">' + tags + '</div>' : '') +
      '<div class="pullman-popup__foot">' +
        (showPrice && h.price
          ? '<p class="pullman-popup__price">' + esc(h.price) + ' € <span>/ nuit</span></p>'
          : '<span class="pullman-popup__nodate">Tarifs selon vos dates</span>') +
        cta + '</div>' +
    '</div>' +
  '</article>';
}
window.wdHotelPopupHTML = wdHotelPopupHTML;

// ── Panneau de détail latéral (carte du dropdown) ────────────────────────────────
// Largeur du panneau, reprise telle quelle par le décalage de centrage.
const WD_DETAIL_W = 288;

function _fermerDetail() {
  const p = document.getElementById('wd-map-detail');
  if (p) { p.dataset.state = 'closed'; p.innerHTML = ''; }
  _markers.forEach(m => m._icon && m._icon.classList.remove('pullman-map-marker--selected'));
}

function _ouvrirDetail(hotel, criteriaSet) {
  const conteneur = document.getElementById('wd-booking-map');
  if (!conteneur || !_bookingMap) return;
  let p = document.getElementById('wd-map-detail');
  if (!p) {
    p = document.createElement('aside');
    p.id = 'wd-map-detail';
    p.className = 'wd-map-detail';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Détail de l’hôtel');
    conteneur.appendChild(p);
    p.addEventListener('click', (e) => {
      if (e.target.closest('[data-detail-close]')) { e.preventDefault(); _fermerDetail(); }
    });
  }
  p.innerHTML =
    '<button type="button" class="wd-map-detail__close" data-detail-close aria-label="Fermer"></button>' +
    wdHotelPopupHTML(hotel, criteriaSet);
  p.dataset.state = 'open';

  // Le pin sélectionné se distingue, puisqu'il n'a plus de bulle au-dessus de lui.
  _markers.forEach(m => m._icon && m._icon.classList.remove('pullman-map-marker--selected'));
  const mk = _markers.find(m => {
    const ll = m.getLatLng();
    return Math.abs(ll.lat - hotel.lat) < 1e-9 && Math.abs(ll.lng - hotel.lng) < 1e-9;
  });
  if (mk && mk._icon) mk._icon.classList.add('pullman-map-marker--selected');

  // Zoom sur l'hôtel, avec le centre décalé pour que le pin tombe dans la moitié
  // libre à droite du panneau plutôt que derrière lui.
  const zoom = Math.max(_bookingMap.getZoom(), 11);
  const pt = _bookingMap.project([hotel.lat, hotel.lng], zoom);
  pt.x -= WD_DETAIL_W / 2;
  _bookingMap.flyTo(_bookingMap.unproject(pt, zoom), zoom, { duration: .6 });
}

function initBookingMap(continentFilter) {
  const mapElement = document.getElementById('wd-booking-map');
  if (!mapElement || typeof L === 'undefined') return;

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

  // Cliquer la carte hors d'un pin referme le détail, comme on refermerait une bulle.
  _bookingMap.on('click', _fermerDetail);
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

  // Le panneau montre un hôtel qui peut disparaître du jeu de pins (changement de
  // continent ou de critères) : on le referme plutôt que d'afficher un détail orphelin.
  _fermerDetail();
  _markers.forEach(m => _bookingMap.removeLayer(m));
  _markers = [];

  const isFiltered = !!continentFilter;
  const hasCriteria = criteriaSet && criteriaSet.size > 0;

  PULLMAN_HOTELS_MAP.forEach(hotel => {
    const inContinent = hotel.continent === continentFilter;
    const matchesCriteria = !hasCriteria || [...criteriaSet].every(c => hotel.amenities && hotel.amenities.includes(c));
    const greyed = hasCriteria && !matchesCriteria;
    const icon = isFiltered && inContinent
      ? _makeLargeIcon(hotel.city, greyed)
      : _makeSmallIcon(greyed);

    const marker = L.marker([hotel.lat, hotel.lng], {
      icon: icon,
      zIndexOffset: isFiltered && inContinent && !greyed ? 1000 : greyed ? -1000 : 0,
      opacity: isFiltered && !inContinent ? 0.25 : greyed ? 0.5 : 1,
    }).addTo(_bookingMap);

    // Panneau latéral plutôt qu'une bulle ancrée : posée sur le pin, elle masquait
    // justement ce qu'on cherche à voir — où se trouve l'hôtel et ce qu'il y a autour.
    marker.on('click', () => _ouvrirDetail(hotel, criteriaSet));

    _markers.push(marker);
  });

  // Recadrage uniquement quand la zone change (init / choix de continent) —
  // jamais sur un simple changement de critères : on respecte la vue de l'utilisateur.
  if (refit) {
    if (isFiltered) {
      const filteredHotels = PULLMAN_HOTELS_MAP.filter(h => h.continent === continentFilter);
      if (filteredHotels.length > 0) {
        const bounds = L.latLngBounds(filteredHotels.map(h => [h.lat, h.lng]));
        _bookingMap.fitBounds(bounds, { padding: [20, 20], animate: false });
      }
    } else {
      const bounds = L.latLngBounds(PULLMAN_HOTELS_MAP.map(h => [h.lat, h.lng]));
      _bookingMap.fitBounds(bounds, { padding: [10, 10], animate: false });
    }
  }
}

function updateBookingMapContinent(continentFilter, criteriaSet) {
  _currentContinent = continentFilter;
  if (criteriaSet !== undefined) _currentCriteria = criteriaSet;
  if (!_bookingMap) {
    initBookingMap(continentFilter);
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
