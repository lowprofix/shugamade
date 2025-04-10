"use client";

import AboutSection from "@/components/AboutSection";
import AfterSessionSection from "@/components/AfterSessionSection";
import BookingConditionsSection from "@/components/BookingConditionsSection";
import BookingSection from "@/components/BookingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import ShugaNavigation from "@/components/ShugaNavigation";
import TestimonialsSection from "@/components/TestimonialsSection";
import { promoServices, services } from "@/lib/data";
import { useEffect, useState } from "react";

export default function ShugaMadeLandingPage() {
  const [activeSection, setActiveSection] = useState("home");

  // Fonction pour faire défiler vers une section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculer le décalage pour compenser la hauteur de la barre de navigation
      const navHeight = 64; // Hauteur de la barre de navigation (h-16 = 4rem = 64px)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 16; // 16px d'espace supplémentaire
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Observer l'intersection pour mettre à jour la section active lors du défilement
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = [
      "home", 
      "about", 
      "services", 
      "products",
      "testimonials", 
      "afterSession", 
      "bookingConditions", 
      "booking"
    ];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50">
      {/* Navigation */}
      <ShugaNavigation
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Hero Section */}
      <HeroSection scrollToSection={scrollToSection} />

      {/* About Section */}
      <AboutSection scrollToBooking={() => scrollToSection("booking")} />

      {/* Services Section */}
      <ServicesSection scrollToBooking={() => scrollToSection("booking")} />

      {/* Products Section */}
      <ProductsSection scrollToContact={() => scrollToSection("contact")} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Conseils Post-Séance */}
      <AfterSessionSection />

      {/* Conditions de réservation */}
      <BookingConditionsSection />

      {/* Booking Section */}
      <BookingSection services={[...services, ...promoServices]} />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
