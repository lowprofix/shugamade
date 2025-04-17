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
} from "lucide-react";
import { fr } from "date-fns/locale";
import { parse, isEqual, format, addDays, isSameDay } from "date-fns";
import { Service as ServiceType } from "@/lib/data";
import { AvailableSlot } from "./BookingClientWrapper";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Styles pour les indicateurs de disponibilité
import "./date-time-selection.css";

// Hook supprimé et remplacé par des classes Tailwind pour le responsive design

interface DateTimeSelectionProps {
  service: ServiceType;
  onSelectSlot: (slot: AvailableSlot) => void;
  onBack: () => void;
  isMultipleBooking?: boolean;
  selectedSlots?: AvailableSlot[];
  addMultipleSlot?: (slot: AvailableSlot) => void;
  removeMultipleSlot?: (slot: AvailableSlot) => void;
  confirmMultipleSlots?: (sessionCount: number, serviceType: string) => void;
}

export default function DateTimeSelection({
  service,
  onSelectSlot,
  onBack,
  isMultipleBooking = false,
  selectedSlots = [],
  addMultipleSlot,
  removeMultipleSlot,
  confirmMultipleSlots,
}: DateTimeSelectionProps) {
  // États pour gérer le processus de réservation
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableDatesObj, setAvailableDatesObj] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
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
    durationMinutes: number,
    startDate?: string,
    additionalDays: number = 30
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construire l'URL avec les paramètres
      const params = new URLSearchParams();
      params.append("duration", durationMinutes.toString());
      params.append("days", additionalDays.toString());
      if (startDate) {
        params.append("startDate", startDate);
      }

      // Appel à l'API réelle avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout

      try {
        const response = await fetch(
          `/api/available-slots?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 500) {
            throw new Error(
              `Erreur serveur: Le serveur a rencontré un problème interne.`
            );
          } else if (response.status === 404) {
            throw new Error(
              `Erreur: L'API de réservation n'est pas disponible.`
            );
          } else {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || "Erreur lors de la récupération des créneaux"
          );
        }

        // Extraire les créneaux de la réponse
        const slots = data.data.slots as AvailableSlot[];

        // Log pour le débogage
        console.log(
          `Récupéré ${slots.length} créneaux disponibles:`,
          slots.slice(0, 3)
        );

        // Mise à jour des états avec les données reçues
        setAvailableDates(slots.map((slot) => slot.date));
        setAvailableDatesObj(slots.map((slot) => new Date(slot.date)));
        setAvailableSlots(slots);

        // Si c'est le chargement initial et que nous avons des dates disponibles, sélectionner la date du jour
        if (!initialLoadComplete && slots.length > 0) {
          const today = new Date();
          const formattedToday = formatToYYYYMMDD(today);

          if (slots.some((slot) => slot.date === formattedToday)) {
            selectDate(today);
          } else if (slots.length > 0) {
            // Sinon, sélectionner la première date disponible
            selectDate(new Date(slots[0].date));
          }
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err: any) {
      console.error("Erreur détaillée:", err);

      // Détection des types d'erreurs spécifiques
      if (err.name === "AbortError") {
        setError(
          "Le serveur met trop de temps à répondre. Veuillez réessayer ultérieurement."
        );
      } else if (
        err.message?.includes("fetch failed") ||
        err.cause?.code === "ENOTFOUND"
      ) {
        setError(
          "Impossible de se connecter au serveur de réservation. Le serveur semble être indisponible. Veuillez réessayer plus tard ou contacter le support."
        );
      } else if (err.message?.includes("Erreur serveur")) {
        setError(
          "Le serveur de réservation a rencontré un problème. Veuillez réessayer plus tard ou contacter le support."
        );
      } else {
        setError(
          "Une erreur est survenue lors de la récupération des créneaux disponibles. Veuillez réessayer."
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingMoreSlots(false);
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

    // Charger les créneaux pour le mois sélectionné
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    fetchAvailableSlots(
      service.durationMinutes || 30,
      formatToYYYYMMDD(startDate),
      31 // Nombre de jours à charger
    );
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

  // Fonction pour gérer la sélection d'un créneau pour une réservation multiple
  const handleMultipleSlotSelection = (slot: AvailableSlot) => {
    if (!isMultipleBooking || !addMultipleSlot || !removeMultipleSlot) return;

    // Vérifier si le créneau est déjà sélectionné
    const isSelected = selectedSlots.some(
      (s) => s.date === slot.date && s.start === slot.start
    );

    // Déterminer le nombre de séances en fonction du nom du service
    const sessionsNeeded = service.name.includes("4 séances") ? 4 : 6;
    setSessionCount(sessionsNeeded);

    // Déterminer le type de service en fonction du nom
    const serviceTypeStr = service.name.includes("Tempes")
      ? "Tempes"
      : "Tête entière";
    setServiceType(serviceTypeStr);

    if (isSelected) {
      // Si déjà sélectionné, le retirer
      removeMultipleSlot(slot);
    } else {
      // Si pas encore sélectionné, vérifier si on peut l'ajouter
      if (selectedSlots.length < sessionsNeeded) {
        addMultipleSlot(slot);
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
      await fetchAvailableSlots(service.durationMinutes || 30);

      // Sélectionner automatiquement la date du jour si des créneaux sont disponibles
      const today = new Date();
      const formattedToday = formatToYYYYMMDD(today);

      // Attendre que les créneaux soient chargés
      setInitialLoadComplete(true);

      // Vérifier si la date d'aujourd'hui a des créneaux disponibles
      if (availableDates.includes(formattedToday)) {
        selectDate(today);
      } else {
        // Si pas de créneaux aujourd'hui, sélectionner la première date disponible
        if (availableDatesObj.length > 0) {
          selectDate(availableDatesObj[0]);
        }
      }
    };

    loadInitialSlots();
  }, [service]);

  // Filtrer les créneaux pour la date sélectionnée
  const slotsForSelectedDate = selectedDate
    ? availableSlots.filter((slot) => slot.date === selectedDate)
    : [];

  return (
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

      {/* Informations sur le service sélectionné */}
      <div className="p-4 bg-gradient-to-r from-[#ffb2dd]/10 to-[#e2b3f7]/10 rounded-lg border border-[#ffb2dd]/30">
        <div className="flex items-start">
          <Info size={18} className="text-[#ffb2dd] mt-1 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white">
              {service.name}
            </h4>
            <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
              <Clock size={14} className="mr-1 flex-shrink-0" />
              <span>
                {service.duration} ({service.durationMinutes} minutes)
              </span>
              <span className="mx-2">•</span>
              <span className="font-medium text-[#ffb2dd]">
                {service.price}
              </span>
            </div>
            {isMultipleBooking && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Veuillez sélectionner{" "}
                {service.name.includes("4 séances") ? "4" : "6"} créneaux pour
                ce forfait.
              </p>
            )}
          </div>
        </div>
      </div>

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
                  {Array(7).fill(0).map((_, i) => (
                    <Skeleton key={`day-${i}`} className="h-4 w-full" />
                  ))}
                </div>
                {Array(5).fill(0).map((_, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2">
                    {Array(7).fill(0).map((_, dayIndex) => (
                      <Skeleton key={`day-${weekIndex}-${dayIndex}`} className="h-10 w-full rounded-md" />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Skeleton pour les créneaux horaires */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Array(8).fill(0).map((_, i) => (
                    <Skeleton key={`slot-${i}`} className="h-16 w-full rounded-md" />
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
                      <span className="font-medium">01 23 45 67 89</span> ou par
                      email à{" "}
                      <span className="font-medium">contact@shugamade.com</span>
                    </div>
                    <Button
                      onClick={() =>
                        fetchAvailableSlots(service.durationMinutes || 30)
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
                          {Array(3).fill(0).map((_, weekIndex) => (
                            <div key={`loading-week-${weekIndex}`} className="grid grid-cols-7 gap-1">
                              {Array(7).fill(0).map((_, dayIndex) => (
                                <Skeleton key={`loading-day-${weekIndex}-${dayIndex}`} className="h-8 w-full rounded-md" />
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
                            !availableDatesObj.some((d) => isSameDay(d, date)),
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
                        }}
                        modifiersClassNames={{
                          available: "has-available-slots",
                        }}
                        components={{
                          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                          IconRight: () => <ChevronRight className="h-4 w-4" />,
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
                            !availableDatesObj.some((d) => isSameDay(d, date)),
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
                        }}
                        modifiersClassNames={{
                          available: "has-available-slots",
                        }}
                        components={{
                          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                          IconRight: () => <ChevronRight className="h-4 w-4" />,
                        }}
                        onMonthChange={handleMonthChange}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                    Naviguez dans le calendrier pour voir plus de disponibilités
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
                            {service.durationMinutes} minutes
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {slotsForSelectedDate.map((slot, index) => {
                            // Vérifier si le créneau est déjà sélectionné (pour les réservations multiples)
                            const isSelected =
                              isMultipleBooking &&
                              selectedSlots.some(
                                (s) =>
                                  s.date === slot.date && s.start === slot.start
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
  );
}
