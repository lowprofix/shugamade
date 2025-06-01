/**
 * Utilitaires pour la gestion intelligente des numéros de téléphone
 * Spécialement conçu pour le Congo Brazzaville et les pays voisins
 */

// Configuration des patterns de numéros par pays
const COUNTRY_PATTERNS = {
  // Congo Brazzaville (+242) - PRIORITÉ ABSOLUE
  "242": {
    name: "Congo Brazzaville",
    patterns: [
      // Mobile : 04, 05, 06 + 7 chiffres (total 9 chiffres)
      /^04\d{7}$/, // 04xxxxxxx
      /^05\d{7}$/, // 05xxxxxxx  
      /^06\d{7}$/, // 06xxxxxxx
      // Fixe : 01, 02, 03 + 6 chiffres (total 8 chiffres)
      /^01\d{6}$/, // 01xxxxxx
      /^02\d{6}$/, // 02xxxxxx
      /^03\d{6}$/, // 03xxxxxx
      // Versions sans le 0 initial
      /^4\d{7}$/, // 4xxxxxxx
      /^5\d{7}$/, // 5xxxxxxx
      /^6\d{7}$/, // 6xxxxxxx
      /^1\d{6}$/, // 1xxxxxx
      /^2\d{6}$/, // 2xxxxxx
      /^3\d{6}$/, // 3xxxxxx
    ],
    mobilePrefix: ["04", "05", "06"],
    fixedPrefix: ["01", "02", "03"],
    totalLength: 9, // Sans l'indicatif pays
  },
  
  // France (+33)
  "33": {
    name: "France",
    patterns: [
      /^0?[67]\d{8}$/, // 06, 07 + 8 chiffres (mobile)
      /^0?[1-5]\d{8}$/, // 01-05 + 8 chiffres (fixe)
    ],
    mobilePrefix: ["06", "07"],
    fixedPrefix: ["01", "02", "03", "04", "05"],
    totalLength: 10, // Sans l'indicatif pays
  },
  
  // Cameroun (+237)
  "237": {
    name: "Cameroun",
    patterns: [
      /^0?[67]\d{7}$/, // 6, 7 + 7 chiffres (mobile)
    ],
    mobilePrefix: ["6", "7"],
    fixedPrefix: ["2"],
    totalLength: 9,
  },
  
  // Gabon (+241)
  "241": {
    name: "Gabon",
    patterns: [
      /^0?[67]\d{6}$/, // 06, 07 + 6 chiffres (mobile)
    ],
    mobilePrefix: ["06", "07"],
    fixedPrefix: ["01"],
    totalLength: 8,
  },
  
  // RDC (+243)
  "243": {
    name: "RDC",
    patterns: [
      /^0?[89]\d{7}$/, // 8, 9 + 7 chiffres (mobile)
    ],
    mobilePrefix: ["8", "9"],
    fixedPrefix: ["1", "2"],
    totalLength: 9,
  },
} as const;

/**
 * Nettoie un numéro de téléphone en supprimant les caractères non numériques
 */
function cleanPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^\d+]/g, "");
}

/**
 * Extrait l'indicatif pays d'un numéro international
 */
function extractCountryCode(phoneNumber: string): { countryCode: string; number: string } | null {
  if (!phoneNumber.startsWith("+")) {
    return null;
  }
  
  // Essayer les indicatifs connus
  for (const code of Object.keys(COUNTRY_PATTERNS)) {
    if (phoneNumber.startsWith(`+${code}`)) {
      return {
        countryCode: code,
        number: phoneNumber.substring(code.length + 1),
      };
    }
  }
  
  return null;
}

/**
 * Détecte le pays probable basé sur les patterns de numéros
 * PRIORITÉ ABSOLUE AU CONGO (+242) car c'est le pays d'implémentation
 */
function detectCountryFromPattern(number: string): string | null {
  console.log(`🔍 Détection du pays pour: ${number}`);
  
  // PRIORITÉ 1: CONGO BRAZZAVILLE (+242) - Test en premier absolu
  const congoConfig = COUNTRY_PATTERNS["242"];
  
  // Test avec le numéro original (avec 0 initial)
  for (const pattern of congoConfig.patterns) {
    if (pattern.test(number)) {
      console.log(`✅ CONGO détecté avec 0 initial: ${number} → +242`);
      return "242";
    }
  }
  
  // Test sans le 0 initial pour le Congo
  const numberWithoutZero = number.replace(/^0+/, "");
  for (const pattern of congoConfig.patterns) {
    if (pattern.test(numberWithoutZero)) {
      console.log(`✅ CONGO détecté sans 0 initial: ${number} → ${numberWithoutZero} → +242`);
      return "242";
    }
  }
  
  // PRIORITÉ 2: Autres pays (seulement si Congo ne match pas)
  console.log(`❌ Congo ne match pas, test des autres pays...`);
  
  // Test d'abord avec le numéro original pour tous les autres pays
  const otherCountries = Object.entries(COUNTRY_PATTERNS).filter(([code]) => code !== "242");
  
  for (const [countryCode, config] of otherCountries) {
    for (const pattern of config.patterns) {
      if (pattern.test(number)) {
        console.log(`✅ ${config.name} détecté avec 0 initial: ${number} → +${countryCode}`);
        return countryCode;
      }
    }
  }
  
  // Test sans le 0 initial pour les autres pays
  for (const [countryCode, config] of otherCountries) {
    for (const pattern of config.patterns) {
      if (pattern.test(numberWithoutZero)) {
        console.log(`✅ ${config.name} détecté sans 0 initial: ${number} → ${numberWithoutZero} → +${countryCode}`);
        return countryCode;
      }
    }
  }
  
  console.log(`❌ Aucun pays détecté pour: ${number}`);
  return null;
}

