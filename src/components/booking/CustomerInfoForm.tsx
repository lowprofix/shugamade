"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service as ServiceType } from "@/lib/data";
import { AvailableSlot, CustomerInfo, MultipleBooking } from "./BookingClientWrapper";
import { ArrowLeft, User, Check, Calendar, Clock, Phone, Mail, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  onBack: () => void;
  service: ServiceType;
  slot: AvailableSlot | null;
  isMultipleBooking: boolean;
  multipleBooking: MultipleBooking | null;
}

export default function CustomerInfoForm({
  customerInfo,
  onChange,
  onConfirm,
  onBack,
  service,
  slot,
  isMultipleBooking,
  multipleBooking
}: CustomerInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else if (!/^[0-9+\s]{8,15}$/.test(customerInfo.phone.trim())) {
      newErrors.phone = "Veuillez entrer un numéro de téléphone valide";
    }
    
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim())) {
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={onChange}
                      className={cn(
                        "pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e2b3f7]/50 focus:border-transparent",
                        errors.phone 
                          ? "border-red-300 dark:border-red-700" 
                          : "border-gray-200 dark:border-gray-700"
                      )}
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-gray-400 text-xs">(optionnel)</span>
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
                
                <div className="p-4 mt-2 rounded-lg bg-[#ffb2dd]/10 border border-[#ffb2dd]/20">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-[#ffb2dd] mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Un acompte de 5 000 FCFA est requis pour confirmer votre réservation. Les instructions de paiement vous seront envoyées après la confirmation.
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Récapitulatif de votre réservation
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e2b3f7]/20 mr-3 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#e2b3f7]" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">{service.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {service.description}
                    </p>
                    <p className="text-sm font-medium text-[#ffb2dd] mt-1">
                      {service.price}
                    </p>
                  </div>
                </div>
                
                {!isMultipleBooking && slot && (
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#bfe0fb]/20 mr-3 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#bfe0fb]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">Date et heure</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 capitalize">
                        {formatDateString(slot.date)}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{slot.start} - {slot.end}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {isMultipleBooking && multipleBooking && (
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#bfe0fb]/20 mr-3 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#bfe0fb]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">
                        Vos {multipleBooking.sessionCount} séances
                      </h5>
                      <div className="mt-2 space-y-2">
                        {multipleBooking.slots.map((slot, index) => (
                          <div key={index} className="flex items-center bg-[#bfe0fb]/10 p-2 rounded-lg">
                            <div className="w-5 h-5 rounded-full bg-[#bfe0fb] text-white text-xs flex items-center justify-center mr-2">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                {formatDateString(slot.date)}
                              </p>
                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{slot.start} - {slot.end}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {service.includes && service.includes.length > 0 && (
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9deaff]/20 mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-[#9deaff]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">Ce service inclut</h5>
                      <ul className="mt-2 space-y-1">
                        {service.includes.map((item, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                            <Check className="w-3 h-3 mt-1 mr-1 text-[#9deaff]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {service.isPromo && (
                  <div className="p-3 bg-[#ffb2dd]/10 rounded-lg mt-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#ffb2dd]/20 flex items-center justify-center mr-2">
                        <Check className="w-4 h-4 text-[#ffb2dd]" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Kit SHUGAMADE offert</span> avec ce forfait
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
