import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuration des identifiants Hiboutik depuis les variables d'environnement
const apiLogin = process.env.HIBOUTIK_API_LOGIN || "";
const apiKey = process.env.HIBOUTIK_API_KEY || "";
const baseUrl = process.env.HIBOUTIK_BASE_URL;

// Création du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface pour les données de stock
interface StockData {
  product_id: number;
  stock_available: string;
}

// Fonction utilitaire pour créer les headers d'authentification Hiboutik
function getHiboutikHeaders() {
  if (!apiLogin || !apiKey || !baseUrl) {
    throw new Error("Configuration Hiboutik incomplète");
  }

  const credentials = Buffer.from(`${apiLogin}:${apiKey}`).toString("base64");
  
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${credentials}`,
    "API-LOGIN": apiLogin,
    "API-KEY": apiKey,
  };
}

// Fonction pour valider les données de stock
function validateStockData(stockInfo: any): stockInfo is StockData {
  return (
    typeof stockInfo === 'object' &&
    stockInfo !== null &&
    typeof stockInfo.product_id === 'number' &&
    typeof stockInfo.stock_available === 'string' &&
    !isNaN(parseInt(stockInfo.stock_available))
  );
}

// Fonction pour mettre à jour le stock d'un produit dans Supabase
async function updateProductStock(
  productId: number, 
  hiboutikId: number, 
  stockInfo: StockData | null
) {
  const totalStock = stockInfo ? parseInt(stockInfo.stock_available, 10) : 0;
  
  const { error: updateError } = await supabase
    .from('products')
    .update({ 
      stock: totalStock,
      is_available: totalStock > 0,
      updated_at: new Date().toISOString(),
      last_sync_status: stockInfo ? 'success' : 'no_stock_data'
    })
    .eq('id', productId);

  if (updateError) {
    console.error(`Erreur mise à jour stock pour produit ${productId}:`, updateError);
    throw updateError;
  }

  return {
    productId,
    hiboutikId,
    totalStock,
    status: 'success'
  };
}

export async function GET() {
  try {
    // 1. Récupérer les produits depuis Supabase
    const { data: products, error: supabaseError } = await supabase
      .from('products')
      .select('*');

    if (supabaseError) {
      console.error('Erreur Supabase:', supabaseError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      );
    }

    // 2. Récupérer les données Hiboutik
    if (!baseUrl) {
      throw new Error("URL Hiboutik non configurée");
    }

    // Récupérer les stocks depuis Hiboutik
    const stocksUrl = `${baseUrl}/stock_available/all_wh`;
    const hiboutikStocksResponse = await fetch(stocksUrl, {
      method: "GET",
      headers: getHiboutikHeaders(),
      cache: "no-store",
    });

    let hiboutikStocks: StockData[] = [];
    let stockFetchError = null;

    if (!hiboutikStocksResponse.ok) {
      stockFetchError = `Erreur Hiboutik (stocks): ${hiboutikStocksResponse.statusText}`;
      console.error(stockFetchError);
    } else {
      const rawStocks = await hiboutikStocksResponse.json();
      hiboutikStocks = rawStocks.filter(validateStockData);
    }

    // 3. Mettre à jour les stocks dans Supabase et préparer la réponse
    const updateResults = await Promise.allSettled(
      products.map(async (product) => {
        try {
          if (!product.hiboutik_id) {
            return {
              productId: product.id,
              status: 'skipped',
              reason: 'no_hiboutik_id'
            };
          }

          const stockInfo = hiboutikStocks.find(
            (s) => s.product_id === product.hiboutik_id
          ) || null;

          const result = await updateProductStock(
            product.id,
            product.hiboutik_id,
            stockInfo
          );

          return {
            ...product,
            ...result,
            stock: result.totalStock,
            is_available: result.totalStock > 0
          };
        } catch (error) {
          console.error(`Erreur pour produit ${product.id}:`, error);
          return {
            productId: product.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
        }
      })
    );

    // 4. Analyser les résultats et préparer la réponse
    const successfulUpdates = updateResults
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value.status === 'success'
      )
      .map(result => result.value);

    const failedUpdates = updateResults
      .filter((result): result is PromiseRejectedResult => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.status === 'error')
      )
      .length;

    // 5. Retourner la réponse avec les statistiques de mise à jour
    return NextResponse.json({
      products: successfulUpdates,
      metadata: {
        total: products.length,
        updated: successfulUpdates.length,
        failed: failedUpdates,
        stockFetchError: stockFetchError
      }
    });

  } catch (error) {
    console.error('Exception GET produits:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
} 