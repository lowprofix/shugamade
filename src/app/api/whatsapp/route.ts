import { NextRequest, NextResponse } from "next/server";

/**
 * API pour envoyer des messages WhatsApp via EvolutionAPI
 */
export async function POST(request: NextRequest) {
  try {
    // Configuration de l'API Evolution
    const serverUrl = "https://evolution-api.bienquoi.com";
    const instanceName = "Mbotebio";
    const apiKey = "429683C4C977415CAAFCCE10F7D57E11";

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

    // Formater le numéro de téléphone (suppression des espaces et ajout du + si nécessaire)
    let phoneNumber = data.phoneNumber.replace(/\s+/g, "");
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+${phoneNumber}`;
    }

    // Construction du payload pour EvolutionAPI
    const payload = {
      number: phoneNumber,
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
