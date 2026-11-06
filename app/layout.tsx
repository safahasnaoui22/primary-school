
import type { Metadata, Viewport } from "next";
import { Outfit, Henny_Penny } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import PullToRefresh from "./components/Pulltorefresh";
import WhatsAppButton from "./components/WhatsAppButton";

// Main font
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Decorative font
// Decorative font
const hennyPenny = Henny_Penny({
  variable: "--font-henny-penny",
  subsets: ["latin"],
  weight: "400",        // <-- add this line
  display: "swap",
  preload: false,
});
export const metadata: Metadata = {
  title: {
    default: "EduSmart | Primary School",
    template: "%s | EduSmart",
  },
  description:
    "EduSmart - A digital platform for primary school management, learning and communication.",
  applicationName: "EduSmart",
  appleWebApp: {
    capable: true,
    title: "Primary School",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${hennyPenny.variable}`}>
        <Providers>
          {children}
        </Providers>

        <PullToRefresh />
        <WhatsAppButton />
      </body>
    </html>
  );
}
