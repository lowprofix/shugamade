import { NextRequest, NextResponse } from "next/server";

/**
 * Interface pour une ligne de liste WhatsApp (API officielle)
 */
interface ListRow {
  id: string;
  title: string;
  description?: string;
}

/**
 * Interface pour une section de liste (API officielle)
 */
interface ListSection {
  title?: string;
  rows: ListRow[];
}

/**
 * Interface pour la requête d'envoi de liste
 */
interface ListRequest {
  phoneNumber: string;
  title: string;
  description?: string;
  buttonText: string;
  footerText?: string;
  sections: Array<{
    title: string;
    rows: Array<{
      title: string;
      description?: string;
      rowId: string;
    }>;
  }>;
  delay?: number;
}

/**
 * Fonction pour formater correctement les numéros de téléphone pour l'API officielle WhatsApp
 * L'API officielle WhatsApp Business recommande fortement d'inclure le + et le code pays
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Supprimer tous les espaces et caractères spéciaux sauf le +
  let formattedNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // S'assurer que le numéro commence par + (recommandé par la documentation officielle)
  if (!formattedNumber.startsWith("+")) {
    formattedNumber = "+" + formattedNumber;
  }

  const countriesWithLeadingZero = [
    "+33", "+44", "+39", "+34", "+49", "+32", "+31",
  ];

  for (const countryCode of countriesWithLeadingZero) {
    if (
      formattedNumber.startsWith(countryCode) &&
      formattedNumber.length > countryCode.length
    ) {
      if (formattedNumber.charAt(countryCode.length) === "0") {
        formattedNumber = `${countryCode}${formattedNumber.substring(
          countryCode.length + 1
        )}`;
        break;
      }
    }
  }

  return formattedNumber;
}

/**
 * Convertit les sections au format de l'API officielle
 */
function convertSectionsToOfficialFormat(sections: ListRequest['sections']): ListSection[] {
  return sections.map(section => ({
    title: section.title,
    rows: section.rows.map(row => ({
      id: row.rowId,
      title: row.title,
      description: row.description,
    })),
  }));
}

/**
 * Valide la structure de la liste
 */
function validateList(data: ListRequest): { isValid: boolean; error?: string } {
  if (!data.title || typeof data.title !== 'string') {
    return { isValid: false, error: "Le titre de la liste est requis" };
  }

  if (!data.buttonText || typeof data.buttonText !== 'string') {
    return { isValid: false, error: "Le texte du bouton est requis" };
  }

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    return { isValid: false, error: "Au moins une section doit être fournie" };
  }

  if (data.sections.length > 10) {
    return { isValid: false, error: "Maximum 10 sections autorisées par WhatsApp" };
  }

  // Vérifier chaque section
  for (let i = 0; i < data.sections.length; i++) {
    const section = data.sections[i];
    
    if (!section.title || typeof section.title !== 'string') {
      return { isValid: false, error: `La section ${i + 1} doit avoir un titre` };
    }

    if (!Array.isArray(section.rows) || section.rows.length === 0) {
      return { isValid: false, error: `La section ${i + 1} doit avoir au moins une ligne` };
    }

    if (section.rows.length > 10) {
      return { isValid: false, error: `La section ${i + 1} ne peut pas avoir plus de 10 lignes` };
    }

    // Vérifier chaque ligne
    for (let j = 0; j < section.rows.length; j++) {
      const row = section.rows[j];
      
      if (!row.title || !row.rowId) {
        return { 
          isValid: false, 
          error: `La ligne ${j + 1} de la section ${i + 1} doit avoir un titre et un rowId` 
        };
      }

      if (row.title.length > 24) {
        return { 
          isValid: false, 
          error: `Le titre de la ligne ${j + 1} de la section ${i + 1} ne peut pas dépasser 24 caractères` 
        };
      }

      if (row.description && row.description.length > 72) {
        return { 
          isValid: false, 
          error: `La description de la ligne ${j + 1} de la section ${i + 1} ne peut pas dépasser 72 caractères` 
        };
      }
    }
  }

  // Vérifier que les rowIds sont uniques
  const allRowIds = data.sections.flatMap(section => section.rows.map(row => row.rowId));
  const uniqueRowIds = new Set(allRowIds);
  if (allRowIds.length !== uniqueRowIds.size) {
    return { isValid: false, error: "Les rowIds doivent être uniques dans toute la liste" };
  }

  return { isValid: true };
}

/**
 * API pour envoyer des listes WhatsApp via l'API officielle WhatsApp Business
 */
export async function POST(request: NextRequest) {
  try {
    // Configuration de l'API officielle WhatsApp Business
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!phoneNumberId || !accessToken) {
      console.error("Variables d'environnement WhatsApp Business manquantes");
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète. WHATSAPP_PHONE_NUMBER_ID et WHATSAPP_ACCESS_TOKEN sont requis.",
        },
        { status: 500 }
      );
    }

    // Récupérer les données de la requête
    const data: ListRequest = await request.json();

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.title || !data.buttonText || !data.sections) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs phoneNumber, title, buttonText et sections sont requis.",
        },
        { status: 400 }
      );
    }

    // Valider la liste
    const listValidation = validateList(data);
    if (!listValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: listValidation.error,
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

    // Convertir les sections au format de l'API officielle
    const officialSections = convertSectionsToOfficialFormat(data.sections);

    // Construction du payload pour l'API officielle WhatsApp Business
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual", // Recommandé par la documentation officielle
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: data.title,
        },
        ...(data.footerText && {
          footer: {
            text: data.footerText,
          },
        }),
        action: {
          button: data.buttonText,
          sections: officialSections,
        },
      },
    };

    console.log("Envoi de liste WhatsApp via API officielle:", {
      to: phoneNumber,
      title: data.title,
      sectionCount: officialSections.length,
      totalRows: officialSections.reduce((total, section) => total + section.rows.length, 0),
    });

    // URL de l'API officielle WhatsApp Business
    const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    // Appel à l'API officielle WhatsApp Business
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Vérifier la réponse
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorText = errorData ? JSON.stringify(errorData) : await response.text();
      console.error("Erreur lors de l'envoi de la liste WhatsApp:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi de la liste WhatsApp",
          details: errorData || errorText,
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    // Récupérer la réponse
    const responseData = await response.json();

    return NextResponse.json({
      success: true,
      message: "Liste WhatsApp envoyée avec succès",
      data: responseData,
      sentSections: data.sections.map(s => ({ 
        title: s.title, 
        rows: s.rows.map(r => ({ title: r.title, rowId: r.rowId }))
      })),
      phoneNumber: phoneNumber,
      businessAccountId: businessAccountId,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi de la liste WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi de la liste WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 