'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Card } from '@/components/ui/card';
import { contactInfo } from '@/lib/data';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook,  
  ArrowUp, 
  Heart, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Composant TikTok Icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className || "w-4 h-4"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M19.59 6.69C18.6812 6.69 17.8097 6.36977 17.1459 5.80278C16.482 5.23578 16.0744 4.45019 16.0033 3.6H12.7933V15.9C12.7933 16.2713 12.7037 16.6379 12.5308 16.9692C12.3579 17.3005 12.1059 17.5877 11.7941 17.8096C11.4823 18.0315 11.1195 18.1823 10.7395 18.2507C10.3596 18.3191 9.97144 18.3033 9.59933 18.2045C9.22722 18.1058 8.88192 17.9265 8.59233 17.6809C8.30274 17.4354 8.07698 17.1299 7.93236 16.7878C7.78775 16.4458 7.72816 16.0763 7.75845 15.7088C7.78874 15.3414 7.90813 14.9865 8.10533 14.67C8.30254 14.3535 8.57144 14.0831 8.89133 13.8778C9.21122 13.6726 9.57293 13.5377 9.95033 13.483C10.3277 13.4283 10.7123 13.4551 11.0773 13.5616C11.4423 13.668 11.7777 13.8516 12.0593 14.1V10.74C11.6203 10.6458 11.1693 10.6134 10.7233 10.644C9.54788 10.7295 8.44756 11.2163 7.61133 12.02C6.7751 12.8237 6.25544 13.8942 6.14033 15.04C6.02523 16.1858 6.32173 17.3326 6.97933 18.28C7.63693 19.2274 8.61133 19.9145 9.73933 20.22C10.8673 20.5254 12.0608 20.4307 13.1273 19.95C14.1939 19.4693 15.0695 18.6346 15.5993 17.59C16.1291 16.5454 16.2833 15.3546 16.0333 14.21V9.21C17.0833 9.97 18.3233 10.38 19.6033 10.38V7.11C19.5993 7.11 19.59 6.69 19.59 6.69Z" 
      fill="currentColor"
    />
  </svg>
);

interface FooterProps {
  scrollToSection: (sectionId: string) => void;
}

interface SocialLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const SocialLink = ({ href, icon: Icon, label }: SocialLinkProps) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 group"
    aria-label={label}
  >
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
      <Icon className="w-4 h-4" />
    </span>
    <span className="text-sm font-medium hidden md:inline-block">{label}</span>
  </a>
);

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li className="mb-2">
    <Link 
      href={href}
      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group"
    >
      <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
      <span>{children}</span>
    </Link>
  </li>
);

export default function Footer({ scrollToSection }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  // Créer le lien WhatsApp avec le numéro de téléphone
  const whatsappLink = `https://wa.me/${contactInfo.phone.replace(/\s+/g, "")}`;
  
  // Créer le lien pour l'email
  const mailtoLink = `mailto:${contactInfo.email}`;
  
  // Créer le lien Google Maps
  const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`;

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 to-gray-950 text-white pt-16 pb-8 overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffb2dd] via-[#e2b3f7] to-[#bfe0fb] opacity-80"></div>
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#ffb2dd]/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-[#e2b3f7]/10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo et description */}
          <div className="space-y-4">
            <Logo size={60} />
            <p className="text-gray-400 mt-4 text-sm max-w-xs">
              Solutions naturelles et efficaces contre l'alopécie de traction et pour la santé de vos cheveux.
            </p>
            <div className="flex space-x-4 mt-6">
              <SocialLink 
                href="https://instagram.com/shugamade" 
                icon={Instagram} 
                label="Instagram" 
              />
              <SocialLink 
                href="https://facebook.com/shugamade" 
                icon={Facebook} 
                label="Facebook" 
              />
              <SocialLink 
                href="https://tiktok.com/@shugamade" 
                icon={TikTokIcon} 
                label="TikTok" 
              />
            </div>
          </div>
          
          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
              Liens rapides
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7]"></span>
            </h3>
            <ul className="space-y-1">
              <FooterLink href="/#services">Nos services</FooterLink>
              <FooterLink href="/#testimonials">Témoignages</FooterLink>
              <FooterLink href="/#about">À propos</FooterLink>
              <FooterLink href="/#products">Produits</FooterLink>
              <FooterLink href="/#contact">Contact</FooterLink>
              <FooterLink href="/#booking">Réservation</FooterLink>
            </ul>
          </div>
          
          {/* Nos services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
              Nos services
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7]"></span>
            </h3>
            <ul className="space-y-1">
              <FooterLink href="/#booking?service=diagnostic">Diagnostic capillaire</FooterLink>
              <FooterLink href="/#booking?service=hairneedling">Hairneedling</FooterLink>
              <FooterLink href="/#booking?service=electrotherapie">Électrothérapie</FooterLink>
              <FooterLink href="/#booking?service=luminotherapie">Luminothérapie</FooterLink>
              <FooterLink href="/#booking?service=massage">Massage crânien</FooterLink>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative inline-block">
              Contact
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 mt-0.5 mr-2 text-[#ffb2dd]" />
                  <span>{contactInfo.phone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={mailtoLink}
                  className="flex items-start text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <Mail className="w-4 h-4 mt-0.5 mr-2 text-[#e2b3f7]" />
                  <span>{contactInfo.email}</span>
                </a>
              </li>
              <li>
                <a 
                  href={mapsLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <MapPin className="w-4 h-4 mt-0.5 mr-2 text-[#bfe0fb]" />
                  <span>{contactInfo.address}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bouton de réservation */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800 pt-8 mt-8">
          <div className="mb-4 md:mb-0">
            <Button 
              onClick={() => scrollToSection('booking')}
              className="bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] text-white hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-1"
              size="lg"
            >
              Prendre rendez-vous
            </Button>
          </div>
          
          {/* Retour en haut */}
          <div className="flex items-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 group mr-4"
              aria-label="Retour en haut"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
            <p className="text-gray-400 text-sm">
              © {currentYear} ShugaMade. Tous droits réservés.
            </p>
          </div>
        </div>
        
      
        
        {/* Signature */}
        <div className="text-center mt-8 text-xs text-gray-500 flex items-center justify-center">
          <span>Conçu avec</span>
          <Heart className="w-3 h-3 mx-1 text-[#ffb2dd] animate-pulse-slow" />
          <span>par ShugaMade</span>
        </div>
      </div>
    </footer>
  );
}
