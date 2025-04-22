import { NextRequest, NextResponse } from "next/server";
import { toZonedTime, format } from "date-fns-tz";
import { extractServiceFromTitle, extractClientName, extractPhoneNumberFromDescription, buildReminderMessage, sendReminderWithFallback } from "../utils";

// Configuration de l'API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Définir la durée maximale d'exécution (respecte la limite du plan hobby)
export const maxDuration = 60; // 60 secondes max

// Constantes
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest

// Type pour les rendez-vous préparés
type PreparedBooking = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
};

// Type pour les résultats des rappels
type ReminderResult = {
  bookingId: string;
  time: string;
  sent: boolean;
  service?: string;
  phoneNumber?: string;
  clientName?: string;
  contactMethod?: string;
};

/**
 * Route GET pour envoyer les rappels (étape 2)
 * Cette fonction envoie les rappels pour les rendez-vous préalablement identifiés
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentification requise' 
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const apiSecretKey = process.env.API_SECRET_KEY;
    
    if (token !== apiSecretKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'Clé API invalide' 
      }, { status: 403 });
    }

    // Récupérer les rendez-vous préparés
    // @ts-ignore - Accès à la variable globale
    const preparedBookings: PreparedBooking[] = global.preparedBookings || [];
    
    if (!preparedBookings || preparedBookings.length === 0) {
      console.log("Aucun rendez-vous préparé trouvé");
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous préparé trouvé",
        results: []
      });
    }
    
    console.log(`Envoi des rappels pour ${preparedBookings.length} rendez-vous...`);
    
    // Préparer les promesses pour l'envoi des rappels
    const reminderPromises: Promise<ReminderResult>[] = [];
    const reminderResults: ReminderResult[] = [];
    
    // Limiter le nombre de rappels traités par appel pour respecter la limite de temps
    // Traiter un maximum de 5 rappels par appel
    const maxRemindersPerCall = 5;
    const bookingsToProcess = preparedBookings.slice(0, maxRemindersPerCall);
    
    // Supprimer les rendez-vous traités de la liste globale
    // @ts-ignore - Accès à la variable globale
    global.preparedBookings = preparedBookings.slice(maxRemindersPerCall);
    
    // Traiter chaque rendez-vous
    for (const booking of bookingsToProcess) {
      const reminderPromise = (async () => {
        console.log(`Traitement de la réservation: "${booking.title}"`);

        // Extraction des informations nécessaires
        const clientName = extractClientName(booking.title);
        const serviceName = extractServiceFromTitle(booking.title);
        
        console.log(
          `Service détecté: "${serviceName}", Client: "${
            clientName || "Non spécifié"
          }"`
        );

        // Extraire le numéro de téléphone depuis la description
        console.log(
          `Description de la réservation: "${
            booking.description
              ? booking.description.substring(0, 50) + "..."
              : "Non disponible"
          }"`
        );

        // Utiliser le numéro extrait ou un numéro par défaut
        const extractedPhone = extractPhoneNumberFromDescription(booking.description);
        const defaultPhone = "+242065975623"; // Numéro par défaut de secours
        const phoneNumber = extractedPhone || defaultPhone;

        console.log(`Utilisation du numéro: ${phoneNumber}`);

        const bookingDate = new Date(booking.start);
        const reminderMessage = buildReminderMessage(
          bookingDate,
          serviceName,
          clientName
        );

        // Envoyer le rappel avec fallback entre WhatsApp et SMS
        const messageStatus = await sendReminderWithFallback(
          phoneNumber,
          reminderMessage
        );

        return {
          bookingId: booking.id,
          time: format(bookingDate, "yyyy-MM-dd HH:mm", { timeZone: TIMEZONE }),
          sent: messageStatus.sent,
          service: serviceName,
          phoneNumber: phoneNumber,
          clientName: clientName || undefined,
          contactMethod: messageStatus.method,
        };
      })();

      reminderPromises.push(reminderPromise);
    }

    // Attendre que tous les envois soient terminés
    reminderResults.push(...(await Promise.all(reminderPromises)));

    // Indiquer s'il reste des rendez-vous à traiter
    // @ts-ignore - Accès à la variable globale
    const remainingBookings = global.preparedBookings?.length || 0;

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés pour ${
        reminderResults.filter((r) => r.sent).length
      }/${bookingsToProcess.length} rendez-vous`,
      results: reminderResults,
      remainingBookings: remainingBookings
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
