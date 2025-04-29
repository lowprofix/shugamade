/**
 * Utilitaires pour le système de rappel
 */
import { format } from "date-fns-tz";

// Constantes
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest

// Types pour les méthodes de contact et résultats d'envoi
export type ContactMethod = "whatsapp" | "sms" | "none";

export type MessageStatus = {
  sent: boolean;
  method: ContactMethod;
  error?: string;
};

// Tableau ordonné pour l'extraction de service
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

// Template pour les messages de rappel
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
    "• Veillez à laver vos cheveux avant votre rendez-vous.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  [
    "électrothérapie",
    "• Veillez à laver vos cheveux avant votre rendez-vous d'électrothérapie.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  [
    "luminothérapie",
    "• Veillez à laver vos cheveux avant votre rendez-vous de luminothérapie.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  [
    "boost",
    "• Veillez à laver vos cheveux avant votre rendez-vous de boost.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
  [
    "massage crânien",
    "• Veillez à laver vos cheveux avant votre rendez-vous de massage crânien.\n• N'appliquez pas de produits capillaires le jour de votre séance.",
  ],
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

/**
 * Extrait le type de service à partir du titre de la réservation
 */
export function extractServiceFromTitle(title: string = ""): string {
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

/**
 * Fonction pour formater une date au format DD.MM
 */
export function formatDateToDDMM(date: Date): string {
  return format(date, "dd.MM", { timeZone: TIMEZONE });
}

/**
 * Fonction pour formater une heure au format HH:mm
 */
export function formatTimeToHHMM(date: Date): string {
  return format(date, "HH'h'mm", { timeZone: TIMEZONE });
}

/**
 * Construit le message de rappel de rendez-vous
 */
export function buildReminderMessage(
  appointmentDate: Date,
  serviceName: string = "soins",
  clientName: string = ""
): string {
  // Formater la date et l'heure
  const formattedDate = formatDateToDDMM(appointmentDate);
  const formattedTime = formatTimeToHHMM(appointmentDate);

  // Obtenir les instructions de préparation spécifiques au service
  const preparationInstructions =
    SERVICE_PREPARATIONS.get(serviceName.toLowerCase()) ||
    SERVICE_PREPARATIONS.get("default") ||
    "";

  // Construire le message complet
  let message = REMINDER_TEMPLATE.header
    .replace("{{clientName}}", clientName || "cher(e) client(e)")
    .replace("{{date}}", formattedDate)
    .replace("{{time}}", formattedTime)
    .replace("{{service}}", serviceName);

  // Ajouter l'adresse
  message += REMINDER_TEMPLATE.address;

  // Ajouter les instructions de préparation
  message += REMINDER_TEMPLATE.preparation.replace(
    "{{preparation}}",
    preparationInstructions
  );

  // Ajouter le pied de page
  message += REMINDER_TEMPLATE.footer;

  return message;
}

/**
 * Extrait le numéro de téléphone depuis la description de la réservation
 */
export function extractPhoneNumberFromDescription(
  description: string = ""
): string | null {
  if (!description) return null;

  // Normalisation: supprimer les espaces, tirets, parenthèses
  const normalizedDesc = description.replace(/[\s\-\(\)\.]/g, "");

  // Patterns de numéros de téléphone (Congo)
  const patterns = [
    // Format international complet avec indicatif pays
    /(?:\+|00)2426[5-9]\d{7}/,
    // Format local 06, 05 etc.
    /0[5-9]\d{7}/,
  ];

  for (const pattern of patterns) {
    const match = normalizedDesc.match(pattern);
    if (match && match[0]) {
      let phoneNumber = match[0];

      // Convertir en format international si nécessaire
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "+242" + phoneNumber.substring(1);
      } else if (phoneNumber.startsWith("00")) {
        phoneNumber = "+" + phoneNumber.substring(2);
      }

      console.log(`  - Numéro de téléphone extrait: ${phoneNumber}`);
      return phoneNumber;
    }
  }

  console.log("  - Aucun numéro de téléphone trouvé dans la description");
  return null;
}

/**
 * Extrait le nom du client du titre
 */
