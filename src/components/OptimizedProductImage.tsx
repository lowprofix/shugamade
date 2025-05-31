"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimalImageConfig, isValidImageUrl, generateColorPlaceholder } from "@/lib/imageConfig";

interface OptimizedProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: 25 | 50 | 75 | 90 | 100;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export function OptimizedProductImage({
  src,
  alt,
  className,
  fill = true,
  width,
  height,
  sizes,
  priority = false,
  quality,
  placeholder,
  blurDataURL,
}: OptimizedProductImageProps) {
  const [imageError, setImageError] = useState(!isValidImageUrl(src));
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtenir la configuration optimale
  const optimalConfig = getOptimalImageConfig({
    isPriority: priority,
    quality,
    placeholder,
  });
  
  // Utiliser les valeurs optimales ou les props fournies
  const finalSizes = sizes || optimalConfig.sizes;
  const finalQuality = quality || optimalConfig.quality;
  const finalPlaceholder = placeholder || optimalConfig.placeholder;

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
  }, []);

  if (imageError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
        fill ? "absolute inset-0" : "w-full h-full",
        className
      )}>
        <div className="flex flex-col items-center justify-center text-gray-400">
          <ImageOff className="w-12 h-12 mb-2" />
          <span className="text-xs text-center">Image non disponible</span>
        </div>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: cn(
      "object-cover transition-all duration-700 ease-out",
      isLoading && "opacity-0",
      !isLoading && "opacity-100",
      className
    ),
    sizes: finalSizes,
    quality: finalQuality,
    priority,
    placeholder: finalPlaceholder,
    onLoad: handleImageLoad,
    onError: handleImageError,
    ...(blurDataURL && { blurDataURL }),
    ...(fill ? { fill: true } : { width, height }),
  };

  return (
    <>
      {isLoading && (
        <div className={cn(
          "flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse",
          fill ? "absolute inset-0" : "w-full h-full"
        )}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image {...imageProps} />
    </>
  );
} 