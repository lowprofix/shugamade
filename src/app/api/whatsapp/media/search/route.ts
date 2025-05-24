import { NextRequest, NextResponse } from "next/server";
import { sendProductImagesBySearch } from "@/lib/whatsapp/media-integration";

/**
 * Interface pour la requête de recherche et envoi
 */
interface SearchMediaRequest {
  phoneNumber: string;
  searchCriteria: {
    name?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    isAvailable?: boolean;
  };
  maxResults?: number;
}

/**
 * API pour rechercher et envoyer des images de produits par critères via WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const data: SearchMediaRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.searchCriteria) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber et searchCriteria sont requis.",
        },
        { status: 400 }
      );
    }

    // Vérifier qu'au moins un critère de recherche est fourni
    const criteria = data.searchCriteria;
    const hasCriteria = criteria.name || 
                       criteria.category || 
                       criteria.priceMin !== undefined || 
                       criteria.priceMax !== undefined || 
                       criteria.inStock !== undefined || 
                       criteria.isAvailable !== undefined;

    if (!hasCriteria) {
      return NextResponse.json(
        {
          success: false,
          error: "Au moins un critère de recherche doit être fourni.",
        },
        { status: 400 }
      );
    }

    // Valider maxResults
    const maxResults = data.maxResults || 5;
    if (maxResults > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 10 résultats peuvent être envoyés simultanément.",
        },
        { status: 400 }
      );
    }

    // Effectuer la recherche et l'envoi
    const result = await sendProductImagesBySearch(
      data.phoneNumber,
      data.searchCriteria,
      maxResults
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("Erreur lors de la recherche et envoi de médias WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de la recherche et envoi de médias WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 