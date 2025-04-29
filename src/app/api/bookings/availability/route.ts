import { NextRequest } from "next/server";
import { handleCheckAvailability } from "../lib/controller";

/**
 * POST /api/bookings/availability
 * Vérifie la disponibilité d'un créneau horaire
 */
export async function POST(request: NextRequest) {
  return handleCheckAvailability(request);
}
