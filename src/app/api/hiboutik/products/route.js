// API Route pour gérer les produits et stocks Hiboutik
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

// GET - Récupérer la liste des produits avec leurs stocks
export async function GET() {
  try {
    // 1. D'abord récupérer tous les produits
    const productsUrl = `${baseUrl}/products/`;
    const productsResponse = await fetch(productsUrl, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error("Erreur Hiboutik (produits):", {
        status: productsResponse.status,
        statusText: productsResponse.statusText,
        body: errorText,
      });

      return Response.json(
        {
          error: "Erreur lors de l'appel à l'API Hiboutik pour les produits",
          details: errorText,
          status: productsResponse.status,
        },
        { status: productsResponse.status }
      );
    }

    const products = await productsResponse.json();

    // 2. Ensuite récupérer tous les stocks
    const stocksUrl = `${baseUrl}/stock_available/all_wh`;
    const stocksResponse = await fetch(stocksUrl, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!stocksResponse.ok) {
      // Même si on ne peut pas récupérer les stocks, on peut toujours retourner les produits
      console.error(
        "Erreur lors de la récupération des stocks:",
        stocksResponse.statusText
      );

      // Retourner uniquement les produits sans informations de stock
      return Response.json({
        products: products,
        stocks: null,
        error: "Impossible de récupérer les informations de stock",
      });
    }

    const stocks = await stocksResponse.json();

    // 3. Combiner les produits avec leurs informations de stock
    const productsWithStock = products.map((product) => {
      const productStock = stocks.filter(
        (stock) => stock.product_id === product.product_id
      );
      return {
        ...product,
        stock: productStock,
      };
    });

    // Retourner les produits avec leurs stocks
    return Response.json({
      products: productsWithStock,
    });
  } catch (error) {
    console.error("Exception GET produits:", error);
    return Response.json(
      {
        error: "Erreur serveur",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
