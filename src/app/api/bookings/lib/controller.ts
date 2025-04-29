/**
 * Contrôleur pour le système de réservation
 * Gère les requêtes API et la logique métier
 */
import { NextRequest, NextResponse } from "next/server";
import {
  Booking,
  BookingRequest,
  BookingStatus,
  MultipleBookingRequest,
} from "./types";
import { LOCATIONS } from "./config";
import {
  validateBookingRequest,
  isSlotAvailable,
  validateMultipleBookingRequest,
  areAllSlotsAvailable,
  generateBookingsFromRequest,
  parseBookingDate,
} from "./utils";
import {
  getAllBookings,
  getBookingById,
  getBookingsByLocation,
  getBookingsByDateRange,
  getBookingsByLocationAndDateRange,
  addBooking,
  addMultipleBookings,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  deleteMultipleBookings,
} from "./storage";

/**
 * Récupère toutes les réservations
 */
export async function handleGetAllBookings(
  req: NextRequest
): Promise<NextResponse> {
  try {
    // Traiter les paramètres de requête pour le filtrage
    const url = new URL(req.url);
    const locationId = url.searchParams.get("locationId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const status = url.searchParams.get("status") as BookingStatus | null;

    let bookings: Booking[] = [];

    // Filtrer par lieu et/ou période si spécifiés
    if (locationId && startDate && endDate) {
      // Lieu + période
      bookings = await getBookingsByLocationAndDateRange(
        parseInt(locationId),
        new Date(startDate),
        new Date(endDate)
      );
    } else if (locationId) {
      // Seulement lieu
      bookings = await getBookingsByLocation(parseInt(locationId));
    } else if (startDate && endDate) {
      // Seulement période
      bookings = await getBookingsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      // Toutes les réservations
      bookings = await getAllBookings();
    }

    // Filtrer par statut si spécifié
    if (status) {
      bookings = bookings.filter((booking) => booking.status === status);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}

/**
 * Récupère une réservation par son ID
 */
export async function handleGetBookingById(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  try {
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la réservation ${id}:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    );
  }
}

/**
 * Crée une nouvelle réservation
 */
export async function handleCreateBooking(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const bookingRequest = (await req.json()) as BookingRequest;

    // Valider la demande de réservation
    const validation = validateBookingRequest(bookingRequest, LOCATIONS);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Demande de réservation invalide",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité du créneau
    const existingBookings = await getAllBookings();
    const availability = isSlotAvailable(
      bookingRequest.locationId,
      bookingRequest.start,
      bookingRequest.end,
      LOCATIONS,
      existingBookings
    );

    if (!availability.available) {
      return NextResponse.json(
        {
          error: "Créneau non disponible",
          reason: availability.reason,
          conflictingBookingId: availability.conflictingBookingId,
        },
        { status: 409 }
      );
    }

    // Générer un ID unique
    const id = `booking-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const now = new Date();

    // Créer la réservation
    const newBooking: Booking = {
      id,
      ...bookingRequest,
      status: "pending", // Statut par défaut
      createdAt: now,
      updatedAt: now,
    };

    // Ajouter la réservation
    const savedBooking = await addBooking(newBooking);

    return NextResponse.json(savedBooking, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}

/**
 * Crée des réservations multiples (pack)
 */
export async function handleCreateMultipleBookings(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const multipleRequest = (await req.json()) as MultipleBookingRequest;

    // Valider la demande de réservations multiples
    const validation = validateMultipleBookingRequest(
      multipleRequest,
      LOCATIONS
    );

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Demande de réservations multiples invalide",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité de tous les créneaux
    const existingBookings = await getAllBookings();
    const availability = areAllSlotsAvailable(
      multipleRequest,
      existingBookings,
      LOCATIONS
    );

    if (!availability.allAvailable) {
      return NextResponse.json(
        {
          error: "Certains créneaux ne sont pas disponibles",
          unavailableSlots: availability.unavailableSlots,
        },
        { status: 409 }
      );
    }

    // Générer les objets Booking à partir de la demande
    const newBookings = generateBookingsFromRequest(multipleRequest);

    // Ajouter les réservations
    const savedBookings = await addMultipleBookings(newBookings);

    return NextResponse.json(savedBookings, { status: 201 });
  } catch (error) {
    console.error(
      "Erreur lors de la création des réservations multiples:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la création des réservations multiples" },
      { status: 500 }
    );
  }
}

/**
 * Vérifie la disponibilité d'un créneau
 */
export async function handleCheckAvailability(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { locationId, start, end } = await req.json();

    if (!locationId || !start || !end) {
      return NextResponse.json(
        { error: "Paramètres manquants: locationId, start et end sont requis" },
        { status: 400 }
      );
    }

    // Convertir les chaînes en objets Date
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;

    // Vérifier la disponibilité
    const existingBookings = await getAllBookings();
    const availability = isSlotAvailable(
      parseInt(locationId.toString()),
      startDate,
      endDate,
      LOCATIONS,
      existingBookings
    );

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Erreur lors de la vérification de disponibilité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de disponibilité" },
      { status: 500 }
    );
  }
}

/**
 * Met à jour une réservation existante
 */
export async function handleUpdateBooking(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  try {
    // Vérifier si la réservation existe
    const existingBooking = await getBookingById(id);

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    const updateData = await req.json();

    // Si les dates sont modifiées, vérifier la disponibilité
    if (
      (updateData.start &&
        updateData.start !== existingBooking.start.toISOString()) ||
      (updateData.end &&
        updateData.end !== existingBooking.end.toISOString()) ||
      (updateData.locationId &&
        updateData.locationId !== existingBooking.locationId)
    ) {
      const startDate = updateData.start
        ? new Date(updateData.start)
        : existingBooking.start;
      const endDate = updateData.end
        ? new Date(updateData.end)
        : existingBooking.end;
      const locationId = updateData.locationId || existingBooking.locationId;

      // Récupérer toutes les réservations sauf celle en cours de modification
      const otherBookings = (await getAllBookings()).filter((b) => b.id !== id);

      const availability = isSlotAvailable(
        locationId,
        startDate,
        endDate,
        LOCATIONS,
        otherBookings
      );

      if (!availability.available) {
        return NextResponse.json(
          {
            error: "Créneau non disponible pour la modification",
            reason: availability.reason,
            conflictingBookingId: availability.conflictingBookingId,
          },
          { status: 409 }
        );
      }

      // Convertir les dates pour la mise à jour
      if (updateData.start) {
        updateData.start = new Date(updateData.start);
      }

      if (updateData.end) {
        updateData.end = new Date(updateData.end);
      }
    }

    // Mettre à jour la réservation
    const updatedBooking = await updateBooking(id, updateData);

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de la réservation ${id}:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}

/**
 * Met à jour le statut d'une réservation
 */
export async function handleUpdateBookingStatus(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  try {
    const { status } = await req.json();

    if (!status || !["confirmed", "pending", "cancelled"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Statut invalide. Les valeurs acceptées sont: confirmed, pending, cancelled",
        },
        { status: 400 }
      );
    }

    const updatedBooking = await updateBookingStatus(
      id,
      status as BookingStatus
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de la réservation ${id}:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut de la réservation" },
      { status: 500 }
    );
  }
}

/**
 * Supprime une réservation
 */
export async function handleDeleteBooking(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  try {
    const deleted = await deleteBooking(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Réservation supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la réservation ${id}:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la réservation" },
      { status: 500 }
    );
  }
}
