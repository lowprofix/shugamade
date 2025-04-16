"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Testimonial } from "@/lib/data";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: "default" | "moving";
  className?: string;
}

export function TestimonialCard({ 
  testimonial, 
  variant = "default",
  className 
}: TestimonialCardProps) {
  // Générer les étoiles en fonction de la note
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={cn(
          "w-3 h-3 sm:w-4 sm:h-4",
          index < rating 
            ? "text-[#ffb2dd] fill-[#ffb2dd]" 
            : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-lg",
        variant === "moving" ? "h-full bg-white dark:bg-gray-900" : "p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
        className
      )}
    >
      {/* Barre de couleur en haut de la carte */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]" />
      
      <div className={cn(
        variant === "moving" ? "p-3 sm:p-5" : ""
      )}>
        {/* Note en étoiles */}
        <div className="flex mb-2 sm:mb-3">
          {renderStars(testimonial.rating)}
        </div>
        
        {/* Texte du témoignage */}
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 italic line-clamp-4 sm:line-clamp-none">
          "{testimonial.text}"
        </p>
        
        {/* Informations du client */}
        <div className="flex items-center mt-auto">
          {testimonial.image ? (
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 overflow-hidden rounded-full bg-gray-100">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-full bg-gradient-to-br from-[#bfe0fb] to-[#9deaff]">
              <span className="text-white text-sm sm:text-base font-semibold">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
              {testimonial.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Client satisfait
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
