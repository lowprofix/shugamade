import { NextRequest, NextResponse } from "next/server";
import { detectAndFormatPhoneNumber } from "@/lib/phone-utils";

/**
 * Vérifie si un numéro est enregistré sur WhatsApp
 * @param phoneNumber Numéro de téléphone à vérifier
 * @returns true si le numéro est enregistré sur WhatsApp, false sinon
 */
async function isWhatsAppNumber(phoneNumber: string): Promise<boolean> {
  try {
    // Configuration de l'API Evolution depuis les variables d'environnement
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    // Vérifier que les variables d'environnement sont définies
    if (!serverUrl || !instanceName || !apiKey) {
      console.error(
        "Variables d'environnement WhatsApp manquantes pour la vérification de numéro"
      );
      return false;
    }

    // Utiliser le nouveau système intelligent de formatage
    const phoneInfo = detectAndFormatPhoneNumber(phoneNumber);
    const formattedNumber = phoneInfo.formatted;
    
    console.log(`📞 Vérification WhatsApp: ${phoneNumber} -> ${formattedNumber} (${phoneInfo.countryName})`);

    // Appel à l'API Evolution pour vérifier si le numéro est enregistré sur WhatsApp
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

    // Vérifier si le numéro est dans la liste des numéros WhatsApp
    // La structure de réponse dépend de l'API Evolution, ajuster si nécessaire
    if (data && Array.isArray(data) && data.length > 0) {
      // Chercher si le numéro spécifique est valide
      const numberResult = data.find(
        (item) =>
          item.number === formattedNumber ||
          item.jid?.includes(formattedNumber.substring(1))
      );
      if (numberResult && numberResult.exists === true) {
        console.log(`✅ Le numéro ${formattedNumber} est enregistré sur WhatsApp`);
        return true;
      }
    }

    console.log(
      `❌ Le numéro ${formattedNumber} n'est pas enregistré sur WhatsApp`
    );
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification du numéro WhatsApp:", error);
    return false;
  }
}

/**
 * API pour envoyer des messages WhatsApp via EvolutionAPI
 */
export async function POST(request: NextRequest) {
  try {
    // Configuration de l'API Evolution depuis les variables d'environnement
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    // Vérifier que les variables d'environnement sont définies
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

    // Vérifier si le numéro est enregistré sur WhatsApp
    const isWhatsApp = await isWhatsAppNumber(data.phoneNumber);
    if (!isWhatsApp) {
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro n'est pas enregistré sur WhatsApp",
          whatsapp: false,
          phoneNumber: data.phoneNumber,
        },
        { status: 400 }
      );
    }

    // Formater le numéro pour l'envoi
    const phoneInfo = detectAndFormatPhoneNumber(data.phoneNumber);
    const formattedPhoneNumber = phoneInfo.formatted;
    
    console.log(`📞 Envoi WhatsApp: ${data.phoneNumber} -> ${formattedPhoneNumber} (${phoneInfo.countryName})`);

    // Construction du payload pour EvolutionAPI
    const payload = {
      number: formattedPhoneNumber,
      text: data.message,
      // Options supplémentaires
      delay: data.delay || 1000, // délai par défaut de 1 seconde
      linkPreview: data.linkPreview !== undefined ? data.linkPreview : true,
    };

    console.log("Envoi de message WhatsApp:", payload);

    // Appel à l'API Evolution
    const response = await fetch(
      `${serverUrl}/message/sendText/${instanceName}`,
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
      console.error("Erreur lors de l'envoi du message WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi du message WhatsApp",
          details: errorText,
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
