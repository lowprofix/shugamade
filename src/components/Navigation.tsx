"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, X, Facebook, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "./ui/container";

interface NavigationProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

interface NavItemProps {
  label: string;
  section: string;
  activeSection: string;
  onClick: () => void;
  className?: string;
}

const navItems = [
  { label: "Accueil", section: "home" },
  { label: "À propos", section: "about" },
  { label: "Services", section: "services" },
  { label: "Produits", section: "products" },
  { label: "Témoignages", section: "testimonials" },
  { label: "Infos Pratiques", section: "afterSessionAndBooking" },
  { label: "Réservation", section: "booking" },
  { label: "Contact", section: "contact" },
];

function NavItem({ label, section, activeSection, onClick, className }: NavItemProps) {
  const isActive = activeSection === section;
  
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        isActive 
          ? "text-[#e2b3f7] dark:text-[#ffb2dd]" 
          : "text-gray-600 dark:text-gray-300 hover:text-[#bfe0fb] dark:hover:text-[#9deaff]",
        className
      )}
    >
      {label}
    </Button>
  );
}

import { useEffect, useRef } from "react";

export default function Navigation({ activeSection, scrollToSection }: NavigationProps) {
  const [open, setOpen] = useState(false);
  
  const handleNavigation = (section: string) => {
    scrollToSection(section);
    setOpen(false);
  };

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateNavHeight() {
      if (navRef.current) {
        document.documentElement.style.setProperty(
          "--nav-height",
          navRef.current.offsetHeight + "px"
        );
      }
    }
    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);
    return () => window.removeEventListener("resize", updateNavHeight);
  }, []);

  return (
    <div ref={navRef} className="fixed top-0 left-0 right-0 z-50 w-full transition-colors">
      <nav className="w-full bg-white/95 bg-gradient-to-r from-[#bfe0fb]/5 to-transparent dark:bg-gray-950 dark:bg-gradient-to-r dark:from-[#e2b3f7]/10 dark:to-transparent shadow-sm dark:shadow-[#e2b3f7]/10">
        <Container>
          <div className="flex justify-between items-center h-16">
            {/* Logo à gauche */}
            <div className="flex items-center px-4 md:px-0">
              <Logo size={40} />
            </div>

            {/* Liens de navigation au centre */}
            <div className="hidden lg:flex items-center justify-center space-x-2 flex-1 mx-4">
              {navItems.slice(0, 6).map((item) => (
                <NavItem
                  key={item.section}
                  label={item.label}
                  section={item.section}
                  activeSection={activeSection}
                  onClick={() => scrollToSection(item.section)}
                  className="px-2"
                />
              ))}
            </div>
            
            {/* Liens de navigation supplémentaires pour les grands écrans */}
            <div className="hidden xl:flex items-center space-x-2 mr-3">
              {navItems.slice(6).map((item) => (
                <NavItem
                  key={item.section}
                  label={item.label}
                  section={item.section}
                  activeSection={activeSection}
                  onClick={() => scrollToSection(item.section)}
                  className="px-2"
                />
              ))}
            </div>

            {/* Bouton réserver et toggle à droite */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                onClick={() => scrollToSection("booking")}
                className="bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] text-white hover:shadow-md transition-all duration-300 lg:hidden"
              >
                Réserver
              </Button>
              <ThemeToggle />
            </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center px-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-[#e2b3f7] dark:hover:text-[#ffb2dd] transition-colors duration-200">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white dark:bg-gray-950 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-lg font-medium">Menu</SheetTitle>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto py-4">
                    <nav className="flex flex-col space-y-2 px-4">
                      {navItems.map((item) => (
                        <Button
                          key={item.section}
                          onClick={() => handleNavigation(item.section)}
                          variant="ghost"
                          className={cn(
                            "justify-start h-auto py-2.5",
                            activeSection === item.section
                              ? "bg-gradient-to-r from-[#e2b3f7]/10 to-[#ffb2dd]/10 text-[#e2b3f7] dark:text-[#ffb2dd] font-medium border-l-2 border-[#e2b3f7] pl-3" 
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                          )}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                    
                    <div className="px-4 mt-6">
                      <Button 
                        onClick={() => handleNavigation("booking")}
                        className="w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd] text-white hover:shadow-md transition-all duration-300 py-2.5 h-auto"
                      >
                        Prendre rendez-vous
                      </Button>
                    </div>
                  </div>
                  
                  {/* Réseaux sociaux */}
                  <div className="px-4 py-5 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suivez-nous</h3>
                    <div className="flex space-x-4">
                      <a 
                        href="https://facebook.com/shugamade" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#e2b3f7]/20 dark:hover:bg-[#e2b3f7]/20 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </a>
                      <a 
                        href="https://instagram.com/shugamade" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#e2b3f7]/20 dark:hover:bg-[#e2b3f7]/20 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </a>
                      <a 
                        href="https://tiktok.com/@shugamade" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#e2b3f7]/20 dark:hover:bg-[#e2b3f7]/20 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.59 6.69C18.6812 6.69 17.8097 6.36977 17.1459 5.80278C16.482 5.23578 16.0744 4.45019 16.0033 3.6H12.7933V15.9C12.7933 16.2713 12.7037 16.6379 12.5308 16.9692C12.3579 17.3005 12.1059 17.5877 11.7941 17.8096C11.4823 18.0315 11.1195 18.1823 10.7395 18.2507C10.3596 18.3191 9.97144 18.3033 9.59933 18.2045C9.22722 18.1058 8.88192 17.9265 8.59233 17.6809C8.30274 17.4354 8.07698 17.1299 7.93236 16.7878C7.78775 16.4458 7.72816 16.0763 7.75845 15.7088C7.78874 15.3414 7.90813 14.9865 8.10533 14.67C8.30254 14.3535 8.57144 14.0831 8.89133 13.8778C9.21122 13.6726 9.57293 13.5377 9.95033 13.483C10.3277 13.4283 10.7123 13.4551 11.0773 13.5616C11.4423 13.668 11.7777 13.8516 12.0593 14.1V10.74C11.6203 10.6458 11.1693 10.6134 10.7233 10.644C9.54788 10.7295 8.44756 11.2163 7.61133 12.02C6.7751 12.8237 6.25544 13.8942 6.14033 15.04C6.02523 16.1858 6.32173 17.3326 6.97933 18.28C7.63693 19.2274 8.61133 19.9145 9.73933 20.22C10.8673 20.5254 12.0608 20.4307 13.1273 19.95C14.1939 19.4693 15.0695 18.6346 15.5993 17.59C16.1291 16.5454 16.2833 15.3546 16.0333 14.21V9.21C17.0833 9.97 18.3233 10.38 19.6033 10.38V7.11C19.5993 7.11 19.59 6.69 19.59 6.69Z" fill="currentColor"/>
                        </svg>
                      </a>
                  
                    </div>
                  </div>
                  
                  {/* Footer avec le bouton de thème */}
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">© 2025 ShugaMade</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
      </nav>
    </div>
  );
}
