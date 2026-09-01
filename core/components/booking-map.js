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
    '.pullman-label{position:absolute;left:18px;top:50%;transform:translateY(-50%);white-space:nowrap;font-family:var(--font-sans,sans-serif);font-size:11px;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.8),0 0 2px rgba(0,0,0,.6);pointer-events:none}' +
    '@keyframes pullman-pulse{0%,100%{box-shadow:0 0 12px rgba(95,239,145,.7),0 0 24px rgba(95,239,145,.3),0 2px 6px rgba(0,0,0,.4)}50%{box-shadow:0 0 18px rgba(95,239,145,.9),0 0 36px rgba(95,239,145,.4),0 2px 6px rgba(0,0,0,.4)}}' +
    // ── Encart hôtel ──────────────────────────────────────────────────────────
    // Même langage que les cartes de la page de résultats : fond #1a2220, aucun radius,
    // le vert réservé au prix et à l'action. La bordure verte décorative d'avant entrait
    // en concurrence avec les pins, eux aussi verts.
    '.pullman-popup-card .leaflet-popup-content-wrapper{background:#1a2220;border:1px solid rgba(255,255,255,.14);border-radius:0;padding:0;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,.55)}' +
    '.pullman-popup-card .leaflet-popup-content{margin:0;width:264px!important}' +
    '.pullman-popup-card .leaflet-popup-tip{background:#1a2220;border:1px solid rgba(255,255,255,.14);border-top:none;border-left:none}' +
    // Leaflet impose « .leaflet-popup-content p { margin: 1.3em 0 } » depuis son CDN.
    // Sa spécificité (0,1,1) bat une simple classe : on la neutralise à (0,2,1), sinon
    // chaque paragraphe ajoute ~35px de vide invisible dans l'encart.
    '.pullman-popup-card .leaflet-popup-content p{margin:0}' +
    '.pullman-popup__media{position:relative;display:block;width:100%;aspect-ratio:16/9;background:#28332B}' +
    '.pullman-popup__img{width:100%;height:100%;object-fit:cover;display:block}' +
    // Badge « Nouveau » : blanc sur voile sombre, jamais vert (le vert dit « action »)
    '.pullman-popup__badge{position:absolute;top:8px;left:8px;padding:3px 8px;background:rgba(0,0,0,.62);font-family:var(--font-sans,sans-serif);font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#fff}' +
    '.pullman-popup__body{padding:11px 14px 12px;display:flex;flex-direction:column;gap:5px}' +
    '.pullman-popup__name{font-family:var(--font-sans,sans-serif);font-size:13px;font-weight:700;color:#fff;margin:0;line-height:1.3}' +
    '.pullman-popup__location{font-family:var(--font-sans,sans-serif);font-size:11px;color:rgba(255,255,255,.5);margin:0;display:flex;align-items:center;gap:5px;min-width:0}' +
    '.pullman-popup__location svg{flex-shrink:0}' +
    '.pullman-popup__location>span:first-of-type{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.pullman-popup__score{flex-shrink:0;margin-left:auto;padding:1px 6px;background:rgba(255,255,255,.1);font-size:11px;font-weight:700;color:#fff}' +
    // Critères satisfaits : répond à « pourquoi cet hôtel ? » quand des filtres sont actifs
    '.pullman-popup__tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:1px}' +
    '.pullman-popup__tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border:1px solid rgba(95,239,145,.45);font-family:var(--font-sans,sans-serif);font-size:10px;color:#5FEF91;white-space:nowrap}' +
    // align-items:center et non baseline : le CTA est lui-même un conteneur flex, et
    // l'alignement sur la ligne de base d'un flex imbriqué ajoutait ~40px de vide.
    '.pullman-popup__foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:2px;padding-top:9px;border-top:1px solid rgba(255,255,255,.1)}' +
    '.pullman-popup__price{font-family:var(--font-sans,sans-serif);font-size:15px;font-weight:700;color:#fff;line-height:1;margin:0}' +
    '.pullman-popup__price span{font-size:10.5px;font-weight:400;color:rgba(255,255,255,.45)}' +
    '.pullman-popup__cta{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-sans,sans-serif);font-size:11px;font-weight:600;color:#5FEF91;text-decoration:none;transition:opacity .15s;white-space:nowrap}' +
    '.pullman-popup__cta:hover{opacity:.75}' +
    '.pullman-popup-card .leaflet-popup-close-button{color:rgba(255,255,255,.6);padding:6px 8px 0 0}' +
    '.pullman-popup-card .leaflet-popup-close-button:hover{color:#fff;background:transparent}';
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
function wdHotelPopupHTML(h, active) {
  // La page de résultats construit sa carte elle-même et ne passe jamais par
  // initBookingMap() : sans cet appel, l'encart y serait affiché sans ses styles.
  _addStyle();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const base = window.WD_IMG_BASE || 'https://m.ahstatic.com/is/image/accorhotels/';
  const key = window.WD_IMG_KEY ? window.WD_IMG_KEY(h, '16by9') : (h.img || 'aja_p_6783-26') + ':16by9';
  const img = base + key + '?fmt=jpg&op_usm=1.75,0.3,2,0&wid=528&hei=297';
  const pin = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const arrow = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  const check = '<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5 4.8 9 10 3.5"/></svg>';

  const ids = active ? [...active] : [];
  const tags = ids.filter(id => (h.amenities || []).includes(id))
    .map(id => '<span class="pullman-popup__tag">' + check + esc(WD_CRITERIA_LABELS[id] || id) + '</span>').join('');

  // Lien réel vers la fiche Accor quand on l'a ; sinon on n'affiche pas de lien mort.
  const cta = h.href
    ? '<a class="pullman-popup__cta" href="' + esc(h.href) + '" target="_blank" rel="noopener">Voir l’hôtel ' + arrow + '</a>'
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
      (h.price || cta ? '<div class="pullman-popup__foot">' +
        (h.price ? '<p class="pullman-popup__price">' + esc(h.price) + ' € <span>/ nuit</span></p>' : '<span></span>') +
        cta + '</div>' : '') +
    '</div>' +
  '</article>';
}
window.wdHotelPopupHTML = wdHotelPopupHTML;

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

  // Esri Dark Gray : gratuit sans clé (les tuiles CARTO sont désormais filigranées « API key required »)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
  }).addTo(_bookingMap);

  _renderMarkers(continentFilter, _currentCriteria);
}

function _renderMarkers(continentFilter, criteriaSet, refit = true) {
  if (!_bookingMap) return;

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

    // Contenu construit à la demande : évite de fabriquer 110 encarts au chargement.
    marker.bindPopup(() => wdHotelPopupHTML(hotel, criteriaSet),
      { className: 'pullman-popup-card', closeButton: true, offset: [0, -8], maxWidth: 280, minWidth: 264 }
    );

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
