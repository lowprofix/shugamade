import { NextRequest, NextResponse } from "next/server";
import { sendMultipleProductImages } from "@/lib/whatsapp/media-integration";

/**
 * Interface pour la requête d'envoi multiple
 */
interface MultipleMediaRequest {
  phoneNumber: string;
  productIds: (string | number)[];
  delayBetweenMessages?: number;
}

/**
 * API pour envoyer plusieurs images de produits via WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const data: MultipleMediaRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.productIds || !Array.isArray(data.productIds)) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber et productIds (array) sont requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier que la liste n'est pas vide
    if (data.productIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "La liste des productIds ne peut pas être vide.",
        },
        { status: 400 }
      );
    }

    // Limiter le nombre de produits pour éviter le spam
    if (data.productIds.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 10 produits peuvent être envoyés simultanément.",
        },
        { status: 400 }
      );
    }

    // Envoyer les images
    const results = await sendMultipleProductImages(
      data.phoneNumber,
      data.productIds,
      data.delayBetweenMessages || 2000
    );

    // Analyser les résultats
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount}/${results.length} images envoyées avec succès`,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      },
      results: results,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi multiple de médias WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi multiple de médias WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 