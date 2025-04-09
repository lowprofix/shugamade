"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingConditions } from "@/lib/data";
import { AlertCircle, Clock, CreditCard, MapPin } from "lucide-react";

export default function BookingConditionsSection() {
  return (
    <section id="bookingConditions" className="py-12 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-light text-gray-800">
            <span className="text-pink-400">Conditions</span>{" "}
            <span className="text-teal-400">de réservation</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Pour garantir un service de qualité à tous nos clients
          </p>
        </div>

        <Card className="border border-gray-100 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-teal-50 pb-4">
            <CardTitle className="text-xl font-medium text-gray-800 text-center">
              À lire avant votre rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-pink-100 p-2 rounded-full mr-4">
                  <AlertCircle className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Préparation</h3>
                  <p className="text-gray-700">{bookingConditions.preparation}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-teal-100 p-2 rounded-full mr-4">
                  <CreditCard className="text-teal-500" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Acompte</h3>
                  <p className="text-gray-700">{bookingConditions.deposit}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-pink-100 p-2 rounded-full mr-4">
                  <Clock className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Ponctualité</h3>
                  <p className="text-gray-700">{bookingConditions.punctuality}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-teal-100 p-2 rounded-full mr-4">
                  <AlertCircle className="text-teal-500" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Annulation et report</h3>
                  <p className="text-gray-700">{bookingConditions.cancellation}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-pink-100 p-2 rounded-full mr-4">
                  <MapPin className="text-pink-500" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Adresse</h3>
                  <p className="text-gray-700">{bookingConditions.address}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 text-center italic">
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
