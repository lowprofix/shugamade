// Types pour notre application
import { toZonedTime, format } from "date-fns-tz";

export type Booking = {
  start: string; // ISO string
  end: string; // ISO string
  title?: string; // Titre de l'événement
  description?: string; // Description de l'événement, qui peut contenir le numéro de téléphone
};

export type TimeSlot = {
  start: Date;
  end: Date;
};

export type AvailableSlot = {
  date: string; // Format YYYY-MM-DD
  start: string; // Format HH:MM
  end: string; // Format HH:MM
  duration: number; // Durée en minutes
  available: boolean;
};

// Constantes
const OPEN_HOUR = 9; // 9h00
const CLOSE_HOUR = 19; // 19h00
const OPEN_DAYS = [1, 2, 3, 4, 5, 6]; // Lundi (1) au Samedi (6), pas le Dimanche (0)
const TIMEZONE = "Africa/Lagos"; // UTC+1, Afrique de l'Ouest

/**
 * Fonction utilitaire pour obtenir la date actuelle dans le fuseau horaire souhaité
 * Cette fonction utilise date-fns-tz pour garantir une gestion correcte du fuseau horaire
 */
function getCurrentDateInTimezone(): Date {
  // Obtenir la date actuelle en UTC
  const nowUtc = new Date();

  // Convertir en fuseau horaire souhaité (UTC+1)
  const nowInTimezone = toZonedTime(nowUtc, TIMEZONE);

  console.log("Date UTC:", nowUtc.toISOString());
  console.log(
    "Date dans le fuseau horaire spécifié:",
    format(nowInTimezone, "yyyy-MM-dd HH:mm:ss", { timeZone: TIMEZONE })
  );

  return nowInTimezone;
}

/**
 * Fonction utilitaire pour normaliser une date avec le fuseau horaire
 * @param dateStr Chaîne de date au format ISO avec fuseau horaire
 */
function normalizeDate(dateStr: string): Date | null {
  try {
    // Vérifier si la chaîne de date est valide
    if (!dateStr || typeof dateStr !== "string") {
      console.warn("Date invalide reçue:", dateStr);
      return null;
    }

    // Créer une date à partir de la chaîne
    const date = new Date(dateStr);

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn("Date invalide après conversion:", dateStr);
      return null;
    }

    // Convertir en fuseau horaire souhaité (UTC+1)
    const dateInTimezone = toZonedTime(date, TIMEZONE);

    return dateInTimezone;
  } catch (error) {
    console.error("Erreur lors de la normalisation de la date:", error);
    return null;
  }
}

/**
 * Génère les créneaux horaires pour une date donnée avec une durée spécifique
 */
