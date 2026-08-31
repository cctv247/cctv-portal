"use client";

// app/admin/print-stickers/page.tsx
import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/config";
import { Printer, Cctv, PhoneCall } from "lucide-react";

interface DeviceItem {
  device_sn: string;
  site_name?: string;
  service_date?: string;
  [key: string]: any;
}

export default function PrintStickersPage() {
  const [items, setItems] = useState<DeviceItem[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("print_stickers");
    if (data) {
      try {
        setItems(JSON.parse(data));
      } catch (err) {
        console.error("Failed to load sticker data:", err);
      }
    }
  }, []);

  const company = COMPANY;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-900 font-sans print:overflow-visible print:bg-white">
      <div className="a4-container mx-auto">
        {items.length > 0
          ? items.map((device, index) => (
              <div
                key={index}
                className={`sticker-slot ${(index + 1) % 4 === 0 ? "page-break-after" : ""}`}
              >
                <div
                  className="sticker-card relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border-[2.5pt] border-[#1a4a8d] bg-white shadow-2xl print:border-[#1a4a8d] print:shadow-none"
                  style={{
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex shrink-0 items-center justify-between bg-[#1a4a8d] px-6 py-5 text-white"
                    style={{
                      backgroundColor: "#1a4a8d",
                      WebkitPrintColorAdjust: "exact",
                    }}
                  >
                    <div className="text-left leading-tight">
                      <h1 className="font-[1000] tracking-tight text-[15pt] text-white uppercase italic">
                        Security System
                      </h1>
                      <h2 className="font-black tracking-[2px] text-[8pt] text-white uppercase opacity-90">
                        Maintenance
                      </h2>
                    </div>
                    <Cctv size={35} className="mr-1 text-white" />
                  </div>

                  {/* Body with Vector Circuit Background */}
                  <div className="relative flex flex-1 flex-col items-center justify-between overflow-hidden px-3.5 pt-2 pb-1.5">
                    
                    {/* PCB Circuit Vector */}
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden opacity-[0.20]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 350 450"
                    >
                      <defs>
                        <pattern
                          id="pcb-pads"
                          x="0"
                          y="0"
                          width="14"
                          height="14"
                          patternUnits="userSpaceOnUse"
                        >
                          <rect
                            x="5.5"
                            y="5.5"
                            width="2"
                            height="2"
                            fill="#1a4a8d"
                            rx="0.5"
                          />
                        </pattern>
                      </defs>

                      <rect
                        width="100%"
                        height="100%"
                        fill="url(#pcb-pads)"
                        opacity="0.35"
                      />

                      <g
                        stroke="#1a4a8d"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M 0 30 L 40 30 L 70 60 L 70 120" />
                        <path d="M 15 0 L 15 40 L 45 70 L 110 70" />
                        <path d="M 0 85 L 35 85 L 55 105" />
                        <path d="M 350 30 L 310 30 L 280 60 L 280 110" />
                        <path d="M 335 0 L 335 40 L 305 70 L 240 70" />
                        <path d="M 350 90 L 315 90 L 295 110" />
                        <path d="M 20 200 L 60 200 L 95 235 L 95 310 L 60 345 L 20 345" />
                        <path d="M 330 200 L 290 200 L 255 235 L 255 310 L 290 345 L 330 345" />
                        <path d="M 50 450 L 50 400 L 90 360 L 140 360" />
                        <path d="M 80 450 L 80 415 L 115 380 L 175 380" />
                        <path d="M 300 450 L 300 400 L 260 360 L 210 360" />
                        <path d="M 270 450 L 270 415 L 235 380 L 175 380" />
                      </g>

                      <g stroke="#1a4a8d" strokeWidth="1" fill="none" opacity="0.8">
                        <circle cx="175" cy="148" r="115" strokeDasharray="6 4" />
                        <circle cx="175" cy="148" r="85" />
                        <circle cx="175" cy="148" r="45" strokeDasharray="3 3" />
                        <line x1="175" y1="20" x2="175" y2="40" strokeWidth="2" />
                        <line x1="175" y1="256" x2="175" y2="276" strokeWidth="2" />
                        <line x1="47" y1="148" x2="67" y2="148" strokeWidth="2" />
                        <line x1="283" y1="148" x2="303" y2="148" strokeWidth="2" />
                      </g>

                      <g fill="#1a4a8d">
                        <rect x="62" y="116" width="16" height="16" rx="2" fill="#1a4a8d" />
                        <rect x="272" y="106" width="16" height="16" rx="2" fill="#1a4a8d" />
                        <circle cx="70" cy="60" r="3.5" />
                        <circle cx="110" cy="70" r="3" />
                        <circle cx="55" cy="105" r="3" />
                        <circle cx="280" cy="60" r="3.5" />
                        <circle cx="240" cy="70" r="3" />
                        <circle cx="295" cy="110" r="3" />
                        <circle cx="95" cy="235" r="3.5" />
                        <circle cx="95" cy="310" r="3.5" />
                        <circle cx="255" cy="235" r="3.5" />
                        <circle cx="255" cy="310" r="3.5" />
                        <circle cx="140" cy="360" r="3" />
                        <circle cx="210" cy="360" r="3" />
                      </g>
                    </svg>

                    {/* QR Code Section */}
                    <div className="relative z-10 mt-10 flex shrink-0 flex-col items-center">
                      <div className="backdrop-blur-[1px] relative rounded-[16px] border-2 border-blue-200 bg-white/95 p-2 shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            (company?.portalUrl || "") + "/" + (device?.device_sn || "")
                          )}`}
                          width={155}
                          height={155}
                          className="block h-[115pt] w-[115pt]"
                          alt="QR Code"
                        />
                        <div className="absolute -top-1 -left-1 h-6 w-6 rounded-tl-xl border-[#1a4a8d] border-t-[4px] border-l-[4px]"></div>
                        <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-br-xl border-[#1a4a8d] border-r-[4px] border-b-[4px]"></div>
                      </div>
                      <p className="mt-1 font-black tracking-[2px] text-[6pt] text-slate-500 uppercase italic">
                        • SCAN TO VIEW LOGS &amp; REPORTS •
                      </p>
                    </div>

                    {/* Site Location & Manual Writing Fields */}
                    <div className="relative z-10 w-full shrink-0 space-y-4 px-1 text-left">
                      <div>
                        <label className="ml-0.5 leading-none font-black tracking-widest text-[6.5pt] text-slate-600 uppercase">
                          Site Location
                        </label>
                        <div className="mt-0.5 w-full border-[#1a4a8d] border-b-[1.8pt] pb-0.5">
                          <span className="block truncate px-0.5 leading-none font-[1000] text-[10.5pt] text-[#1a4a8d] uppercase italic">
                            {device?.site_name || "---"}
                          </span>
                        </div>
                      </div>

                      {/* Service Date & Sign with writing space */}
                      <div className="grid grid-cols-2 gap-3 pt-0.5">
                        <div className="flex flex-col justify-between border-gray-400 border-b-[1.5pt] pb-0.5">
                          <label className="ml-0.5 leading-none font-black tracking-widest text-[6.5pt] text-slate-600 uppercase">
                            Service Date
                          </label>
                          <div className="flex h-7 w-full items-end">
                            <span className="font-[1000] tracking-wider text-[9.5pt] text-[#1a4a8d] italic">
                              {device?.service_date
                                ? new Date(device.service_date).toLocaleDateString("en-GB")
                                : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between border-gray-400 border-b-[1.5pt] pb-0.5">
                          <label className="ml-0.5 leading-none font-black tracking-widest text-[6.5pt] text-slate-600 uppercase">
                            Technician Sign.
                          </label>
                          <div className="h-7 w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Branded Footer */}
                    <div className="relative z-10 flex w-full shrink-0 flex-col items-center border-t border-dashed border-gray-300 pt-1">
                      <h3 className="leading-none font-[1000] tracking-[2px] text-[14pt] text-[#1a4a8d] uppercase italic">
                        {company?.name || "Modern Enterprises"}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1 font-black text-[8.5pt] text-slate-600">
                        <PhoneCall size={12} className="text-[#1a4a8d]" />
                        <span>Support: {company?.contact || "+91 7021330886"}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))
          : null}
      </div>

      {/* Floating Print Button */}
      <button
        type="button"
        onClick={() => window.print()}
        className="fixed bottom-10 right-10 z-[999] flex items-center gap-3 rounded-full border-b-[6px] border-blue-900 bg-blue-600 px-10 py-4 font-[1000] tracking-[3px] text-white uppercase italic shadow-2xl transition-all hover:bg-blue-500 active:scale-95 print:hidden"
      >
        <Printer size={22} />
        Print
      </button>

      <style jsx global>{`
        * {
          box-sizing: border-box !important;
        }

        /* Screen View */
        .a4-container {
          display: grid;
          grid-template-columns: repeat(2, 105mm);
          justify-content: center;
          width: 210mm;
          margin: 20px auto;
        }

        .sticker-slot {
          height: 144mm;
          width: 105mm;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3mm 4mm;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 2mm 4mm 2mm !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
          }

          .a4-container {
            display: grid !important;
            grid-template-columns: 103mm 103mm !important;
            grid-auto-rows: 142mm !important;
            gap: 0 !important;
            width: 206mm !important;
            margin: 0 auto !important;
          }

          .sticker-slot {
            width: 103mm !important;
            height: 142mm !important;
            padding: 3mm 4mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
          }

          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>
    </div>
  );
}