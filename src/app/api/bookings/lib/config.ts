/**
 * Configuration pour le système de réservation
 */
import { LocationConfig } from "./types";

// Fuseau horaire par défaut pour tous les calculs
export const TIMEZONE = "Africa/Brazzaville";

// Jours d'ouverture (0 = Dimanche, 1 = Lundi, etc.)
export const DEFAULT_OPEN_DAYS = [1, 2, 3, 4, 5, 6]; // Du lundi au samedi

// Heures d'ouverture standard
export const DEFAULT_OPEN_HOUR = 9; // 9h du matin
export const DEFAULT_CLOSE_HOUR = 18; // 18h (6h du soir)

// Configuration des lieux
export const LOCATIONS: LocationConfig[] = [
  {
    id: 1,
    name: "Brazzaville",
    openDays: DEFAULT_OPEN_DAYS,
    openHour: DEFAULT_OPEN_HOUR,
    closeHour: DEFAULT_CLOSE_HOUR,
    isSpecialSchedule: false,
  },
  {
    id: 2,
    name: "Pointe-Noire",
    openDays: [6], // Seulement le samedi pour l'instant
    openHour: 9,
    closeHour: 18,
    isSpecialSchedule: true,
    // Dates disponibles pour Pointe-Noire
    availableDates: [
      // Mai
      "2025-05-23",
      "2025-05-24",
      // Juin
      "2025-06-27",
      "2025-06-28",
      // Juillet
      "2025-07-25",
      "2025-07-26",
      // Août
      "2025-08-29",
      "2025-08-30",
      // Septembre
      "2025-09-26",
      "2025-09-27",
    ],
  },
];

// Lieu par défaut
export const DEFAULT_LOCATION_ID = 1; // Brazzaville

// Temps minimum entre deux réservations (en minutes)
export const BUFFER_TIME_BETWEEN_BOOKINGS = 0;

/**
 * Fonction utilitaire pour obtenir la configuration d'un lieu par son ID
 */
export function getLocationConfig(
  locationId: number
): LocationConfig | undefined {
  return LOCATIONS.find((location) => location.id === locationId);
}

/**
 * Fonction utilitaire pour vérifier si un lieu existe
 */
export function locationExists(locationId: number): boolean {
  return LOCATIONS.some((location) => location.id === locationId);
}
