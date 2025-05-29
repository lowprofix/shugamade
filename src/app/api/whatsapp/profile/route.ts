import { NextRequest, NextResponse } from "next/server";

/**
 * API pour récupérer les informations du profil WhatsApp
 */
export async function GET(request: NextRequest) {
  try {
    // Configuration de l'API Evolution
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!serverUrl || !instanceName || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète",
        },
        { status: 500 }
      );
    }

    // Récupérer le profil
    const profileResponse = await fetch(
      `${serverUrl}/chat/fetchProfile/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({}),
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Erreur lors de la récupération du profil:", errorText);
      
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de récupérer le profil",
          details: errorText,
        },
        { status: profileResponse.status }
      );
    }

    const profileData = await profileResponse.json();

    return NextResponse.json({
      success: true,
      message: "Profil WhatsApp récupéré avec succès",
      profile: profileData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de la récupération du profil",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 