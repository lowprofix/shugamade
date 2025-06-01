import { NextRequest, NextResponse } from "next/server";

/**
 * Route de test pour vérifier la configuration des webhooks N8N
 */
export async function GET(request: NextRequest) {
  try {
    const calendarEventsUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS;
    const calendarUpdateUrl = process.env.N8N_WEBHOOK_CALENDAR_UPDATE;

    console.log("🔧 Configuration des webhooks:");
    console.log(`📅 Events URL: ${calendarEventsUrl}`);
    console.log(`🔄 Update URL: ${calendarUpdateUrl}`);

    // Test 1: Récupération des événements
    let eventsTest = { success: false, error: "", count: 0 };
    if (calendarEventsUrl) {
      try {
        const response = await fetch(calendarEventsUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          const events = await response.json();
          eventsTest = { 
            success: true, 
            error: "", 
            count: Array.isArray(events) ? events.length : 0 
          };
        } else {
          eventsTest.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        eventsTest.error = error instanceof Error ? error.message : "Erreur inconnue";
      }
    } else {
      eventsTest.error = "URL non configurée";
    }

    // Test 2: Test de mise à jour (avec un faux ID)
    let updateTest = { success: false, error: "" };
    if (calendarUpdateUrl) {
      try {
        const response = await fetch(calendarUpdateUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: "test-id-123",
            summary: "Test - Mise à jour",
          }),
        });
        
        // Même si l'ID n'existe pas, on veut voir si le webhook répond
        updateTest = { 
          success: response.status !== 404, // 404 = ID inexistant mais webhook fonctionne
          error: response.ok ? "" : `HTTP ${response.status}: ${response.statusText}`
        };
      } catch (error) {
        updateTest.error = error instanceof Error ? error.message : "Erreur inconnue";
      }
    } else {
      updateTest.error = "URL non configurée";
    }

    return NextResponse.json({
      success: true,
      configuration: {
        eventsUrl: calendarEventsUrl || "Non configurée",
        updateUrl: calendarUpdateUrl || "Non configurée",
      },
      tests: {
        events: eventsTest,
        update: updateTest,
      },
      recommendations: [
        eventsTest.success ? "✅ Récupération d'événements OK" : "❌ Problème avec la récupération d'événements",
        updateTest.success ? "✅ Webhook de mise à jour accessible" : "❌ Problème avec le webhook de mise à jour",
        "💡 Vérifiez que N8N est démarré et accessible",
        "💡 Vérifiez que les workflows N8N sont activés",
        "💡 Vérifiez les permissions Google Calendar dans N8N"
      ]
    });

  } catch (error) {
    console.error("Erreur lors du test des webhooks:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du test des webhooks",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
} 