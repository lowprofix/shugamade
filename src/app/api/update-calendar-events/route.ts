import { NextRequest, NextResponse } from "next/server";

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
}

interface UpdateResult {
  eventId: string;
  oldSummary: string;
  newSummary: string;
  success: boolean;
  error?: string;
}

/**
 * Vérifie si un événement utilise l'ancien format "Réservation - Service - Nom"
 */
function isOldFormat(summary: string | undefined): boolean {
  if (!summary) return false;
  // Supprimer les espaces en début et fin, puis vérifier
  return summary.trim().toLowerCase().startsWith("réservation -");
}

/**
 * Convertit un titre d'événement de l'ancien format vers le nouveau
 * Ancien: "Réservation - Service - Nom"
 * Nouveau: "Nom - Service"
 */
function convertToNewFormat(oldSummary: string): string {
  // Supprimer les espaces en début et fin
  const cleanSummary = oldSummary.trim();
  const parts = cleanSummary.split("-");
  
  if (parts.length >= 3) {
    // Format: "Réservation - Service - Nom" -> "Nom - Service"
    const service = parts[1].trim();
    const clientName = parts[2].trim();
    return `${clientName} - ${service}`;
  }
  
  if (parts.length === 2) {
    // Format: "Réservation - Service Nom" -> "Nom - Service"
    const servicePart = parts[1].trim();
    const words = servicePart.split(" ");
    
    if (words.length > 1) {
      const service = words[0];
      const clientName = words.slice(1).join(" ");
      return `${clientName} - ${service}`;
    }
  }
  
  // Si on ne peut pas parser, retourner tel quel
  return oldSummary;
}

/**
 * Met à jour un événement via le webhook N8N
 */
async function updateEvent(event: CalendarEvent, newSummary: string): Promise<UpdateResult> {
  const updateUrl = process.env.N8N_WEBHOOK_CALENDAR_UPDATE;
  
  if (!updateUrl) {
    return {
      eventId: event.id,
      oldSummary: event.summary || "",
      newSummary,
      success: false,
      error: "URL de mise à jour non configurée"
    };
  }

  try {
    console.log(`🔄 Mise à jour de l'événement ${event.id}`);
    console.log(`📝 Ancien titre: "${event.summary}"`);
    console.log(`✨ Nouveau titre: "${newSummary}"`);
    console.log(`🌐 URL webhook: ${updateUrl}`);

    const payload = {
      eventId: event.id,
      summary: newSummary,
      description: event.description,
      start: event.start,
      end: event.end,
    };

    console.log(`📦 Payload envoyé:`, JSON.stringify(payload, null, 2));

    const response = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`📡 Réponse HTTP: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur réponse: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Réponse webhook:`, JSON.stringify(result, null, 2));
    
    return {
      eventId: event.id,
      oldSummary: event.summary || "",
      newSummary,
      success: true,
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de l'événement ${event.id}:`, error);
    return {
      eventId: event.id,
      oldSummary: event.summary || "",
      newSummary,
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}

/**
 * API Route pour mettre à jour tous les événements du calendrier
 * avec le nouveau format "Nom - Service"
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Début de la mise à jour des événements du calendrier...");

    // 1. Récupérer tous les événements du calendrier
    const calendarEventsUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS;
    
    if (!calendarEventsUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "URL des événements du calendrier non configurée"
        },
        { status: 500 }
      );
    }

    const response = await fetch(calendarEventsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des événements: ${response.status}`);
    }

    const events: CalendarEvent[] = await response.json();
    console.log(`${events.length} événements récupérés`);

    // 2. Filtrer les événements avec l'ancien format
    const eventsToUpdate = events.filter(event => isOldFormat(event.summary));
    console.log(`${eventsToUpdate.length} événements à mettre à jour`);

    if (eventsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun événement à mettre à jour",
        totalEvents: events.length,
        updatedEvents: 0,
        results: []
      });
    }

    // 3. Mettre à jour chaque événement
    const updatePromises = eventsToUpdate.map(async (event) => {
      const newSummary = convertToNewFormat(event.summary || "");
      console.log(`Mise à jour: "${event.summary}" -> "${newSummary}"`);
      
      return await updateEvent(event, newSummary);
    });

    const results = await Promise.all(updatePromises);

    // 4. Analyser les résultats
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Mise à jour terminée: ${successCount} succès, ${failureCount} échecs`);

    return NextResponse.json({
      success: true,
      message: `Mise à jour terminée: ${successCount} événements mis à jour, ${failureCount} échecs`,
      totalEvents: events.length,
      eventsToUpdate: eventsToUpdate.length,
      successCount,
      failureCount,
      results: results.map(r => ({
        eventId: r.eventId,
        oldSummary: r.oldSummary,
        newSummary: r.newSummary,
        success: r.success,
        error: r.error
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour des événements:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour des événements",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

/**
 * API Route pour obtenir un aperçu des événements à mettre à jour
 * sans effectuer la mise à jour
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les événements du calendrier
    const calendarEventsUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS;
    
    if (!calendarEventsUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "URL des événements du calendrier non configurée"
        },
        { status: 500 }
      );
    }

    const response = await fetch(calendarEventsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des événements: ${response.status}`);
    }

    const events: CalendarEvent[] = await response.json();

    // Analyser les événements
    const eventsToUpdate = events.filter(event => isOldFormat(event.summary));
    const preview = eventsToUpdate.map(event => ({
      eventId: event.id,
      currentSummary: event.summary,
      newSummary: convertToNewFormat(event.summary || ""),
      startTime: event.start?.dateTime
    }));

    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      eventsToUpdate: eventsToUpdate.length,
      preview: preview.slice(0, 10), // Limiter l'aperçu aux 10 premiers
      hasMore: preview.length > 10
    });

  } catch (error) {
    console.error("Erreur lors de l'aperçu des événements:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'aperçu des événements",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
} 