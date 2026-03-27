"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  X, Calendar, User, Wrench, Clock, 
  Loader2, ClipboardList, CheckCircle2, 
  ChevronRight 
} from "lucide-react";

// Types define karein taaki har jagah error na aaye
interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn: string;
  siteName: string;
}

export default function HistoryModal({ isOpen, onClose, sn, siteName }: HistoryModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && sn) {
      const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("service_logs")
          .select("*")
          .eq("device_sn", sn)
          .order("created_at", { ascending: false });
        
        if (data) setLogs(data);
        if (error) console.error("Error:", error.message);
        setLoading(false);
      };
      fetchLogs();
    }
  }, [isOpen, sn]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[50px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 border border-white">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
        
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#fcfdfe]">
          <div className="text-left">
            <h2 className="text-xl font-[1000] text-slate-800 uppercase italic tracking-tighter">🛠️ Service Logs</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-[2px]">{siteName}</span>
               <span className="text-[9px] font-bold text-slate-300 font-mono uppercase">{sn}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3.5 bg-white rounded-[20px] shadow-sm text-slate-400 hover:text-red-500 border border-slate-100 active:scale-90 transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scroll space-y-5 bg-white">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center">
              <Loader2 className="animate-spin text-blue-600" size={40} strokeWidth={2.5} />
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[4px]">Accessing History...</p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative p-6 rounded-[35px] border border-slate-50 bg-[#fbfcfd] overflow-hidden group hover:shadow-lg transition-all">
                <div className={`absolute left-0 top-0 h-full w-2 ${log.status.includes('Completed') ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <Calendar size={12} className="text-blue-500" />
                    <span className="text-[10px] font-[900] text-slate-600">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${log.status.includes('Completed') ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {log.status}
                  </span>
                </div>
                <div className="space-y-3 text-left">
                  <p className="text-[14px] font-bold text-slate-800"><span className="text-slate-400 font-black text-[9px] uppercase block mb-0.5">Technician</span> {log.technician_name}</p>
                  <p className="text-[13px] font-semibold text-slate-600 italic"><span className="text-slate-400 font-black text-[9px] uppercase block mb-0.5">Work Done</span> "{log.work_done}"</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-3 opacity-30">
              <ClipboardList size={40} className="mx-auto" />
              <p className="text-[11px] font-black uppercase tracking-widest">No service history</p>
            </div>
          )}
        </div>
        <div className="p-8 bg-slate-50/50 border-t border-slate-50 text-center text-[9px] font-[1000] text-slate-300 uppercase tracking-[4px]">System Audit Trail</div>
      </div>
    </div>
  );
}