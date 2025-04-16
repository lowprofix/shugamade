"use client";

import { Suspense } from "react";
import { Service as ServiceType } from "@/lib/data";
import BookingSectionSkeleton from "@/components/skeletons/BookingSectionSkeleton";
import BookingClientWrapper from "./BookingClientWrapper";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Composant pour les formes décoratives
const DecorativeShape = ({ 
  className, 
  color = "#e2b3f7" 
}: { 
  className: string; 
  color?: string;
}) => (
  <div
    className={cn("absolute rounded-full opacity-20 animate-pulse-slow blur-lg", className)}
    style={{ backgroundColor: color }}
  />
);

interface BookingSectionProps {
  services: ServiceType[];
}

export default function BookingSection({ services }: BookingSectionProps) {
  return (
    <section
      id="booking"
      className="relative py-12 sm:py-16 md:py-24 overflow-hidden"
    >
      {/* Formes décoratives */}
      <DecorativeShape className="w-56 sm:w-72 h-56 sm:h-72 -left-20 top-40" color="#ffb2dd" />
      <DecorativeShape className="w-48 sm:w-64 h-48 sm:h-64 right-10 bottom-20" color="#e2b3f7" />
      <DecorativeShape className="w-32 sm:w-40 h-32 sm:h-40 left-1/3 top-20" color="#bfe0fb" />
      
      <div className="container relative z-10 px-3 sm:px-4 mx-auto">
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 rounded-full bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 border border-[#ffb2dd]/30">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-[#ffb2dd]" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Prenez rendez-vous</span>
          </div>
          
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] bg-clip-text text-transparent font-extrabold">
              Réservez
            </span>{" "}
            votre soin
          </h2>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Choisissez votre service et trouvez un créneau qui vous convient pour commencer votre parcours vers des cheveux plus sains.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<BookingSectionSkeleton />}>
            <BookingClientWrapper services={services} />
          </Suspense>

          {/* Note sur le kit offert */}
          <div className="p-4 sm:p-6 mt-8 sm:mt-12 rounded-lg bg-gradient-to-r from-[#ffb2dd]/10 to-[#e2b3f7]/10 border border-[#ffb2dd]/20">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-0">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 sm:mr-4 rounded-full bg-[#ffb2dd]/20 flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffb2dd]" />
              </div>
              <div>
                <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-medium text-gray-800 dark:text-white">Kit SHUGAMADE offert</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  Pour toute réservation d'un forfait, recevez un kit complet de produits de soins adaptés à votre traitement, incluant spray Coup de pep's, sérum Coup de pousse et derma roller professionnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
