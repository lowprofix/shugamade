"use client";

import React, { useEffect, useRef } from "react";
// Importer les types depuis le fichier de déclaration
import "../types/cal";

interface CalendarPopupProps {
  calLink: string; // e.g. "your-username/event-type"
  buttonText?: string;
  buttonClassName?: string;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({
  calLink,
  buttonText = "Prendre rendez-vous",
  buttonClassName = "",
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load Cal.com embed script
    if (typeof document !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cal.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      // Initialize Cal embed after script loads
      script.onload = () => {
        if (
          buttonRef.current &&
          typeof window !== "undefined" &&
          "Cal" in window
        ) {
          // @ts-expect-error - Cal.com types are not available in Next.js
          window.Cal("ui", {
            // @ts-expect-error - elementOrSelector is a valid property
            elementOrSelector: buttonRef.current,
            calLink: calLink,
            config: {
              layout: "month_view",
            },
          });
        }
      };

      // Clean up
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }

    return () => {}; // Fallback return for SSR
  }, [calLink]);

  return (
    <button ref={buttonRef} className={buttonClassName}>
      {buttonText}
    </button>
  );
};

export default CalendarPopup;
