"use client";
// app/admin/HistoryModal.tsx-- is line ko delet na kare 
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  X, Calendar, User, Wrench, Clock, 
  Loader2, ClipboardList, FileText,
  Printer, MessageSquare, AlertCircle
} from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog"; 

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn: string;
  siteName: string;
}

export default function HistoryModal({ isOpen, onClose, sn, siteName }: HistoryModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", type: "info" as any });

  // 🚩 VIEWPORT LOCK & BACKGROUND FREEZE
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      const setVh = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);
      
      if (sn) fetchLogs();

      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
        window.removeEventListener('resize', setVh);
      };
    }
  }, [isOpen, sn]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("service_logs").select("*").eq("device_sn", sn).order("created_at", { ascending: false });
      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Sync Error", message: err.message, type: "danger" });
    } finally { setLoading(false); }
  };

  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Logo missing"));
      img.src = url;
    });
  };

  // 📄 PDF BRANDING ENGINE
  const applyBranding = async (doc: jsPDF) => {
    try {
      const imgData = await getBase64ImageFromURL("/logo.ico");
      doc.addImage(imgData, "PNG", 14, 10, 12, 12);
    } catch (e) { console.warn("Logo missing"); }
    doc.setTextColor(30, 41, 59).setFontSize(14).setFont("helvetica", "bold").text(COMPANY?.name || "MODERN ENTERPRISES", 28, 16);
    doc.setFontSize(7).setFont("helvetica", "normal").text(`${COMPANY?.contact} | ${COMPANY?.supportEmail}`, 28, 20);
    doc.setDrawColor(230).line(14, 25, 196, 25);
  };

  // 📄 PDF LEGAL DISCLAIMER & CUSTOM PORTAL ID LOGIC ENGINE
  const addFooter = (doc: jsPDF, activeLog?: any) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setDrawColor(203, 213, 225).line(14, pageHeight - 32, pageWidth - 14, pageHeight - 32);
    
    // Left-side legal notes
    doc.setFontSize(7).setTextColor(71, 85, 105).setFont("helvetica", "bold").text("LEGAL DISCLAIMER:", 14, pageHeight - 26);
    doc.setFontSize(6.5).setTextColor(100, 116, 139).setFont("helvetica", "normal");
    doc.text(`This is a system-verified digital report issued by ${COMPANY?.name || 'Modern Enterprise'}.`, 14, pageHeight - 22);
    doc.text(`Support: ${COMPANY?.supportEmail || 'wazahul@gmail.com'}`, 14, pageHeight - 18);
    doc.text("This document is electronically generated and requires no physical signature.", 14, pageHeight - 14);
    
    // Right-side dynamic verified marks
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // 🎛️ PORTAL ID SLICING LOGIC
    const rawDeviceSn = activeLog?.device_sn || sn || "SEC-MOD-cial";
    const slicedPortalId = rawDeviceSn.length >= 8 
      ? rawDeviceSn.slice(-8).slice(0, 4) 
      : rawDeviceSn.slice(0, 4);

    doc.setFontSize(7.5).setTextColor(15, 23, 42).setFont("helvetica", "bold").text(`Verified On: ${today}`, pageWidth - 14, pageHeight - 26, { align: "right" });
    doc.setFontSize(7).setTextColor(100, 116, 139).setFont("helvetica", "normal").text(`Portal ID: SEC-MOD-${slicedPortalId.toUpperCase()}`, pageWidth - 14, pageHeight - 21, { align: "right" });
    doc.setFontSize(7.5).setTextColor(161, 98, 7).setFont("helvetica", "bold").text("ORIGINAL REPORT", pageWidth - 14, pageHeight - 15, { align: "right" });

    // Center bottom system credit
    doc.setFontSize(6.5).setTextColor(148, 163, 184).setFont("helvetica", "bold");
    doc.text(`© 2026 ${COMPANY?.name?.toUpperCase() || 'MODERN ENTERPRISE'} | DIGITAL MAINTENANCE SYSTEM`, pageWidth / 2, pageHeight - 6, { align: "center" });
  };

  const downloadMasterPDF = async () => {
    try {
      const doc = new jsPDF();
      await applyBranding(doc);
      doc.setFontSize(11).setFont("helvetica", "bold").text(`SERVICE HISTORY: ${siteName.toUpperCase()}`, 14, 35);
      
      autoTable(doc, {
        startY: 40,
        head: [['DATE', 'ENGINEER', 'JOB TYPE', 'WORK DESCRIPTION', 'STATUS']],
        body: logs.map(log => [
          new Date(log.created_at).toLocaleDateString('en-GB'), 
          log.technician_name?.toUpperCase() || "N/A", 
          (log.service_type || 'Service').toUpperCase(),
          log.work_done || "N/A",
          (log.status || 'Completed').toUpperCase().replace(/'/g, "").replace(/✅/g, "")
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 7, cellPadding: 3 },
        didDrawPage: () => addFooter(doc)
      });
      doc.save(`Logs_${siteName}.pdf`);
    } catch (e) { console.error(e); }
  };

  const downloadSingleReceipt = async (log: any) => {
    try {
      const doc = new jsPDF();
      await applyBranding(doc);
      doc.setFillColor(30, 41, 59).rect(14, 30, 182, 8, 'F');
      doc.setTextColor(255).setFontSize(8).text("MAINTENANCE COMPLETION SLIP", 85, 35);
      
      const nextScheduleFormatted = log.next_service_date 
        ? new Date(log.next_service_date).toLocaleDateString('en-GB') 
        : "N/A";

      const cleanStatus = (log.status || "Completed").toUpperCase().replace(/'/g, "").replace(/✅/g, "").replace(/⏳/g, "").trim();

      autoTable(doc, {
        startY: 40,
        body: [
          ["SITE NAME", siteName.toUpperCase()],
          ["ENGINEER", log.technician_name?.toUpperCase() || "N/A"],
          ["JOB TYPE", (log.service_type || "Routine Service").toUpperCase()],
          ["STATUS", cleanStatus], 
          ["WORK DESCRIPTION", log.work_done || "N/A"],
          ["DATE", new Date(log.created_at).toLocaleDateString('en-GB')],
          ["REMARKS", log.remarks || "No additional remarks"],
          ["NEXT SCHEDULE", `      ${nextScheduleFormatted}`] 
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 }
        },
        didParseCell: (data) => {
          // STATUS COLUMN WORD/LETTER GAP ENGINE
          if (data.row.index === 3 && data.column.index === 1) {
            const val = data.cell.raw?.toString().toUpperCase();
            
            // 🔥 FIXED TYPEERROR: Type casted styles object to any to bypass strict charSpace checks
            (data.cell.styles as any).charSpace = 1.5; 

            if (val?.includes("COMPLETED") || val?.includes("DONE")) {
              data.cell.styles.textColor = [16, 185, 129]; 
              data.cell.styles.fontStyle = 'bold';
            } else if (val?.includes("PENDING")) {
              data.cell.styles.textColor = [249, 115, 22]; 
              data.cell.styles.fontStyle = 'bold';
            }
          }

          if (data.row.index === 7) {
            if (data.column.index === 1) {
              data.cell.styles.textColor = [239, 68, 68]; 
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawCell: (data) => {
          if (data.row.index === 7 && data.column.index === 1) {
            const x = data.cell.x + 4;
            const y = data.cell.y + 3.5;
            
            doc.setDrawColor(239, 68, 68).setLineWidth(0.3).setFillColor(255, 255, 255);
            doc.rect(x, y, 4.5, 4.2, 'FD'); 
            doc.line(x, y + 1.2, x + 4.5, y + 1.2); 
            
            doc.setFillColor(239, 68, 68);
            doc.rect(x + 1, y - 0.6, 0.6, 1, 'F');
            doc.rect(x + 2.8, y - 0.6, 0.6, 1, 'F');
          }
        },
        didDrawPage: () => addFooter(doc, log)
      });
      doc.save(`Slip_${siteName}.pdf`);
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="animate-in fade-in fixed inset-0 z-[999] flex items-stretch justify-center bg-slate-900/60 p-0 backdrop-blur-md duration-300 sm:items-center sm:p-4">
        <div 
          style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          className="animate-in slide-in-from-bottom relative flex w-full max-w-xl flex-col overflow-hidden border border-white/40 bg-white shadow-2xl duration-500 sm:h-auto sm:max-h-[90vh] sm:rounded-[45px]"
        >
          {/* 🏗️ MODULAR SECTION 1: HEADER BLOCK */}
          <ModalHeader 
            siteName={siteName} 
            logsCount={logs.length} 
            onClose={onClose} 
            onDownloadMaster={downloadMasterPDF} 
          />

          {/* 📝 MODULAR SECTION 2: MAIN SCROLLABLE BODY */}
          <ModalMainBody 
            loading={loading} 
            logs={logs} 
            onPrintReceipt={downloadSingleReceipt} 
          />

          {/* 🏗️ MODULAR SECTION 3: FOOTER BRANDING BLOCK */}
          <ModalFooter />
          
        </div>
      </div>

      <MasterDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type} 
      />

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </>
  );
}

// ==========================================
// 🛠️ SUB-COMPONENTS SECTIONS FOR EASY EDITING
// ==========================================

function ModalHeader({ siteName, logsCount, onClose, onDownloadMaster }: any) {
  return (
    <header className="sticky top-0 z-[110] flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 p-6 backdrop-blur-xl">
      <div className="text-left">
        <h2 className="flex items-center gap-2 text-xl leading-none font-[1000] tracking-tighter text-slate-800 uppercase italic">
          <ClipboardList className="text-blue-600" size={24} /> Service History
        </h2>
        <p className="mt-2 max-w-[200px] truncate font-black tracking-[5px] text-[10px] text-blue-500 uppercase">{siteName}</p>
      </div>
      <div className="flex gap-2">
        {logsCount > 0 && (
          <button onClick={onDownloadMaster} className="flex items-center justify-center rounded-2xl border-b-4 border-slate-700 bg-slate-900 p-3 text-white shadow-lg transition-all active:scale-95 active:border-b-0">
            <FileText size={18} />
          </button>
        )}
        <button onClick={onClose} className="flex items-center justify-center rounded-2xl border-2 border-b-4 border-slate-100 bg-slate-50 p-3 text-slate-400 transition-all active:scale-95 active:border-b-0">
          <X size={20} strokeWidth={3} />
        </button>
      </div>
    </header>
  );
}

function ModalMainBody({ loading, logs, onPrintReceipt }: any) {
  return (
    <main className="custom-scroll flex-1 space-y-5 overflow-y-auto scroll-smooth bg-slate-50/40 p-5 pb-32 sm:p-8">
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-32">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="font-black tracking-[5px] text-[10px] text-slate-400 uppercase">Syncing Records</p>
        </div>
      ) : logs.length > 0 ? (
        logs.map((log: any) => (
          <div key={log.id} className="group relative rounded-[35px] border-2 border-slate-100 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 leading-none font-[1000] tracking-tight text-[10px] text-blue-600 uppercase">
                <Calendar size={12} /> {new Date(log.created_at).toLocaleDateString('en-GB')}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onPrintReceipt(log); }} 
                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border-2 border-emerald-100 border-b-4 active:border-b-0 active:scale-95 transition-all flex items-center justify-center"
              >
                <Printer size={16} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-3 text-slate-400"><User size={16} /></div>
                <div>
                  <p className="leading-none font-black tracking-[2px] text-slate-400 text-[9px] uppercase">Service Engineer</p>
                  <p className="mt-1.5 text-base leading-none font-black text-slate-800 uppercase">{log.technician_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-[20px] border border-orange-100 bg-orange-50 p-3 text-orange-500"><Wrench size={16} /></div>
                <div className="flex-1">
                  <p className="leading-none font-black tracking-[2px] text-slate-400 text-[9px] uppercase">Job Summary</p>
                  <div className="mt-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed font-bold text-slate-700">
                    {log.work_done}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="font-black tracking-widest text-[8px] text-slate-400 uppercase">Job Type</p>
                    <p className="mt-1 font-bold text-[10px] text-slate-700 uppercase">{log.service_type || "Routine"}</p>
                 </div>
                 <div className={`p-3 rounded-2xl border ${log.status?.includes('Completed') || log.status?.includes('✅') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                    <p className="font-black tracking-widest text-[8px] uppercase opacity-60">Status</p>
                    <p className="mt-1 font-bold text-[10px] uppercase">{log.status || "Completed"}</p>
                 </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-[20px] bg-purple-50 p-3 text-purple-600"><MessageSquare size={16} /></div>
                <div>
                  <p className="leading-none font-black tracking-[2px] text-[9px] text-slate-400 uppercase">Technician Remarks</p>
                  <p className="mt-2 text-sm leading-relaxed font-bold text-slate-600 italic">"{log.remarks || 'Routine maintenance completed.'}"</p>
                </div>
              </div>

              {log.next_service_date && (
                <div className="flex cursor-pointer items-center justify-between rounded-[30px] border-b-4 border-emerald-800 bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-100 transition-all active:translate-y-[2px] active:scale-95 active:border-b-0">
                  <div className="flex items-center gap-3">
                    <Clock size={18} />
                    <div>
                      <p className="leading-none font-black text-[8px] uppercase opacity-70">Next Visit</p>
                      <p className="mt-1 text-xs font-black uppercase">Maintenance Due</p>
                    </div>
                  </div>
                  <span className="text-base font-[1000] italic">{new Date(log.next_service_date).toLocaleDateString('en-GB')}</span>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center gap-4 py-24 text-center opacity-30">
           <AlertCircle size={48} className="text-slate-400" />
           <p className="font-black tracking-[5px] text-[10px] uppercase">Zero Records Found</p>
        </div>
      )}
    </main>
  );
}

function ModalFooter() {
  return (
    <footer className="shrink-0 bg-white pt-2 pb-8">
      <p className="text-center text-xs leading-none font-[1000] tracking-tighter text-slate-400 uppercase italic">
         <span>
          {(COMPANY?.app?.name || "Cctv Portal").split(' ')[0]}
         </span>
         <span className="ml-1 text-blue-600 italic">
          {(COMPANY?.app?.name || "Cctv Portal").split(' ')[1] || ""}
         </span>
         <span className="ml-2 font-black tracking-[2px] text-slate-300 text-[10px] italic">
          {COMPANY?.app?.version || "v2.0"}
         </span>
      </p>
    </footer>
  );
}