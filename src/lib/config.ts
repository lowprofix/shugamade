// Configuration centralisée de l'application
export const appConfig = {
  // Configuration Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    storage: {
      bucketName: "products",
      baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
        : "",
    },
  },

  // Configuration des images
  images: {
    // Domaines autorisés pour les images
    domains: [
      "gktuvdoqpexlorlmgpox.supabase.co",
    ],
    
    // Patterns d'URLs autorisés
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "gktuvdoqpexlorlmgpox.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    
    // Configuration d'optimisation
    optimization: {
      minimumCacheTTL: 60,
      formats: ["image/webp", "image/avif"] as const,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      dangerouslyAllowSVG: false,
      contentDispositionType: "attachment" as const,
    },
    
    // Configuration par défaut pour les images de produits
    defaults: {
      quality: 75,
      placeholder: "empty" as const,
      loading: "lazy" as const,
      sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    },
    
    // Configuration pour les images prioritaires
    priority: {
      quality: 75,
      placeholder: "empty" as const,
      loading: "eager" as const,
      priority: true,
      sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    },
  },

  // Configuration API
  api: {
    hiboutik: {
      baseUrl: process.env.HIBOUTIK_BASE_URL || "",
      login: process.env.HIBOUTIK_API_LOGIN || "",
      key: process.env.HIBOUTIK_API_KEY || "",
    },
    timeout: 10000,
    retries: 3,
  },

  // Configuration de l'application
  app: {
    name: "Shugamade",
    description: "Plateforme de beauté et bien-être",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;

// Fonction utilitaire pour construire les URLs d'images Supabase
export function getSupabaseImageUrl(filename: string, bucket: string = "products"): string {
  if (!appConfig.supabase.url) {
    console.warn("URL Supabase non configurée");
    return "";
  }
  
  // Nettoyer le nom de fichier
  const cleanFilename = filename.startsWith("/") ? filename.slice(1) : filename;
  
  return `${appConfig.supabase.storage.baseUrl}/${bucket}/${cleanFilename}`;
}

// Fonction pour valider la configuration
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!appConfig.supabase.url) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL manquant");
  }
  
  if (!appConfig.supabase.anonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY manquant");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Types pour TypeScript
export type ImageConfig = typeof appConfig.images;
export type SupabaseConfig = typeof appConfig.supabase;
export type ApiConfig = typeof appConfig.api; 