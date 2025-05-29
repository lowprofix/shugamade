import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
/** * Route pour envoyer un message WhatsApp à un client spécifique */ export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    // 2. Envoyer le message WhatsApp via l'API officielle
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${request.headers.get("host")}`;

    console.log(
      `Envoi du message à ${client.client_name} (${client.phone_number})`
    );

    const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp/verify-and-send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: client.phone_number,
        message: client.message,
        cacheResult: true, // Utiliser le cache pour optimiser
      }),
    });

    const whatsappResult = await whatsappResponse.json();

    // 3. Mise à jour du statut dans la base de données
    const now = new Date().toISOString();
    let updateData = {};

    // L'API officielle retourne success, hasWhatsApp et messageDelivered
    if (whatsappResult.success && whatsappResult.messageDelivered) {
      console.log(`✅ Message envoyé avec succès à ${client.client_name}`);
      updateData = {
        status: "sent",
        processed_at: now,
      };
    } else {
      // Déterminer le type d'erreur
      let errorMessage = whatsappResult.error || "Erreur d'envoi WhatsApp";
      
      if (whatsappResult.hasWhatsApp === false) {
        errorMessage = "Numéro non enregistré sur WhatsApp";
      } else if (whatsappResult.hasWhatsApp === "unknown") {
        errorMessage = "Impossible de vérifier le statut WhatsApp";
      }

      console.error(
        `❌ Échec d'envoi du message à ${client.client_name}: ${errorMessage}`
      );
      updateData = {
        status: "error",
        error_message: errorMessage,
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
      const successCount = (whatsappResult.success && whatsappResult.messageDelivered)
        ? (sessionData.success_count || 0) + 1
        : sessionData.success_count || 0;
      const errorCount = !(whatsappResult.success && whatsappResult.messageDelivered)
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
      success: whatsappResult.success && whatsappResult.messageDelivered,
      message: (whatsappResult.success && whatsappResult.messageDelivered)
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
