import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Providers from "@/components/providers";
import "./globals.css";

// Google Font: DM Sans — geometric, modern, readable at small sizes
const fontLink = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&display=swap";

export const metadata: Metadata = {
  title: "Femur Fracture Fitness",
  description: "MRI-Adjusted Non-Weight-Bearing Push/Pull/Legs Training Protocol",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FFF",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('nwb_theme')==='light')document.documentElement.classList.add('light')}catch(e){}`}
        </Script>
      </head>
      <body className="min-h-screen overflow-y-auto">
        <Providers>{children}</Providers>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`}
        </Script>
      </body>
    </html>
  );
}
