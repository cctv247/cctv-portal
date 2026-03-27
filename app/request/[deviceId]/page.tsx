"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, ShieldCheck, MapPin, XCircle, 
  CheckCircle2, Smartphone, History as HistoryIcon 
} from "lucide-react";
import HistoryModal from "../../admin/HistoryModal";

export default function RequestPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  
  // Modals State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // --- 📏 Range Check ---
  const checkAccess = (siteLat: number, siteLon: number, siteRadius: number) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const R = 6371000;
      const dLat = (siteLat - pos.coords.latitude) * Math.PI / 180;
      const dLon = (siteLon - pos.coords.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(pos.coords.latitude * Math.PI/180) * Math.cos(siteLat * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      setInRange(distance <= (siteRadius || 200));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  useEffect(() => {
    const getDevice = async () => {
      const { data } = await supabase.from("devices").select("*").eq("sn", deviceId).single();
      if (data) {
        setDevice(data);
        checkAccess(data.latitude, data.longitude, data.radius);
      }
    };
    getDevice();
  }, [deviceId]);

  const handleRequest = async () => {
    if (mobile.length < 10) return;
    setReqLoading(true);

    const res = await fetch("/api/request-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, device_id: device.sn }),
    });

    const data = await res.json();
    setReqLoading(false);

    if (data.success) {
      setShowSuccessDialog(true); // 👈 Simple Alert ki jagah Dialog khulega
      setMobile("");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-[5px]">Connecting...</div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-[50px] shadow-2xl overflow-hidden relative border border-white">
        
        {/* Header */}
        <div className="bg-[#f0f7ff] p-10 text-center border-b border-blue-50">
          <h1 className="text-[34px] font-[1000] text-slate-900 tracking-tighter uppercase italic italic">{device?.site_name}</h1>
          <p className="text-slate-400 font-bold text-[10px] tracking-[3px] uppercase mt-2">Verified Secure Node</p>
        </div>

        {inRange ? (
          <div className="p-10 space-y-6">
            <input 
              type="tel" 
              placeholder="WhatsApp Number" 
              className="w-full py-6 px-8 bg-slate-50 border-2 border-slate-100 rounded-[30px] outline-none text-slate-800 font-black focus:border-blue-500 transition-all text-lg"
              onChange={(e) => setMobile(e.target.value)}
              value={mobile}
            />
            <button 
              onClick={handleRequest} 
              disabled={reqLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-[1000] py-6 rounded-[35px] tracking-widest uppercase shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {reqLoading ? <Loader2 className="animate-spin mx-auto" /> : "Request Passwords"}
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="w-full bg-white text-slate-500 font-black py-6 rounded-[35px] tracking-widest uppercase border-2 border-slate-100 flex items-center justify-center gap-3 active:scale-95"
            >
              <HistoryIcon size={20} /> Maintenance Logs
            </button>
          </div>
        ) : (
          <div className="p-16 text-center">
            <XCircle size={60} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic">Access Denied</h2>
            <p className="text-slate-400 text-[10px] mt-4 font-black uppercase tracking-widest">Outside Site Radius</p>
          </div>
        )}

        {/* --- ✅ SUCCESS DIALOG --- */}
        {showSuccessDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl border border-white animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={44} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none mb-4">Request Sent!</h3>
              <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8 uppercase text-[11px] tracking-widest">
                Admin has been notified.<br/>Credentials will be shared on your WhatsApp shortly.
              </p>
              <button 
                onClick={() => setShowSuccessDialog(false)}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] tracking-widest uppercase text-xs hover:bg-slate-800 transition-all active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={device?.sn} siteName={device?.site_name} />
      </div>
    </div>
  );
}