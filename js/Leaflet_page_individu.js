let map = L.map('mapContainer1', {
  zoomControl: false
}).setView([36.2048, 138.2529], 5);

L.control.scale({
  position: 'topright'
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
  map.addControl(new fullscreenControl({ position: 'topleft' }));

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
var toggleButton1 = document.getElementById('toggleLayer1');
var toggleButton2 = document.getElementById('toggleLayer2');

// État initial des couches (visibles)
var layer1Visible = true;
var layer2Visible = true;

// Ajout d'un écouteur d'événements au clic sur le bouton de bascule
toggleButton1.addEventListener('click', function () {
  if (layer1Visible) {
    // Masquer la couche 1 si elle est actuellement visible
    map.removeLayer(individusLayer);
    map.removeLayer(polyline); // Supprimer la polyligne lorsque la couche est masquée
    layer1Visible = false;
    // Mettre à jour l'icône du bouton
    toggleButton1.innerHTML = '<i class="far fa-eye-slash"></i>';
  } else {
    // Afficher la couche 1 si elle est actuellement masquée
    individusLayer.addTo(map);
    if (polyline) {
      map.addLayer(polyline); // Ajouter la polyligne lorsque la couche est affichée
    }
    layer1Visible = true;
    // Mettre à jour l'icône du bouton
    toggleButton1.innerHTML = '<i class="far fa-eye"></i>';
    polyline.bringToFront();
    individusLayer.bringToFront();
  }
});

var fukushimaLayerVisible = false; // Variable pour suivre l'état de visibilité de la couche fukushimaLayer
var japanLayerVisible = false; // Variable pour suivre l'état de visibilité de la couche japanLayer

// Fonction pour activer la couche Japan et désactiver la couche Fukushima
function activateJapanLayer() {
  if (japanLayerVisible) return;
  if (fukushimaLayerVisible) {
    map.removeLayer(fukushimaLayer);
    fukushimaLayerVisible = false;
  }
  map.addLayer(japanLayer);
  japanLayerVisible = true;
  // Assurez-vous que polyline est initialisé avant de l'utiliser
  if (polyline) {
    polyline.bringToFront();
  }
}

// Fonction pour activer la couche Fukushima et désactiver la couche Japan
function activateFukushimaLayer() {
  if (fukushimaLayerVisible) return;
  if (japanLayerVisible) {
    map.removeLayer(japanLayer);
    japanLayerVisible = false;
  }
  map.addLayer(fukushimaLayer);
  fukushimaLayerVisible = true;
  // Assurez-vous que polyline est initialisé avant de l'utiliser
  if (polyline) {
    polyline.bringToFront();
  }
}

// Modification de la fonction toggleButton2.addEventListener
toggleButton2.addEventListener('click', function () {
  // Si la couche 2 est actuellement visible
  if (layer2Visible) {
    // Masquer la couche 2 si elle est actuellement visible
    map.removeLayer(fukushimaLayer);
    map.removeLayer(japanLayer);
    layer2Visible = false;
    // Mettre à jour l'icône du bouton
    toggleButton2.innerHTML = '<i class="far fa-eye-slash"></i>';
  } else {
    // Afficher la couche correspondante à l'état des boutons d'échelle de la carte
    if (document.getElementById('option1').checked) {
      map.addLayer(japanLayer);
    } else {
      map.addLayer(fukushimaLayer);
    }
    layer2Visible = true;
    // Mettre à jour l'icône du bouton
    toggleButton2.innerHTML = '<i class="far fa-eye"></i>';
    if (polyline) {
      polyline.bringToFront();
    }
    individusLayer.bringToFront();
  }
});


// DEBUT ZOOM TO JAPAN

// Fonction pour zoomer sur le Japon et afficher uniquement la couche Japan
function zoomToJapan() {
  var bounds = [
    [20.0, 122.0],
    [45.0, 155.0]
  ];
  map.fitBounds(bounds, { padding: [50, 50] });
  activateJapanLayer();
}

function zoomToFukushima() {
  map.setView([37.41209716212062, 140.11240156125362], 9); // Centrer sur Fukushima
  // Activer la couche Fukushima
  activateFukushimaLayer();
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

// FIN PREFECTURE

// FIN CODE COMMUN A CHAQUE PAGE

// CODE PAGE INDIVIDUELLE


// Couche INDIVIDU 

var individusLayer = L.geoJSON().addTo(map);
var polyline = null; // Déclaration de la variable globale pour la polyligne

// Utiliser Fetch pour charger le fichier GeoJSON
function addindividusLayer(url) {
  // Utiliser Fetch pour charger le fichier GeoJSON depuis l'URL spécifiée
  fetch(url)
    .then(response => {
      // Vérifier si la réponse est OK (code de statut 200)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier GeoJSON');
      }
      // Convertir la réponse en JSON
      return response.json();
    })
    .then(jsonData => {
      // Trier les données par année dans l'ordre décroissant
      jsonData.features.sort((a, b) => {
        return parseInt(b.properties.Annee) - parseInt(a.properties.Annee);
      });
      // Stocker les données dans la variable data globale
      data = jsonData;

      // Événement de changement sur le formulaire de sélection d'année
      document.getElementById('id_dilemSelect').addEventListener('change', function () {
        var selectedid_dilem = this.value;
        // Vérifier si une option a été sélectionnée
        if (selectedid_dilem !== "") {
          // Supprimer la couche GeoJSON existante s'il y en a une
          if (individusLayer) {
            map.removeLayer(individusLayer);
          }
          // Création de la couche GeoJSON si une option est sélectionnée
          individusLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
              // Vérifier si l'année est égale à 0
              if (feature.properties.Annee === 0) {
                // Retourner un marqueur de type carré
                return L.marker(latlng, {
                  icon: L.divIcon({
                    className: 'square-icon',
                    iconSize: [10, 10],
                    html: '<div style="width: 10px; height: 10px; background-color: white; border: 1px solid black;"></div>'
                  })
                });
              } else {
                // Personnalisez le marqueur pour chaque point
                var annee = feature.properties.Annee; // Convertir en chaîne de caractères
                // Déterminez le style en fonction de l'année
                var fillColor;
                switch (annee) {
                  case 2017:
                    fillColor = '#bd0026';
                    break;
                  case 2016:
                    fillColor = '#f03b20';
                    break;
                  case 2015:
                    fillColor = '#fd8d3c';
                    break;
                  case 2014:
                    fillColor = '#feb24c';
                    break;
                  case 2013:
                    fillColor = '#fed976';
                    break;
                  case 2011:
                    fillColor = '#ffffb2';
                    break;
                }
                var CumulDepl = feature.properties.CumulDepl; // Obtenez la valeur de CumulDepl
                function getRadiusForCumulDepl(CumulDepl) {
                  switch (CumulDepl) {
                    case 1:
                      return 7;
                    case 2:
                      return 12;
                    case 3:
                      return 17;
                    case 4:
                      return 22;
                    case 5:
                      return 27;
                    case 6:
                      return 32;
                  }
                }
                return L.circleMarker(latlng, {
                  fillColor: fillColor,
                  color: '#000',
                  weight: 0.5,
                  opacity: 1,
                  fillOpacity: 0.8,
                  radius: getRadiusForCumulDepl(CumulDepl) // Appeler la fonction pour obtenir le rayon
                });
              }
            },
            onEachFeature: function (feature, layer) {
              // Ajout d'une popup à chaque élément de la couche GeoJSON
              if (feature.properties && feature.properties.ID_DILEM) {
                var statut = feature.properties.Statut ? feature.properties.Statut : "";
                layer.bindPopup('<strong>' + feature.properties.ID_DILEM + '</strong>' +
                  (feature.properties.Annee !== 0 ? '<br>Année : ' + feature.properties.Annee : '<br>Lieu de naissance : ' + feature.properties.Ville + ', ' + feature.properties.Departement) +
                  (feature.properties.Statut ? '<br>Statut : ' + feature.properties.Statut : '') +
                  (feature.properties.Sexe ? '<br>Sexe : ' + feature.properties.Sexe : '') +
                  (feature.properties.ClassAge ? '<br>Classe d\'âge : ' + feature.properties.ClassAge + ' ans' : '') +
                  (feature.properties.EtatCiv ? '<br>Etat civil : ' + feature.properties.EtatCiv : '') +
                  (feature.properties.SituMenage ? '<br>Situation du ménage : ' + feature.properties.SituMenage : '') +
                  (feature.properties.Profession ? '<br>Profession : ' + feature.properties.Profession : '') +
                  (feature.properties.Revenu ? '<br>Revenu annuel : ' + feature.properties.Revenu : '') +
                  (feature.properties.Annee !== 0 && feature.properties.Ville && feature.properties.Departement ? '<br>Résidence : ' + feature.properties.Ville + ', ' + feature.properties.Departement : '')
                );
              }
            }
          }).addTo(map);

          // Mettre à jour les éléments de la couche GeoJSON en fonction de l'année sélectionnée
          updateIndividus(selectedid_dilem);
        } else {
          // Si aucune option n'est sélectionnée, supprimer la couche GeoJSON de la carte
          if (individusLayer) {
            map.removeLayer(individusLayer);
          }
          // Appeler updateIndividus() avec un argument vide pour supprimer les lignes
          updateIndividus("");
        }
      });
    })
    .catch(error => {
      console.error('Erreur de chargement des données :', error);
    });
}

