"use client";

import React, { useEffect, useRef } from "react";
// Importer les types depuis le fichier de déclaration
import "../types/cal";

interface CalendarWidgetProps {
  calLink: string; // e.g. "your-username/event-type"
  style?: React.CSSProperties;
  className?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  calLink,
  style = {
    width: "100%",
    height: "600px",
    overflow: "hidden",
  },
  className = "",
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);

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
          calendarRef.current &&
          typeof window !== "undefined" &&
          "Cal" in window
        ) {
          // @ts-expect-error - Cal.com types are not available in Next.js
          window.Cal("inline", {
            // @ts-expect-error - elementOrSelector is a valid property
            elementOrSelector: calendarRef.current,
            calLink: calLink,
            config: {
              theme: "light",
              // @ts-expect-error - hideEventTypeDetails can be a string
              hideEventTypeDetails: "false",
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

  return <div ref={calendarRef} className={className} style={style}></div>;
};

export default CalendarWidget;
