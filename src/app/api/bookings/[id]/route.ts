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
  context: { params: { id: string } }
) {
  return handleGetBookingById(request, context);
}

/**
 * PUT /api/bookings/[id]
 * Met à jour une réservation existante
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const path = request.nextUrl.pathname;

  // Route pour mettre à jour le statut
  if (path.endsWith("/status")) {
    return handleUpdateBookingStatus(request, context);
  }

  // Route pour mettre à jour la réservation complète
  return handleUpdateBooking(request, context);
}

/**
 * PATCH /api/bookings/[id]
 * Met à jour partiellement une réservation existante
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return handleUpdateBooking(request, context);
}

/**
 * DELETE /api/bookings/[id]
 * Supprime une réservation
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return handleDeleteBooking(request, context);
}
