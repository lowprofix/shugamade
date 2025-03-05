/**
 * Configuration et utilitaires pour l'intégration Cal.com
 */

import { getCalApi } from "@calcom/embed-react";

// Namespace pour l'application ShugaMade
export const CALCOM_NAMESPACE = "shugamade";

// Username Cal.com (à remplacer par le vôtre)
export const CALCOM_USERNAME = "mbote-bio-oabi4t";

// Services Cal.com spécifiques
export const CALCOM_SERVICES = {
  diagnostic: "diagnostic-capillaire",
  tempes: "hairneedling-tempes",
  tete: "hairneedling-tete-entiere",
};

// Fonction pour construire le lien Cal.com complet
export function buildCalLink(serviceCalLink: string): string {
  // Si le lien est déjà complet, on le retourne directement
  if (serviceCalLink.includes("cal.com")) {
    return serviceCalLink;
  }

  // Sinon on construit le lien à partir du slug
  const serviceSlug =
    CALCOM_SERVICES[serviceCalLink as keyof typeof CALCOM_SERVICES] ||
    serviceCalLink;
  return `${CALCOM_USERNAME}/${serviceSlug}`;
}

// Configuration par défaut de Cal.com
export const DEFAULT_CAL_CONFIG = {
  name: "ShugaMade",
  theme: "light",
  hideEventTypeDetails: "false",
  layout: "month_view",
};

// Initialisation de l'API Cal.com avec vos paramètres personnalisés
export async function initializeCalApi() {
  try {
    const cal = await getCalApi({ namespace: CALCOM_NAMESPACE });
    cal("ui", {
      theme: "light",
      cssVarsPerTheme: {
        light: { "cal-brand": "#E94CA1" }, // Rose du logo
        dark: { "cal-brand": "#23C6C8" }, // Bleu du logo
      },
      hideEventTypeDetails: "false",
      layout: "month_view",
    });
    return cal;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Cal API:", error);
    return null;
  }
}
