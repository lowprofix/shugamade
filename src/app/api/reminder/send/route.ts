import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildReminderMessage, sendReminderWithFallback } from "../utils";

// Configuration de l'API
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Définir la durée maximale d'exécution (respecte la limite du plan hobby)
export const maxDuration = 60; // 60 secondes max

/**
 * Route GET pour envoyer les rappels (étape 2)
 * Cette fonction envoie les rappels stockés dans la base de données Prisma
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentification requise",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const apiSecretKey = process.env.API_SECRET_KEY;

    if (token !== apiSecretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Clé API invalide",
        },
        { status: 403 }
      );
    }

    // Récupérer les rappels en attente depuis la base de données
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        status: "pending",
      },
      take: 5, // Limiter à 5 rappels par appel pour respecter les limites de temps
    });

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log("Aucun rappel en attente trouvé");
      return NextResponse.json({
        success: true,
        message: "Aucun rappel en attente trouvé",
        results: [],
      });
    }

    console.log(
      `Envoi des rappels pour ${pendingReminders.length} rendez-vous...`
    );

    // Tableau pour stocker les résultats d'envoi
    const reminderResults = [];

    // Traiter chaque rappel
    for (const reminder of pendingReminders) {
      try {
        console.log(
          `Traitement du rappel pour ${reminder.clientName || "client"} (${
            reminder.phoneNumber
          })`
        );

        // Construire le message de rappel
        const reminderMessage = buildReminderMessage(
          reminder.start,
          reminder.service || "soins",
          reminder.clientName || ""
        );

        // Envoyer le rappel avec fallback entre WhatsApp et SMS
        const messageStatus = await sendReminderWithFallback(
          reminder.phoneNumber,
          reminderMessage
        );

        // Mettre à jour le statut du rappel dans la base de données
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: messageStatus.sent ? "sent" : "failed",
            sentAt: messageStatus.sent ? new Date() : null,
            method: messageStatus.method,
            errorMessage: messageStatus.error,
          },
        });

        // Ajouter le résultat au tableau des résultats
        reminderResults.push({
          bookingId: reminder.bookingId,
          time: reminder.start.toISOString(),
          sent: messageStatus.sent,
          service: reminder.service,
          phoneNumber: reminder.phoneNumber,
          clientName: reminder.clientName,
          contactMethod: messageStatus.method,
        });

        // Log du résultat
        console.log(
          `Rappel ${messageStatus.sent ? "envoyé" : "échoué"} pour ${
            reminder.clientName || "client"
          } via ${messageStatus.method}`
        );
      } catch (error) {
        console.error(
          `Erreur lors de l'envoi du rappel ${reminder.id}:`,
          error
        );

        // Marquer comme échoué dans la base de données
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Erreur inconnue",
          },
        });

        // Ajouter le résultat au tableau des résultats
        reminderResults.push({
          bookingId: reminder.bookingId,
          time: reminder.start.toISOString(),
          sent: false,
          service: reminder.service,
          phoneNumber: reminder.phoneNumber,
          clientName: reminder.clientName,
          contactMethod: "none",
        });
      }
    }

    // Compter les rappels restants
    const remainingReminders = await prisma.reminder.count({
      where: {
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés pour ${
        reminderResults.filter((r) => r.sent).length
      }/${pendingReminders.length} rendez-vous`,
      results: reminderResults,
      remainingReminders: remainingReminders,
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
