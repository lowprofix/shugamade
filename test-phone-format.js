#!/usr/bin/env node

/**
 * Script de test pour vérifier le formatage des numéros de téléphone
 */

// Simuler la fonction detectAndFormatPhoneNumber
const COUNTRY_PATTERNS = {
  "33": {
    name: "France",
    patterns: [
      /^0?[67]\d{8}$/, // 06, 07 + 8 chiffres (mobile)
      /^0?[1-5]\d{8}$/, // 01-05 + 8 chiffres (fixe)
    ],
    mobilePrefix: ["06", "07"],
    fixedPrefix: ["01", "02", "03", "04", "05"],
    totalLength: 10,
  },
};

function cleanPhoneNumber(phoneNumber) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

function extractCountryCode(phoneNumber) {
  if (!phoneNumber.startsWith("+")) {
    return null;
  }
  
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

function formatPhoneWithCountryCode(number, countryCode) {
  // Pour la France, supprimer le 0 initial
  if (countryCode === "33") {
    const cleanNumber = number.replace(/^0+/, "");
    return `+${countryCode}${cleanNumber}`;
  }
  
  return `+${countryCode}${number}`;
}

function detectAndFormatPhoneNumber(rawNumber) {
  const originalNumber = rawNumber;
  const cleaned = cleanPhoneNumber(rawNumber);
  
  console.log(`Formatage du numéro: "${rawNumber}" -> "${cleaned}"`);
  
  // Cas 1: Numéro déjà avec indicatif international
  if (cleaned.startsWith("+")) {
    const extracted = extractCountryCode(cleaned);
    if (extracted) {
      const config = COUNTRY_PATTERNS[extracted.countryCode];
      // ✅ CORRECTION : Appliquer le formatage spécifique au pays
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
  
  return {
    formatted: cleaned,
    countryCode: "unknown",
    countryName: "Inconnu",
    confidence: "low",
    originalNumber,
  };
}

// Tests
console.log("🧪 Test du formatage des numéros français\n");

const testNumbers = [
  "+33066818966", // Le problème de Jennifer
  "+33668118966", // Déjà correct
  "+33067123456", // Autre numéro avec 0 superflu
  "0668118966",   // Sans indicatif
];

testNumbers.forEach(number => {
  console.log(`\n📞 Test: ${number}`);
  const result = detectAndFormatPhoneNumber(number);
  console.log(`   Résultat: ${result.formatted}`);
  console.log(`   Pays: ${result.countryName}`);
  console.log(`   Confiance: ${result.confidence}`);
}); 