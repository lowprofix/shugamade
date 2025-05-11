import { NextRequest, NextResponse } from "next/server";

const apiLogin = process.env.HIBOUTIK_API_LOGIN;
const apiKey = process.env.HIBOUTIK_API_KEY;
const baseUrl = process.env.HIBOUTIK_BASE_URL;

function getAuthHeaders() {
  if (!apiLogin || !apiKey || !baseUrl) {
    throw new Error("Configuration Hiboutik incomplète");
  }
  const credentials = Buffer.from(`${apiLogin}:${apiKey}`).toString("base64");
  return {
    Accept: "application/json",
    Authorization: `Basic ${credentials}`,
    "API-LOGIN": apiLogin,
    "API-KEY": apiKey,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!apiLogin || !apiKey || !baseUrl) {
      return NextResponse.json(
        { error: "Configuration Hiboutik incomplète" },
        { status: 500 }
      );
    }

    // Accès au paramètre id de manière asynchrone dans Next.js 15
    const params = await context.params;
    const id = params.id;

    const { customers_attribute, new_value } = await request.json();
    if (!customers_attribute || typeof new_value === "undefined") {
      return NextResponse.json(
        {
          error:
            "Paramètres manquants : customers_attribute et new_value sont requis",
        },
        { status: 400 }
      );
    }
    const hiboutikUrl = `${baseUrl}/customer/${id}`;
    const body = new URLSearchParams({
      customers_attribute,
      new_value,
    });
    const response = await fetch(hiboutikUrl, {
      method: "PUT",
      headers: getAuthHeaders(),
      body,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Erreur Hiboutik",
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }
    return NextResponse.json({ success: true, hiboutik: data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
