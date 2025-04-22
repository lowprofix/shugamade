import { NextRequest, NextResponse } from "next/server";
import { fetchBookings, Booking } from "@/lib/availability";
import { toZonedTime, format } from "date-fns-tz";

// Constantes
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest
const REMINDER_START_HOUR = 17; // 17h
const REMINDER_END_HOUR = 18; // 18h

// Type pour les résultats des rappels
type ReminderResult = {
  booking: Booking;
  time: string;
  sent: boolean;
  service?: string;
  phoneNumber?: string;
  clientName?: string;
  contactMethod?: string;
};

// Fonction modifiée pour gérer l'extraction du service depuis le titre de la réservation
type CalendarEvent = Booking & {
  title?: string;
};

// Optimisation 1: Tableau ordonné pour l'extraction de service, basé sur les services réels de data.ts
const SERVICE_PATTERNS = [
  // Patterns spécifiques en premier (des plus spécifiques aux plus généraux)
  {
    pattern: /hairneedling\s*[-–—]?\s*tempes|tempes/i,
    service: "hairneedling tempes",
  },
  {
    pattern:
      /hairneedling\s*[-–—]?\s*(tête entière|tête entièrement|tête complète)|tête/i,
    service: "hairneedling tête entière",
  },
  { pattern: /hairneedling|hair[-\s]*needling/i, service: "hairneedling" },
  { pattern: /massage\s*crânien|massage/i, service: "massage crânien" },
  {
    pattern: /électro(?:thérapie)?|electro(?:therapie)?/i,
    service: "électrothérapie",
  },
  { pattern: /boost/i, service: "boost" },
  {
    pattern: /led|lumino(?:thérapie)?|luminoth[eé]rapi[ea]/i,
    service: "luminothérapie",
  },
  {
    pattern: /diagnosti[cq](?:ue)?\s*complet|complet/i,
    service: "diagnostic complet",
  },
  {
    pattern: /diagnosti[cq](?:ue)?\s*simple|diagnosti[cq](?:ue)?|diag|simple/i,
    service: "diagnostic simple",
  },
];

/**
 * Extrait le type de service à partir du titre de la réservation
 * @param title Titre de la réservation
 * @returns Type de service identifié ou "soins" par défaut
 */
function extractServiceFromTitle(title: string = ""): string {
  // Normalisation du titre (minuscules, sans accents)
  const normalizedTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  console.log(`Analyse du titre pour extraction de service: "${title}"`);

  // Parcourir le tableau de patterns dans l'ordre défini
  for (const { pattern, service } of SERVICE_PATTERNS) {
    if (pattern.test(normalizedTitle)) {
      console.log(
        `  - Pattern "${pattern}" correspond, service détecté: ${service}`
      );
      return service;
    }
  }

  // Par défaut, si aucun service spécifique n'est identifié
  console.log(
    `  - Aucun service détecté, utilisation de la valeur par défaut: "soins"`
  );
  return "soins";
}

// Fonction pour formater une date au format DD.MM
function formatDateToDDMM(date: Date): string {
  return format(date, "dd.MM", { timeZone: TIMEZONE });
}

// Fonction pour formater une heure au format HH:mm
function formatTimeToHHMM(date: Date): string {
  return format(date, "HH'h'mm", { timeZone: TIMEZONE });
}

// Optimisation 5: Template statique pour les messages de rappel
const REMINDER_TEMPLATE = {
  header:
    "Bonsoir {{clientName}},\nNous vous rappelons votre rendez-vous du {{date}} à {{time}} pour votre séance de {{service}} à l'institut SHUGAMADE.",
  address:
    "\n\n📍 Adresse : 119 rue Bangalas, Poto Poto\n📍 Référence : Après la station Afric sur l'avenue de France, en direction de mpila, prenez la 2ᵉ ruelle à droite. L'institut se trouve dans l'immeuble entièrement carrelé en blanc.",
  preparation: "\n\n✅ Préparation avant la séance :\n{{preparation}}",
  footer:
    "\n\nPour toute question ou information complémentaire, n'hésitez pas à me contacter.\n\nÀ bientôt \nEunice – Institut SHUGAMADE\n📞 00 242 06 597 56 23",
};

