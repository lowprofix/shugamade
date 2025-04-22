// API Route pour gérer les produits et stocks Hiboutik
// Utilise les Server Components de Next.js pour éviter les problèmes CORS
import { NextResponse } from "next/server";

// Configuration des identifiants Hiboutik depuis les variables d'environnement
const apiLogin = process.env.HIBOUTIK_API_LOGIN || "";
const apiKey = process.env.HIBOUTIK_API_KEY || "";
const baseUrl = process.env.HIBOUTIK_BASE_URL;

// Interfaces pour les données de produit et de stock
interface HiboutikProductData {
  product_id: string | number;
  [key: string]: any; // Autres propriétés du produit
}

interface HiboutikStockData {
  product_id: string | number;
  [key: string]: any; // Propriétés du stock
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

// Interface pour la réponse combinée
interface ProductsResponse {
  products: HiboutikProductData[] | null;
  stocks?: HiboutikStockData[] | null;
  error?: string;
}

// Fonction utilitaire pour créer les headers d'authentification
function getAuthHeaders(): HiboutikAuthHeaders {
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

// GET - Récupérer la liste des produits avec leurs stocks
export async function GET(): Promise<NextResponse> {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!apiLogin || !apiKey || !baseUrl) {
      return NextResponse.json(
        {
          error: "Configuration Hiboutik incomplète",
          message: "Variables d'environnement manquantes",
        },
        { status: 500 }
      );
    }

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

      return NextResponse.json(
        {
          error: "Erreur lors de l'appel à l'API Hiboutik pour les produits",
          details: errorText,
          status: productsResponse.status,
        },
        { status: productsResponse.status }
      );
    }

    const products = (await productsResponse.json()) as HiboutikProductData[];

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
      return NextResponse.json({
        products: products,
        stocks: null,
        error: "Impossible de récupérer les informations de stock",
      } as ProductsResponse);
    }

    const stocks = (await stocksResponse.json()) as HiboutikStockData[];

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
    return NextResponse.json({
      products: productsWithStock,
    } as ProductsResponse);
  } catch (error) {
    console.error("Exception GET produits:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
