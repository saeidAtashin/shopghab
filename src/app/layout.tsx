import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";

import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import GoftinoWidget from "./components/GoftinoWidget";
import LocalBusinessSchema from "./components/seo/LocalBusinessSchema";
import RouteLoadingOverlay from "./components/ui/RouteLoadingOverlay";
import { AuthProvider } from "./context/AuthContext";
import { rootMetadata } from "../lib/seo/metadata";

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
};

const vazirmatn = localFont({
  src: [
    {
      path: "../../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

const pixel = localFont({
  src: "./fonts/A-Pixel.ttf",
  variable: "--font-pixel",
  display: "swap",
});

const pixel2 = localFont({
  src: "./fonts/A-Pixel-2.ttf",
  variable: "--Pixel2",
  display: "swap",
});

const sorenanormal = localFont({
  src: "./fonts/Sorena-Normal.ttf",
  variable: "--font-Sorena-Normal",
  display: "swap",
});

const sorenapixelFont = localFont({
  src: "./fonts/Sorena-Pixel.ttf",
  variable: "--font-Sorena-Pixel",
  display: "swap",
});

const Cristik = localFont({
  src: "./fonts/Cristik.ttf",
  variable: "--Cristik",
  display: "swap",
});

const Mojita = localFont({
  src: "./fonts/Mojita.ttf",
  variable: "--Mojita",
  display: "swap",
});

const WAGHUBold = localFont({
  src: "./fonts/WAGHUBold.ttf",
  variable: "--WAGHUBold",
  display: "swap",
});

const WAGHURegular = localFont({
  src: "./fonts/WAGHURegular.ttf",
  variable: "--WAGHURegular",
  display: "swap",
});

const unixelFont = localFont({
  src: "./fonts/unixel-Regular.woff2",
  variable: "--font-unixel-Regular",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} ${pixel.variable} ${pixel2.variable} ${sorenanormal.variable} ${sorenapixelFont.variable} ${Cristik.variable} ${Mojita.variable} ${WAGHUBold.variable} ${WAGHURegular.variable} ${unixelFont.variable} `}
      >
        <AuthProvider>
          <LocalBusinessSchema />
          <Suspense fallback={null}>
            <RouteLoadingOverlay />
          </Suspense>
          <Navbar />
          {children}
          <Footer />
          <GoftinoWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
