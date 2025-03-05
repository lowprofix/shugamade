"use client";

import { Phone, MessageCircle, Check } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { contactInfo, kitItems } from "@/lib/data";

export default function ContactSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="mb-8 md:w-1/2 md:mb-0">
            <h2 className="mb-4 text-2xl font-light text-gray-800">
              <span className="text-pink-400">Contact</span>
            </h2>
            <p className="mb-6 text-gray-600">
              Besoin d'informations supplémentaires ? N'hésitez pas à nous
              contacter.
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <Phone size={20} className="mr-3 text-teal-400" />
                <a
                  href={`https://wa.me/${contactInfo.phone.replace(
                    /\s+/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 transition-colors hover:text-teal-600"
                >
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center">
                <MessageCircle size={20} className="mr-3 text-teal-400" />
                <span className="text-gray-700">{contactInfo.email}</span>
              </div>
              <Card className="mt-6">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-teal-600">Adresse :</span>{" "}
                    {contactInfo.address}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="md:w-1/2">
            <Card className="bg-white">
              <CardContent className="p-6">
                <CardTitle className="mb-4 text-xl font-light text-gray-800">
                  Kit ShugaMade offert
                </CardTitle>
                <p className="mb-4 text-gray-600">
                  Pour toute réservation d'un forfait 4 ou 6 séances, recevez
                  gratuitement notre kit complet :
                </p>
                <ul className="space-y-2">
                  {kitItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={18} className="mt-1 mr-2 text-pink-400" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-lg font-medium text-pink-500">
                    Valeur : 22 500 FCFA
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
