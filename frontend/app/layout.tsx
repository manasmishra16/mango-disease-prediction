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
  title: "MangoDL — Deep Learning Approach for Mango Yield and Disease Prediction",
  description:
    "Precision agriculture platform using Deep Learning (SE-MangoLeafXNet CNN) and Climate Data (XGBoost + LSTM) for mango disease detection and yield prediction.",
  keywords: [
    "mango agriculture",
    "deep learning",
    "SE-MangoLeafXNet",
    "AI disease detection",
    "yield prediction",
    "smart farming",
    "precision agriculture",
    "climate intelligence",
  ],
  openGraph: {
    title: "MangoDL — Deep Learning Precision Agriculture Platform",
    description: "Deep Learning approach for mango yield & pathology prediction using climate intelligence",
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
