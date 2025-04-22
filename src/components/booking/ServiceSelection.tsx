"use client";

import { useState } from "react";
import { Service as ServiceType } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Clock,
  ArrowRight,
  Info,
  Search,
  Tag,
  Plus,
  Trash2,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types d'incompatibilité
type IncompatibilityReason = "promo" | "sameDuration" | "sameCategory";

interface ServiceSelectionProps {
  services: ServiceType[];
  onConfirmSelection: (services: ServiceType[]) => void;
}

export default function ServiceSelection({
  services,
  onConfirmSelection,
}: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [incompatibilityWarning, setIncompatibilityWarning] = useState<
    string | null
  >(null);

  // Fonction pour vérifier si un service est compatible avec les services déjà sélectionnés
  const checkServiceCompatibility = (
    service: ServiceType
  ): { compatible: boolean; reason?: IncompatibilityReason } => {
    // Si aucun service n'est sélectionné, tout service est compatible
    if (selectedServices.length === 0) {
      return { compatible: true };
    }

    // Règle 1: Les forfaits promo ne peuvent pas être combinés avec d'autres services
    const hasPromo = selectedServices.some((s) => s.isPromo);
    if (hasPromo || service.isPromo) {
      return { compatible: false, reason: "promo" };
    }

    // Règle 2: Ne pas permettre d'ajouter deux fois le même service
    if (selectedServices.some((s) => s.id === service.id)) {
      return { compatible: false };
    }

    // Règle 3: Limiter le nombre de services de même catégorie
    const serviceCategory = getCategoryFromService(service);
    const categoryCounts = selectedServices.reduce((acc, s) => {
      const category = getCategoryFromService(s);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Pas plus de 2 services de diagnostic
    if (
      serviceCategory === "diagnostic" &&
      (categoryCounts["diagnostic"] || 0) >= 1
    ) {
      return { compatible: false, reason: "sameCategory" };
    }

    return { compatible: true };
  };

  // Détermine la catégorie d'un service
  const getCategoryFromService = (service: ServiceType): string => {
    const name = service.name.toLowerCase();

    if (name.includes("diagnostic")) {
      return "diagnostic";
    } else if (name.includes("hairneedling")) {
      return "hairneedling";
    } else if (
      name.includes("électrothérapie") ||
      name.includes("luminothérapie") ||
      name.includes("massage")
    ) {
      return "boost";
    } else if (service.isPromo) {
      return "promo";
    }

    return "other";
  };

  // Fonction pour ajouter un service à la sélection
  const handleAddService = (service: ServiceType) => {
    const { compatible, reason } = checkServiceCompatibility(service);

    if (!compatible) {
      let warningMessage = "";

      switch (reason) {
        case "promo":
          warningMessage =
            "Les forfaits promotionnels ne peuvent pas être combinés avec d'autres services.";
          break;
        case "sameCategory":
          warningMessage =
            "Vous ne pouvez pas ajouter plus d'un service de diagnostic.";
          break;
        default:
          warningMessage =
            "Ce service n'est pas compatible avec votre sélection actuelle.";
      }

      setIncompatibilityWarning(warningMessage);

      // Effacer le message après 5 secondes
      setTimeout(() => {
        setIncompatibilityWarning(null);
      }, 5000);

      return;
    }

    setSelectedServices((prev) => [...prev, service]);
    setIncompatibilityWarning(null);
  };

  // Fonction pour supprimer un service de la sélection
  const handleRemoveService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.filter((service) => service.id !== serviceId)
    );
    setIncompatibilityWarning(null);
  };

  // Fonction pour confirmer la sélection et passer à l'étape suivante
  const handleConfirm = () => {
    if (selectedServices.length > 0) {
      onConfirmSelection(selectedServices);
    }
  };

  // Extraire les catégories uniques des services
  const categories = [
    { id: "all", name: "Tous", icon: Tag },
    { id: "diagnostic", name: "Diagnostic", icon: Search },
    { id: "hairneedling", name: "Hairneedling", icon: Tag },
    { id: "boost", name: "Boost", icon: Tag },
    { id: "promo", name: "Forfaits", icon: Tag },
  ];

  // Filtrer les services en fonction de la recherche et de la catégorie
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let matchesCategory = activeCategory === null || activeCategory === "all";

    if (!matchesCategory) {
      switch (activeCategory) {
        case "diagnostic":
          matchesCategory = service.name.toLowerCase().includes("diagnostic");
          break;
        case "hairneedling":
          matchesCategory = service.name.toLowerCase().includes("hairneedling");
          break;
        case "boost":
          matchesCategory =
            service.name.toLowerCase().includes("électrothérapie") ||
            service.name.toLowerCase().includes("luminothérapie") ||
            service.name.toLowerCase().includes("massage") ||
            service.name.toLowerCase().includes("boost");
          break;
        case "promo":
          matchesCategory = service.isPromo === true;
          break;
        default:
          matchesCategory = false;
      }
    }

    return matchesSearch && matchesCategory;
  });

  // Vérifier si un service est déjà dans la liste des services sélectionnés
  const isServiceSelected = (serviceId: number) => {
    return selectedServices.some((service) => service.id === serviceId);
  };

  // Vérifier si un service est compatible avec la sélection actuelle
  const isServiceCompatible = (service: ServiceType) => {
    return checkServiceCompatibility(service).compatible;
  };

  // Calculer la durée totale en minutes
  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      // Utiliser durationMinutes si disponible, sinon extraire de la chaîne de caractères
      if (service.durationMinutes) {
        return total + service.durationMinutes;
      }

      // Extraire les minutes de la chaîne de caractères (ex: "30 min" -> 30)
      const durationMatch = service.duration.match(/(\d+)/);
      return total + (durationMatch ? parseInt(durationMatch[0], 10) : 0);
    }, 0);
  };

  // Formater la durée totale en heures et minutes
  const formatTotalDuration = () => {
    const totalMinutes = calculateTotalDuration();
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + "min" : ""}`;
    }
    return `${minutes} min`;
  };

  // Extraire le prix numérique d'une chaîne (ex: "10 000 FCFA" -> 10000)
  const extractPrice = (priceStr: string) => {
    const priceMatch = priceStr.match(/(\d+\s?\d*)/);
    return priceMatch ? parseInt(priceMatch[0].replace(/\s/g, ""), 10) : 0;
  };

  // Calculer le prix total
  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      return total + extractPrice(service.price);
    }, 0);
  };

  // Formater le prix total
  const formatTotalPrice = () => {
    const totalPrice = calculateTotalPrice();
    return totalPrice.toLocaleString("fr-FR") + " FCFA";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-xl font-medium text-gray-800 dark:text-white">
          <Check className="mr-2 text-[#ffb2dd]" size={20} />
          Sélectionnez vos soins
        </h3>

        {/* Barre de recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb2dd]/50 focus:border-transparent"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive =
            (category.id === "all" && activeCategory === null) ||
            activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategory(category.id === "all" ? null : category.id)
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm",
                isActive
                  ? "bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 text-gray-800 dark:text-white border border-[#ffb2dd]/30"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon
                className={cn(
                  "w-3 h-3",
                  isActive ? "text-[#ffb2dd]" : "text-gray-400"
                )}
              />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Message d'alerte d'incompatibilité */}
      {incompatibilityWarning && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle
              size={18}
              className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
            />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {incompatibilityWarning}
            </p>
          </div>
        </div>
      )}

      {/* Panier de services sélectionnés */}
      {selectedServices.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-[#ffb2dd]/10 to-[#e2b3f7]/10 rounded-lg border border-[#ffb2dd]/30">
          <div className="flex items-center mb-3">
            <ShoppingBag size={18} className="text-[#ffb2dd] mr-2" />
            <h4 className="font-medium text-gray-800 dark:text-white">
              Services sélectionnés
            </h4>
          </div>

          <div className="space-y-2 mb-4">
            {selectedServices.map((service) => (
              <div
                key={`selected-${service.id}`}
                className="flex items-center justify-between p-2 mb-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-white text-sm">
                    {service.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {service.duration}
                    <span className="mx-2">•</span>
                    {service.price}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Supprimer ${service.name} de votre sélection`}
                  onClick={() => handleRemoveService(service.id)}
                  className="h-7 w-7 text-gray-500 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#ffb2dd]/20">
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Clock size={14} className="mr-1" />
                <span>
                  Durée totale:{" "}
                  <span className="font-medium">{formatTotalDuration()}</span>
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Prix total:{" "}
                <span className="font-medium">{formatTotalPrice()}</span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              aria-label="Confirmer votre sélection de services et passer à l'étape suivante"
              className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] hover:from-[#d9a0f7] hover:to-[#ff9dd2] text-white"
            >
              Confirmer la sélection
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Informations importantes */}
      <div className="p-4 bg-gradient-to-r from-[#bfe0fb]/10 to-[#9deaff]/10 rounded-lg border border-[#bfe0fb]/30">
        <div className="flex items-start">
          <Info size={18} className="text-[#9deaff] mt-1 mr-3 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Important :</span> Vous pouvez
              sélectionner plusieurs services pour créer une séance
              personnalisée. La durée totale et le prix seront calculés
              automatiquement.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Compatibilité :</span> Les forfaits
              promotionnels ne peuvent pas être combinés avec d'autres services.
              Pour des conseils sur les meilleures combinaisons, contactez-nous.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des services optimisée */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => {
            const isSelected = isServiceSelected(service.id);
            const isCompatible = !isSelected && isServiceCompatible(service);

            return (
              <Card
                key={service.id}
                className={cn(
                  "group overflow-hidden transition-all duration-300 cursor-pointer border-none p-0",
                  isSelected
                    ? "bg-gradient-to-br from-white to-[#ffb2dd]/20 dark:from-gray-900 dark:to-[#ffb2dd]/30 ring-2 ring-[#ffb2dd]"
                    : !isCompatible
                    ? "bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 opacity-70"
                    : service.isPromo
                    ? "bg-gradient-to-br from-white to-[#ffb2dd]/5 dark:from-gray-900 dark:to-[#ffb2dd]/10"
                    : "bg-gradient-to-br from-white to-[#bfe0fb]/5 dark:from-gray-900 dark:to-[#bfe0fb]/10"
                )}
                onClick={() => isCompatible && handleAddService(service)}
              >
                {/* Barre de couleur en haut de la carte */}
                <div
                  className={cn(
                    "h-1 w-full",
                    isSelected
                      ? "bg-[#ffb2dd]"
                      : !isCompatible
                      ? "bg-gray-300 dark:bg-gray-600"
                      : service.isPromo
                      ? "bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]"
                      : "bg-gradient-to-r from-[#bfe0fb] to-[#9deaff]"
                  )}
                />
                <CardContent className="p-3">
                  <div className="flex flex-col h-full min-h-[155px]">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-800 dark:text-white text-sm line-clamp-1 mr-2">
                        {service.name}
                      </h4>
                      <span
                        className={cn(
                          "font-semibold text-xs ml-auto whitespace-nowrap",
                          isSelected
                            ? "text-[#ffb2dd]"
                            : !isCompatible
                            ? "text-gray-400"
                            : service.isPromo
                            ? "text-[#ffb2dd]"
                            : "text-[#9deaff]"
                        )}
                      >
                        {service.price}
                      </span>
                    </div>
                    {service.isPromo && (
                      <div className="inline-flex self-start items-center px-2 py-0.5 mb-1 text-[10px] font-medium text-white bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] rounded-full">
                        {service.name.includes("4 séances")
                          ? "4 séances"
                          : service.name.includes("6 séances")
                          ? "6 séances"
                          : "Forfait"}
                      </div>
                    )}
                    {service.description && (
                      <p
                        className="text-xs text-gray-600 dark:text-gray-300 mb-1"
                        title={service.description}
                      >
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Clock size={12} className="mr-1 flex-shrink-0" />
                      <span>{service.duration}</span>
                    </div>
                    {service.includes && service.includes.length > 0 && (
                      <div className="mb-1">
                        <ul className="flex flex-wrap gap-x-2 gap-y-0.5">
                          {service.includes.slice(0, 2).map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center text-[10px] text-gray-600 dark:text-gray-400"
                            >
                              <Check className="w-3 h-3 mr-1 text-[#9deaff]" />
                              <span className="truncate" title={item}>
                                {item}
                              </span>
                            </li>
                          ))}
                          {service.includes.length > 2 && (
                            <li className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                              +{service.includes.length - 2}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    <div className="flex justify-end mt-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          isSelected
                            ? "Service déjà sélectionné"
                            : !isCompatible
                            ? "Service incompatible avec votre sélection actuelle"
                            : "Ajouter ce service à votre sélection"
                        }
                        className={cn(
                          "p-1 h-7 w-7 transition-transform duration-300",
                          isSelected
                            ? "text-[#ffb2dd] cursor-not-allowed"
                            : !isCompatible
                            ? "text-gray-400 cursor-not-allowed"
                            : service.isPromo
                            ? "text-[#ffb2dd] hover:text-[#e2b3f7] hover:bg-[#ffb2dd]/10 group-hover:translate-x-0.5"
                            : "text-[#9deaff] hover:text-[#bfe0fb] hover:bg-[#9deaff]/10 group-hover:translate-x-0.5"
                        )}
                      >
                        {isSelected ? (
                          <Check size={14} />
                        ) : !isCompatible ? (
                          <AlertTriangle size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p>Aucun service ne correspond à votre recherche.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setActiveCategory(null);
              }}
              aria-label="Réinitialiser tous les filtres de recherche"
              className="mt-2 text-[#ffb2dd] hover:text-[#e2b3f7]"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
