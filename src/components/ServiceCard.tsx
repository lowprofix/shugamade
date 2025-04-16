"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Check } from "lucide-react";
import { Service } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  className?: string;
}

export function ServiceCard({ service, onSelect, className }: ServiceCardProps) {
  // Détermine les classes de couleur en fonction de la propriété color du service
  const getColorClasses = () => {
    switch (service.color) {
      case "pink":
        return {
          badge: "bg-[#ffb2dd]",
          highlight: "from-[#e2b3f7] to-[#ffb2dd]",
          icon: "text-[#e2b3f7]",
          hover: "group-hover:shadow-[#ffb2dd]/20",
        };
      case "teal":
        return {
          badge: "bg-[#9deaff]",
          highlight: "from-[#bfe0fb] to-[#9deaff]",
          icon: "text-[#bfe0fb]",
          hover: "group-hover:shadow-[#9deaff]/20",
        };
      case "brand":
      default:
        return {
          badge: "bg-[#e2b3f7]",
          highlight: "from-[#e2b3f7] to-[#bfe0fb]",
          icon: "text-[#e2b3f7]",
          hover: "group-hover:shadow-[#e2b3f7]/20",
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      {/* Barre de couleur en haut de la carte */}
      <div className={`absolute top-0 left-0 h-1 w-full ${colors.badge}`} />
      
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {service.name}
          </h3>
          
          {service.isPromo && (
            <span className="rounded-full bg-[#ffb2dd]/20 px-2 py-1 text-xs font-medium text-[#ffb2dd]">
              Promo
            </span>
          )}
        </div>
        
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {service.description}
        </p>
        
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full p-1.5 ${colors.icon} bg-opacity-10`}>
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {service.duration}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full p-1.5 ${colors.icon} bg-opacity-10`}>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v14"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-800 dark:text-white">
              {service.price}
            </span>
          </div>
        </div>
        
        {service.includes && service.includes.length > 0 && (
          <div className="mb-5 space-y-2">
            {service.includes.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className={`mt-0.5 h-4 w-4 ${colors.icon}`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <Button
          onClick={() => onSelect(service)}
          className={cn(
            "mt-2 w-full bg-gradient-to-r text-white transition-all",
            colors.highlight,
            colors.hover,
            "hover:scale-[1.02]"
          )}
        >
          Réserver
        </Button>
      </div>
    </Card>
  );
}
