"use client";

import { useState, useEffect } from "react";
import { Service as ServiceType } from "@/lib/data";
import { Suspense, useTransition } from "react";
import ServiceSelection from "./ServiceSelection";
import DateTimeSelection from "./DateTimeSelection";
import CustomerInfoForm from "./CustomerInfoForm";
import BookingConfirmation from "./BookingConfirmation";
import ServicesSkeleton from "@/components/skeletons/ServicesSkeleton";
import CalendarSkeleton from "@/components/skeletons/CalendarSkeleton";
import CustomerFormSkeleton from "@/components/skeletons/CustomerFormSkeleton";
import BookingStepIndicator from "./BookingStepIndicator";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Définir le type Step pour BookingStepIndicator
interface Step {
  id: number;
  label: string;
  icon: string;
}

// Type pour les créneaux disponibles
export interface AvailableSlot {
  date: string; // Format YYYY-MM-DD
  start: string; // Format HH:MM
  end: string; // Format HH:MM
  duration: number; // Durée en minutes
}

// Type pour les informations client
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  phoneCountryCode: string;
  hiboutikClientId?: number; // ID client dans Hiboutik
}

// Type pour les réservations multiples (pour les packs promo)
export interface MultipleBooking {
  slots: AvailableSlot[];
  sessionCount: number; // Nombre de séances (4 ou 6)
  serviceType: string; // Type de service ("Tempes" ou "Tête entière")
}

interface BookingClientWrapperProps {
  services: ServiceType[];
}

