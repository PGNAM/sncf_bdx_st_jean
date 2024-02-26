// Récupérer l'élément <ul> où afficher les départs
const departuresList = document.getElementById('departures-list');
// Stocker les données précédentes pour comparaison
let previousData = [];

// Fonction pour supprimer le texte entre parenthèses d'une chaîne de caractères
function removeTextInParentheses(text) {
    return text.replace(/\s*\(.*?\)\s*/g, '');
}

// Fonction pour récupérer les 6 premiers éléments du tableau de données
function getFirstSixDepartures(data) {
    return data.slice(0, 6);
}

// Fonction pour mettre à jour les départs affichés
function updateDepartures(data) {
    // Effacer la liste actuelle des départs
    departuresList.innerHTML = '';

    // Parcourir les nouveaux départs
    data.forEach(departure => {
        // Créer les éléments HTML pour chaque information
        const listItem = document.createElement('li');
        const lineOrTrainNumberElement = document.createElement('div');
        const destinationElement = document.createElement('div');
        const delayStatusElement = document.createElement('div');
        const platformElement = document.createElement('div'); // Nouvelle colonne pour le quai
        const departureTimeElement = document.createElement('div'); // Nouvelle colonne pour l'horaire

        // Récupérer les informations
        const commercialMode = departure.display_informations.commercial_mode;
        const headsign = departure.display_informations.headsign;
        const destination = departure.display_informations.direction;
        const baseDepartureDateTime = departure.stop_date_time.base_departure_date_time;
        const isDelayed = departure.stop_date_time.delayed; // Utilisation de la propriété "delayed"
        const platform = departure.stop_point.platform;

        let lineOrTrainNumber = '';

        // Utiliser le champ "headsign" pour récupérer le numéro du train pour TGV INOUI, OUIGO ou Intercités
        if (commercialMode === 'TGV INOUI' || commercialMode === 'TGV OUIGO' || commercialMode === 'Intercités') {
            const trainNumberMatch = headsign.match(/\b[0-9]{1,4}\b/);
            lineOrTrainNumber = trainNumberMatch ? trainNumberMatch[0] : headsign;
        } else if (commercialMode === 'TER' || commercialMode === 'TER NA') {
            lineOrTrainNumber = headsign || '';
        }

        // Supprimer le texte entre parenthèses du nom de la destination
        const cleanDestination = removeTextInParentheses(destination);

        // Extraire l'heure de départ au format HH:MM à partir de l'horaire de base
        const baseDepartureTime = baseDepartureDateTime.substring(9, 11) + ':' + baseDepartureDateTime.substring(11, 13);

        // Assigner les informations aux éléments
        lineOrTrainNumberElement.textContent = lineOrTrainNumber;
        destinationElement.textContent = cleanDestination;
        delayStatusElement.textContent = isDelayed ? 'En retard' : 'À l\'heure'; // Utilisation de la propriété "delayed"
        platformElement.textContent = platform || ''; // Afficher le quai si l'info est dispo
        departureTimeElement.textContent = baseDepartureTime; // Afficher l'horaire

        // Ajouter une classe spéciale si le quai est disponible
        if (platform) {
            platformElement.classList.add('platform');
        }

        // Ajouter les éléments à la liste
        listItem.appendChild(lineOrTrainNumberElement);
        listItem.appendChild(destinationElement);
        listItem.appendChild(delayStatusElement);
        listItem.appendChild(platformElement); // Ajouter la colonne du quai
        listItem.appendChild(departureTimeElement); // Ajouter la colonne pour l'horaire
        departuresList.appendChild(listItem);
    });
}

// Fonction pour récupérer les données et les afficher
function fetchAndDisplayDepartures() {
    // Envoyer une requête à l'API SNCF pour récupérer les départs de la gare de Bordeaux
    fetch('https://api.sncf.com/v1/coverage/sncf/stop_areas/stop_area:SNCF:87581009/departures?key=a850a596-486c-42f3-b036-b08f98f44ae9')
        .then(response => response.json())
        .then(data => {
            // Vérifier si data.departures est défini et non vide
            if (data.departures && data.departures.length > 0) {
                // Obtenir les 6 premiers éléments du tableau de données
                const firstSixDepartures = getFirstSixDepartures(data.departures);
                // Comparer les nouvelles données avec les anciennes
                if (JSON.stringify(firstSixDepartures) !== JSON.stringify(previousData)) {
                    // Mettre à jour les départs affichés
                    updateDepartures(firstSixDepartures);
                    // Mettre à jour les données précédentes
                    previousData = firstSixDepartures;
                }
            } else {
                console.error('Les données de départs sont manquantes ou vides.');
            }
        })
        .catch(error => console.error('Une erreur s\'est produite lors de la récupération des départs :', error));
}

// Appeler la fonction fetchAndDisplayDepartures pour la première fois au chargement de la page
fetchAndDisplayDepartures();
