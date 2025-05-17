import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { LOCATIONS } from "./config";

/**
 * Convertit une date formatée (ex: "vendredi 24 mai") en format ISO (YYYY-MM-DD)
 */
function convertToISODate(formattedDate: string): string {
  // Extraire l'année en cours depuis la config ou utiliser l'année courante
  const year = "2025"; // À ajuster selon votre logique
  
  // Parser la date formatée en français
  const parsedDate = parse(formattedDate, "EEEE d MMMM", new Date(), {
    locale: fr,
  });
  
  // Retourner la date au format ISO
  return format(parsedDate, "yyyy-MM-dd");
}

/**
 * Vérifie si une date correspond à une séance à Pointe-Noire
 */
export function isPointeNoireSession(formattedDate: string): boolean {
  try {
    const isoDate = convertToISODate(formattedDate);
    const pointeNoireLocation = LOCATIONS.find(loc => loc.name === "Pointe-Noire");
    return pointeNoireLocation?.availableDates?.includes(isoDate) || false;
  } catch (error) {
    console.error("Erreur lors de la vérification de la session Pointe-Noire:", error);
    return false;
  }
}

/**
 * Retourne le lieu d'une séance en fonction de la date
 */
export function getSessionLocation(formattedDate: string): string {
  return isPointeNoireSession(formattedDate) ? "Pointe-Noire" : "Brazzaville";
}