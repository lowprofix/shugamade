import { NextRequest } from "next/server";
import { handleUpdateBookingStatus } from "../../lib/controller";

/**
 * PUT /api/bookings/[id]/status
 * Met à jour le statut d'une réservation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateBookingStatus(request, { params: { id } });
}
