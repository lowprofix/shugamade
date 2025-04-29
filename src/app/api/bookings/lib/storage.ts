/**
 * Module de stockage pour le système de réservation
 * Gère la persistance des données de réservation
 */
import fs from "fs";
import path from "path";
import { Booking, BookingStatus } from "./types";

// Chemin vers le fichier JSON de stockage des réservations
const BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");

// S'assurer que le répertoire data existe
const ensureDataDirExists = () => {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// S'assurer que le fichier de réservations existe
const ensureBookingsFileExists = () => {
  ensureDataDirExists();

  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
  }
};

/**
 * Récupère toutes les réservations
 * @returns Liste des réservations
 */
export async function getAllBookings(): Promise<Booking[]> {
  ensureBookingsFileExists();

  try {
    const fileContent = await fs.promises.readFile(BOOKINGS_FILE, "utf-8");
    const bookings = JSON.parse(fileContent) as any[];

    // Convertir les chaînes de dates en objets Date
    return bookings.map((booking) => ({
      ...booking,
      start: new Date(booking.start),
      end: new Date(booking.end),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
    }));
  } catch (error) {
    console.error("Erreur lors de la lecture des réservations :", error);
    return [];
  }
}

/**
 * Récupère une réservation par son ID
 * @param id ID de la réservation
 * @returns La réservation trouvée ou null si aucune correspondance
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await getAllBookings();
  const booking = bookings.find((booking) => booking.id === id);

  return booking || null;
}

/**
 * Récupère les réservations pour un lieu spécifique
 * @param locationId ID du lieu
 * @returns Liste des réservations pour ce lieu
 */
export async function getBookingsByLocation(
  locationId: number
): Promise<Booking[]> {
  const bookings = await getAllBookings();
  return bookings.filter((booking) => booking.locationId === locationId);
}

/**
 * Récupère les réservations pour une période donnée
 * @param startDate Début de la période
 * @param endDate Fin de la période
 * @returns Liste des réservations dans cette période
 */
export async function getBookingsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  const bookings = await getAllBookings();

  return bookings.filter((booking) => {
    // Une réservation est dans la période si:
    // - elle commence pendant la période, ou
    // - elle se termine pendant la période, ou
    // - elle englobe toute la période
    return (
      (booking.start >= startDate && booking.start <= endDate) ||
      (booking.end >= startDate && booking.end <= endDate) ||
      (booking.start <= startDate && booking.end >= endDate)
    );
  });
}

/**
 * Récupère les réservations pour un lieu et une période donnés
 * @param locationId ID du lieu
 * @param startDate Début de la période
 * @param endDate Fin de la période
 * @returns Liste des réservations pour ce lieu et cette période
 */
export async function getBookingsByLocationAndDateRange(
  locationId: number,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  const bookings = await getBookingsByLocation(locationId);

  return bookings.filter((booking) => {
    return (
      (booking.start >= startDate && booking.start <= endDate) ||
      (booking.end >= startDate && booking.end <= endDate) ||
      (booking.start <= startDate && booking.end >= endDate)
    );
  });
}

/**
 * Enregistre les réservations dans le fichier
 * @param bookings Liste des réservations à enregistrer
 */
async function saveBookings(bookings: Booking[]): Promise<void> {
  ensureDataDirExists();

  try {
    await fs.promises.writeFile(
      BOOKINGS_FILE,
      JSON.stringify(bookings, null, 2)
    );
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des réservations :", error);
    throw new Error("Impossible d'enregistrer les réservations");
  }
}

/**
 * Ajoute une nouvelle réservation
 * @param booking Réservation à ajouter
 * @returns La réservation ajoutée
 */
export async function addBooking(booking: Booking): Promise<Booking> {
  const bookings = await getAllBookings();

  // Vérifier si l'ID existe déjà
  if (bookings.some((b) => b.id === booking.id)) {
    throw new Error(`Une réservation avec l'ID ${booking.id} existe déjà`);
  }

  bookings.push(booking);
  await saveBookings(bookings);

  return booking;
}

/**
 * Ajoute plusieurs réservations
 * @param newBookings Liste des réservations à ajouter
 * @returns Les réservations ajoutées
 */
export async function addMultipleBookings(
  newBookings: Booking[]
): Promise<Booking[]> {
  const bookings = await getAllBookings();
  const existingIds = new Set(bookings.map((b) => b.id));

  // Vérifier si des ID existent déjà
  for (const booking of newBookings) {
    if (existingIds.has(booking.id)) {
      throw new Error(`Une réservation avec l'ID ${booking.id} existe déjà`);
    }
  }

  const updatedBookings = [...bookings, ...newBookings];
  await saveBookings(updatedBookings);

  return newBookings;
}

/**
 * Met à jour une réservation existante
 * @param id ID de la réservation à mettre à jour
 * @param updateData Données à mettre à jour
 * @returns La réservation mise à jour ou null si non trouvée
 */
export async function updateBooking(
  id: string,
  updateData: Partial<Booking>
): Promise<Booking | null> {
  const bookings = await getAllBookings();
  const index = bookings.findIndex((b) => b.id === id);

  if (index === -1) {
    return null;
  }

  // Mettre à jour la date de modification
  const updatedBooking = {
    ...bookings[index],
    ...updateData,
    updatedAt: new Date(),
  };

  bookings[index] = updatedBooking;
  await saveBookings(bookings);

  return updatedBooking;
}

/**
 * Met à jour le statut d'une réservation
 * @param id ID de la réservation
 * @param status Nouveau statut
 * @returns La réservation mise à jour ou null si non trouvée
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  return updateBooking(id, { status });
}

/**
 * Supprime une réservation
 * @param id ID de la réservation à supprimer
 * @returns true si supprimée, false si non trouvée
 */
export async function deleteBooking(id: string): Promise<boolean> {
  const bookings = await getAllBookings();
  const initialLength = bookings.length;

  const filteredBookings = bookings.filter((b) => b.id !== id);

  if (filteredBookings.length === initialLength) {
    return false; // Aucune réservation supprimée
  }

  await saveBookings(filteredBookings);
  return true;
}

/**
 * Supprime plusieurs réservations
 * @param ids Liste des IDs des réservations à supprimer
 * @returns Nombre de réservations supprimées
 */
export async function deleteMultipleBookings(ids: string[]): Promise<number> {
  const bookings = await getAllBookings();
  const initialLength = bookings.length;

  const idsSet = new Set(ids);
  const filteredBookings = bookings.filter((b) => !idsSet.has(b.id));

  const deletedCount = initialLength - filteredBookings.length;

  if (deletedCount > 0) {
    await saveBookings(filteredBookings);
  }

  return deletedCount;
}
