/**
 * Utilitaires pour le système de réservation
 */
import {
  Booking,
  SlotAvailability,
  AvailableSlot,
  BookingRequest,
  LocationConfig,
  MultipleBookingRequest,
  BookingStatus,
} from "./types";
import {
  getLocationConfig,
  DEFAULT_OPEN_DAYS,
  TIMEZONE,
  DEFAULT_OPEN_HOUR,
  DEFAULT_CLOSE_HOUR,
  BUFFER_TIME_BETWEEN_BOOKINGS,
} from "./config";
import { format, isWeekend, isValid, parseISO, getDay } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formatte une date selon le format spécifié
 * @param date Date à formater
 * @param formatStr Format de date (par défaut: dd/MM/yyyy)
 * @returns La date formatée
 */
export function formatDate(
  date: Date,
  formatStr: string = "dd/MM/yyyy"
): string {
  return format(date, formatStr, { locale: fr });
}

/**
 * Parse une chaîne de date ISO en objet Date
 * @param dateStr Chaîne de date au format ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @returns Objet Date
 */
export function parseBookingDate(dateStr: string): Date {
  const parsedDate = parseISO(dateStr);

  if (!isValid(parsedDate)) {
    throw new Error(`La date '${dateStr}' n'est pas valide`);
  }

  return parsedDate;
}

/**
 * Vérifie si une date correspond à un jour d'ouverture pour un lieu
 * @param date Date à vérifier
 * @param location Configuration du lieu
 * @returns true si le lieu est ouvert ce jour-là
 */
export function isOpenDay(date: Date, location: LocationConfig): boolean {
  // Vérifier si la date est valide
  if (!date || !isValid(date)) {
    return false;
  }

  // Si le lieu a un planning spécial, vérifier les dates disponibles
  if (location.isSpecialSchedule && location.availableDates) {
    const dateStr = formatDate(date, "yyyy-MM-dd");
    return location.availableDates.includes(dateStr);
  }

  // Sinon, vérifier les jours d'ouverture standard
  const dayOfWeek = getDay(date);
  return location.openDays?.includes(dayOfWeek) || false;
}

/**
 * Vérifie si deux créneaux horaires se chevauchent
 * @param start1 Début du premier créneau
 * @param end1 Fin du premier créneau
 * @param start2 Début du deuxième créneau
 * @param end2 Fin du deuxième créneau
 * @param bufferMinutes Temps tampon entre les réservations (en minutes)
 * @returns true si les créneaux se chevauchent
 */
export function doTimeslotsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
  bufferMinutes: number = 0
): boolean {
  // Ajouter le buffer à la fin du premier créneau
  const end1WithBuffer = new Date(end1.getTime() + bufferMinutes * 60 * 1000);

  // Vérifier le chevauchement
  return start1 < end2 && start2 < end1WithBuffer;
}

/**
 * Vérifie si un créneau horaire est disponible
 * @param locationId ID du lieu
 * @param start Début du créneau
 * @param end Fin du créneau
 * @param locations Liste des configurations de lieux
 * @param bookings Liste des réservations existantes
 * @returns Information sur la disponibilité du créneau
 */
export function isSlotAvailable(
  locationId: number,
  start: Date,
  end: Date,
  locations: LocationConfig[],
  bookings: Booking[]
): SlotAvailability {
  // Trouver la configuration du lieu
  const location = locations.find((loc) => loc.id === locationId);

  // Vérifier si le lieu existe
  if (!location) {
    return {
      available: false,
      reason: "INVALID_LOCATION",
    };
  }

  // Vérifier si le jour est ouvert
  if (!isOpenDay(start, location)) {
    return {
      available: false,
      reason: "CLOSED_DAY",
    };
  }

  // Vérifier les heures d'ouverture/fermeture (si définies)
  if (location.openHour !== undefined && location.closeHour !== undefined) {
    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour < location.openHour || endHour > location.closeHour) {
      return {
        available: false,
        reason: "OUTSIDE_HOURS",
      };
    }
  }

  // Vérifier les chevauchements avec les réservations existantes
  const locationBookings = bookings.filter((b) => b.locationId === locationId);

  for (const booking of locationBookings) {
    if (doTimeslotsOverlap(start, end, booking.start, booking.end)) {
      return {
        available: false,
        reason: "ALREADY_BOOKED",
        conflictingBookingId: booking.id,
      };
    }
  }

  // Le créneau est disponible
  return { available: true };
}

/**
 * Valide une demande de réservation
 * @param request Demande de réservation
 * @param locations Liste des configurations de lieux
 * @returns Objet avec le résultat de la validation et les erreurs éventuelles
 */