export function extractClientName(title: string = ""): string {
  if (!title) return "";

  console.log(`Extraction du nom du client depuis: "${title}"`);

  // Supprimer les mentions de service connues
  let cleanedTitle = title;
  for (const { pattern } of SERVICE_PATTERNS) {
    cleanedTitle = cleanedTitle.replace(pattern, "");
  }

  // Supprimer les mots courants non pertinents
  const wordsToRemove = [
    "rdv",
    "rendez-vous",
    "rendezvous",
    "avec",
    "pour",
    "de",
    "la",
    "le",
    "du",
    "au",
    "à",
    "a",
    "chez",
    "institut",
    "shugamade",
  ];

  // Fonction pour vérifier si un mot est un mot de service
  function isServiceWord(word: string) {
    return wordsToRemove.includes(word.toLowerCase());
  }

  // Diviser en mots et filtrer
  const words = cleanedTitle
    .split(/\s+/)
    .filter((word) => word.length > 1 && !isServiceWord(word));

  if (words.length === 0) {
    console.log("  - Aucun nom de client détecté");
    return "";
  }

  // Reconstruire le nom (jusqu'à 3 mots maximum pour éviter les faux positifs)
  const clientName = words.slice(0, 3).join(" ");
  console.log(`  - Nom de client extrait: "${clientName}"`);
  return clientName;
}

/**
 * Envoie un message WhatsApp à un client
 */
export async function sendWhatsAppReminder(
  phoneNumber: string,
  message: string
): Promise<MessageStatus> {
  try {
    console.log(`Envoi d'un message WhatsApp au ${phoneNumber}`);

    // Appel à l'API WhatsApp
    const response = await fetch("/api/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        `Échec de l'envoi WhatsApp: ${result.message || "Erreur inconnue"}`
      );
      return {
        sent: false,
        method: "whatsapp",
        error: result.message || "Échec de l'envoi WhatsApp",
      };
    }

    console.log("Message WhatsApp envoyé avec succès");
    return {
      sent: true,
      method: "whatsapp",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message WhatsApp:", error);
    return {
      sent: false,
      method: "whatsapp",
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi WhatsApp",
    };
  }
}

/**
 * Fonction pour envoyer un SMS (à implémenter selon le fournisseur choisi)
 */
export async function sendSmsReminder(
  phoneNumber: string,
  message: string
): Promise<MessageStatus> {
  try {
    console.log(`Envoi d'un SMS au ${phoneNumber} (simulation)`);

    // Simulation d'envoi de SMS (à remplacer par l'appel réel à votre API SMS)
    // Par exemple avec Twilio, Vonage, etc.

    // Simuler un succès pour le moment
    console.log("SMS envoyé avec succès (simulation)");
    return {
      sent: true,
      method: "sms",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error);
    return {
      sent: false,
      method: "sms",
      error:
        error instanceof Error ? error.message : "Erreur lors de l'envoi SMS",
    };
  }
}

/**
 * Version optimisée avec fallback sur SMS si WhatsApp échoue
 */
export async function sendReminderWithFallback(
  phoneNumber: string,
  message: string,
  maxRetries: number = 2
): Promise<MessageStatus> {
  // Vérifier que le numéro est valide
  if (!phoneNumber || phoneNumber.length < 10) {
    console.error("Numéro de téléphone invalide:", phoneNumber);
    return {
      sent: false,
      method: "none",
      error: "Numéro de téléphone invalide",
    };
  }

  // Essayer d'abord WhatsApp
  let retries = 0;
  let whatsappStatus: MessageStatus;

  do {
    whatsappStatus = await sendWhatsAppReminder(phoneNumber, message);
    retries++;

    if (whatsappStatus.sent) {
      return whatsappStatus;
    }

    console.log(
      `Tentative WhatsApp ${retries}/${maxRetries} échouée, attente avant nouvelle tentative...`
    );

    // Attendre 1 seconde entre les tentatives
    if (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (retries < maxRetries && !whatsappStatus.sent);

  // Si WhatsApp a échoué après plusieurs tentatives, essayer SMS
  console.log("WhatsApp a échoué, tentative d'envoi par SMS...");
  return await sendSmsReminder(phoneNumber, message);
}
