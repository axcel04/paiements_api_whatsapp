// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyvRZ48cVmOIAq9rmtRaG9kjwpbyYiC-zauqsYe1Vpdzvdn7nf98tEzj2pbd7SnbdGk/exec";


// =====================================================
// RÉCUPÉRATION DES ÉLÉMENTS HTML
// =====================================================

const paymentForm = document.getElementById("paymentForm");

const paymentTableBody =
    document.getElementById("paymentTableBody");

const totalMontant =
    document.getElementById("totalMontant");

const message =
    document.getElementById("message");

const whatsappBtn =
    document.getElementById("whatsappBtn");

const clearBtn =
    document.getElementById("clearBtn");


// =====================================================
// TABLEAU DES PAIEMENTS
// =====================================================

let paiements =
    JSON.parse(localStorage.getItem("paiements")) || [];


// =====================================================
// DATE DU JOUR
// =====================================================

document.getElementById("datePaiement").value =
    new Date().toISOString().split("T")[0];


// =====================================================
// AFFICHER LES PAIEMENTS
// =====================================================

function afficherPaiements() {

    paymentTableBody.innerHTML = "";

    let total = 0;

    paiements.forEach((paiement, index) => {

        total += Number(paiement.montant);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>

            <td>${paiement.nom}</td>

            <td>${paiement.prenom}</td>

            <td>${paiement.telephone}</td>

            <td>
                ${Number(paiement.montant).toLocaleString()} BIF
            </td>

            <td>${paiement.modePaiement}</td>

            <td>${paiement.reference}</td>

            <td>${paiement.datePaiement}</td>

            <td>${paiement.motif}</td>

            <td>
                <button
                    class="delete-btn"
                    onclick="supprimerPaiement(${index})"
                >
                    Supprimer
                </button>
            </td>
        `;

        paymentTableBody.appendChild(tr);
    });

    totalMontant.textContent =
        total.toLocaleString();
}


// =====================================================
// ENREGISTRER LE PAIEMENT
// =====================================================

paymentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const paiement = {
		type: "paiement",
        id: Date.now(),

        nom:
            document.getElementById("nom").value.trim(),

        prenom:
            document.getElementById("prenom").value.trim(),

        telephone:
            document.getElementById("telephone").value.trim(),

        montant:
            Number(document.getElementById("montant").value),

        modePaiement:
            document.getElementById("modePaiement").value,

        reference:
            document.getElementById("reference").value.trim(),

        datePaiement:
            document.getElementById("datePaiement").value,

        motif:
            document.getElementById("motif").value.trim(),

        dateEnregistrement:
            new Date().toLocaleString()
    };


    // =================================================
    // 1. ENREGISTREMENT LOCAL
    // =================================================

    paiements.push(paiement);

    localStorage.setItem(
        "paiements",
        JSON.stringify(paiements)
    );

    afficherPaiements();


    // =================================================
    // 2. ENVOI VERS GOOGLE SHEETS
    // =================================================

    if (
        GOOGLE_SCRIPT_URL &&
        !GOOGLE_SCRIPT_URL.includes("COLLE_ICI")
    ) {

        try {

            await fetch(GOOGLE_SCRIPT_URL, {

                method: "POST",

                mode: "no-cors",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(paiement)
            });

            afficherMessage(
                "Paiement enregistré localement et envoyé vers Google Sheets.",
                "success"
            );

        } catch (error) {

            console.error(error);

            afficherMessage(
                "Paiement enregistré localement, mais l'envoi vers Google Sheets a échoué.",
                "error"
            );
        }

    } else {

        afficherMessage(
            "Paiement enregistré localement. Configure Google Sheets pour l'envoi en ligne.",
            "success"
        );
    }


    // =================================================
    // 3. VIDER LE FORMULAIRE
    // =================================================

    paymentForm.reset();

    document.getElementById("datePaiement").value =
        new Date().toISOString().split("T")[0];
});


// =====================================================
// SUPPRIMER UN PAIEMENT
// =====================================================

function supprimerPaiement(index) {

    const confirmation =
        confirm("Voulez-vous supprimer ce paiement ?");

    if (!confirmation) {
        return;
    }

    paiements.splice(index, 1);

    localStorage.setItem(
        "paiements",
        JSON.stringify(paiements)
    );

    afficherPaiements();
}


// =====================================================
// VIDER TOUTES LES DONNÉES LOCALES
// =====================================================

clearBtn.addEventListener("click", function () {

    const confirmation =
        confirm(
            "Voulez-vous supprimer tous les paiements enregistrés localement ?"
        );

    if (!confirmation) {
        return;
    }

    paiements = [];

    localStorage.removeItem("paiements");

    afficherPaiements();

    afficherMessage(
        "Toutes les données locales ont été supprimées.",
        "success"
    );
});


// =====================================================
// WHATSAPP
// =====================================================

whatsappBtn.addEventListener("click", function () {

    const numero = "25761118110";

    const nom =
        document.getElementById("nom").value.trim();

    const prenom =
        document.getElementById("prenom").value.trim();

    const montant =
        document.getElementById("montant").value;

    const reference =
        document.getElementById("reference").value.trim();

    const motif =
        document.getElementById("motif").value.trim();


    // Message préparé automatiquement
    const texte = `

`;


    const url =
        `https://wa.me/${numero}?text=${encodeURIComponent(texte)}`;


    window.open(url, "_blank");
});


// =====================================================
// MESSAGE
// =====================================================

function afficherMessage(texte, type) {

    message.textContent = texte;

    if (type === "success") {
        message.style.color = "green";
    } else {
        message.style.color = "red";
    }

    setTimeout(() => {
        message.textContent = "";
    }, 5000);
}


// =====================================================
// AFFICHAGE INITIAL
// =====================================================

afficherPaiements();

// =====================================================
// MÉTÉO DE LA POSITION DE L'UTILISATEUR
// =====================================================

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherLocation =
    document.getElementById("weatherLocation");

const refreshWeatherBtn =
    document.getElementById("refreshWeatherBtn");


// =====================================================
// OBTENIR LA POSITION DE L'UTILISATEUR
// =====================================================

function obtenirPosition() {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {

            reject(
                new Error(
                    "La géolocalisation n'est pas supportée par ce navigateur."
                )
            );

            return;
        }


        navigator.geolocation.getCurrentPosition(

            function(position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                resolve({
                    latitude,
                    longitude
                });
            },

            function(error) {

                let messageErreur;

                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        messageErreur =
                            "Vous avez refusé l'accès à votre position.";

                        break;

                    case error.POSITION_UNAVAILABLE:

                        messageErreur =
                            "Votre position est indisponible.";

                        break;

                    case error.TIMEOUT:

                        messageErreur =
                            "La recherche de votre position a expiré.";

                        break;

                    default:

                        messageErreur =
                            "Impossible d'obtenir votre position.";
                }

                reject(
                    new Error(messageErreur)
                );
            },

            {
                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 300000
            }
        );
    });
}


