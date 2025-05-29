import { NextRequest, NextResponse } from "next/server";

/**
 * API pour vérifier l'état de l'instance WhatsApp Evolution API
 */
export async function GET(request: NextRequest) {
  try {
    // Configuration de l'API Evolution
    const serverUrl = process.env.EVOLUTION_API_SERVER;
    const instanceName = process.env.EVOLUTION_API_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!serverUrl || !instanceName || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur incomplète",
          config: {
            serverUrl: !!serverUrl,
            instanceName: !!instanceName,
            apiKey: !!apiKey,
          }
        },
        { status: 500 }
      );
    }

    console.log(`Vérification de l'état de l'instance: ${instanceName}`);

    // Vérifier l'état de connexion de l'instance
    const connectionResponse = await fetch(
      `${serverUrl}/instance/connectionState/${instanceName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
      }
    );

    let connectionData = null;
    if (connectionResponse.ok) {
      connectionData = await connectionResponse.json();
    } else {
      const errorText = await connectionResponse.text();
      console.error("Erreur lors de la vérification de l'état de connexion:", errorText);
    }

    // Récupérer les informations de l'instance
    const instanceResponse = await fetch(
      `${serverUrl}/instance/fetchInstances`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
      }
    );

    let instanceData = null;
    if (instanceResponse.ok) {
      const allInstances = await instanceResponse.json();
      instanceData = Array.isArray(allInstances) 
        ? allInstances.find(inst => inst.instance?.instanceName === instanceName)
        : null;
    } else {
      const errorText = await instanceResponse.text();
      console.error("Erreur lors de la récupération des instances:", errorText);
    }

    return NextResponse.json({
      success: true,
      message: "Diagnostic de l'instance Evolution API",
      config: {
        serverUrl: serverUrl,
        instanceName: instanceName,
        apiKeyPresent: !!apiKey,
      },
      connection: {
        status: connectionResponse.status,
        data: connectionData,
      },
      instance: {
        status: instanceResponse.status,
        data: instanceData,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Erreur lors du diagnostic de l'instance:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Échec du diagnostic de l'instance",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 