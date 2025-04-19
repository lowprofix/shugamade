import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Faire une requête à notre propre API WhatsApp
    const response = await fetch("http://localhost:3000/api/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: "+242xxxxxxxxx", // Remplacez par un vrai numéro pour un test réel
        message:
          "Test automatique de l'API WhatsApp. Ceci est un message généré automatiquement pour vérifier le bon fonctionnement de l'API.",
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Test exécuté",
      result: data,
    });
  } catch (error) {
    console.error("Erreur lors du test de l'API WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec du test de l'API WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
