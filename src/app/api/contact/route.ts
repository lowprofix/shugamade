import { NextRequest, NextResponse } from "next/server";

/**
 * API Route pour envoyer les messages du formulaire de contact
 * Cette route sert d'intermédiaire entre le frontend et le webhook n8n
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const formData = await request.json();

    // Vérifier que les données requises sont présentes
    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes. Les champs name, email et message sont requis.",
        },
        { status: 400 }
      );
    }

    // Préparer les données à envoyer au webhook n8n
    const contactData = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      date: new Date().toISOString(),
      source: "Site web ShugaMade - Formulaire de contact"
    };

    console.log("Envoi du message de contact à n8n:", contactData);

    // URL du webhook n8n (à remplacer par votre URL réelle)
    const webhookUrl = "https://n8n.bienquoi.com/webhook/contact-form";

    // Appeler le webhook n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Réponse de n8n:", responseData);

    // Retourner une réponse de succès
    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès",
      data: responseData
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi du message",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
