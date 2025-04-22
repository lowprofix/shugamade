import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, checkSlotAvailability } from "@/lib/availability";

/**
 * API Route pour récupérer les créneaux disponibles
 *
 * Paramètres de requête:
 * - duration: Durée du service en minutes (défaut: 30)
 * - days: Nombre de jours à vérifier (défaut: 7)
 * - startDate: Date de début au format YYYY-MM-DD (défaut: aujourd'hui)
 *
 * Exemple d'utilisation:
 * /api/available-slots?duration=45&days=5
 * /api/available-slots?duration=60&days=14&startDate=2025-04-20
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const durationStr = searchParams.get("duration") || "30";
    const daysStr = searchParams.get("days") || "30";
    const startDateStr = searchParams.get("startDate") || "";

    const duration = parseInt(durationStr);
    const days = parseInt(daysStr);

    // Vérifier que les paramètres sont valides
    if (isNaN(duration) || duration <= 0 || isNaN(days) || days <= 0) {
      return NextResponse.json(
        {
          error:
            "Paramètres invalides. La durée et le nombre de jours doivent être des nombres positifs.",
        },
        { status: 400 }
      );
    }

    // Récupérer les créneaux disponibles
    const availableSlots = await getAvailableSlots(
      duration,
      days,
      startDateStr
    );

    return NextResponse.json({
      success: true,
      data: {
        slots: availableSlots,
        count: availableSlots.length,
        duration: duration,
        daysChecked: days,
        startDate: startDateStr || "today",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créneaux disponibles:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la récupération des créneaux disponibles",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * API Route pour vérifier la disponibilité d'un créneau spécifique
 *
 * Corps de la requête:
 * - startTime: Heure de début du créneau (format ISO)
 * - endTime: Heure de fin du créneau (format ISO)
 *
 * Exemple d'utilisation:
 * POST /api/available-slots/check
 * {
 *   "startTime": "2025-04-15T14:00:00+01:00",
 *   "endTime": "2025-04-15T14:30:00+01:00"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const { startTime, endTime } = await request.json();

    // Vérifier que les paramètres requis sont présents
    if (!startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Paramètres manquants. Les paramètres startTime et endTime sont requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité du créneau
    const availability = await checkSlotAvailability(startTime, endTime);

    return NextResponse.json({
      success: true,
      data: {
        available: availability.available,
        reason: availability.reason || null,
        slot: {
          start: startTime,
          end: endTime,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du créneau:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la vérification du créneau",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
