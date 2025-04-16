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
  title: "Shugamade",
  description: "Spécialiste des traitement capillaire naturel",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DotBackground dotSize={24} dotOpacity={0.3} fadeCenter={false} className="min-h-[100dvh]">
            <Container className="min-h-full">
              {children}
            </Container>
          </DotBackground>
        </ThemeProvider>
      </body>
    </html>
  );
}
