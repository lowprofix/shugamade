import { NextRequest, NextResponse } from "next/server";
import { toZonedTime, format } from "date-fns-tz";
import { fr } from "date-fns/locale";

// Définir la constante TIMEZONE
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest

/**
 * API Route pour créer une réservation
 * Cette route sert d'intermédiaire entre le frontend et l'API n8n
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const bookingData = await request.json();

    // Vérifier que les données requises sont présentes
    if (
      !bookingData.title ||
      !bookingData.start ||
      !bookingData.end ||
      !bookingData.clientName ||
      !bookingData.clientPhone
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Données manquantes. Les champs title, start, end, clientName et clientPhone sont requis.",
        },
        { status: 400 }
      );
    }

    // Données à envoyer à n8n
    const eventData = {
      title: bookingData.title,
      description: bookingData.description || "",
      start: bookingData.start,
      end: bookingData.end,
      // Informations client
      clientName: bookingData.clientName || null,
      clientEmail: bookingData.clientEmail || null,
      clientPhone: bookingData.clientPhone || null,
      // Ajouter les informations supplémentaires pour les réservations multiples
      isPartOfPackage: bookingData.isPartOfPackage || false,
      packageInfo: bookingData.packageInfo || null,
      service: bookingData.service || null,
      customer: bookingData.customer || null,
      // Ajouter l'ID Hiboutik s'il existe
      hiboutikClientId: bookingData.hiboutikClientId || null,
    };

    console.log("Envoi de la réservation à n8n:", eventData);
    console.log("Informations client:", {
      nom: eventData.clientName,
      téléphone: eventData.clientPhone,
      email: eventData.clientEmail,
    });

    // Récupérer les URLs des webhooks depuis les variables d'environnement
    const createEventUrl = process.env.N8N_WEBHOOK_CREATE_EVENT;
    const testEventUrl = process.env.N8N_WEBHOOK_TEST_EVENT;
    const baseWebhookUrl = process.env.N8N_WEBHOOK_BASE;

    // Vérifier que les variables d'environnement essentielles sont définies
    if (!createEventUrl) {
      console.error(
        "Variable d'environnement N8N_WEBHOOK_CREATE_EVENT manquante"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète",
        },
        { status: 500 }
      );
    }

    // Essayer d'abord avec l'URL principale
    let response;
    let responseData;
    let error = null;

    try {
      // Appeler l'API n8n pour créer l'événement - URL principale
      response = await fetch(createEventUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP: ${response.status} ${response.statusText}`
        );
      }

      responseData = await response.json();
    } catch (err) {
      console.error("Erreur avec l'URL principale:", err);
      error = err;

      // Essayer avec l'URL alternative si elle est définie
      if (testEventUrl) {
        try {
          console.log("Tentative avec l'URL alternative...");
          response = await fetch(testEventUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          });

          if (!response.ok) {
            throw new Error(
              `Erreur HTTP: ${response.status} ${response.statusText}`
            );
          }

          responseData = await response.json();
          error = null; // Réinitialiser l'erreur si la deuxième tentative réussit
        } catch (secondErr) {
          console.error("Erreur avec l'URL alternative:", secondErr);
          // Conserver l'erreur originale si les deux tentatives échouent
        }
      } else {
        console.warn(
          "URL alternative non définie dans les variables d'environnement"
        );
      }
    }

    // Si les deux tentatives ont échoué et que l'URL de base est définie
    if (error && baseWebhookUrl) {
      console.error("Toutes les tentatives ont échoué");

      // Essayer une troisième URL (URL de base)
      try {
        console.log("Tentative avec l'URL de base...");
        response = await fetch(baseWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP: ${response.status} ${response.statusText}`
          );
        }

        responseData = await response.json();
        console.log("Réponse de n8n (URL de base):", responseData);
      } catch (thirdErr) {
        console.error("Erreur avec l'URL de base:", thirdErr);

        return NextResponse.json(
          {
            success: false,
            error: "Échec de la création de la réservation",
            details:
              "Impossible de contacter le serveur n8n après plusieurs tentatives",
            originalError:
              error instanceof Error ? error.message : "Erreur inconnue",
          },
          { status: 502 }
        );
      }
    } else if (error) {
      // Toutes les tentatives ont échoué et l'URL de base n'est pas définie
      return NextResponse.json(
        {
          success: false,
          error: "Échec de la création de la réservation",
          details:
            "Impossible de contacter le serveur n8n après plusieurs tentatives",
          originalError:
            error instanceof Error ? error.message : "Erreur inconnue",
        },
        { status: 502 }
      );
    }

    // Si nous avons une réponse valide
    if (responseData && responseData.success) {
      console.log("Réservation créée avec succès dans n8n:", responseData);

      // Envoi d'un message WhatsApp de confirmation
      try {
        console.log(
          "Tentative d'envoi du message WhatsApp directement via Evolution API..."
        );

        // Formater la date et l'heure pour le message en utilisant toZonedTime et format avec le bon fuseau horaire
        const startDate = toZonedTime(new Date(bookingData.start), TIMEZONE);
        const formattedDate = format(startDate, "d MMMM", {
          locale: fr,
          timeZone: TIMEZONE,
        });
        const formattedTime = format(startDate, "HH:mm", {
          timeZone: TIMEZONE,
        });

        // Construire le message de confirmation
        const message =
          `Bonjour ${eventData.clientName},\n\n` +
          `Nous vous confirmons votre réservation pour votre séance de ${eventData.title}.\n\n` +
          `📅 Date et heure : ${formattedDate} à ${formattedTime}\n\n` +
          `💰 Acompte\n` +
          `• Un acompte de 5 000 FCFA est requis pour confirmer définitivement votre réservation.\n` +
          `• Modes de paiement acceptés :\n` +
          `  - Mobile Money: +242 06 597 56 23\n` +
          `  - Airtel Money: +242 05 092 89 99\n\n` +
          `L'accompte sera bien entendu déduit du montant total de la prestation.\n\n` +
          `🔹 Préparation avant la séance\n` +
          `✅ Cheveux propres et sans produit : Merci de vous assurer que vos cheveux, en particulier la zone à traiter, soient propres et exempts de tout produit (huiles, gels, crèmes, etc.).\n\n` +
          `⏳ Ponctualité\n` +
          `• Merci d'arriver à l'heure afin de profiter pleinement de votre séance.\n` +
          `• Un retard de plus de 30 minutes entraînera l'annulation de la séance sans possibilité de remboursement de l'acompte.\n\n` +
          `❌ Annulation & Report\n` +
          `• Toute annulation ou report doit être signalé au moins 24h à l'avance.\n` +
          `• Au-delà de ce délai, l'acompte ne pourra pas être remboursé.\n\n` +
          `Si vous avez des questions, n'hésitez pas à me contacter.\n` +
          `À très bientôt !\n\n` +
          `Eunice – SHUGAMADE\n` +
          `📞 +242 06 597 56 23`;

        // Log du message formaté final pour débogage
        console.log("Message WhatsApp formaté final:", message);

        // Configuration de l'API Evolution
        const serverUrl = process.env.EVOLUTION_API_SERVER;
        const instanceName = process.env.EVOLUTION_API_INSTANCE;
        const apiKey = process.env.EVOLUTION_API_KEY;

        // Vérifier que les variables d'environnement sont définies
        if (!serverUrl || !instanceName || !apiKey) {
          console.error("Variables d'environnement WhatsApp manquantes");
          throw new Error("Configuration serveur WhatsApp incomplète");
        }

        // Fonction pour formater le numéro de téléphone
        function formatPhoneNumber(phoneNumber: string): string {
          // Supprimer tous les espaces
          let formattedNumber = phoneNumber.replace(/\s+/g, "");

          // S'assurer que le numéro commence par un +
          if (!formattedNumber.startsWith("+")) {
            formattedNumber = `+${formattedNumber}`;
          }

          // Liste des pays qui utilisent un 0 comme indicateur national à supprimer
          const countriesWithLeadingZero = [
            "+33", // France
            "+44", // Royaume-Uni
            "+39", // Italie
            "+34", // Espagne
            "+49", // Allemagne
            "+32", // Belgique
            "+31", // Pays-Bas
          ];

          // Vérifier et traiter le 0 après l'indicatif pays
          for (const countryCode of countriesWithLeadingZero) {
            if (
              formattedNumber.startsWith(countryCode) &&
              formattedNumber.length > countryCode.length &&
              formattedNumber.charAt(countryCode.length) === "0"
            ) {
              formattedNumber = `${countryCode}${formattedNumber.substring(
                countryCode.length + 1
              )}`;
              break;
            }
          }

          return formattedNumber;
        }

        // Formater le numéro de téléphone
        const phoneNumber = formatPhoneNumber(eventData.clientPhone);
        console.log("Numéro de téléphone formaté pour WhatsApp:", phoneNumber);

        // Construction du payload pour EvolutionAPI
        const payload = {
          number: phoneNumber,
          text: message,
          delay: 1000,
          linkPreview: true,
        };

        console.log("Payload pour Evolution API:", payload);

        // Appel direct à Evolution API
        const evolutionResponse = await fetch(
          `${serverUrl}/message/sendText/${instanceName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: apiKey ?? "",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!evolutionResponse.ok) {
          const errorText = await evolutionResponse.text();
          console.error(
            "Erreur lors de l'envoi du message WhatsApp via Evolution API:",
            errorText
          );
          throw new Error(
            `Erreur Evolution API: ${evolutionResponse.status} - ${errorText}`
          );
        }

        const evolutionResult = await evolutionResponse.json();
        console.log(
          "Message WhatsApp envoyé avec succès via Evolution API:",
          evolutionResult
        );
      } catch (whatsappError) {
        console.error(
          "Erreur lors de l'envoi du message WhatsApp:",
          whatsappError
        );
        // On ne bloque pas la réponse en cas d'échec de l'envoi WhatsApp
      }

      return NextResponse.json(
        {
          success: true,
          message: "Réservation créée avec succès",
          data: responseData,
        },
        { status: 201 }
      );
    } else {
      console.error("Réponse invalide de n8n:", responseData);
      return NextResponse.json(
        {
          success: false,
          error: "Échec de la création de la réservation",
          message: responseData?.message || "Erreur inconnue",
          details: responseData,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la création de la réservation",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
