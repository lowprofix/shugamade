"use client";

import React, { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { PromoPackageCard, PackageOption } from "@/components/PromoPackageCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Microscope,
  Zap,
  Droplets,
  Package,
  ChevronRight,
  Info,
} from "lucide-react";
import { Service, PromoPackage, services, promoPackages } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ServicesSectionProps {
  scrollToSection: (sectionId: string) => void;
}

// Composant pour les formes décoratives
const DecorativeShape = ({
  className,
  color = "#e2b3f7",
}: {
  className: string;
  color?: string;
}) => (
  <div
    className={cn(
      "absolute rounded-full opacity-20 animate-pulse-slow blur-lg",
      className
    )}
    style={{ backgroundColor: color }}
  />
);

// Composant pour les onglets de catégorie
const CategoryTab = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all text-sm sm:text-base",
      isActive
        ? "bg-gradient-to-r from-[#e2b3f7]/20 to-[#bfe0fb]/20 text-gray-800 dark:text-white border border-[#e2b3f7]/30"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      className
    )}
  >
    <Icon
      className={cn(
        "w-3.5 h-3.5 sm:w-4 sm:h-4",
        isActive ? "text-[#e2b3f7]" : "text-gray-400"
      )}
    />
    <span className={isActive ? "font-medium" : ""}>{label}</span>
  </button>
);

