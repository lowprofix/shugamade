import { appConfig, getSupabaseImageUrl } from "@/lib/config";
import { getPublicUrl } from "@/lib/supabase/client";

/**
 * Interface pour les propriétés d'image optimisée
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  loading?: "lazy" | "eager";
  sizes?: string;
  className?: string;
}

/**
 * Normalise une URL d'image pour s'assurer qu'elle utilise le bon format Supabase
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return "";
  }

  // Si l'URL est déjà complète, la retourner telle quelle
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // Si c'est juste un nom de fichier, construire l'URL complète
  if (!imageUrl.includes("/")) {
    return getSupabaseImageUrl(imageUrl);
  }

  // Si c'est un chemin relatif, construire l'URL complète
  return getSupabaseImageUrl(imageUrl);
}

/**
 * Génère les propriétés optimisées pour une image de produit
 */
export function getProductImageProps(
  imageUrl: string | null | undefined,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const normalizedUrl = normalizeImageUrl(imageUrl);
  
  return {
    src: normalizedUrl || "/images/placeholder-product.svg",
    alt,
    width: options.width || 400,
    height: options.height || 400,
    quality: options.quality || appConfig.images.defaults.quality,
    priority: options.priority || false,
    placeholder: options.placeholder || appConfig.images.defaults.placeholder,
    loading: options.loading || appConfig.images.defaults.loading,
    sizes: options.sizes || appConfig.images.defaults.sizes,
    className: options.className || "",
  };
}

/**
 * Génère les propriétés pour une image prioritaire (above the fold)
 */
export function getPriorityImageProps(
  imageUrl: string | null | undefined,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  return getProductImageProps(imageUrl, alt, {
    ...options,
    priority: true,
    loading: "eager",
    quality: appConfig.images.priority.quality,
  });
}

/**
 * Extrait le nom de fichier depuis une URL d'image
 */
export function extractFilenameFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];
    
    // Supprimer les paramètres de requête s'il y en a
    return filename.split("?")[0];
  } catch (error) {
    console.error("Erreur lors de l'extraction du nom de fichier:", error);
    return null;
  }
}

/**
 * Valide si une URL d'image est valide
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère un placeholder SVG pour les images en cours de chargement
 */
export function generateImagePlaceholder(
  width: number = 400,
  height: number = 400,
  color: string = "#f3f4f6"
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        Chargement...
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
} 