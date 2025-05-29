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
 * Interface pour la requête d'envoi de média
 */
interface MediaRequest {
  phoneNumber: string;
  productIdentifier: string | number; // Peut être ID, hiboutik_id, ou nom
  productId?: string | number; // Rétrocompatibilité
  caption?: string;
  delay?: number;
}

/**
 * Fonction pour formater correctement les numéros de téléphone pour l'API officielle WhatsApp
 * L'API officielle WhatsApp Business recommande fortement d'inclure le + et le code pays
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Supprimer tous les espaces et caractères spéciaux sauf le +
  let formattedNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // S'assurer que le numéro commence par + (recommandé par la documentation officielle)
  if (!formattedNumber.startsWith("+")) {
    formattedNumber = "+" + formattedNumber;
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
function generateProductCaption(product: ProductWithImage, customCaption?: string): string {
  if (customCaption) {
    return customCaption;
  }

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
 * API pour envoyer des médias (images de produits) via l'API officielle WhatsApp Business
 */
export async function POST(request: NextRequest) {
  try {
    // Configuration de l'API officielle WhatsApp Business
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!phoneNumberId || !accessToken) {
      console.error("Variables d'environnement WhatsApp Business manquantes");
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète. WHATSAPP_PHONE_NUMBER_ID et WHATSAPP_ACCESS_TOKEN sont requis.",
        },
        { status: 500 }
      );
    }

    // Récupérer les données de la requête
    const data: MediaRequest = await request.json();

    // Support de la rétrocompatibilité : utiliser productId si productIdentifier n'est pas fourni
    const identifier = data.productIdentifier || data.productId;

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !identifier) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber et productIdentifier (ou productId) sont requis.",
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

    // Récupérer les informations du produit avec son image
    const product = await findProductByIdentifier(identifier);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Produit avec l'identifiant "${identifier}" non trouvé. Vérifiez l'ID, hiboutik_id ou le nom du produit.`,
          searchedIdentifier: identifier,
        },
        { status: 404 }
      );
    }

    // Vérifier qu'une image est disponible
    if (!product.image_url) {
      return NextResponse.json(
        {
          success: false,
          error: `Aucune image disponible pour le produit "${product.product_name}" (ID: ${product.product_id})`,
          product: {
            id: product.product_id,
            name: product.product_name,
            hiboutik_id: product.hiboutik_id
          }
        },
        { status: 404 }
      );
    }

    // Vérifier que le produit est disponible
    if (product.is_available === false) {
      return NextResponse.json(
        {
          success: false,
          error: `Le produit "${product.product_name}" n'est pas disponible`,
          product: {
            id: product.product_id,
            name: product.product_name,
            is_available: product.is_available,
            stock: product.stock
          }
        },
        { status: 400 }
      );
    }

    // Générer la caption
    const caption = generateProductCaption(product, data.caption);

    // Construction du payload pour l'API officielle WhatsApp Business
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual", // Recommandé par la documentation officielle
      to: phoneNumber,
      type: "image",
      image: {
        link: product.image_url,
        caption: caption,
      },
    };

    console.log("Envoi de média WhatsApp via API officielle:", {
      to: phoneNumber,
      productName: product.product_name,
      imageUrl: product.image_url.substring(0, 50) + "..."
    });

    // URL de l'API officielle WhatsApp Business
    const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    // Appel à l'API officielle WhatsApp Business
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Vérifier la réponse
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorText = errorData ? JSON.stringify(errorData) : await response.text();
      console.error("Erreur lors de l'envoi du média WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi du média WhatsApp",
          details: errorData || errorText,
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    // Récupérer la réponse
    const responseData = await response.json();

    return NextResponse.json({
      success: true,
      message: "Média WhatsApp envoyé avec succès",
      product: {
        id: product.product_id,
        name: product.product_name,
        image_url: product.image_url,
        category: product.category,
        stock: product.stock,
        price: product.product_price,
      },
      data: responseData,
      phoneNumber: phoneNumber,
      businessAccountId: businessAccountId,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi du média WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi du média WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 