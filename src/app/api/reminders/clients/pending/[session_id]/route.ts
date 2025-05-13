import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Route pour récupérer la liste des clients en attente de traitement pour une session donnée
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const { session_id } = params;
    if (!session_id) {
      return NextResponse.json(
        { success: false, error: "ID session requis" },
        { status: 400 }
      );
    }

    // Récupérer les informations de la session
    const { data: session, error: sessionError } = await supabase
      .from("reminder_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      console.error(
        "Erreur lors de la récupération de la session:",
        sessionError
      );
      return NextResponse.json(
        {
          success: false,
          error: "Session non trouvée",
          details: sessionError,
        },
        { status: 404 }
      );
    }

    // Récupérer la liste des clients en attente pour cette session
    const { data: pendingClients, error: clientsError } = await supabase
      .from("reminder_clients")
      .select("*")
      .eq("session_id", session_id)
      .eq("status", "pending");

    if (clientsError) {
      console.error(
        "Erreur lors de la récupération des clients:",
        clientsError
      );
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la récupération des clients",
          details: clientsError,
        },
        { status: 500 }
      );
    }

    // Renvoyer la liste des clients en attente
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        date: session.session_date,
        status: session.status,
      },
      pending_count: pendingClients.length,
      clients: pendingClients.map((client) => ({
        id: client.id,
        client_name: client.client_name,
        phone_number: client.phone_number,
        appointment_time: client.appointment_time,
        service_name: client.service_name,
      })),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des clients en attente:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des clients en attente",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
