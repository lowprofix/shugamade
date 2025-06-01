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
  return summary.trim().toLowerCase().startsWith("réservation -");
}

/**
 * Convertit un titre d'événement de l'ancien format vers le nouveau
 */
function convertToNewFormat(oldSummary: string): string {
  const cleanSummary = oldSummary.trim();
  const parts = cleanSummary.split("-");
  
  if (parts.length >= 3) {
    const service = parts[1].trim();
    const clientName = parts[2].trim();
    return `${clientName} - ${service}`;
  }
  
  if (parts.length === 2) {
    const servicePart = parts[1].trim();
    const words = servicePart.split(" ");
    
    if (words.length > 1) {
      const service = words[0];
      const clientName = words.slice(1).join(" ");
      return `${clientName} - ${service}`;
    }
  }
  
  return oldSummary;
}

/**
 * Met à jour un événement avec retry et timeout
 */
async function updateEventWithRetry(event: CalendarEvent, newSummary: string, retries = 2): Promise<UpdateResult> {
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

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Tentative ${attempt + 1}/${retries + 1} pour l'événement ${event.id}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          summary: newSummary,
          description: event.description,
          start: event.start,
          end: event.end,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Vérifier si la réponse a du contenu
      const responseText = await response.text();
      if (responseText.trim() === "") {
        console.log(`⚠️ Réponse vide pour l'événement ${event.id}, mais status OK`);
      } else {
        try {
          JSON.parse(responseText);
        } catch (e) {
          console.log(`⚠️ Réponse non-JSON pour l'événement ${event.id}: ${responseText}`);
        }
      }
      
      return {
        eventId: event.id,
        oldSummary: event.summary || "",
        newSummary,
        success: true,
      };

    } catch (error) {
      console.error(`❌ Tentative ${attempt + 1} échouée pour l'événement ${event.id}:`, error);
      
      if (attempt === retries) {
        return {
          eventId: event.id,
          oldSummary: event.summary || "",
          newSummary,
          success: false,
          error: error instanceof Error ? error.message : "Erreur inconnue"
        };
      }
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    eventId: event.id,
    oldSummary: event.summary || "",
    newSummary,
    success: false,
    error: "Toutes les tentatives ont échoué"
  };
}

/**
 * Traite les événements par lots
 */
export async function POST(request: NextRequest) {
  try {
    const { batchSize = 5, startIndex = 0 } = await request.json().catch(() => ({}));
    
    console.log(`🚀 Début de la migration par lots (taille: ${batchSize}, début: ${startIndex})`);

    // Récupérer tous les événements
    const calendarEventsUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS;
    
    if (!calendarEventsUrl) {
      return NextResponse.json(
        { success: false, error: "URL des événements non configurée" },
        { status: 500 }
      );
    }

    const response = await fetch(calendarEventsUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des événements: ${response.status}`);
    }

    const events: CalendarEvent[] = await response.json();
    const eventsToUpdate = events.filter(event => isOldFormat(event.summary));
    
    console.log(`📊 Total: ${events.length} événements, À mettre à jour: ${eventsToUpdate.length}`);

    // Traiter le lot demandé
    const endIndex = Math.min(startIndex + batchSize, eventsToUpdate.length);
    const batch = eventsToUpdate.slice(startIndex, endIndex);
    
    if (batch.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun événement à traiter dans ce lot",
        totalEvents: events.length,
        totalToUpdate: eventsToUpdate.length,
        batchProcessed: 0,
        completed: true
      });
    }

    console.log(`📦 Traitement du lot ${startIndex}-${endIndex - 1} (${batch.length} événements)`);

    // Traiter les événements un par un avec délai
    const results: UpdateResult[] = [];
    for (let i = 0; i < batch.length; i++) {
      const event = batch[i];
      const newSummary = convertToNewFormat(event.summary || "");
      
      console.log(`📝 ${startIndex + i + 1}/${eventsToUpdate.length}: "${event.summary}" → "${newSummary}"`);
      
      const result = await updateEventWithRetry(event, newSummary);
      results.push(result);
      
      // Délai entre les requêtes pour éviter le rate limiting
      if (i < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const isCompleted = endIndex >= eventsToUpdate.length;

    console.log(`✅ Lot terminé: ${successCount} succès, ${failureCount} échecs`);

    return NextResponse.json({
      success: true,
      message: `Lot ${startIndex}-${endIndex - 1} terminé: ${successCount} succès, ${failureCount} échecs`,
      totalEvents: events.length,
      totalToUpdate: eventsToUpdate.length,
      batchProcessed: batch.length,
      successCount,
      failureCount,
      nextStartIndex: isCompleted ? null : endIndex,
      completed: isCompleted,
      results: results.map(r => ({
        eventId: r.eventId,
        oldSummary: r.oldSummary,
        newSummary: r.newSummary,
        success: r.success,
        error: r.error
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la migration par lots:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la migration par lots",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

/**
 * Obtenir le statut de la migration
 */
export async function GET(request: NextRequest) {
  try {
    const calendarEventsUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS;
    
    if (!calendarEventsUrl) {
      return NextResponse.json(
        { success: false, error: "URL des événements non configurée" },
        { status: 500 }
      );
    }

    const response = await fetch(calendarEventsUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des événements: ${response.status}`);
    }

    const events: CalendarEvent[] = await response.json();
    const eventsToUpdate = events.filter(event => isOldFormat(event.summary));

    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      eventsToUpdate: eventsToUpdate.length,
      eventsCompleted: events.length - eventsToUpdate.length,
      progress: Math.round(((events.length - eventsToUpdate.length) / events.length) * 100),
      remainingEvents: eventsToUpdate.slice(0, 5).map(event => ({
        id: event.id,
        currentSummary: event.summary,
        newSummary: convertToNewFormat(event.summary || "")
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la vérification du statut:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la vérification du statut",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
} 