// Fonction pour mettre à jour les éléments de la couche GeoJSON en fonction de l'ID sélectionné
function updateIndividus(id_dilem) {
  individusLayer.clearLayers();
  var filteredFeatures = data.features.filter(function (feature) {
    return feature.properties.ID_DILEM === id_dilem;
  });
  console.log('Nombre de points filtrés par l\'ID', id_dilem, ':', filteredFeatures.length);
  individusLayer.addData({ type: 'FeatureCollection', features: filteredFeatures });

  // Supprimer la polyligne si elle existe
  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }

  // Créer une nouvelle polyligne entre les points avec des flèches
  var points = [];
  individusLayer.eachLayer(function (layer) {
    points.push(layer.getLatLng());
  });

  polyline = L.polyline(points, {
    color: 'red',
    weight: 2,
    opacity: 0.7,
    dashArray: '5, 10' // Optionnel : un trait en pointillés
  });

  if (layer1Visible) {
    // Ajouter la polyligne si la couche est actuellement affichée
    polyline.addTo(map);
  }
}
// Appel de la fonction addindividusLayer avec l'URL de votre fichier GeoJSON
addindividusLayer("data/individus.geojson");




var selectedYear = 2013; // Année par défaut

var fukushimaLayer = L.geoJSON().addTo(map);
var dataFukushima; // Déclaration de la variable dataFukushima

