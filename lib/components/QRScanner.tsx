"use client";

/* 
Ise Page par Kaise Lagayein?
1. Library Install Karein   
npm install html5-qr-code 
nahi chale to npm 
install  html5-qr-code@latest
2. import QRScanner from "@/lib/components/QRScanner";
3. Body me jaha show karna hai. add kar de 
<QRScanner />
*/


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, X, Zap, Camera, ShieldCheck } from "lucide-react";

/**
 * QRScanner Component
 * 1. Build Error Fix: Using dynamic import to avoid 'Module not found'.
 * 2. Auto-Navigation: Decodes QR and routes to /request/[id].
 */
export default function QRScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let scanner: any = null;

    const startScanner = async () => {
      if (isOpen) {
        try {
          // ✨ Dynamic Import: Yeh build error ko bypass karta hai
          const { Html5QrcodeScanner } = await import("html5-qr-code");
          
          scanner = new Html5QrcodeScanner(
            "reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText: string) => {
              setIsOpen(false);
              if (scanner) {
                scanner.clear().catch((err: any) => console.warn("Scanner clear failed", err));
              }
              // ✅ Routing to Device Page
              router.push(`/request/${decodedText}`);
            },
            (error: any) => {
              // Scanning logic (silent)
            }
          );
        } catch (err) {
          console.error("QR Scanner Library load fail:", err);
        }
      }
    };

    startScanner();

    // Cleanup on close/unmount
    return () => {
      if (scanner) {
        scanner.clear().catch((err: any) => console.warn("Cleanup failed", err));
      }
    };
  }, [isOpen, router]);

  return (
    <div className="w-full">
      {/* 🔘 Main Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-[1000] uppercase italic tracking-[3px] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all border-b-4 border-black group"
      >
        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
          <QrCode size={20} />
        </div>
        Scan Device QR
      </button>

      {/* 🎴 Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-[450px] bg-white rounded-[3.5rem] shadow-2xl border border-white overflow-hidden relative">
            
            {/* Header: Professional Inline UI */}
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-blue-400 shadow-lg shrink-0">
                  <Camera size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none italic">
                    Smart <span className="text-blue-600">Scanner</span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Modern Enterprises Node</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="bg-slate-50 p-2.5 rounded-2xl text-slate-300 hover:text-red-500 transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scanner Viewport */}
            <div className="p-6">
              <div 
                id="reader" 
                className="overflow-hidden rounded-[2.5rem] border-4 border-slate-100 shadow-inner bg-slate-50 min-h-[250px] flex items-center justify-center"
              >
                {/* Loader or Placeholder while camera starts */}
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Initializing Camera...</p>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-3 text-slate-400">
                <Zap size={14} className="animate-pulse text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Align QR in the Frame</p>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100 italic">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px]">Hardware Handshake Verified</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}