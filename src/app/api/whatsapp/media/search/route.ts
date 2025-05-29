import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Interface pour les données de produit avec image
 */
interface ProductWithImage {
  product_id: string | number;
  product_name?: string;
  product_description?: string;
  product_price?: string;
  image_url?: string;
  image_filename?: string;
  category?: string;
  stock?: number;
  is_available?: boolean;
  hiboutik_id?: number;
  [key: string]: any;
}

/**
 * Interface pour la requête de recherche et envoi
 */
interface SearchMediaRequest {
  phoneNumber: string;
  searchCriteria: {
    name?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    isAvailable?: boolean;
  };
  maxResults?: number;
  delayBetweenMessages?: number;
}

/**
 * Fonction pour formater correctement les numéros de téléphone internationaux
 */
function formatPhoneNumber(phoneNumber: string): string {
  let formattedNumber = phoneNumber.replace(/\s+/g, "");

  if (!formattedNumber.startsWith("+")) {
    formattedNumber = `+${formattedNumber}`;
  }

  const countriesWithLeadingZero = [
    "+33", "+44", "+39", "+34", "+49", "+32", "+31",
  ];

  for (const countryCode of countriesWithLeadingZero) {
    if (
      formattedNumber.startsWith(countryCode) &&
      formattedNumber.length > countryCode.length
    ) {
      if (formattedNumber.charAt(countryCode.length) === "0") {
        formattedNumber = `${countryCode}${formattedNumber.substring(
          countryCode.length + 1
        )}`;
        break;
      }
    }
  }

  return formattedNumber;
}

/**
 * Vérifie si un numéro est enregistré sur WhatsApp
 */
