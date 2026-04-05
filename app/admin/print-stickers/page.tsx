"use client";
import { useEffect, useState } from "react";

export default function PrintStickersPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("print_stickers");
    if (data) {
      try { setItems(JSON.parse(data)); } catch (err) { console.error(err); }
    }
  }, []);

  const company = {
    name: "MODERN ENTERPRISES",
    contact: "+91 7021330886",
    baseUrl: "https://cctv-portal.vercel.app/request"
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* 🚩 A4 Grid with Safe Margins */}
      <div className="a4-container">
        {items.length > 0 ? items.map((device, index) => (
          <div key={index} className="sticker-slot">
            
            {/* --- 🛡️ THE STICKER CARD (Safe Size) --- */}
            <div className="sticker-card bg-[#f4f9ff] border-[1.5pt] border-slate-400 rounded-[25pt] overflow-hidden relative shadow-sm print:shadow-none">
              
              {/* Header */}
              <div className="bg-[#1a4a8d] p-4 flex justify-between items-center text-white">
                <div className="leading-tight">
                  <h1 className="text-[16pt] font-black uppercase italic tracking-tighter">CCTV SYSTEM</h1>
                  <h2 className="text-[10pt] font-bold uppercase tracking-[2pt] opacity-80 mt-1">MAINTENANCE</h2>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>

              {/* Body Section */}
              <div className="p-5 flex flex-col items-center">
                <div className="relative p-2 bg-white border border-blue-100 rounded-2xl mb-3">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(company.baseUrl + '/' + device?.device_sn)}`} 
                    className="w-[100pt] h-[100pt] block" 
                    alt="QR"
                    loading="eager"
                  />
                  {/* Brackets */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#1a4a8d] rounded-tl-md"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#1a4a8d] rounded-tr-md"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#1a4a8d] rounded-bl-md"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#1a4a8d] rounded-br-md"></div>
                </div>

                <p className="text-[7pt] font-black text-slate-500 mb-3 uppercase tracking-widest text-center italic">Scan to View Logs & Report Issues</p>

                {/* Info Fields */}
                <div className="w-full bg-white/60 border border-blue-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-end gap-1">
                    <span className="text-[8pt] font-black text-slate-800 uppercase">Site Name:</span>
                    <span className="flex-1 border-b border-dashed border-slate-300 font-black uppercase text-blue-900 text-[9pt] pb-0.5 truncate italic px-1">
                      {device?.site_name}
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-[8pt] font-black text-slate-800 uppercase">Date:</span>
                    <span className="flex-1 border-b border-dashed border-slate-300 text-slate-400 font-bold pb-0.5 tracking-widest italic">___/___/20___</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-[8pt] font-black text-slate-800 uppercase">Sign:</span>
                    <span className="flex-1 border-b border-dashed border-slate-300 text-slate-400 pb-0.5">_________________</span>
                  </div>
                </div>

                {/* Footer Branding */}
                <div className="w-full border-t border-dotted border-slate-300 mt-4 pt-2 text-center">
                  <h3 className="text-[#1a4a8d] font-black text-[11pt] tracking-[3pt] uppercase italic leading-none">
                    {company.name}
                  </h3>
                  <p className="text-slate-700 text-[8pt] font-black uppercase tracking-widest mt-1">
                    Contact: {company.contact}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )) : (
          <div className="h-screen w-screen flex items-center justify-center font-black uppercase text-slate-300 tracking-[10px]">Select Nodes</div>
        )}
      </div>

      <button onClick={() => window.print()} className="fixed bottom-10 right-10 bg-[#1a4a8d] text-white px-12 py-6 rounded-full font-black shadow-2xl print:hidden active:scale-95 transition-all uppercase tracking-widest italic">
        Print Sheet
      </button>

      <style jsx global>{`
        /* 🚩 VIEW SETTINGS */
        .a4-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          width: 100%;
          background: #f0f0f0;
        }
        .sticker-slot {
          background: white;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #eee;
        }

        /* 🚩 THE "ZERO-CUT" PRINT LOGIC */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0; /* Browser margins ko zero kiya */
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .a4-container {
            display: grid !important;
            grid-template-columns: 105mm 105mm !important; /* Aadha A4 width */
            grid-auto-rows: 148.5mm !important; /* Aadha A4 height */
            background: transparent !important;
          }
          .sticker-slot {
            width: 105mm !important;
            height: 148.5mm !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            page-break-inside: avoid !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            /* 🚩 Safe Margin: Box ko center mein rakha taaki printer edge na kaate */
          }
          .sticker-card {
            width: 90mm !important; /* 🚩 Width ko 105 se kam rakha (Safe Zone) */
            height: 135mm !important; /* 🚩 Height ko 148.5 se kam rakha (Safe Zone) */
            border: 1.5pt solid #334155 !important;
            box-shadow: none !important;
          }
          img {
            display: block !important;
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
}