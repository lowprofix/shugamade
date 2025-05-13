import { createClient } from "@supabase/supabase-js";

// Créer un client Supabase utilisant les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Vérifier les variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Les variables d'environnement Supabase sont manquantes");
}

// Exporter le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
