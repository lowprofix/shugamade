import { NextRequest, NextResponse } from "next/server";

/**
 * Interface pour un bouton WhatsApp
 */
interface WhatsAppButton {
  title: string;
  displayText: string;
  id: string;
  type?: "reply" | "copy" | "url" | "call" | "pix"; // Types acceptés par l'API Evolution
}

/**
 * Interface pour la requête d'envoi de boutons
 */
interface ButtonsRequest {
  phoneNumber: string;
  title: string;
  description?: string;
  footer?: string;
  buttons: WhatsAppButton[];
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
}

/**
 * Fonction pour formater correctement les numéros de téléphone internationaux
 * Réutilisée depuis les autres APIs WhatsApp
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
 * Valide la structure des boutons
 */
function validateButtons(buttons: WhatsAppButton[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(buttons) || buttons.length === 0) {
    return { isValid: false, error: "Au moins un bouton doit être fourni" };
  }

  if (buttons.length > 3) {
    return { isValid: false, error: "Maximum 3 boutons autorisés par WhatsApp" };
  }

  // Vérifier que chaque bouton a les champs requis
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    if (!button.title || !button.displayText || !button.id) {
      return { 
        isValid: false, 
        error: `Le bouton ${i + 1} doit avoir les champs title, displayText et id` 
      };
    }

    if (typeof button.title !== 'string' || typeof button.displayText !== 'string' || typeof button.id !== 'string') {
      return { 
        isValid: false, 
        error: `Le bouton ${i + 1} doit avoir des champs de type string` 
      };
    }

    if (button.title.length > 20) {
      return { 
        isValid: false, 
        error: `Le titre du bouton ${i + 1} ne peut pas dépasser 20 caractères` 
      };
    }

    if (button.displayText.length > 20) {
      return { 
        isValid: false, 
        error: `Le texte affiché du bouton ${i + 1} ne peut pas dépasser 20 caractères` 
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
 * API pour envoyer des boutons WhatsApp via EvolutionAPI
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

    // Construction du payload pour l'API Evolution
    const payload = {
      number: phoneNumber,
      title: data.title,
      description: data.description || "",
      footer: data.footer || "",
      buttons: data.buttons.map(button => ({
        ...button,
        type: button.type || "reply" // Utiliser "reply" par défaut
      })),
      delay: data.delay || 1000,
      linkPreview: data.linkPreview !== undefined ? data.linkPreview : true,
      mentionsEveryOne: data.mentionsEveryOne || false,
      ...(data.mentioned && data.mentioned.length > 0 && { mentioned: data.mentioned }),
    };

    console.log("Envoi de boutons WhatsApp:", {
      ...payload,
      buttons: payload.buttons.map(b => ({ title: b.title, id: b.id }))
    });

    // Appel à l'API Evolution pour envoyer les boutons
    const response = await fetch(
      `${serverUrl}/message/sendButtons/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    // Vérifier la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors de l'envoi des boutons WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi des boutons WhatsApp",
          details: errorText,
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
      sentButtons: data.buttons.map(b => ({ title: b.title, displayText: b.displayText, id: b.id })),
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