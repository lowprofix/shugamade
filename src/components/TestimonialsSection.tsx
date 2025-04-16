"use client";

import React from "react";
import { TestimonialCard } from "@/components/TestimonialCard";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Testimonial, testimonials } from "@/lib/data";
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

export default function TestimonialsSection() {
  // Dupliquer les témoignages pour avoir suffisamment d'éléments
  const extendedTestimonials = [...testimonials];
  if (testimonials.length < 5) {
    // Ajouter des copies si nous n'avons pas assez de témoignages
    extendedTestimonials.push(...testimonials);
  }
  
  // Créer les cartes pour le carrousel
  const testimonialCards = extendedTestimonials.map((testimonial) => (
    <TestimonialCard 
      key={`moving-${testimonial.id}`} 
      testimonial={testimonial} 
      variant="moving"
    />
  ));
  
  // Créer un deuxième ensemble de témoignages pour la deuxième rangée
  // Inverser l'ordre pour plus de variété
  const secondRowTestimonials = [...extendedTestimonials].reverse();
  const secondRowCards = secondRowTestimonials.map((testimonial) => (
    <TestimonialCard 
      key={`moving-second-${testimonial.id}`} 
      testimonial={testimonial} 
      variant="moving"
    />
  ));

  return (
    <section id="testimonials" className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Formes décoratives - positions ajustées pour ne pas toucher les bords */}
      <DecorativeShape className="w-48 sm:w-72 h-48 sm:h-72 left-5 sm:left-10 top-20" color="#ffb2dd" />
      <DecorativeShape className="w-48 sm:w-64 h-48 sm:h-64 right-5 sm:right-10 bottom-40" color="#e2b3f7" />
      <DecorativeShape className="w-32 sm:w-40 h-32 sm:h-40 left-1/3 bottom-20" color="#bfe0fb" />
      
      <div className="container relative z-10 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 rounded-full bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 border border-[#ffb2dd]/30">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-[#ffb2dd]" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Ils nous font confiance</span>
          </div>
          
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Ce que disent{" "}
            <span className="bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] bg-clip-text text-transparent font-extrabold">
              nos clients
            </span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Découvrez les résultats et l'expérience de nos clients satisfaits qui ont bénéficié de nos traitements capillaires naturels.
          </p>
        </div>
        
        {/* Carrousel de témoignages - première rangée */}
        <div className="mb-6 sm:mb-8">
          <InfiniteMovingCards
            items={testimonialCards}
            direction="left"
            speed="slow"
            pauseOnHover={true}
          />
        </div>
                
        {/* Note d'information */}
        <div className="mt-8 sm:mt-12 text-center px-2">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Ces témoignages sont de vrais avis de nos clients. Les résultats peuvent varier d'une personne à l'autre.
          </p>
        </div>
      </div>
    </section>
  );
}
