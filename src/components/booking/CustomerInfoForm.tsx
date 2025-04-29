"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service as ServiceType, Location } from "@/lib/data";
import {
  AvailableSlot,
  CustomerInfo,
  MultipleBooking,
} from "./BookingClientWrapper";
import {
  ArrowLeft,
  User,
  Check,
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onConfirm: () => void;
  onBack: () => void;
  services: ServiceType[];
  slot: AvailableSlot | null;
  isMultipleBooking: boolean;
  multipleBooking: MultipleBooking | null;
  selectedLocation: Location;
  sendWhatsAppConfirmation: boolean;
  onToggleWhatsAppConfirmation: (enabled: boolean) => void;
}

// Liste des indicatifs téléphoniques courants
const countryPhoneCodes = [
  { code: "+242", country: "Congo" },
  { code: "+243", country: "RDC" },
  { code: "+241", country: "Gabon" },
  { code: "+235", country: "Tchad" },
  { code: "+33", country: "France" },
  { code: "+1", country: "USA/CA" },
  { code: "+32", country: "Belgique" },
];

// Type pour le statut de vérification WhatsApp
type WhatsAppStatus = "unchecked" | "checking" | "available" | "unavailable";

export default function CustomerInfoForm({
  customerInfo,
  onChange,
  onConfirm,
  onBack,
  services,
  slot,
  isMultipleBooking,
  multipleBooking,
  selectedLocation,
  sendWhatsAppConfirmation,
  onToggleWhatsAppConfirmation,
}: CustomerInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappStatus, setWhatsappStatus] =
    useState<WhatsAppStatus>("unchecked");
  const [lastCheckedNumber, setLastCheckedNumber] = useState<string>("");

  // Fonction pour vérifier si un numéro est enregistré sur WhatsApp
  const checkWhatsAppNumber = useCallback(
    async (phoneNumber: string) => {
      // Éviter les vérifications inutiles sur des numéros vides ou déjà vérifiés
      if (!phoneNumber.trim() || phoneNumber === lastCheckedNumber) return;

      try {
        setWhatsappStatus("checking");

        // Formater le numéro de téléphone complet avec l'indicatif
        const fullPhoneNumber =
          customerInfo.phoneCountryCode + phoneNumber.replace(/\s+/g, "");

        // Appel de l'API pour vérifier si le numéro est sur WhatsApp
        const response = await fetch("/api/whatsapp/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
          }),
        });

        const data = await response.json();

        setWhatsappStatus(data.isWhatsApp ? "available" : "unavailable");
        setLastCheckedNumber(phoneNumber);
      } catch (error) {
        console.error("Erreur lors de la vérification WhatsApp:", error);
        setWhatsappStatus("unavailable");
      }
    },
    [customerInfo.phoneCountryCode, lastCheckedNumber]
  );

  // Utilisation de useEffect pour vérifier le numéro WhatsApp après un délai de saisie
  useEffect(() => {
    if (customerInfo.phone.length >= 9) {
      const timer = setTimeout(() => {
        checkWhatsAppNumber(customerInfo.phone);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setWhatsappStatus("unchecked");
    }
  }, [customerInfo.phone, customerInfo.phoneCountryCode, checkWhatsAppNumber]);

  // Fonction pour calculer la durée totale des services
  const calculateTotalDuration = (): number => {
    return services.reduce((total, service) => {
      // Utiliser durationMinutes si disponible, sinon extraire de la chaîne de caractères
      if (service.durationMinutes) {
        return total + service.durationMinutes;
      }

      // Extraire les minutes de la chaîne de caractères (ex: "30 min" -> 30)
      const durationMatch = service.duration.match(/(\d+)/);
      return total + (durationMatch ? parseInt(durationMatch[0], 10) : 0);
    }, 0);
  };

  // Fonction pour calculer le prix total des services
  const calculateTotalPrice = (): string => {
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
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  // Fonction pour valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = "Veuillez entrer votre nom";
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = "Veuillez entrer votre numéro de téléphone";
    } else if (!/^[0-9\s]{8,15}$/.test(customerInfo.phone.trim())) {
      // Modifié pour ne pas inclure le + dans le numéro (désormais dans phoneCountryCode)
      newErrors.phone = "Veuillez entrer un numéro de téléphone valide";
    }

    if (
      customerInfo.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim())
    ) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Simuler un délai pour l'envoi du formulaire
      setTimeout(() => {
        onConfirm();
        setIsSubmitting(false);
      }, 800);
    }
  };

  // Rendu du statut WhatsApp
  const renderWhatsAppStatus = () => {
    switch (whatsappStatus) {
      case "checking":
        return (
          <div className="flex items-center text-gray-600 text-xs mt-1">
            <Loader2 className="w-3 h-3 mr-1 animate-spin text-gray-500" />
            Vérification WhatsApp en cours...
          </div>
        );
      case "available":
        return (
          <div className="flex items-center text-green-600 text-xs mt-1">
            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
            Numéro enregistré sur WhatsApp
          </div>
        );
      case "unavailable":
        return (
          <div className="flex items-center text-orange-600 text-xs mt-1">
            <XCircle className="w-3 h-3 mr-1 text-orange-500" />
            Numéro non enregistré sur WhatsApp (SMS utilisé pour les rappels)
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-xl font-medium text-gray-800 dark:text-white">
          <User className="mr-2 text-[#e2b3f7]" size={20} />
          Vos informations
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div>
          <Card className="overflow-hidden border-none shadow-md">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={onChange}
                      className={cn(
                        "pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e2b3f7]/50 focus:border-transparent",
                        errors.name
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                      placeholder="Votre nom et prénom"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap md:flex-nowrap">
                    <div className="relative w-full md:w-auto mb-2 md:mb-0">
                      <select
                        name="phoneCountryCode"
                        value={customerInfo.phoneCountryCode}
                        onChange={onChange}
                        className="pl-2 pr-6 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-r-none md:rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e2b3f7]/50 focus:border-transparent w-full"
                      >
                        {countryPhoneCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} ({country.country})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1 w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={onChange}
                        className={cn(
                          "pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800 border rounded-lg md:rounded-l-none md:rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e2b3f7]/50 focus:border-transparent",
                          errors.phone
                            ? "border-red-300 dark:border-red-700"
                            : "border-gray-200 dark:border-gray-700"
                        )}
                        placeholder="Numéro (ex: 06 xxx xx xx)"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Entrez votre numéro sans l'indicatif pays
                  </p>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                  {/* Affichage du statut WhatsApp */}
                  {renderWhatsAppStatus()}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email{" "}
                    <span className="text-gray-400 text-xs">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email || ""}
                      onChange={onChange}
                      className={cn(
                        "pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e2b3f7]/50 focus:border-transparent",
                        errors.email
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                      placeholder="Votre adresse email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Switch pour activer/désactiver les notifications WhatsApp */}
                <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <MessageSquare className="w-4 h-4 text-[#bfe0fb] mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notifications WhatsApp
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Recevoir les confirmations et rappels par WhatsApp
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={sendWhatsAppConfirmation}
                      onCheckedChange={onToggleWhatsAppConfirmation}
                      className="data-[state=checked]:bg-[#bfe0fb]"
                    />
                  </div>

                  {whatsappStatus === "unavailable" && (
                    <div className="flex items-center text-orange-600 text-xs mt-2">
                      <AlertCircle className="w-3 h-3 mr-1 text-orange-500" />
                      Votre numéro n'est pas détecté sur WhatsApp. Les
                      notifications seront envoyées par SMS.
                    </div>
                  )}
                </div>

                <div className="p-4 mt-2 rounded-lg bg-[#ffb2dd]/10 border border-[#ffb2dd]/20">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-[#ffb2dd] mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Un acompte de 5 000 FCFA est requis pour confirmer votre
                      réservation. Les instructions de paiement vous seront
                      envoyées après la confirmation.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] text-white hover:from-[#ffb2dd] hover:to-[#e2b3f7] transition-all duration-300 shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirmer la réservation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Récapitulatif de la réservation */}
        <div>
          <Card className="overflow-hidden border-none shadow-md">
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-800 dark:text-white mb-3">
                  Récapitulatif de la réservation
                </h4>

                {isMultipleBooking ? (
                  // Affichage pour les réservations multiples (forfaits)
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffb2dd]/20 mr-3 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#ffb2dd]" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-white">
                          {services[0].name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {services[0].description}
                        </p>
                        <p className="text-sm font-medium text-[#ffb2dd] mt-1">
                          {services[0].price}
                        </p>
                      </div>
                    </div>

                    {/* Liste des créneaux réservés pour les forfaits */}
                    {multipleBooking && multipleBooking.slots.length > 0 && (
                      <div className="mt-4 pl-11">
                        <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {multipleBooking.slots.length} séances réservées:
                        </h6>
                        <div className="space-y-2 mt-3">
                          {multipleBooking.slots.map((slot, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-[#bfe0fb]/10 p-2 rounded-lg"
                            >
                              <div className="w-5 h-5 rounded-full bg-[#bfe0fb] text-white text-xs flex items-center justify-center mr-2">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                  {formatDateString(slot.date)}
                                </p>
                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>
                                    {slot.start} - {slot.end}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : services.length === 1 ? (
                  // Affichage pour un seul service (réservation simple)
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffb2dd]/20 mr-3 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#ffb2dd]" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-white">
                          {services[0].name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {services[0].description}
                        </p>
                        <p className="text-sm font-medium text-[#ffb2dd] mt-1">
                          {services[0].price}
                        </p>
                      </div>
                    </div>

                    {/* Date et heure pour réservation simple */}
                    {!isMultipleBooking && slot && (
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#bfe0fb]/20 mr-3 flex-shrink-0">
                          <Clock className="w-4 h-4 text-[#bfe0fb]" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-white">
                            Date et heure
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 capitalize">
                            {formatDateString(slot.date)}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Affichage pour plusieurs services (sélection multiple)
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffb2dd]/20 mr-3 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#ffb2dd]" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 dark:text-white">
                          Services combinés
                        </h5>

                        <div className="mt-2 space-y-2">
                          {services.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {service.name}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Clock
                                    size={12}
                                    className="mr-1 flex-shrink-0"
                                  />
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
                                Durée totale: {calculateTotalDuration()} minutes
                              </span>
                            </div>
                            <span className="text-sm font-medium text-[#ffb2dd]">
                              {calculateTotalPrice()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Récapitulatif de la réservation */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Récapitulatif de votre réservation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Service:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-right">
                        {services.map((s) => s.name).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Lieu:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-right">
                        {selectedLocation.name}
                      </span>
                    </div>
                    {!isMultipleBooking && slot && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Date:
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-right">
                            {formatDateString(slot.date)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Heure:
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-right">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
