"use client";

import { useState, useEffect } from "react";
import { Service as ServiceType } from "@/lib/data";
import { Suspense, useTransition } from "react";
import ServiceSelectionClient from "./ServiceSelectionClient";
import DateTimeSelectionClient from "./DateTimeSelectionClient";
import CustomerInfoClient from "./CustomerInfoClient";
import BookingConfirmationClient from "./BookingConfirmationClient";
import ServicesSkeleton from "@/components/skeletons/ServicesSkeleton";
import CalendarSkeleton from "@/components/skeletons/CalendarSkeleton";
import CustomerFormSkeleton from "@/components/skeletons/CustomerFormSkeleton";

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
      // Cette fonction sera gérée différemment dans le composant DateTimeSelectionClient
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
    if (selectedSlots.length === sessionCount) {
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
    }
  };

  // Fonction pour gérer les changements dans les informations client
  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  // Fonction pour confirmer la réservation
  const confirmBooking = () => {
    setFadeOut(true);
    
    // Délai pour l'animation de transition
    setTimeout(() => {
      setBookingConfirmed(true);
      startTransition(() => {
        setBookingStep(4);
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
        setBookingStep(bookingStep - 1);
        setFadeOut(false);
      });
    }, 300);
  };

  return (
    <>
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
          <div className="w-10 h-1 mx-1 bg-gray-200">
            <div
              className={`h-1 ${
                bookingStep >= 3 ? "bg-teal-400" : "bg-gray-200"
              }`}
              style={{ width: bookingStep >= 3 ? "100%" : "0%" }}
            ></div>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              bookingStep >= 3 ? "bg-teal-400 text-white" : "bg-gray-200"
            }`}
          >
            3
          </div>
          <div className="w-10 h-1 mx-1 bg-gray-200">
            <div
              className={`h-1 ${
                bookingStep >= 4 ? "bg-teal-400" : "bg-gray-200"
              }`}
              style={{ width: bookingStep >= 4 ? "100%" : "0%" }}
            ></div>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              bookingStep >= 4 ? "bg-teal-400 text-white" : "bg-gray-200"
            }`}
          >
            4
          </div>
        </div>
      </div>

      {bookingStep === 1 && (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServiceSelectionClient 
              services={services} 
              onSelectService={selectService} 
            />
          </Suspense>
        </div>
      )}

      {bookingStep === 2 && selectedService && (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <Suspense fallback={<CalendarSkeleton />}>
            <DateTimeSelectionClient 
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
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <Suspense fallback={<CustomerFormSkeleton />}>
            <CustomerInfoClient 
              customerInfo={customerInfo} 
              onChange={handleCustomerInfoChange} 
              onConfirm={confirmBooking} 
              onBack={goBack} 
              service={selectedService} 
              slot={selectedSlot} 
              isMultipleBooking={isMultipleBooking}
              multipleBooking={multipleBooking}
            />
          </Suspense>
        </div>
      )}

      {bookingStep === 4 && selectedService && bookingConfirmed && (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <BookingConfirmationClient 
            service={selectedService} 
            slot={selectedSlot} 
            customerInfo={customerInfo} 
            isMultipleBooking={isMultipleBooking}
            multipleBooking={multipleBooking}
          />
        </div>
      )}
    </>
  );
}
