"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AfterSessionAndBookingSection from "@/components/AfterSessionAndBookingSection";
import BookingSection from "@/components/booking/BookingSection";
import ContactSection from "@/components/ContactSection";
import { services, promoServices } from "@/lib/data"; 
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  // Fonction pour faire défiler vers une section
  const scrollToSection = (sectionId: string) => {
    // Petit délai pour s'assurer que tous les éléments sont chargés
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Calculer la position avec un petit décalage pour la navigation
        const headerOffset = 80; // Hauteur approximative de la navigation
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
      setActiveSection(sectionId);
    }, 100);
  };

  // Observer pour détecter la section visible
  useEffect(() => {
    // Stocker les entrées visibles et leurs ratios
    const visibleSections = new Map();
    
    // Fonction pour déterminer la section la plus visible
    const getMostVisibleSection = () => {
      if (visibleSections.size === 0) return null;
      
      // Trouver la section avec la plus grande visibilité
      let maxVisibility = 0;
      let mostVisibleSection = null;
      
      visibleSections.forEach((visibility, sectionId) => {
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleSection = sectionId;
        }
      });
      
      return mostVisibleSection;
    };
    
    // Configuration de l'IntersectionObserver avec des seuils multiples
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          
          // Mettre à jour la visibilité de la section
          if (entry.isIntersecting) {
            // Calculer un score de visibilité basé sur le ratio d'intersection
            // et la proximité au centre de l'écran
            const ratio = entry.intersectionRatio;
            visibleSections.set(sectionId, ratio);
          } else {
            // Supprimer les sections qui ne sont plus visibles
            visibleSections.delete(sectionId);
          }
        });
        
        // Mettre à jour la section active avec la plus visible
        const mostVisible = getMostVisibleSection();
        if (mostVisible) {
          setActiveSection(mostVisible);
        }
      },
      { 
        threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], // Seuils multiples pour une détection plus précise
        rootMargin: "-80px 0px 0px 0px" // Tenir compte de la barre de navigation fixe
      }
    );

    // Observer toutes les sections
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
      />
      
      {/* Hero Section */}
      <HeroSection scrollToSection={scrollToSection} />
      
      {/* Section À propos */}
      <AboutSection scrollToSection={scrollToSection} />
      
      {/* Section Services */}
      <ServicesSection scrollToSection={scrollToSection} />
      
      {/* Section Produits */}
      <ProductsSection scrollToSection={scrollToSection} />
      
      {/* Section Témoignages */}
      <TestimonialsSection />
      
      {/* Section Conseils et Conditions */}
      <AfterSessionAndBookingSection />
      
      {/* Section Réservation */}
      <BookingSection services={[...services, ...promoServices]} />
      
      {/* Section Contact */}
      <ContactSection />
      
      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
