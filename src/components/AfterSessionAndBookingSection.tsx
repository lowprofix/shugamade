"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Download, 
  FileText, 
  Heart, 
  HelpCircle, 
  Info, 
  MapPin, 
  MessageCircle, 
  Sparkles, 
  Zap 
} from "lucide-react";
import { afterSessionRecommendations, bookingConditions, postSessionAdvice } from "@/lib/data";

// Composant pour les formes décoratives
const DecorativeShape = ({ 
  className, 
  color = "#e2b3f7" 
}: { 
  className: string; 
  color?: string;
}) => (
  <div
    className={cn("absolute rounded-full opacity-20 animate-pulse-slow blur-lg", className)}
    style={{ backgroundColor: color }}
  />
);

// FAQ pour la section
const faqItems = [
  {
    question: "Combien de temps dois-je attendre avant de laver mes cheveux ?",
    answer: "Il est recommandé d'attendre 24 à 48 heures après votre séance pour permettre aux actifs de bien pénétrer."
  },
  {
    question: "Puis-je utiliser mes produits capillaires habituels après le traitement ?",
    answer: "Il est préférable d'éviter les produits agressifs pendant au moins 5 jours après le traitement. Utilisez de préférence les produits recommandés par votre spécialiste."
  },
  {
    question: "Comment puis-je maximiser les résultats de mon traitement ?",
    answer: "Pour maximiser les résultats, suivez scrupuleusement les conseils post-séance, utilisez régulièrement les produits recommandés, et maintenez une alimentation équilibrée riche en nutriments essentiels pour la santé capillaire."
  },
  {
    question: "Que faire si je ne peux pas venir à mon rendez-vous ?",
    answer: "Veuillez nous informer au moins 24 heures à l'avance pour toute annulation ou report. Au-delà de ce délai, l'acompte ne sera pas remboursé."
  }
];

// Étapes de réservation
const bookingSteps = [
  {
    title: "Prise de rendez-vous",
    description: "Réservez votre séance en ligne ou par téléphone",
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    title: "Acompte",
    description: "Versez l'acompte de 5 000 FCFA pour confirmer",
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    title: "Préparation",
    description: "Venez avec des cheveux propres, sans produit",
    icon: <Info className="w-5 h-5" />
  },
  {
    title: "Séance",
    description: "Profitez de votre traitement personnalisé",
    icon: <Heart className="w-5 h-5" />
  }
];

