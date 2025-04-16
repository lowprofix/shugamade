"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { contactInfo, kitItems } from "@/lib/data";
import { Sparkles, Phone, Mail, MapPin, Send, CheckCircle, Clock, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Composant pour les badges d'info
const InfoBadge = ({ 
  icon: Icon, 
  text, 
  href,
  className 
}: { 
  icon: React.ElementType;
  text: string;
  href?: string;
  className?: string;
}) => {
  const content = (
    <>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#e2b3f7]" />
      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200">{text}</span>
    </>
  );

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-[#e2b3f7]/30 shadow-sm transition-all hover:shadow-md hover:border-[#e2b3f7]/50", className)}>
      {href ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full group"
        >
          {content}
          <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ) : (
        content
      )}
    </div>
  );
};

// Composant pour les éléments du kit
const KitItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2 mb-3">
    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffb2dd] flex-shrink-0 mt-0.5" />
    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200">{text}</span>
  </div>
);

export default function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Simulation d'envoi de formulaire
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialiser le formulaire et afficher un message de succès
      setFormState({ name: "", email: "", message: "" });
      setIsSubmitted(true);
      
      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Créer le lien WhatsApp avec le numéro de téléphone
  const whatsappLink = `https://wa.me/${contactInfo.phone.replace(/\s+/g, "")}`;
  
  // Créer le lien pour l'email
  const mailtoLink = `mailto:${contactInfo.email}`;
  
  // Créer le lien Google Maps
  const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`;

  return (
    <section id="contact" className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Formes décoratives */}
      <DecorativeShape className="w-48 sm:w-72 h-48 sm:h-72 -left-10 top-20" color="#ffb2dd" />
      <DecorativeShape className="w-48 sm:w-64 h-48 sm:h-64 right-10 bottom-40" color="#e2b3f7" />
      <DecorativeShape className="w-32 sm:w-40 h-32 sm:h-40 left-1/3 bottom-20" color="#bfe0fb" />
      
      <div className="container relative z-10 px-3 sm:px-4 mx-auto">
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 rounded-full bg-gradient-to-r from-[#ffb2dd]/20 to-[#e2b3f7]/20 border border-[#ffb2dd]/30">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-[#ffb2dd]" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Contactez-nous</span>
          </div>
          
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] bg-clip-text text-transparent font-extrabold">
              Besoin d'informations
            </span>{" "}
            supplémentaires?
          </h2>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Nous sommes là pour répondre à toutes vos questions concernant nos services, produits ou pour planifier un rendez-vous personnalisé.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Colonne de gauche - Formulaire de contact */}
          <div className="relative">
            <Card className="overflow-hidden border-none shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]" />
              
              <div className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">
                  Envoyez-nous un message
                </h3>
                
                {isSubmitted ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Message envoyé avec succès!</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom complet
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                        className="w-full border-gray-300 dark:border-gray-700 focus:ring-[#e2b3f7] focus:border-[#e2b3f7]"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                        className="w-full border-gray-300 dark:border-gray-700 focus:ring-[#e2b3f7] focus:border-[#e2b3f7]"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Comment pouvons-nous vous aider?"
                        required
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2b3f7] focus:border-[#e2b3f7]"
                      />
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] text-white hover:shadow-lg hover:shadow-[#e2b3f7]/20 hover:scale-105 transition-all font-semibold border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nous respectons votre vie privée. Les informations que vous nous fournissez ne seront utilisées que pour répondre à votre demande.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Colonne de droite - Informations de contact et kit */}
          <div className="space-y-6 sm:space-y-8">
            {/* Informations de contact */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-white">
                Nos coordonnées
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoBadge 
                  icon={Phone} 
                  text={contactInfo.phone} 
                  href={whatsappLink}
                />
                <InfoBadge 
                  icon={Mail} 
                  text={contactInfo.email} 
                  href={mailtoLink}
                />
                <InfoBadge 
                  icon={MapPin} 
                  text="Voir l'adresse" 
                  href={mapsLink}
                  className="sm:col-span-2"
                />
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#ffb2dd]" />
                  Horaires d'ouverture
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">Lundi - Vendredi: 9h00 - 18h00</p>
                  <p className="text-gray-600 dark:text-gray-300">Samedi: 10h00 - 16h00</p>
                  <p className="text-gray-600 dark:text-gray-300">Dimanche: Fermé</p>
                </div>
              </div>
            </div>
            
            {/* Kit ShugaMade */}
            <Card className="overflow-hidden border-none shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7]" />
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#ffb2dd]/20 flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-[#ffb2dd]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    Kit ShugaMade offert
                  </h3>
                </div>
                
                <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Pour toute réservation d'un forfait 4 ou 6 séances, recevez gratuitement notre kit complet comprenant:
                </p>
                
                <div className="mb-4">
                  {kitItems.map((item, index) => (
                    <KitItem key={index} text={item} />
                  ))}
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#ffb2dd]/10 to-[#e2b3f7]/10 border border-[#ffb2dd]/20">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#e2b3f7] mr-2" />
                    <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                      Réservez maintenant
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#ffb2dd]">
                    Valeur: 22 500 FCFA
                  </div>
                </div>
              </div>
            </Card>
            
            
          </div>
        </div>
      </div>
    </section>
  );
}
