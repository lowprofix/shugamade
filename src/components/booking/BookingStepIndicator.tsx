"use client";

import { Check, Calendar, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  icon: string;
}

interface BookingStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  isPending?: boolean;
}

export default function BookingStepIndicator({ 
  steps, 
  currentStep, 
  isPending = false 
}: BookingStepIndicatorProps) {
  // Fonction pour obtenir l'icône appropriée
  const getIcon = (iconName: string, isActive: boolean, isCompleted: boolean) => {
    const className = cn(
      "w-5 h-5",
      isCompleted ? "text-white" : isActive ? "text-[#ffb2dd]" : "text-gray-400"
    );
    
    switch (iconName) {
      case "service":
        return <ShoppingBag className={className} />;
      case "calendar":
        return <Calendar className={className} />;
      case "user":
        return <User className={className} />;
      case "check":
        return <Check className={className} />;
      default:
        return <Check className={className} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 z-0">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] transition-all duration-500"
                    style={{ 
                      width: isCompleted ? "100%" : isPending && isActive ? "50%" : "0%" 
                    }}
                  />
                </div>
              )}
              
              {/* Cercle d'étape */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                  isCompleted 
                    ? "bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7]" 
                    : isActive
                      ? "bg-white border-2 border-[#ffb2dd]"
                      : "bg-white border-2 border-gray-200"
                )}
              >
                {getIcon(step.icon, isActive, isCompleted)}
              </div>
              
              {/* Étiquette */}
              <span 
                className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300",
                  isActive 
                    ? "text-[#ffb2dd]" 
                    : isCompleted
                      ? "text-[#e2b3f7]"
                      : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