function addFukushimaLayer(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier GeoJSON');
      }
      return response.json();
    })
    .then(jsonData => {
      dataFukushima = jsonData;

      // Événement de changement sur le formulaire de sélection d'année
      document.getElementById('id_dilemSelect').addEventListener('change', function () {
        var selectedid_dilem = this.value;
        // Vérifier si une option a été sélectionnée
        if (selectedid_dilem !== "") {
          if (fukushimaLayer) {
            map.removeLayer(fukushimaLayer);
          }
          fukushimaLayer = L.geoJSON(dataFukushima, {
            style: function (feature) {
              return {
                fillColor: feature.properties.Zone === 1 ? 'lightgreen' : 'darkred',
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
              };
            }
          });
          // Mettre à jour les entités Fukushima lors de la sélection d'une option
          updateFukushima(selectedid_dilem, selectedYear);
        } else {
          // Si "Aucun ID" est sélectionné, supprimer la couche Fukushima de la carte
          if (map.hasLayer(fukushimaLayer)) {
            map.removeLayer(fukushimaLayer);
          }
        }
      });
    })
    .catch(error => {
      console.error('Erreur de chargement des données :', error);
    });
}

// Fonction pour mettre à jour les entités de Fukushima en fonction de l'ID sélectionné et de l'année
function updateFukushima(id_dilem, selectedYear) {
  if (!layer2Visible) return;
  if (id_dilem === "") {
    // Si aucun ID n'est sélectionné, supprimer la couche Fukushima de la carte
    if (map.hasLayer(fukushimaLayer)) {
      map.removeLayer(fukushimaLayer);
    }
    return; // Sortie de la fonction
  }

  if (!fukushimaLayer) {
    return; // Sortie si la couche Fukushima n'a pas été ajoutée
  }

  var fukushimaLayerWasVisible = fukushimaLayerVisible;

  fukushimaLayer.clearLayers();
  var filteredFeatures = dataFukushima.features.filter(function (feature) {
    return feature.properties.ID_DILEM === id_dilem && feature.properties.Annee === selectedYear; // Filtrer par l'année spécifiée
  });
  console.log('Nombre de dessins filtrés par l\'ID', id_dilem, 'et année', selectedYear, 'pour Fukushima:', filteredFeatures.length);
  fukushimaLayer.addData({ type: 'FeatureCollection', features: filteredFeatures });

  if (fukushimaLayerWasVisible) {
    // Si la couche Fukushima était visible avant la mise à jour, la réactiver
    map.addLayer(fukushimaLayer);
  }
  polyline.bringToFront();
  individusLayer.bringToFront();
}


