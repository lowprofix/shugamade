// API Route pour gérer un client spécifique Hiboutik (GET, PUT, DELETE)
// Utilise les Server Components de Next.js pour éviter les problèmes CORS
import { NextRequest, NextResponse } from "next/server";

// Configuration des identifiants Hiboutik
const apiLogin = process.env.HIBOUTIK_API_LOGIN || "";
const apiKey = process.env.HIBOUTIK_API_KEY || "";
const baseUrl = process.env.HIBOUTIK_BASE_URL;

// Interface pour les paramètres de route
interface RouteParams {
  params: {
    id: string;
  };
}

// Interface pour les données de mise à jour du client
interface ClientUpdateData {
  customers_attribute: string;
  new_value: string;
  [key: string]: any;
}

// Interface pour les headers d'authentification
interface HiboutikAuthHeaders {
  "Content-Type": string;
  Accept: string;
  Authorization: string;
  "API-LOGIN": string;
  "API-KEY": string;
  [key: string]: string; // Signature d'index pour permettre l'usage avec HeadersInit
}

// Fonction utilitaire pour créer les headers d'authentification
function getAuthHeaders(): HiboutikAuthHeaders {
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

// GET - Récupérer les détails d'un client spécifique
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const customerId = params.id;

    if (!customerId || isNaN(parseInt(customerId))) {
      return NextResponse.json(
        {
          error: "ID client invalide",
          message: "L'ID du client doit être un nombre",
        },
        { status: 400 }
      );
    }

    const hiboutikUrl = `${baseUrl}/customer/${customerId}`;

    // Log pour debug
    console.log(`GET client ${customerId} - URL:`, hiboutikUrl);

    // Appel à l'API Hiboutik
    const response = await fetch(hiboutikUrl, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    // Vérification de la réponse
    if (!response.ok) {
      // Log détaillé pour debug
      const errorText = await response.text();
      console.error(`Erreur récupération client ${customerId}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Si le client n'existe pas
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Client non trouvé",
            message: `Le client avec l'ID ${customerId} n'existe pas`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Erreur lors de la récupération du client",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Récupération des données
    const data = await response.json();

    // Retourne les données au format JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Exception GET client spécifique:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un client existant
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const customerId = params.id;

    if (!customerId || isNaN(parseInt(customerId))) {
      return NextResponse.json(
        {
          error: "ID client invalide",
          message: "L'ID du client doit être un nombre",
        },
        { status: 400 }
      );
    }

    // Récupération des données du corps de la requête
    let updateData: ClientUpdateData;
    try {
      updateData = await request.json();
    } catch (error) {
      console.error("Erreur de parsing JSON:", error);
      return NextResponse.json(
        {
          error: "Format JSON invalide",
          message: "Le corps de la requête doit être un JSON valide",
        },
        { status: 400 }
      );
    }

    // Vérification si le corps est vide
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: "Données manquantes",
          message: "Le corps de la requête ne peut pas être vide",
        },
        { status: 400 }
      );
    }

    // Validation des données selon le format attendu par Hiboutik
    if (!updateData.customers_attribute || !updateData.new_value) {
      return NextResponse.json(
        {
          error: "Données invalides",
          message:
            "Les champs 'customers_attribute' et 'new_value' sont obligatoires",
        },
        { status: 400 }
      );
    }

    const hiboutikUrl = `${baseUrl}/customer/${customerId}/`;

    // Log pour debug
    console.log(`PUT client ${customerId} - Données:`, updateData);
    console.log(`PUT client ${customerId} - URL:`, hiboutikUrl);

    // Appel à l'API Hiboutik pour mettre à jour le client
    const response = await fetch(hiboutikUrl, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
      cache: "no-store",
    });

    // Vérification de la réponse
    if (!response.ok) {
      // Log détaillé pour debug
      const errorText = await response.text();
      console.error(`Erreur mise à jour client ${customerId}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Si le client n'existe pas
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Client non trouvé",
            message: `Le client avec l'ID ${customerId} n'existe pas`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour du client",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Récupération des données de réponse
    const data = await response.json();

    // Retourne les données au format JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Exception PUT client:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un client
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const customerId = params.id;

    if (!customerId || isNaN(parseInt(customerId))) {
      return NextResponse.json(
        {
          error: "ID client invalide",
          message: "L'ID du client doit être un nombre",
        },
        { status: 400 }
      );
    }

    const hiboutikUrl = `${baseUrl}/customer/${customerId}`;

    // Log pour debug
    console.log(`DELETE client ${customerId} - URL:`, hiboutikUrl);

    // Appel à l'API Hiboutik pour supprimer le client
    const response = await fetch(hiboutikUrl, {
      method: "DELETE",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    // Vérification de la réponse
    if (!response.ok) {
      // Log détaillé pour debug
      const errorText = await response.text();
      console.error(`Erreur suppression client ${customerId}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Si le client n'existe pas
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Client non trouvé",
            message: `Le client avec l'ID ${customerId} n'existe pas`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Erreur lors de la suppression du client",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Retourne un message de succès
    return NextResponse.json(
      {
        success: true,
        message: `Le client avec l'ID ${customerId} a été supprimé avec succès`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Exception DELETE client:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
