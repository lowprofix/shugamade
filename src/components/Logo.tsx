"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({
  size = 48,
  showText = true,
  className,
  onClick,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center", className)}
      onClick={onClick}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src="/images/shugamade-logo.svg"
          alt="ShugaMade Logo"
          width={size}
          height={size}
          priority
        />
      </div>

      {showText && (
        <span className="ml-2 text-xl font-medium">
          <span className="text-brand-pink-dark">SHUGA</span>
          <span className="text-brand-blue-dark">MADE</span>
        </span>
      )}
    </Link>
  );
}
