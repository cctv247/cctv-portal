"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qr-code";
import { useRouter } from "next/navigation";
import { QrCode, X, Zap, Camera, ShieldCheck } from "lucide-react";

export default function QRScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isOpen) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // ✅ Scan hote hi yahan logic chalega
          setIsOpen(false);
          if (scanner) scanner.clear();
          
          // Agar QR mein serial number hai, toh seedha us page par bhej do
          router.push(`/request/${decodedText}`);
        },
        (error) => { /* scanning... */ }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error(err));
      }
    };
  }, [isOpen, router]);

  return (
    <div className="w-full">
      {/* 🔘 Sirf Button jo screen par dikhega */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-[1000] uppercase italic tracking-[3px] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all border-b-4 border-black group"
      >
        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
          <QrCode size={20} />
        </div>
        Scan Device QR
      </button>

      {/* 🎴 Modal Overlay (Jab button dabega tabhi dikhega) */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-[450px] bg-white rounded-[3.5rem] shadow-2xl border border-white overflow-hidden relative">
            
            {/* Header: Inline Design */}
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-blue-400 shadow-lg">
                  <Camera size={22} />
                </div>
                <div>
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

            {/* Scanner Area */}
            <div className="p-6">
              <div 
                id="reader" 
                className="overflow-hidden rounded-[2.5rem] border-4 border-slate-100 shadow-inner bg-slate-50"
              ></div>
              
              <div className="mt-6 flex items-center justify-center gap-3 text-slate-400">
                <Zap size={14} className="animate-pulse text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Align QR in the Frame</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100 italic">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px]">Hardware Verified</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}