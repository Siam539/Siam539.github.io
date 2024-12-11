// URL de l'API Pokémon
const apiUrl = "https://tyradex.app/api/v1/pokemon";

// Sélection des éléments HTML nécessaires
const pokemonList = document.getElementById("pokemon-list");
const mapContainer = document.getElementById("map");
const addAppearanceBtn = document.getElementById("add-appearance-btn");

// Initialisation de la carte
const map = L.map(mapContainer).setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);


setTimeout(() => map.invalidateSize(), 800);


let appearances = JSON.parse(localStorage.getItem("appearances")) || [];

// Récupération et affichage des Pokémon depuis l'API
async function fetchPokemon() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Erreur lors du chargement des données Pokémon.");
        const data = await response.json();

        if (!data || data.length === 0) {
            alert("Aucun Pokémon trouvé.");
            return;
        }

        // Ajout des Pokémon à la liste
        data.forEach(pokemon => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            listItem.textContent = pokemon.name.fr;

            // Bouton pour afficher sur la carte
            const viewButton = document.createElement("button");
            viewButton.className = "btn btn-primary btn-sm";
            viewButton.textContent = "Voir sur la carte";
            viewButton.addEventListener("click", () => focusOnPokemon(pokemon.name.fr));

            listItem.appendChild(viewButton);
            pokemonList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Erreur :", error.message);
        alert("Une erreur est survenue lors du chargement des Pokémon.");
    }
}

// Centre la carte sur un Pokémon spécifique
function focusOnPokemon(pokemonNameFr) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    let found = false;


    appearances.forEach(appearance => {
        if (appearance.name.toLowerCase() === pokemonNameFr.toLowerCase()) {
            const marker = L.marker(appearance.location).addTo(map);
            marker.bindPopup(`Dernière apparition de ${pokemonNameFr}`).openPopup();
            map.setView(appearance.location, 10);
            found = true;
        }
    });

    if (!found) {
        alert(`Pas d'apparitions enregistrées pour ${pokemonNameFr}.`);
    }
}

// Ajoute une nouvelle apparition à la liste
function addAppearance() {
    const pokemonNameFr = prompt("Entrez le nom du Pokémon (en français) :").trim();
    if (!pokemonNameFr) {
        alert("Le nom est invalide !");
        return;
    }

    // Obtient la position actuelle de l'utilisateur
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const {
                latitude,
                longitude
            } = position.coords;
            const location = [latitude, longitude];

            appearances.push({
                name: pokemonNameFr,
                location
            });
            localStorage.setItem("appearances", JSON.stringify(appearances));

            alert(`Apparition de ${pokemonNameFr} ajoutée avec succès !`);
        },
        () => {
            alert("Impossible d'obtenir votre position.");
        }
    );
}


function displayAllAppearances() {
    appearances.forEach(appearance => {
        L.marker(appearance.location).addTo(map).bindPopup(appearance.name);
    });
}


addAppearanceBtn.addEventListener("click", addAppearance);


fetchPokemon();
displayAllAppearances();