// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { COMPANY } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const company = COMPANY;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // 🚩 iPhone Notch fix
  themeColor: "#2563eb", 
};

export const metadata: Metadata = {
  title: "Modern Enterprises | Security Portal",
  description: "Advanced CCTV & Inventory Management System",
  icons: { icon: "/logo.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full touch-pan-y flex-col overflow-x-hidden overscroll-none bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        
        {/* ✨ PREMIUM LIQUID BACKGROUND */}
        <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-white opacity-20 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>

        {/* 📱 MOBILE OPTIMIZED WRAPPER */}
        <main className="relative z-10 flex flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>

        <footer className="shrink-0 py-6 text-center">
        <p className="font-[1000] tracking-[5px] text-[10px] text-slate-400 uppercase italic">
        ©{COMPANY?.branding?.copyRight || "2026 | MODERN ENTERPRISES"}
        </p>
        </footer>


      </body>
    </html>
  );
}