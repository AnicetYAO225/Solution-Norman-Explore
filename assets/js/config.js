/* =========================================================
   Norman'Explore — configuration centralisée
   -----------------------------------------------------------
   Toutes les clés/URLs utilisées par le site sont regroupées
   ICI, un seul endroit à modifier si une clé change, au lieu
   de la chercher dans 5 fichiers HTML différents.

   ⚠️ Ce site est statique (GitHub Pages) : ces clés restent
   visibles côté client, il n'y a pas moyen de les cacher
   totalement sans backend. Pour limiter les risques :
     1. Va dans le dashboard de chaque service (MapTiler,
        GraphHopper, OpenRouteService, Jawg) et restreins
        chaque clé par "HTTP referrer" à ton domaine
        (ex: anicetyao225.github.io/*).
     2. Régénère une clé si tu vois un usage anormal.
     3. Si un jour tu ajoutes un vrai backend, migre les appels
        sensibles (routing, isochrones) côté serveur.
   ========================================================= */

const CONFIG = {
  maptiler: {
    key: "2yXOGfpOeGCzI0c7MDKp",
    tileUrl(key) {
      return `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${key}`;
    }
  },

  jawg: {
    token: "fbHr4ScybbgkRVg27GfanQo3W7Mf2r9QCoP9Df2uxIznXIHBmnHH1eAfSBY8xBUX",
    darkTileUrl(token) {
      return `https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${token}`;
    }
  },

  graphhopper: {
    key: "b4a1cbd6-c465-496e-b98a-89b70a4edcd1",
    routeUrl: "https://graphhopper.com/api/1/route"
  },

  openRouteService: {
    key: "5b3ce3597851110001cf6248edb706190c704a56ac5ecf1a4daf78fd",
    isochroneUrl: "https://api.openrouteservice.org/v2/isochrones/driving-car"
  },

  osmBuildings: {
    tileUrl: "https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json",
    // Les bâtiments 3D ne sont chargés qu'à partir de ce niveau de zoom :
    // à l'échelle régionale ça ne sert à rien et ça ralentit tout.
    minZoom: 16
  },

  // Toutes les données GeoJSON sont désormais hébergées dans ce même
  // dépôt (assets/geo/) au lieu de dépendre d'un dépôt tiers externe :
  // plus rapide (mis en cache par GitHub Pages) et plus fiable
  // (le site ne casse pas si un autre dépôt est renommé/supprimé).
  geo: {
    departements: [
      { code: "14", nom: "Calvados", url: "assets/geo/Dep_Calvados.geojson" },
      { code: "27", nom: "Eure", url: "assets/geo/Dep_Eure.geojson" },
      { code: "50", nom: "Manche", url: "assets/geo/Dep_Manche.geojson" },
      { code: "61", nom: "Orne", url: "assets/geo/Dep_Orne.geojson" },
      { code: "76", nom: "Seine-Maritime", url: "assets/geo/Dep_Seine-Maritime.geojson" }
    ],
    mobilier: "assets/geo/bd_mobilier.geojson",
    architecture: "assets/geo/bd_architecture.geojson",
    parcours: "assets/geo/Parcours_Normadie.geojson"
  },

  map: {
    center: [49.2288, -0.094821],
    zoom: 8.4,
    minZoom: 8,
    // Sud-Ouest / Nord-Est : empêche de sortir de la Normandie
    bounds: [[48.15, -2.1], [50.2, 1.9]]
  },

  contourStyle: {
    color: "#00b4d8",
    weight: 2,
    fillOpacity: 0
  },

  patrimoineColors: {
    Mobilier: "#e8590c",
    Architecture: "#1864ab"
  }
};
