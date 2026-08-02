import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { PreferencesSync } from "@/components/app/preferences-sync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MangoDL - AI-Powered Mango Agriculture Intelligence Platform",
  description:
    "Transform traditional mango farming with AI-powered disease detection, yield prediction, and climate intelligence. Built for modern farmers.",
  keywords: [
    "mango agriculture",
    "AI disease detection",
    "yield prediction",
    "smart farming",
    "precision agriculture",
    "deep learning",
    "crop intelligence",
  ],
  openGraph: {
    title: "MangoDL - AI Agriculture Platform",
    description: "Futuristic AI-powered mango agriculture intelligence platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <PreferencesSync />
        {children}
      </body>
    </html>
  );
}
