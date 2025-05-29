import { NextRequest, NextResponse } from "next/server";

/**
 * API pour vérifier l'état de l'API officielle WhatsApp Business
 */
export async function GET(request: NextRequest) {
  try {
    // Configuration de l'API officielle WhatsApp Business
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète",
          config: {
            phoneNumberId: !!phoneNumberId,
            accessToken: !!accessToken,
            businessAccountId: !!businessAccountId,
          }
        },
        { status: 500 }
      );
    }

    console.log(`Vérification de l'état de l'API WhatsApp Business pour le numéro: ${phoneNumberId}`);

    // Vérifier les informations du numéro de téléphone
    const phoneNumberResponse = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    let phoneNumberData = null;
    if (phoneNumberResponse.ok) {
      phoneNumberData = await phoneNumberResponse.json();
    } else {
      const errorText = await phoneNumberResponse.text();
      console.error("Erreur lors de la vérification du numéro de téléphone:", errorText);
    }

    // Vérifier les informations du compte business (si disponible)
    let businessAccountData = null;
    if (businessAccountId) {
      const businessResponse = await fetch(
        `https://graph.facebook.com/v22.0/${businessAccountId}?fields=id,name,timezone_id`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (businessResponse.ok) {
        businessAccountData = await businessResponse.json();
      } else {
        const errorText = await businessResponse.text();
        console.error("Erreur lors de la vérification du compte business:", errorText);
      }
    }

    // Test de connectivité avec un appel simple à l'API
    const connectivityResponse = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    let connectivityData = null;
    if (connectivityResponse.ok) {
      connectivityData = await connectivityResponse.json();
    }

    // Déterminer le statut global
    const isHealthy = phoneNumberResponse.ok && connectivityResponse.ok;
    const statusMessage = isHealthy 
      ? "API WhatsApp Business opérationnelle" 
      : "Problèmes détectés avec l'API WhatsApp Business";

    return NextResponse.json({
      success: true,
      message: "Diagnostic de l'API WhatsApp Business",
      status: isHealthy ? "healthy" : "unhealthy",
      statusMessage: statusMessage,
      config: {
        phoneNumberId: phoneNumberId,
        businessAccountId: businessAccountId || "Non configuré",
        accessTokenPresent: !!accessToken,
        apiVersion: "v22.0",
      },
      phoneNumber: {
        status: phoneNumberResponse.status,
        data: phoneNumberData,
        isVerified: phoneNumberData?.verified_name ? true : false,
        displayNumber: phoneNumberData?.display_phone_number || "Non disponible",
        qualityRating: phoneNumberData?.quality_rating || "Non disponible",
      },
      businessAccount: {
        status: businessAccountData ? 200 : (businessAccountId ? 400 : 404),
        data: businessAccountData,
        configured: !!businessAccountId,
      },
      connectivity: {
        status: connectivityResponse.status,
        data: connectivityData,
        accessible: connectivityResponse.ok,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Erreur lors du diagnostic de l'API WhatsApp Business:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec du diagnostic de l'API WhatsApp Business",
        message: error instanceof Error ? error.message : "Erreur inconnue",
        status: "error",
      },
      { status: 500 }
    );
  }
} 