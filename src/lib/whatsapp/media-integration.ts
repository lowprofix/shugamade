/**
 * Intégration WhatsApp Media avec Supabase
 * Ce fichier fournit des fonctions utilitaires pour envoyer des images de produits via WhatsApp
 */

import { supabase } from "@/lib/supabase/client";

interface SupabaseProduct {
  id: number;
  hiboutik_id?: number;
  name: string;
  description?: string;
  price?: string;
  image?: string;
  category?: string;
  stock?: number;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
  last_sync_status?: string;
}

interface MediaSendResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Récupère les informations d'un produit depuis Supabase
 */
async function getSupabaseProduct(productId: string | number): Promise<SupabaseProduct | null> {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du produit Supabase:', error);
      return null;
    }

    return product;
  } catch (error) {
    console.error('Exception lors de la récupération du produit Supabase:', error);
    return null;
  }
}

/**
 * Envoie une image de produit via WhatsApp en utilisant les données Supabase
 */
export async function sendProductImageWhatsApp(
  phoneNumber: string,
  productId: string | number,
  customCaption?: string,
  delay?: number
): Promise<MediaSendResult> {
  try {
    // 1. Récupérer les informations du produit depuis Supabase
    const supabaseProduct = await getSupabaseProduct(productId);
    
    if (!supabaseProduct) {
      return {
        success: false,
        error: `Produit ${productId} non trouvé dans Supabase`
      };
    }

    // Vérifier que le produit est disponible
    if (supabaseProduct.is_available === false) {
      return {
        success: false,
        error: `Le produit ${productId} n'est pas disponible`
      };
    }

    // Vérifier qu'une image est disponible
    if (!supabaseProduct.image) {
      return {
        success: false,
        error: `Aucune image disponible pour le produit ${productId}`
      };
    }

    // 2. Préparer la caption enrichie avec les données Supabase
    let enrichedCaption = customCaption;
    
    if (!enrichedCaption) {
      enrichedCaption = generateEnrichedCaption(supabaseProduct);
    }

    // 3. Appeler l'API média WhatsApp
    const mediaResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/whatsapp/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        productId,
        caption: enrichedCaption,
        delay: delay || 1000,
      }),
    });

    const mediaResult = await mediaResponse.json();

    if (!mediaResponse.ok) {
      return {
        success: false,
        error: mediaResult.error || 'Erreur lors de l\'envoi du média',
        data: mediaResult
      };
    }

    return {
      success: true,
      message: 'Image du produit envoyée avec succès via WhatsApp',
      data: {
        ...mediaResult,
        supabaseProduct: {
          id: supabaseProduct.id,
          name: supabaseProduct.name,
          price: supabaseProduct.price,
          category: supabaseProduct.category,
          stock: supabaseProduct.stock,
        }
      }
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'image produit WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Génère une caption enrichie avec les données Supabase
 */
function generateEnrichedCaption(product: SupabaseProduct): string {
  let caption = "";
  
  if (product.name) {
    caption += `🛍️ *${product.name}*\n\n`;
  }

  if (product.description) {
    caption += `📝 ${product.description}\n\n`;
  }

  if (product.price) {
    caption += `💰 Prix: ${product.price}€\n\n`;
  }

  // Ajouter les informations de stock
  if (product.stock !== undefined) {
    if (product.stock > 0) {
      caption += `📦 Stock disponible: ${product.stock} unités\n\n`;
    } else {
      caption += `⚠️ Produit en rupture de stock\n\n`;
    }
  }

  // Ajouter la catégorie si disponible
  if (product.category) {
    caption += `🏷️ Catégorie: ${product.category}\n\n`;
  }

  caption += `🆔 Référence: ${product.id}\n`;
  
  // Ajouter l'ID Hiboutik si disponible
  if (product.hiboutik_id) {
    caption += `🔗 ID Hiboutik: ${product.hiboutik_id}\n`;
  }
  
  caption += `🏪 Shugamade - Votre boutique de confiance`;

  return caption;
}

/**
 * Envoie plusieurs images de produits en lot
 */
export async function sendMultipleProductImages(
  phoneNumber: string,
  productIds: (string | number)[],
  delayBetweenMessages: number = 2000
): Promise<MediaSendResult[]> {
  const results: MediaSendResult[] = [];

  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i];
    
    // Ajouter un délai entre les messages (sauf pour le premier)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
    }

    const result = await sendProductImageWhatsApp(phoneNumber, productId);
    results.push(result);

    // Si l'envoi échoue, on peut choisir de continuer ou d'arrêter
    if (!result.success) {
      console.warn(`Échec de l'envoi pour le produit ${productId}:`, result.error);
    }
  }

  return results;
}

/**
 * Recherche et envoie des images de produits basées sur des critères
 */
export async function sendProductImagesBySearch(
  phoneNumber: string,
  searchCriteria: {
    name?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    isAvailable?: boolean;
  },
  maxResults: number = 5
): Promise<MediaSendResult> {
  try {
    // 1. Construire la requête Supabase avec les filtres
    let query = supabase
      .from('products')
      .select('*');

    // Filtrer par nom
    if (searchCriteria.name) {
      query = query.ilike('name', `%${searchCriteria.name}%`);
    }

    // Filtrer par catégorie
    if (searchCriteria.category) {
      query = query.eq('category', searchCriteria.category);
    }

    // Filtrer par disponibilité
    if (searchCriteria.isAvailable !== undefined) {
      query = query.eq('is_available', searchCriteria.isAvailable);
    }

    // Filtrer par stock
    if (searchCriteria.inStock) {
      query = query.gt('stock', 0);
    }

    // Limiter les résultats
    query = query.limit(maxResults);

    const { data: products, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Erreur lors de la recherche des produits: ' + error.message
      };
    }

    if (!products || products.length === 0) {
      return {
        success: false,
        error: 'Aucun produit ne correspond aux critères de recherche'
      };
    }

    // 2. Filtrer par prix (fait côté client car Supabase traite le prix comme string)
    let filteredProducts = products;
    
    if (searchCriteria.priceMin || searchCriteria.priceMax) {
      filteredProducts = products.filter((product: any) => {
        if (!product.price) return false;
        
        const price = parseFloat(product.price);
        if (isNaN(price)) return false;

        if (searchCriteria.priceMin && price < searchCriteria.priceMin) {
          return false;
        }

        if (searchCriteria.priceMax && price > searchCriteria.priceMax) {
          return false;
        }

        return true;
      });
    }

    if (filteredProducts.length === 0) {
      return {
        success: false,
        error: 'Aucun produit ne correspond aux critères de prix'
      };
    }

    // 3. Envoyer les images des produits trouvés
    const productIds = filteredProducts.map((p: any) => p.id);
    const results = await sendMultipleProductImages(phoneNumber, productIds);

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      message: `${successCount}/${results.length} images de produits envoyées avec succès`,
      data: {
        results,
        searchCriteria,
        foundProducts: filteredProducts.length,
        products: filteredProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          stock: p.stock
        }))
      }
    };

  } catch (error) {
    console.error('Erreur lors de la recherche et envoi de produits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Récupère tous les produits disponibles avec images
 */
export async function getAvailableProductsWithImages(): Promise<SupabaseProduct[]> {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .not('image', 'is', null)
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error('Exception lors de la récupération des produits:', error);
    return [];
  }
}

/**
 * Récupère les produits par catégorie
 */
export async function getProductsByCategory(category: string): Promise<SupabaseProduct[]> {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_available', true)
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des produits par catégorie:', error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error('Exception lors de la récupération des produits par catégorie:', error);
    return [];
  }
} 