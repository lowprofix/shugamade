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
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${credentials}`,
    "API-LOGIN": apiLogin,
    "API-KEY": apiKey,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!apiLogin || !apiKey || !baseUrl) {
      return NextResponse.json(
        { error: "Configuration Hiboutik incomplète" },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(request.url);
    const hiboutikUrl = new URL(`${baseUrl}/customers/search`);
    searchParams.forEach((value, key) => {
      hiboutikUrl.searchParams.append(key, value);
    });
    const response = await fetch(hiboutikUrl.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: "Erreur Hiboutik",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
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
