let map = L.map('mapContainer1', {
  zoomControl: false
}).setView([36.2048, 138.2529], 5);
L.control.scale({
  position: 'bottomleft'
}).addTo(map);
L.control.zoom({
  position: 'topright'
}).addTo(map);
const sidepanelLeft = L.control.sidepanel('mySidepanelLeft', {
  tabsPosition: 'left',
  startTab: 'tab-1'
}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// PLEIN ECRAN
// Création d'un contrôle personnalisé pour le bouton de plein écran
var fullscreenControl = L.Control.extend({
  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    var button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-control-custom', container);
    button.innerHTML = '<i class="fas fa-expand"></i>'; // icône pour entrer en plein écran par défaut
    button.href = '#';
    button.role = 'button';
    button.style.backgroundColor = 'white';
    button.style.width = '30px';
    button.style.height = '30px';
    button.style.borderRadius = '5px';
    button.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
    button.style.textAlign = 'center';
    button.style.lineHeight = '30px';
    button.style.textDecoration = 'none';
    button.style.color = '#333';
    button.style.fontFamily = 'sans-serif';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';

    button.onclick = function () {
      toggleFullScreen();
    }

    return container;
  },
});

// Ajout du contrôle personnalisé à la carte Leaflet
map.addControl(new fullscreenControl({ position: 'topright' }));

// Fonction pour mettre la carte en plein écran
function toggleFullScreen() {
  var elem = document.getElementById('map-container-wrapper');
  var button = document.querySelector('.leaflet-control-custom');

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
    button.innerHTML = '<i class="fas fa-compress"></i>'; // icône pour sortir du plein écran
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    button.innerHTML = '<i class="fas fa-expand"></i>'; // icône pour entrer en plein écran
  }
}

// PLEIN ECRAN FIN


// DEBUT ZOOM TO JAPAN
function zoomToJapan() {
  // Définir une étendue qui couvre l'ensemble du Japon
  var bounds = [
    [20.0, 122.0], // Coin sud-ouest
    [45.0, 155.0]  // Coin nord-est
  ];

  // Centrer et zoomer sur l'ensemble du Japon
  map.fitBounds(bounds, { padding: [50, 50] ,maxZoom: 6}); // Vous pouvez ajuster le padding selon vos besoins
}

function zoomToFukushima() {
  map.flyTo([37.41209716212062, 140.11240156125362], 10,{
    duration: 1, // Durée du déplacement en secondes
    easeLinearity: 0. // Facteur de linéarité de l'animation
  }); // Centrer sur Fukushima
}
// FIN ZOOM TO JAPAN FIN

// DEBUT PREFECTURE

// On importe la futur symbologie de la centrale nucléaire qui sera une image
var customIcon = L.icon({
  iconUrl: 'img/nuclear.png',
  iconSize: [32, 32]
});

// Ajout de la couche GeoJSON de la centrale et d'une popup affichant son nom au click
function ChargerCentrale() {
  return fetch('data/centrale.geojson')
    .then(response => response.json());
}

ChargerCentrale()
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        var marker = L.marker(latlng, { icon: customIcon });
        var popupContent = feature.properties.Nom;
        marker.bindPopup(popupContent);
        return marker;
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données:', error);
  });

// Affichage de la prefecture

// Fetch pour récupérer les données des préfectures
fetch('data/prefecture.geojson')
  .then(response => response.json())
  .then(data => {
    prefectureLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          fillOpacity: 0,
          color: 'white',
          weight: 1.25
        };
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données des préfectures:', error);
  });

// FIN CODE COMMUN A CHAQUE PAGE




// DEBUT PAGE n°2 GROUPE

// AJOUTER HEATMAP
var map2;

// Fonction pour créer et afficher la deuxième carte et la heatmap
function showSecondMapAndHeatmap() {
  // Afficher ou cacher la deuxième carte en fonction de l'état de la checkbox
  var mapContainer2 = document.getElementById('mapContainer2');
  mapContainer2.style.display = document.getElementById('showSecondMapCheckbox').checked ? 'block' : 'none';

  // Si la carte est affichée, créer une carte Leaflet centrée sur New York, USA
  if (mapContainer2.style.display === 'block') {
    map2 = L.map('mapContainer2').setView([36.2048, 138.2529], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map2);
    L.control.scale({
      position: 'topright'
    }).addTo(map2);
    map2.zoomControl.remove();

    // Si la checkbox est cochée, afficher la heatmap
    if (document.getElementById('showSecondMapCheckbox').checked) {
      fetchHeatmapData(map2);
    }

    // Synchroniser les mouvements des deux cartes
    syncMaps();
  }
}

