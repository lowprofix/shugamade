import { NextRequest, NextResponse } from "next/server";
import { fetchBookings } from "@/lib/availability";
import { toZonedTime } from "date-fns-tz";

// Configuration de l'API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Définir la durée maximale d'exécution (respecte la limite du plan hobby)
export const maxDuration = 60; // 60 secondes max

// Type pour les rendez-vous préparés
type PreparedBooking = {
  id?: string; // Optionnel car Booking n'a pas cette propriété
  title: string;
  description: string;
  start: string;
  end: string;
};

/**
 * Route GET pour préparer les rappels (étape 1)
 * Cette fonction récupère les rendez-vous du lendemain et les stocke temporairement
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentification requise' 
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const apiSecretKey = process.env.API_SECRET_KEY;
    
    if (token !== apiSecretKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'Clé API invalide' 
      }, { status: 403 });
    }

    // Récupérer les rendez-vous pour demain
    console.log("Récupération des rendez-vous pour demain...");
    
    // Obtenir la date de demain
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    // Récupérer tous les rendez-vous (la fonction ne prend pas de paramètres)
    const allBookings = await fetchBookings();
    
    // Filtrer pour ne garder que les rendez-vous de demain
    const bookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.start);
      return bookingDate >= tomorrow && bookingDate <= tomorrowEnd;
    });
    
    if (!bookings || bookings.length === 0) {
      console.log("Aucun rendez-vous trouvé pour demain");
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous trouvé pour demain",
        bookings: []
      });
    }
    
    console.log(`${bookings.length} rendez-vous trouvés pour demain`);
    
    // Préparer les données à stocker
    const preparedBookings: PreparedBooking[] = bookings.map(booking => ({
      // Générer un ID temporaire si nécessaire
      id: `temp-${new Date(booking.start).getTime()}`,
      title: booking.title || "",
      description: booking.description || "",
      start: booking.start,
      end: booking.end
    }));
    
    // Stocker les données dans un stockage temporaire
    // Dans un environnement serverless comme Vercel, nous devons utiliser un stockage externe
    // Pour cet exemple, nous utilisons simplement une variable globale dans le module Next.js
    // En production, utilisez une base de données comme MongoDB, Supabase, ou même KV Storage de Vercel
    
    // Stocker dans une variable globale (pour cet exemple)
    // @ts-ignore - Accès à la variable globale
    global.preparedBookings = preparedBookings;
    
    return NextResponse.json({
      success: true,
      message: `${preparedBookings.length} rendez-vous préparés pour les rappels`,
      count: preparedBookings.length
    });
  } catch (error) {
    console.error("Erreur lors de la préparation des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de la préparation des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
