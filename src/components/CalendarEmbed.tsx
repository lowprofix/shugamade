'use client';

import React, { useEffect } from 'react';
import Cal from "@calcom/embed-react";
import { 
  DEFAULT_CAL_CONFIG, 
  CALCOM_NAMESPACE, 
  initializeCalApi 
} from '@/lib/calcom';

interface CalendarEmbedProps {
  serviceCalLink: string;
  height?: string | number;
  inline?: boolean;
}

export default function CalendarEmbed({ 
  serviceCalLink, 
  height = "600px", 
  inline = true 
}: CalendarEmbedProps) {
  useEffect(() => {
    // Initialize Cal.com when component mounts
    initializeCalApi();
  }, []);

  return (
    <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <Cal
        namespace={CALCOM_NAMESPACE}
        calLink={serviceCalLink}
        style={{
          width: "100%", 
          height: "100%", 
          overflow: "scroll"
        }}
        config={{
          ...DEFAULT_CAL_CONFIG,
          layout: inline ? "month_view" : "popup",
        }}
      />
    </div>
  );
}
