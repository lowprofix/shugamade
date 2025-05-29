import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Interface pour la requête de vérification et envoi
 */
interface VerifyAndSendRequest {
  phoneNumber: string;
  message: string;
  linkPreview?: boolean;
  cacheResult?: boolean; // Optionnel : mettre en cache le résultat
  testOnly?: boolean; // Optionnel : vérification uniquement, sans envoi réel
}

/**
 * Interface pour le cache des statuts WhatsApp
 */
interface WhatsAppStatusCache {
  phone_number: string;
  has_whatsapp: boolean;
  last_checked: string;
  last_error_code?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fonction pour formater correctement les numéros de téléphone
 */
function formatPhoneNumber(phoneNumber: string): string {
  let formattedNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
  
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
 * Récupère le statut WhatsApp depuis le cache
 */
async function getCachedWhatsAppStatus(phoneNumber: string): Promise<WhatsAppStatusCache | null> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_status_cache')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error || !data) {
      return null;
    }

    // Vérifier si le cache n'est pas trop ancien (7 jours)
    const lastChecked = new Date(data.last_checked);
    const now = new Date();
    const daysDiff = (now.getTime() - lastChecked.getTime()) / (1000 * 3600 * 24);

    if (daysDiff > 7) {
      return null; // Cache expiré
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du cache WhatsApp:", error);
    return null;
  }
}

/**
 * Met à jour le cache du statut WhatsApp
 */
async function updateWhatsAppStatusCache(
  phoneNumber: string, 
  hasWhatsApp: boolean, 
  errorCode?: number
): Promise<void> {
  try {
    const cacheData: Partial<WhatsAppStatusCache> = {
      phone_number: phoneNumber,
      has_whatsapp: hasWhatsApp,
      last_checked: new Date().toISOString(),
      last_error_code: errorCode,
    };

    const { error } = await supabase
      .from('whatsapp_status_cache')
      .upsert(cacheData, { 
        onConflict: 'phone_number',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Erreur lors de la mise à jour du cache WhatsApp:", error);
    }
  } catch (error) {
    console.error("Exception lors de la mise à jour du cache WhatsApp:", error);
  }
}

/**
 * Tente d'envoyer un message WhatsApp pour vérifier si le numéro est valide
 */
async function attemptWhatsAppSend(phoneNumber: string, message: string, linkPreview: boolean = true) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("Configuration WhatsApp manquante");
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber,
    type: "text",
    text: {
      body: message,
      preview_url: linkPreview,
    },
  };

  const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  return {
    success: response.ok,
    status: response.status,
    data: responseData,
  };
}

/**
 * API pour vérifier un numéro WhatsApp et envoyer un message
 * Utilise la méthode recommandée par Meta : tentative d'envoi direct avec gestion des erreurs
 */
