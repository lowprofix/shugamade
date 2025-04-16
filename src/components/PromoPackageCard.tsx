"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Award, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PackageOption {
  name: string;
  price: string;
  sessions: number;
}

interface PromoPackageCardProps {
  id: number;
  name: string;
  options: PackageOption[];
  benefits: string[];
  isRecommended?: boolean;
  color: "teal" | "pink" | "brand";
  onSelect: (packageId: number, option: PackageOption) => void;
  className?: string;
}

export function PromoPackageCard({
  id,
  name,
  options,
  benefits,
  isRecommended = false,
  color,
  onSelect,
  className,
}: PromoPackageCardProps) {
  const [selectedOption, setSelectedOption] = useState<PackageOption>(options[0]);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  // Détermine les classes de couleur en fonction de la propriété color
  const getColorClasses = () => {
    switch (color) {
      case "pink":
        return {
          badge: "bg-[#ffb2dd]",
          highlight: "from-[#e2b3f7] to-[#ffb2dd]",
          border: "border-[#ffb2dd]",
          text: "text-[#e2b3f7]",
          hover: "group-hover:shadow-[#ffb2dd]/20",
          bgLight: "bg-[#ffb2dd]/10",
        };
      case "teal":
        return {
          badge: "bg-[#9deaff]",
          highlight: "from-[#bfe0fb] to-[#9deaff]",
          border: "border-[#bfe0fb]",
          text: "text-[#bfe0fb]",
          hover: "group-hover:shadow-[#9deaff]/20",
          bgLight: "bg-[#9deaff]/10",
        };
      case "brand":
      default:
        return {
          badge: "bg-[#e2b3f7]",
          highlight: "from-[#e2b3f7] to-[#bfe0fb]",
          border: "border-[#e2b3f7]",
          text: "text-[#e2b3f7]",
          hover: "group-hover:shadow-[#e2b3f7]/20",
          bgLight: "bg-[#e2b3f7]/10",
        };
    }
  };

  const colors = getColorClasses();
  
  // Limite le nombre de bénéfices affichés si showAllBenefits est false
  const displayedBenefits = showAllBenefits 
    ? benefits 
    : benefits.slice(0, 3);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      {/* Badge "Recommandé" si applicable */}
      {isRecommended && (
        <div className="absolute -right-12 top-7 z-10 w-40 rotate-45 bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] py-1 text-center text-xs font-bold text-white shadow-md">
          RECOMMANDÉ
        </div>
      )}

      {/* Barre de couleur en haut de la carte */}
      <div className={`absolute top-0 left-0 h-2 w-full ${colors.badge}`} />

      <div className="p-6">
        <div className="mb-4 flex items-center gap-2">
          {isRecommended && (
            <Award className="h-5 w-5 text-[#ffb2dd]" />
          )}
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {name}
          </h3>
        </div>

        {/* Sélecteur d'options */}
        <div className="mb-6 space-y-3">
          {options.map((option) => (
            <div
              key={option.name}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all",
                selectedOption.name === option.name
                  ? `${colors.border} ${colors.bgLight}`
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              )}
              onClick={() => setSelectedOption(option)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    selectedOption.name === option.name
                      ? `${colors.border} ${colors.bgLight}`
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {selectedOption.name === option.name && (
                    <div
                      className={`h-3 w-3 rounded-full ${colors.badge}`}
                    />
                  )}
                </div>
                <span className="font-medium">
                  {option.name} ({option.sessions} séances)
                </span>
              </div>
              <span className="font-semibold">{option.price}</span>
            </div>
          ))}
        </div>

        {/* Liste des avantages */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium text-gray-700 dark:text-gray-200">
            Ce forfait inclut :
          </h4>
          <div className="space-y-2">
            {displayedBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className={`mt-0.5 h-4 w-4 ${colors.text}`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {benefit}
                </span>
              </div>
            ))}
            
            {benefits.length > 3 && (
              <button
                onClick={() => setShowAllBenefits(!showAllBenefits)}
                className={`mt-1 flex items-center gap-1 text-sm ${colors.text}`}
              >
                {showAllBenefits ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir plus ({benefits.length - 3})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bouton de réservation */}
        <Button
          onClick={() => onSelect(id, selectedOption)}
          className={cn(
            "w-full bg-gradient-to-r text-white transition-all",
            colors.highlight,
            colors.hover,
            "hover:scale-[1.02]"
          )}
        >
          Réserver ce forfait
        </Button>
      </div>
    </Card>
  );
}