export default function ServicesSection({
  scrollToSection,
}: ServicesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showPromoPackages, setShowPromoPackages] = useState<boolean>(false);

  // Filtrer les services par catégorie
  const getFilteredServices = () => {
    if (activeCategory === "all") {
      return services;
    }

    switch (activeCategory) {
      case "diagnostic":
        return services.filter((service) =>
          service.name.toLowerCase().includes("diagnostic")
        );
      case "hairneedling":
        return services.filter((service) =>
          service.name.toLowerCase().includes("hairneedling")
        );
      case "boost":
        return services.filter(
          (service) =>
            service.name.toLowerCase().includes("électrothérapie") ||
            service.name.toLowerCase().includes("luminothérapie") ||
            service.name.toLowerCase().includes("massage") ||
            service.name.toLowerCase().includes("boost")
        );
      default:
        return services;
    }
  };

  // Fonction pour sélectionner un service
  const selectService = (service: Service) => {
    console.log("Service selected:", service);
    scrollToSection("booking");
  };

  // Fonction pour sélectionner un forfait promotionnel
  const selectPromoPackage = (packageId: number, option: PackageOption) => {
    console.log("Promo package selected:", { packageId, option });
    scrollToSection("booking");
  };

  return (
    <section id="services" className="relative py-24 overflow-hidden">
      {/* Formes décoratives - positions ajustées pour ne pas toucher les bords */}
      <DecorativeShape className="w-80 h-80 left-10 top-40" color="#ffb2dd" />
      <DecorativeShape
        className="w-64 h-64 right-10 bottom-96"
        color="#bfe0fb"
      />
      <DecorativeShape
        className="w-40 h-40 left-1/3 bottom-20"
        color="#9deaff"
      />

      <div className="container relative z-10 px-2">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-gradient-to-r from-[#bfe0fb]/20 to-[#9deaff]/20 border border-[#bfe0fb]/30">
            <Sparkles className="w-4 h-4 mr-2 text-[#bfe0fb]" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Nos solutions capillaires
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Des{" "}
            <span className="bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] bg-clip-text text-transparent font-extrabold">
              soins
            </span>{" "}
            adaptés à vos{" "}
            <span className="relative">
              besoins
              <svg
                className="absolute bottom-0 left-0 w-full h-3 -z-10"
                viewBox="0 0 200 8"
              >
                <path
                  d="M0 4C40 0 60 8 200 4"
                  fill="none"
                  stroke="#ffb2dd"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Des soins personnalisés pour traiter efficacement l'alopécie de
            traction avec des produits 100% naturels et des techniques avancées
            pour des résultats visibles.
          </p>
        </div>

        {/* Onglets de navigation - optimisés pour mobile */}
        <div className="relative mb-12 px-1 sm:px-0">
          <div className="flex overflow-x-auto pb-3 scrollbar-hide md:overflow-visible md:flex-wrap md:justify-center gap-2 md:gap-3">
            <CategoryTab
              icon={Sparkles}
              label="Tous les services"
              isActive={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              className="flex-shrink-0"
            />
            <CategoryTab
              icon={Microscope}
              label="Diagnostic"
              isActive={activeCategory === "diagnostic"}
              onClick={() => setActiveCategory("diagnostic")}
              className="flex-shrink-0"
            />
            <CategoryTab
              icon={Droplets}
              label="Hairneedling"
              isActive={activeCategory === "hairneedling"}
              onClick={() => setActiveCategory("hairneedling")}
              className="flex-shrink-0"
            />
            <CategoryTab
              icon={Zap}
              label="Boost"
              isActive={activeCategory === "boost"}
              onClick={() => setActiveCategory("boost")}
              className="flex-shrink-0"
            />
            <CategoryTab
              icon={Package}
              label="Forfaits"
              isActive={showPromoPackages}
              onClick={() => setShowPromoPackages(!showPromoPackages)}
              className="flex-shrink-0"
            />
          </div>
          {/* Indicateur de défilement sur mobile */}
          <div className="mt-2 flex justify-center md:hidden">
            <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Services individuels */}
        {!showPromoPackages && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredServices().map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={selectService}
                className="animate-fade-in"
              />
            ))}
          </div>
        )}

        {/* Forfaits promotionnels */}
        {showPromoPackages && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {promoPackages.map((promoPackage) => (
                <PromoPackageCard
                  key={promoPackage.id}
                  id={promoPackage.id}
                  name={promoPackage.name}
                  options={promoPackage.options}
                  benefits={promoPackage.benefits}
                  isRecommended={promoPackage.isRecommended}
                  color={promoPackage.color}
                  onSelect={selectPromoPackage}
                  className="animate-fade-in"
                />
              ))}
            </div>

            <Card className="p-4 border-none bg-gradient-to-r from-[#e2b3f7]/5 to-[#bfe0fb]/5 shadow-md">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 w-5 h-5 text-[#e2b3f7]" />
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-medium">Information importante :</span>{" "}
                  Il est recommandé de réaliser 4 à 6 séances (1 séance toutes
                  les deux semaines pendant 2 à 3 mois). Des séances d'entretien
                  peuvent être proposées pour maintenir les résultats.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Bouton pour voir tous les services ou forfaits */}
        <div className="mt-12 text-center">
          <Button
            onClick={() =>
              showPromoPackages
                ? setShowPromoPackages(false)
                : setShowPromoPackages(true)
            }
            variant="outline"
            className="border-[#bfe0fb] dark:border-[#e2b3f7] hover:bg-[#bfe0fb]/10 dark:hover:bg-[#e2b3f7]/10"
          >
            {showPromoPackages
              ? "Voir tous les services"
              : "Voir les forfaits promotionnels"}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Note d'information */}
        <div className="mt-20 max-w-3xl mx-auto">
          <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-[#e2b3f7]/10 via-white to-[#bfe0fb]/10 dark:from-[#e2b3f7]/5 dark:via-gray-900 dark:to-[#bfe0fb]/5">
            <h3 className="mb-4 text-xl font-semibold text-center">
              Pour des résultats optimaux
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#e2b3f7]/10">
                  <Sparkles className="w-4 h-4 text-[#e2b3f7]" />
                </div>
                <p className="text-gray-700 dark:text-gray-200">
                  Nos protocoles sont conçus pour traiter efficacement
                  l'alopécie et les problèmes capillaires avec une approche 100%
                  naturelle.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#bfe0fb]/10">
                  <Sparkles className="w-4 h-4 text-[#bfe0fb]" />
                </div>
                <p className="text-gray-700 dark:text-gray-200">
                  Pour des résultats visibles et durables, nous recommandons un
                  traitement complet de 4 à 6 séances, espacées de deux
                  semaines.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#ffb2dd]/10">
                  <Sparkles className="w-4 h-4 text-[#ffb2dd]" />
                </div>
                <p className="text-gray-700 dark:text-gray-200">
                  Chaque traitement est personnalisé en fonction de votre
                  diagnostic capillaire et adapté à l'évolution de vos
                  résultats.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={() => scrollToSection("booking")}
                className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] text-white hover:shadow-lg hover:shadow-[#e2b3f7]/20 hover:scale-105 transition-all font-semibold"
              >
                Prendre rendez-vous
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
