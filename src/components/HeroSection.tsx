"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  scrollToSection: (sectionId: string) => void;
}

// Composant pour les badges flottants
const FloatingBadge = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className: string;
}) => (
  <div className={cn(
    "absolute px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm dark:bg-gray-950/90 border-2 border-[#bfe0fb] dark:border-[#e2b3f7] shadow-lg shadow-[#bfe0fb]/20 dark:shadow-[#e2b3f7]/20 flex items-center gap-1.5 text-sm font-medium animate-float",
    className
  )}>
    {children}
  </div>
);

// Composant pour les formes décoratives
const DecorativeShape = ({ 
  className, 
  color = "#e2b3f7" 
}: { 
  className: string; 
  color?: string;
}) => (
  <div
    className={cn("absolute rounded-full opacity-30 animate-pulse-slow blur-xl", className)}
    style={{ backgroundColor: color }}
  />
);

export default function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-[calc(100vh-4rem)] flex items-center pt-10 sm:pt-16 pb-6 sm:pb-10 overflow-hidden">
      {/* Formes décoratives - positions ajustées pour ne pas toucher les bords */}
      <DecorativeShape className="w-48 sm:w-64 h-48 sm:h-64 left-5 sm:left-10 top-20" color="#e2b3f7" />
      <DecorativeShape className="w-64 sm:w-96 h-64 sm:h-96 right-5 sm:right-10 bottom-10" color="#bfe0fb" />
      <DecorativeShape className="w-32 sm:w-40 h-32 sm:h-40 right-1/4 top-10" color="#ffb2dd" />
      
      <div className="container relative z-10 px-3 sm:px-4">
        <div className="grid items-center grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2">
          {/* Colonne de gauche - Contenu textuel */}
          <div className="relative animate-fade-in text-center lg:text-left">
            <span className="inline-block px-2.5 sm:px-3 py-1 mb-2 text-xs sm:text-sm font-medium rounded-full bg-gradient-to-r from-[#bfe0fb]/30 to-[#ffb2dd]/30 text-[#bb81d7] dark:text-[#89b6da] dark:from-[#e2b3f7]/40 dark:to-[#ffb2dd]/40 border border-[#e2b3f7]/50 shadow-sm">
              Spécialiste des traitements capillaires naturels
            </span>
            
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] bg-clip-text text-transparent font-extrabold">Révélez</span> la beauté de vos{" "}
              <span className="relative">
                cheveux
                <svg className="absolute bottom-0 left-0 w-full h-2 sm:h-3 -z-10" viewBox="0 0 200 8">
                  <path 
                    d="M0 4C40 0 60 8 200 4" 
                    fill="none" 
                    stroke="#ffb2dd" 
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            
            <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-700 dark:text-gray-200 font-medium mx-auto lg:mx-0 max-w-lg">
              Nous prenons en charge toutes les formes d'alopécie (traction, androgénétique, cicatricielle…) et problèmes capillaires avec des soins 100% naturels et personnalisés pour des résultats visibles et durables.
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
              <Button
                onClick={() => scrollToSection("booking")}
                className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] text-white hover:shadow-lg hover:shadow-[#e2b3f7]/20 hover:scale-105 transition-all font-semibold border-none text-sm sm:text-base h-auto py-2 sm:py-2.5"
                size="default"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Prendre rendez-vous
              </Button>
              
              <Button
                onClick={() => scrollToSection("services")}
                variant="outline"
                className="border-2 border-[#bfe0fb] dark:border-[#e2b3f7] hover:bg-gradient-to-r hover:from-[#bfe0fb]/20 hover:to-[#9deaff]/20 hover:scale-105 transition-all font-semibold text-gray-800 dark:text-white text-sm sm:text-base h-auto py-2 sm:py-2.5"
                size="default"
              >
                Découvrir nos services
              </Button>
            </div>
            
            {/* Badges de confiance */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mt-6 sm:mt-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#9deaff] drop-shadow-sm" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">100% Naturel</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#9deaff] drop-shadow-sm" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Diagnostic personnalisé</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#9deaff] drop-shadow-sm" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Résultats prouvés</span>
              </div>
            </div>
          </div>
          
          {/* Colonne de droite - Visuel */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in-up mt-4 sm:mt-0">
            <Card className="relative overflow-hidden border-none shadow-2xl w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#e2b3f7]/40 via-white to-[#bfe0fb]/40 dark:from-[#e2b3f7]/30 dark:via-gray-900 dark:to-[#bfe0fb]/30 hover:shadow-[0_0_30px_rgba(226,179,247,0.4)] transition-shadow duration-500">
              {/* Effet de brillance sur le contour */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-[#e2b3f7]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 animate-[shine-effect_3s_infinite_linear]" />
              
              <div className="absolute inset-0.5 rounded-[18px] sm:rounded-[22px] overflow-hidden">
                {/* Conteneur avec animation */}
                <div className="relative w-full h-full animate-[float-rotate_8s_ease-in-out_infinite]">
                  <Image
                    src="/images/hero-bg.jpg"
                    alt="Traitement capillaire naturel"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover animate-[subtle-zoom_15s_ease-in-out_infinite] hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </div>
              </div>
            </Card>
            
            {/* Badges flottants */}
            <FloatingBadge className="-left-4 sm:-left-6 top-1/4 animate-delay-300">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#e2b3f7] drop-shadow-sm" />
              <span className="text-xs sm:text-sm text-gray-800 dark:text-white">100% Naturel</span>
            </FloatingBadge>
            
            <FloatingBadge className="-right-3 sm:-right-4 bottom-1/4 animate-delay-500">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffb2dd] drop-shadow-sm" />
              <span className="text-xs sm:text-sm text-gray-800 dark:text-white">Personnalisé</span>
            </FloatingBadge>
            
            <FloatingBadge className="left-1/4 -bottom-2 sm:-bottom-3 animate-delay-700">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#9deaff] drop-shadow-sm" />
              <span className="text-xs sm:text-sm text-gray-800 dark:text-white">Résultats visibles</span>
            </FloatingBadge>
          </div>
        </div>
      </div>
    </section>
  );
}