// =====================================================
// CHARGER LA MÉTÉO
// =====================================================

async function chargerMeteo() {

    try {

        weatherLocation.textContent =
            "📍 Recherche de votre position...";

        weatherDescription.textContent =
            "Chargement de la météo...";


        // -------------------------------------------------
        // 1. POSITION DE L'UTILISATEUR
        // -------------------------------------------------

        const position =
            await obtenirPosition();

        const latitude =
            position.latitude;

        const longitude =
            position.longitude;


        // -------------------------------------------------
        // 2. API MÉTÉO
        // -------------------------------------------------

        const url =
            `https://api.open-meteo.com/v1/forecast` +

            `?latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +

            `&timezone=auto`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Erreur lors de la récupération de la météo."
            );
        }


        const data =
            await response.json();


        // -------------------------------------------------
        // 3. DONNÉES MÉTÉO
        // -------------------------------------------------

        const current =
            data.current;


        temperature.textContent =
            current.temperature_2m;


        humidity.textContent =
            current.relative_humidity_2m;


        windSpeed.textContent =
            current.wind_speed_10m;


        // -------------------------------------------------
        // 4. DESCRIPTION MÉTÉO
        // -------------------------------------------------

        const weather =
            obtenirDescriptionMeteo(
                current.weather_code
            );


        weatherDescription.textContent =
            weather.description;


        weatherIcon.textContent =
            weather.icon;


        // -------------------------------------------------
        // 5. LOCALISATION
        // -------------------------------------------------

        await afficherNomPosition(
            latitude,
            longitude
        );


    } catch (error) {

        console.error(
            "Erreur météo :",
            error
        );


        weatherDescription.textContent =
            error.message;


        weatherLocation.textContent =
            "📍 Position indisponible";


        temperature.textContent =
            "--";


        humidity.textContent =
            "--";


        windSpeed.textContent =
            "--";


        weatherIcon.textContent =
            "❌";
    }
}


// =====================================================
// OBTENIR LE NOM DE LA VILLE / RÉGION
// =====================================================

async function afficherNomPosition(
    latitude,
    longitude
) {

    try {

        /*
         * Open-Meteo ne fournit pas directement
         * le nom d'une ville à partir des coordonnées.
         *
         * On utilise ici l'API de géocodage inverse
         * de Nominatim / OpenStreetMap.
         */

        const url =
            `https://nominatim.openstreetmap.org/reverse` +

            `?lat=${latitude}` +

            `&lon=${longitude}` +

            `&format=json` +

            `&zoom=10`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Impossible de déterminer votre région."
            );
        }


        const data =
            await response.json();


        const address =
            data.address || {};


        const ville =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "";


        const region =
            address.state ||
            address.province ||
            "";


        const pays =
            address.country ||
            "";


        let localisation = "";


        if (ville) {

            localisation =
                ville;

        } else if (region) {

            localisation =
                region;

        } else {

            localisation =
                "Votre position";
        }


        if (region && ville !== region) {

            localisation +=
                `, ${region}`;
        }


        if (pays) {

            localisation +=
                `, ${pays}`;
        }


        weatherLocation.textContent =
            `📍 ${localisation}`;


    } catch (error) {

        console.error(
            "Erreur de localisation :",
            error
        );


        weatherLocation.textContent =
            "📍 Votre position";
    }
}