export function validateBookingRequest(
  request: BookingRequest,
  locations: LocationConfig[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifier les champs requis
  if (!request.locationId) {
    errors.push("Le lieu est requis");
  }

  if (!request.start) {
    errors.push("La date de début est requise");
  }

  if (!request.end) {
    errors.push("La date de fin est requise");
  }

  if (!request.clientName) {
    errors.push("Le nom du client est requis");
  }

  // Vérifier si le lieu existe
  const location = locations.find((loc) => loc.id === request.locationId);
  if (!location) {
    errors.push("Le lieu sélectionné n'existe pas");
  }

  // Vérifier les dates
  if (request.start && request.end) {
    // Vérifier si les dates sont valides
    if (!isValid(request.start) || !isValid(request.end)) {
      errors.push("Les dates fournies ne sont pas valides");
    }

    // Vérifier si la date de fin est après la date de début
    if (request.start.getTime() >= request.end.getTime()) {
      errors.push("La date de fin doit être après la date de début");
    }

    // Vérifier si la date est un jour ouvert (si le lieu existe)
    if (location && !isOpenDay(request.start, location)) {
      errors.push("Le lieu n'est pas ouvert à cette date");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Vérifie si tous les créneaux d'une demande de réservation multiple sont disponibles
 * @param request Demande de réservation multiple
 * @param bookings Réservations existantes
 * @param locations Liste des configurations de lieux
 * @returns Objet avec le résultat de la validation et les détails sur les créneaux non disponibles
 */
export function areAllSlotsAvailable(
  request: MultipleBookingRequest,
  bookings: Booking[],
  locations: LocationConfig[]
): {
  allAvailable: boolean;
  unavailableSlots: { index: number; reason: string }[];
} {
  const unavailableSlots: { index: number; reason: string }[] = [];

  // Récupérer la configuration du lieu
  const location = locations.find((loc) => loc.id === request.locationId);

  if (!location) {
    return {
      allAvailable: false,
      unavailableSlots: [{ index: -1, reason: "Lieu invalide" }],
    };
  }

  // Vérifier chaque créneau individuellement
  request.bookings.forEach((booking, index) => {
    try {
      const start = parseBookingDate(booking.start);
      const end = parseBookingDate(booking.end);

      const availability = isSlotAvailable(
        request.locationId,
        start,
        end,
        locations,
        bookings
      );

      if (!availability.available) {
        let reason = "Créneau non disponible";

        if (availability.reason === "CLOSED_DAY") {
          reason = "Le lieu est fermé à cette date";
        } else if (availability.reason === "OUTSIDE_HOURS") {
          reason = "En dehors des heures d'ouverture";
        } else if (availability.reason === "ALREADY_BOOKED") {
          reason = "Créneau déjà réservé";
        }

        unavailableSlots.push({ index, reason });
      }
    } catch (error) {
      unavailableSlots.push({
        index,
        reason: "Format de date invalide",
      });
    }
  });

  return {
    allAvailable: unavailableSlots.length === 0,
    unavailableSlots,
  };
}

/**
 * Valide une demande de réservation multiple (pack)
 * @param request Demande de réservation multiple
 * @param locations Liste des configurations de lieux
 * @returns Objet avec le résultat de la validation et les erreurs éventuelles
 */
export function validateMultipleBookingRequest(
  request: MultipleBookingRequest,
  locations: LocationConfig[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifier les informations client
  if (!request.clientName) {
    errors.push("Le nom du client est requis");
  }

  if (!request.clientPhone) {
    errors.push("Le numéro de téléphone du client est requis");
  }

  // Vérifier les informations sur le lieu
  if (!request.locationId) {
    errors.push("L'identifiant du lieu est requis");
  } else if (!locations.some((loc) => loc.id === request.locationId)) {
    errors.push("Le lieu sélectionné n'existe pas");
  }

  // Vérifier les informations sur le pack
  if (!request.packageName) {
    errors.push("Le nom du pack est requis");
  }

  // Vérifier les réservations individuelles
  if (!request.bookings || request.bookings.length === 0) {
    errors.push("Au moins une séance doit être planifiée");
  } else {
    // Vérifier chaque réservation
    request.bookings.forEach((booking, index) => {
      if (!booking.title) {
        errors.push(`Le titre de la séance ${index + 1} est requis`);
      }

      if (!booking.start) {
        errors.push(`La date de début de la séance ${index + 1} est requise`);
      }

      if (!booking.end) {
        errors.push(`La date de fin de la séance ${index + 1} est requise`);
      }

      // Vérifier la validité des dates si elles sont présentes
      if (booking.start && booking.end) {
        try {
          const startDate = parseBookingDate(booking.start);
          const endDate = parseBookingDate(booking.end);

          if (startDate >= endDate) {
            errors.push(
              `La date de fin de la séance ${
                index + 1
              } doit être après la date de début`
            );
          }

          // Vérifier si le lieu est ouvert à cette date
          const location = locations.find(
            (loc) => loc.id === request.locationId
          );
          if (location && !isOpenDay(startDate, location)) {
            errors.push(`Le lieu n'est pas ouvert pour la séance ${index + 1}`);
          }
        } catch (error) {
          errors.push(
            `Les dates de la séance ${index + 1} ne sont pas valides`
          );
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Génère des objets Booking à partir d'une demande de réservation multiple
 * @param request Demande de réservation multiple
 * @param status Statut initial des réservations (par défaut: pending)
 * @returns Tableau d'objets Booking
 */
export function generateBookingsFromRequest(
  request: MultipleBookingRequest,
  status: BookingStatus = "pending"
): Booking[] {
  const now = new Date();

  return request.bookings.map((bookingRequest, index) => {
    // Générer un ID unique pour chaque réservation
    const id = `${now.getTime()}-${request.locationId}-${index}`;

    return {
      id,
      locationId: request.locationId,
      start: parseBookingDate(bookingRequest.start),
      end: parseBookingDate(bookingRequest.end),
      clientName: request.clientName,
      clientPhone: request.clientPhone,
      clientEmail: request.clientEmail,
      notes: `Pack: ${request.packageName} - Séance: ${bookingRequest.title}${
        bookingRequest.description ? " - " + bookingRequest.description : ""
      }`,
      status,
      createdAt: now,
      updatedAt: now,
    };
  });
}
