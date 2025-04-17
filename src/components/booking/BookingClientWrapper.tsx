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

// Type pour les créneaux disponibles
export interface AvailableSlot {
  date: string;      // Format YYYY-MM-DD
  start: string;     // Format HH:MM
  end: string;       // Format HH:MM
  duration: number;  // Durée en minutes
}

// Type pour les réservations multiples (pour les packs promo)
export interface MultipleBooking {
  slots: AvailableSlot[];
  sessionCount: number; // Nombre de séances (4 ou 6)
  serviceType: string;  // Type de service ("Tempes" ou "Tête entière")
}

// Type pour les informations client
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

interface BookingClientWrapperProps {
  services: ServiceType[];
}

export default function BookingClientWrapper({ services }: BookingClientWrapperProps) {
  // États pour gérer le processus de réservation
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<AvailableSlot[]>([]);
  const [isMultipleBooking, setIsMultipleBooking] = useState(false);
  const [multipleBooking, setMultipleBooking] = useState<MultipleBooking | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "" });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // États pour les transitions et animations
  const [isPending, startTransition] = useTransition();
  const [fadeOut, setFadeOut] = useState(false);

  // Fonction pour sélectionner un service
  const selectService = (service: ServiceType) => {
    setFadeOut(true);
    
    // Délai pour l'animation de transition
    setTimeout(() => {
      setSelectedService(service);
      
      // Vérifier si c'est un service de type "Promo Pack"
      const isPromoPackService = service.isPromo && 
        (service.name.includes("Promo 4 séances") || service.name.includes("Promo 6 séances"));
      
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
    setSelectedSlots(prev => [...prev, slot]);
  };
  
  // Fonction pour supprimer un créneau d'une réservation multiple
  const removeMultipleSlot = (slotToRemove: AvailableSlot) => {
    setSelectedSlots(prev => prev.filter(slot => 
      !(slot.date === slotToRemove.date && slot.start === slotToRemove.start)
    ));
  };
  
  // Fonction pour confirmer la sélection de créneaux multiples
  const confirmMultipleSlots = (sessionCount: number, serviceType: string) => {
    setFadeOut(true);
    
    // Délai pour l'animation de transition
    setTimeout(() => {
      setMultipleBooking({
        slots: selectedSlots,
        sessionCount,
        serviceType
      });
      
      startTransition(() => {
        setBookingStep(3);
        setFadeOut(false);
      });
    }, 300);
  };
  
  // Fonction pour gérer les changements dans les informations client
  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        customers_first_name: customerInfo.name.split(' ')[0] || customerInfo.name,
        customers_last_name: customerInfo.name.split(' ').slice(1).join(' ') || '',
        customers_phone_number: customerInfo.phone,
        customers_email: customerInfo.email || ''
      };
      
      try {
        // Appeler l'API Hiboutik pour créer le client
        const hiboutikResponse = await fetch('/api/hiboutik/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hiboutikClientData)
        });
        
        if (!hiboutikResponse.ok) {
          console.warn('Échec de la création du client dans Hiboutik, mais la réservation continuera:', 
            await hiboutikResponse.text());
        } else {
          const hiboutikData = await hiboutikResponse.json();
          hiboutikClientId = hiboutikData.customers_id;
          console.log('Client créé dans Hiboutik avec ID:', hiboutikClientId);
        }
      } catch (hiboutikError) {
        console.warn('Erreur lors de la création du client dans Hiboutik, mais la réservation continuera:', 
          hiboutikError);
      }
      
      // 2. Préparer les données de réservation (comme avant, mais avec l'ID Hiboutik)
      // Créer une copie des données client pour ne pas modifier la structure originale
      const customerInfoWithHiboutik = { ...customerInfo };
      
      // Ajouter l'ID Hiboutik dans un champ séparé qui n'affectera pas la structure existante
      const bookingData = {
        title: `Réservation - ${selectedService?.name} - ${customerInfo.name}`,
        description: `Réservation pour ${customerInfo.name}, Tél: ${customerInfo.phone}${customerInfo.email ? `, Email: ${customerInfo.email}` : ''}`,
        service: selectedService,
        customer: customerInfoWithHiboutik,
        isPartOfPackage: isMultipleBooking,
        // Ajouter l'ID Hiboutik dans un champ séparé qui n'affectera pas la structure existante
        hiboutikClientId: hiboutikClientId
      };
      
      // Utiliser un timeout pour les requêtes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes de timeout
      
      try {
        if (isMultipleBooking && multipleBooking) {
          // Réservation multiple
          const bookingPromises = multipleBooking.slots.map(async (slot) => {
            const startDateTime = `${slot.date}T${slot.start}:00+01:00`;
            const endDateTime = `${slot.date}T${slot.end}:00+01:00`;
            
            const response = await fetch('/api/create-booking', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...bookingData,
                start: startDateTime,
                end: endDateTime,
                packageInfo: {
                  sessionCount: multipleBooking.sessionCount,
                  serviceType: multipleBooking.serviceType
                }
              }),
              signal: controller.signal
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
            }
            
            return response.json();
          });
          
          // Attendre que toutes les réservations soient créées
          const results = await Promise.all(bookingPromises);
          console.log('Résultats des réservations multiples:', results);
          
          // Vérifier si l'une des réservations a échoué
          const failedBooking = results.find(result => !result.success);
          if (failedBooking) {
            throw new Error(failedBooking.error || 'Une des réservations a échoué');
          }
        } else if (selectedSlot) {
          // Réservation simple
          const startDateTime = `${selectedSlot.date}T${selectedSlot.start}:00+01:00`;
          const endDateTime = `${selectedSlot.date}T${selectedSlot.end}:00+01:00`;
          
          const response = await fetch('/api/create-booking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...bookingData,
              start: startDateTime,
              end: endDateTime
            }),
            signal: controller.signal
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log('Résultat de la réservation:', result);
          
          if (!result.success) {
            throw new Error(result.error || 'La réservation a échoué');
          }
        }
        
        clearTimeout(timeoutId);
        
        // Passer à l'étape de confirmation
        setBookingConfirmed(true);
        startTransition(() => {
          setBookingStep(4);
          setFadeOut(false);
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la réservation:', error);
      
      // Détection des types d'erreurs spécifiques
      if (error.name === 'AbortError') {
        setBookingError("Le serveur met trop de temps à répondre. Veuillez réessayer ultérieurement.");
      } else if (error.message?.includes('fetch failed') || error.cause?.code === 'ENOTFOUND') {
        setBookingError("Impossible de se connecter au serveur de réservation. Le serveur semble être indisponible. Veuillez réessayer plus tard ou nous contacter directement.");
      } else if (error.message?.includes('Erreur HTTP: 500')) {
        setBookingError("Le serveur a rencontré une erreur lors du traitement de votre réservation. Veuillez réessayer ou nous contacter directement.");
      } else {
        setBookingError("Une erreur est survenue lors de la création de votre réservation. Veuillez réessayer.");
      }
      
      setFadeOut(false);
    }
  };
  
  // Fonction pour revenir à l'étape précédente
  const goBack = () => {
    setFadeOut(true);
    
    // Délai pour l'animation de transition
    setTimeout(() => {
      if (bookingStep === 3 && isMultipleBooking) {
        // Si on est à l'étape 3 avec une réservation multiple, on revient à l'étape 2
        setMultipleBooking(null);
      }
      
      startTransition(() => {
        setBookingStep(prev => Math.max(1, prev - 1));
        setFadeOut(false);
      });
    }, 300);
  };

  // Définir les étapes du processus de réservation
  const steps = [
    { id: 1, label: "Service", icon: "service" },
    { id: 2, label: "Date & Heure", icon: "calendar" },
    { id: 3, label: "Vos Informations", icon: "user" },
    { id: 4, label: "Confirmation", icon: "check" }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Indicateur d'étape */}
      <div className="px-6 pt-6 pb-2">
        <BookingStepIndicator 
          steps={steps} 
          currentStep={bookingStep} 
          isPending={isPending}
        />
      </div>
      
      <div className="p-6">
        {bookingStep === 1 && (
          <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <Suspense fallback={<ServicesSkeleton />}>
              <ServiceSelection 
                services={services} 
                onSelectService={selectService} 
              />
            </Suspense>
          </div>
        )}

        {bookingStep === 2 && selectedService && (
          <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <Suspense fallback={<CalendarSkeleton />}>
              <DateTimeSelection 
                service={selectedService} 
                onSelectSlot={selectSlot} 
                onBack={goBack} 
                isMultipleBooking={isMultipleBooking}
                selectedSlots={selectedSlots}
                addMultipleSlot={addMultipleSlot}
                removeMultipleSlot={removeMultipleSlot}
                confirmMultipleSlots={confirmMultipleSlots}
              />
            </Suspense>
          </div>
        )}

        {bookingStep === 3 && selectedService && (
          <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <Suspense fallback={<CustomerFormSkeleton />}>
              {bookingError ? (
                <div className="mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-medium text-red-800 dark:text-red-300 mb-1 sm:mb-2">Erreur de réservation</h3>
                      <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-2 sm:mb-3">{bookingError}</p>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                        Si le problème persiste, vous pouvez nous contacter directement par téléphone au <span className="font-medium">01 23 45 67 89</span> ou par email à <span className="font-medium">contact@shugamade.com</span>
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
              ) : (
                <CustomerInfoForm 
                  customerInfo={customerInfo} 
                  onChange={handleCustomerInfoChange} 
                  onConfirm={confirmBooking} 
                  onBack={goBack} 
                  service={selectedService} 
                  slot={selectedSlot} 
                  isMultipleBooking={isMultipleBooking}
                  multipleBooking={multipleBooking}
                />
              )}
            </Suspense>
          </div>
        )}

        {bookingStep === 4 && selectedService && bookingConfirmed && (
          <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <BookingConfirmation 
              service={selectedService} 
              slot={selectedSlot} 
              customerInfo={customerInfo} 
              isMultipleBooking={isMultipleBooking}
              multipleBooking={multipleBooking}
            />
          </div>
        )}
      </div>
    </div>
  );
}