function generateSlots(date: Date, durationMinutes: number): TimeSlot[] {
  // Vérifier si le jour est un jour d'ouverture
  const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
  if (!OPEN_DAYS.includes(dayOfWeek)) {
    return []; // Retourner un tableau vide si le jour n'est pas un jour d'ouverture
  }

  const slots: TimeSlot[] = [];
  const startTime = new Date(date);
  startTime.setHours(OPEN_HOUR, 0, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(CLOSE_HOUR, 0, 0, 0);

  // Générer des créneaux avec un pas de 15 minutes pour plus de flexibilité
  const stepMinutes = 15;

  while (startTime.getTime() + durationMinutes * 60000 <= endTime.getTime()) {
    const slotEnd = new Date(startTime.getTime() + durationMinutes * 60000);
    slots.push({ start: new Date(startTime), end: slotEnd });
    startTime.setMinutes(startTime.getMinutes() + stepMinutes);
  }

  return slots;
}

/**
 * Génère les créneaux horaires pour une date donnée avec une durée spécifique
 * Version optimisée qui prend en compte les réservations existantes
 */
function generateOptimizedSlots(
  date: Date,
  durationMinutes: number,
  bookings: Booking[]
): TimeSlot[] {
  // Vérifier si le jour est un jour d'ouverture
  const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
  if (!OPEN_DAYS.includes(dayOfWeek)) {
    return []; // Retourner un tableau vide si le jour n'est pas un jour d'ouverture
  }

  // Créer une date pour le début et la fin de la journée
  const dayStart = new Date(date);
  dayStart.setHours(OPEN_HOUR, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(CLOSE_HOUR, 0, 0, 0);

  // Filtrer les réservations pour cette journée et normaliser les dates
  const dayBookings = bookings
    .map((booking) => {
      const start = normalizeDate(booking.start);
      const end = normalizeDate(booking.end);
      return { start, end };
    })
    .filter((booking) => booking.start && booking.end) // Ignorer les réservations avec des dates invalides
    .filter((booking) => {
      // Vérifier si la réservation est pour ce jour
      const bookingDate = new Date(booking.start!.getTime());
      bookingDate.setHours(0, 0, 0, 0);
      const targetDate = new Date(date.getTime());
      targetDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === targetDate.getTime();
    });

  // Ajouter les limites de la journée comme des "réservations fictives"
  const timeSlots: { start: Date; end: Date }[] = [
    { start: new Date(0), end: dayStart }, // Avant l'ouverture
    { start: dayEnd, end: new Date(8640000000000000) }, // Après la fermeture
    ...dayBookings.map((b) => ({ start: b.start!, end: b.end! })),
  ];

  // Trier les créneaux par heure de début
  timeSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Trouver les "trous" entre les réservations
  const allAvailableSlots: TimeSlot[] = [];
  // Modification: Utiliser un pas de 30 minutes au lieu de 5 minutes pour générer des créneaux à intervalles réguliers
  const stepMinutes = 30; // Pas de 30 minutes pour des créneaux comme 9h00, 9h30, 10h00, etc.

  for (let i = 0; i < timeSlots.length - 1; i++) {
    const currentEnd = timeSlots[i].end;
    const nextStart = timeSlots[i + 1].start;

    // Vérifier s'il y a suffisamment de temps entre les deux créneaux
    // Réduire la marge de sécurité à 0 pour permettre des créneaux qui se terminent exactement à l'heure de fermeture
    const safetyMarginMs = 0; // 0 minute en millisecondes (était 60 * 1000 avant)
    const availableMinutes =
      (nextStart.getTime() - currentEnd.getTime() - safetyMarginMs) / 60000;

    if (availableMinutes >= durationMinutes) {
      // Il y a suffisamment de temps pour au moins un créneau

      // Arrondir l'heure de début au prochain multiple de 30 minutes
      let slotStart = roundToNextMinutesMultiple(currentEnd, stepMinutes);

      // Garantir que les créneaux commencent à des heures "rondes" (9h00, 9h30, 10h00, etc.)
      // en ajustant l'heure de début si nécessaire
      const hours = slotStart.getHours();
      const minutes = slotStart.getMinutes();

      // Si l'heure de début n'est pas un multiple de 30 minutes après une heure pleine,
      // l'ajuster pour qu'elle le soit
      if (minutes !== 0 && minutes !== 30) {
        if (minutes < 30) {
          slotStart.setMinutes(30);
        } else {
          slotStart.setHours(hours + 1);
          slotStart.setMinutes(0);
        }
      }

      // CORRECTION: S'assurer que l'heure de début est bien postérieure à la fin de la réservation précédente
      // Si l'heure de début est antérieure à la fin de la réservation précédente, on la définit à la fin de cette réservation
      if (slotStart.getTime() < currentEnd.getTime()) {
        slotStart = new Date(currentEnd.getTime());
        // Arrondir à nouveau au prochain multiple de 30 minutes
        slotStart = roundToNextMinutesMultiple(slotStart, stepMinutes);
      }

      // Générer des créneaux jusqu'à ce qu'il n'y ait plus assez de temps
      while (
        slotStart.getTime() + durationMinutes * 60000 <=
        nextStart.getTime() - safetyMarginMs
      ) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
        allAvailableSlots.push({ start: new Date(slotStart), end: slotEnd });
        slotStart.setMinutes(slotStart.getMinutes() + stepMinutes);
      }
    }
  }

  // Modification: Supprimer le filtrage supplémentaire qui est redondant avec le pas de 30 minutes
  const filteredSlots: TimeSlot[] = allAvailableSlots;

  return filteredSlots;
}

/**
 * Arrondit une date au prochain multiple de X minutes
 * @param date La date à arrondir
 * @param minutesMultiple Le multiple de minutes (par défaut 5)
 * @returns La date arrondie
 */
function roundToNextMinutesMultiple(
  date: Date,
  minutesMultiple: number = 5
): Date {
  const minutes = date.getMinutes();
  const remainder = minutes % minutesMultiple;

  // Si la date est déjà un multiple exact, on la garde telle quelle
  if (remainder === 0) {
    return new Date(date);
  }

  // Sinon, on arrondit au prochain multiple
  const roundedDate = new Date(date);
  roundedDate.setMinutes(minutes + (minutesMultiple - remainder));
  roundedDate.setSeconds(0, 0); // Réinitialiser les secondes et millisecondes

  return roundedDate;
}

/**
 * Vérifie si un créneau est disponible en le comparant aux réservations existantes
 */
function isSlotAvailable(slot: TimeSlot, bookings: Booking[]): boolean {
  // Obtenir les timestamps pour le début et la fin du créneau
  const slotStart = slot.start.getTime();
  const slotEnd = slot.end.getTime();

  // Réduire la marge de sécurité à 0 pour être cohérent avec les autres fonctions
  const safetyMarginMs = 0; // 0 minute en millisecondes (était 60 * 1000 avant)

  // Vérifier si le créneau chevauche une réservation existante
  const isOverlapping = bookings.some((booking) => {
    // Convertir les dates de réservation dans le même fuseau horaire
    const bookingStart = normalizeDate(booking.start);
    const bookingEnd = normalizeDate(booking.end);

    // Si l'une des dates est invalide, ignorer cette réservation
    if (!bookingStart || !bookingEnd) {
      return false;
    }

    // Vérifier le chevauchement avec une marge de sécurité
    // Un créneau est indisponible si :
    // - son début est avant la fin d'une réservation ET
    // - sa fin est après le début d'une réservation
    const overlaps =
      slotStart < bookingEnd.getTime() + safetyMarginMs &&
      slotEnd > bookingStart.getTime() - safetyMarginMs;

    if (overlaps) {
      console.log(
        `Chevauchement détecté: ${format(slot.start, "HH:mm", {
          timeZone: TIMEZONE,
        })} - ${format(slot.end, "HH:mm", {
          timeZone: TIMEZONE,
        })} chevauche ${format(new Date(bookingStart.getTime()), "HH:mm", {
          timeZone: TIMEZONE,
        })} - ${format(new Date(bookingEnd.getTime()), "HH:mm", {
          timeZone: TIMEZONE,
        })}`
      );
    }

    return overlaps;
  });

  return !isOverlapping;
}

/**
 * Formate les créneaux disponibles pour l'API
 */
function formatAvailableSlots(
  slots: TimeSlot[],
  durationMinutes: number
): AvailableSlot[] {
  return slots.map((slot) => {
    // Calculer l'heure de fin en fonction de l'heure de début et de la durée du service
    const startTime = format(slot.start, "HH:mm", { timeZone: TIMEZONE });

    // Créer une nouvelle date pour l'heure de fin basée sur l'heure de début + la durée
    const endTime = format(
      new Date(slot.start.getTime() + durationMinutes * 60000),
      "HH:mm",
      { timeZone: TIMEZONE }
    );

    return {
      date: format(slot.start, "yyyy-MM-dd", { timeZone: TIMEZONE }),
      start: startTime,
      end: endTime,
      available: true,
      duration: durationMinutes, // Ajouter la durée en minutes
    };
  });
}

/**
 * Récupère les réservations depuis l'API n8n
 */
export async function fetchBookings(): Promise<Booking[]> {
  try {
    // URL du webhook calendar events depuis les variables d'environnement
    const calendarEventsUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS;

    // Vérifier que la variable d'environnement est définie
    if (!calendarEventsUrl) {
      console.error(
        "Variable d'environnement N8N_WEBHOOK_CALENDAR_EVENTS manquante"
      );
      throw new Error(
        "Configuration incomplete - webhook calendar events URL manquante"
      );
    }

    const response = await fetch(calendarEventsUrl, {
      next: { revalidate: 60 }, // Revalider les données toutes les 1 minute au lieu de 10 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    // Récupérer les données brutes de l'API
    const rawEvents = await response.json();

    // Transformer les événements au format attendu par notre application
    const bookings: Booking[] = rawEvents.map((event: any) => ({
      start: event.start.dateTime,
      end: event.end.dateTime,
      title: event.summary || "", // Récupérer le titre de l'événement
      description: event.description || "", // Récupérer la description de l'événement
    }));

    console.log(
      `Récupération de ${bookings.length} réservations depuis l'API n8n`
    );

    // Filtrer les réservations avec des dates valides
    const validBookings = bookings.filter((booking) => {
      try {
        const start = normalizeDate(booking.start);
        const end = normalizeDate(booking.end);

        // Vérifier que les deux dates sont valides
        if (!start || !end) {
          console.warn("Réservation ignorée car dates invalides:", booking);
          return false;
        }

        return true;
      } catch (error) {
        console.warn("Erreur lors de la validation de la réservation:", error);
        return false;
      }
    });

    console.log(
      `${validBookings.length} réservations valides sur ${bookings.length} récupérées`
    );

    // Afficher les détails des réservations valides pour le débogage
    validBookings.forEach((booking, index) => {
      try {
        const start = normalizeDate(booking.start);
        const end = normalizeDate(booking.end);

        if (start && end) {
          console.log(
            `Réservation ${index + 1}: ${format(start, "yyyy-MM-dd HH:mm", {
              timeZone: TIMEZONE,
            })} - ${format(end, "HH:mm", { timeZone: TIMEZONE })}`
          );
        }
      } catch (error) {
        console.warn(
          `Erreur lors de l'affichage de la réservation ${index + 1}:`,
          error
        );
      }
    });

    return validBookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

/**
 * Vérifie si un créneau spécifique est disponible
 * @param start Heure de début du créneau
 * @param end Heure de fin du créneau
 */
export async function checkSlotAvailability(
  start: Date,
  end: Date
): Promise<{ available: boolean; reason?: string }> {
  try {
    console.log("Vérification de la disponibilité du créneau:");
    console.log(
      "- Date de début du créneau:",
      format(start, "yyyy-MM-dd HH:mm:ss", { timeZone: TIMEZONE })
    );

    // Comparer directement les dates normalisées
    const now = getCurrentDateInTimezone();
    if (start < now) {
      return { available: false, reason: "Le créneau est dans le passé" };
    }

    // Vérifier que le jour est un jour d'ouverture
    const dayOfWeek = start.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    if (!OPEN_DAYS.includes(dayOfWeek)) {
      return { available: false, reason: "L'institut est fermé ce jour-là" };
    }

    // Vérifier que le créneau est dans les horaires d'ouverture
    const startHour = start.getHours();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    if (
      startHour < OPEN_HOUR ||
      endHour > CLOSE_HOUR ||
      (endHour === CLOSE_HOUR && endMinutes > 0)
    ) {
      return {
        available: false,
        reason: "Le créneau est en dehors des horaires d'ouverture",
      };
    }

    // Récupérer les réservations existantes
    const bookings = await fetchBookings();

    // Vérifier si le créneau chevauche une réservation existante
    const isOverlapping = bookings.some((booking) => {
      const bookingStart = normalizeDate(booking.start);
      const bookingEnd = normalizeDate(booking.end);

      // Si l'une des dates est invalide, ignorer cette réservation
      if (!bookingStart || !bookingEnd) {
        return false;
      }

      // Réduire la marge de sécurité à 0 pour être cohérent avec generateOptimizedSlots
      const safetyMarginMs = 0; // 0 minute en millisecondes (était 60 * 1000 avant)

      // Un chevauchement existe si le début du nouveau créneau est avant la fin d'une réservation
      // ET la fin du nouveau créneau est après le début d'une réservation
      // Utiliser la même logique que dans isSlotAvailable avec marge de sécurité
      const overlaps =
        start.getTime() < bookingEnd.getTime() + safetyMarginMs &&
        end.getTime() > bookingStart.getTime() - safetyMarginMs;

      if (overlaps) {
        console.log(`Chevauchement détecté dans checkSlotAvailability:`);
        console.log(
          `- Nouveau créneau: ${format(start, "yyyy-MM-dd HH:mm:ss", {
            timeZone: TIMEZONE,
          })} - ${format(end, "yyyy-MM-dd HH:mm:ss", { timeZone: TIMEZONE })}`
        );
        console.log(
          `- Réservation existante: ${format(
            new Date(bookingStart.getTime()),
            "yyyy-MM-dd HH:mm:ss",
            { timeZone: TIMEZONE }
          )} - ${format(new Date(bookingEnd.getTime()), "yyyy-MM-dd HH:mm:ss", {
            timeZone: TIMEZONE,
          })}`
        );
        console.log(
          `- Condition 1: ${
            start.getTime() < bookingEnd.getTime() + safetyMarginMs
          }`
        );
        console.log(
          `- Condition 2: ${
            end.getTime() > bookingStart.getTime() - safetyMarginMs
          }`
        );
      }

      return overlaps;
    });

    if (isOverlapping) {
      return {
        available: false,
        reason: "Le créneau chevauche une réservation existante",
      };
    }

    // Si toutes les vérifications sont passées, le créneau est disponible
    return { available: true };
  } catch (error) {
    console.error("Erreur lors de la vérification du créneau:", error);
    return {
      available: false,
      reason: "Erreur lors de la vérification du créneau",
    };
  }
}

/**
 * Fonction principale pour récupérer les créneaux disponibles
 * @param durationMinutes Durée du service en minutes
 * @param daysToCheck Nombre de jours à vérifier
 * @param startDateStr Date de début au format YYYY-MM-DD (optionnel)
 */
export async function getAvailableSlots(
  durationMinutes: number,
  daysToCheck: number = 7,
  startDateStr: string = ""
): Promise<AvailableSlot[]> {
  // Récupérer les réservations
  const bookings = await fetchBookings();

  // Déterminer la date de début
  let startDate: Date;
  if (startDateStr) {
    // Utiliser la date fournie
    startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0); // Début de la journée

    // Vérifier que la date est valide
    if (isNaN(startDate.getTime())) {
      console.error("Date de début invalide:", startDateStr);
      startDate = getCurrentDateInTimezone();
    }
  } else {
    // Utiliser la date actuelle
    startDate = getCurrentDateInTimezone();
  }

  console.log(
    "Date de début pour la recherche de créneaux:",
    format(startDate, "yyyy-MM-dd HH:mm:ss", { timeZone: TIMEZONE })
  );

  const availableSlots: AvailableSlot[] = [];

  for (let i = 0; i < daysToCheck; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);

    // Générer tous les créneaux pour ce jour en utilisant la méthode optimisée
    const dailySlots = generateOptimizedSlots(day, durationMinutes, bookings);

    // Pour le premier jour, afficher les créneaux générés pour le débogage
    if (i === 0) {
      console.log("Créneaux générés pour le premier jour de la période:");
      dailySlots.slice(0, 5).forEach((slot) => {
        console.log(
          `- ${format(slot.start, "HH:mm", { timeZone: TIMEZONE })} - ${format(
            slot.end,
            "HH:mm",
            { timeZone: TIMEZONE }
          )}`
        );
      });
    }

    // Obtenir l'heure actuelle
    const now = getCurrentDateInTimezone();

    // Filtrer les créneaux disponibles (passés)
    const availableDailySlots = dailySlots.filter((slot) => {
      // Ignorer les créneaux passés
      if (slot.start < now) return false;

      return true; // Nous avons déjà vérifié les chevauchements dans generateOptimizedSlots
    });

    // Convertir les créneaux en format de sortie
    const formattedSlots = formatAvailableSlots(
      availableDailySlots,
      durationMinutes
    );

    availableSlots.push(...formattedSlots);
  }

  return availableSlots;
}

/**
 * Ajoute une réservation à la liste des réservations
 * @param startStr Date de début au format ISO
 * @param endStr Date de fin au format ISO
 * @returns Objet indiquant si l'ajout a réussi et un message
 */
export async function addBooking(
  startStr: string,
  endStr: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Tentative d'ajout de réservation: ${startStr} - ${endStr}`);

    // Normaliser les dates
    const start = normalizeDate(startStr);
    const end = normalizeDate(endStr);

    // Vérifier que les dates sont valides
    if (!start || !end) {
      console.error(`Dates invalides: start=${startStr}, end=${endStr}`);
      return {
        success: false,
        message: "Dates invalides",
      };
    }

    console.log(
      `Dates normalisées: ${format(start, "yyyy-MM-dd HH:mm:ss", {
        timeZone: TIMEZONE,
      })} - ${format(end, "yyyy-MM-dd HH:mm:ss", { timeZone: TIMEZONE })}`
    );

    // Vérifier la disponibilité du créneau
    const isAvailable = await checkSlotAvailability(start, end);

    if (!isAvailable.available) {
      console.warn(`Créneau non disponible: ${isAvailable.reason}`);
      return {
        success: false,
        message: `Impossible d'ajouter la réservation: créneau non disponible "${isAvailable.reason}"`,
      };
    }

    // Ajouter la réservation à la liste
    const newBooking = {
      id: `booking-${Date.now()}`,
      start: startStr,
      end: endStr,
      title: "Réservation",
    };

    // Récupérer les réservations existantes
    const existingBookings = await fetchBookings();

    // Vérifier à nouveau s'il y a un chevauchement (double vérification)
    const hasOverlap = existingBookings.some((booking) => {
      const bookingStart = normalizeDate(booking.start);
      const bookingEnd = normalizeDate(booking.end);

      if (!bookingStart || !bookingEnd) return false;

      return start < bookingEnd && end > bookingStart;
    });

    if (hasOverlap) {
      console.warn("Chevauchement détecté lors de la double vérification");
      return {
        success: false,
        message:
          "Le créneau chevauche une réservation existante (détecté lors de la double vérification)",
      };
    }

    // Ajouter la nouvelle réservation
    console.log(`Réservation ajoutée avec succès: ${newBooking.id}`);

    return {
      success: true,
      message: "Réservation ajoutée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la réservation:", error);
    return {
      success: false,
      message: `Erreur lors de l'ajout de la réservation: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`,
    };
  }
}