async function isWhatsAppNumber(phoneNumber: string): Promise<boolean> {
  try {
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!serverUrl || !instanceName || !apiKey) {
      console.error("Variables d'environnement WhatsApp manquantes pour la vérification de numéro");
      return false;
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const response = await fetch(
      `${serverUrl}/chat/whatsappNumbers/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({
          numbers: [formattedNumber],
        }),
      }
    );

    if (!response.ok) {
      console.error("Erreur lors de la vérification du numéro WhatsApp");
      return false;
    }

    const data = await response.json();

    if (data && Array.isArray(data) && data.length > 0) {
      const numberResult = data.find(
        (item) =>
          item.number === formattedNumber ||
          item.jid?.includes(formattedNumber.substring(1))
      );
      if (numberResult && numberResult.exists === true) {
        console.log(`Le numéro ${formattedNumber} est enregistré sur WhatsApp`);
        return true;
      }
    }

    console.log(`Le numéro ${formattedNumber} n'est pas enregistré sur WhatsApp`);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification du numéro WhatsApp:", error);
    return false;
  }
}

/**
 * Formate les données du produit dans le format attendu
 */
function formatProductData(product: any): ProductWithImage {
  // Extraire le nom du fichier depuis l'URL de l'image
  let imageFilename = null;
  if (product.image) {
    const urlParts = product.image.split('/');
    imageFilename = urlParts[urlParts.length - 1];
  }

  return {
    product_id: product.id,
    product_name: product.name,
    product_description: product.description,
    product_price: product.price,
    image_url: product.image,
    image_filename: imageFilename,
    category: product.category,
    stock: product.stock,
    is_available: product.is_available,
    hiboutik_id: product.hiboutik_id,
  };
}

/**
 * Recherche des produits par critères
 */
async function searchProductsByCriteria(
  criteria: SearchMediaRequest['searchCriteria'],
  maxResults: number = 5
): Promise<ProductWithImage[]> {
  try {
    console.log('Recherche de produits avec les critères:', criteria);

    let query = supabase
      .from('products')
      .select('*');

    // Appliquer les filtres
    if (criteria.name) {
      query = query.ilike('name', `%${criteria.name}%`);
    }

    if (criteria.category) {
      query = query.ilike('category', `%${criteria.category}%`);
    }

    if (criteria.priceMin !== undefined) {
      query = query.gte('price', criteria.priceMin);
    }

    if (criteria.priceMax !== undefined) {
      query = query.lte('price', criteria.priceMax);
    }

    if (criteria.inStock === true) {
      query = query.gt('stock', 0);
    } else if (criteria.inStock === false) {
      query = query.eq('stock', 0);
    }

    if (criteria.isAvailable !== undefined) {
      query = query.eq('is_available', criteria.isAvailable);
    }

    // Filtrer les produits avec images uniquement
    query = query.not('image', 'is', null);

    // Limiter les résultats
    query = query.limit(maxResults);

    const { data: products, error } = await query;

    if (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      return [];
    }

    if (!products || products.length === 0) {
      console.log('Aucun produit trouvé avec les critères fournis');
      return [];
    }

    console.log(`${products.length} produits trouvés`);
    return products.map(formatProductData);

  } catch (error) {
    console.error('Exception lors de la recherche de produits:', error);
    return [];
  }
}

/**
 * Génère une caption pour le produit
 */
function generateProductCaption(product: ProductWithImage): string {
  let caption = "";
  
  if (product.product_name) {
    caption += `📦 *${product.product_name}*\n\n`;
  }

  if (product.product_description) {
    caption += `${product.product_description}\n\n`;
  }

  if (product.product_price) {
    caption += `💰 Prix: ${product.product_price}€\n\n`;
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

  caption += `🆔 Référence: ${product.product_id}\n`;
  caption += `🏪 Shugamade - Votre boutique de confiance`;

  return caption;
}

/**
 * Envoie un média via WhatsApp
 */
async function sendSingleMedia(
  phoneNumber: string,
  product: ProductWithImage,
  delay: number = 1000
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!serverUrl || !instanceName || !apiKey) {
      return {
        success: false,
        error: "Configuration serveur incomplète"
      };
    }

    // Générer la caption
    const caption = generateProductCaption(product);

    // Déterminer le type MIME basé sur l'extension du fichier
    let mimetype = "image/jpeg"; // par défaut
    if (product.image_filename) {
      const extension = product.image_filename.toLowerCase().split('.').pop();
      switch (extension) {
        case 'png':
          mimetype = "image/png";
          break;
        case 'gif':
          mimetype = "image/gif";
          break;
        case 'webp':
          mimetype = "image/webp";
          break;
        default:
          mimetype = "image/jpeg";
      }
    }

    // Vérifier que l'URL de l'image existe
    if (!product.image_url) {
      return {
        success: false,
        error: `Aucune URL d'image disponible pour ${product.product_name}`
      };
    }

    // Construction du payload pour l'API Evolution
    const payload = {
      number: phoneNumber,
      mediatype: "image",
      mimetype: mimetype,
      caption: caption,
      media: product.image_url,
      fileName: product.image_filename || `product_${product.product_id}.jpg`,
      delay: delay,
      linkPreview: false,
    };

    console.log(`Envoi de média WhatsApp pour ${product.product_name}:`, {
      ...payload,
      media: payload.media.substring(0, 50) + "..."
    });

    // Appel à l'API Evolution pour envoyer le média
    const response = await fetch(
      `${serverUrl}/message/sendMedia/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de l'envoi du média pour ${product.product_name}:`, errorText);
      return {
        success: false,
        error: `Échec de l'envoi pour ${product.product_name}: ${errorText}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData
    };

  } catch (error) {
    console.error(`Exception lors de l'envoi du média pour ${product.product_name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}

/**
 * API pour rechercher et envoyer des images de produits par critères via WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    // Configuration de l'API Evolution
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!serverUrl || !instanceName || !apiKey) {
      console.error("Variables d'environnement WhatsApp manquantes");
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète",
        },
        { status: 500 }
      );
    }

    // Récupérer les données de la requête
    const data: SearchMediaRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.searchCriteria) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber et searchCriteria sont requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier qu'au moins un critère de recherche est fourni
    const criteria = data.searchCriteria;
    const hasCriteria = criteria.name || 
                       criteria.category || 
                       criteria.priceMin !== undefined || 
                       criteria.priceMax !== undefined || 
                       criteria.inStock !== undefined || 
                       criteria.isAvailable !== undefined;

    if (!hasCriteria) {
      return NextResponse.json(
        {
          success: false,
          error: "Au moins un critère de recherche doit être fourni.",
        },
        { status: 400 }
      );
    }

    // Valider maxResults
    const maxResults = data.maxResults || 5;
    if (maxResults > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 10 résultats peuvent être envoyés simultanément.",
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

    // Vérifier si le numéro est enregistré sur WhatsApp
    const isWhatsApp = await isWhatsAppNumber(phoneNumber);
    if (!isWhatsApp) {
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro n'est pas enregistré sur WhatsApp",
          whatsapp: false,
          phoneNumber: phoneNumber,
        },
        { status: 400 }
      );
    }

    // Rechercher les produits
    const products = await searchProductsByCriteria(criteria, maxResults);

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun produit trouvé avec les critères fournis",
          searchCriteria: criteria,
        },
        { status: 404 }
      );
    }

    // Filtrer les produits disponibles avec images
    const validProducts = products.filter(product => 
      product.image_url && 
      product.is_available !== false
    );

    if (validProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun produit disponible avec image trouvé",
          foundProducts: products.length,
          searchCriteria: criteria,
        },
        { status: 404 }
      );
    }

    // Envoyer les médias avec délai entre chaque envoi
    const delayBetweenMessages = data.delayBetweenMessages || 2000;
    const sendResults = [];

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];
      
      // Ajouter un délai avant chaque envoi (sauf le premier)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
      }

      const result = await sendSingleMedia(phoneNumber, product, 1000);
      sendResults.push({
        productName: product.product_name,
        productId: product.product_id,
        category: product.category,
        price: product.product_price,
        success: result.success,
        error: result.error,
        data: result.data
      });
    }

    // Analyser les résultats d'envoi
    const successCount = sendResults.filter(r => r.success).length;
    const failureCount = sendResults.length - successCount;

    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount}/${sendResults.length} images envoyées avec succès`,
      summary: {
        searchCriteria: criteria,
        totalFound: products.length,
        validProducts: validProducts.length,
        sentSuccessfully: successCount,
        sendFailed: failureCount
      },
      results: sendResults,
    });

  } catch (error) {
    console.error("Erreur lors de la recherche et envoi de médias WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de la recherche et envoi de médias WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 