export async function POST(request: NextRequest) {
  try {
    // Améliorer la gestion du parsing JSON
    let data: VerifyAndSendRequest;
    try {
      data = await request.json();
    } catch (jsonError) {
      console.error("Erreur de parsing JSON:", jsonError);
      console.error("Content-Type:", request.headers.get("content-type"));
      
      return NextResponse.json(
        {
          success: false,
          error: "Format JSON invalide dans la requête",
          details: jsonError instanceof Error ? jsonError.message : "Erreur de parsing JSON",
        },
        { status: 400 }
      );
    }

    // Vérifier que les données requises sont présentes
    if (!data.phoneNumber || !data.message) {
      return NextResponse.json(
        {
          success: false,
          error: "Les champs phoneNumber et message sont requis.",
        },
        { status: 400 }
      );
    }

    // Formater le numéro de téléphone
    const phoneNumber = formatPhoneNumber(data.phoneNumber);

    // Vérifier le cache d'abord (si activé)
    if (data.cacheResult !== false) {
      const cachedStatus = await getCachedWhatsAppStatus(phoneNumber);
      if (cachedStatus) {
        if (!cachedStatus.has_whatsapp) {
          return NextResponse.json({
            success: false,
            hasWhatsApp: false,
            fromCache: true,
            error: "Numéro non enregistré sur WhatsApp (depuis le cache)",
            lastChecked: cachedStatus.last_checked,
            phoneNumber: phoneNumber,
            recommendation: "Utilisez SMS pour contacter ce numéro",
          });
        } else if (data.testOnly) {
          // Mode test : retourner le statut du cache sans envoyer de message
          return NextResponse.json({
            success: true,
            hasWhatsApp: true,
            fromCache: true,
            testMode: true,
            lastChecked: cachedStatus.last_checked,
            phoneNumber: phoneNumber,
            message: "Vérification depuis le cache (mode test)",
          });
        }
      } else if (data.testOnly) {
        // Mode test mais pas de cache : on ne peut pas déterminer le statut
        return NextResponse.json({
          success: false,
          hasWhatsApp: "unknown",
          testMode: true,
          error: "Aucune donnée en cache pour ce numéro",
          phoneNumber: phoneNumber,
          recommendation: "Effectuez une vérification complète pour déterminer le statut",
        });
      }
    }

    // Si c'est un test uniquement et qu'on n'a pas de cache, on s'arrête ici
    if (data.testOnly) {
      return NextResponse.json({
        success: false,
        hasWhatsApp: "unknown",
        testMode: true,
        error: "Mode test activé : aucun message envoyé",
        phoneNumber: phoneNumber,
        recommendation: "Désactivez testOnly pour effectuer une vérification réelle",
      });
    }

    console.log("Tentative d'envoi WhatsApp pour vérification:", {
      to: phoneNumber,
      message: data.message.substring(0, 50) + "...",
    });

    // Tenter l'envoi WhatsApp
    const result = await attemptWhatsAppSend(
      phoneNumber, 
      data.message, 
      data.linkPreview
    );

    if (result.success) {
      // Succès : le numéro a WhatsApp
      if (data.cacheResult !== false) {
        await updateWhatsAppStatusCache(phoneNumber, true);
      }

      return NextResponse.json({
        success: true,
        hasWhatsApp: true,
        messageDelivered: true,
        data: result.data,
        phoneNumber: phoneNumber,
        method: "whatsapp",
      });

    } else {
      // Échec : analyser l'erreur
      const errorCode = result.data?.error?.code;
      const errorMessage = result.data?.error?.message || "Erreur inconnue";

      // Code 131026 = "Message Undeliverable" = numéro sans WhatsApp
      if (errorCode === 131026) {
        if (data.cacheResult !== false) {
          await updateWhatsAppStatusCache(phoneNumber, false, errorCode);
        }

        return NextResponse.json({
          success: false,
          hasWhatsApp: false,
          messageDelivered: false,
          error: "Numéro non enregistré sur WhatsApp",
          errorCode: errorCode,
          phoneNumber: phoneNumber,
          recommendation: "Utilisez SMS pour contacter ce numéro",
          details: result.data,
        });
      }

      // Autres erreurs (problème de configuration, limite de débit, etc.)
      console.error("Erreur WhatsApp (non liée au statut du numéro):", {
        errorCode,
        errorMessage,
        phoneNumber,
      });

      return NextResponse.json(
        {
          success: false,
          hasWhatsApp: "unknown", // On ne peut pas déterminer le statut
          messageDelivered: false,
          error: "Erreur lors de l'envoi WhatsApp",
          errorCode: errorCode,
          errorMessage: errorMessage,
          phoneNumber: phoneNumber,
          recommendation: "Vérifiez la configuration WhatsApp ou réessayez plus tard",
          details: result.data,
        },
        { status: result.status }
      );
    }

  } catch (error) {
    console.error("Exception lors de la vérification/envoi WhatsApp:", error);

    return NextResponse.json(
      {
        success: false,
        hasWhatsApp: "unknown",
        messageDelivered: false,
        error: "Erreur serveur lors de la vérification WhatsApp",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 