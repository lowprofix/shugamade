// API Route pour récupérer le stock d'un produit spécifique
// Utilise les Server Components de Next.js pour éviter les problèmes CORS

// Configuration des identifiants Hiboutik
const apiLogin = "shugamadec@gmail.com";
const apiKey = "SOF5HH5RCP7T5DVR5NHDT5T14M8F6N8ASN2";
const baseUrl = "https://shugamade.hiboutik.com/api";

// Fonction utilitaire pour créer les headers d'authentification
function getAuthHeaders() {
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

// GET - Récupérer le stock d'un produit spécifique
export async function GET(request, { params }) {
  try {
    const productId = params.id;

    if (!productId || isNaN(parseInt(productId))) {
      return Response.json(
        {
          error: "ID produit invalide",
          message: "L'ID du produit doit être un nombre",
        },
        { status: 400 }
      );
    }

    // Récupérer le stock pour ce produit spécifique
    const stockUrl = `${baseUrl}/stock_available/product_id/${productId}`;

    const response = await fetch(stockUrl, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur récupération stock produit ${productId}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Si le produit n'existe pas
      if (response.status === 404) {
        return Response.json(
          {
            error: "Produit non trouvé",
            message: `Le produit avec l'ID ${productId} n'existe pas ou n'a pas de stock géré`,
          },
          { status: 404 }
        );
      }

      return Response.json(
        {
          error: "Erreur lors de la récupération du stock",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const stockData = await response.json();

    return Response.json({
      productId: productId,
      stock: stockData,
    });
  } catch (error) {
    console.error("Exception GET stock produit:", error);
    return Response.json(
      {
        error: "Erreur serveur",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
