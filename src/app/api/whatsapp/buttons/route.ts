import { NextRequest, NextResponse } from "next/server";

/**
 * Interface pour un bouton WhatsApp (API officielle)
 */
interface WhatsAppButton {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

/**
 * Interface pour la requête d'envoi de boutons
 */
interface ButtonsRequest {
  phoneNumber: string;
  title: string;
  description?: string;
  footer?: string;
  buttons: Array<{
    title: string;
    displayText?: string; // Rétrocompatibilité
    id: string;
    type?: string; // Rétrocompatibilité
  }>;
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
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
 * Valide la structure des boutons
 */
function validateButtons(buttons: ButtonsRequest['buttons']): { isValid: boolean; error?: string } {
  if (!Array.isArray(buttons) || buttons.length === 0) {
    return { isValid: false, error: "Au moins un bouton doit être fourni" };
  }

  if (buttons.length > 3) {
    return { isValid: false, error: "Maximum 3 boutons autorisés par WhatsApp" };
  }

  // Vérifier que chaque bouton a les champs requis
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const title = button.title || button.displayText; // Support rétrocompatibilité
    
    if (!title || !button.id) {
      return { 
        isValid: false, 
        error: `Le bouton ${i + 1} doit avoir les champs title (ou displayText) et id` 
      };
    }

    if (typeof title !== 'string' || typeof button.id !== 'string') {
      return { 
        isValid: false, 
        error: `Le bouton ${i + 1} doit avoir des champs de type string` 
      };
    }

    if (title.length > 20) {
      return { 
        isValid: false, 
        error: `Le titre du bouton ${i + 1} ne peut pas dépasser 20 caractères` 
      };
    }
  }

  // Vérifier que les IDs sont uniques
  const ids = buttons.map(b => b.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    return { isValid: false, error: "Les IDs des boutons doivent être uniques" };
  }

  return { isValid: true };
}

/**
 * Convertit les boutons au format de l'API officielle
 */
function convertButtonsToOfficialFormat(buttons: ButtonsRequest['buttons']): WhatsAppButton[] {
  return buttons.map(button => ({
    type: "reply",
    reply: {
      id: button.id,
      title: button.title || button.displayText || "", // Support rétrocompatibilité
    }
  }));
}

/**
 * API pour envoyer des boutons WhatsApp via l'API officielle WhatsApp Business
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
    const data: ButtonsRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.title || !data.buttons) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber, title et buttons sont requis.",
        },
        { status: 400 }
      );
    }

    // Valider les boutons
    const buttonValidation = validateButtons(data.buttons);
    if (!buttonValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: buttonValidation.error,
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

    // Convertir les boutons au format de l'API officielle
    const officialButtons = convertButtonsToOfficialFormat(data.buttons);

    // Construction du payload pour l'API officielle WhatsApp Business
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual", // Recommandé par la documentation officielle
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: data.title,
        },
        ...(data.footer && {
          footer: {
            text: data.footer,
          },
        }),
        action: {
          buttons: officialButtons,
        },
      },
    };

    console.log("Envoi de boutons WhatsApp via API officielle:", {
      to: phoneNumber,
      title: data.title,
      buttonCount: officialButtons.length,
      buttons: officialButtons.map(b => ({ title: b.reply.title, id: b.reply.id }))
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
      console.error("Erreur lors de l'envoi des boutons WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi des boutons WhatsApp",
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
      message: "Boutons WhatsApp envoyés avec succès",
      data: responseData,
      sentButtons: data.buttons.map(b => ({ 
        title: b.title || b.displayText, 
        id: b.id 
      })),
      phoneNumber: phoneNumber,
      businessAccountId: businessAccountId,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi des boutons WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi des boutons WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 