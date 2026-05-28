import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { AppProvider } from "@/providers/app-provider";
import { ProgressBar } from "@/shared/layout/progress-bar";
import { Toaster } from "@/shared/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NSI Family Health Scorecard",
    template: "%s | NSI Health Scorecard",
  },
  description:
    "Assess your family's health habits across 9 lifestyle areas and build an improvement plan.",
  applicationName: "NSI Family Health Scorecard",
};

export const viewport: Viewport = {
  themeColor: "#1568C0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <AppProvider>
          <ProgressBar />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
