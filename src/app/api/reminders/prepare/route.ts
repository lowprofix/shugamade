import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { extractPhoneNumber, extractClientName } from "@/lib/reminder-utils";

/**
 * Route pour récupérer les rendez-vous de demain et préparer les rappels
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Récupérer les rendez-vous du lendemain depuis le webhook n8n
    const webhookUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW;

    if (!webhookUrl) {
      console.error("URL du webhook n8n non configurée");
      return NextResponse.json(
        { success: false, error: "Configuration incomplète" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Erreur lors de la récupération des rendez-vous");
      return NextResponse.json(
        { success: false, error: "Impossible de récupérer les rendez-vous" },
        { status: response.status }
      );
    }

    // 2. Traiter les données des rendez-vous
    const appointmentsData = await response.json();
    const appointments = Array.isArray(appointmentsData)
      ? appointmentsData
      : appointmentsData.appointments || [];

    if (!appointments.length) {
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous prévu pour demain",
        count: 0,
      });
    }

    // 3. Formater la date pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

        // Extraire l'heure du rendez-vous
        let appointmentTime = "";
        if (appointment.start?.dateTime) {
          appointmentTime = new Date(
            appointment.start.dateTime
          ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        }

        // Message personnalisé pour le rappel
        const message = `Bonjour ${nameFromSummary},
Nous vous rappelons votre rendez-vous "${serviceName}" pour demain ${formattedDate} à ${appointmentTime} à l'institut SHUGAMADE.

📍 Bacongo, en face de l'école 5 Chemin, dans l'immeuble carrelé en marron.

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
