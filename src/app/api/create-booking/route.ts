import { NextRequest, NextResponse } from "next/server";
import { addBooking } from "@/lib/availability";

/**
 * API Route pour créer une réservation
 * Cette route sert d'intermédiaire entre le frontend et l'API n8n
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const bookingData = await request.json();

    // Vérifier que les données requises sont présentes
    if (!bookingData.title || !bookingData.start || !bookingData.end) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Données manquantes. Les champs title, start et end sont requis.",
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
      // Ajouter les informations supplémentaires pour les réservations multiples
      isPartOfPackage: bookingData.isPartOfPackage || false,
      packageInfo: bookingData.packageInfo || null,
      service: bookingData.service || null,
      customer: bookingData.customer || null,
      // Ajouter l'ID Hiboutik s'il existe
      hiboutikClientId: bookingData.hiboutikClientId || null,
    };

    console.log("Envoi de la réservation à n8n:", eventData);

    // Essayer d'abord avec l'URL principale
    let response;
    let responseData;
    let error = null;

    try {
      // Appeler l'API n8n pour créer l'événement - URL principale
      response = await fetch("https://n8n.bienquoi.com/webhook/create-event", {
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

      // Essayer avec l'URL alternative
      try {
        console.log("Tentative avec l'URL alternative...");
        response = await fetch(
          "https://n8n.bienquoi.com/webhook-test/create-envent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          }
        );

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
    }

    // Si les deux tentatives ont échoué
    if (error) {
      console.error("Toutes les tentatives ont échoué");

      // Essayer une troisième URL (sans le chemin create-envent)
      try {
        console.log("Tentative avec l'URL de base...");
        response = await fetch("https://n8n.bienquoi.com/webhook", {
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
    }

    // Si nous avons une réponse valide
    if (responseData && responseData.success) {
      console.log("Réservation créée avec succès dans n8n:", responseData);

      // Mettre à jour les données de disponibilité locales
      const bookingResult = await addBooking(
        bookingData.start,
        bookingData.end
      );

      if (!bookingResult.success) {
        console.warn(
          "La réservation a été créée dans n8n mais n'a pas pu être enregistrée localement:",
          bookingResult.message
        );
      }

      return NextResponse.json({
        success: true,
        message: "Réservation créée avec succès",
        data: responseData,
        localBookingAdded: bookingResult.success,
        localBookingMessage: bookingResult.message,
      });
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
