import { NextRequest, NextResponse } from "next/server";

/**
 * Interface pour la requête d'envoi de sondage
 */
interface PollRequest {
  phoneNumber: string;
  name: string;
  selectableCount: number;
  values: string[];
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
  quoted?: {
    key: {
      id: string;
    };
    message: {
      conversation: string;
    };
  };
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
 * Valide la structure du sondage
 */
function validatePoll(data: PollRequest): { isValid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string') {
    return { isValid: false, error: "Le nom du sondage est requis et doit être une chaîne de caractères" };
  }

  if (data.name.length > 60) {
    return { isValid: false, error: "Le nom du sondage ne peut pas dépasser 60 caractères" };
  }

  if (!Array.isArray(data.values) || data.values.length === 0) {
    return { isValid: false, error: "Au moins une option doit être fournie" };
  }

  if (data.values.length > 12) {
    return { isValid: false, error: "Maximum 12 options autorisées par WhatsApp" };
  }

  // Vérifier que chaque option est valide
  for (let i = 0; i < data.values.length; i++) {
    const option = data.values[i];
    if (!option || typeof option !== 'string') {
      return { 
        isValid: false, 
        error: `L'option ${i + 1} doit être une chaîne de caractères non vide` 
      };
    }

    if (option.length > 100) {
      return { 
        isValid: false, 
        error: `L'option ${i + 1} ne peut pas dépasser 100 caractères` 
      };
    }
  }

  // Vérifier que les options sont uniques
  const uniqueOptions = new Set(data.values);
  if (data.values.length !== uniqueOptions.size) {
    return { isValid: false, error: "Les options du sondage doivent être uniques" };
  }

  // Vérifier selectableCount
  if (typeof data.selectableCount !== 'number' || data.selectableCount < 1) {
    return { isValid: false, error: "selectableCount doit être un nombre positif" };
  }

  if (data.selectableCount > data.values.length) {
    return { isValid: false, error: "selectableCount ne peut pas être supérieur au nombre d'options" };
  }

  return { isValid: true };
}

/**
 * API pour envoyer des sondages WhatsApp via EvolutionAPI
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
    const data: PollRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.name || !data.values || data.selectableCount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber, name, values et selectableCount sont requis.",
        },
        { status: 400 }
      );
    }

    // Valider le sondage
    const pollValidation = validatePoll(data);
    if (!pollValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: pollValidation.error,
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
      name: data.name,
      selectableCount: data.selectableCount,
      values: data.values,
      delay: data.delay || 1000,
      linkPreview: data.linkPreview !== undefined ? data.linkPreview : true,
      mentionsEveryOne: data.mentionsEveryOne || false,
      // Ne pas inclure mentioned si le tableau est vide ou non fourni
      ...(data.mentioned && data.mentioned.length > 0 && { mentioned: data.mentioned }),
      // Inclure quoted si fourni
      ...(data.quoted && { quoted: data.quoted }),
    };

    console.log("Envoi de sondage WhatsApp:", {
      ...payload,
      values: payload.values,
      optionCount: payload.values.length
    });

    // Appel à l'API Evolution pour envoyer le sondage
    const response = await fetch(
      `${serverUrl}/message/sendPoll/${instanceName}`,
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
      console.error("Erreur lors de l'envoi du sondage WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi du sondage WhatsApp",
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Récupérer la réponse
    const responseData = await response.json();

    return NextResponse.json({
      success: true,
      message: "Sondage WhatsApp envoyé avec succès",
      data: responseData,
      poll: {
        name: data.name,
        options: data.values,
        selectableCount: data.selectableCount,
        totalOptions: data.values.length
      },
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi du sondage WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi du sondage WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 