// Configuration pour l'optimisation des images dans Next.js 15
export const imageConfig = {
  // Tailles d'appareils pour la génération de srcset
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  
  // Tailles d'images pour les images responsives
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Formats d'images supportés (ordre de préférence)
  formats: ['image/webp', 'image/avif'] as const,
  
  // Qualités d'images autorisées
  qualities: [25, 50, 75, 90, 100] as const,
  
  // TTL minimum pour le cache (en secondes)
  minimumCacheTTL: 60,
  
  // Configuration par défaut pour les images de produits
  productImageDefaults: {
    quality: 75 as const,
    placeholder: 'empty' as const,
    loading: 'lazy' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  
  // Configuration pour les images prioritaires (above the fold)
  priorityImageDefaults: {
    quality: 75 as const,
    placeholder: 'empty' as const,
    loading: 'eager' as const,
    priority: true,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  
  // Timeout pour les images externes (en millisecondes)
  imageTimeout: 10000,
  
  // Retry configuration
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
} as const;

// Types pour TypeScript
export type ImageQuality = typeof imageConfig.qualities[number];
export type ImageFormat = typeof imageConfig.formats[number];
export type ImagePlaceholder = 'blur' | 'empty';
export type ImageLoading = 'lazy' | 'eager';

// Fonction utilitaire pour obtenir la configuration d'image optimale
export function getOptimalImageConfig(options: {
  isPriority?: boolean;
  quality?: ImageQuality;
  placeholder?: ImagePlaceholder;
}) {
  const { isPriority = false, quality, placeholder } = options;
  
  const baseConfig = isPriority 
    ? imageConfig.priorityImageDefaults 
    : imageConfig.productImageDefaults;
    
  return {
    ...baseConfig,
    ...(quality && { quality }),
    ...(placeholder && { placeholder }),
  };
}

// Fonction pour valider les URLs d'images
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
}

// Fonction pour générer un placeholder de couleur
export function generateColorPlaceholder(color: string = '#f3f4f6'): string {
  // Génère un placeholder SVG avec une couleur de fond
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
} 