// =====================================================
// DESCRIPTION MÉTÉO
// =====================================================

function obtenirDescriptionMeteo(code) {

    if (code === 0) {

        return {
            description: "Ciel dégagé",
            icon: "☀️"
        };
    }


    if (code === 1) {

        return {
            description: "Principalement dégagé",
            icon: "🌤️"
        };
    }


    if (code === 2) {

        return {
            description: "Partiellement nuageux",
            icon: "⛅"
        };
    }


    if (code === 3) {

        return {
            description: "Couvert",
            icon: "☁️"
        };
    }


    if (
        code === 45 ||
        code === 48
    ) {

        return {
            description: "Brouillard",
            icon: "🌫️"
        };
    }


    if (
        code >= 51 &&
        code <= 57
    ) {

        return {
            description: "Bruine",
            icon: "🌦️"
        };
    }


    if (
        code >= 61 &&
        code <= 67
    ) {

        return {
            description: "Pluie",
            icon: "🌧️"
        };
    }


    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            description: "Neige",
            icon: "❄️"
        };
    }


    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            description: "Averses",
            icon: "🌦️"
        };
    }


    if (
        code >= 95 &&
        code <= 99
    ) {

        return {
            description: "Orage",
            icon: "⛈️"
        };
    }


    return {
        description: "Conditions inconnues",
        icon: "🌤️"
    };
}


// =====================================================
// BOUTON ACTUALISER
// =====================================================

refreshWeatherBtn.addEventListener(
    "click",
    chargerMeteo
);


// =====================================================
// PREMIER CHARGEMENT
// =====================================================

chargerMeteo();


// =====================================================
// ACTUALISATION AUTOMATIQUE
// Toutes les 10 minutes
// =====================================================

setInterval(
    chargerMeteo,
    10 * 60 * 1000
);