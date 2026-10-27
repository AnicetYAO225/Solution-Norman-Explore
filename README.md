# Norman'Explore

Application web cartographique dédiée à la découverte et à la valorisation du patrimoine
normand (mobilier et architectural), avec des parcours adaptés aux mobilités douces
(marche, vélo, transport en commun) et une vue 3D immersive de la région.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation et développement local](#installation-et-développement-local)
- [Déploiement](#déploiement)
- [Configuration (clés API)](#configuration-clés-api)
- [Choix de performance](#choix-de-performance)
- [Feuille de route](#feuille-de-route)
- [Licence](#licence)

---

## Fonctionnalités

| Page | Description |
|---|---|
| `index.html` | Page d'accueil et présentation du projet |
| `carte.html` | Carte interactive du patrimoine normand : recherche d'itinéraire, filtres par couche (Mobilier / Architecture), isochrones de temps de trajet, **vue 3D** inclinable/pivotable |
| `parcours.html` | Aperçu touristique par ville (Rouen, Caen, Alençon, Évreux, Saint-Lô) avec estimation de durée à vélo / en transport |
| `mobilite.html` | Sélection de sites patrimoniaux sur la carte et calcul d'itinéraire à pied ou à vélo |
| `contribution.html` | Formulaire de signalement d'un élément de patrimoine (géolocalisation incluse) |
| `filtre.html` | Filtres croisés type / époque / département avec statistiques et diaporama |

## Stack technique

- **Cartographie 2D :** [Leaflet](https://leafletjs.com/) + [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- **Cartographie 3D :** [MapLibre GL JS](https://maplibre.org/) (style vectoriel + bâtiments extrudés)
- **Fonds de carte :** [MapTiler](https://www.maptiler.com/), [Jawg Maps](https://www.jawg.io/)
- **Géocodage / itinéraires :** [Nominatim (OSM)](https://nominatim.org/), [GraphHopper](https://www.graphhopper.com/), [OpenRouteService](https://openrouteservice.org/) (isochrones)
- **Visualisation de données :** [Chart.js](https://www.chartjs.org/)
- **Données :** GeoJSON auto-hébergé (voir `assets/geo/`)
- Aucun framework front, aucune étape de build : HTML/CSS/JS natifs, déployable tel quel sur GitHub Pages.

## Structure du projet

```
DocV/
├── index.html                Accueil
├── carte.html                 Carte principale (2D + bascule 3D)
├── parcours.html               Aperçu touristique par ville
├── mobilite.html                Mobilité douce + activité éco-responsable
├── contribution.html            Formulaire de contribution
├── filtre.html                   Filtres et statistiques
├── assets/
│   ├── css/
│   │   └── style.css          Design system partagé (header, nav, footer, cartes, marqueurs)
│   ├── js/
│   │   ├── config.js           Clés API et chemins de données, centralisés
│   │   └── map-common.js       Fonctions cartographiques partagées (fond de carte, clustering,
│   │                            icônes, chargement à la demande, géolocalisation)
│   ├── geo/                    Données GeoJSON auto-hébergées (contours, patrimoine, parcours)
│   └── img/
│       └── Logo_GeoTech.png
└── README.md
```

## Installation et développement local

Le site est 100 % statique. Comme les pages chargent des données via `fetch()`, il faut les
servir par HTTP (ouvrir un fichier en double-clic ne fonctionne pas : les navigateurs bloquent
les requêtes locales en `file://`).

```bash
git clone https://github.com/AnicetYAO225/DocV.git
cd DocV
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/index.html
```

Toute alternative fonctionne aussi bien : extension *Live Server* de VS Code, `npx serve`, etc.

## Déploiement

Le site est déployé via **GitHub Pages** depuis la branche `main` :
`Paramètres du dépôt → Pages → Source : main / (root)`.
Chaque `git push` sur `main` republie automatiquement le site.

## Configuration (clés API)

Toutes les clés utilisées par le site (MapTiler, Jawg, GraphHopper, OpenRouteService) sont
centralisées dans `assets/js/config.js`. Le site étant statique, ces clés restent visibles
côté client — il n'existe pas de moyen de les cacher totalement sans backend. Pour limiter les
risques d'abus :

1. Dans le dashboard de chaque service, restreins la clé par **HTTP referrer** à ton domaine
   (`anicetyao225.github.io/*`).
2. Régénère une clé si tu constates un usage anormal (quota dépassé, requêtes suspectes).
3. Si le projet évolue vers une vraie application avec backend, migre les appels sensibles
   (routing, isochrones) côté serveur.

## Choix de performance

Ce dépôt a fait l'objet d'une refonte visant à corriger plusieurs sources de lenteur de la
version précédente :

- **Chargement à la demande** des couches de patrimoine (boutons *Mobilier* / *Architecture*),
  avec mise en cache mémoire, plutôt que de tout charger au démarrage.
- **Icônes en cercle avec miniature photo** pour les points affichés, mais uniquement pour les
  marqueurs réellement rendus à l'écran — le clustering limite naturellement leur nombre.
  Les clusters eux-mêmes restent en CSS pur (pas de photo) pour rester légers à tout niveau de zoom.
- **Données auto-hébergées** dans `assets/geo/` (2 fichiers consolidés au lieu de 10, plus de
  dépendance à un dépôt tiers).
- **Bâtiments 3D chargés progressivement** dans la vue 3D dédiée, plutôt qu'en permanence
  sur la carte principale.
- **Géolocalisation sur action explicite** (bouton *Me localiser*) plutôt qu'automatique au
  chargement.

## Feuille de route

- [ ] Relier le formulaire de contribution à un vrai stockage (API, base de données, ou a minima
      un service de type Google Sheets / Airtable).
- [ ] Ajouter une pagination ou un chargement progressif sur `filtre.html` pour de très gros volumes.
- [ ] Explorer un mode hors-ligne (Service Worker) pour les zones à faible connectivité.
