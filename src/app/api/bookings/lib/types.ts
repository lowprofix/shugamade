/**
 * Types pour le nouveau système de gestion des réservations
 * avec support pour les lieux multiples
 */

// Réutiliser certains types de base de l'ancien système
import {
  AvailableSlot as BaseAvailableSlot,
  TimeSlot,
} from "@/lib/availability";

/**
 * Configuration d'un lieu
 */
export interface LocationConfig {
  id: number;
  name: string;
  openDays?: number[];
  openHour?: number;
  closeHour?: number;
  isSpecialSchedule?: boolean;
  availableDates?: string[];
}

/**
 * Informations sur une réservation
 */
export interface Booking {
  id: string;
  locationId: number;
  start: Date;
  end: Date;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Statut d'une réservation
 */
export type BookingStatus = "confirmed" | "pending" | "cancelled";

/**
 * Créneau disponible pour une réservation
 */
export interface AvailableSlot {
  locationId: number;
  start: Date;
  end: Date;
}

/**
 * Disponibilité d'un créneau
 */
export interface SlotAvailability {
  available: boolean;
  reason?:
    | "CLOSED_DAY"
    | "OUTSIDE_HOURS"
    | "ALREADY_BOOKED"
    | "INVALID_LOCATION";
  conflictingBookingId?: string;
}

/**
 * Demande de réservation
 */
export interface BookingRequest {
  locationId: number;
  start: Date;
  end: Date;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
}

// Type pour la requête de réservations multiples
export interface MultipleBookingRequest {
  // Informations client (une seule fois)
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  hiboutikClientId?: number;
  locationId: number; // ID du lieu

  // Informations sur le pack
  packageName: string; // Nom du pack
  packageDescription?: string; // Description du pack

  // Les réservations individuelles du pack
  bookings: {
    title: string; // Titre/nom du service
    start: string; // Date et heure de début (ISO)
    end: string; // Date et heure de fin (ISO)
    description?: string; // Description spécifique à cette séance
  }[];
}
