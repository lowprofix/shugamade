import { NextRequest, NextResponse } from "next/server";

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

  // Liste des pays qui utilisent un 0 comme indicateur national qui doit être supprimé
  const countriesWithLeadingZero = [
    "+33", // France
    "+44", // Royaume-Uni
    "+39", // Italie
    "+34", // Espagne
    "+49", // Allemagne
    "+32", // Belgique
    "+31", // Pays-Bas
  ];

  // Vérifier si le numéro correspond à l'un des pays listés
  for (const countryCode of countriesWithLeadingZero) {
    if (
      formattedNumber.startsWith(countryCode) &&
      formattedNumber.length > countryCode.length
    ) {
      // Si le caractère après l'indicatif pays est un 0, le supprimer
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
 * API pour envoyer des messages WhatsApp via l'API officielle WhatsApp Business
 */
export async function POST(request: NextRequest) {
  try {
    // Configuration de l'API officielle WhatsApp Business
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    // Vérifier que les variables d'environnement sont définies
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
    const data = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Données manquantes. Les champs phoneNumber et message sont requis.",
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone pour l'API officielle
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

    // Construction du payload pour l'API officielle WhatsApp Business
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual", // Recommandé par la documentation officielle
      to: phoneNumber,
      type: "text",
      text: {
        body: data.message,
        preview_url: data.linkPreview !== undefined ? data.linkPreview : true,
      },
    };

    console.log("Envoi de message WhatsApp via API officielle:", {
      to: phoneNumber,
      message: data.message.substring(0, 50) + (data.message.length > 50 ? "..." : ""),
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
      console.error("Erreur lors de l'envoi du message WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi du message WhatsApp",
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
      message: "Message WhatsApp envoyé avec succès",
      data: responseData,
      phoneNumber: phoneNumber,
      businessAccountId: businessAccountId,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi du message WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi du message WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
