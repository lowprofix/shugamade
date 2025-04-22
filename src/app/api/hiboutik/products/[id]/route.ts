// API Route pour récupérer le stock d'un produit spécifique
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

// Interface pour les données de stock
interface HiboutikStockData {
  product_id: string | number;
  [key: string]: any; // Autres propriétés du stock
}

// Interface pour la réponse de l'API
interface StockResponse {
  productId: string;
  stock: HiboutikStockData[];
  error?: string;
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

// GET - Récupérer le stock d'un produit spécifique
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const productId = params.id;

    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
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
        return NextResponse.json(
          {
            error: "Produit non trouvé",
            message: `Le produit avec l'ID ${productId} n'existe pas ou n'a pas de stock géré`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Erreur lors de la récupération du stock",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const stockData = (await response.json()) as HiboutikStockData[];

    return NextResponse.json({
      productId: productId,
      stock: stockData,
    } as StockResponse);
  } catch (error) {
    console.error("Exception GET stock produit:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
