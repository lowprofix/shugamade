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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetBookingById(request, { params: { id } });
}

/**
 * PUT /api/bookings/[id]
 * Met à jour une réservation existante
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = request.nextUrl.pathname;

  // Route pour mettre à jour le statut
  if (path.endsWith("/status")) {
    return handleUpdateBookingStatus(request, { params: { id } });
  }

  // Route pour mettre à jour la réservation complète
  return handleUpdateBooking(request, { params: { id } });
}

/**
 * PATCH /api/bookings/[id]
 * Met à jour partiellement une réservation existante
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateBooking(request, { params: { id } });
}

/**
 * DELETE /api/bookings/[id]
 * Supprime une réservation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteBooking(request, { params: { id } });
}
