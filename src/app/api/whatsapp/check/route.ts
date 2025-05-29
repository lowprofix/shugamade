import { NextRequest, NextResponse } from "next/server";

/**
 * Fonction pour formater correctement les numéros de téléphone internationaux
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Supprimer tous les espaces
  let formattedNumber = phoneNumber.replace(/\s+/g, "");

  // S'assurer que le numéro commence par un +
  if (!formattedNumber.startsWith("+")) {
    formattedNumber = `+${formattedNumber}`;
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
 * API pour vérifier si un numéro est enregistré sur WhatsApp
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

      // En environnement de développement, simuler une réponse pour tester l'interface
      if (process.env.NODE_ENV === "development") {
        const mockIsWhatsApp = Math.random() > 0.5; // 50% de chance d'être sur WhatsApp
        console.log(
          "Mode développement: simulation de la vérification WhatsApp"
        );

        return NextResponse.json({
          success: true,
          isWhatsApp: mockIsWhatsApp,
          message: mockIsWhatsApp
            ? "Numéro enregistré sur WhatsApp (simulation)"
            : "Numéro non enregistré sur WhatsApp (simulation)",
        });
      }

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

    // Vérifier que le numéro de téléphone est présent
    if (!data.phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Numéro de téléphone manquant",
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

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
          numbers: [phoneNumber],
        }),
      }
    );

    // Vérifier la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Erreur lors de la vérification du numéro WhatsApp:",
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error: "Échec de la vérification du numéro WhatsApp",
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Récupérer la réponse
    const responseData = await response.json();

    // Structure de réponse de l'API Evolution:
    // [{ exists: boolean, jid: string, number: string }, ...]
    let isWhatsApp = false;
    if (Array.isArray(responseData) && responseData.length > 0) {
      const result = responseData[0];
      isWhatsApp = result.exists === true;
    }

    return NextResponse.json({
      success: true,
      isWhatsApp,
      message: isWhatsApp
        ? "Numéro enregistré sur WhatsApp"
        : "Numéro non enregistré sur WhatsApp",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du numéro WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de la vérification du numéro WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
