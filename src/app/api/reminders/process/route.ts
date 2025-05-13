import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Route pour déclencher l'ensemble du processus de rappels
 * Cette route va :
 * 1. Préparer les rappels en récupérant les rendez-vous
 * 2. Traiter un petit lot de clients
 * 3. Renvoyer le statut actuel et les informations pour continuer
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const { session_id, batch_size = 3 } = await request
      .json()
      .catch(() => ({}));

    // Si pas de session_id, démarrer une nouvelle session
    if (!session_id) {
      // Appeler l'API de préparation pour créer une nouvelle session
      const prepareResponse = await fetch(
        `${request.nextUrl.origin}/api/reminders/prepare`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json();
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de la préparation des rappels",
            details: error,
          },
          { status: prepareResponse.status }
        );
      }

      const prepareResult = await prepareResponse.json();

      // Si pas de clients à traiter, terminer
      if (
        prepareResult.message.includes("Aucun rendez-vous") ||
        !prepareResult.session?.id
      ) {
        return NextResponse.json({
          success: true,
          completed: true,
          message: "Aucun rendez-vous à traiter",
          result: prepareResult,
        });
      }

      // Continuer avec l'ID de session récupéré
      return processSession(request, prepareResult.session.id, batch_size);
    }

    // Continuer le traitement d'une session existante
    return processSession(request, session_id, batch_size);
  } catch (error) {
    console.error("Erreur lors du traitement des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du traitement des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * Traite un lot de clients pour une session donnée
 */
async function processSession(
  request: NextRequest,
  sessionId: string,
  batchSize: number
) {
  // 1. Récupérer la liste des clients en attente
  const pendingResponse = await fetch(
    `${request.nextUrl.origin}/api/reminders/clients/pending/${sessionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!pendingResponse.ok) {
    const error = await pendingResponse.json();
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des clients en attente",
        details: error,
      },
      { status: pendingResponse.status }
    );
  }

  const pendingResult = await pendingResponse.json();
  const pendingClients = pendingResult.clients || [];

  // 2. Si plus de clients en attente, la session est terminée
  if (pendingClients.length === 0) {
    // Récupérer le statut final de la session
    const statusResponse = await fetch(
      `${request.nextUrl.origin}/api/reminders/status/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!statusResponse.ok) {
      const error = await statusResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la récupération du statut de la session",
          details: error,
        },
        { status: statusResponse.status }
      );
    }

    const statusResult = await statusResponse.json();

    return NextResponse.json({
      success: true,
      completed: true,
      message: "Tous les rappels ont été traités",
      session: statusResult.session,
      statistics: statusResult.statistics,
    });
  }

  // 3. Traiter un lot de clients
  const clientsToProcess = pendingClients.slice(0, batchSize);
  const processResults = [];

  for (const client of clientsToProcess) {
    try {
      const sendResponse = await fetch(
        `${request.nextUrl.origin}/api/reminders/send/${client.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const sendResult = await sendResponse.json();
      processResults.push({
        client_id: client.id,
        client_name: client.client_name,
        success: sendResult.success,
        message: sendResult.message,
      });
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi du rappel à ${client.client_name}:`,
        error
      );
      processResults.push({
        client_id: client.id,
        client_name: client.client_name,
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }

    // Pause de 1 seconde entre chaque envoi pour éviter tout problème de rate limit
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 4. Récupérer le statut actuel de la session
  const statusResponse = await fetch(
    `${request.nextUrl.origin}/api/reminders/status/${sessionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const statusResult = await statusResponse.json();

  // 5. Déterminer s'il reste des clients à traiter
  const remainingClients = pendingClients.length - clientsToProcess.length;
  const completed = remainingClients === 0;

  // 6. Renvoyer les résultats
  return NextResponse.json({
    success: true,
    completed,
    message: completed
      ? "Tous les rappels ont été traités"
      : `Traitement en cours. ${remainingClients} clients restants.`,
    session: {
      id: sessionId,
      ...statusResult.session,
    },
    results: processResults,
    statistics: statusResult.statistics,
    next_batch: {
      remaining: remainingClients,
      session_id: sessionId,
      batch_size: batchSize,
    },
  });
}
