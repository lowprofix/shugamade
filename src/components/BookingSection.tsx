"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CALCOM_NAMESPACE,
  DEFAULT_CAL_CONFIG,
  initializeCalApi,
} from "@/lib/calcom";
import { Service } from "@/lib/data";
import Cal from "@calcom/embed-react";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface BookingSectionProps {
  services: Service[];
}

export default function BookingSection({ services }: BookingSectionProps) {
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const selectService = (service: Service) => {
    setSelectedService(service);
    setBookingStep(2);
    setCalendarVisible(true);

    // Initialize Cal.com
    setTimeout(() => {
      initializeCalApi();
    }, 100);
  };

  return (
    <section id="booking" className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-800">
            <span className="text-brand-pink-dark">Réservez</span>{" "}
            <span className="text-brand-blue-dark">votre soin</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Choisissez votre service et trouvez un créneau qui vous convient
          </p>
        </div>

        <Card className="bg-gradient-to-r from-brand-pink-light/20 to-brand-blue-light/20 rounded-lg shadow-sm overflow-hidden">
          <CardContent className="p-6">
            {bookingStep === 1 && (
              <>
                <h3 className="text-xl text-gray-800 mb-6 font-light flex items-center">
                  <Check className="text-brand-blue mr-2" size={20} />
                  Sélectionnez votre soin
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const colorClass =
                      service.color === "brand"
                        ? "border-gradient text-brand-pink-dark"
                        : service.color === "pink"
                        ? "text-brand-pink-dark"
                        : "text-brand-blue-dark";

                    return (
                      <div
                        key={service.id}
                        className={`border border-gray-100 hover:border-brand-blue-light p-4 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-sm`}
                        onClick={() => selectService(service)}
                      >
                        <div>
                          <h3 className={`font-medium ${colorClass}`}>
                            {service.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar size={14} className="mr-1" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-right text-brand-blue font-medium">
                            {service.price}
                          </span>
                          <ChevronDown
                            size={16}
                            className="ml-2 text-brand-pink"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {bookingStep === 2 && selectedService && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <Button
                    onClick={() => {
                      setBookingStep(1);
                      setCalendarVisible(false);
                    }}
                    variant="ghost"
                    className="text-sm text-gray-500 hover:text-brand-blue"
                  >
                    ← Retour aux services
                  </Button>
                  <div className="bg-brand-blue-light/20 text-brand-blue-dark py-1 px-3 rounded-full text-sm">
                    {selectedService.name}
                  </div>
                </div>

                <h3 className="text-xl text-gray-800 mb-6 font-light flex items-center">
                  <Calendar className="text-brand-blue mr-2" size={20} />
                  Choisissez votre date et heure
                </h3>

                {calendarVisible && (
                  <div style={{ height: "600px" }}>
                    <Cal
                      namespace={CALCOM_NAMESPACE}
                      calLink={selectedService.calLink}
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "scroll",
                      }}
                      config={DEFAULT_CAL_CONFIG}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
