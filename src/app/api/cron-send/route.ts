import { NextResponse } from 'next/server';

// Configuration du Cron Job d'envoi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Définir la durée maximale d'exécution (respecte la limite du plan hobby)
export const maxDuration = 60; // 60 secondes max

// Annotation pour Vercel Cron
export const config = {
  runtime: 'edge',
  regions: ['cdg1'], // Région Europe (Paris)
};

export async function GET() {
  try {
    // Récupérer l'URL de l'application et la clé API depuis les variables d'environnement
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiKey) {
      console.error('API_SECRET_KEY non définie dans les variables d\'environnement');
      return NextResponse.json({
        success: false,
        message: 'Configuration incomplète: API_SECRET_KEY manquante'
      }, { status: 500 });
    }

    // Appel à l'API d'envoi des rappels (deuxième étape du processus)
    // Cette API envoie les rappels pour les rendez-vous préalablement identifiés
    const response = await fetch(`${appUrl}/api/reminder/send`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    
    // Journaliser l'exécution du Cron
    console.log(`[${new Date().toISOString()}] Cron job d'envoi exécuté avec succès`);
    
    return NextResponse.json({
      success: true,
      message: 'Cron job d\'envoi exécuté avec succès',
      timestamp: new Date().toISOString(),
      result: data
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution du Cron job d\'envoi:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Échec de l\'exécution du Cron job d\'envoi',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
