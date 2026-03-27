"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShieldCheck, MapPin, XCircle, Smartphone, History as HistoryIcon, Calendar } from "lucide-react";

// 💡 Sahi relative path aapke folder structure ke mutabik
import HistoryModal from "../../admin/HistoryModal";

export default function RequestPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  
  // Modal states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [latestServiceDate, setLatestServiceDate] = useState<string | null>(null);

  // --- 📏 Range Check Logic ---
  const checkAccess = (siteLat: number, siteLon: number) => {
    if (!navigator.geolocation) return alert("GPS not supported");

    navigator.geolocation.getCurrentPosition((pos) => {
      const R = 6371000; // Meters
      const dLat = (siteLat - pos.coords.latitude) * Math.PI / 180;
      const dLon = (siteLon - pos.coords.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(pos.coords.latitude * Math.PI/180) * Math.cos(siteLat * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      setInRange(distance <= 200); // 200 meters range
      setLoading(false);
    }, (err) => {
      alert("Please enable Location to proceed");
      setLoading(false);
    });
  };

  useEffect(() => {
    const getDeviceData = async () => {
      // 1. Get Device Details
      const { data: devData } = await supabase.from("devices").select("*").eq("sn", deviceId).single();
      
      if (devData) {
        setDevice(devData);
        checkAccess(devData.latitude, devData.longitude);

        // 2. 💡 Fetch latest service date directly from logs
        const { data: logData } = await supabase
          .from("service_logs")
          .select("next_service_date")
          .eq("device_sn", deviceId)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (logData && logData.length > 0) {
          setLatestServiceDate(logData[0].next_service_date);
        }
      } else {
        alert("Invalid QR Code");
        setLoading(false);
      }
    };
    getDeviceData();
  }, [deviceId]);

  const handleRequest = async () => {
    if (mobile.length < 10) return alert("Enter valid WhatsApp number");
    setReqLoading(true);

    const res = await fetch("/api/request-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, device_id: device.sn }),
    });

    const data = await res.json();
    setReqLoading(false);

    if (data.success) {
      alert("✅ Request Sent! Opening WhatsApp...");
      window.open(data.waLink, "_blank");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <div className="font-black text-slate-400 animate-pulse text-sm tracking-[5px] uppercase">Verifying Site Access...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-[50px] shadow-2xl overflow-hidden border border-white relative transition-all">
        
        {/* Header Section */}
        <div className="bg-[#f0f7ff] p-10 text-center border-b border-blue-50 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
          
          <h1 className="text-[34px] font-[1000] text-slate-900 tracking-tighter leading-none mb-3 italic uppercase">
            {device?.site_name || "CCTV PORTAL"}
          </h1>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">Model: {device?.model}</span>
            {latestServiceDate && (
               <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100">
                  <Calendar size={12} /> NEXT SERVICE: {new Date(latestServiceDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
               </div>
            )}
          </div>
        </div>

        {inRange ? (
          <div className="p-10 space-y-6">
            {/* Input WhatsApp Number */}
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">📱</div>
              <input 
                type="tel"
                placeholder="WhatsApp Number"
                className="w-full py-6 pl-14 pr-4 bg-slate-50 border-2 border-slate-100 rounded-[28px] outline-none text-slate-800 font-black placeholder:text-slate-300 focus:border-orange-400 focus:bg-white transition-all shadow-sm text-lg"
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            {/* Buttons Row */}
            <div className="space-y-4 pt-2">
              <button 
                onClick={handleRequest}
                disabled={reqLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-[1000] py-6 rounded-[35px] tracking-widest text-[15px] uppercase shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {reqLoading ? <Loader2 className="animate-spin" /> : "Request Passwords"}
              </button>

              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="w-full bg-white hover:bg-slate-50 text-slate-600 font-black py-6 rounded-[35px] tracking-widest text-[13px] uppercase border-2 border-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <HistoryIcon size={20} className="text-blue-500" /> View Maintenance Logs
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-300 mt-10 font-black uppercase tracking-[5px]">
              Modern Enterprise 2026
            </p>
          </div>
        ) : (
          /* OUT OF RANGE VIEW */
          <div className="p-16 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
               <XCircle size={50} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-[1000] text-slate-900 italic tracking-tighter uppercase leading-none">Access Denied</h2>
            <p className="text-slate-400 text-xs mt-4 leading-relaxed font-bold uppercase tracking-widest px-4">
              Too far from <span className="text-red-500">{device?.site_name}</span>. Please stand within 200m to proceed.
            </p>
          </div>
        )}

        {/* 📜 History Modal Component */}
        <HistoryModal 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          sn={device?.sn} 
          siteName={device?.site_name} 
        />
      </div>
    </div>
  );
}