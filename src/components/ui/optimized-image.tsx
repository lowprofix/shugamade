"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  getProductImageProps, 
  generateImagePlaceholder,
  type OptimizedImageProps 
} from "@/lib/imageUtils";

interface OptimizedImageComponentProps extends Partial<OptimizedImageProps> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  style?: React.CSSProperties;
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  quality = 75,
  priority = false,
  placeholder = "empty",
  loading = "lazy",
  sizes,
  className,
  fallbackSrc = "/images/placeholder-product.jpg",
  onError,
  onLoad,
  style,
  ...props
}: OptimizedImageComponentProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`Erreur de chargement d'image: ${imageSrc}`);
    setHasError(true);
    setIsLoading(false);
    
    // Essayer le fallback si ce n'est pas déjà le fallback
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    }
    
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Générer les propriétés optimisées
  const imageProps = getProductImageProps(imageSrc, alt, {
    width,
    height,
    quality,
    priority,
    placeholder,
    loading,
    sizes,
  });

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <span className="text-gray-400 text-sm">Chargement...</span>
        </div>
      )}
      
      <Image
        {...imageProps}
        {...props}
        src={imageSrc}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50",
          className
        )}
        style={{
          objectFit: "cover",
          ...style,
        }}
      />
      
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg 
              className="w-8 h-8 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant spécialisé pour les images de produits
export function ProductImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageComponentProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={400}
      className={cn("rounded-lg", className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}

// Composant pour les images prioritaires (hero, above the fold)
export function PriorityImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageComponentProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      loading="eager"
      quality={90}
      className={className}
      {...props}
    />
  );
} 