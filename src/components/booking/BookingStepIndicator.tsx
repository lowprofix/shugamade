"use client";

import {
  BadgeCheck,
  Clock3,
  MailQuestion,
  ShoppingBag,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { Progress } from "../ui/progress";

export interface BookingStepIndicatorProps {
  currentStep: number;
  steps: {
    id: string | number;
    title?: string;
    label?: string;
    icon?:
      | "check"
      | "clock"
      | "mail"
      | "service"
      | "location"
      | "calendar"
      | "user"
      | string;
  }[];
  isPending?: boolean;
}

export function BookingStepIndicator({
  currentStep,
  steps,
  isPending = false,
}: BookingStepIndicatorProps) {
  const STEP_ICONS = {
    check: BadgeCheck,
    clock: Clock3,
    mail: MailQuestion,
    service: ShoppingBag,
    location: MapPin,
    calendar: Calendar,
    user: User,
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex + 1 < currentStep) {
      return "completed";
    }
    if (stepIndex + 1 === currentStep) {
      return "current";
    }
    return "upcoming";
  };

  const getStepColorClass = (status: "completed" | "current" | "upcoming") => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] text-white border-[#e2b3f7]";
      case "current":
        return "bg-white text-[#e2b3f7] border-[#e2b3f7]";
      case "upcoming":
        return "bg-gray-100 text-gray-400 border-gray-300";
    }
  };

  const getIconColorClass = (status: "completed" | "current" | "upcoming") => {
    switch (status) {
      case "completed":
        return "text-white";
      case "current":
        return "text-[#e2b3f7]";
      case "upcoming":
        return "text-gray-400";
    }
  };

  const getLineColorClass = (status: "completed" | "current" | "upcoming") => {
    switch (status) {
      case "completed":
        return "border-[#e2b3f7]";
      case "current":
      case "upcoming":
        return "border-gray-300";
    }
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="w-full mb-6">
        <Progress
          value={getProgressPercentage()}
          className="h-2 bg-gray-100"
          style={
            {
              "--progress-background":
                "linear-gradient(to right, #ffb2dd, #e2b3f7, #9deaff)",
            } as React.CSSProperties
          }
        />
      </div>

      {/* Custom style for progress bar gradient */}
      <style jsx global>{`
        [data-slot="progress-indicator"] {
          background: linear-gradient(
            to right,
            #ffb2dd,
            #e2b3f7,
            #bfe0fb,
            #9deaff
          ) !important;
          background-size: 200% 100% !important;
          animation: shimmer 2s infinite linear !important;
        }

        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>

      {/* Step indicators */}
      <div className="flex justify-between w-full">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const stepTitle = step.title || step.label || `Étape ${index + 1}`;
          const iconName =
            typeof step.icon === "string" ? step.icon : undefined;
          const StepIcon = iconName && (STEP_ICONS as any)[iconName];

          return (
            <div
              key={String(step.id)}
              className="flex flex-col items-center relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-[2rem] w-full h-0 border-t-2 ${getLineColorClass(
                    status
                  )}`}
                />
              )}

              {/* Step circle with animation for current step */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${getStepColorClass(
                  status
                )} ${
                  status === "current"
                    ? "animate-pulse shadow-md shadow-[#ffb2dd]/30"
                    : ""
                }`}
              >
                {StepIcon && (
                  <StepIcon
                    className={`w-4 h-4 ${getIconColorClass(
                      status
                    )} transition-all duration-300`}
                  />
                )}
                {!StepIcon && (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step title */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    status === "current"
                      ? "text-[#e2b3f7]"
                      : status === "completed"
                      ? "text-[#ffb2dd]"
                      : "text-gray-500"
                  }`}
                >
                  {stepTitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
