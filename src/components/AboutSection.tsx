"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  CheckCircle, 
  Leaf, 
  Microscope, 
  HeartHandshake, 
  Droplets 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  scrollToSection: (sectionId: string) => void;
}

// Composant pour les cartes de service
const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description,
  colorClass,
  delay
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  colorClass: string;
  delay: string;
}) => (
  <Card className={cn(
    "relative p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in",
    delay
  )}>
    <div className={cn(
      "absolute top-0 left-0 w-full h-1 opacity-70",
      colorClass
    )} />
    
    <div className="flex items-start gap-4">
      <div className={cn(
        "p-3 rounded-xl",
        colorClass === "bg-[#e2b3f7]" ? "bg-[#e2b3f7]/10 text-[#e2b3f7]" :
        colorClass === "bg-[#bfe0fb]" ? "bg-[#bfe0fb]/10 text-[#bfe0fb]" :
        colorClass === "bg-[#ffb2dd]" ? "bg-[#ffb2dd]/10 text-[#ffb2dd]" :
        "bg-[#9deaff]/10 text-[#9deaff]"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  </Card>
);

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

export default function AboutSection({ scrollToSection }: AboutSectionProps) {
  return (
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Formes décoratives - positions ajustées pour ne pas toucher les bords */}
      <DecorativeShape className="w-72 h-72 right-10 top-20" color="#bfe0fb" />
      <DecorativeShape className="w-56 h-56 left-10 bottom-40" color="#ffb2dd" />
      <DecorativeShape className="w-40 h-40 right-1/3 bottom-20" color="#9deaff" />
      
      <div className="container relative z-10 px-2 ">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-gradient-to-r from-[#e2b3f7]/20 to-[#bfe0fb]/20 border border-[#e2b3f7]/30">
            <Sparkles className="w-4 h-4 mr-2 text-[#e2b3f7]" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Notre philosophie</span>
          </div>
          
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Une approche{" "}
            <span className="relative">
              personnalisée
              <svg className="absolute bottom-0 left-0 w-full h-3 -z-10" viewBox="0 0 200 8">
                <path 
                  d="M0 4C40 0 60 8 200 4" 
                  fill="none" 
                  stroke="#bfe0fb" 
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            pour vos{" "}
            <span className="bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] bg-clip-text text-transparent font-extrabold">
              cheveux
            </span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Chez Shugamade, nous croyons que chaque chevelure est unique et mérite un traitement adapté. Notre approche combine expertise, soins naturels et technologies avancées pour des résultats visibles et durables.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard 
            icon={Leaf} 
            title="Produits 100% Naturels" 
            description="Tous nos traitements sont composés d'ingrédients naturels, sans produits chimiques agressifs pour vos cheveux et votre cuir chevelu."
            colorClass="bg-[#e2b3f7]"
            delay="animate-delay-100"
          />
          
          <ServiceCard 
            icon={Microscope} 
            title="Diagnostic Précis" 
            description="Nous réalisons un examen approfondi de votre cuir chevelu et de vos cheveux pour identifier les causes exactes de vos problèmes capillaires."
            colorClass="bg-[#bfe0fb]"
            delay="animate-delay-300"
          />
          
          <ServiceCard 
            icon={HeartHandshake} 
            title="Suivi Personnalisé" 
            description="Nous vous accompagnons tout au long de votre traitement avec des conseils adaptés et des ajustements si nécessaire."
            colorClass="bg-[#ffb2dd]"
            delay="animate-delay-500"
          />
        </div>
        
        <div className="mt-20">
          <Card className="relative overflow-hidden border-none shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e2b3f7]/5 to-[#bfe0fb]/5 pointer-events-none" />
            
            <div className="grid items-center grid-cols-1 gap-8 p-8 md:grid-cols-2 lg:p-12">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#ffb2dd]/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#bfe0fb]/10 rounded-full blur-xl" />
                
                <div className="relative z-10 p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                  <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                    <Image 
                      src="/images/hairneedling.png" 
                      alt="Traitement capillaire naturel" 
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm dark:bg-gray-950/90 border border-[#e2b3f7] shadow-lg flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-[#e2b3f7]" />
                      <span className="text-sm font-medium">100% Naturel</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-4 text-2xl font-bold">Notre expertise à votre service</h3>
                
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Chez Shugamade, nous prenons en charge toutes les formes d'alopécie et les problèmes capillaires, quel que soit votre type de cheveux. Grâce à un diagnostic approfondi et personnalisé, nous identifions les causes de votre chute ou déséquilibre capillaire.
                </p>
                
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Nos protocoles combinent des techniques avancées, des soins naturels et des appareils de pointe pour stimuler la repousse, renforcer le cuir chevelu et restaurer la santé de vos cheveux.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-[#9deaff]" />
                    <p className="text-gray-700 dark:text-gray-200">Traitement de l'alopécie androgénétique</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-[#9deaff]" />
                    <p className="text-gray-700 dark:text-gray-200">Solutions pour l'alopécie de traction</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-[#9deaff]" />
                    <p className="text-gray-700 dark:text-gray-200">Soins pour cuir chevelu sensible</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-[#9deaff]" />
                    <p className="text-gray-700 dark:text-gray-200">Revitalisation des cheveux fragilisés</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button
                    onClick={() => scrollToSection("booking")}
                    className="bg-gradient-to-r from-[#bfe0fb] to-[#9deaff] text-gray-800 hover:shadow-lg hover:shadow-[#bfe0fb]/20 hover:scale-105 transition-all font-semibold"
                    size="lg"
                  >
                    Prendre rendez-vous
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        
      </div>
    </section>
  );
}
