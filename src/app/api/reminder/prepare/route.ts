import { NextRequest, NextResponse } from "next/server";
import { fetchBookings } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import {
  extractServiceFromTitle,
  extractClientName,
  extractPhoneNumberFromDescription,
} from "../utils";

// Configuration de l'API
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Définir la durée maximale d'exécution (respecte la limite du plan hobby)
export const maxDuration = 60; // 60 secondes max

/**
 * Route GET pour préparer les rappels (étape 1)
 * Cette fonction récupère les rendez-vous du lendemain et les stocke dans la base de données Prisma
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

    // Récupérer les rendez-vous pour demain
    console.log("Récupération des rendez-vous pour demain...");

    // Obtenir la date de demain
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Récupérer tous les rendez-vous
    const allBookings = await fetchBookings();

    // Filtrer pour ne garder que les rendez-vous de demain
    const bookings = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.start);
      return bookingDate >= tomorrow && bookingDate <= tomorrowEnd;
    });

    if (!bookings || bookings.length === 0) {
      console.log("Aucun rendez-vous trouvé pour demain");
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous trouvé pour demain",
        bookings: [],
      });
    }

    console.log(`${bookings.length} rendez-vous trouvés pour demain`);

    // Supprimer les rappels existants pour demain qui sont encore en statut "pending"
    // Cela évite les doublons si la fonction est exécutée plusieurs fois
    await prisma.reminder.deleteMany({
      where: {
        date: tomorrow.toISOString().split("T")[0],
        status: "pending",
      },
    });

    // Créer les nouveaux rappels dans la base de données
    const reminderPromises = bookings.map(async (booking) => {
      // Extraire les informations du rendez-vous
      const clientName = extractClientName(booking.title || "");
      const serviceName = extractServiceFromTitle(booking.title || "");
      const phoneNumber = extractPhoneNumberFromDescription(
        booking.description || ""
      );

      // Utiliser un numéro par défaut si aucun numéro n'est trouvé
      const defaultPhone = "+242065975623"; // Numéro par défaut de secours
      const finalPhoneNumber = phoneNumber || defaultPhone;

      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);

      // Créer le rappel dans Prisma
      return prisma.reminder.create({
        data: {
          bookingId: `temp-${new Date(booking.start).getTime()}`,
          title: booking.title || "Rendez-vous",
          description: booking.description || "",
          clientName: clientName,
          phoneNumber: finalPhoneNumber,
          start: bookingStart,
          end: bookingEnd,
          date: bookingStart.toISOString().split("T")[0],
          service: serviceName,
          status: "pending",
        },
      });
    });

    // Attendre que tous les rappels soient créés
    const reminders = await Promise.all(reminderPromises);

    return NextResponse.json({
      success: true,
      message: `${reminders.length} rendez-vous préparés pour les rappels`,
      count: reminders.length,
    });
  } catch (error) {
    console.error("Erreur lors de la préparation des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la préparation des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