// Événement de changement sur le curseur de sélection d'année
document.getElementById('slider').addEventListener('input', function () {
  selectedYear = parseInt(this.value); // Récupérer la nouvelle année sélectionnée
  var selectedid_dilem = document.getElementById('id_dilemSelect').value; // Récupérer l'ID_DILEM actuellement sélectionné
  updateFukushima(selectedid_dilem, selectedYear); // Mettre à jour les entités Fukushima avec la nouvelle année
});

// Appel de la fonction addFukushimaLayer avec l'URL de votre fichier GeoJSON
addFukushimaLayer("data/fukushima.geojson");





var japanLayer = L.geoJSON().addTo(map);
var dataJapan; // Déclaration de la variable dataJapan

function addJapanLayer(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier GeoJSON');
      }
      return response.json();
    })
    .then(jsonData => {
      dataJapan = jsonData;

      // Événement de changement sur le formulaire de sélection d'année
      document.getElementById('id_dilemSelect').addEventListener('change', function () {
        var selectedid_dilem = this.value;
        // Vérifier si une option a été sélectionnée
        if (selectedid_dilem !== "") {
          if (japanLayer) {
            map.removeLayer(japanLayer);
          }
          japanLayer = L.geoJSON(dataJapan, {
            style: function (feature) {
              return {
                fillColor: feature.properties.Zone === 1 ? 'lightgreen' : 'darkred',
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
              };
            }
          });
          // Mettre à jour les entités Japan lors de la sélection d'une option
          updateJapan(selectedid_dilem, selectedYear);
        } else {
          // Si "Aucun ID" est sélectionné, supprimer la couche Japan de la carte
          if (map.hasLayer(japanLayer)) {
            map.removeLayer(japanLayer);
          }
        }
      });
    })
    .catch(error => {
      console.error('Erreur de chargement des données :', error);
    });
}

