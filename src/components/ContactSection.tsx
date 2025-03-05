'use client';

import React from 'react';
import { Phone, MessageCircle, Check } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { contactInfo, kitItems } from '@/lib/data';

export default function ContactSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-2xl font-light text-gray-800 mb-4">
              <span className="text-pink-400">Contact</span>
            </h2>
            <p className="text-gray-600 mb-6">
              Besoin d'informations supplémentaires ? N'hésitez pas à nous contacter.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone size={20} className="text-teal-400 mr-3" />
                <span className="text-gray-700">{contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle size={20} className="text-teal-400 mr-3" />
                <span className="text-gray-700">{contactInfo.email}</span>
              </div>
              <Card className="mt-6">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-teal-600">Adresse :</span> {contactInfo.address}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <Card className="bg-white">
              <CardContent className="p-6">
                <CardTitle className="text-xl font-light text-gray-800 mb-4">Kit ShugaMade offert</CardTitle>
                <p className="text-gray-600 mb-4">
                  Pour toute réservation d'un forfait 4 ou 6 séances, recevez gratuitement notre kit complet :
                </p>
                <ul className="space-y-2">
                  {kitItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={18} className="text-pink-400 mr-2 mt-1" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-pink-500 font-medium text-lg">Valeur : 22 500 FCFA</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
