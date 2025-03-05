'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

interface FooterProps {
  scrollToSection: (sectionId: string) => void;
}

export default function Footer({ scrollToSection }: FooterProps) {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo size={50} />
            <p className="text-gray-400 mt-2 text-sm">
              Solutions naturelles contre l'alopécie de traction
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              {new Date().getFullYear()} ShugaMade. Tous droits réservés.
            </p>
            <div className="mt-2">
              <Button 
                onClick={() => scrollToSection('booking')}
                className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white hover:shadow-md"
                size="rounded"
              >
                Prendre rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
