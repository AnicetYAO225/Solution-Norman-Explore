/* =========================================================
   Norman'Explore — fonctions cartographiques partagées
   Utilisé par carte.html et mobilite.html (nécessite config.js
   + Leaflet + Leaflet.markercluster chargés avant ce script).
   ========================================================= */

// Cache mémoire : évite de re-télécharger 2 Mo de patrimoine
// si l'utilisateur active/désactive plusieurs fois les couches.
const NE_cache = { Mobilier: null, Architecture: null };

/**
 * Crée la carte de base (fond de carte clair + sombre) et
 * la contraint à la Normandie.
 */
function neCreateMap(divId) {
  const map = L.map(divId, {
    center: CONFIG.map.center,
    zoom: CONFIG.map.zoom,
    minZoom: CONFIG.map.minZoom,
    maxBounds: CONFIG.map.bounds,
    maxBoundsViscosity: 0.8
  });

  const claire = L.tileLayer(CONFIG.maptiler.tileUrl(CONFIG.maptiler.key), {
    attribution: '<a href="https://www.maptiler.com/copyright" target="_blank">MapTiler</a> · ' +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  const sombre = L.tileLayer(CONFIG.jawg.darkTileUrl(CONFIG.jawg.token), {
    attribution: '<a href="https://www.jawg.io" target="_blank">Jawg</a> · ' +
      '<a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>',
    maxZoom: 19
  });

  L.control.layers({ "Fond clair": claire, "Fond sombre": sombre }).addTo(map);

  return map;
}

/**
 * Ajoute les 5 contours départementaux (auto-hébergés, léger).
 */
function neAddDepartmentContours(map) {
  CONFIG.geo.departements.forEach(dep => {
    fetch(dep.url)
      .then(res => res.json())
      .then(data => L.geoJSON(data, { style: CONFIG.contourStyle }).addTo(map))
      .catch(err => console.error(`Contour ${dep.nom} non chargé :`, err));
  });
}

/**
 * Charge les bâtiments OSM 3D UNIQUEMENT quand on zoome assez
 * près (voir CONFIG.osmBuildings.minZoom). À l'échelle régionale,
 * charger des milliers de bâtiments 3D ne sert à rien et ralentit
 * toute la page — c'était la principale cause de lenteur.
 */
function neEnableBuildings3D(map) {
  let osmb = null;
  function evaluate() {
    if (map.getZoom() >= CONFIG.osmBuildings.minZoom && !osmb) {
      osmb = new OSMBuildings(map).load(CONFIG.osmBuildings.tileUrl);
    }
  }
  map.on('zoomend', evaluate);
  evaluate();
}

/**
 * Icône de point de patrimoine : miniature circulaire de la photo
 * quand elle existe (chargée uniquement pour les marqueurs
 * réellement affichés, pas pour l'ensemble du jeu de données —
 * le clustering se charge d'en limiter le nombre à l'écran), avec
 * un repli propre (pastille de couleur + symbole) quand il n'y a
 * pas de photo.
 */
function nePatrimoineIcon(type, imageUrl) {
  const color = CONFIG.patrimoineColors[type] || "#555";
  const symbol = type === "Mobilier" ? "&#9992;" : "&#127963;";
  const validImage = typeof imageUrl === 'string' && /^https?:\/\//.test(imageUrl) ? imageUrl : null;
  const inner = validImage
    ? `<div class="patrimoine-marker has-image" style="background-image:url('${validImage}'); border-color:${color}"></div>`
    : `<div class="patrimoine-marker" style="background:${color}">${symbol}</div>`;
  return L.divIcon({
    html: inner,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

function neClusterIcon(cluster, type) {
  const color = CONFIG.patrimoineColors[type] || "#555";
  const count = cluster.getChildCount();
  const size = count < 20 ? 34 : count < 100 ? 42 : 50;
  return L.divIcon({
    html: `<div class="cluster-marker" style="--cluster-color:${color}; width:${size}px; height:${size}px;">${count}</div>`,
    className: '',
    iconSize: [size, size]
  });
}

function nePopupContent(feature) {
  const p = feature.properties || {};
  const validImage = typeof p.image === 'string' && /^https?:\/\//.test(p.image) ? p.image : null;
  const img = validImage
    ? `<img src="${validImage}" alt="${(p.TICO || '').replace(/"/g, '')}" loading="lazy" onerror="this.remove()">`
    : '';
  const lien = p.DOSURL
    ? `<a href="${p.DOSURL}" target="_blank" rel="noopener">Plus d'infos</a>`
    : '';
  return `
    <div class="popup-title">${p.COM || 'Inconnu'}</div>
    <div class="popup-description">${p.TICO || 'Pas de description'}</div>
    ${img}
    ${lien}
  `;
}

/**
 * Télécharge (une seule fois, mise en cache) puis affiche un
 * type de patrimoine ("Mobilier" ou "Architecture") dans un
 * groupe de clusters. Retourne le groupe pour pouvoir
 * l'ajouter/le retirer de la carte à volonté.
 *
 * @param {string} type "Mobilier" ou "Architecture"
 * @param {function} [onMarkerClick] rappel optionnel (latlng, feature) — utilisé
 *   par exemple pour ajouter le point cliqué à un itinéraire.
 */
async function neLoadPatrimoineLayer(type, onMarkerClick) {
  if (!NE_cache[type]) {
    const url = type === "Mobilier" ? CONFIG.geo.mobilier : CONFIG.geo.architecture;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Impossible de charger ${type} (${res.status})`);
    NE_cache[type] = await res.json();
  }

  const group = L.markerClusterGroup({
    iconCreateFunction: (cluster) => neClusterIcon(cluster, type),
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 17
  });

  const layer = L.geoJSON(NE_cache[type], {
    pointToLayer: (feature, latlng) => {
      const marker = L.marker(latlng, { icon: nePatrimoineIcon(type, feature.properties?.image) });
      if (typeof onMarkerClick === 'function') {
        marker.on('click', () => onMarkerClick(latlng, feature));
      }
      return marker;
    },
    onEachFeature: (feature, layer) => layer.bindPopup(nePopupContent(feature), { maxWidth: 240 })
  });

  group.addLayer(layer);
  return group;
}

/**
 * Ajoute un bouton "Me localiser" (au lieu de forcer la
 * géolocalisation + un zoom niveau 18 dès l'ouverture de la
 * page, ce qui ralentissait le premier affichage pour tout
 * le monde, y compris ceux qui refusent la permission).
 */
function neAddLocateControl(map, onLocate) {
  const control = L.control({ position: 'topleft' });
  control.onAdd = function () {
    const btn = L.DomUtil.create('button', 'locate-btn');
    btn.type = 'button';
    btn.innerHTML = 'Me localiser';
    L.DomEvent.disableClickPropagation(btn);
    btn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par ce navigateur.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 14);
          L.marker([latitude, longitude]).addTo(map).bindPopup('Vous êtes ici').openPopup();
          if (typeof onLocate === 'function') onLocate([longitude, latitude]);
        },
        () => alert("Impossible de récupérer votre position.")
      );
    });
    return btn;
  };
  control.addTo(map);
}
