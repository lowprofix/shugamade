"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CALCOM_NAMESPACE,
  DEFAULT_CAL_CONFIG,
  initializeCalApi,
} from "@/lib/calcom";
import { Service as ServiceType } from "@/lib/data";
import Cal from "@calcom/embed-react";
import { Calendar, Check, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface BookingSectionProps {
  services: ServiceType[];
}

export default function BookingSection({ services }: BookingSectionProps) {
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_CALCOM_API_KEY || "";
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_CALCOM_API_URL || "https://api.cal.com";

  const selectService = async (service: ServiceType) => {
    setSelectedService(service);
    setBookingStep(2);
    setCalendarVisible(true);
    setIsLoading(true);
    setError(null);

    try {
      // Initialiser Cal.com
      setTimeout(() => {
        initializeCalApi();
      }, 100);

      // Optionnel : Récupérer les créneaux disponibles via l'API
      if (service.eventTypeId) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const response = await axios.get(`${API_BASE_URL}/v2/slots`, {
          params: {
            eventTypeId: service.eventTypeId,
            startTime: today.toISOString(),
            endTime: nextMonth.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            duration: service.durationMinutes || 30,
          },
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        setAvailableSlots(response.data.slots || []);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des créneaux:", err);
      setError(
        "Impossible de charger les créneaux disponibles. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="booking"
      className="py-12 bg-gradient-to-b from-pink-50 to-teal-50"
    >
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-light text-gray-800">
            <span className="text-pink-400">Réservez</span>{" "}
            <span className="text-teal-400">votre soin</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-3 text-gray-600">
            Choisissez votre service et trouvez un créneau qui vous convient
          </p>
        </div>

        {/* Indicateur d'étape */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                bookingStep >= 1 ? "bg-teal-400 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div className="w-10 h-1 mx-1 bg-gray-200">
              <div
                className={`h-1 ${
                  bookingStep >= 2 ? "bg-teal-400" : "bg-gray-200"
                }`}
                style={{ width: bookingStep >= 2 ? "100%" : "0%" }}
              ></div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                bookingStep >= 2 ? "bg-teal-400 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
          </div>
        </div>

        <Card className="overflow-hidden bg-white rounded-lg shadow-md">
          <CardContent className="p-4">
            {bookingStep === 1 && (
              <>
                <h3 className="flex items-center mb-6 text-xl font-light text-gray-800">
                  <Check className="mr-2 text-teal-400" size={20} />
                  Sélectionnez votre soin
                </h3>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 transition-all border border-gray-100 rounded-lg cursor-pointer hover:border-teal-200 hover:shadow-sm"
                      onClick={() => selectService(service)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {service.name}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock size={14} className="mr-1" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-right text-teal-600">
                          {service.price}
                        </span>
                        <ArrowRight size={16} className="ml-2 text-pink-400" />
                      </div>
                    </div>
                  ))}
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
                    className="flex items-center text-sm text-gray-500 hover:text-teal-500"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Retour aux services
                  </Button>
                  <div className="px-3 py-1 text-sm text-teal-700 rounded-full bg-teal-50">
                    {selectedService.name}
                  </div>
                </div>

                <h3 className="flex items-center mb-6 text-xl font-light text-gray-800">
                  <Calendar className="mr-2 text-teal-400" size={20} />
                  Choisissez votre date et heure
                </h3>

                {isLoading && (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto border-b-2 border-teal-400 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">
                      Chargement du calendrier...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 mb-6 text-red-600 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                {calendarVisible && !isLoading && (
                  <div
                    style={{ height: "600px" }}
                    className="w-full max-w-full overflow-hidden border border-gray-200 rounded-lg"
                  >
                    <Cal
                      namespace={CALCOM_NAMESPACE}
                      calLink={selectedService.calLink}
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "scroll",
                      }}
                      config={{
                        ...DEFAULT_CAL_CONFIG,
                        hideEventTypeDetails: "false",
                        layout: "month_view",
                        primaryColor: "#2dd4bf",
                        brandColor: "#f472b6",
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Informations additionnelles */}
        <div className="max-w-3xl p-6 mx-auto mt-8 bg-white rounded-lg shadow-md">
          <h3 className="mb-3 font-medium text-gray-800">
            Information importante
          </h3>
          <p className="text-sm text-gray-600">
            Il est recommandé de réaliser 4 à 6 séances (1 séance toutes les
            deux semaines pendant 2 à 3 mois). Des séances d'entretien peuvent
            être proposées pour maintenir les résultats.
          </p>

          <div className="p-3 mt-4 rounded-lg bg-pink-50">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Kit offert :</span> Produits de
              soins adaptés à votre traitement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
