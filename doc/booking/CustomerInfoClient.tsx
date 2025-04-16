"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service as ServiceType } from "@/lib/data";
import { ArrowLeft, Check, Clock, Info } from "lucide-react";
import { AvailableSlot, CustomerInfo, MultipleBooking } from "./BookingClientWrapper";
import { useState } from "react";

interface CustomerInfoClientProps {
  customerInfo: CustomerInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  onBack: () => void;
  service: ServiceType;
  slot: AvailableSlot | null;
  isMultipleBooking?: boolean;
  multipleBooking?: MultipleBooking | null;
}

export default function CustomerInfoClient({
  customerInfo,
  onChange,
  onConfirm,
  onBack,
  service,
  slot,
  isMultipleBooking = false,
  multipleBooking = null,
  isLoading,
  error
}: CustomerInfoClientProps & { isLoading?: boolean; error?: string | null }) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).format(date);
  };

  // Fonction pour valider le formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!customerInfo.name.trim()) {
      errors.name = "Le nom est requis";
    }
    
    if (!customerInfo.phone.trim()) {
      errors.phone = "Le numéro de téléphone est requis";
    } else if (!/^[0-9+\s]{8,15}$/.test(customerInfo.phone.trim())) {
      errors.phone = "Numéro de téléphone invalide";
    }
    
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim())) {
      errors.email = "Email invalide";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (!isMultipleBooking && slot) {
        // Réservation simple
        const response = await fetch('/api/create-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `${service.name} - ${customerInfo.name}`,
            description: `Téléphone: ${customerInfo.phone}${customerInfo.email ? `, Email: ${customerInfo.email}` : ''}, Service: ${service.name}`,
            start: `${slot.date}T${slot.start}:00`,
            end: `${slot.date}T${slot.end}:00`,
            service: service.id,
            customer: customerInfo
          }),
        });
        
        if (response.ok) {
          onConfirm();
        } else {
          const data = await response.json();
          setValidationErrors({ form: data.message || "Une erreur est survenue lors de la réservation" });
        }
      } else if (isMultipleBooking && multipleBooking) {
        // Réservation multiple
        const bookingPromises = multipleBooking.slots.map((slot, index) => {
          return fetch('/api/create-booking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `${service.name} (${index + 1}/${multipleBooking.sessionCount}) - ${customerInfo.name}`,
              description: `Téléphone: ${customerInfo.phone}${customerInfo.email ? `, Email: ${customerInfo.email}` : ''}, ` +
                          `Service: ${service.name}, Type: ${multipleBooking.serviceType}, ` +
                          `Séance ${index + 1}/${multipleBooking.sessionCount}`,
              start: `${slot.date}T${slot.start}:00`,
              end: `${slot.date}T${slot.end}:00`,
              service: service.id,
              customer: customerInfo,
              isPartOfPackage: true,
              packageInfo: {
                sessionCount: multipleBooking.sessionCount,
                serviceType: multipleBooking.serviceType,
                sessionNumber: index + 1
              }
            }),
          });
        });
        
        // Exécuter toutes les réservations en parallèle
        const results = await Promise.all(bookingPromises);
        
        // Vérifier si toutes les réservations ont réussi
        const allSuccessful = results.every(response => response.ok);
        const successCount = results.filter(response => response.ok).length;
        
        if (allSuccessful) {
          setSuccessMessage(`Toutes vos ${multipleBooking.sessionCount} séances ont été réservées avec succès!`);
          // Ajouter un délai pour que l'utilisateur puisse voir le message de succès
          setTimeout(() => {
            onConfirm();
          }, 1500);
        } else if (successCount > 0) {
          // Certaines réservations ont réussi, mais pas toutes
          setSuccessMessage(`${successCount} sur ${multipleBooking.sessionCount} séances ont été réservées avec succès.`);
          setValidationErrors({ 
            form: `Attention: Certaines séances n'ont pas pu être réservées. Veuillez nous contacter pour finaliser votre réservation.` 
          });
          // Ajouter un délai plus long pour que l'utilisateur puisse lire le message d'erreur
          setTimeout(() => {
            onConfirm();
          }, 3000);
        } else {
          setValidationErrors({ form: "Une erreur est survenue lors de la réservation des séances. Veuillez réessayer ou nous contacter directement." });
        }
      }
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      setValidationErrors({ form: "Une erreur est survenue lors de la réservation" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center text-sm text-gray-500 hover:text-teal-500"
            disabled={submitting}
          >
            <ArrowLeft size={16} className="mr-1" /> Retour à la sélection de l'horaire
          </Button>
          <div className="px-3 py-1 text-sm text-teal-700 rounded-full bg-teal-50">
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
            
            {isMultipleBooking && multipleBooking ? (
              <>
                <div className="flex items-start text-sm text-teal-700">
                  <Clock size={16} className="mr-2 mt-1 text-teal-500" />
                  <div>
                    <span className="font-medium">Séances ({multipleBooking.sessionCount}):</span>
                    <ul className="mt-1 ml-2 space-y-1">
                      {multipleBooking.slots.map((slot, index) => (
                        <li key={index} className="flex items-center">
                          <span className="font-medium text-xs mr-1">{index + 1}.</span>
                          <span>{formatDate(slot.date)} à {slot.start}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center text-sm text-teal-700">
                  <Info size={16} className="mr-2 text-teal-500" />
                  <span className="font-medium">Type:</span>
                  <span className="ml-2">{multipleBooking.serviceType}</span>
                </div>
              </>
            ) : slot ? (
              <>
                <div className="flex items-center text-sm text-teal-700">
                  <Clock size={16} className="mr-2 text-teal-500" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{formatDate(slot.date)}</span>
                </div>
                <div className="flex items-center text-sm text-teal-700">
                  <Clock size={16} className="mr-2 text-teal-500" />
                  <span className="font-medium">Heure:</span>
                  <span className="ml-2">{slot.start}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <h3 className="flex items-center mb-6 text-xl font-light text-gray-800">
          <Info className="mr-2 text-teal-400" size={20} />
          Vos informations de contact
        </h3>

        {error && (
          <div className="p-4 mb-6 text-red-600 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {validationErrors.form && (
          <div className="p-4 mb-6 text-red-600 rounded-lg bg-red-50">
            {validationErrors.form}
          </div>
        )}
        
        {successMessage && (
          <div className="p-4 mb-6 text-green-600 rounded-lg bg-green-50 border border-green-100 animate-pulse">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={customerInfo.name}
              onChange={onChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                validationErrors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Votre nom complet"
              disabled={submitting}
            />
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={onChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                validationErrors.phone ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Votre numéro de téléphone"
              disabled={submitting}
            />
            {validationErrors.phone && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (optionnel)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerInfo.email || ""}
              onChange={onChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                validationErrors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Votre adresse email"
              disabled={submitting}
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={submitting}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Retour
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-teal-500 text-white hover:bg-teal-600"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isMultipleBooking 
                    ? `Réservation de ${multipleBooking?.sessionCount || 0} séances en cours...` 
                    : "Confirmation en cours..."}
                </>
              ) : (
                isMultipleBooking 
                  ? `Confirmer les ${multipleBooking?.sessionCount || 0} séances` 
                  : "Confirmer la réservation"
              )}
            </Button>
          </div>
        </form>

        <div className="p-3 mt-6 bg-yellow-50 rounded-md border border-yellow-100">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Important :</span> Un acompte de 5 000 FCFA est requis pour confirmer votre réservation. Vous recevrez les instructions de paiement après confirmation.
          </p>
          {isMultipleBooking && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Note pour les packs :</span> Pour les forfaits de plusieurs séances, un seul acompte de 5 000 FCFA est requis pour l'ensemble du forfait.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