// Fonction pour mettre à jour les entités de Japan en fonction de l'ID sélectionné et de l'année
function updateJapan(id_dilem, selectedYear) {
  if (!layer2Visible) return;
  if (id_dilem === "") {
    // Si aucun ID n'est sélectionné, supprimer la couche Japan de la carte
    if (map.hasLayer(japanLayer)) {
      map.removeLayer(japanLayer);
    }
    return; // Sortie de la fonction
  }

  if (!japanLayer) {
    return; // Sortie si la couche Japan n'a pas été ajoutée
  }

  var japanLayerWasVisible = japanLayerVisible;

  japanLayer.clearLayers();
  var filteredFeatures = dataJapan.features.filter(function (feature) {
    return feature.properties.ID_DILEM === id_dilem && feature.properties.Annee === selectedYear; // Filtrer par l'année spécifiée
  });
  console.log('Nombre de dessins filtrés par l\'ID', id_dilem, 'et année', selectedYear, 'pour Japan:', filteredFeatures.length);
  japanLayer.addData({ type: 'FeatureCollection', features: filteredFeatures });

  if (japanLayerWasVisible) {
    // Si la couche Japan était visible avant la mise à jour, la réactiver
    map.addLayer(japanLayer);
  }
  polyline.bringToFront();
  individusLayer.bringToFront();
}

// Événement de changement sur le curseur de sélection d'année
document.getElementById('slider').addEventListener('input', function () {
  selectedYear = parseInt(this.value); // Récupérer la nouvelle année sélectionnée
  var selectedid_dilem = document.getElementById('id_dilemSelect').value; // Récupérer l'ID_DILEM actuellement sélectionné
  updateJapan(selectedid_dilem, selectedYear); // Mettre à jour les entités Japan avec la nouvelle année
});

// Appel de la fonction addJapanLayer avec l'URL de votre fichier GeoJSON
addJapanLayer("data/japon.geojson");

activateJapanLayer();



// LEGENDE ADAPTATIVE 
var legendIndiv = L.control({ position: 'bottomright' });
legendIndiv.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
  div.style.backgroundColor = '#eff6f8'; // Changer la couleur de fond
  div.style.border = '1px solid black'; // Bordures noires
  div.style.borderRadius = '10px'; // Bordures arrondies
  div.style.padding = '10px'; // Marge intérieure
  div.style.maxWidth = '600px'; // Taille maximale de la légende
  div.style.maxHeight = '400px'; // Taille maximale de la légende
  div.innerHTML = '<div id="trajectoireContent">' +
  '<h3 style="font-size: 0.9em;"> Trajectoire individuelle</h5>' +
  '<h6 style="font-size: 0.8em;"> Lieu de naissance et de résidence</h6>' +
  '<div style="background-color: #fff; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de naissance  </h7>'+'<br>' +
  '<div style="background-color: #ffffb2; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw; border-radius: 50%;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de résidence en 2011 </h7>'+'<br>' +
  '<div style="background-color: #fed976; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw; border-radius: 50%;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de résidence en 2013 </h7>'+'<br>' +
  '<div style="background-color: #feb24c; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw; border-radius: 50%;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de résidence en 2014 </h7>'+'<br>' +
  '<div style="background-color: #fd8d3c; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw; border-radius: 50%;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de résidence en 2015 </h7>'+'<br>' +
  '<div style="background-color: #f03b20; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw; border-radius: 50%;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de résidence en 2016 </h7>'+'<br>' +
  '<div style="background-color: #bd0026; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw; border-radius: 50%;"></div>' + '<h7 style="font-size: 0.8em;"> Lieu de résidence en 2017 </h7>'+'<br>' +
  '<h6 style="margin-bottom: 0.5vw; font-size: 0.8em;">Nombre d\'années à la même résidence</h6>' +
  '<div style="position: relative; width: 5vw; height: 2.8vw;left:-1.5vw">' +
      '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); background-color: rgba(245,245,245, 0.1); width: 1.2vw; height: 1.2vw; border-radius: 50%; border: 1px solid black;"></div>' +
      '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); background-color: rgba(245,245,245, 0.1); width: 1.5vw; height: 1.5vw; border-radius: 50%; border: 1px solid black;"></div>' +
      '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); background-color: rgba(245,245,245, 0.1); width: 1.8vw; height: 1.8vw; border-radius: 50%; border: 1px solid black;"></div>' +
      '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); background-color: rgba(245,245,245, 0.1); width: 2.1vw; height: 2.1vw; border-radius: 50%; border: 1px solid black;"></div>' +
      '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); background-color: rgba(245,245,245, 0.1); width: 2.4vw; height: 2.4vw; border-radius: 50%; border: 1px solid black;"></div>' +
      '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); background-color: rgba(245,245,245, 0.1); width: 2.8vw; height: 2.8vw; border-radius: 50%; border: 1px solid black;"></div>' +
      '<div style="position: absolute; left: 60%; bottom: 1.125vw; transform: translateX(-35%); width: 2vw; height: 0.05vw; background-color: black;"></div>' +
      '<div style="position: absolute; left: 80%; bottom: 0.6vw; transform: translateX(50%); text-align: center; width: -10vw;">1</div>' +
      '<div style="position: absolute; left: 85%; bottom: 2.75vw; transform: translateX(-50%); width: 4vw; height: 0.05vw; background-color: black;"></div>' +
      '<div style="position: absolute; left: 100%; bottom: 2.125vw; transform: translateX(-18%); text-align: center; width: 5vw;">6</div>' +
  '</div>' + '</div>' +
  '<div id="dessinContent">' +
  '<div><h5 style="font-size: 0.8em;"> Perception du risque</h5></div>' +
  '<div style="background-color: #afe9ad; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw;"></div>' + '<h7 style="font-size: 0.8em;"> Zone considérée sûre </h7>'+'<br>' +
  '<div style="background-color: #ae7264; width: 1vw; height: 1vw; display: inline-block; margin-right: 0.5vw;"></div>' + '<h7 style="font-size: 0.8em;"> Zone considérée dangereuse </h7>'+'<br>' +
  '</div>';


  return div;
};
legendIndiv.addTo(map);

