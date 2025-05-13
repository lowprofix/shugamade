import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Route pour envoyer un message WhatsApp à un client spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID client requis" },
        { status: 400 }
      );
    }

    // 1. Récupérer les informations du client
    const { data: client, error: clientError } = await supabase
      .from("reminder_clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientError || !client) {
      console.error("Erreur lors de la récupération du client:", clientError);
      return NextResponse.json(
        {
          success: false,
          error: "Client non trouvé",
          details: clientError,
        },
        { status: 404 }
      );
    }

    // Si le message a déjà été envoyé, ne pas réessayer
    if (client.status === "sent") {
      return NextResponse.json({
        success: true,
        message: "Message déjà envoyé",
        client: {
          id: client.id,
          client_name: client.client_name,
          phone_number: client.phone_number,
          appointment_time: client.appointment_time,
          status: client.status,
        },
      });
    }

    // 2. Envoyer le message WhatsApp
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${request.headers.get("host")}`;

    console.log(
      `Envoi du message à ${client.client_name} (${client.phone_number})`
    );

    const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: client.phone_number,
        message: client.message,
      }),
    });

    const whatsappResult = await whatsappResponse.json();

    // 3. Mise à jour du statut dans la base de données
    const now = new Date().toISOString();
    let updateData = {};

    if (whatsappResult.success) {
      console.log(`✅ Message envoyé avec succès à ${client.client_name}`);
      updateData = {
        status: "sent",
        processed_at: now,
      };
    } else {
      console.error(
        `❌ Échec d'envoi du message à ${client.client_name}: ${whatsappResult.error}`
      );
      updateData = {
        status: "error",
        error_message: whatsappResult.error || "Erreur d'envoi WhatsApp",
        processed_at: now,
      };
    }

    // Mettre à jour le statut du client
    const { error: updateError } = await supabase
      .from("reminder_clients")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Erreur lors de la mise à jour du statut:", updateError);
    }

    // 4. Mettre à jour les compteurs de la session
    const { data: sessionData } = await supabase
      .from("reminder_sessions")
      .select("*")
      .eq("id", client.session_id)
      .single();

    if (sessionData) {
      const processedCount = (sessionData.processed_clients || 0) + 1;
      const successCount = whatsappResult.success
        ? (sessionData.success_count || 0) + 1
        : sessionData.success_count || 0;
      const errorCount = !whatsappResult.success
        ? (sessionData.error_count || 0) + 1
        : sessionData.error_count || 0;

      // Calculer le statut de la session
      let sessionStatus = "processing";
      if (processedCount >= sessionData.total_clients) {
        sessionStatus = "completed";
      }

      await supabase
        .from("reminder_sessions")
        .update({
          processed_clients: processedCount,
          success_count: successCount,
          error_count: errorCount,
          status: sessionStatus,
        })
        .eq("id", client.session_id);
    }

    // 5. Renvoyer le résultat
    return NextResponse.json({
      success: whatsappResult.success,
      message: whatsappResult.success
        ? "Message envoyé avec succès"
        : "Échec de l'envoi du message",
      client: {
        id: client.id,
        client_name: client.client_name,
        phone_number: client.phone_number,
        appointment_time: client.appointment_time,
      },
      whatsapp_details: whatsappResult,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'envoi du message",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
