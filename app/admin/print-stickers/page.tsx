"use client";
import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/config";
import { Camera, Printer, FileDown, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrintStickersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("print_stickers");
    if (data) {
      try { setItems(JSON.parse(data)); } catch (err) { console.error(err); }
    }
  }, []);

  const company = COMPANY;

  // 🚩 Logic: 4-4 stickers ke groups banana (2x2 per page)
  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const pages = chunkArray(items, 4);

  // 🚀 LOHA FIT PDF LOGIC (Next.js 16 & Turbopack Safe)
  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      // Dynamic imports to avoid SSR / Turbopack issues
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageElements = document.querySelectorAll(".a4-page-sheet");

      for (let i = 0; i < pageElements.length; i++) {
        const canvas = await html2canvas(pageElements[i] as HTMLElement, {
          scale: 2, // High resolution
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      pdf.save(`Modern_Stickers_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("PDF Error: Please try using the System Print button.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#020617] min-h-screen font-sans pb-40 overflow-x-hidden selection:bg-blue-500/30">
      
      {/* --- Header (Screen Only) --- */}
      <nav className="p-6 flex justify-between items-center print:hidden max-w-[210mm] mx-auto">
        <Link href="/admin" className="text-slate-500 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-colors">
          <ArrowLeft size={14} /> Back to Admin
        </Link>
        <div className="text-right">
          <h1 className="text-white font-[1000] italic uppercase tracking-tighter text-xl leading-none">Print Engine</h1>
          <p className="text-blue-500 text-[9px] font-black uppercase tracking-[4px] mt-1">Industrial 2x2 Grid</p>
        </div>
      </nav>

      {/* 🚩 THE MASTER PRINT AREA */}
      <div id="print-area" className="flex flex-col items-center">
        {pages.length > 0 ? pages.map((pageItems, pageIndex) => (
          <div key={pageIndex} className="a4-page-sheet shadow-[0_0_60px_rgba(0,0,0,0.7)] mb-14 print:mb-0 print:shadow-none bg-white overflow-hidden">
            <div className="a4-grid-2x2">
              {pageItems.map((device, index) => (
                <div key={index} className="sticker-slot">
                  
                  {/* --- 🛡️ THE PREMIUM STICKER CARD --- */}
                  <div className="sticker-card bg-white border-[3.8pt] border-[#1a4a8d] rounded-[48px] overflow-hidden relative flex flex-col h-full w-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    
                    {/* Header: Royal Blue Section */}
                    <div className="bg-[#1a4a8d] p-5 flex justify-between items-center text-white shrink-0" style={{ WebkitPrintColorAdjust: 'exact' }}>
                      <div className="leading-none text-left">
                        <h1 className="text-[17pt] font-[1000] uppercase italic tracking-tighter leading-none">Security System</h1>
                        <h2 className="text-[9pt] font-black uppercase tracking-[3px] mt-1.5 opacity-90 italic">Maintenance</h2>
                      </div>
                      <div className="bg-white/10 p-2 rounded-2xl border border-white/20">
                        <Camera size={24} strokeWidth={2.5} className="text-white" />
                      </div>
                    </div>

                    {/* Body: Pattern Background */}
                    <div className="p-7 flex flex-col items-center justify-between flex-1 bg-[radial-gradient(#cbd5e1_1.6px,transparent_1.6px)] [background-size:26px_26px] overflow-hidden" style={{ WebkitPrintColorAdjust: 'exact' }}>
                      
                      {/* QR Section */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="relative p-3.5 bg-white border-2 border-slate-100 rounded-[38px] shadow-sm">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(company.portalUrl + '/' + device?.device_sn)}`} 
                            className="w-[100pt] h-[100pt] block" 
                            alt="QR"
                          />
                          <div className="absolute -top-1 -left-1 w-9 h-9 border-t-[6px] border-l-[6px] border-[#1a4a8d] rounded-tl-2xl"></div>
                          <div className="absolute -bottom-1 -right-1 w-9 h-9 border-b-[6px] border-r-[6px] border-[#1a4a8d] rounded-br-2xl"></div>
                        </div>
                        <p className="text-[7.5pt] font-black text-slate-400 uppercase tracking-[4.5px] italic mt-3.5 leading-none">Scan to View Logs</p>
                      </div>

                      {/* Info Fields */}
                      <div className="w-full space-y-6 px-4 shrink-0 text-left">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8.5pt] font-[1000] text-slate-500 uppercase tracking-widest ml-1 leading-none">Asset Location</label>
                          <div className="w-full border-b-[2.5pt] border-slate-300 pb-1.5">
                            <span className="text-[13pt] font-[1000] text-[#1a4a8d] uppercase italic truncate block px-1 leading-none">
                              {device?.site_name || "---"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                          <div className="border-b-[2.5pt] border-slate-300 pb-6"><label className="text-[8pt] font-[1000] text-slate-400 uppercase tracking-widest leading-none ml-1">Service Date</label></div>
                          <div className="border-b-[2.5pt] border-slate-300 pb-6"><label className="text-[8pt] font-[1000] text-slate-400 uppercase tracking-widest leading-none ml-1">Tech Sign.</label></div>
                        </div>
                      </div>

                      {/* Footer branding */}
                      <div className="w-full pt-5 border-t-2 border-dashed border-slate-200 flex flex-col items-center shrink-0">
                        <h3 className="text-[14pt] font-[1000] text-[#1a4a8d] uppercase italic tracking-[5px] leading-none">{company.name}</h3>
                        <p className="text-slate-500 text-[9.5pt] font-black uppercase tracking-[2px] mt-2.5 leading-none opacity-80">Support: {company.contact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
             <div className="animate-pulse text-slate-800 font-[1000] uppercase tracking-[15px] text-2xl italic">Standby</div>
             <p className="text-slate-600 font-bold text-[10px] tracking-[5px]">LOCALSTORAGE IS EMPTY</p>
          </div>
        )}
      </div>

      {/* --- 🚀 FLOATING ACTION HUB --- */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 print:hidden z-[999] bg-slate-900/40 backdrop-blur-2xl p-4 rounded-[30px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button 
          onClick={downloadPDF} 
          disabled={isGenerating}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-10 py-6 rounded-2xl font-[1000] flex items-center gap-3 active:scale-95 transition-all uppercase tracking-[2px] border-b-[6px] border-[#064e3b] disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <FileDown size={22} strokeWidth={3} />}
          {isGenerating ? 'Processing...' : 'Save PDF'}
        </button>

        <button 
          onClick={() => window.print()} 
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-6 rounded-2xl font-[1000] flex items-center gap-3 active:scale-95 transition-all uppercase tracking-[2px] border-b-[6px] border-[#1e3a8a]"
        >
          <Printer size={22} strokeWidth={3} /> Print
        </button>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box !important; }

        /* 💻 Screen UI */
        .a4-page-sheet {
          width: 210mm;
          height: 297mm;
          background: white;
          margin: 0 auto;
        }
        .a4-grid-2x2 {
          display: grid;
          grid-template-columns: 105mm 105mm;
          grid-auto-rows: 148.5mm;
        }
        .sticker-slot {
          width: 105mm;
          height: 148.5mm;
          padding: 14mm;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* 🖨️ THE PRINT ENGINE */
        @media print {
          @page { size: A4 portrait; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; width: 210mm; height: 297mm; overflow: hidden !important; }
          
          .a4-page-sheet {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            page-break-after: always !important;
            background: white !important;
          }

          .a4-grid-2x2 {
            display: grid !important;
            grid-template-columns: 105mm 105mm !important;
            grid-auto-rows: 143mm !important; /* 🚩 Safe height for mobile printers */
            gap: 0 !important;
          }

          .sticker-slot {
            width: 105mm !important;
            height: 143mm !important;
            padding: 10mm !important; 
            page-break-inside: avoid !important;
            background: white !important;
          }
        }

        /* Responsive UI Scaling */
        @media (max-width: 210mm) {
          #print-area { transform: scale(calc(100vw / 225mm)); transform-origin: top center; }
          nav { transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}