// Fonction pour récupérer les données de la heatmap et afficher la heatmap sur map2
function fetchHeatmapData(map2) {
  fetch('data/Heatmap.geojson')
    .then(response => response.json())
    .then(data => {
      var heatData = [];
      var features = data.features;
      features.forEach(function (feature) {
        var coordinates = feature.geometry.coordinates;
        var radiationValue = feature.properties.radiation;
        heatData.push([coordinates[0][1], coordinates[0][0], radiationValue]);
      });
      // Créer la heatmap avec les données et l'ajouter à map2
      var heat = L.heatLayer(heatData, {
        radius: 10,
        gradient: {
          0.25: 'blue',   // Low values
          0.5: 'lime',    // Moderate values
          0.75: 'yellow', // High values
          1: 'red'        // Maximum values
        }
      }).addTo(map2);
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données de la heatmap:', error);
    });
}

// Fonction pour synchroniser les mouvements des deux cartes
function syncMaps() {
  map.on('move', function () {
    map2.setView(map.getCenter(), map.getZoom(), { animate: false });
  });
  map2.on('move', function () {
    map.setView(map2.getCenter(), map2.getZoom(), { animate: false });
  });
}
document.getElementById('showSecondMapCheckbox').addEventListener('change', function() {
  var mapContainer1 = document.getElementById('mapContainer1');
  if (this.checked) {
    // Si la case à cocher est cochée, changer la largeur de #mapContainer1 à 65%
    mapContainer1.style.width = '65%';
    tileLayer.attributionControl.removeAttribution('');
  } else {
    // Sinon, rétablir la largeur de #mapContainer1 à 100%
    mapContainer1.style.width = '100%';
    tileLayer.attributionControl.addAttribution('<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>');
  }
});

// Ajouter un écouteur d'événements au changement de l'état de la checkbox pour la deuxième carte et la heatmap
document.getElementById('showSecondMapCheckbox').addEventListener('change', function () {
  showSecondMapAndHeatmap();
});

// FIN AJOUT HEAMAP

// AJOUT DES PERCEPTION


