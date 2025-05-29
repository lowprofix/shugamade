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
 * Interface pour la requête d'envoi multiple
 */
interface MultipleMediaRequest {
  phoneNumber: string;
  productIds: (string | number)[];
  productIdentifiers?: (string | number)[]; // Nouveau paramètre flexible
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
 * Recherche intelligente d'un produit par différents critères
 */
async function findProductByIdentifier(identifier: string | number): Promise<ProductWithImage | null> {
  try {
    console.log(`Recherche du produit avec l'identifiant: ${identifier}`);

    // 1. Essayer par ID Supabase (si c'est un nombre)
    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      const { data: productById, error: errorById } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(identifier))
        .single();

      if (!errorById && productById) {
        console.log(`Produit trouvé par ID Supabase: ${productById.name}`);
        return formatProductData(productById);
      }
    }

    // 2. Essayer par hiboutik_id (si c'est un nombre)
    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      const { data: productByHiboutik, error: errorByHiboutik } = await supabase
        .from('products')
        .select('*')
        .eq('hiboutik_id', Number(identifier))
        .single();

      if (!errorByHiboutik && productByHiboutik) {
        console.log(`Produit trouvé par hiboutik_id: ${productByHiboutik.name}`);
        return formatProductData(productByHiboutik);
      }
    }

    // 3. Essayer par nom (recherche partielle insensible à la casse)
    const { data: productsByName, error: errorByName } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${identifier}%`)
      .limit(1);

    if (!errorByName && productsByName && productsByName.length > 0) {
      console.log(`Produit trouvé par nom: ${productsByName[0].name}`);
      return formatProductData(productsByName[0]);
    }

    // 4. Essayer par nom exact (au cas où)
    const { data: productByExactName, error: errorByExactName } = await supabase
      .from('products')
      .select('*')
      .eq('name', identifier)
      .single();

    if (!errorByExactName && productByExactName) {
      console.log(`Produit trouvé par nom exact: ${productByExactName.name}`);
      return formatProductData(productByExactName);
    }

    console.log(`Aucun produit trouvé pour l'identifiant: ${identifier}`);
    return null;

  } catch (error) {
    console.error('Exception lors de la recherche du produit:', error);
    return null;
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
 * API pour envoyer plusieurs images de produits via WhatsApp
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
    const data: MultipleMediaRequest = await request.json();

    // Support de la rétrocompatibilité : utiliser productIds si productIdentifiers n'est pas fourni
    const identifiers = data.productIdentifiers || data.productIds;

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !identifiers || !Array.isArray(identifiers)) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber et productIdentifiers (ou productIds) sont requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier que la liste n'est pas vide
    if (identifiers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "La liste des identifiants de produits ne peut pas être vide.",
        },
        { status: 400 }
      );
    }

    // Limiter le nombre de produits pour éviter le spam
    if (identifiers.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 10 produits peuvent être envoyés simultanément.",
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

    // Récupérer tous les produits
    const productResults = await Promise.allSettled(
      identifiers.map(async (identifier) => {
        const product = await findProductByIdentifier(identifier);
        if (!product) {
          throw new Error(`Produit avec l'identifiant "${identifier}" non trouvé`);
        }
        if (!product.image_url) {
          throw new Error(`Aucune image disponible pour le produit "${product.product_name}"`);
        }
        if (product.is_available === false) {
          throw new Error(`Le produit "${product.product_name}" n'est pas disponible`);
        }
        return { identifier, product };
      })
    );

    // Analyser les résultats de récupération
    const validProducts: { identifier: string | number; product: ProductWithImage }[] = [];
    const failedProducts: { identifier: string | number; error: string }[] = [];

    productResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        validProducts.push(result.value);
      } else {
        failedProducts.push({
          identifier: identifiers[index],
          error: result.reason.message
        });
      }
    });

    if (validProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun produit valide trouvé pour l'envoi",
          failedProducts: failedProducts,
        },
        { status: 404 }
      );
    }

    // Envoyer les médias avec délai entre chaque envoi
    const delayBetweenMessages = data.delayBetweenMessages || 2000;
    const sendResults = [];

    for (let i = 0; i < validProducts.length; i++) {
      const { identifier, product } = validProducts[i];
      
      // Ajouter un délai avant chaque envoi (sauf le premier)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
      }

      const result = await sendSingleMedia(phoneNumber, product, 1000);
      sendResults.push({
        identifier,
        productName: product.product_name,
        productId: product.product_id,
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
        total: identifiers.length,
        validProducts: validProducts.length,
        sentSuccessfully: successCount,
        sendFailed: failureCount,
        productNotFound: failedProducts.length
      },
      results: sendResults,
      failedProducts: failedProducts.length > 0 ? failedProducts : undefined,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi multiple de médias WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi multiple de médias WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 