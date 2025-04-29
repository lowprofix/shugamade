import { NextRequest, NextResponse } from "next/server";
import {
  handleGetAllBookings,
  handleCreateBooking,
  handleCreateMultipleBookings,
  handleCheckAvailability,
} from "./lib/controller";

/**
 * GET /api/bookings
 * Récupère les réservations avec filtrage optionnel
 */
export async function GET(request: NextRequest) {
  return handleGetAllBookings(request);
}

/**
 * POST /api/bookings
 * Crée une nouvelle réservation
 */
export async function POST(request: NextRequest) {
  // Déterminer si c'est une demande de réservation simple ou multiple
  const contentType = request.headers.get("content-type");
  const isMultiple = contentType?.includes("multiple-booking");

  if (isMultiple) {
    return handleCreateMultipleBookings(request);
  } else {
    return handleCreateBooking(request);
  }
}

/**
 * PUT /api/bookings/availability
 * Vérifie la disponibilité d'un créneau
 */
export async function PUT(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.endsWith("/availability")) {
    return handleCheckAvailability(request);
  }

  return NextResponse.json({ error: "Endpoint non trouvé" }, { status: 404 });
}