// Fonction pour mettre à jour la légende en fonction de l'état de visibilité de la couche des points
function updateLegend() {
  var trajectoireLegend = document.getElementById('trajectoireContent');
  var dessinLegend = document.getElementById('dessinContent');
  var legendContainer = document.getElementsByClassName('info legend')[0]; // Sélectionner le conteneur de la légende

  // Vérifier si la couche des points est affichée et si un ID_DILEM est sélectionné
  if (map.hasLayer(individusLayer) && document.getElementById('id_dilemSelect').value !== "") {
    trajectoireLegend.style.display = 'block'; // Afficher la légende des points
  } else {
    trajectoireLegend.style.display = 'none'; // Masquer la légende des points
  }

  // Vérifier si la couche Japan ou la couche Fukushima est affichée et si un ID_DILEM est sélectionné
  if ((map.hasLayer(japanLayer) || map.hasLayer(fukushimaLayer)) && document.getElementById('id_dilemSelect').value !== "") {
    dessinLegend.style.display = 'block'; // Afficher la légende des dessins
  } else {
    dessinLegend.style.display = 'none'; // Masquer la légende des dessins
  }

  // Vérifier si aucune partie de la légende n'est active, puis masquer le conteneur de la légende
  if (trajectoireLegend.style.display === 'none' && dessinLegend.style.display === 'none') {
    legendContainer.style.display = 'none'; // Masquer le conteneur de la légende
  } else {
    legendContainer.style.display = 'block'; // Afficher le conteneur de la légende
  }
}

// Ajoutez une écoute d'événement pour mettre à jour la légende lors de l'ajout ou la suppression de la couche des points
map.on('layeradd layerremove', function () {
  updateLegend();
});

// Appel initial pour mettre à jour la légende
updateLegend();

function toggleBVisibility() {
  var select = document.getElementById("id_dilemSelect");
  var divB = document.getElementById("B");
  divB.style.display = select.value ? "block" : "none";
}