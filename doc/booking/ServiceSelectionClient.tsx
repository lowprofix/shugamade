"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service as ServiceType } from "@/lib/data";
import { Check, Clock, ArrowRight, Info } from "lucide-react";

interface ServiceSelectionClientProps {
  services: ServiceType[];
  onSelectService: (service: ServiceType) => void;
}

export default function ServiceSelectionClient({ 
  services, 
  onSelectService 
}: ServiceSelectionClientProps) {
  return (
    <>
      <h3 className="flex items-center mb-6 text-xl font-medium text-gray-800">
        <Check className="mr-2 text-teal-400" size={20} />
        Sélectionnez votre soin
      </h3>
      
      {/* Informations importantes - placées en haut pour être visibles immédiatement */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start">
          <Info size={18} className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            <span className="font-medium">Important :</span> Veuillez choisir le service qui correspond 
            à vos besoins. Si vous avez des questions, n'hésitez pas à nous 
            contacter avant de réserver.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer border border-gray-200 hover:border-teal-200"
            onClick={() => onSelectService(service)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <h4 className="font-medium text-gray-800 mb-2">{service.name}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-500 mb-2">
                  <Clock size={14} className="mr-1 flex-shrink-0" />
                  <span>{service.duration}</span>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-teal-600">{service.price}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-pink-400 hover:text-pink-500 hover:bg-pink-50 p-1"
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