// Map des instructions de préparation par type de service
const SERVICE_PREPARATIONS = new Map([
  [
    "diagnostic simple",
    "• Aucune préparation spécifique n'est nécessaire pour votre diagnostic.",
  ],
  [
    "diagnostic complet",
    "• Aucune préparation spécifique n'est nécessaire pour votre diagnostic complet.",
  ],
  [
    "massage crânien",
    "• Évitez d'appliquer des produits capillaires juste avant votre rendez-vous.",
  ],
  [
    "électrothérapie",
    "• Venez avec des cheveux propres et sans produit capillaire.\n• Évitez de porter des accessoires métalliques sur la tête.",
  ],
  [
    "luminothérapie",
    "• Venez avec des vêtements confortables pour votre séance de luminothérapie.",
  ],
  ["boost", "• Veillez à vous hydrater correctement avant votre séance boost."],
  [
    "hairneedling",
    "• Veillez à laver vos cheveux avant votre rendez-vous de hairneedling.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  [
    "hairneedling tempes",
    "• Veillez à laver vos cheveux avant votre rendez-vous de hairneedling.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  [
    "hairneedling tête entière",
    "• Veillez à laver vos cheveux avant votre rendez-vous de hairneedling.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  ["default", "• Veillez à laver vos cheveux avant votre rendez-vous."],
]);

// Construit le message de rappel de rendez-vous
function buildReminderMessage(
  appointmentDate: Date,
  serviceName: string = "soins",
  clientName: string = ""
): string {
  const dateFormatted = formatDateToDDMM(appointmentDate);
  const timeFormatted = formatTimeToHHMM(appointmentDate);

  // Message d'introduction personnalisé
  const greeting = REMINDER_TEMPLATE.header
    .replace("{{clientName}}", clientName || "")
    .replace("{{date}}", dateFormatted)
    .replace("{{time}}", timeFormatted)
    .replace("{{service}}", serviceName);

  // Instructions spécifiques selon le service
  const serviceNameLower = serviceName.toLowerCase();
  const preparationText =
    SERVICE_PREPARATIONS.get(serviceNameLower) ||
    SERVICE_PREPARATIONS.get("default") ||
    "• Veillez à laver vos cheveux avant votre rendez-vous.";

  const preparation = REMINDER_TEMPLATE.preparation.replace(
    "{{preparation}}",
    preparationText
  );

  // Construction du message complet
  return (
    greeting +
    REMINDER_TEMPLATE.address +
    preparation +
    REMINDER_TEMPLATE.footer
  );
}

// Optimisation 2: Simplification de l'extraction de numéro de téléphone
/**
 * Extrait le numéro de téléphone depuis la description de la réservation
 * @param description Description de l'événement
 * @returns Numéro de téléphone au format international ou null si non trouvé
 */
function extractPhoneNumberFromDescription(
  description: string = ""
): string | null {
  if (!description) return null;

  // Normalisation: supprimer les espaces, tirets, points et parenthèses
  const normalizedDescription = description.replace(/[\s\-\.\(\)]/g, "");

  // Regex unifiée pour détecter les numéros dans divers formats
  const phoneRegex =
    /((?:\+|00)(?:33|242|229|235|237|225|241|243|223|227|221|228|226)\d{8,}|0\d{9}|0\d{8}|\d{9}|\d{8})/;

  const match = normalizedDescription.match(phoneRegex);
  if (!match) return null;

  let phone = match[0];

  // Formater le numéro selon un standard international
  if (phone.startsWith("00")) {
    phone = "+" + phone.substring(2);
  } else if (phone.startsWith("0") && phone.length === 10) {
    // Numéro français
    phone = "+33" + phone.substring(1);
  } else if (
    phone.startsWith("0") &&
    (phone.length === 9 || phone.length === 8)
  ) {
    // Numéro congolais avec 0
    phone = "+242" + phone.substring(1);
  } else if (
    !phone.startsWith("+") &&
    (phone.length === 8 || phone.length === 9)
  ) {
    // Numéro sans indicatif (congolais)
    phone = "+242" + phone;
  }

  console.log(`Numéro de téléphone extrait: ${phone}`);
  return phone;
}

// Fonction optimisée pour extraire le nom du client
function extractClientName(title: string = ""): string {
  if (!title) return "";

  // Format standard attendu: "Service - Nom du client" ou "Réservation - Service - Nom du client"
  const titleParts = title.split("-").map((part) => part.trim());

  // Si le titre contient des tirets, extraire la dernière partie comme nom potentiel
  if (titleParts.length > 1) {
    // Prendre la dernière partie si elle ne contient pas d'horaire
    const lastPart = titleParts[titleParts.length - 1];
    if (
      !lastPart.match(/\d{1,2}[h:]\d{2}/) &&
      !lastPart.match(/De \d{1,2}[h:]\d{2} à \d{1,2}[h:]\d{2}/)
    ) {
      return lastPart;
    }
  }
  // Si pas de tiret, essayer de trouver un nom séparé par un espace
  else {
    // Essayer d'extraire des noms comme "Jean-Paul" ou "Prénom Nom"
    // Rechercher le format "Service Nom" ou "Nom service"
    const words = title.split(/\s+/);
    if (words.length >= 2) {
      // Essayer d'identifier quelle partie est le nom client
      // Liste complète des mots-clés de service basée sur SERVICE_PATTERNS
      const serviceWords = [
        "diagnostic",
        "simple",
        "complet",
        "massage",
        "crânien",
        "électrothérapie",
        "electrotherapie",
        "electro",
        "électro",
        "luminothérapie",
        "luminotherapie",
        "lumino",
        "led",
        "boost",
        "hairneedling",
        "tempes",
        "tête",
        "entière",
        "entièrement",
        "hair",
        "needling",
        "complète",
      ];

      const isServiceWord = (word: string) =>
        serviceWords.some((service) =>
          word.toLowerCase().includes(service.toLowerCase())
        );

      // Si le premier mot est un service, le reste est probablement le nom
      if (isServiceWord(words[0])) {
        return words.slice(1).join(" ");
      }
      // Si le dernier mot est un service, le reste est probablement le nom
      else if (isServiceWord(words[words.length - 1])) {
        return words.slice(0, words.length - 1).join(" ");
      }
      // Si un mot au milieu est identifié comme service, prendre le reste comme le nom
      else {
        for (let i = 1; i < words.length - 1; i++) {
          if (isServiceWord(words[i])) {
            // Les mots avant le service sont plus susceptibles d'être le nom
            return words.slice(0, i).join(" ");
          }
        }
      }
    }
  }

  return "";
}

// Types pour les méthodes de contact et résultats d'envoi
type ContactMethod = "whatsapp" | "sms" | "none";
type MessageStatus = {
  sent: boolean;
  method: ContactMethod;
  error?: string;
};

// Envoie un message WhatsApp à un client
async function sendWhatsAppReminder(
  phoneNumber: string,
  message: string
): Promise<MessageStatus> {
  try {
    // Dans un environnement serveur (API Route), nous ne pouvons pas utiliser d'URL relative
    // Il faut une URL absolue
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const whatsappApiUrl = `${baseUrl}/api/whatsapp`;

    console.log(
      `Envoi de message WhatsApp à ${phoneNumber} via ${whatsappApiUrl}`
    );

    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        message,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`Échec d'envoi du rappel WhatsApp: ${responseData.error}`);

      // Vérifier si l'échec est dû au fait que le numéro n'est pas sur WhatsApp
      if (responseData.whatsapp === false) {
        return {
          sent: false,
          method: "whatsapp",
          error: "Numéro non enregistré sur WhatsApp",
        };
      }

      return {
        sent: false,
        method: "whatsapp",
        error: responseData.error,
      };
    }

    return {
      sent: true,
      method: "whatsapp",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du rappel WhatsApp:", error);
    return {
      sent: false,
      method: "whatsapp",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

// Fonction pour envoyer un SMS (à implémenter selon le fournisseur choisi)
async function sendSmsReminder(
  phoneNumber: string,
  message: string
): Promise<MessageStatus> {
  try {
    // TODO: Implémenter l'intégration avec un service SMS
    // Exemple avec un service SMS fictif:

    console.log(`Envoi de SMS à ${phoneNumber}`);
    console.log(`Message SMS: ${message.substring(0, 100)}...`);

    // Simuler un succès pour le moment (à remplacer par une vraie implémentation)
    const smsSent = true;

    if (smsSent) {
      return {
        sent: true,
        method: "sms",
      };
    } else {
      return {
        sent: false,
        method: "sms",
        error: "Échec d'envoi du SMS",
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error);
    return {
      sent: false,
      method: "sms",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

// Version optimisée avec fallback sur SMS si WhatsApp échoue
async function sendReminderWithFallback(
  phoneNumber: string,
  message: string,
  maxRetries: number = 2
): Promise<MessageStatus> {
  // 1. Essayer d'abord WhatsApp
  let retries = 0;
  let whatsappStatus: MessageStatus = { sent: false, method: "none" };

  while (retries < maxRetries) {
    whatsappStatus = await sendWhatsAppReminder(phoneNumber, message);

    // Si l'envoi a réussi ou si le numéro n'est pas sur WhatsApp, sortir de la boucle
    if (
      whatsappStatus.sent ||
      whatsappStatus.error === "Numéro non enregistré sur WhatsApp"
    ) {
      break;
    }

    // Attendre avant de réessayer (backoff exponentiel)
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * Math.pow(2, retries))
    );
    retries++;
    console.log(
      `Nouvelle tentative WhatsApp (${retries}/${maxRetries}) pour ${phoneNumber}`
    );
  }

  // Si WhatsApp a réussi, retourner le statut
  if (whatsappStatus.sent) {
    return whatsappStatus;
  }

  // 2. Si WhatsApp a échoué, essayer SMS comme alternative
  console.log(`WhatsApp a échoué pour ${phoneNumber}, tentative par SMS...`);

  // Créer une version abrégée du message pour SMS
  const shortMessage = message
    .replace(/\n{2,}/g, "\n") // Remplacer les doubles sauts de ligne par des simples
    .substring(0, 160); // Limiter à 160 caractères pour les SMS standards

  const smsStatus = await sendSmsReminder(phoneNumber, shortMessage);

  return smsStatus;
}

/**
 * Route GET pour envoyer manuellement des rappels de rendez-vous
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.API_SECRET_KEY;
    
    // Si une clé API est configurée, vérifier l'authentification
    if (apiKey && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey)) {
      // Permettre l'accès sans authentification en local pour le développement
      const isLocalDevelopment = process.env.NODE_ENV === 'development';
      if (!isLocalDevelopment) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 401 }
        );
      }
    }
    // Utiliser uniquement les données réelles du calendrier
    console.log("Utilisation des données réelles du calendrier");
    const bookings = await fetchBookings();

    // Date actuelle dans le fuseau horaire correct
    const now = toZonedTime(new Date(), TIMEZONE);

    // L'heure actuelle est-elle dans la plage de rappel (17h-18h)?
    const currentHour = now.getHours();
    const isReminderTime =
      currentHour >= REMINDER_START_HOUR && currentHour < REMINDER_END_HOUR;

    // Création d'une date pour "demain" (à 00:00)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Création d'une date pour "après-demain" (à 00:00)
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // On filtre les rendez-vous pour trouver ceux de demain
    const tomorrowBookings = bookings.filter((booking) => {
      const bookingStart = new Date(booking.start);
      return bookingStart >= tomorrow && bookingStart < dayAfterTomorrow;
    });

    console.log(`Trouvé ${tomorrowBookings.length} rendez-vous pour demain`);

    // Si on n'est pas dans la plage horaire et que ce n'est pas un appel forcé, on sort
    const forceReminders = request.nextUrl.searchParams.get("force") === "true";
    if (!isReminderTime && !forceReminders) {
      return NextResponse.json({
        success: false,
        message: "En dehors de la plage horaire d'envoi des rappels (17h-18h)",
        bookingsFound: tomorrowBookings.length,
      });
    }

    // Résultats de l'envoi des rappels
    const reminderResults: ReminderResult[] = [];
    const reminderPromises: Promise<ReminderResult>[] = [];

    // Optimisation 3: Parallélisation des envois avec Promise.all
    for (const booking of tomorrowBookings) {
      // Création d'une promesse pour chaque envoi
      const reminderPromise = (async () => {
        // Traiter l'événement comme un CalendarEvent pour accéder au titre
        const calendarEvent = booking as CalendarEvent;
        const eventTitle = calendarEvent.title || "";
        console.log(`Traitement de la réservation: "${eventTitle}"`);

        // Optimisation 4: Extraction plus robuste du nom du client
        const clientName = extractClientName(eventTitle);

        // Extraire le service depuis le titre
        const serviceName = extractServiceFromTitle(eventTitle);
        console.log(
          `Service détecté: "${serviceName}", Client: "${
            clientName || "Non spécifié"
          }"`
        );

        // Extraire le numéro de téléphone depuis la description
        const description = booking.description || "";
        console.log(
          `Description de la réservation: "${
            description
              ? description.substring(0, 50) + "..."
              : "Non disponible"
          }"`
        );

        // Utiliser le numéro extrait ou un numéro par défaut
        const extractedPhone = extractPhoneNumberFromDescription(description);
        const defaultPhone = "+242065975623"; // Numéro par défaut de secours
        const phoneNumber = extractedPhone || defaultPhone;

        console.log(`Utilisation du numéro: ${phoneNumber}`);

        const bookingDate = new Date(booking.start);
        const reminderMessage = buildReminderMessage(
          bookingDate,
          serviceName,
          clientName
        );

        // Envoyer le rappel avec fallback entre WhatsApp et SMS
        const messageStatus = await sendReminderWithFallback(
          phoneNumber,
          reminderMessage
        );

        return {
          booking: booking,
          time: format(bookingDate, "yyyy-MM-dd HH:mm", { timeZone: TIMEZONE }),
          sent: messageStatus.sent,
          service: serviceName,
          phoneNumber: phoneNumber,
          clientName: clientName || undefined,
          contactMethod: messageStatus.method,
        };
      })();

      reminderPromises.push(reminderPromise);
    }

    // Attendre que tous les envois soient terminés
    reminderResults.push(...(await Promise.all(reminderPromises)));

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés pour ${
        reminderResults.filter((r) => r.sent).length
      }/${tomorrowBookings.length} rendez-vous`,
      results: reminderResults,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * Route POST pour configurer un webhook automatique qui appelle cette API quotidiennement
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation des données reçues
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Données de configuration invalides",
        },
        { status: 400 }
      );
    }

    // Stocker la configuration dans une base de données ou un fichier
    // (À implémenter selon les besoins)

    // Configuration exemple:
    // {
    //   reminderStartHour: 17,
    //   reminderEndHour: 18,
    //   timezone: "Africa/Lagos",
    //   defaultPhoneNumber: "+242065975623",
    //   enabledDaysInAdvance: 1
    // }

    return NextResponse.json({
      success: true,
      message: "Configuration des rappels mise à jour",
      config: data,
    });
  } catch (error) {
    console.error("Erreur lors de la configuration des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la configuration des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
