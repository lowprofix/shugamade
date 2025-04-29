import { NextRequest, NextResponse } from "next/server";
import { checkSlotAvailability } from "@/lib/availability";
import { toZonedTime, format } from "date-fns-tz";
import { fr } from "date-fns/locale";

// Définir la constante TIMEZONE
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest

/**
 * Type pour la requête de réservation multiple
 */
type MultipleBookingRequest = {
  // Informations client (une seule fois)
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  hiboutikClientId?: string;

  // Informations sur le pack
  packageName: string; // Nom du pack
  packageDescription?: string; // Description du pack

  // Les réservations individuelles du pack
  bookings: {
    title: string; // Titre/nom du service
    start: string; // Date et heure de début (ISO)
    end: string; // Date et heure de fin (ISO)
    description?: string; // Description spécifique à cette séance
  }[];

  // Paramètre pour l'envoi de la confirmation WhatsApp
  sendWhatsAppConfirmation: boolean;
};

/**
 * API Route pour créer plusieurs réservations en même temps (pack)
 * Cette route sert d'intermédiaire entre le frontend et l'API n8n
 * Elle gère également l'envoi d'un UNIQUE message WhatsApp de confirmation
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const multipleBookingData =
      (await request.json()) as MultipleBookingRequest;

    // Vérifier que les données requises sont présentes
    if (
      !multipleBookingData.clientName ||
      !multipleBookingData.clientPhone ||
      !multipleBookingData.packageName ||
      !multipleBookingData.bookings ||
      !Array.isArray(multipleBookingData.bookings) ||
      multipleBookingData.bookings.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Données manquantes. Les champs clientName, clientPhone, packageName et un tableau de réservations sont requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier que chaque réservation a les données requises
    for (const booking of multipleBookingData.bookings) {
      if (!booking.title || !booking.start || !booking.end) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Données de réservation incomplètes. Chaque réservation doit avoir un titre, une date de début et une date de fin.",
          },
          { status: 400 }
        );
      }
    }

    console.log(
      `Traitement d'un pack de ${multipleBookingData.bookings.length} réservations`
    );
    console.log("Informations client:", {
      nom: multipleBookingData.clientName,
      téléphone: multipleBookingData.clientPhone,
      email: multipleBookingData.clientEmail,
    });

    // Étape 1: Vérifier la disponibilité de chaque créneau
    console.log("Vérification de la disponibilité des créneaux...");

    const availabilityChecks = await Promise.all(
      multipleBookingData.bookings.map(async (booking) => {
        // Vérifier si le créneau est disponible
        const availability = await checkSlotAvailability(
          new Date(booking.start),
          new Date(booking.end)
        );

        return {
          booking,
          available: availability.available,
          reason: availability.reason,
        };
      })
    );

    // Vérifier si tous les créneaux sont disponibles
    const unavailableSlots = availabilityChecks.filter(
      (check) => !check.available
    );

    if (unavailableSlots.length > 0) {
      console.warn(
        "Certains créneaux ne sont pas disponibles:",
        unavailableSlots
      );
      return NextResponse.json(
        {
          success: false,
          error: "Certains créneaux ne sont pas disponibles",
          unavailableSlots: unavailableSlots.map((slot) => ({
            title: slot.booking.title,
            start: slot.booking.start,
            end: slot.booking.end,
            reason: slot.reason,
          })),
        },
        { status: 409 }
      );
    }

    // Étape 2: Créer chaque réservation via n8n
    console.log(
      "Tous les créneaux sont disponibles. Création des réservations..."
    );

    // Récupérer les URLs des webhooks depuis les variables d'environnement
    const createEventUrl = process.env.N8N_WEBHOOK_CREATE_EVENT;
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

    // Créer chaque réservation séquentiellement
    const createdBookings = [];
    let hasError = false;
    let errorMessage = "";

    for (const booking of multipleBookingData.bookings) {
      // Données à envoyer à n8n pour cette réservation
      const eventData = {
        title: booking.title,
        description: booking.description || "",
        start: booking.start,
        end: booking.end,
        // Informations client
        clientName: multipleBookingData.clientName,
        clientEmail: multipleBookingData.clientEmail || null,
        clientPhone: multipleBookingData.clientPhone,
        // Informations package
        isPartOfPackage: true,
        packageInfo: {
          name: multipleBookingData.packageName,
          description: multipleBookingData.packageDescription || "",
          totalBookings: multipleBookingData.bookings.length,
        },
        // ID Hiboutik s'il existe
        hiboutikClientId: multipleBookingData.hiboutikClientId || null,
      };

      console.log(`Création de la réservation: ${booking.title}`, {
        start: booking.start,
        end: booking.end,
      });

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
        if (createEventUrl) {
          try {
            console.log("Tentative avec l'URL alternative...");
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
          error = null; // Réinitialiser l'erreur si la troisième tentative réussit
        } catch (thirdErr) {
          console.error("Erreur avec l'URL de base:", thirdErr);
          error = thirdErr;
        }
      }

      // Vérifier si la création a réussi
      if (error || !responseData || !responseData.success) {
        hasError = true;
        errorMessage =
          error instanceof Error
            ? error.message
            : "Échec de la création d'une ou plusieurs réservations";

        console.error(
          `Échec de la création de la réservation: ${booking.title}`,
          error
        );

        // NOTE: Dans une version future, on pourrait implémenter un rollback ici
        // pour annuler les réservations déjà créées

        break; // Arrêter le processus en cas d'erreur
      }

      // Ajouter la réservation créée à la liste
      createdBookings.push({
        ...booking,
        id: responseData.data?.id || null,
        created: true,
      });
    }

    // Si une erreur s'est produite lors de la création des réservations
    if (hasError) {
      return NextResponse.json(
        {
          success: false,
          error: "Échec de la création d'une ou plusieurs réservations",
          message: errorMessage,
          partialSuccess: createdBookings.length > 0,
          createdBookings: createdBookings,
        },
        { status: 500 }
      );
    }

    // Étape 3: Toutes les réservations ont été créées avec succès
    // Envoi d'un unique message WhatsApp de confirmation
    console.log("Toutes les réservations ont été créées avec succès");

    // Vérifier si l'utilisateur a choisi de recevoir des notifications WhatsApp
    if (multipleBookingData.sendWhatsAppConfirmation) {
      console.log("Envoi du message WhatsApp de confirmation...");

      try {
        // Fonction pour formater les dates et heures en utilisant toZonedTime et format
        function formatBookingDateTime(isoString: string): {
          date: string;
          time: string;
        } {
          const date = toZonedTime(new Date(isoString), TIMEZONE);
          return {
            date: format(date, "d MMMM", { locale: fr, timeZone: TIMEZONE }),
            time: format(date, "HH:mm", { timeZone: TIMEZONE }),
          };
        }

        // Construire le message WhatsApp avec toutes les réservations
        let bookingsList = "";
        multipleBookingData.bookings.forEach((booking, index) => {
          const { date, time } = formatBookingDateTime(booking.start);
          bookingsList += `${index + 1}. ${date} à ${time}\n`;
        });

        // Obtenir la date de la première réservation pour l'acompte
        const firstBookingDate = formatBookingDateTime(
          multipleBookingData.bookings[0].start
        ).date;

        // Construire le message de confirmation
        const message =
          `Bonjour ${multipleBookingData.clientName},\n\n` +
          `Nous vous confirmons votre réservation pour votre pack "${multipleBookingData.packageName}".\n\n` +
          `📅 Vos séances :\n${bookingsList}\n` +
          `💰 Acompte\n` +
          `• Un acompte de 5 000 FCFA est requis pour confirmer définitivement vos réservations.\n` +
          `• Modes de paiement acceptés :\n` +
          `  - Mobile Money: +242 06 597 56 23\n` +
          `  - Airtel Money: +242 05 092 89 99\n\n` +
          `L'acompte sera bien entendu déduit du montant total de la prestation.\n\n` +
          `🔹 Préparation avant chaque séance\n` +
          `✅ Cheveux propres et sans produit : Merci de vous assurer que vos cheveux, en particulier la zone à traiter, soient propres et exempts de tout produit (huiles, gels, crèmes, etc.).\n\n` +
          `⏳ Ponctualité\n` +
          `• Merci d'arriver à l'heure afin de profiter pleinement de vos séances.\n` +
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
        const phoneNumber = formatPhoneNumber(multipleBookingData.clientPhone);
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
              apikey: apiKey,
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
        // Ne pas bloquer la réponse en cas d'échec de l'envoi WhatsApp
      }
    }

    // Étape 4: Retourner la réponse de succès
    return NextResponse.json(
      {
        success: true,
        message: "Pack de réservations créé avec succès",
        data: {
          packageName: multipleBookingData.packageName,
          clientName: multipleBookingData.clientName,
          bookingsCount: createdBookings.length,
          bookings: createdBookings,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la création des réservations multiples:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la création des réservations multiples",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