export default function AfterSessionAndBookingSection() {
  const [activeTab, setActiveTab] = useState("conseils");
  


  return (
    <section id="afterSessionAndBooking" className="relative py-24 overflow-hidden">
      {/* Formes décoratives - positions ajustées pour ne pas toucher les bords */}
      <DecorativeShape className="w-72 h-72 right-10 top-40" color="#ffb2dd" />
      <DecorativeShape className="w-64 h-64 left-10 bottom-20" color="#e2b3f7" />
      <DecorativeShape className="w-40 h-40 right-1/3 top-20" color="#bfe0fb" />
      
      <div className="container relative z-10 px-2">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-gradient-to-r from-[#bfe0fb]/20 to-[#9deaff]/20 border border-[#bfe0fb]/30">
            <Zap className="w-4 h-4 mr-2 text-[#9deaff]" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Informations importantes</span>
          </div>
          
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] bg-clip-text text-transparent font-extrabold">
              Conseils
            </span>{" "}
            et{" "}
            <span className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] bg-clip-text text-transparent font-extrabold">
              conditions
            </span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Tout ce que vous devez savoir pour optimiser vos résultats et préparer votre visite dans les meilleures conditions.
          </p>
        </div>
        
        {/* Système d'onglets personnalisé */}
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex gap-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <button
                onClick={() => setActiveTab("conseils")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  activeTab === "conseils" 
                    ? "bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 text-gray-800 dark:text-white border border-[#ffb2dd]/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Sparkles className={cn(
                  "w-4 h-4",
                  activeTab === "conseils" ? "text-[#ffb2dd]" : "text-gray-400"
                )} />
                <span className={activeTab === "conseils" ? "font-medium" : ""}>Conseils post-séance</span>
              </button>
              
              <button
                onClick={() => setActiveTab("conditions")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  activeTab === "conditions" 
                    ? "bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 text-gray-800 dark:text-white border border-[#ffb2dd]/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <FileText className={cn(
                  "w-4 h-4",
                  activeTab === "conditions" ? "text-[#ffb2dd]" : "text-gray-400"
                )} />
                <span className={activeTab === "conditions" ? "font-medium" : ""}>Conditions de réservation</span>
              </button>
            </div>
          </div>
          
          {/* Contenu de l'onglet Conseils */}
          <div className={cn("space-y-8", activeTab !== "conseils" && "hidden")}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Carte des soins à domicile */}
              <div className="animate-fade-in">
                <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#bfe0fb]/10 dark:from-gray-900 dark:to-gray-800">
                  {/* Barre de couleur en haut de la carte */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#bfe0fb] to-[#9deaff]" />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-xl font-semibold">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-[#bfe0fb]/20">
                        <Heart className="w-4 h-4 text-[#9deaff]" />
                      </div>
                      Soins à domicile
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-4">
                      {postSessionAdvice.homecare.map((advice, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 text-[#9deaff]" />
                          <span className="text-gray-700 dark:text-gray-300">{advice}</span>
                        </li>
                      ))}
                    </ul>
                    
                    
                  </CardContent>
                </Card>
              </div>
              
              {/* Carte FAQ */}
              <div className="animate-fade-in animate-delay-100">
                <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#e2b3f7]/10 dark:from-gray-900 dark:to-gray-800">
                  {/* Barre de couleur en haut de la carte */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]" />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-xl font-semibold">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-[#e2b3f7]/20">
                        <HelpCircle className="w-4 h-4 text-[#ffb2dd]" />
                      </div>
                      Questions fréquentes
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-gray-700 dark:text-gray-300 hover:text-[#ffb2dd] hover:no-underline">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-400">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    <div className="p-4 mt-6 rounded-lg bg-[#e2b3f7]/10">
                      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Vous avez d'autres questions ? N'hésitez pas à nous contacter directement.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Recommandations supplémentaires */}
            {afterSessionRecommendations.precautions.length > 0 && (
              <div className="animate-fade-in animate-delay-200">
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="h-1 w-full bg-gradient-to-r from-[#bfe0fb] to-[#e2b3f7]" />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-xl font-semibold">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-[#bfe0fb]/20">
                        <AlertCircle className="w-4 h-4 text-[#e2b3f7]" />
                      </div>
                      Précautions supplémentaires
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-4">
                      {afterSessionRecommendations.precautions.map((precaution, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 text-[#e2b3f7]" />
                          <span className="text-gray-700 dark:text-gray-300">{precaution}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Contenu de l'onglet Conditions */}
          <div className={cn("space-y-8", activeTab !== "conditions" && "hidden")}>
            {/* Conditions de réservation - Affichage côte à côte sur grand écran */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Étapes de réservation */}
              <div className="animate-fade-in">
                <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="h-1 w-full bg-gradient-to-r from-[#bfe0fb] to-[#9deaff]" />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-center">
                      Comment réserver votre séance
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {bookingSteps.map((step, index) => (
                        <div key={index} className="relative">
                          <div className="flex flex-col items-center p-4 rounded-lg bg-[#bfe0fb]/10">
                            <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-[#bfe0fb]/20">
                              {step.icon}
                            </div>
                            <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white">{step.title}</h3>
                            <p className="text-sm text-center text-gray-600 dark:text-gray-400">{step.description}</p>
                          </div>
                          
                          {index % 2 === 0 && index < bookingSteps.length - 1 && (
                            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden sm:block">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Conditions de réservation */}
              <div className="animate-fade-in animate-delay-100">
                <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#e2b3f7]/10 dark:from-gray-900 dark:to-gray-800">
                  <div className="h-1 w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]" />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-center">
                      Conditions à respecter
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-[#e2b3f7]/20 flex-shrink-0">
                          <Info className="w-5 h-5 text-[#ffb2dd]" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white">Préparation</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{bookingConditions.preparation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-[#e2b3f7]/20 flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-[#ffb2dd]" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white">Acompte</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{bookingConditions.deposit}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-[#e2b3f7]/20 flex-shrink-0">
                          <Clock className="w-5 h-5 text-[#ffb2dd]" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white">Ponctualité</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{bookingConditions.punctuality}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-[#e2b3f7]/20 flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-[#ffb2dd]" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white">Annulation</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{bookingConditions.cancellation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-[#e2b3f7]/20 flex-shrink-0">
                          <MapPin className="w-5 h-5 text-[#ffb2dd]" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white">Adresse</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{bookingConditions.address}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Note de compréhension */}
            <div className="p-4 rounded-lg bg-[#e2b3f7]/10 animate-fade-in animate-delay-200">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {bookingConditions.understanding}
              </p>
            </div>
          </div>
        </div>
        
        {/* Note d'information */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pour toute question supplémentaire, n'hésitez pas à nous contacter directement.
          </p>
        </div>
      </div>
    </section>
  );
}
