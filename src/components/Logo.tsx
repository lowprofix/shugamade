import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center cursor-pointer', className)}>
      <Image 
        src="/logo.svg" 
        alt="Shugamade Logo" 
        width={size} 
        height={size}
        className="object-contain"
        priority
      />
      <span className="ml-2 font-semibold text-lg text-brand-pink-dark">Shugamade</span>
    </Link>
  );
}
