import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { extractPhoneNumber, extractClientName } from "@/lib/reminder-utils";
import { isPointeNoireSession, getSessionLocation } from "../../bookings/lib/locations";
import { toZonedTime, format } from "date-fns-tz";
import { fr } from "date-fns/locale";

// Définir la constante TIMEZONE
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest

// Type pour valider la structure des rendez-vous
interface Appointment {
  description?: string;
  summary?: string;
  start?: {
    dateTime?: string;
  };
}

/**
 * Valide la structure d'un rendez-vous
 */
function isValidAppointment(appointment: any): appointment is Appointment {
  return (
    appointment &&
    typeof appointment === 'object' &&
    (appointment.description === undefined || typeof appointment.description === 'string') &&
    (appointment.summary === undefined || typeof appointment.summary === 'string') &&
    (appointment.start === undefined || 
      (typeof appointment.start === 'object' && 
       (appointment.start.dateTime === undefined || typeof appointment.start.dateTime === 'string')))
  );
}

/**
 * Route pour récupérer les rendez-vous de demain et préparer les rappels
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Vérifier la configuration
    const webhookUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW;
    if (!webhookUrl) {
      console.error("URL du webhook n8n non configurée");
      return NextResponse.json(
        { 
          success: false, 
          error: "Configuration incomplète",
          status: "CONFIG_ERROR" 
        },
        { status: 500 }
      );
    }

    // 2. Récupérer les rendez-vous
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      console.error("Erreur lors de la requête au webhook:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur de connexion au service de calendrier",
          status: "FETCH_ERROR",
          details: fetchError instanceof Error ? fetchError.message : "Erreur inconnue"
        },
        { status: 503 }
      );
    }

    // 3. Gérer les différents cas de réponse
    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous prévu pour demain",
        count: 0,
        status: "NO_APPOINTMENTS",
      });
    }

    if (!response.ok) {
      console.error("Erreur lors de la récupération des rendez-vous:", response.status);
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de récupérer les rendez-vous",
          status: "API_ERROR",
          httpStatus: response.status
        },
        { status: response.status }
      );
    }

    // 4. Parser et valider la réponse JSON
    let appointmentsData;
    try {
      appointmentsData = await response.json();
    } catch (jsonError) {
      console.error("Erreur lors du parsing JSON:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: "Réponse invalide du service de calendrier",
          status: "JSON_PARSE_ERROR",
          details: jsonError instanceof Error ? jsonError.message : "Erreur de parsing JSON"
        },
        { status: 500 }
      );
    }

    // 5. Extraire et valider les rendez-vous
    let appointments: Appointment[] = [];
    if (Array.isArray(appointmentsData)) {
      appointments = appointmentsData.filter(isValidAppointment);
    } else if (appointmentsData && typeof appointmentsData === 'object' && Array.isArray(appointmentsData.appointments)) {
      appointments = appointmentsData.appointments.filter(isValidAppointment);
    }

    if (appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous valide trouvé pour demain",
        count: 0,
        status: "NO_VALID_APPOINTMENTS"
      });
    }

    // 3. Formater la date pour demain avec le bon fuseau horaire
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowInTimezone = toZonedTime(tomorrow, TIMEZONE);
    const formattedDate = format(tomorrowInTimezone, "EEEE d MMMM", {
      locale: fr,
      timeZone: TIMEZONE,
    });

    // 4. Créer une nouvelle session de rappels
    const { data: sessionData, error: sessionError } = await supabase
      .from("reminder_sessions")
      .insert({
        session_date: tomorrow.toISOString().split("T")[0],
        total_clients: appointments.length,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Erreur lors de la création de la session:", sessionError);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la création de la session de rappels",
          details: sessionError,
        },
        { status: 500 }
      );
    }

    // 5. Extraire et préparer les informations client
    const clientsForDb = [];
    const clientsWithErrors = [];

    for (const appointment of appointments) {
      try {
        // Extraire le numéro de téléphone depuis le champ description
        const phoneFromDescription = extractPhoneNumber(
          appointment.description
        );

        // Extraire le nom du client du résumé de l'événement
        const nameFromSummary = extractClientName(appointment.summary);

        // Si pas de description ou pas de numéro extrait, ajouter à la liste pour traitement manuel
        if (!phoneFromDescription) {
          console.log(`Pas de numéro trouvé pour: ${appointment.summary}`);
          clientsWithErrors.push({
            appointment,
            error: "Numéro de téléphone manquant",
          });
          continue; // Passer au rendez-vous suivant
        }

        // Formater le numéro de téléphone
        const formattedPhone = phoneFromDescription.startsWith("+")
          ? phoneFromDescription
          : `+242${phoneFromDescription.replace(/^0+/, "")}`;

        // Extraire le nom du service depuis le résumé
        let serviceName = "votre rendez-vous";
        if (appointment.summary) {
          const parts = appointment.summary.split("-");
          if (parts.length >= 2) {
            serviceName = parts[1].trim();
          }
        }

        // Extraire l'heure du rendez-vous avec le bon fuseau horaire
        let appointmentTime = "";
        if (appointment.start?.dateTime) {
          const startTime = toZonedTime(
            new Date(appointment.start.dateTime),
            TIMEZONE
          );
          appointmentTime = format(startTime, "HH:mm", { timeZone: TIMEZONE });
        }

        // Message personnalisé pour le rappel
        const message = `Bonjour ${nameFromSummary},
Nous vous rappelons votre rendez-vous "${serviceName}" pour demain ${formattedDate} à ${appointmentTime} à l'institut SHUGAMADE.

📍 ${isPointeNoireSession(formattedDate)
          ? "Mpita, 2eme ruelle après TATIE LOUTTAR, la ruelle en face de l'école bénédiction, Pointe-Noire."
          : "Bacongo, en face de l'école 5 Chemin, dans l'immeuble carrelé en marron, Brazzaville."}
}

✅ Préparation avant la séance :
* Veillez à ce que vos cheveux soient propres et sans produit.

Merci de bien vouloir confirmer votre présence afin que votre créneau soit maintenu.

⚠️ Informations importantes :
* Un retard de plus de 30 minutes entraînera l'annulation de la séance.
* Toute annulation doit être signalée au moins 24h à l'avance.
* Sans annulation dans les délais, l'acompte ne pourra pas être remboursé.

Pour toute question ou information complémentaire, n'hésitez pas à me contacter.

À bientôt,
Eunice – Institut SHUGAMADE
📞 +242 06 597 56 23`;

        // Ajouter le client à la liste pour insertion en base de données
        clientsForDb.push({
          session_id: sessionData.id,
          client_name: nameFromSummary,
          phone_number: formattedPhone,
          service_name: serviceName,
          appointment_time: appointmentTime,
          appointment_date: formattedDate,
          message: message,
          original_appointment: appointment,
        });
      } catch (error) {
        console.error("Erreur lors du traitement d'un rendez-vous:", error);
        clientsWithErrors.push({
          appointment,
          error: "Erreur d'extraction des données",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    // 6. Enregistrer les clients en base de données
    if (clientsForDb.length > 0) {
      const { data: clientsData, error: clientsError } = await supabase
        .from("reminder_clients")
        .insert(clientsForDb)
        .select();

      if (clientsError) {
        console.error(
          "Erreur lors de l'enregistrement des clients:",
          clientsError
        );
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de l'enregistrement des clients",
            details: clientsError,
          },
          { status: 500 }
        );
      }

      // 7. Mettre à jour la session avec le nombre réel de clients
      await supabase
        .from("reminder_sessions")
        .update({
          total_clients: clientsForDb.length,
        })
        .eq("id", sessionData.id);

      return NextResponse.json({
        success: true,
        message: `Préparation réussie. ${clientsForDb.length} clients prêts pour l'envoi des rappels.`,
        session: {
          id: sessionData.id,
          date: formattedDate,
          total_clients: clientsForDb.length,
        },
        errors: clientsWithErrors.length > 0 ? clientsWithErrors : undefined,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun client valide trouvé pour l'envoi des rappels.",
          errors: clientsWithErrors,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la préparation des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la préparation des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
