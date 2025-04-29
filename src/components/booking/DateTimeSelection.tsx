"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  ArrowLeft,
  Info,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fr } from "date-fns/locale";
import {
  parse,
  isEqual,
  format,
  addDays,
  isSameDay,
  differenceInDays,
} from "date-fns";
import { Service, Location } from "@/lib/data";
import { AvailableSlot } from "./BookingClientWrapper";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Styles pour les indicateurs de disponibilité
import "./date-time-selection.css";

// Hook supprimé et remplacé par des classes Tailwind pour le responsive design

interface DateTimeSelectionProps {
  services: Service[];
  combinedDuration: number;
  onSelectSlot: (slot: AvailableSlot) => void;
  onBack: () => void;
  isMultipleBooking: boolean;
  selectedSlots: AvailableSlot[];
  addMultipleSlot: (slot: AvailableSlot) => void;
  removeMultipleSlot: (slot: AvailableSlot) => void;
  confirmMultipleSlots: (sessionCount: number, serviceType: string) => void;
  selectedLocation: Location;
}

export default function DateTimeSelection({
  services,
  combinedDuration,
  onSelectSlot,
  onBack,
  isMultipleBooking = false,
  selectedSlots = [],
  addMultipleSlot,
  removeMultipleSlot,
  confirmMultipleSlots,
  selectedLocation,
}: DateTimeSelectionProps) {
  // États pour gérer le processus de réservation
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableDatesObj, setAvailableDatesObj] = useState<Date[]>([]);

  // Remplacer le tableau de créneaux par une Map pour éviter les doublons
  const [availableSlotsMap, setAvailableSlotsMap] = useState<
    Map<string, AvailableSlot>
  >(new Map());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // États pour la navigation dans le calendrier
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loadedMonths, setLoadedMonths] = useState<Date[]>([]);
  const [loadingMoreSlots, setLoadingMoreSlots] = useState(false);

  // États pour la réservation multiple
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [serviceType, setServiceType] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  // Nouvel état pour stocker les dates non valides (ne respectant pas l'intervalle de 2 semaines)
  const [invalidDates, setInvalidDates] = useState<Date[]>([]);
  // État pour afficher un message de guidage
  const [guidanceMessage, setGuidanceMessage] = useState<string | null>(null);

  // Fonction pour calculer le prix total des services
  const calculateTotalPrice = (services: Service[]): string => {
    if (services.length === 0) return "";

    // Calculer le prix total
    const total = services.reduce((sum, service) => {
      // Extraire le montant numérique du prix (ex: "10 000 FCFA" -> 10000)
      const priceMatch = service.price.match(/(\d+\s*\d*)/);
      if (!priceMatch) return sum;

      // Convertir en nombre en supprimant les espaces
      const priceValue = parseInt(priceMatch[0].replace(/\s+/g, ""), 10);
      return sum + priceValue;
    }, 0);

    // Formater le prix avec des espaces pour les milliers et ajouter la devise
    return `${total.toLocaleString("fr-FR")} FCFA`;
  };

  // Fonction pour formater la date pour l'affichage
  const formatDateString = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  };

  // Fonction pour formater la date au format yyyy-MM-dd
  const formatToYYYYMMDD = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  // Fonction pour récupérer les créneaux disponibles
  const fetchAvailableSlots = async (
    date: string
  ): Promise<AvailableSlot[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculer la durée totale du service en minutes pour la demande API
      const duration = combinedDuration || 30; // Durée par défaut de 30 minutes si non spécifiée

      // Appeler l'API avec les paramètres service et date
      const response = await fetch(
        `/api/get-available-slots?date=${date}&duration=${duration}&locationId=${selectedLocation.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP: ${response.status} - ${await response.text()}`
        );
      }

      const data = await response.json();
      return data.availableSlots;
    } catch (error) {
      console.error("Erreur lors de la récupération des créneaux:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger plus de créneaux lorsque l'utilisateur navigue dans le calendrier
  const loadMoreSlots = (month: Date) => {
    // Vérifier si le mois a déjà été chargé
    if (
      loadedMonths.some(
        (m) =>
          m.getMonth() === month.getMonth() &&
          m.getFullYear() === month.getFullYear()
      )
    ) {
      return;
    }

    setLoadingMoreSlots(true);

    // Préparer les dates stratégiques pour couvrir tout le mois
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const midOfMonth = new Date(month.getFullYear(), month.getMonth(), 15);

    // Date spécifique pour la fin du mois (pour s'assurer que le 31 est couvert)
    const lastDayOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    const endOfMonth = new Date(
      month.getFullYear(),
      month.getMonth(),
      lastDayOfMonth - 5
    ); // 5 jours avant la fin du mois

    // Tableau pour stocker toutes les promesses
    const promises = [
      fetchAvailableSlots(formatToYYYYMMDD(startOfMonth)),
      fetchAvailableSlots(formatToYYYYMMDD(midOfMonth)),
    ];

    // Ajouter une requête supplémentaire pour les mois de 30 ou 31 jours
    if (lastDayOfMonth > 28) {
      promises.push(fetchAvailableSlots(formatToYYYYMMDD(endOfMonth)));
    }

    // Attendre que toutes les requêtes soient terminées
    Promise.all(promises)
      .then((results) => {
        // Fusionner tous les créneaux obtenus
        const allSlots = results.flat();

        // Mettre à jour la Map des créneaux disponibles (évite les doublons par définition)
        setAvailableSlotsMap((prevMap) => {
          const newMap = new Map(prevMap);

          allSlots.forEach((slot) => {
            const key = `${slot.date}-${slot.start}-${slot.end}`;
            if (!newMap.has(key)) {
              newMap.set(key, slot);
            }
          });

          return newMap;
        });

        // Extraire les dates uniques des créneaux
        const uniqueDates = [...new Set(allSlots.map((slot) => slot.date))];

        // Mettre à jour les dates disponibles
        setAvailableDates((prevDates) => {
          const newDates = uniqueDates.filter(
            (date) => !prevDates.includes(date)
          );
          return [...prevDates, ...newDates];
        });

        // Convertir les dates en objets Date
        const uniqueDateObjects = uniqueDates.map(
          (dateStr) => new Date(dateStr)
        );

        // Mettre à jour les objets de dates disponibles
        setAvailableDatesObj((prevDates) => {
          const existingDateStrs = prevDates.map((d) => formatToYYYYMMDD(d));
          const newDateObjs = uniqueDateObjects.filter(
            (dateObj) => !existingDateStrs.includes(formatToYYYYMMDD(dateObj))
          );
          return [...prevDates, ...newDateObjs];
        });

        // Ajouter le mois à la liste des mois chargés
        setLoadedMonths((prevMonths) => [...prevMonths, new Date(month)]);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des créneaux:", error);
      })
      .finally(() => {
        setLoadingMoreSlots(false);
      });
  };

  // Fonction pour gérer le changement de mois dans le calendrier
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    loadMoreSlots(month);
  };

  // Fonction pour sélectionner une date
  const selectDate = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = formatToYYYYMMDD(date);
    setSelectedDate(dateStr);
    setSelectedDateObj(date);
  };

  // Nouvelle fonction utilitaire pour vérifier si un créneau respecte l'intervalle de 2 semaines
  const isValidSlotInterval = (
    newSlot: AvailableSlot,
    existingSlots: AvailableSlot[]
  ): boolean => {
    // Minimum 14 jours (2 semaines) entre chaque séance
    const MINIMUM_DAYS_BETWEEN_SESSIONS = 14;

    const newDate = new Date(newSlot.date);

    // Cette approche est maintenant harmonisée avec updateInvalidDates
    for (const slot of existingSlots) {
      const existingDate = new Date(slot.date);
      const daysDifference = Math.abs(differenceInDays(newDate, existingDate));

      // Vérifier que la différence est d'au moins 14 jours (2 semaines)
      if (daysDifference < MINIMUM_DAYS_BETWEEN_SESSIONS) {
        return false;
      }
    }

    return true;
  };

  // Fonction pour mettre à jour les dates non valides de manière optimisée
  const updateInvalidDates = (slots: AvailableSlot[]) => {
    if (!isMultipleBooking || slots.length === 0) {
      setInvalidDates([]);
      return;
    }

    // Même constante que dans isValidSlotInterval pour cohérence
    const MINIMUM_DAYS = 14; // 2 semaines

    // Filtrer toutes les dates disponibles en une seule opération
    const invalidDatesArray = availableDatesObj.filter((date) => {
      // Ne pas considérer les dates déjà sélectionnées comme invalides
      if (slots.some((slot) => isSameDay(new Date(slot.date), date))) {
        return false;
      }

      // Vérifier si cette date est trop proche d'une date sélectionnée
      // (utilise la même logique que isValidSlotInterval)
      for (const slot of slots) {
        const selectedDate = new Date(slot.date);
        const daysDifference = Math.abs(differenceInDays(date, selectedDate));

        if (daysDifference < MINIMUM_DAYS) {
          return true; // Date invalide
        }
      }

      return false; // Date valide
    });

    setInvalidDates(invalidDatesArray);
  };

  // Fonction mise à jour pour gérer la sélection d'un créneau pour une réservation multiple
  const handleMultipleSlotSelection = (slot: AvailableSlot) => {
    if (!isMultipleBooking || !addMultipleSlot || !removeMultipleSlot) return;

    // Vérifier si le créneau est déjà sélectionné
    const isSelected = selectedSlots.some(
      (s) => s.date === slot.date && s.start === slot.start
    );

    // Déterminer le nombre de séances en fonction du nom du service
    const sessionsNeeded = services[0].name.includes("4 séances") ? 4 : 6;
    setSessionCount(sessionsNeeded);

    // Déterminer le type de service en fonction du nom
    const serviceTypeStr = services[0].name.includes("Tempes")
      ? "Tempes"
      : "Tête entière";
    setServiceType(serviceTypeStr);

    if (isSelected) {
      // Si déjà sélectionné, le retirer
      removeMultipleSlot(slot);
      // Mettre à jour les dates non valides après suppression
      const updatedSlots = selectedSlots.filter(
        (s) => s.date !== slot.date || s.start !== slot.start
      );
      updateInvalidDates(updatedSlots);
      // Réinitialiser le message de guidage
      setGuidanceMessage(
        selectedSlots.length > 1
          ? "Sélectionnez des créneaux espacés d'au moins 2 semaines."
          : null
      );
    } else {
      // Si pas encore sélectionné, vérifier si on peut l'ajouter
      if (selectedSlots.length < sessionsNeeded) {
        // Vérifier l'intervalle de 2 semaines avec les créneaux déjà sélectionnés
        if (
          selectedSlots.length === 0 ||
          isValidSlotInterval(slot, selectedSlots)
        ) {
          addMultipleSlot(slot);
          // Mettre à jour les dates non valides après ajout
          const updatedSlots = [...selectedSlots, slot];
          updateInvalidDates(updatedSlots);
          // Mettre à jour le message de guidage
          setGuidanceMessage(
            updatedSlots.length < sessionsNeeded
              ? "Sélectionnez des créneaux espacés d'au moins 2 semaines."
              : null
          );
        } else {
          setValidationError(
            "Les séances doivent être espacées d'au moins 2 semaines."
          );
          // Effacer le message d'erreur après 3 secondes
          setTimeout(() => {
            setValidationError(null);
          }, 3000);
        }
      } else {
        setValidationError(
          `Vous ne pouvez sélectionner que ${sessionsNeeded} séances pour ce forfait.`
        );
        // Effacer le message d'erreur après 3 secondes
        setTimeout(() => {
          setValidationError(null);
        }, 3000);
      }
    }
  };

  // Fonction pour confirmer la sélection des créneaux multiples
  const handleConfirmMultipleSlots = () => {
    if (!isMultipleBooking || !confirmMultipleSlots) return;

    // Vérifier si le nombre de créneaux sélectionnés correspond au nombre requis
    if (selectedSlots.length !== sessionCount) {
      setValidationError(
        `Veuillez sélectionner exactement ${sessionCount} séances.`
      );

      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => {
        setValidationError(null);
      }, 3000);

      return;
    }

    // Confirmer la sélection
    confirmMultipleSlots(sessionCount, serviceType);
  };

  // Charger les créneaux disponibles au chargement du composant et sélectionner automatiquement la date du jour
  useEffect(() => {
    const loadInitialSlots = async () => {
      const slots = await fetchAvailableSlots(formatToYYYYMMDD(new Date()));

      // Mettre à jour la Map des créneaux disponibles
      const slotsMap = new Map();
      slots.forEach((slot) => {
        const key = `${slot.date}-${slot.start}-${slot.end}`;
        slotsMap.set(key, slot);
      });
      setAvailableSlotsMap(slotsMap);

      // Extraire les dates uniques des créneaux
      const uniqueDates = [...new Set(slots.map((slot) => slot.date))];
      setAvailableDates(uniqueDates);

      // Convertir les dates en objets Date
      const uniqueDateObjects = uniqueDates.map((dateStr) => new Date(dateStr));
      setAvailableDatesObj(uniqueDateObjects);

      // Ajouter le mois actuel à la liste des mois chargés
      const currentDate = new Date();
      setLoadedMonths([
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      ]);

      // Attendre que les créneaux soient chargés
      setInitialLoadComplete(true);

      // Vérifier si la date d'aujourd'hui a des créneaux disponibles
      const today = new Date();
      const formattedToday = formatToYYYYMMDD(today);

      // Vérifier si la date d'aujourd'hui a des créneaux disponibles
      if (uniqueDates.includes(formattedToday)) {
        selectDate(today);
      } else {
        // Si pas de créneaux aujourd'hui, sélectionner la première date disponible
        if (uniqueDateObjects.length > 0) {
          selectDate(uniqueDateObjects[0]);
        }
      }
    };

    loadInitialSlots();
  }, [services, combinedDuration, selectedLocation?.id]); // Ajouter selectedLocation?.id pour recharger quand le lieu change

  // Mettre à jour invalidDates quand les créneaux sélectionnés changent
  useEffect(() => {
    if (isMultipleBooking) {
      updateInvalidDates(selectedSlots);

      // Afficher le message de guidage quand l'utilisateur commence à sélectionner des créneaux
      if (selectedSlots.length > 0 && selectedSlots.length < sessionCount) {
        setGuidanceMessage(
          "Sélectionnez des créneaux espacés d'au moins 2 semaines. Les dates avec un point bleu sont disponibles, celles avec un point rose sont trop proches de vos sélections actuelles."
        );
      } else if (selectedSlots.length === 0) {
        setGuidanceMessage(
          "Sélectionnez votre première séance parmi les dates disponibles (point bleu)."
        );
      } else {
        setGuidanceMessage(null);
      }
    }
  }, [isMultipleBooking, selectedSlots, sessionCount]);

  // Préchargement des mois futurs pour les réservations multiples
  useEffect(() => {
    if (isMultipleBooking && initialLoadComplete) {
      // Précharger les mois pour les prochaines séances (espacées de 2 semaines)
      const today = new Date();
      const monthsToLoad: Date[] = [];

      // Calculer le nombre de mois à précharger en fonction du nombre de séances
      const sessionsNeeded = services[0].name.includes("4 séances") ? 4 : 6;

      // Ajout des mois prévus pour les séances futures (en estimant une séance toutes les 2 semaines)
      for (let i = 0; i < Math.ceil(sessionsNeeded / 2); i++) {
        const futureMonth = new Date(today);
        futureMonth.setMonth(today.getMonth() + i);

        // Vérifier si ce mois n'est pas déjà chargé
        if (
          !loadedMonths.some(
            (m) =>
              m.getMonth() === futureMonth.getMonth() &&
              m.getFullYear() === futureMonth.getFullYear()
          )
        ) {
          monthsToLoad.push(futureMonth);
        }
      }

      // Précharger les mois identifiés
      if (monthsToLoad.length > 0) {
        console.log(
          `Préchargement de ${monthsToLoad.length} mois futurs pour réservation multiple`
        );
        monthsToLoad.forEach((month, index) => {
          setTimeout(
            () => loadMoreSlots(month),
            300 * index // Décaler les requêtes pour ne pas surcharger l'API
          );
        });
      }
    }
  }, [isMultipleBooking, initialLoadComplete, services[0]?.name, loadedMonths]);

  // Filtrer les créneaux pour la date sélectionnée depuis la Map
  const slotsForSelectedDate = selectedDate
    ? Array.from(availableSlotsMap.values()).filter(
        (slot) => slot.date === selectedDate
      )
    : [];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Sélectionnez une date et un horaire
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
        {isMultipleBooking
          ? "Choisissez les dates et horaires pour vos séances"
          : "Choisissez une date et un horaire pour votre réservation"}
        {" à l'institut de "}
        <span className="font-semibold">
          {selectedLocation.name.replace("Institut ShugaMade - ", "")}
        </span>
      </p>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center text-xl font-medium text-gray-800 dark:text-white">
            <CalendarIcon className="mr-2 text-[#bfe0fb]" size={20} />
            Choisissez une date et un horaire
          </h3>

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

        {/* Informations sur les services sélectionnés */}
        <Card className="mb-6 overflow-hidden border-none shadow-md bg-gradient-to-r from-white to-[#bfe0fb]/5 dark:from-gray-900 dark:to-[#bfe0fb]/10">
          <CardContent className="p-4">
            {services.length === 1 ? (
              // Affichage d'un seul service
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">
                  {services[0].name}
                </h4>
                <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                  <Clock size={14} className="mr-1 flex-shrink-0" />
                  <span>
                    {services[0].duration} ({services[0].durationMinutes}{" "}
                    minutes)
                  </span>
                  <span className="mx-2">•</span>
                  <span className="font-medium text-[#ffb2dd]">
                    {services[0].price}
                  </span>
                </div>
                {isMultipleBooking && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Veuillez sélectionner{" "}
                    {services[0].name.includes("4 séances") ? "4" : "6"}{" "}
                    créneaux pour ce forfait, espacés d'au moins 2 semaines
                    chacun.
                  </p>
                )}
              </div>
            ) : (
              // Affichage de plusieurs services
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">
                  Services combinés
                </h4>
                <div className="mt-2 space-y-2">
                  {services.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {service.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} className="mr-1 flex-shrink-0" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#ffb2dd]">
                        {service.price}
                      </span>
                    </div>
                  ))}

                  {/* Affichage du total */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Durée totale: {combinedDuration} minutes
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#ffb2dd]">
                      {calculateTotalPrice(services)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message de guidage pour les réservations multiples */}
        {guidanceMessage && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm flex items-start">
            <AlertCircle
              size={16}
              className="text-blue-500 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
            />
            <span className="text-blue-600 dark:text-blue-400">
              {guidanceMessage}
            </span>
          </div>
        )}

        {/* Message d'erreur de validation */}
        {validationError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {validationError}
          </div>
        )}

        {/* Sélection de date et d'heure */}
        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0">
            {isLoading && !loadingMoreSlots ? (
              <div className="p-6 space-y-6">
                {/* Skeleton pour le calendrier */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array(7)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={`day-${i}`} className="h-4 w-full" />
                      ))}
                  </div>
                  {Array(5)
                    .fill(0)
                    .map((_, weekIndex) => (
                      <div
                        key={`week-${weekIndex}`}
                        className="grid grid-cols-7 gap-2"
                      >
                        {Array(7)
                          .fill(0)
                          .map((_, dayIndex) => (
                            <Skeleton
                              key={`day-${weekIndex}-${dayIndex}`}
                              className="h-10 w-full rounded-md"
                            />
                          ))}
                      </div>
                    ))}
                </div>

                {/* Skeleton pour les créneaux horaires */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton
                          key={`slot-${i}`}
                          className="h-16 w-full rounded-md"
                        />
                      ))}
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 sm:p-6 text-center">
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-medium text-red-800 dark:text-red-300 mb-1 sm:mb-2">
                        Problème de connexion
                      </h3>
                      <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-2 sm:mb-3">
                        {error}
                      </p>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                        Si le problème persiste, vous pouvez nous contacter
                        directement par téléphone au{" "}
                        <span className="font-medium">01 23 45 67 89</span> ou
                        par email à{" "}
                        <span className="font-medium">
                          contact@shugamade.com
                        </span>
                      </div>
                      <Button
                        onClick={() =>
                          fetchAvailableSlots(formatToYYYYMMDD(new Date()))
                        }
                        className="bg-[#bfe0fb] hover:bg-[#9deaff] text-white text-sm sm:text-base py-1.5 h-auto sm:h-10"
                      >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Réessayer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                  {/* Calendrier */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sélectionnez une date
                    </h4>
                    <div className="relative  max-w-full">
                      {loadingMoreSlots && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 rounded-lg">
                          <div className="space-y-2 w-full p-4">
                            {Array(3)
                              .fill(0)
                              .map((_, weekIndex) => (
                                <div
                                  key={`loading-week-${weekIndex}`}
                                  className="grid grid-cols-7 gap-1"
                                >
                                  {Array(7)
                                    .fill(0)
                                    .map((_, dayIndex) => (
                                      <Skeleton
                                        key={`loading-day-${weekIndex}-${dayIndex}`}
                                        className="h-8 w-full rounded-md"
                                      />
                                    ))}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {/* Calendrier pour mobile et tablette (1 mois) */}
                      <div className="block lg:hidden">
                        <Calendar
                          mode="single"
                          selected={selectedDateObj || undefined}
                          onSelect={selectDate}
                          disabled={[
                            { before: new Date() },
                            (date) =>
                              !availableDatesObj.some((d) =>
                                isSameDay(d, date)
                              ) ||
                              (isMultipleBooking &&
                                invalidDates.some((d) => isSameDay(d, date))),
                          ]}
                          locale={fr}
                          numberOfMonths={1}
                          className="rounded-lg  p-3 w-full"
                          classNames={{
                            day_selected:
                              "bg-[#bfe0fb] text-white hover:bg-[#9deaff] hover:text-white focus:bg-[#9deaff] focus:text-white",
                            day_today:
                              "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                            day_outside:
                              "text-gray-300 dark:text-gray-600 opacity-50",
                            day_disabled: "text-gray-300 dark:text-gray-600",
                            day_range_middle:
                              "bg-[#bfe0fb]/20 text-gray-900 dark:text-gray-100",
                            day_hidden: "invisible",
                          }}
                          modifiers={{
                            available: availableDatesObj,
                            invalid: invalidDates,
                          }}
                          modifiersClassNames={{
                            available: "has-available-slots",
                            invalid: "has-invalid-interval",
                          }}
                          components={{
                            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                            IconRight: () => (
                              <ChevronRight className="h-4 w-4" />
                            ),
                          }}
                          onMonthChange={handleMonthChange}
                        />
                      </div>

                      {/* Calendrier pour grands écrans (2 mois) */}
                      <div className="hidden lg:block">
                        <Calendar
                          mode="single"
                          selected={selectedDateObj || undefined}
                          onSelect={selectDate}
                          disabled={[
                            { before: new Date() },
                            (date) =>
                              !availableDatesObj.some((d) =>
                                isSameDay(d, date)
                              ) ||
                              (isMultipleBooking &&
                                invalidDates.some((d) => isSameDay(d, date))),
                          ]}
                          locale={fr}
                          numberOfMonths={2}
                          className="rounded-lg  p-3 w-full"
                          classNames={{
                            day_selected:
                              "bg-[#bfe0fb] text-white hover:bg-[#9deaff] hover:text-white focus:bg-[#9deaff] focus:text-white",
                            day_today:
                              "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                            day_outside:
                              "text-gray-300 dark:text-gray-600 opacity-50",
                            day_disabled: "text-gray-300 dark:text-gray-600",
                            day_range_middle:
                              "bg-[#bfe0fb]/20 text-gray-900 dark:text-gray-100",
                            day_hidden: "invisible",
                          }}
                          modifiers={{
                            available: availableDatesObj,
                            invalid: invalidDates,
                          }}
                          modifiersClassNames={{
                            available: "has-available-slots",
                            invalid: "has-invalid-interval",
                          }}
                          components={{
                            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                            IconRight: () => (
                              <ChevronRight className="h-4 w-4" />
                            ),
                          }}
                          onMonthChange={handleMonthChange}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                      {isMultipleBooking
                        ? "Point bleu = date disponible | Point rose = date trop proche de vos séances déjà sélectionnées"
                        : "Naviguez dans le calendrier pour voir plus de disponibilités"}
                    </div>
                  </div>

                  {/* Sélection du créneau */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sélectionnez un horaire
                    </h4>
                    {selectedDate ? (
                      slotsForSelectedDate.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="mb-2">
                            Aucun créneau disponible pour cette date.
                          </p>
                          <p className="text-sm">
                            Veuillez sélectionner une autre date.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                            <p className="font-medium">
                              {formatDateString(selectedDate)}
                            </p>
                            <p className="text-xs mt-1">
                              Chaque créneau a une durée de{" "}
                              {services.length > 1
                                ? combinedDuration
                                : services[0].durationMinutes}{" "}
                              minutes
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {slotsForSelectedDate.map((slot, index) => {
                              // Vérifier si le créneau est déjà sélectionné (pour les réservations multiples)
                              const isSelected =
                                isMultipleBooking &&
                                selectedSlots.some(
                                  (s) =>
                                    s.date === slot.date &&
                                    s.start === slot.start
                                );

                              // Trouver l'index du créneau sélectionné (pour afficher le numéro de séance)
                              const selectedIndex = isMultipleBooking
                                ? selectedSlots.findIndex(
                                    (s) =>
                                      s.date === slot.date &&
                                      s.start === slot.start
                                  )
                                : -1;

                              return (
                                <Button
                                  key={index}
                                  variant={isSelected ? "default" : "outline"}
                                  className={cn(
                                    "relative transition-all duration-300 h-auto py-3",
                                    isSelected
                                      ? "bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] text-white hover:from-[#9deaff] hover:to-[#bfe0fb] shadow-sm"
                                      : "hover:bg-[#bfe0fb]/10 hover:text-[#9deaff] hover:border-[#bfe0fb]"
                                  )}
                                  onClick={() =>
                                    isMultipleBooking
                                      ? handleMultipleSlotSelection(slot)
                                      : onSelectSlot(slot)
                                  }
                                >
                                  <div className="text-center w-full">
                                    <div className="text-sm font-medium">
                                      {slot.start}
                                    </div>
                                    <div className="text-xs mt-1 opacity-80">
                                      {slot.end}
                                    </div>

                                    {isSelected && (
                                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ffb2dd] text-white text-xs flex items-center justify-center shadow-sm">
                                        {selectedIndex + 1}
                                      </div>
                                    )}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>

                          {/* Bouton de confirmation pour les réservations multiples */}
                          {isMultipleBooking && selectedSlots.length > 0 && (
                            <div className="mt-6">
                              <Button
                                className={cn(
                                  "w-full transition-all duration-300",
                                  selectedSlots.length === sessionCount
                                    ? "bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] text-white hover:from-[#e2b3f7] hover:to-[#ffb2dd] shadow-sm"
                                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                                )}
                                disabled={selectedSlots.length !== sessionCount}
                                onClick={handleConfirmMultipleSlots}
                              >
                                {selectedSlots.length === sessionCount ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirmer les {sessionCount} séances
                                  </>
                                ) : (
                                  `Sélectionnez ${
                                    sessionCount - selectedSlots.length
                                  } séance(s) supplémentaire(s)`
                                )}
                              </Button>
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p>Veuillez d'abord sélectionner une date.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
