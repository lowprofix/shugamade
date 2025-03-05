'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="font-bold text-xl">
          Shugamade
        </Link>
        
        <div className="space-x-6">
          <Link 
            href="/" 
            className={`${isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Accueil
          </Link>
          
          <Link 
            href="/calendar" 
            className={`${isActive('/calendar') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Calendrier
          </Link>
          
          {/* Ajoutez d'autres liens de navigation ici selon vos besoins */}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