// Fonction pour filtrer les données en fonction de la catégorie sélectionnée
function loadConsensusFukushima() {
  var selectedRadio = document.querySelector('input[name="radio"]:checked');
  var selectedOption = document.getElementById('options_individu').value;
  var selectedYear = document.getElementById('slider').value;
  var zoneValue;

  // Vérifier si une catégorie est sélectionnée
  if (selectedRadio) {
    var selectedCategory = selectedRadio.value;

    // Déterminer la valeur de zone en fonction de la catégorie sélectionnée
    switch (selectedCategory) {
      case 'Zones jugées sûres':
        zoneValue = 1;
        break;
      case 'Zones jugées dangereuses':
        zoneValue = 2;
        break;
      case 'Zones intersticielles':
        zoneValue = 3;
        break;
      default:
        zoneValue = 1; // Valeur par défaut
        break;
    }

    // Utiliser une échelle de couleur continue
    function getColor(normalizedValue, zoneValue) {
      if (zoneValue === 1) {
        return normalizedValue === 0 ? '#fff' :
          normalizedValue < 0.2 ? '#f7fcfd' :
            normalizedValue < 0.3 ? '#e5f5f9' :
              normalizedValue < 0.4 ? '#ccece6' :
                normalizedValue < 0.5 ? '#99d8c9' :
                  normalizedValue < 0.6 ? '#66c2a4' :
                    normalizedValue < 0.7 ? '#41ae76' :
                      normalizedValue < 0.8 ? '#238b45' :
                        normalizedValue < 0.9 ? '#006d2c' :
                          normalizedValue <= 1 ? '#00441b' :
                            '#2171b5';
      } else if (zoneValue === 2) {
        return normalizedValue === 0 ? '#fff' :
          normalizedValue < 0.2 ? '#fff5f0' :
            normalizedValue < 0.3 ? '#fee0d2' :
              normalizedValue < 0.4 ? '#fcbba1' :
                normalizedValue < 0.5 ? '#fc9272' :
                  normalizedValue < 0.6 ? '#fb6a4a' :
                    normalizedValue < 0.7 ? '#ef3b2c' :
                      normalizedValue < 0.8 ? '#cb181d' :
                        normalizedValue < 0.9 ? '#a50f15' :
                          normalizedValue <= 1 ? '#67000d' :
                            '#2171b5';
      } else {
        return d3.interpolateReds(normalizedValue);
      }
    }

    // Construire l'URL avec les paramètres de requête annee, zone et option
    var url;
    if (selectedOption === 'all' || selectedOption === null) {
      url = 'http://localhost:5000/fukushima?annee=' + selectedYear + '&zone=' + zoneValue;
    } else {
      url = 'http://localhost:5000/fukushima?annee=' + selectedYear + '&zone=' + zoneValue + '&options=' + selectedOption;
    }
    // Supprimer la couche existante de la carte
    map.eachLayer(function (layer) {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    fetch(url, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        var minCount = data.min_count;
        var maxCount = data.max_count;

        L.geoJson(data.geojson, {
          style: function (feature) {
            var id_dilem_counts = feature.properties.id_dilem_counts;
            console.log("id_dilem_counts:", id_dilem_counts);
            console.log("minCount:", minCount);
            console.log("maxCount:", maxCount);
            // Normaliser la valeur entre 0 et 1
            var normalizedValue = (id_dilem_counts - minCount) / (maxCount - minCount);
            console.log("normalizedValue:", normalizedValue);

            // Définir la couleur en fonction du count
            var color = getColor(normalizedValue, zoneValue);
            console.log("color:", color);
            return {
              fillColor: color,
              weight: 0,
              opacity: 1,
              color: 'white',
              fillOpacity: 1
            };
          }
        }).addTo(map);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  } else {
    console.error('No radio button selected');
  }
}

// Fonction pour charger la couche consensus_japon
function loadConsensusJapon() {
  var selectedRadio = document.querySelector('input[name="radio"]:checked');
  var selectedOption = document.getElementById('options_individu').value;
  var selectedYear = document.getElementById('slider').value;
  var zoneValue;

  // Vérifier si une catégorie est sélectionnée
  if (selectedRadio) {
    var selectedCategory = selectedRadio.value;

    // Déterminer la valeur de zone en fonction de la catégorie sélectionnée
    switch (selectedCategory) {
      case 'Zones jugées sûres':
        zoneValue = 1;
        break;
      case 'Zones jugées dangereuses':
        zoneValue = 2;
        break;
      case 'Zones intersticielles':
        zoneValue = 3;
        break;
      default:
        zoneValue = 1; // Valeur par défaut
        break;
    }

    // Utiliser une échelle de couleur continue
    function getColor(normalizedValue, zoneValue) {
      if (zoneValue === 1) {
        return normalizedValue === 0 ? '#fff' :
          normalizedValue < 0.2 ? '#f7fcfd' :
            normalizedValue < 0.3 ? '#e5f5f9' :
              normalizedValue < 0.4 ? '#ccece6' :
                normalizedValue < 0.5 ? '#99d8c9' :
                  normalizedValue < 0.6 ? '#66c2a4' :
                    normalizedValue < 0.7 ? '#41ae76' :
                      normalizedValue < 0.8 ? '#238b45' :
                        normalizedValue < 0.9 ? '#006d2c' :
                          normalizedValue <= 1 ? '#00441b' :
                            '#2171b5';
      } else if (zoneValue === 2) {
        return normalizedValue === 0 ? '#fff' :
          normalizedValue < 0.2 ? '#fff5f0' :
            normalizedValue < 0.3 ? '#fee0d2' :
              normalizedValue < 0.4 ? '#fcbba1' :
                normalizedValue < 0.5 ? '#fc9272' :
                  normalizedValue < 0.6 ? '#fb6a4a' :
                    normalizedValue < 0.7 ? '#ef3b2c' :
                      normalizedValue < 0.8 ? '#cb181d' :
                        normalizedValue < 0.9 ? '#a50f15' :
                          normalizedValue <= 1 ? '#67000d' :
                            '#2171b5';
      } else {
        return d3.interpolateReds(normalizedValue);
      }
    }

    // Construire l'URL avec les paramètres de requête annee, zone et option
    var url;
    if (selectedOption === 'all' || selectedOption === null) {
      url = 'http://localhost:5000/japon?annee=' + selectedYear + '&zone=' + zoneValue;
    } else {
      url = 'http://localhost:5000/japon?annee=' + selectedYear + '&zone=' + zoneValue + '&options=' + selectedOption;
    }
    // Supprimer la couche existante de la carte
    map.eachLayer(function (layer) {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    fetch(url, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        var minCount = data.min_count;
        var maxCount = data.max_count;

        L.geoJson(data.geojson, {
          style: function (feature) {
            var id_dilem_counts = feature.properties.id_dilem_counts;
            console.log("id_dilem_counts:", id_dilem_counts);
            console.log("minCount:", minCount);
            console.log("maxCount:", maxCount);
            // Normaliser la valeur entre 0 et 1
            var normalizedValue = (id_dilem_counts - minCount) / (maxCount - minCount);
            console.log("normalizedValue:", normalizedValue);

            // Définir la couleur en fonction du count
            var color = getColor(normalizedValue, zoneValue);
            console.log("color:", color);
            return {
              fillColor: color,
              weight: 0,
              opacity: 1,
              color: 'white',
              fillOpacity: 1
            };
          }
        }).addTo(map);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  } else {
    console.error('No radio button selected');
  }
}

// Définir les limites géographiques de la couche Fukushima
var fukushimaBounds = [
  [36.9129, 139.2661], // Coin sud-ouest de Fukushima 
  [37.7941, 140.8584]  // Coin nord-est de Fukushima
];

// Définir les limites géographiques du Japon
var japanBounds = [
  [30.287, 127.558], // Coin sud-ouest du Japon
  [44.849, 143.698] // Coin nord-est du Japon
];

// Ajouter un écouteur d'événements pour surveiller les changements dans la liste déroulante
document.getElementById('searchButton').addEventListener('click', function () {
  // Récupérer la valeur sélectionnée du bouton radio
  var selectedOption = document.querySelector('input[name="options_couche"]:checked').value;
  var coucheValue;

  // Déterminer la valeur de zone en fonction de la valeur sélectionnée du bouton radio
  if (selectedOption === 'japan') {
    coucheValue = 1; // Valeur pour le Japon
    loadConsensusJapon(); // Charger la couche consensus_japon
    bounds = japanBounds;
  }
  else if (selectedOption === 'fukushima') {
    coucheValue = 2; // Valeur pour Fukushima
    bounds = fukushimaBounds;
    loadConsensusFukushima(coucheValue); // Filtrer les données pour la couche consensus_fukushima
  } else {
    console.error('Invalid option selected');
    return; // Arrêter l'exécution si aucune option valide n'est sélectionnée
  }

  // Zoomer sur les limites géographiques définies
  map.fitBounds(bounds, { padding: [50, 50] });
});


// Définir la fonction pour générer la légende
function generateLegend(title, colors, labels) {
  var legendDiv = document.getElementById('legend_groupe');
  var legendContent = '';

  legendContent += '<h3 class="legend-title">' + title + '</h3>';

  // Générer les carrés colorés avec les étiquettes correspondantes
  for (var i = 0; i < colors.length; i++) {
    legendContent += '<div class="legend-item">';
    legendContent += '<div class="legend-square" style="background-color:' + colors[i] + ';"></div>';
    legendContent += '</div>';
  }

  legendContent += '<div class="legend-labels">';
  for (var j = 0; j < labels.length; j++) {
    legendContent += '<span class="legend-label">' + labels[j] + '</span>';
  }
  legendContent += '</div>';

  legendDiv.innerHTML = legendContent;
}

// Fonction pour afficher la légende lorsque le bouton est cliqué
function afficherLegende() {
  var legend = document.getElementById("legend_groupe");
  legend.style.display = "block";
}

// Ajouter un gestionnaire d'événements de clic au bouton pour afficher la légende
document.getElementById("searchButton").addEventListener("click", afficherLegende);


// BUTTON DE RECHERCHE 

document.getElementById('searchButton').addEventListener('click', function () {
  var selectedCategory = document.querySelector('input[name="radio"]:checked').value;

  if (selectedCategory === 'Zones jugées sures') {
    var title = 'Pourcentage des enquêtés sélectionnés<br>jugeant la zone sûre';
    var colors = ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'];
    var labels = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'];
    generateLegend(title, colors, labels);
  } else if (selectedCategory === 'Zones jugées dangereuses') {
    var title = 'Pourcentage des enquêtés sélectionnés<br>jugeant la zone dangereuse'
    var colors = ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'];
    var labels = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'];
    generateLegend(title, colors, labels);
  } else {
    console.error('Invalid option selected');
    return; // Arrêter l'exécution si aucune option valide n'est sélectionnée
  }
});