import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";

import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SiteFooter from "./components/layout/SiteFooter";
import GoogleAnalytics from "./components/seo/GoogleAnalytics";
import LocalBusinessSchema from "./components/seo/LocalBusinessSchema";
import RouteLoadingOverlay from "./components/ui/RouteLoadingOverlay";
import { AuthProvider } from "./context/AuthContext";
import { PreferredBrandLoaderProvider } from "./context/PreferredBrandLoaderContext";
import { ShopCartProvider } from "./context/ShopCartContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import ThemeColorMeta from "./components/ui/ThemeColorMeta";
import { rootMetadata } from "../lib/seo/metadata";
import { SITE_THEME_COLOR } from "../lib/seo/site";

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} bg-background text-foreground`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-cyan-400 focus:px-4 focus:py-3 focus:font-bold focus:text-zinc-950"
        >
          رفتن به محتوای اصلی
        </a>
        <ThemeProvider>
        <AuthProvider>
          <ShopCartProvider>
            <PreferredBrandLoaderProvider>
              <GoogleAnalytics />
              <ThemeColorMeta />
              <LocalBusinessSchema />
              <Suspense fallback={null}>
                <RouteLoadingOverlay />
              </Suspense>
              <Navbar />
              {children}
              <Suspense fallback={null}>
                <SiteFooter>
                  <Footer />
                </SiteFooter>
              </Suspense>
            </PreferredBrandLoaderProvider>
          </ShopCartProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
