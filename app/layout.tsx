import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Provider from "@/provider";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoDoc AI - AI Medical Voice Agent",
  description: "Connect with AI specialist doctors through voice consultations. Get instant medical advice and automated health reports.",
  keywords: ["AI medical assistant", "voice consultation", "telemedicine", "healthcare AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ErrorBoundary>
            <Provider>
              {children}
              <Toaster 
                position="top-right"
                richColors
                closeButton
              />
            </Provider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
