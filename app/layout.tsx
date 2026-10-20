// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { COMPANY } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // 🚩 iPhone Notch & Dynamic Island fix
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export const metadata: Metadata = {
  title: `${COMPANY?.name || "Modern Enterprises"} | Security Portal`,
  description: "Advanced CCTV, GPS Asset Verification & Inventory Management System",
  applicationName: "CCTV Portal",
  manifest: "/manifest.json", // 🚩 PWA Manifest connection
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 🚩 Full bleed notch support on iOS
    title: "CCTV Portal",
  },
  formatDetection: {
    telephone: false, // Prevents unintended auto-detection of SN numbers as phone links
  },
  icons: {
    icon: [
      { url: "/logo.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="flex min-h-full touch-pan-y flex-col overflow-x-hidden overscroll-none bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        
        {/* ✨ LIQUID BACKGROUND */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-white opacity-20 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]" 
        />

        {/* 📱 FULL SAFE-AREA OPTIMIZED WRAPPER */}
        <main className="relative z-10 flex flex-1 flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          {children}
        </main>

        {/* 🛡️ FOOTER BRANDING */}
        <footer className="shrink-0 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center">
          <p className="font-[1000] tracking-[5px] text-[10px] text-slate-400 uppercase italic">
            ©{COMPANY?.branding?.copyRight || "2026 | MODERN ENTERPRISES"}
          </p>
        </footer>

      </body>
    </html>
  );
}
