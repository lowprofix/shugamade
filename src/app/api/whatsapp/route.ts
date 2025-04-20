import { NextRequest, NextResponse } from "next/server";

/**
 * Fonction pour formater correctement les numéros de téléphone internationaux
 * Gère les cas spécifiques par pays, notamment le 0 initial après l'indicatif pays
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Supprimer tous les espaces
  let formattedNumber = phoneNumber.replace(/\s+/g, "");

  // S'assurer que le numéro commence par un +
  if (!formattedNumber.startsWith("+")) {
    formattedNumber = `+${formattedNumber}`;
  }

  // Liste des pays qui utilisent un 0 comme indicateur national qui doit être supprimé
  // dans un format international (la clé est l'indicatif du pays)
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
        break; // Sortir de la boucle une fois le traitement effectué
      }
    }
  }

  return formattedNumber;
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

    // Utiliser la nouvelle fonction de formatage de numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

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