/**
 * Formate un numéro avec l'indicatif pays approprié
 */
function formatPhoneWithCountryCode(number: string, countryCode: string): string {
  const config = COUNTRY_PATTERNS[countryCode as keyof typeof COUNTRY_PATTERNS];
  if (!config) {
    return `+${countryCode}${number}`;
  }
  
  // Pour le Congo (+242), garder le 0 initial s'il fait partie du préfixe valide
  if (countryCode === "242") {
    // Si le numéro commence par 04, 05, 06, 01, 02, 03 → garder le 0
    if (/^0[1-6]/.test(number)) {
      return `+${countryCode}${number}`;
    }
    // Sinon, supprimer le 0 initial
    const cleanNumber = number.replace(/^0+/, "");
    return `+${countryCode}${cleanNumber}`;
  }
  
  // Pour la France, supprimer le 0 initial
  if (countryCode === "33") {
    const cleanNumber = number.replace(/^0+/, "");
    return `+${countryCode}${cleanNumber}`;
  }
  
  // Pour les autres pays, garder tel quel
  return `+${countryCode}${number}`;
}

/**
 * Valide qu'un numéro de téléphone est correct pour un pays donné
 */
function validatePhoneNumber(phoneNumber: string, countryCode?: string): boolean {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  if (countryCode) {
    const config = COUNTRY_PATTERNS[countryCode as keyof typeof COUNTRY_PATTERNS];
    if (config) {
      const numberWithoutCode = cleaned.replace(`+${countryCode}`, "");
      return config.patterns.some(pattern => pattern.test(numberWithoutCode));
    }
  }
  
  // Si pas de pays spécifié, vérifier tous les patterns
  return Object.values(COUNTRY_PATTERNS).some(config =>
    config.patterns.some(pattern => pattern.test(cleaned))
  );
}

/**
 * Fonction principale : détecte et formate intelligemment un numéro de téléphone
 */
export function detectAndFormatPhoneNumber(rawNumber: string): {
  formatted: string;
  countryCode: string;
  countryName: string;
  confidence: "high" | "medium" | "low";
  originalNumber: string;
} {
  const originalNumber = rawNumber;
  const cleaned = cleanPhoneNumber(rawNumber);
  
  console.log(`Formatage du numéro: "${rawNumber}" -> "${cleaned}"`);
  
  // Cas 1: Numéro déjà avec indicatif international
  if (cleaned.startsWith("+")) {
    const extracted = extractCountryCode(cleaned);
    if (extracted) {
      const config = COUNTRY_PATTERNS[extracted.countryCode as keyof typeof COUNTRY_PATTERNS];
      const formatted = formatPhoneWithCountryCode(extracted.number, extracted.countryCode);
      
      console.log(`🔧 Formatage avec indicatif existant: ${rawNumber} -> ${formatted}`);
      
      return {
        formatted,
        countryCode: extracted.countryCode,
        countryName: config?.name || "Inconnu",
        confidence: "high",
        originalNumber,
      };
    }
  }
  
  // Cas 2: Détection basée sur les patterns
  const detectedCountry = detectCountryFromPattern(cleaned);
  if (detectedCountry) {
    const config = COUNTRY_PATTERNS[detectedCountry as keyof typeof COUNTRY_PATTERNS];
    const formatted = formatPhoneWithCountryCode(cleaned, detectedCountry);
    
    return {
      formatted,
      countryCode: detectedCountry,
      countryName: config.name,
      confidence: "high",
      originalNumber,
    };
  }
  
  // Cas 3: Fallback - assumer Congo Brazzaville (pays par défaut)
  console.warn(`Impossible de détecter le pays pour "${rawNumber}", utilisation du Congo par défaut`);
  const fallbackFormatted = formatPhoneWithCountryCode(cleaned, "242");
  
  return {
    formatted: fallbackFormatted,
    countryCode: "242",
    countryName: "Congo Brazzaville (par défaut)",
    confidence: "low",
    originalNumber,
  };
}

/**
 * Version simplifiée pour la compatibilité avec l'ancien code
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const result = detectAndFormatPhoneNumber(phoneNumber);
  return result.formatted;
}

/**
 * Fonction pour obtenir des informations détaillées sur un numéro
 */
export function getPhoneNumberInfo(phoneNumber: string) {
  return detectAndFormatPhoneNumber(phoneNumber);
}

/**
 * Vérifie si un numéro est probablement un mobile
 */
export function isMobileNumber(phoneNumber: string): boolean {
  const info = detectAndFormatPhoneNumber(phoneNumber);
  const config = COUNTRY_PATTERNS[info.countryCode as keyof typeof COUNTRY_PATTERNS];
  
  if (!config) return false;
  
  const numberWithoutCode = phoneNumber.replace(`+${info.countryCode}`, "").replace(/^0+/, "");
  
  return config.mobilePrefix.some(prefix => 
    numberWithoutCode.startsWith(prefix)
  );
}

/**
 * Liste des pays supportés
 */
export function getSupportedCountries() {
  return Object.entries(COUNTRY_PATTERNS).map(([code, config]) => ({
    code,
    name: config.name,
    mobilePrefix: config.mobilePrefix,
    fixedPrefix: config.fixedPrefix,
  }));
} 