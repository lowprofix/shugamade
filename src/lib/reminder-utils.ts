/**
 * Extrait un numéro de téléphone depuis une description d'événement
 * Gère différents formats de description
 */
export function extractPhoneNumber(
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
export function extractClientName(summary: string | undefined | null): string {
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
