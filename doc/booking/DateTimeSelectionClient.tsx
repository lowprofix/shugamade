"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Check, Clock, ArrowLeft, Info } from "lucide-react";
import { fr } from 'date-fns/locale';
import { parse, isEqual, format } from 'date-fns';
import { Service as ServiceType } from "@/lib/data";
import { AvailableSlot } from "./BookingClientWrapper";


// Hook pour détecter si l'écran est large
const useIsLargeScreen = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  useEffect(() => {
    // Vérifier si window est défini (côté client uniquement)
    if (typeof window !== 'undefined') {
      const checkScreenSize = () => {
        setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint in Tailwind
      };
      
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);
  
  return isLargeScreen;
};

interface DateTimeSelectionClientProps {
  service: ServiceType;
  onSelectSlot: (slot: AvailableSlot) => void;
  onBack: () => void;
  isMultipleBooking?: boolean;
  selectedSlots?: AvailableSlot[];
  addMultipleSlot?: (slot: AvailableSlot) => void;
  removeMultipleSlot?: (slot: AvailableSlot) => void;
  confirmMultipleSlots?: (sessionCount: number, serviceType: string) => void;
}

export default function DateTimeSelectionClient({ 
  service, 
  onSelectSlot, 
  onBack,
  isMultipleBooking = false,
  selectedSlots = [],
  addMultipleSlot,
  removeMultipleSlot,
  confirmMultipleSlots
}: DateTimeSelectionClientProps) {
  const isLargeScreen = useIsLargeScreen();
  
  // États pour gérer le processus de réservation
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableDatesObj, setAvailableDatesObj] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la navigation dans le calendrier
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loadedMonths, setLoadedMonths] = useState<Date[]>([]);
  const [loadingMoreSlots, setLoadingMoreSlots] = useState(false);
  
  // États pour la réservation multiple
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [serviceType, setServiceType] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fonction pour formater la date pour l'affichage
  const formatDateString = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).format(date);
  };

  // Fonction pour formater la date au format yyyy-MM-dd
  const formatToYYYYMMDD = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Fonction pour récupérer les créneaux disponibles
  const fetchAvailableSlots = async (durationMinutes: number, startDate?: string, additionalDays: number = 30) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construire l'URL avec les paramètres
      let url = `/api/available-slots?duration=${durationMinutes}&days=${additionalDays}`;
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const slots = data.data.slots as AvailableSlot[];
        
        // Extraire les dates uniques
        const uniqueDates = [...new Set(slots.map(slot => slot.date))] as string[];
        
        // Convertir les dates string en objets Date
        const dateObjects = uniqueDates.map(dateStr => parse(dateStr, 'yyyy-MM-dd', new Date()));
        
        // Si c'est le premier chargement, initialiser les états
        if (availableDates.length === 0) {
          setAvailableDates(uniqueDates);
          setAvailableDatesObj(dateObjects);
          setAvailableSlots(slots);
          
          // Si des dates sont disponibles, sélectionner la première par défaut
          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
            setSelectedDateObj(parse(uniqueDates[0], 'yyyy-MM-dd', new Date()));
          }
          
          // Marquer le mois actuel comme chargé
          setLoadedMonths([new Date()]);
        } else {
          // Fusionner les nouvelles dates avec les dates existantes
          const allDates = [...new Set([...availableDates, ...uniqueDates])];
          setAvailableDates(allDates);
          
          // Fusionner les nouveaux objets Date avec les objets Date existants
          const allDateObjects = [...availableDatesObj];
          dateObjects.forEach(dateObj => {
            if (!allDateObjects.some(existingDate => isEqual(existingDate, dateObj))) {
              allDateObjects.push(dateObj);
            }
          });
          setAvailableDatesObj(allDateObjects);
          
          // Fusionner les nouveaux créneaux avec les créneaux existants
          const allSlots = [...availableSlots];
          slots.forEach(slot => {
            if (!allSlots.some(existingSlot => 
              existingSlot.date === slot.date && 
              existingSlot.start === slot.start && 
              existingSlot.end === slot.end
            )) {
              allSlots.push(slot);
            }
          });
          setAvailableSlots(allSlots);
          
          // Ajouter le mois chargé à la liste des mois chargés
          const newMonth = new Date(startDate || '');
          if (!isNaN(newMonth.getTime())) {
            setLoadedMonths(prev => {
              if (!prev.some(month => 
                month.getMonth() === newMonth.getMonth() && 
                month.getFullYear() === newMonth.getFullYear()
              )) {
                return [...prev, newMonth];
              }
              return prev;
            });
          }
        }
      } else {
        setError("Impossible de récupérer les créneaux disponibles");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des créneaux:", err);
      setError("Une erreur est survenue lors de la récupération des créneaux");
    } finally {
      setIsLoading(false);
      setLoadingMoreSlots(false);
    }
  };

  // Fonction pour charger plus de créneaux lorsque l'utilisateur navigue dans le calendrier
  const loadMoreSlots = async (month: Date) => {
    // Vérifier si ce mois a déjà été chargé
    const isMonthLoaded = loadedMonths.some(loadedMonth => 
      loadedMonth.getMonth() === month.getMonth() && 
      loadedMonth.getFullYear() === month.getFullYear()
    );
    
    if (!isMonthLoaded) {
      setLoadingMoreSlots(true);
      
      // Formater la date pour l'API
      const startDate = formatToYYYYMMDD(month);
      
      // Récupérer les créneaux pour ce mois
      await fetchAvailableSlots(service.durationMinutes || 30, startDate);
    }
  };

  // Fonction pour gérer le changement de mois dans le calendrier
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    loadMoreSlots(month);
  };

  // Fonction pour sélectionner une date
  const selectDate = (date: Date | undefined) => {
    if (date) {
      const dateStr = formatToYYYYMMDD(date);
      setSelectedDate(dateStr);
      setSelectedDateObj(date);
    }
  };
  
  // Fonction pour gérer la sélection d'un créneau pour une réservation multiple
  const handleMultipleSlotSelection = (slot: AvailableSlot) => {
    if (!addMultipleSlot || !removeMultipleSlot) return;
    
    // Vérifier si le créneau est déjà sélectionné
    const isSlotSelected = selectedSlots.some(
      s => s.date === slot.date && s.start === slot.start
    );
    
    if (isSlotSelected) {
      // Si le créneau est déjà sélectionné, le supprimer
      removeMultipleSlot(slot);
    } else {
      // Si le nombre maximum de créneaux est déjà atteint, afficher une erreur
      if (selectedSlots.length >= sessionCount) {
        setValidationError(`Vous ne pouvez sélectionner que ${sessionCount} créneaux pour ce pack.`);
        return;
      }
      
      // Vérifier que les créneaux sont espacés de 2 semaines
      if (selectedSlots.length > 0) {
        // Convertir les dates des créneaux déjà sélectionnés en objets Date
        const selectedDates = selectedSlots.map(s => new Date(s.date));
        const newSlotDate = new Date(slot.date);
        
        // Vérifier que le nouveau créneau est espacé d'au moins 14 jours de tous les créneaux déjà sélectionnés
        const isTwoWeeksApart = selectedDates.every(date => {
          const diffTime = Math.abs(newSlotDate.getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 14;
        });
        
        if (!isTwoWeeksApart) {
          setValidationError("Les séances doivent être espacées d'au moins 2 semaines.");
          return;
        }
      }
      
      // Ajouter le créneau à la liste des créneaux sélectionnés
      addMultipleSlot(slot);
      setValidationError(null);
    }
  };
  
  // Fonction pour confirmer la sélection des créneaux multiples
  const handleConfirmMultipleSlots = () => {
    if (!confirmMultipleSlots) return;
    
    if (selectedSlots.length !== sessionCount) {
      setValidationError(`Vous devez sélectionner exactement ${sessionCount} créneaux pour ce pack.`);
      return;
    }
    
    confirmMultipleSlots(sessionCount, serviceType);
  };

  // Filtrer les créneaux pour la date sélectionnée
  const slotsForSelectedDate = availableSlots.filter(
    slot => slot.date === selectedDate
  );

  // Charger les créneaux disponibles au chargement du composant
  useEffect(() => {
    fetchAvailableSlots(service.durationMinutes || 30);
    
    // Déterminer le nombre de séances et le type de service pour les packs promo
    if (isMultipleBooking && service) {
      // Extraire le nombre de séances (4 ou 6) du nom du service
      if (service.name.includes("4 séances")) {
        setSessionCount(4);
      } else if (service.name.includes("6 séances")) {
        setSessionCount(6);
      }
      
      // Extraire le type de service (Tempes ou Tête entière) du nom du service
      if (service.name.includes("Tempes")) {
        setServiceType("Tempes");
      } else if (service.name.includes("Tête entière")) {
        setServiceType("Tête entière");
      }
    }
  }, [service, isMultipleBooking]);

  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center text-sm text-gray-500 hover:text-teal-500"
          >
            <ArrowLeft size={16} className="mr-1" /> Retour aux services
          </Button>
          <div className="px-3 py-1 text-sm text-teal-700 bg-teal-50 rounded-full">
            {service.name}
          </div>
        </div>

        {/* Section récapitulative des informations précédemment validées */}
        <div className="p-4 mb-6 bg-teal-50 rounded-lg">
          <h4 className="mb-2 font-medium text-teal-800">Récapitulatif</h4>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-teal-700">
              <Check size={16} className="mr-2 text-teal-500" />
              <span className="font-medium">Service:</span>
              <span className="ml-2">{service.name}</span>
            </div>
            {service.durationMinutes && (
              <div className="flex items-center text-sm text-teal-700">
                <Clock size={16} className="mr-2 text-teal-500" />
                <span className="font-medium">Durée:</span>
                <span className="ml-2">{service.durationMinutes} minutes</span>
              </div>
            )}
            {service.price && (
              <div className="flex items-center text-sm text-teal-700">
                <Info size={16} className="mr-2 text-teal-500" />
                <span className="font-medium">Prix:</span>
                <span className="ml-2">{service.price} €</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="flex items-center mb-6 text-xl font-light text-gray-800">
          <CalendarIcon className="mr-2 text-teal-400" size={20} />
          Choisissez votre date et heure
        </h3>
        
        {isMultipleBooking && (
          <div className="p-4 mb-6 bg-yellow-50 border border-yellow-100 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Réservation multiple</h4>
            <p className="text-sm text-gray-600 mb-2">
              Pour ce pack promo, vous devez sélectionner <strong>{sessionCount} dates</strong> espacées de <strong>2 semaines</strong> chacune.
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <Info size={16} className="mr-2 text-yellow-500" />
              <span>Sélectionné : {selectedSlots.length} / {sessionCount} séances</span>
            </div>
            {validationError && (
              <div className="mt-2 text-sm text-red-600">
                {validationError}
              </div>
            )}
          </div>
        )}

        {isLoading && !loadingMoreSlots && (
          <div className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-teal-400 animate-spin"></div>
            <p className="mt-4 text-gray-600">
              Chargement des disponibilités...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Sélection de la date avec le calendrier */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">Sélectionnez une date</h4>
                <div className="relative p-2 rounded-md border">
                  {loadingMoreSlots && (
                    <div className="flex absolute inset-0 z-10 justify-center items-center bg-white/70">
                      <div className="w-8 h-8 rounded-full border-b-2 border-teal-400 animate-spin"></div>
                    </div>
                  )}
                  <Calendar
                    mode="single"
                    selected={selectedDateObj || undefined}
                    onSelect={selectDate}
                    numberOfMonths={isLargeScreen ? 2 : 1}
                    month={currentMonth}
                    disabled={(date) => {
                      // Désactiver les dates passées
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) return true;
                      
                      // Désactiver les dates non disponibles
                      return !availableDatesObj.some(availableDate => 
                        isEqual(availableDate, date)
                      );
                    }}
                    modifiers={{
                      available: availableDatesObj
                    }}
                    modifiersClassNames={{
                      available: "available-day"
                    }}
                    components={{
                      DayContent: ({ date, displayMonth }) => {
                        const isAvailable = availableDatesObj.some(availableDate => 
                          isEqual(availableDate, date)
                        );
                        
                        return (
                          <div className="flex relative justify-center items-center w-full h-full">
                            <span>{date.getDate()}</span>
                            {isAvailable && (
                              <div className="absolute -top-0.5 right-0.5 w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                            )}
                          </div>
                        );
                      }
                    }}
                    locale={fr}
                    className="rounded-md border"
                    onMonthChange={handleMonthChange}
                  />
                </div>
                <div className="mt-2 text-xs italic text-gray-500">
                  Naviguez dans le calendrier pour voir plus de disponibilités
                </div>
              </div>

              {/* Sélection du créneau */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">Sélectionnez un horaire</h4>
                {selectedDate ? (
                  slotsForSelectedDate.length === 0 ? (
                    <div className="p-4 text-gray-500 bg-gray-50 rounded-md">
                      Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-xs text-gray-500">
                        Chaque créneau a une durée de {service.durationMinutes} minutes
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {slotsForSelectedDate.map((slot, index) => {
                          // Vérifier si le créneau est déjà sélectionné (pour les réservations multiples)
                          const isSelected = isMultipleBooking && selectedSlots.some(
                            s => s.date === slot.date && s.start === slot.start
                          );
                          
                          return (
                            <Button
                              key={index}
                              variant={isSelected ? "default" : "outline"}
                              className={isSelected 
                                ? "bg-teal-500 text-white hover:bg-teal-600" 
                                : "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"}
                              onClick={() => isMultipleBooking 
                                ? handleMultipleSlotSelection(slot) 
                                : onSelectSlot(slot)}
                            >
                              <div className="text-center w-full">
                                <div className="text-sm">
                                  {slot.start}
                                </div>
                                {isSelected && (
                                  <div className="text-xs mt-1">
                                    Séance {selectedSlots.findIndex(
                                      s => s.date === slot.date && s.start === slot.start
                                    ) + 1}
                                  </div>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                      
                      {/* Bouton de confirmation pour les réservations multiples */}
                      {isMultipleBooking && selectedSlots.length > 0 && (
                        <div className="mt-4">
                          <Button 
                            className="w-full bg-teal-500 text-white hover:bg-teal-600"
                            disabled={selectedSlots.length !== sessionCount}
                            onClick={handleConfirmMultipleSlots}
                          >
                            {selectedSlots.length === sessionCount 
                              ? "Confirmer les séances" 
                              : `Sélectionnez ${sessionCount - selectedSlots.length} séance(s) supplémentaire(s)`}
                          </Button>
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <div className="p-4 text-gray-500 bg-gray-50 rounded-md">
                    Veuillez d'abord sélectionner une date.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
