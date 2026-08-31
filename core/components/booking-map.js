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
    '.pullman-popup-card .leaflet-popup-content-wrapper{background:#1a2220;border:1px solid rgba(95,239,145,.25);border-radius:10px;padding:0;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.5),0 0 0 1px rgba(95,239,145,.1)}' +
    '.pullman-popup-card .leaflet-popup-content{margin:0}' +
    '.pullman-popup-card .leaflet-popup-tip{background:#1a2220;border:1px solid rgba(95,239,145,.25);border-top:none;border-left:none}' +
    '.pullman-popup-card .pullman-popup__row{display:flex;align-items:stretch}' +
    '.pullman-popup-card .pullman-popup__placeholder{width:80px;flex-shrink:0;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;padding:12px}' +
    '.pullman-popup-card .pullman-popup__body{padding:12px 16px;display:flex;flex-direction:column;justify-content:center;gap:5px;min-width:0}' +
    '.pullman-popup-card .pullman-popup__name{font-family:var(--font-sans,sans-serif);font-size:12.5px;font-weight:700;color:#fff;margin:0;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}' +
    '.pullman-popup-card .pullman-popup__location{font-family:var(--font-sans,sans-serif);font-size:10.5px;color:rgba(255,255,255,.5);margin:0;display:flex;align-items:center;gap:4px}' +
    '.pullman-popup-card .pullman-popup__location svg{flex-shrink:0}' +
    '.pullman-popup-card .pullman-popup__cta{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-sans,sans-serif);font-size:10.5px;font-weight:600;color:#5FEF91;text-decoration:none;transition:opacity .2s;margin-top:4px}' +
    '.pullman-popup-card .pullman-popup__cta:hover{opacity:.8}';
  document.head.appendChild(style);
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

    marker.bindPopup(
      '<div class="pullman-popup__row">' +
        '<div class="pullman-popup__placeholder"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>' +
        '<div class="pullman-popup__body">' +
          '<p class="pullman-popup__name">' + hotel.name + '</p>' +
          '<p class="pullman-popup__location">' +
            '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
            hotel.city + ', ' + hotel.country +
          '</p>' +
          '<a class="pullman-popup__cta" href="#">Découvrir <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>' +
        '</div>' +
      '</div>',
      { className: 'pullman-popup-card', closeButton: false, offset: [0, -6], maxWidth: 300 }
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
