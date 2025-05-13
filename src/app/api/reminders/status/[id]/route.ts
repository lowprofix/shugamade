import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Route pour vérifier le statut d'une session de rappels
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID session requis" },
        { status: 400 }
      );
    }

    // 1. Récupérer les informations de la session
    const { data: session, error: sessionError } = await supabase
      .from("reminder_sessions")
      .select("*")
      .eq("id", id)
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

    // 2. Récupérer la liste des clients pour cette session
    const { data: clients, error: clientsError } = await supabase
      .from("reminder_clients")
      .select("*")
      .eq("session_id", id)
      .order("status", { ascending: false });

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

    // 3. Préparer les statistiques
    const pendingClients = clients.filter(
      (client) => client.status === "pending"
    );
    const sentClients = clients.filter((client) => client.status === "sent");
    const errorClients = clients.filter((client) => client.status === "error");

    // 4. Renvoyer les résultats
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        date: session.session_date,
        status: session.status,
        total_clients: session.total_clients,
        processed_clients: session.processed_clients,
        success_count: session.success_count,
        error_count: session.error_count,
      },
      statistics: {
        pending: pendingClients.length,
        sent: sentClients.length,
        error: errorClients.length,
      },
      clients: clients.map((client) => ({
        id: client.id,
        client_name: client.client_name,
        phone_number: client.phone_number,
        appointment_time: client.appointment_time,
        status: client.status,
        error_message: client.error_message || undefined,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la vérification du statut",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
