"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface DotBackgroundProps {
  children?: ReactNode;
  className?: string;
  dotSize?: number; // Taille des points en pixels
  dotOpacity?: number; // Opacité des points (0-1)
  fadeCenter?: boolean; // Activer/désactiver l'effet de fondu au centre
}

export function DotBackground({
  children,
  className,
  dotSize = 20,
  dotOpacity = 0.3,
  fadeCenter = true,
}: DotBackgroundProps) {
  return (
    <div className={cn(
      "relative w-full overflow-hidden bg-white dark:bg-black",
      className
    )}>
      {/* Dégradé de fond */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e2b3f7]/20 via-[#bfe0fb]/20 to-[#ffb2dd]/20 dark:from-[#e2b3f7]/15 dark:via-[#bfe0fb]/15 dark:to-[#ffb2dd]/15" />
      
      {/* Motif de points - couleur violette #e2b3f7 */}
      <div
        className={cn(
          "absolute inset-0",
          `[background-size:${dotSize}px_${dotSize}px]`,
          `[background-image:radial-gradient(rgba(226,179,247,${dotOpacity})_1px,transparent_1px)]`,
          `dark:[background-image:radial-gradient(rgba(226,179,247,${dotOpacity+0.1})_1px,transparent_1px)]`,
        )}
      />
      
      {/* Deuxième couche de points - couleur bleue #bfe0fb */}
      <div
        className={cn(
          "absolute inset-0",
          `[background-size:${dotSize}px_${dotSize}px]`,
          `[background-position:${dotSize/2}px_${dotSize/2}px]`,
          `[background-image:radial-gradient(rgba(191,224,251,${dotOpacity})_1px,transparent_1px)]`,
          `dark:[background-image:radial-gradient(rgba(191,224,251,${dotOpacity+0.1})_1px,transparent_1px)]`,
        )}
      />
      
      {/* Troisième couche de points - couleur rose #ffb2dd */}
      <div
        className={cn(
          "absolute inset-0",
          `[background-size:${dotSize*1.5}px_${dotSize*1.5}px]`,
          `[background-image:radial-gradient(rgba(255,178,221,${dotOpacity})_1px,transparent_1px)]`,
          `dark:[background-image:radial-gradient(rgba(255,178,221,${dotOpacity+0.1})_1px,transparent_1px)]`,
        )}
      />
      
      {/* Quatrième couche de points - couleur cyan #9deaff */}
      <div
        className={cn(
          "absolute inset-0",
          `[background-size:${dotSize*2}px_${dotSize*2}px]`,
          `[background-position:${dotSize}px_${dotSize}px]`,
          `[background-image:radial-gradient(rgba(157,234,255,${dotOpacity})_1px,transparent_1px)]`,
          `dark:[background-image:radial-gradient(rgba(157,234,255,${dotOpacity+0.1})_1px,transparent_1px)]`,
        )}
      />
      
      {/* Effet de fondu au centre (optionnel) */}
      {fadeCenter && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] dark:bg-black"></div>
      )}
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
