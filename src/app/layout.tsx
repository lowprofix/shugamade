import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Container } from "@/components/ui/container";
import { DotBackground } from "@/components/ui/dot-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shugamade - Spécialiste des traitement capillaire naturel",
  description:
    "Traitements capillaires naturels et soins spécialisés pour tous types de cheveux",
  metadataBase: new URL("https://www.shugamade.com"),
  openGraph: {
    title: "Shugamade",
    description: "Spécialiste des traitement capillaire naturel",
    url: "https://www.shugamade.com",
    siteName: "Shugamade",
    images: [
      {
        url: "/images/meta/opengraph-image.jpg", // Image statique pour WhatsApp
        width: 1200,
        height: 630,
        alt: "Shugamade - Traitements capillaires naturels",
      },
      {
        url: "https://www.shugamade.com/opengraph-image.png", // Image générée dynamiquement
        width: 1200,
        height: 630,
        alt: "Shugamade - Traitements capillaires naturels",
      }
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shugamade",
    description: "Spécialiste des traitement capillaire naturel",
    images: [
      "/images/meta/twitter-image.jpg", // Image statique pour WhatsApp
      "https://www.shugamade.com/twitter-image.png" // Image générée dynamiquement
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DotBackground
            dotSize={24}
            dotOpacity={0.3}
            fadeCenter={false}
            className="min-h-[100dvh]"
          >
            <Container className="min-h-full">{children}</Container>
          </DotBackground>
        </ThemeProvider>
      </body>
    </html>
  );
}
