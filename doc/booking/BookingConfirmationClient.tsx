"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service as ServiceType } from "@/lib/data";
import { AvailableSlot, CustomerInfo, MultipleBooking } from "./BookingClientWrapper";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface BookingConfirmationClientProps {
  service: ServiceType;
  slot: AvailableSlot | null;
  customerInfo: CustomerInfo;
  isMultipleBooking?: boolean;
  multipleBooking?: MultipleBooking | null;
}

export default function BookingConfirmationClient({
  service,
  slot,
  customerInfo,
  isMultipleBooking = false,
  multipleBooking = null
}: BookingConfirmationClientProps) {
  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-teal-100 rounded-full">
            <Check className="text-teal-500" size={32} />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-teal-700">
              {isMultipleBooking 
                ? `Pack de ${multipleBooking?.sessionCount || 0} séances confirmé` 
                : "Réservation confirmée"}
            </CardTitle>
          </CardHeader>
          <p className="text-gray-600">
            {isMultipleBooking 
              ? `Vos ${multipleBooking?.sessionCount || 0} séances ont été enregistrées avec succès.` 
              : "Votre rendez-vous a été enregistré avec succès."}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="mb-3 text-sm font-medium text-gray-700">Détails de votre réservation</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium text-gray-800">{service.name}</span>
              </div>
              
              {isMultipleBooking && multipleBooking ? (
                <>
                  <div className="pt-2 pb-1 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Séances programmées ({multipleBooking.sessionCount})</span>
                  </div>
                  
                  {multipleBooking.slots.map((slotItem, index) => (
                    <div key={index} className="pl-3 border-l-2 border-teal-200 mb-3 pb-1">
                      <div className="flex justify-between items-center">
                        <span className="text-teal-600 font-medium">Séance {index + 1}</span>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                          {index === 0 ? "Prochaine" : `Dans ${index * 2} semaines`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-700">{formatDate(slotItem.date)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Heure</span>
                        <span className="text-gray-700">{slotItem.start}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-800">{multipleBooking.serviceType}</span>
                  </div>
                </>
              ) : slot ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-800">{formatDate(slot.date)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heure</span>
                    <span className="font-medium text-gray-800">{slot.start}</span>
                  </div>
                </>
              ) : null}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Durée</span>
                <span className="font-medium text-gray-800">{service.duration}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Prix</span>
                <span className="font-medium text-gray-800">{service.price}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Nom</span>
                <span className="font-medium text-gray-800">{customerInfo.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone</span>
                <span className="font-medium text-gray-800">{customerInfo.phone}</span>
              </div>
              
              {customerInfo.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-800">{customerInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
            <h4 className="mb-3 text-sm font-medium text-teal-800">Instructions de paiement</h4>
            <p className="mb-2 text-sm text-gray-700">
              Pour confirmer votre réservation, veuillez verser un acompte de 5 000 FCFA via :
            </p>
            <ul className="ml-5 space-y-1 text-sm list-disc text-gray-700">
              <li>MoMo : 06 597 56 23</li>
              <li>Airtel : 05 05 092 89 99</li>
            </ul>
            {isMultipleBooking && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm">
                <p className="font-medium text-yellow-700">Note importante :</p>
                <p className="text-gray-700">Pour les packs de plusieurs séances, un seul acompte de 5 000 FCFA est requis pour l'ensemble du forfait.</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            Un SMS de confirmation vous sera envoyé après réception de l'acompte.
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              asChild
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Link href="/">
                Retour à l'accueil
              </Link>
            </Button>
            
            <Button
              variant="outline"
              className="text-teal-500 border-teal-200 hover:bg-teal-50"
              onClick={() => window.location.reload()}
            >
              Nouvelle réservation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
