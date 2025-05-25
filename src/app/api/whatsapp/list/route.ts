import { NextRequest, NextResponse } from "next/server";

/**
 * Interface pour une ligne de liste WhatsApp
 */
interface ListRow {
  title: string;
  description?: string;
  rowId: string;
}

/**
 * Interface pour une section de liste
 */
interface ListSection {
  title: string;
  rows: ListRow[];
}

/**
 * Interface pour la requête d'envoi de liste
 */
interface ListRequest {
  phoneNumber: string;
  title: string;
  description?: string;
  buttonText: string;
  footerText?: string;
  sections: ListSection[];
  delay?: number;
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
 * API pour envoyer des listes WhatsApp via EvolutionAPI
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
    const data: ListRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.title || !data.buttonText || !data.sections) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber, title, buttonText et sections sont requis.",
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
      buttonText: data.buttonText,
      footerText: data.footerText || "",
      sections: data.sections,
      delay: data.delay || 1000,
    };

    console.log("Envoi de liste WhatsApp:", {
      ...payload,
      sections: payload.sections.map(s => ({ title: s.title, rowCount: s.rows.length }))
    });

    // Appel à l'API Evolution pour envoyer la liste
    const response = await fetch(
      `${serverUrl}/message/sendList/${instanceName}`,
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
      console.error("Erreur lors de l'envoi de la liste WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi de la liste WhatsApp",
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Récupérer la réponse
    const responseData = await response.json();

    return NextResponse.json({
      success: true,
      message: "Liste WhatsApp envoyée avec succès",
      data: responseData,
      sentSections: data.sections.map(s => ({ 
        title: s.title, 
        rows: s.rows.map(r => ({ title: r.title, rowId: r.rowId }))
      })),
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi de la liste WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi de la liste WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 