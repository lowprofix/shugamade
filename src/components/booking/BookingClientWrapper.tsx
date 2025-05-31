"use client";

import { useState, useEffect } from "react";
import { Service as ServiceType, Location, locations } from "@/lib/data";
import { Suspense, useTransition } from "react";
import ServiceSelection from "./ServiceSelection";
import LocationSelection from "./LocationSelection";
import DateTimeSelection from "./DateTimeSelection";
import CustomerInfoForm from "./CustomerInfoForm";
import BookingConfirmation from "./BookingConfirmation";
import ServicesSkeleton from "@/components/skeletons/ServicesSkeleton";
import CalendarSkeleton from "@/components/skeletons/CalendarSkeleton";
import CustomerFormSkeleton from "@/components/skeletons/CustomerFormSkeleton";
import { BookingStepIndicator } from "./BookingStepIndicator";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  findHiboutikClient,
  createHiboutikClient,
  updateHiboutikClientIfNeeded,
  HiboutikClient,
} from "@/lib/hiboutikClientUtils";

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
  first_name: string;
  last_name: string;
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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<AvailableSlot[]>([]);
  const [isMultipleBooking, setIsMultipleBooking] = useState(false);
  const [multipleBooking, setMultipleBooking] =
    useState<MultipleBooking | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    first_name: "",
    last_name: "",
    phone: "",
    phoneCountryCode: "+242", // Indicatif Congo Brazzaville par défaut
  });
  // Nouvel état pour contrôler l'envoi de notifications WhatsApp
  const [sendWhatsAppConfirmation, setSendWhatsAppConfirmation] =
    useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // États pour les transitions et animations
  const [isPending, startTransition] = useTransition();
  const [fadeOut, setFadeOut] = useState(false);

  const [existingClient, setExistingClient] = useState<HiboutikClient | null>(
    null
  );
  const [showClientFoundModal, setShowClientFoundModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);
  const [clientDiffs, setClientDiffs] = useState<
    { field: string; oldValue: string; newValue: string }[]
  >([]);

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
        (services[0].name.includes("Forfait 4 séances") ||
          services[0].name.includes("Forfait 6 séances") ||
          services[0].name.includes("Forfait Boost"));

      // S'assurer que isPromoPackService est toujours un booléen
      setIsMultipleBooking(isPromoPackService === true);

      // Réinitialiser les slots sélectionnés
      setSelectedSlots([]);
      setSelectedSlot(null);
      setMultipleBooking(null);
      setSelectedLocation(null);

      startTransition(() => {
        setBookingStep(2); // Aller à l'étape de sélection du lieu
        setFadeOut(false);
      });
    }, 300); // Délai correspondant à la durée de l'animation CSS
  };

  // Fonction pour sélectionner un lieu
  const selectLocation = (location: Location) => {
    setFadeOut(true);

    // Délai pour l'animation de transition
    setTimeout(() => {
      setSelectedLocation(location);
      startTransition(() => {
        setBookingStep(3); // Aller à l'étape de sélection date/heure
        setFadeOut(false);
      });
    }, 300);
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
          setBookingStep(4); // Étape 4 maintenant (était 3 avant)
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
        setBookingStep(4); // Étape 4 maintenant (était 3 avant)
        setFadeOut(false);
      });
    }, 300);
  };

  // Fonction pour gérer les changements de formulaire
  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Nouvelle fonction pour gérer le toggle des notifications WhatsApp
  const handleToggleWhatsAppConfirmation = (enabled: boolean) => {
    setSendWhatsAppConfirmation(enabled);
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
        setSelectedLocation(null);
        setSelectedSlot(null);
        setSelectedSlots([]);
        setMultipleBooking(null);
        setCustomerInfo({
          first_name: "",
          last_name: "",
          phone: "",
          phoneCountryCode: "+242", // Indicatif Congo Brazzaville par défaut
        });
        setBookingConfirmed(false);
        setBookingError(null);
        setFadeOut(false);
      });
    }, 300);
  };

  // Fonction pour comparer les infos client et retourner les différences
  function getClientDiffs(client: HiboutikClient, customerInfo: CustomerInfo) {
    const diffs = [];
    if (client.customers_first_name !== customerInfo.first_name) {
      diffs.push({
        field: "Prénom",
        oldValue: client.customers_first_name,
        newValue: customerInfo.first_name,
      });
    }
    if (client.customers_last_name !== customerInfo.last_name) {
      diffs.push({
        field: "Nom",
        oldValue: client.customers_last_name,
        newValue: customerInfo.last_name,
      });
    }
    if ((client.customers_email || "") !== (customerInfo.email || "")) {
      diffs.push({
        field: "Email",
        oldValue: client.customers_email || "",
        newValue: customerInfo.email || "",
      });
    }
    // Comparaison stricte du numéro formaté (pour affichage)
    const phoneFull = `${
      customerInfo.phoneCountryCode
    } ${customerInfo.phone.replace(/\s+/g, "")}`;
    if ((client.customers_phone_number || "") !== phoneFull) {
      diffs.push({
        field: "Téléphone",
        oldValue: client.customers_phone_number || "",
        newValue: phoneFull,
      });
    }
    return diffs;
  }

  // Nouvelle fonction pour créer la réservation avec l'ID client Hiboutik
  const createBookingWithClientId = async (hiboutikClientId: number) => {
    const customerInfoWithHiboutik = { ...customerInfo, hiboutikClientId };
    try {
      // Pour les services multiples (réservations de pack)
      if (isMultipleBooking && multipleBooking) {
        // Préparer les données pour les réservations multiples
        const bookingsData = multipleBooking.slots.map((slot, index) => ({
          title: `${multipleBooking.serviceType} - Séance ${index + 1}`,
          start: `${slot.date}T${slot.start}:00+01:00`,
          end: `${slot.date}T${slot.end}:00+01:00`,
          description: `Séance ${index + 1} du pack ${multipleBooking.serviceType}`,
        }));

        const multipleBookingPayload = {
          clientName: `${customerInfoWithHiboutik.first_name} ${customerInfoWithHiboutik.last_name}`,
          clientPhone: `${customerInfoWithHiboutik.phoneCountryCode}${customerInfoWithHiboutik.phone}`,
          clientEmail: customerInfoWithHiboutik.email || null,
          hiboutikClientId: hiboutikClientId.toString(),
          packageName: `Pack ${multipleBooking.sessionCount} séances - ${multipleBooking.serviceType}`,
          packageDescription: `Pack promotionnel de ${multipleBooking.sessionCount} séances de ${multipleBooking.serviceType}`,
          bookings: bookingsData,
          sendWhatsAppConfirmation: sendWhatsAppConfirmation,
        };

        console.log("Envoi des réservations multiples:", multipleBookingPayload);

        const response = await fetch("/api/create-multiple-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(multipleBookingPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création des réservations multiples"
          );
        }

        const responseData = await response.json();
        console.log("Réservations multiples créées avec succès:", responseData);

        setBookingConfirmed(true);
        setBookingError(null);
        startTransition(() => {
          setBookingStep(5);
          setFadeOut(false);
        });
      } else {
        // Réservation simple
        if (!selectedSlot) throw new Error("Aucun créneau sélectionné");
        const startDateTime = `${selectedSlot.date}T${selectedSlot.start}:00+01:00`;
        const endDateTime = `${selectedSlot.date}T${selectedSlot.end}:00+01:00`;
        const response = await fetch("/api/create-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...customerInfoWithHiboutik,
            title: generateCombinedServiceName(),
            start: startDateTime,
            end: endDateTime,
            clientName:
              customerInfoWithHiboutik.first_name +
              " " +
              customerInfoWithHiboutik.last_name,
            clientPhone:
              customerInfoWithHiboutik.phoneCountryCode +
              customerInfoWithHiboutik.phone,
            clientEmail: customerInfoWithHiboutik.email || null,
            locationId: selectedLocation?.id || 1,
            sendWhatsAppConfirmation: sendWhatsAppConfirmation,
          }),
        });
        if (!response.ok)
          throw new Error("Erreur lors de la création de la réservation");
        
        const responseData = await response.json();
        console.log("Réservation simple créée avec succès:", responseData);
        
        setBookingConfirmed(true);
        setBookingError(null);
        startTransition(() => {
          setBookingStep(5);
          setFadeOut(false);
        });
      }
    } catch (error: any) {
      setBookingError(error.message || "Erreur lors de la réservation");
      setFadeOut(false);
    }
  };

  // Fonction pour gérer la confirmation utilisateur dans la modale de client existant
  const handleClientModalConfirm = async () => {
    setShowClientFoundModal(false);
    setFadeOut(true);

    try {
      if (existingClient) {
        // Mettre à jour le client si des différences sont détectées
        if (clientDiffs.length > 0) {
          await updateHiboutikClientIfNeeded(existingClient, customerInfo);
        }

        // Continuer la réservation avec l'ID client existant
        if (pendingBookingData && pendingBookingData.hiboutikClientId) {
          await createBookingWithClientId(pendingBookingData.hiboutikClientId);
          setPendingBookingData(null);
        }
      }
    } catch (error: any) {
      setBookingError(
        error.message || "Erreur lors de la mise à jour du client"
      );
      setFadeOut(false);
    }
  };

  // Fonction pour annuler et créer un nouveau client
  const handleClientModalCancel = async () => {
    setShowClientFoundModal(false);
    setFadeOut(true);

    try {
      // Créer un nouveau client malgré l'existence d'un client similaire
      const newClientData = await createHiboutikClient(customerInfo);
      if (newClientData && newClientData.customers_id) {
        await createBookingWithClientId(newClientData.customers_id);
      } else {
        throw new Error("Impossible de créer un nouveau client");
      }
    } catch (error: any) {
      setBookingError(error.message || "Erreur lors de la création du client");
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
  const bookingSteps = [
    { id: 1, label: "Service", icon: "service" },
    { id: 2, label: "Institut", icon: "location" },
    { id: 3, label: "Date & Heure", icon: "calendar" },
    { id: 4, label: "Informations", icon: "user" },
    { id: 5, label: "Confirmation", icon: "check" },
  ];

  // Fonction à passer à CustomerInfoForm pour lancer le flux complet
  const confirmBooking = async () => {
    setFadeOut(true);
    setBookingError(null);

    try {
      // 1. D'abord chercher si un client existe déjà
      let hiboutikClientId = null;
      let hiboutikClientData = null;

      try {
        // Rechercher le client par téléphone uniquement (sans création)
        hiboutikClientData = await findHiboutikClient({
          phone: customerInfo.phone,
          phoneCountryCode: customerInfo.phoneCountryCode,
        });

        // Si un client existant est trouvé, afficher la modale
        if (hiboutikClientData && hiboutikClientData.customers_id) {
          hiboutikClientId = hiboutikClientData.customers_id;
          setExistingClient(hiboutikClientData);
          const diffs = getClientDiffs(hiboutikClientData, customerInfo);
          setClientDiffs(diffs);
          setShowClientFoundModal(true);
          setPendingBookingData({ hiboutikClientId });
          setFadeOut(false);
          return; // Attendre la confirmation utilisateur
        }

        // Si aucun client existant, créer un nouveau client
        hiboutikClientData = await createHiboutikClient(customerInfo);
        if (hiboutikClientData && hiboutikClientData.customers_id) {
          hiboutikClientId = hiboutikClientData.customers_id;
          // Créer directement la réservation avec le nouveau client
          await createBookingWithClientId(hiboutikClientId);
        } else {
          throw new Error("Impossible de créer ou trouver le client");
        }
      } catch (hiboutikError) {
        console.warn(
          "Erreur lors de la recherche/création du client dans Hiboutik, mais la réservation continuera:",
          hiboutikError
        );
        // Tenter de créer la réservation sans client Hiboutik
        try {
          if (isMultipleBooking && multipleBooking) {
            // Réservations multiples sans client Hiboutik
            const bookingsData = multipleBooking.slots.map((slot, index) => ({
              title: `${multipleBooking.serviceType} - Séance ${index + 1}`,
              start: `${slot.date}T${slot.start}:00+01:00`,
              end: `${slot.date}T${slot.end}:00+01:00`,
              description: `Séance ${index + 1} du pack ${multipleBooking.serviceType}`,
            }));

            const multipleBookingPayload = {
              clientName: `${customerInfo.first_name} ${customerInfo.last_name}`,
              clientPhone: `${customerInfo.phoneCountryCode}${customerInfo.phone}`,
              clientEmail: customerInfo.email || null,
              packageName: `Pack ${multipleBooking.sessionCount} séances - ${multipleBooking.serviceType}`,
              packageDescription: `Pack promotionnel de ${multipleBooking.sessionCount} séances de ${multipleBooking.serviceType}`,
              bookings: bookingsData,
              sendWhatsAppConfirmation: sendWhatsAppConfirmation,
            };

            console.log("Envoi des réservations multiples (sans client Hiboutik):", multipleBookingPayload);

            const response = await fetch("/api/create-multiple-bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(multipleBookingPayload),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error || "Erreur lors de la création des réservations multiples"
              );
            }

            const responseData = await response.json();
            console.log("Réservations multiples créées avec succès (sans client Hiboutik):", responseData);
          } else {
            // Réservation simple sans client Hiboutik
            if (!selectedSlot) throw new Error("Aucun créneau sélectionné");
            const startDateTime = `${selectedSlot.date}T${selectedSlot.start}:00+01:00`;
            const endDateTime = `${selectedSlot.date}T${selectedSlot.end}:00+01:00`;
            
            const response = await fetch("/api/create-booking", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: generateCombinedServiceName(),
                start: startDateTime,
                end: endDateTime,
                clientName: `${customerInfo.first_name} ${customerInfo.last_name}`,
                clientPhone: `${customerInfo.phoneCountryCode}${customerInfo.phone}`,
                clientEmail: customerInfo.email || null,
                locationId: selectedLocation?.id || 1,
                sendWhatsAppConfirmation: sendWhatsAppConfirmation,
              }),
            });
            
            if (!response.ok) {
              throw new Error("Erreur lors de la création de la réservation");
            }
            
            const responseData = await response.json();
            console.log("Réservation simple créée avec succès (sans client Hiboutik):", responseData);
          }

          setBookingConfirmed(true);
          setBookingError(null);
          startTransition(() => {
            setBookingStep(5);
            setFadeOut(false);
          });
        } catch (bookingError: any) {
          setBookingError(bookingError.message || "Erreur lors de la création de la réservation");
          setFadeOut(false);
        }
      }
    } catch (error: any) {
      setBookingError(error.message || "Erreur lors de la réservation");
      setFadeOut(false);
    }
  };

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
            <LocationSelection
              locations={locations}
              onSelectLocation={selectLocation}
              onBack={goBack}
              isMultipleBooking={isMultipleBooking}
            />
          )}

          {bookingStep === 3 &&
            selectedServices.length > 0 &&
            selectedLocation && (
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
                  selectedLocation={selectedLocation}
                />
              </Suspense>
            )}

          {bookingStep === 4 &&
            ((selectedSlot && !isMultipleBooking) ||
              (isMultipleBooking &&
                multipleBooking &&
                multipleBooking.slots.length > 0)) &&
            selectedLocation && (
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
                  selectedLocation={selectedLocation}
                  sendWhatsAppConfirmation={sendWhatsAppConfirmation}
                  onToggleWhatsAppConfirmation={
                    handleToggleWhatsAppConfirmation
                  }
                />
              </Suspense>
            )}

          {bookingStep === 5 && bookingConfirmed && selectedLocation && (
            <BookingConfirmation
              services={selectedServices}
              slot={selectedSlot}
              customerInfo={customerInfo}
              isMultipleBooking={isMultipleBooking}
              multipleBooking={multipleBooking}
              selectedLocation={selectedLocation}
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

          {showClientFoundModal && existingClient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-2">
                  Client existant détecté
                </h3>
                <p className="mb-2 text-gray-700 dark:text-gray-300">
                  Un client existe déjà avec ce numéro de téléphone.
                  Souhaitez-vous l'utiliser pour cette réservation?
                </p>
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Information du client existant:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>
                      <b>Nom&nbsp;:</b>{" "}
                      {existingClient.customers_first_name || (
                        <span className="italic">Non renseigné</span>
                      )}{" "}
                      {existingClient.customers_last_name || (
                        <span className="italic">Non renseigné</span>
                      )}
                    </li>
                    <li>
                      <b>Email&nbsp;:</b>{" "}
                      {existingClient.customers_email ? (
                        existingClient.customers_email
                      ) : (
                        <span className="italic">Non renseigné</span>
                      )}
                    </li>
                    <li>
                      <b>Téléphone&nbsp;:</b>{" "}
                      {existingClient.customers_phone_number ? (
                        existingClient.customers_phone_number
                      ) : (
                        <span className="italic">Non renseigné</span>
                      )}
                    </li>
                  </ul>
                </div>
                {clientDiffs.length > 0 ? (
                  <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
                    <b>
                      Les informations que vous avez saisies diffèrent de celles
                      enregistrées:
                    </b>
                    <ul className="mt-2 space-y-1">
                      {clientDiffs.map((diff, idx) => (
                        <li key={idx}>
                          <b>{diff.field} :</b>{" "}
                          <span className="line-through text-red-500">
                            {diff.oldValue || (
                              <span className="italic">Non renseigné</span>
                            )}
                          </span>{" "}
                          →{" "}
                          <span className="text-green-700">
                            {diff.newValue || (
                              <span className="italic">Non renseigné</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2">
                      <p>Deux options s'offrent à vous:</p>
                      <ul className="mt-1 ml-4 list-disc">
                        <li>
                          Cliquez sur "Utiliser ce client" pour mettre à jour
                          les informations existantes
                        </li>
                        <li>
                          Cliquez sur "Créer nouveau client" pour créer un
                          nouveau profil client
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-xs">
                    <b>
                      Les informations sont identiques à celles déjà
                      enregistrées.
                    </b>
                    <p className="mt-1">
                      Vous pouvez utiliser ce client pour votre réservation ou
                      créer un nouveau profil.
                    </p>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button onClick={handleClientModalCancel} variant="outline">
                    Créer nouveau client
                  </Button>
                  <Button
                    onClick={handleClientModalConfirm}
                    className="bg-[#bfe0fb] text-white"
                  >
                    Utiliser ce client
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
