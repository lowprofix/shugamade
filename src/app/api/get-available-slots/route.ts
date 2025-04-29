import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { getLocationConfig, LOCATIONS } from "@/app/api/bookings/lib/config";
import { isOpenDay } from "@/app/api/bookings/lib/utils";
import { format, parseISO, addDays } from "date-fns";

/**
 * API Route pour récupérer les créneaux disponibles pour un lieu spécifique
 *
 * Paramètres de requête:
 * - date: Date de début au format YYYY-MM-DD
 * - duration: Durée du service en minutes
 * - locationId: ID du lieu (1 pour Brazzaville, 2 pour Pointe-Noire)
 *
 * Exemple d'utilisation:
 * /api/get-available-slots?date=2025-05-22&duration=45&locationId=2
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get("date") || "";
    const durationStr = searchParams.get("duration") || "30";
    const locationIdStr = searchParams.get("locationId") || "1";

    console.log("Requête reçue pour les créneaux disponibles:", {
      dateStr,
      durationStr,
      locationIdStr,
    });

    const duration = parseInt(durationStr);
    const locationId = parseInt(locationIdStr);

    // Vérifier que les paramètres sont valides
    if (isNaN(duration) || duration <= 0 || isNaN(locationId)) {
      console.error("Paramètres invalides:", {
        duration,
        locationId,
      });

      return NextResponse.json(
        {
          availableSlots: [],
          error:
            "Paramètres invalides. La durée doit être un nombre positif et l'ID du lieu doit être un nombre.",
        },
        { status: 400 }
      );
    }

    // Récupérer la configuration du lieu
    const locationConfig = getLocationConfig(locationId);

    if (!locationConfig) {
      console.error(`Le lieu avec l'ID ${locationId} n'existe pas`);
      return NextResponse.json(
        {
          availableSlots: [],
          error: `Le lieu avec l'ID ${locationId} n'existe pas.`,
        },
        { status: 404 }
      );
    }

    console.log(
      "Configuration du lieu trouvée:",
      JSON.stringify(locationConfig, null, 2)
    );

    // Récupérer les créneaux disponibles via la fonction principale
    const slots = await getAvailableSlots(duration, 30, dateStr);
    console.log(`Nombre de créneaux récupérés avant filtrage: ${slots.length}`);

    let availableSlots = slots;

    // Récupérer la configuration de Pointe-Noire pour les dates spéciales
    const pointeNoireConfig = LOCATIONS.find((loc) => loc.id === 2);
    const pointeNoireDates = pointeNoireConfig?.availableDates || [];

    // Pour Pointe-Noire (ID 2), filtrer les créneaux selon les dates disponibles
    if (locationId === 2) {
      console.log("Filtrage spécifique pour Pointe-Noire");

      // Formatage des dates du jour pour déboguer
      if (
        locationConfig.availableDates &&
        locationConfig.availableDates.length > 0
      ) {
        console.log(
          "Dates disponibles pour Pointe-Noire:",
          locationConfig.availableDates
        );
      } else {
        console.log("Aucune date disponible configurée pour Pointe-Noire");
      }

      // Filtrer les créneaux pour ne garder que ceux qui sont dans les dates disponibles
      availableSlots = slots.filter((slot) => {
        const slotDate = parseISO(slot.date);
        const isOpen = isOpenDay(slotDate, locationConfig);
        const dateFormatted = format(slotDate, "yyyy-MM-dd");

        // Log pour débogage
        if (!isOpen) {
          console.log(`Date ${dateFormatted} non disponible pour Pointe-Noire`);
        }

        return isOpen;
      });

      console.log(
        `Nombre de créneaux après filtrage pour Pointe-Noire: ${availableSlots.length}`
      );

      // Si aucun créneau n'est disponible, essayer de fournir les prochaines dates disponibles
      if (availableSlots.length === 0 && locationConfig.availableDates) {
        const currentDate = new Date();
        const nextAvailableDates = locationConfig.availableDates
          .filter((date) => parseISO(date) > currentDate)
          .slice(0, 3);

        console.log("Prochaines dates disponibles:", nextAvailableDates);

        return NextResponse.json({
          availableSlots: [],
          count: 0,
          nextAvailableDates,
          message: "Aucun créneau disponible pour ces dates à Pointe-Noire",
        });
      }
    }
    // Pour Brazzaville (ID 1), filtrer les créneaux qui sont en conflit avec les dates de Pointe-Noire
    else if (locationId === 1 && pointeNoireDates.length > 0) {
      console.log(
        "Filtrage des dates de Brazzaville en conflit avec Pointe-Noire"
      );

      // Filtrer les créneaux pour exclure les dates où l'équipe est à Pointe-Noire
      availableSlots = slots.filter((slot) => {
        const dateFormatted = slot.date; // Déjà au format YYYY-MM-DD
        const isDateConflict = pointeNoireDates.includes(dateFormatted);

        if (isDateConflict) {
          console.log(
            `Date ${dateFormatted} indisponible à Brazzaville car l'équipe est à Pointe-Noire`
          );
        }

        return !isDateConflict;
      });

      console.log(
        `Nombre de créneaux après filtrage pour Brazzaville: ${availableSlots.length}`
      );
    }

    // Réponse finale
    const response = {
      availableSlots,
      count: availableSlots.length,
      message:
        availableSlots.length > 0
          ? "Créneaux disponibles récupérés avec succès"
          : "Aucun créneau disponible pour ces critères",
    };

    console.log(
      `Réponse finale: ${availableSlots.length} créneaux disponibles`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créneaux disponibles:",
      error
    );
    return NextResponse.json(
      {
        availableSlots: [],
        error: "Échec de la récupération des créneaux disponibles",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
