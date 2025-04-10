"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingConditions } from "@/lib/data";
import { AlertCircle, Clock, CreditCard, MapPin, Sparkles } from "lucide-react";

export default function BookingConditionsSection() {
  return (
    <section id="bookingConditions" className="py-12 bg-gradient-to-b from-white to-pink-50">
      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="relative mb-10 text-center">
          {/* Étoile au-dessus du titre */}
          <div className="absolute -top-6 right-[calc(50%+100px)] text-brand-pink-light animate-pulse">
            <Sparkles size={24} />
          </div>

          <h2 className="inline-block relative mb-6 text-3xl font-bold md:text-4xl">
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              Conditions
              {/* Petite étoile décorative */}
              <svg
                className="absolute -left-4 -bottom-6 w-5 h-5 text-brand-pink-dark animate-spin-slow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </span>{" "}
            <span className="text-teal-400">de réservation</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Pour garantir un service de qualité à tous nos clients
          </p>
        </div>

        <Card className="overflow-hidden border border-gray-100 shadow-md">
          <CardHeader >
            <CardTitle className="text-xl font-medium text-center text-gray-800">
              <h3 className="text-2xl font-light text-gray-800">
                
                <span className="text-pink-400">À lire</span>&nbsp;
                <span className="text-teal-400">avant votre rendez-vous</span> 
              </h3>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-2 mr-4 bg-pink-100 rounded-full">
                  <AlertCircle className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-gray-800">Préparation</h3>
                  <p className="text-gray-700">{bookingConditions.preparation}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 mr-4 bg-teal-100 rounded-full">
                  <CreditCard className="text-teal-500" size={20} />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-gray-800">Acompte</h3>
                  <p className="text-gray-700">{bookingConditions.deposit}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 mr-4 bg-pink-100 rounded-full">
                  <Clock className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-gray-800">Ponctualité</h3>
                  <p className="text-gray-700">{bookingConditions.punctuality}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 mr-4 bg-teal-100 rounded-full">
                  <AlertCircle className="text-teal-500" size={20} />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-gray-800">Annulation et report</h3>
                  <p className="text-gray-700">{bookingConditions.cancellation}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 mr-4 bg-pink-100 rounded-full">
                  <MapPin className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-gray-800">Adresse</h3>
                  <p className="text-gray-700">{bookingConditions.address}</p>
                </div>
              </div>

              <div className="p-4 mt-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm italic text-center text-gray-600">
                  {bookingConditions.understanding}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
