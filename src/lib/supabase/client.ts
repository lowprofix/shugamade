import { createClient } from "@supabase/supabase-js";
import { appConfig, validateConfig } from "@/lib/config";

// Valider la configuration au démarrage
const configValidation = validateConfig();
if (!configValidation.isValid) {
  console.error("Configuration Supabase invalide:", configValidation.errors);
}

// Créer le client Supabase avec la configuration centralisée
export const supabase = createClient(
  appConfig.supabase.url,
  appConfig.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Fonction utilitaire pour obtenir l'URL publique d'un fichier
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Fonction pour uploader un fichier
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
) {
  return await supabase.storage
    .from(bucket)
    .upload(path, file, options);
}

// Fonction pour supprimer un fichier
export async function deleteFile(bucket: string, path: string) {
  return await supabase.storage
    .from(bucket)
    .remove([path]);
}