export default function BookingClientWrapper({
  services,
}: BookingClientWrapperProps) {
  // États pour gérer le processus de réservation
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<AvailableSlot[]>([]);
  const [isMultipleBooking, setIsMultipleBooking] = useState(false);
  const [multipleBooking, setMultipleBooking] =
    useState<MultipleBooking | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    phoneCountryCode: "+242", // Indicatif Congo Brazzaville par défaut
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // États pour les transitions et animations
  const [isPending, startTransition] = useTransition();
  const [fadeOut, setFadeOut] = useState(false);

  // Fonction pour calculer la durée totale des services sélectionnés
  const calculateTotalDuration = (): number => {
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

  // Fonction pour générer le nom du service combiné
  const generateCombinedServiceName = (): string => {
    if (selectedServices.length === 1) {
      return selectedServices[0].name;
    }

    return selectedServices.map((service) => service.name).join(" + ");
  };

  // Fonction pour sélectionner des services
  const selectServices = (services: ServiceType[]) => {
    setFadeOut(true);

    // Délai pour l'animation de transition
    setTimeout(() => {
      setSelectedServices(services);

      // Vérifier si c'est un service de type "Promo Pack"
      // Si on a exactement un service et qu'il est un pack promo
      const isPromoPackService =
        services.length === 1 &&
        services[0].isPromo &&
        (services[0].name.includes("Promo 4 séances") ||
          services[0].name.includes("Promo 6 séances"));

      // S'assurer que isPromoPackService est toujours un booléen
      setIsMultipleBooking(isPromoPackService === true);

      // Réinitialiser les slots sélectionnés
      setSelectedSlots([]);
      setSelectedSlot(null);
      setMultipleBooking(null);

      startTransition(() => {
        setBookingStep(2);
        setFadeOut(false);
      });
    }, 300); // Délai correspondant à la durée de l'animation CSS
  };

  // Fonction pour sélectionner un créneau
  const selectSlot = (slot: AvailableSlot) => {
    if (!isMultipleBooking) {
      // Réservation simple
      setFadeOut(true);

      // Délai pour l'animation de transition
      setTimeout(() => {
        setSelectedSlot(slot);
        startTransition(() => {
          setBookingStep(3);
          setFadeOut(false);
        });
      }, 300);
    } else {
      // Réservation multiple pour les packs promo
      // Cette fonction sera gérée différemment dans le composant DateTimeSelection
      // et utilisera addMultipleSlot ci-dessous
    }
  };

  // Fonction pour ajouter un créneau à une réservation multiple
  const addMultipleSlot = (slot: AvailableSlot) => {
    setSelectedSlots((prev) => [...prev, slot]);
  };

  // Fonction pour supprimer un créneau d'une réservation multiple
  const removeMultipleSlot = (slotToRemove: AvailableSlot) => {
    setSelectedSlots((prev) =>
      prev.filter(
        (slot) =>
          !(
            slot.date === slotToRemove.date && slot.start === slotToRemove.start
          )
      )
    );
  };

  // Fonction pour confirmer la sélection de créneaux multiples
  const confirmMultipleSlots = (sessionCount: number, serviceType: string) => {
    setFadeOut(true);

    // Délai pour l'animation de transition
    setTimeout(() => {
      setMultipleBooking({
        slots: selectedSlots,
        sessionCount,
        serviceType,
      });

      startTransition(() => {
        setBookingStep(3);
        setFadeOut(false);
      });
    }, 300);
  };

  // Fonction pour gérer les changements dans les informations client
  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCustomerInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    setFadeOut(true);

    // Délai pour l'animation de transition
    setTimeout(() => {
      startTransition(() => {
        setBookingStep((prev) => prev + 1);
        setFadeOut(false);
      });
    }, 300);
  };

  // Fonction pour revenir à l'étape précédente
  const goBack = () => {
    setFadeOut(true);

    // Délai pour l'animation de transition
    setTimeout(() => {
      startTransition(() => {
        setBookingStep((prev) => prev - 1);
        setFadeOut(false);
      });
    }, 300);
  };

  // Fonction pour réinitialiser le processus de réservation
  const resetBooking = () => {
    setFadeOut(true);

    // Délai pour l'animation de transition
    setTimeout(() => {
      startTransition(() => {
        setBookingStep(1);
        setSelectedServices([]);
        setSelectedSlot(null);
        setSelectedSlots([]);
        setMultipleBooking(null);
        setCustomerInfo({
          name: "",
          phone: "",
          phoneCountryCode: "+242", // Indicatif Congo Brazzaville par défaut
        });
        setBookingConfirmed(false);
        setBookingError(null);
        setFadeOut(false);
      });
    }, 300);
  };

  // Fonction pour confirmer la réservation
  const confirmBooking = async () => {
    setFadeOut(true);
    setBookingError(null);

    try {
      // 1. Créer d'abord le client dans Hiboutik
      let hiboutikClientId = null;

      // Préparer les données du client pour Hiboutik
      const hiboutikClientData = {
        customers_first_name:
          customerInfo.name.split(" ")[0] || customerInfo.name,
        customers_last_name:
          customerInfo.name.split(" ").slice(1).join(" ") || "",
        customers_phone_number: `${
          customerInfo.phoneCountryCode
        } ${customerInfo.phone.replace(/\s/g, "")}`,
        customers_email: customerInfo.email || "",
      };

      try {
        // Appeler l'API Hiboutik pour créer le client
        const hiboutikResponse = await fetch("/api/hiboutik/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hiboutikClientData),
        });

        if (!hiboutikResponse.ok) {
          const errorText = await hiboutikResponse.text();
          console.warn(
            "Échec de la création du client dans Hiboutik, mais la réservation continuera:",
            errorText
          );
        } else {
          const hiboutikData = await hiboutikResponse.json();
          hiboutikClientId = hiboutikData.customers_id;
          console.log("Client créé dans Hiboutik avec ID:", hiboutikClientId);
        }
      } catch (hiboutikError) {
        console.warn(
          "Erreur lors de la création du client dans Hiboutik, mais la réservation continuera:",
          hiboutikError
        );
      }

      // 2. Préparer les données de réservation
      const customerInfoWithHiboutik = { ...customerInfo };
      if (hiboutikClientId) {
        customerInfoWithHiboutik.hiboutikClientId = hiboutikClientId;
      }

      // Pour les services multiples, créer un service combiné
      const bookingData = {
        customerInfo: customerInfoWithHiboutik,
        title: generateCombinedServiceName(),
        originalService:
          isMultipleBooking && selectedServices.length === 1
            ? selectedServices[0]
            : null,
        selectedServices: selectedServices,
        totalDuration: calculateTotalDuration(),
        isCustomService: selectedServices.length > 1,
      };

      // 3. Créer la réservation avec un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000);

      try {
        if (isMultipleBooking && multipleBooking) {
          // Réservation multiple - Utiliser la nouvelle API
          console.log("Utilisation de l'API de réservation multiple");

          // Préparer les données pour l'API de réservation multiple
          const multipleBookingData = {
            clientName: customerInfo.name,
            clientPhone: customerInfo.phoneCountryCode + customerInfo.phone,
            clientEmail: customerInfo.email || null,
            hiboutikClientId: customerInfoWithHiboutik.hiboutikClientId,

            // Informations sur le pack
            packageName: generateCombinedServiceName(),
            packageDescription: selectedServices[0]?.description || "",

            // Créneaux individuels du pack
            bookings: multipleBooking.slots.map((slot) => ({
              title: generateCombinedServiceName(),
              start: `${slot.date}T${slot.start}:00+01:00`,
              end: `${slot.date}T${slot.end}:00+01:00`,
              description: `${multipleBooking.serviceType} - Séance ${multipleBooking.sessionCount} séances`,
            })),
          };

          console.log(
            "Données envoyées à l'API de réservation multiple:",
            multipleBookingData
          );

          // Appeler l'API de réservation multiple
          const response = await fetch("/api/create-multiple-bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(multipleBookingData),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log("Résultat de la réservation multiple:", result);

          if (!result.success) {
            throw new Error(
              result.error || "La réservation multiple n'a pas pu être créée"
            );
          }
        } else {
          // Réservation simple
          if (!selectedSlot) {
            throw new Error("Aucun créneau n'a été sélectionné");
          }

          const startDateTime = `${selectedSlot.date}T${selectedSlot.start}:00+01:00`;
          const endDateTime = `${selectedSlot.date}T${selectedSlot.end}:00+01:00`;

          if (!startDateTime || !endDateTime) {
            throw new Error("Les dates de début et de fin sont requises");
          }

          // Log pour déboguer
          console.log("Données de réservation simple envoyées:", {
            ...bookingData,
            start: startDateTime,
            end: endDateTime,
            clientName: customerInfo.name,
            clientPhone: customerInfo.phoneCountryCode + customerInfo.phone,
            clientEmail: customerInfo.email || null,
          });

          const response = await fetch("/api/create-booking", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...bookingData,
              start: startDateTime,
              end: endDateTime,
              clientName: customerInfo.name,
              clientPhone: customerInfo.phoneCountryCode + customerInfo.phone,
              clientEmail: customerInfo.email || null,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log("Résultat de la réservation simple:", result);

          if (!result.success) {
            throw new Error(
              result.error || "La réservation n'a pas pu être créée"
            );
          }
        }

        // Si tout s'est bien passé, passer à l'étape de confirmation
        setBookingConfirmed(true);
        setBookingError(null);

        startTransition(() => {
          setBookingStep(4);
          setFadeOut(false);
        });
      } catch (error: any) {
        console.error("Erreur lors de la création de la réservation:", error);
        setBookingError(
          error.message || "Une erreur est survenue lors de la réservation"
        );
        setFadeOut(false);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: any) {
      console.error("Erreur globale lors de la réservation:", error);
      setBookingError(
        error.message || "Une erreur est survenue lors de la réservation"
      );
      setFadeOut(false);
    }
  };

  // Classe CSS pour l'animation de transition
  const transitionClasses = fadeOut ? "opacity-0" : "opacity-100";

  // Formatage de la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  // Définir les étapes pour le BookingStepIndicator
  const bookingSteps: Step[] = [
    { id: 1, label: "Service", icon: "service" },
    { id: 2, label: "Date & Heure", icon: "calendar" },
    { id: 3, label: "Informations", icon: "user" },
    { id: 4, label: "Confirmation", icon: "check" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-12">
          <BookingStepIndicator
            currentStep={bookingStep}
            steps={bookingSteps}
            isPending={isPending}
          />
        </div>

        <div
          className={`w-full transition-opacity duration-300 ${transitionClasses}`}
        >
          {bookingStep === 1 && (
            <Suspense fallback={<ServicesSkeleton />}>
              <ServiceSelection
                services={[...services]}
                onConfirmSelection={selectServices}
              />
            </Suspense>
          )}

          {bookingStep === 2 && selectedServices.length > 0 && (
            <Suspense fallback={<CalendarSkeleton />}>
              <DateTimeSelection
                services={selectedServices}
                combinedDuration={calculateTotalDuration()}
                onSelectSlot={selectSlot}
                onBack={goBack}
                isMultipleBooking={isMultipleBooking}
                selectedSlots={selectedSlots}
                addMultipleSlot={addMultipleSlot}
                removeMultipleSlot={removeMultipleSlot}
                confirmMultipleSlots={confirmMultipleSlots}
              />
            </Suspense>
          )}

          {bookingStep === 3 &&
            ((selectedSlot && !isMultipleBooking) ||
              (isMultipleBooking &&
                multipleBooking &&
                multipleBooking.slots.length > 0)) && (
              <Suspense fallback={<CustomerFormSkeleton />}>
                <CustomerInfoForm
                  customerInfo={customerInfo}
                  onChange={handleCustomerInfoChange}
                  onConfirm={confirmBooking}
                  onBack={goBack}
                  services={selectedServices}
                  slot={selectedSlot}
                  isMultipleBooking={isMultipleBooking}
                  multipleBooking={multipleBooking}
                />
              </Suspense>
            )}

          {bookingStep === 4 && bookingConfirmed && (
            <BookingConfirmation
              services={selectedServices}
              slot={selectedSlot}
              customerInfo={customerInfo}
              isMultipleBooking={isMultipleBooking}
              multipleBooking={multipleBooking}
            />
          )}

          {bookingError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 ml-3 md:flex md:justify-between">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-medium text-red-800 dark:text-red-300 mb-1 sm:mb-2">
                      Erreur de réservation
                    </h3>
                    <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-2 sm:mb-3">
                      {bookingError}
                    </p>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                      Si le problème persiste, vous pouvez nous contacter
                      directement par téléphone au{" "}
                      <span className="font-medium">01 23 45 67 89</span> ou par
                      email à{" "}
                      <span className="font-medium">contact@shugamade.com</span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                      <Button
                        onClick={() => setBookingError(null)}
                        className="bg-[#bfe0fb] hover:bg-[#9deaff] text-white text-sm sm:text-base py-1.5 h-auto sm:h-10"
                      >
                        Réessayer
                      </Button>
                      <Button
                        onClick={goBack}
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700 text-sm sm:text-base py-1.5 h-auto sm:h-10"
                      >
                        Retour
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
