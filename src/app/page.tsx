"use client";

import AboutSection from "@/components/AboutSection";
import BookingSection from "@/components/BookingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
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
      element.scrollIntoView({ behavior: "smooth" });
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

    const sections = ["home", "about", "services", "testimonials", "booking"];
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

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Booking Section */}
      <BookingSection services={[...services, ...promoServices]} />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
