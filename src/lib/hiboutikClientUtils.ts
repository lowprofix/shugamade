export interface HiboutikClient {
  customers_id: number;
  customers_first_name: string;
  customers_last_name: string;
  customers_phone_number: string;
  customers_email?: string;
  [key: string]: any;
}

/**
 * Recherche un client Hiboutik par numéro de téléphone
 */
export async function searchHiboutikClientByPhone(
  phone: string,
  phoneCountryCode?: string
): Promise<HiboutikClient | null> {
  // Nettoyer le numéro (supprimer espaces)
  const rawPhone = phone.replace(/\s+/g, "");
  const code =
    phoneCountryCode || (rawPhone.startsWith("+") ? rawPhone.slice(0, 4) : "");
  const numberWithoutCode = rawPhone.replace(/^\+?\d{1,4}/, "");

  // Générer les variantes à tester
  const variants = [
    code && numberWithoutCode ? `${code} ${numberWithoutCode}` : null,
    code && numberWithoutCode ? `${code}${numberWithoutCode}` : null,
    numberWithoutCode,
    numberWithoutCode.replace(/(\d{2})(?=\d)/g, "$1 ").trim(),
    phone,
  ].filter(Boolean);

  for (const variant of variants) {
    const response = await fetch(
      `/api/hiboutik/clients/search?phone=${encodeURIComponent(variant!)}`
    );
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // S'assurer que tous les champs sont présents (fallback)
        const client = data[0];
        return {
          customers_id: client.customers_id,
          customers_first_name:
            client.customers_first_name || client.first_name || "",
          customers_last_name:
            client.customers_last_name || client.last_name || "",
          customers_phone_number:
            client.customers_phone_number || client.phone || "",
          customers_email: client.customers_email || client.email || "",
          ...client,
        };
      }
    }
  }
  return null;
}

/**
 * Crée un client Hiboutik
 */
export async function createHiboutikClient(customerInfo: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  phoneCountryCode: string;
}): Promise<HiboutikClient | null> {
  const payload = {
    customers_first_name: customerInfo.first_name,
    customers_last_name: customerInfo.last_name,
    customers_phone_number: `${
      customerInfo.phoneCountryCode
    } ${customerInfo.phone.replace(/\s+/g, "")}`,
    customers_email: customerInfo.email || "",
  };
  const response = await fetch("/api/hiboutik/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data;
}

/**
 * Cherche un client Hiboutik par téléphone uniquement (sans création)
 */
export async function findHiboutikClient(customerInfo: {
  phone: string;
  phoneCountryCode: string;
}): Promise<HiboutikClient | null> {
  // Recherche par numéro de téléphone (toutes variantes)
  return await searchHiboutikClientByPhone(
    customerInfo.phone,
    customerInfo.phoneCountryCode
  );
}

/**
 * Cherche un client Hiboutik par téléphone, ou le crée si non trouvé
 * @deprecated Utiliser findHiboutikClient et createHiboutikClient séparément
 */
export async function findOrCreateHiboutikClient(customerInfo: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  phoneCountryCode: string;
}): Promise<HiboutikClient | null> {
  // Recherche par numéro de téléphone (toutes variantes)
  const client = await searchHiboutikClientByPhone(
    customerInfo.phone,
    customerInfo.phoneCountryCode
  );
  if (client) return client;
  // Sinon, création
  return await createHiboutikClient(customerInfo);
}

export async function updateHiboutikClientIfNeeded(
  client: HiboutikClient,
  customerInfo: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    phoneCountryCode: string;
  }
): Promise<boolean> {
  let updated = false;
  const updates: { customers_attribute: string; new_value: string }[] = [];

  // Mapping Hiboutik : 'first_name', 'last_name', 'email', 'phone'
  if (
    customerInfo.first_name &&
    customerInfo.first_name !== client.customers_first_name &&
    client.customers_first_name !== ""
  ) {
    updates.push({
      customers_attribute: "first_name",
      new_value: customerInfo.first_name,
    });
  }
  if (
    customerInfo.last_name &&
    customerInfo.last_name !== client.customers_last_name &&
    client.customers_last_name !== ""
  ) {
    updates.push({
      customers_attribute: "last_name",
      new_value: customerInfo.last_name,
    });
  }
  if (
    customerInfo.email &&
    customerInfo.email !== client.customers_email &&
    client.customers_email !== ""
  ) {
    updates.push({
      customers_attribute: "email",
      new_value: customerInfo.email,
    });
  }
  const phoneFull = `${
    customerInfo.phoneCountryCode
  } ${customerInfo.phone.replace(/\s+/g, "")}`;
  if (
    phoneFull &&
    phoneFull !== client.customers_phone_number &&
    client.customers_phone_number !== ""
  ) {
    updates.push({
      customers_attribute: "phone",
      new_value: phoneFull,
    });
  }

  for (const update of updates) {
    const response = await fetch(
      `/api/hiboutik/clients/${client.customers_id}/update`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      }
    );
    if (response.ok) {
      updated = true;
    }
  }
  return updated;
}
