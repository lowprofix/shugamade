import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildReminderMessage, sendReminderWithFallback } from "../utils";

// Configuration de l'API
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Définir la durée maximale d'exécution (respecte la limite du plan hobby)
export const maxDuration = 60; // 60 secondes max

/**
 * Route GET pour réessayer les rappels échoués
 * Cette fonction récupère les rappels avec le statut "failed" et tente de les envoyer à nouveau
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

    // Récupérer les rappels avec le statut "failed"
    const failedReminders = await prisma.reminder.findMany({
      where: {
        status: "failed",
        // Limiter aux rappels créés dans les dernières 24 heures
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      take: 5, // Limiter à 5 rappels par appel
    });

    if (!failedReminders || failedReminders.length === 0) {
      console.log("Aucun rappel échoué trouvé pour une nouvelle tentative");
      return NextResponse.json({
        success: true,
        message: "Aucun rappel échoué trouvé pour une nouvelle tentative",
        results: [],
      });
    }

    console.log(
      `Nouvelle tentative pour ${failedReminders.length} rappels échoués...`
    );

    // Tableau pour stocker les résultats d'envoi
    const retryResults = [];

    // Traiter chaque rappel échoué
    for (const reminder of failedReminders) {
      try {
        console.log(
          `Nouvelle tentative pour ${reminder.clientName || "client"} (${
            reminder.phoneNumber
          })`
        );

        // Construire le message de rappel
        const reminderMessage = buildReminderMessage(
          reminder.start,
          reminder.service || "soins",
          reminder.clientName || ""
        );

        // Tenter d'envoyer le rappel à nouveau
        const messageStatus = await sendReminderWithFallback(
          reminder.phoneNumber,
          reminderMessage,
          3 // Augmenter le nombre maximum de tentatives pour les réessais
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
        retryResults.push({
          id: reminder.id,
          bookingId: reminder.bookingId,
          clientName: reminder.clientName,
          phoneNumber: reminder.phoneNumber,
          date: reminder.date,
          sent: messageStatus.sent,
          method: messageStatus.method,
        });

        // Log du résultat
        console.log(
          `Réessai ${messageStatus.sent ? "réussi" : "échoué"} pour ${
            reminder.clientName || "client"
          } via ${messageStatus.method}`
        );
      } catch (error) {
        console.error(
          `Erreur lors de la nouvelle tentative pour le rappel ${reminder.id}:`,
          error
        );

        // Mettre à jour le statut du rappel dans la base de données
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: "failed",
            errorMessage:
              error instanceof Error
                ? error.message
                : "Erreur inconnue lors du réessai",
          },
        });

        // Ajouter le résultat au tableau des résultats
        retryResults.push({
          id: reminder.id,
          bookingId: reminder.bookingId,
          clientName: reminder.clientName,
          phoneNumber: reminder.phoneNumber,
          date: reminder.date,
          sent: false,
          method: "none",
        });
      }
    }

    // Compter les rappels encore en échec
    const remainingFailedReminders = await prisma.reminder.count({
      where: {
        status: "failed",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Réessai effectué pour ${
        retryResults.filter((r) => r.sent).length
      }/${failedReminders.length} rappels échoués`,
      results: retryResults,
      remainingFailedReminders: remainingFailedReminders,
    });
  } catch (error) {
    console.error("Erreur lors du réessai des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec du réessai des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
