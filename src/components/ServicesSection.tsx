"use client";

import { PromoPackageCard } from "@/components/PromoPackageCard";
import { ServiceCard } from "@/components/ServiceCard";

import { Service, promoPackages, services } from "@/lib/data";
import { useState } from "react";

interface ServicesSectionProps {
  scrollToBooking?: () => void;
}

export default function ServicesSection({
  scrollToBooking,
}: ServicesSectionProps) {
  const [activeTab, setActiveTab] = useState("services");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handlePackageSelect = () => {
    // Logique pour sélectionner un forfait
    console.log("Package selected");
    if (scrollToBooking) scrollToBooking();
  };

  // Fonction pour sélectionner un service
  const selectService = (service: Service) => {
    // Logique pour sélectionner un service
    console.log("Service selected", service);
    if (scrollToBooking) scrollToBooking();
  };

  // Fonction pour sélectionner un forfait promotionnel
  const selectPromoPackage = (
    packageId: number,
    option: { name: string; price: string }
  ) => {
    // Logique pour sélectionner un forfait promotionnel
    console.log("Promo package selected", { packageId, option });
    if (scrollToBooking) scrollToBooking();
  };

  return (
    <section id="services" className="py-12 bg-white relative">
      {/* Étoiles décoratives */}
      <div className="absolute top-10 left-10 hidden md:block"></div>
      <div className="absolute bottom-20 right-10 hidden md:block"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          {/* Étoile au-dessus du titre */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2"></div>

          <h2 className="text-3xl font-light text-gray-800">
            <span className="text-teal-400">Nos</span>{" "}
            <span className="text-pink-400">services</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Des soins personalisés pour traiter efficacement l'alopécie de
            traction avec des produits 100% naturels
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={selectService}
            />
          ))}
        </div>

        {/* Promo Packages */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-light text-gray-800">
              <span className="text-pink-400">Forfaits</span>{" "}
              <span className="text-teal-400">promotionnels</span>
            </h3>
            <p className="mt-2 text-gray-600">
              Des packages complets pour des résultats optimaux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
            ))}
          </div>

          <div className="mt-8 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-medium">Information importante :</span> Il
              est recommandé de réaliser 4 à 6 séances (1 séance toutes les deux
              semaines pendant 2 à 3 mois). Des séances d'entretien peuvent être
              proposées pour maintenir les résultats.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
