import { NextRequest, NextResponse } from "next/server";

// Interfaces pour nos types de données
interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
    [key: string]: any;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ClientDetail {
  clientName: string;
  phoneNumber: string;
  serviceName: string;
  appointmentTime: string;
  message: string;
  originalAppointment: {
    summary: any;
    start: any;
    description: any;
  };
}

interface ClientWithError {
  appointment: any;
  error: string;
  details?: string;
}

/**
 * Extrait un numéro de téléphone depuis une description d'événement
 * Gère différents formats de description
 */
function extractPhoneNumber(
  description: string | undefined | null
): string | null {
  if (!description) return null;

  console.log("Tentative d'extraction de numéro depuis:", description);

  // Format: juste un numéro
  if (/^\d{6,12}$/.test(description.trim())) {
    console.log("Format détecté: numéro simple");
    return description.trim();
  }

  // Format: plusieurs lignes avec préfixe +242
  const phoneRegex = /\+?(?:242)?[0-9]{9,12}/g;
  const matches = description.match(phoneRegex);

  if (matches && matches.length > 0) {
    // Trouver le numéro le plus complet (avec préfixe)
    const phoneNumber =
      matches.find((num) => num.includes("+242")) || matches[0];
    console.log("Format détecté: regex, numéro trouvé:", phoneNumber);
    return phoneNumber.replace(/\s+/g, "");
  }

  // Format: ligne spécifique avec tiret et numéro
  const lines = description.split("\n");
  for (const line of lines) {
    // Chercher une ligne qui ressemble à "- +242064729311"
    if (line.includes("+242") || /- \d{6,12}/.test(line)) {
      const numericPart = line.replace(/[^0-9+]/g, "");
      if (numericPart.length >= 6) {
        console.log(
          "Format détecté: ligne avec tiret, numéro trouvé:",
          numericPart
        );
        return numericPart;
      }
    }
  }

  // Dernier essai: extraire toute séquence de chiffres d'au moins 9 caractères
  const lastResortRegex = /\d{9,}/g;
  const lastResortMatches = description.match(lastResortRegex);
  if (lastResortMatches && lastResortMatches.length > 0) {
    console.log(
      "Format détecté: dernier recours, numéro trouvé:",
      lastResortMatches[0]
    );
    return lastResortMatches[0];
  }

  console.log("Aucun numéro trouvé dans la description");
  return null;
}

/**
 * Extrait un nom de client depuis le résumé de l'événement
 */
function extractClientName(summary: string | undefined | null): string {
  if (!summary) return "Client";

  // Format: "Réservation - Service - Nom"
  const parts = summary.split("-");
  if (parts.length >= 3) {
    return parts[2].trim();
  }

  // Format: "Réservation - Service Nom"
  if (parts.length === 2) {
    const servicePart = parts[1].trim();
    const words = servicePart.split(" ");

    // Si le service est composé de plusieurs mots, les derniers pourraient être le nom
    if (words.length > 1) {
      return words.slice(1).join(" ").trim();
    }
  }

  return "Client";
}

/**
 * Recherche un client dans Hiboutik par son nom
 * @param clientName Le nom du client à rechercher
 * @returns Les informations du client si trouvées, sinon null
 */
