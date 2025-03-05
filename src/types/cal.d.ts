// Type definitions for Cal.com embed
interface CalConfig {
  layout?: string;
  theme?: string;
  hideEventTypeDetails?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface CalOptions {
  elementOrSelector: HTMLElement | string;
  calLink: string;
  config?: CalConfig;
}

interface CalApi {
  (method: "ui" | "inline", options: CalOptions): void;
  namespace?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

export {};
