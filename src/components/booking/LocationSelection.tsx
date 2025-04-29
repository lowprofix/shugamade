"use client";

import { useState } from "react";
import { Location } from "@/lib/data";
import { MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationSelectionProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  onBack: () => void;
  isMultipleBooking?: boolean;
}

export default function LocationSelection({
  locations,
  onSelectLocation,
  onBack,
  isMultipleBooking = false,
}: LocationSelectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Choisissez votre institut
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
        Sélectionnez l'institut où vous souhaitez prendre rendez-vous
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {locations.map((location) => {
          const isDisabled = isMultipleBooking && location.id === 2;

          return (
            <Card
              key={location.id}
              className={`overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-lg ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:translate-y-[-4px] hover:shadow-[#bfe0fb]/20"
              }`}
              onClick={() => !isDisabled && onSelectLocation(location)}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-center mb-2">
                    {location.name.replace("Institut ShugaMade - ", "")}
                  </h3>
                  <address className="text-center text-gray-600 dark:text-gray-400 not-italic mb-4">
                    {location.address}
                    <div className="text-sm mt-1 text-gray-500 dark:text-gray-500 italic">
                      {location.description}
                    </div>
                  </address>

                  {isMultipleBooking && location.id === 2 && (
                    <div className="mt-2 text-center text-red-500 text-sm">
                      Les réservations multiples ne sont pas encore disponibles
                      à Pointe-Noire
                    </div>
                  )}

                  <Button
                    className="w-full mt-2 bg-[#bfe0fb] hover:bg-[#9deaff] text-white"
                    disabled={isDisabled}
                  >
                    Choisir cet institut
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
      </div>
    </div>
  );
}
