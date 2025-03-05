"use client";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function ShugaNavigation({
  activeSection,
  scrollToSection,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo size={40} />
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Button
              onClick={() => scrollToSection("home")}
              variant="ghost"
              className={`${
                activeSection === "home"
                  ? "text-brand-pink-dark"
                  : "text-gray-600 hover:text-brand-pink-dark"
              }`}
            >
              Accueil
            </Button>
            <Button
              onClick={() => scrollToSection("about")}
              variant="ghost"
              className={`${
                activeSection === "about"
                  ? "text-brand-pink-dark"
                  : "text-gray-600 hover:text-brand-pink-dark"
              }`}
            >
              À propos
            </Button>
            <Button
              onClick={() => scrollToSection("services")}
              variant="ghost"
              className={`${
                activeSection === "services"
                  ? "text-brand-pink-dark"
                  : "text-gray-600 hover:text-brand-pink-dark"
              }`}
            >
              Services
            </Button>
            <Button
              onClick={() => scrollToSection("testimonials")}
              variant="ghost"
              className={`${
                activeSection === "testimonials"
                  ? "text-brand-pink-dark"
                  : "text-gray-600 hover:text-brand-pink-dark"
              }`}
            >
              Témoignages
            </Button>
            <Button
              onClick={() => scrollToSection("booking")}
              className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white hover:shadow-md"
              size="rounded"
            >
              Réserver
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              className="text-gray-500 hover:text-brand-pink-dark"
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <div className="space-y-1">
                  <div className="w-6 h-0.5 bg-gray-600"></div>
                  <div className="w-6 h-0.5 bg-gray-600"></div>
                  <div className="w-6 h-0.5 bg-gray-600"></div>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Button
              onClick={() => {
                scrollToSection("home");
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="justify-start w-full text-left px-3 py-2 text-gray-600 hover:bg-brand-gradient-start/10 hover:text-brand-pink-dark rounded-md"
            >
              Accueil
            </Button>
            <Button
              onClick={() => {
                scrollToSection("about");
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="justify-start w-full text-left px-3 py-2 text-gray-600 hover:bg-brand-gradient-start/10 hover:text-brand-pink-dark rounded-md"
            >
              À propos
            </Button>
            <Button
              onClick={() => {
                scrollToSection("services");
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="justify-start w-full text-left px-3 py-2 text-gray-600 hover:bg-brand-gradient-start/10 hover:text-brand-pink-dark rounded-md"
            >
              Services
            </Button>
            <Button
              onClick={() => {
                scrollToSection("testimonials");
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="justify-start w-full text-left px-3 py-2 text-gray-600 hover:bg-brand-gradient-start/10 hover:text-brand-pink-dark rounded-md"
            >
              Témoignages
            </Button>
            <Button
              onClick={() => {
                scrollToSection("booking");
                setMobileMenuOpen(false);
              }}
              className="justify-start w-full text-left bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white"
            >
              Réserver
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
