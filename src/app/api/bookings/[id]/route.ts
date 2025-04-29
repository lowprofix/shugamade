import { NextRequest } from "next/server";
import {
  handleGetBookingById,
  handleUpdateBooking,
  handleDeleteBooking,
  handleUpdateBookingStatus,
} from "../lib/controller";

/**
 * GET /api/bookings/[id]
 * Récupère une réservation par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleGetBookingById(request, { params });
}

/**
 * PUT /api/bookings/[id]
 * Met à jour une réservation existante
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const path = request.nextUrl.pathname;

  // Route pour mettre à jour le statut
  if (path.endsWith("/status")) {
    return handleUpdateBookingStatus(request, { params });
  }

  // Route pour mettre à jour la réservation complète
  return handleUpdateBooking(request, { params });
}

/**
 * PATCH /api/bookings/[id]
 * Met à jour partiellement une réservation existante
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleUpdateBooking(request, { params });
}

/**
 * DELETE /api/bookings/[id]
 * Supprime une réservation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDeleteBooking(request, { params });
}
