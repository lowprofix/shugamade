"use client";

import { useState } from "react";
import { Service as ServiceType } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, ArrowRight, Info, Search, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSelectionProps {
  services: ServiceType[];
  onSelectService: (service: ServiceType) => void;
}

export default function ServiceSelection({ 
  services, 
  onSelectService 
}: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Extraire les catégories uniques des services
  const categories = [
    { id: "all", name: "Tous", icon: Tag },
    { id: "diagnostic", name: "Diagnostic", icon: Search },
    { id: "hairneedling", name: "Hairneedling", icon: Tag },
    { id: "boost", name: "Boost", icon: Tag },
    { id: "promo", name: "Forfaits", icon: Tag },
  ];
  
  // Filtrer les services en fonction de la recherche et de la catégorie
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            service.name.toLowerCase().includes("massage");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-xl font-medium text-gray-800 dark:text-white">
          <Check className="mr-2 text-[#ffb2dd]" size={20} />
          Sélectionnez votre soin
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
          const isActive = (category.id === "all" && activeCategory === null) || activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id === "all" ? null : category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm",
                isActive
                  ? "bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 text-gray-800 dark:text-white border border-[#ffb2dd]/30"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon className={cn(
                "w-3 h-3",
                isActive
                  ? "text-[#ffb2dd]" 
                  : "text-gray-400"
              )} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Informations importantes */}
      <div className="p-4 bg-gradient-to-r from-[#bfe0fb]/10 to-[#9deaff]/10 rounded-lg border border-[#bfe0fb]/30">
        <div className="flex items-start">
          <Info size={18} className="text-[#9deaff] mt-1 mr-3 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Important :</span> Veuillez choisir le service qui correspond 
              à vos besoins. Pour les forfaits, un kit de soins SHUGAMADE vous sera offert.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Forfaits :</span> Pour des résultats optimaux, nous recommandons un traitement 
              complet de 4 à 6 séances, espacées de deux semaines.
            </p>
          </div>
        </div>
      </div>
      
      {/* Liste des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <Card 
              key={service.id} 
              className={cn(
                "group overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer border-none",
                service.isPromo 
                  ? "bg-gradient-to-br from-white to-[#ffb2dd]/5 dark:from-gray-900 dark:to-[#ffb2dd]/10" 
                  : "bg-gradient-to-br from-white to-[#bfe0fb]/5 dark:from-gray-900 dark:to-[#bfe0fb]/10"
              )}
              onClick={() => onSelectService(service)}
            >
              {/* Barre de couleur en haut de la carte */}
              <div className={cn(
                "h-1 w-full",
                service.isPromo 
                  ? "bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]" 
                  : "bg-gradient-to-r from-[#bfe0fb] to-[#9deaff]"
              )} />
              
              <CardContent className="p-5">
                <div className="flex flex-col h-full">
                  {service.isPromo && (
                    <div className="inline-flex self-start items-center px-2 py-1 mb-2 text-xs font-medium text-white bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] rounded-full">
                      {service.name.includes("4 séances") ? "4 séances" : service.name.includes("6 séances") ? "6 séances" : "Forfait"}
                    </div>
                  )}
                  
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">{service.name}</h4>
                  
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Clock size={14} className="mr-1 flex-shrink-0" />
                    <span>{service.duration}</span>
                  </div>
                  
                  {service.includes && service.includes.length > 0 && (
                    <div className="mt-2 mb-3">
                      <ul className="space-y-1">
                        {service.includes.slice(0, 2).map((item, index) => (
                          <li key={index} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                            <Check className="w-3 h-3 mt-0.5 mr-1 text-[#9deaff]" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {service.includes.length > 2 && (
                          <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                            + {service.includes.length - 2} autres inclus
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className={cn(
                      "font-medium",
                      service.isPromo ? "text-[#ffb2dd]" : "text-[#9deaff]"
                    )}>
                      {service.price}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "group-hover:translate-x-1 transition-transform duration-300 p-1",
                        service.isPromo 
                          ? "text-[#ffb2dd] hover:text-[#e2b3f7] hover:bg-[#ffb2dd]/10" 
                          : "text-[#9deaff] hover:text-[#bfe0fb] hover:bg-[#9deaff]/10"
                      )}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p>Aucun service ne correspond à votre recherche.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm("");
                setActiveCategory(null);
              }}
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
