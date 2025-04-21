// API Route pour gérer les clients Hiboutik
// Utilise les Server Components de Next.js pour éviter les problèmes CORS

// Configuration des identifiants Hiboutik depuis les variables d'environnement
const apiLogin = process.env.HIBOUTIK_API_LOGIN;
const apiKey = process.env.HIBOUTIK_API_KEY;
const baseUrl = process.env.HIBOUTIK_BASE_URL;

// Fonction utilitaire pour créer les headers d'authentification
function getAuthHeaders() {
  // Vérifier que les variables d'environnement sont définies
  if (!apiLogin || !apiKey || !baseUrl) {
    console.error("Variables d'environnement Hiboutik manquantes");
    throw new Error("Configuration Hiboutik incomplète");
  }

  // Encodage des identifiants en Base64 pour l'authentification HTTP Basic
  const credentials = Buffer.from(`${apiLogin}:${apiKey}`).toString("base64");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${credentials}`,
    // Headers alternatifs si l'authentification Basic ne fonctionne pas
    "API-LOGIN": apiLogin,
    "API-KEY": apiKey,
  };
}

// GET - Récupérer la liste des clients
export async function GET() {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!apiLogin || !apiKey || !baseUrl) {
      return Response.json(
        {
          error: "Configuration Hiboutik incomplète",
          message: "Variables d'environnement manquantes",
        },
        { status: 500 }
      );
    }

    const hiboutikUrl = `${baseUrl}/customers/`;

    // Appel à l'API Hiboutik
    const response = await fetch(hiboutikUrl, {
      method: "GET",
      headers: getAuthHeaders(),
      // Assure que la requête est faite côté serveur pour éviter les problèmes CORS
      cache: "no-store",
    });

    // Log pour debug
    console.log("GET clients - URL:", hiboutikUrl);

    // Vérification de la réponse
    if (!response.ok) {
      // Log détaillé pour debug
      const errorText = await response.text();
      console.error("Erreur Hiboutik:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return Response.json(
        {
          error: "Erreur lors de l'appel à l'API Hiboutik",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Récupération des données
    const data = await response.json();

    // Retourne les données au format JSON
    return Response.json(data);
  } catch (error) {
    console.error("Exception GET clients:", error);
    return Response.json(
      {
        error: "Erreur serveur",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau client
export async function POST(request) {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!apiLogin || !apiKey || !baseUrl) {
      return Response.json(
        {
          error: "Configuration Hiboutik incomplète",
          message: "Variables d'environnement manquantes",
        },
        { status: 500 }
      );
    }

    // Récupération des données du corps de la requête
    let clientData;
    try {
      clientData = await request.json();
    } catch (error) {
      console.error("Erreur de parsing JSON:", error);
      return Response.json(
        {
          error: "Format JSON invalide",
          message: "Le corps de la requête doit être un JSON valide",
        },
        { status: 400 }
      );
    }

    // Vérification si le corps est vide
    if (!clientData || Object.keys(clientData).length === 0) {
      return Response.json(
        {
          error: "Données manquantes",
          message: "Le corps de la requête ne peut pas être vide",
        },
        { status: 400 }
      );
    }

    const hiboutikUrl = `${baseUrl}/customers/`;

    // Validation des champs obligatoires - Modification pour gérer le cas d'un nom de famille manquant
    if (!clientData.customers_first_name) {
      return Response.json(
        {
          error: "Données invalides",
          message: "Le prénom du client est obligatoire",
        },
        { status: 400 }
      );
    }

    // Si le nom de famille est vide, on utilise le prénom
    if (
      !clientData.customers_last_name ||
      clientData.customers_last_name === ""
    ) {
      console.log(
        "Nom de famille manquant, utilisation du prénom comme nom de famille"
      );
      clientData.customers_last_name = clientData.customers_first_name;
    }

    // Log pour debug
    console.log("POST client - Données:", clientData);
    console.log("POST client - URL:", hiboutikUrl);

    // Appel à l'API Hiboutik pour créer un nouveau client
    const response = await fetch(hiboutikUrl, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData),
      cache: "no-store",
    });

    // Vérification de la réponse
    if (!response.ok) {
      // Log détaillé pour debug
      const errorText = await response.text();
      console.error("Erreur création client Hiboutik:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        requestData: clientData,
      });

      return Response.json(
        {
          error: "Erreur lors de la création du client",
          details: errorText,
          status: response.status,
          requestData: clientData,
        },
        { status: response.status }
      );
    }

    // Récupération des données de réponse
    const data = await response.json();

    // Retourne les données au format JSON avec statut 201 (Created)
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Exception POST client:", error);
    return Response.json(
      {
        error: "Erreur serveur",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
