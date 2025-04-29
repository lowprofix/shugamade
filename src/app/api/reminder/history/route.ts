import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Configuration de l'API
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Route GET pour consulter l'historique des rappels
 * Cette fonction permet de consulter l'historique des rappels avec filtrage et pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentification requise",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const apiSecretKey = process.env.API_SECRET_KEY;

    if (token !== apiSecretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Clé API invalide",
        },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête pour le filtrage et la pagination
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // pending, sent, failed
    const date = url.searchParams.get("date"); // Format: YYYY-MM-DD
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Construire les conditions de filtrage
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      where.date = date;
    }

    // Récupérer les rappels avec filtrage et pagination
    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Compter le nombre total de rappels pour la pagination
    const totalCount = await prisma.reminder.count({ where });

    // Calculer les statistiques
    const stats = {
      total: totalCount,
      sent: await prisma.reminder.count({
        where: { ...where, status: "sent" },
      }),
      pending: await prisma.reminder.count({
        where: { ...where, status: "pending" },
      }),
      failed: await prisma.reminder.count({
        where: { ...where, status: "failed" },
      }),
    };

    // Renvoyer les résultats avec les métadonnées de pagination
    return NextResponse.json({
      success: true,
      reminders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
      stats,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des rappels:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la récupération de l'historique",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