async function searchClientInHiboutik(clientName: string): Promise<any | null> {
  try {
    // Si le nom est trop court, ne pas faire la recherche
    if (!clientName || clientName.length < 3 || clientName === "Client") {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shugamade.com";
    const searchResponse = await fetch(
      `${baseUrl}/api/hiboutik/clients/search?term=${encodeURIComponent(
        clientName
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      console.error(`Erreur lors de la recherche Hiboutik pour ${clientName}`);
      return null;
    }

    const searchResult = await searchResponse.json();

    // Si on a des résultats, prendre le premier client
    if (Array.isArray(searchResult) && searchResult.length > 0) {
      console.log(`Client trouvé dans Hiboutik: ${clientName}`);
      return searchResult[0];
    }

    console.log(`Aucun client trouvé dans Hiboutik pour ${clientName}`);
    return null;
  } catch (error) {
    console.error(
      `Erreur lors de la recherche du client ${clientName} dans Hiboutik:`,
      error
    );
    return null;
  }
}

/**
 * Récupère les rendez-vous du lendemain et envoie des rappels WhatsApp
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Récupérer les rendez-vous du lendemain depuis le webhook n8n
    const webhookUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW;

    if (!webhookUrl) {
      console.error("URL du webhook n8n non configurée");
      return NextResponse.json(
        { success: false, error: "Configuration incomplète" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Erreur lors de la récupération des rendez-vous");
      return NextResponse.json(
        { success: false, error: "Impossible de récupérer les rendez-vous" },
        { status: response.status }
      );
    }

    // 2. Traiter les données des rendez-vous
    const appointmentsData = await response.json();

    // Analyser la structure des données pour le débogage
    console.log(
      "Structure des données reçues:",
      JSON.stringify({
        type: typeof appointmentsData,
        isArray: Array.isArray(appointmentsData),
        keys: appointmentsData ? Object.keys(appointmentsData) : [],
        firstItem:
          Array.isArray(appointmentsData) && appointmentsData.length > 0
            ? Object.keys(appointmentsData[0])
            : typeof appointmentsData === "object" && appointmentsData
            ? Object.keys(appointmentsData)
            : [],
      })
    );

    const appointments = Array.isArray(appointmentsData)
      ? appointmentsData
      : appointmentsData.appointments || [];

    if (!appointments.length) {
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous prévu pour demain",
        count: 0,
      });
    }

    // Analyse détaillée du premier rendez-vous pour comprendre la structure
    if (appointments.length > 0) {
      const firstAppointment = appointments[0];
      console.log("Analyse du premier rendez-vous:", {
        summary: firstAppointment.summary,
        hasDescription: "description" in firstAppointment,
        description: firstAppointment.description,
        start: firstAppointment.start,
        allFields: Object.keys(firstAppointment),
      });
    }

    // 3. Préparer les messages pour chaque client
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Formatage de la date en français
    const formattedDate = tomorrow.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // Créer des informations simplifiées pour chaque rendez-vous
    const simplifiedAppointments = appointments.map(
      (appointment: CalendarEvent) => {
        // Essayer d'extraire le numéro de téléphone
        const phoneNumber = extractPhoneNumber(appointment.description);

        return {
          summary: appointment.summary,
          date: appointment.start?.dateTime || appointment.start,
          time: appointment.start?.dateTime
            ? new Date(appointment.start.dateTime).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          hasDescription: !!appointment.description,
          phoneExtracted: !!phoneNumber,
          phoneNumber: phoneNumber,
          description: appointment.description,
        };
      }
    );

    return NextResponse.json({
      success: true,
      message: `${appointments.length} rendez-vous trouvés pour demain`,
      date: formattedDate,
      appointments: simplifiedAppointments,
    });
  } catch (error) {
    console.error("Erreur lors du traitement des rendez-vous:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du traitement des rendez-vous",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * Route pour envoyer les rappels WhatsApp aux clients ayant un RDV demain
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier si c'est un mode test (dry run)
    const { testMode = false } = await request.json().catch(() => ({}));

    // 1. D'abord, récupérer les rendez-vous
    const webhookUrl = process.env.N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW;

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: "Configuration incomplète" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Impossible de récupérer les rendez-vous" },
        { status: response.status }
      );
    }

    // 2. Traiter les données des rendez-vous
    const appointmentsData = await response.json();

    console.log(
      "Structure des données reçues dans POST:",
      JSON.stringify({
        type: typeof appointmentsData,
        isArray: Array.isArray(appointmentsData),
      }).substring(0, 200)
    );

    const appointments = Array.isArray(appointmentsData)
      ? appointmentsData
      : appointmentsData.appointments || [];

    if (!appointments.length) {
      return NextResponse.json({
        success: true,
        message: "Aucun rendez-vous prévu pour demain",
        count: 0,
      });
    }

    // 3. Formater la date pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // 4. Extraire et préparer les informations client
    const clientDetails: (ClientDetail | ClientWithError)[] = [];
    const manuallyProcessedClients: any[] = [];

    for (const appointment of appointments) {
      try {
        console.log(`Traitement de l'événement: ${appointment.summary}`);

        // Extraire le numéro de téléphone depuis le champ description
        const phoneFromDescription = extractPhoneNumber(
          appointment.description
        );

        // Extraire le nom du client du résumé de l'événement
        const nameFromSummary = extractClientName(appointment.summary);

        // Si pas de description ou pas de numéro extrait, ajouter à la liste pour traitement manuel
        if (!phoneFromDescription) {
          console.log(`Pas de numéro trouvé pour: ${appointment.summary}`);
          manuallyProcessedClients.push({
            summary: appointment.summary,
            date: appointment.start?.dateTime || appointment.start,
            time: appointment.start?.dateTime
              ? new Date(appointment.start.dateTime).toLocaleTimeString(
                  "fr-FR",
                  { hour: "2-digit", minute: "2-digit" }
                )
              : "",
            missingPhone: true,
            clientName: nameFromSummary,
          });
          continue; // Passer au rendez-vous suivant
        }

        // Formater le numéro de téléphone
        const formattedPhone = phoneFromDescription.startsWith("+")
          ? phoneFromDescription
          : `+242${phoneFromDescription.replace(/^0+/, "")}`;

        // Extraire le nom du service depuis le résumé
        let serviceName = "votre rendez-vous";
        if (appointment.summary) {
          const parts = appointment.summary.split("-");
          if (parts.length >= 2) {
            serviceName = parts[1].trim();
          }
        }

        // Extraire l'heure du rendez-vous
        let appointmentTime = "";
        if (appointment.start?.dateTime) {
          appointmentTime = new Date(
            appointment.start.dateTime
          ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        }

        // Message personnalisé pour le rappel
        const message = `Bonjour ${nameFromSummary}, nous vous rappelons votre rendez-vous "${serviceName}" demain ${formattedDate} à ${appointmentTime} chez ShugaMade. En cas d'empêchement, merci de nous contacter au plus tôt. À très bientôt !`;

        clientDetails.push({
          clientName: nameFromSummary,
          phoneNumber: formattedPhone,
          serviceName,
          appointmentTime,
          message,
          originalAppointment: {
            summary: appointment.summary,
            start: appointment.start,
            description: appointment.description,
          },
        });
      } catch (error) {
        console.error("Erreur lors du traitement d'un rendez-vous:", error);
        manuallyProcessedClients.push({
          appointment: {
            summary: appointment.summary,
            description: appointment.description,
          },
          error: "Erreur d'extraction des données",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    // Si c'est un mode test, renvoyer simplement les détails sans envoyer les messages
    if (testMode) {
      return NextResponse.json({
        success: true,
        message: `Test réussi. ${clientDetails.length} numéros extraits, ${manuallyProcessedClients.length} clients sans numéro valide`,
        date: formattedDate,
        clients: clientDetails,
        manualProcessing: manuallyProcessedClients,
      });
    }

    // 5. En mode normal, envoyer les messages
    const sentMessages: any[] = [];
    const failedMessages: any[] = [];

    for (const client of clientDetails) {
      // Vérifier si le client est une erreur
      if ("error" in client) {
        failedMessages.push(client);
        continue;
      }

      try {
        // Envoyer le message WhatsApp via l'API existante
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          `https://${request.headers.get("host")}`;

        console.log(
          `Envoi du message à ${client.clientName} (${client.phoneNumber})`
        );

        const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: client.phoneNumber,
            message: client.message,
          }),
        });

        const whatsappResult = await whatsappResponse.json();

        if (whatsappResult.success) {
          console.log(`✅ Message envoyé avec succès à ${client.clientName}`);
          sentMessages.push({
            clientName: client.clientName,
            phoneNumber: client.phoneNumber,
            appointmentTime: client.appointmentTime,
            serviceName: client.serviceName,
          });
        } else {
          console.error(
            `❌ Échec d'envoi du message à ${client.clientName}: ${whatsappResult.error}`
          );
          failedMessages.push({
            clientName: client.clientName,
            phoneNumber: client.phoneNumber,
            error: whatsappResult.error,
            whatsappRegistered:
              whatsappResult.whatsapp === false ? false : true,
          });
        }

        // Attendre un court délai entre chaque envoi pour éviter les limitations
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'envoi du rappel à ${client.clientName}:`,
          error
        );
        failedMessages.push({
          client: {
            clientName: client.clientName,
            phoneNumber: client.phoneNumber,
          },
          error: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    // 6. Gérer les clients sans numéro de téléphone (option: recherche par nom dans Hiboutik)
    // Cette fonctionnalité pourrait être ajoutée si besoin

    // Rechercher dans Hiboutik uniquement si ce n'est pas un mode test et s'il y a des clients sans numéro
    const hiboutikResolvedClients: any[] = [];

    if (!testMode && manuallyProcessedClients.length > 0) {
      console.log(
        `Tentative de résolution de ${manuallyProcessedClients.length} clients sans numéro via Hiboutik`
      );

      for (const client of manuallyProcessedClients) {
        if (!client.clientName) continue;

        // Rechercher le client dans Hiboutik
        const hiboutikClient = await searchClientInHiboutik(client.clientName);

        if (hiboutikClient && hiboutikClient.customers_phone) {
          // Format du téléphone: s'assurer qu'il a le préfixe +242
          const phoneNumber = hiboutikClient.customers_phone.startsWith("+")
            ? hiboutikClient.customers_phone
            : `+242${hiboutikClient.customers_phone.replace(/^0+/, "")}`;

          console.log(
            `✅ Client ${client.clientName} trouvé dans Hiboutik avec le numéro ${phoneNumber}`
          );

          // Extraire le nom du service depuis le résumé
          let serviceName = "votre rendez-vous";
          if (client.summary) {
            const parts = client.summary.split("-");
            if (parts.length >= 2) {
              serviceName = parts[1].trim();
            }
          }

          // Message personnalisé pour le rappel
          const message =
            `Bonjour ${client.clientName}, nous vous rappelons votre rendez-vous "${serviceName}" demain ${formattedDate} à ${client.time} chez ShugaMade.` +
            `\n\n🔹 Préparation avant la séance\n` +
            `✅ Cheveux propres et sans produit : Merci de vous assurer que vos cheveux, en particulier la zone à traiter, soient propres et exempts de tout produit (huiles, gels, crèmes, etc.).\n\n` +
            `⏳ Ponctualité\n` +
            `• Merci d'arriver à l'heure afin de profiter pleinement de votre séance.\n` +
            `• Un retard de plus de 30 minutes entraînera l'annulation de la séance sans possibilité de remboursement de l'acompte.\n\n` +
            `❌ Annulation & Report\n` +
            `• Toute annulation ou report doit être signalé au moins 24h à l'avance.\n` +
            `• Au-delà de ce délai, l'acompte ne pourra pas être remboursé.\n\n` +
            `Si vous avez des questions, n'hésitez pas à me contacter.\n` +
            `\n\nÀ très bientôt !\n` +
            `Eunice – SHUGAMADE\n` +
            `📞 +242 06 597 56 23`;

          try {
            // Envoyer le message WhatsApp
            const baseUrl =
              process.env.NEXT_PUBLIC_APP_URL ||
              `https://${request.headers.get("host")}`;

            console.log(
              `Envoi du message à ${client.clientName} (${phoneNumber}) [Hiboutik]`
            );

            const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phoneNumber: phoneNumber,
                message: message,
              }),
            });

            const whatsappResult = await whatsappResponse.json();

            if (whatsappResult.success) {
              console.log(
                `✅ Message envoyé avec succès à ${client.clientName} [Hiboutik]`
              );
              sentMessages.push({
                clientName: client.clientName,
                phoneNumber: phoneNumber,
                appointmentTime: client.time,
                serviceName: serviceName,
                foundVia: "hiboutik",
              });

              // Ajouter à la liste des clients résolus via Hiboutik
              hiboutikResolvedClients.push({
                clientName: client.clientName,
                phoneNumber: phoneNumber,
                hiboutikId: hiboutikClient.id,
              });
            } else {
              failedMessages.push({
                clientName: client.clientName,
                phoneNumber: phoneNumber,
                error: whatsappResult.error,
                foundVia: "hiboutik",
              });
            }

            // Attendre un court délai entre chaque envoi
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } catch (error) {
            console.error(
              `❌ Erreur lors de l'envoi du rappel à ${client.clientName} [Hiboutik]:`,
              error
            );
            failedMessages.push({
              clientName: client.clientName,
              phoneNumber: phoneNumber,
              error: error instanceof Error ? error.message : "Erreur inconnue",
              foundVia: "hiboutik",
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés pour ${sentMessages.length} clients sur ${
        clientDetails.length + hiboutikResolvedClients.length
      } (dont ${hiboutikResolvedClients.length} résolus via Hiboutik)`,
      date: formattedDate,
      sent: sentMessages,
      failed: failedMessages,
      manuallyProcessNeeded:
        manuallyProcessedClients.length - hiboutikResolvedClients.length > 0,
      manualProcessing: manuallyProcessedClients.filter(
        (client) =>
          !hiboutikResolvedClients.some(
            (resolved) => resolved.clientName === client.clientName
          )
      ),
      hiboutikResolved: hiboutikResolvedClients,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des rappels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'envoi des rappels",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
