"use client";

/* 🚀 Body section update:
1. import PermissionGate from "@/lib/components/PermissionGate";
2. <PermissionGate />  
Tag add karne se hi kaam ho jayega. 🛡️ Har page par hardware monitor karega.
*/
import { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, MapPin, Camera, Settings2, X, 
  Check, Copy, MousePointer2, ExternalLink, RefreshCcw,
  Zap, ArrowRight, SlidersHorizontal
} from "lucide-react";

export default function PermissionGate() {
  const [status, setStatus] = useState({ location: "prompt", camera: "prompt" });
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. 🔄 Professional Scanner (Persistent Check)
  const scanPermissions = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.permissions) return;
    try {
      const [locStatus, camStatus] = await Promise.all([
        navigator.permissions.query({ name: "geolocation" as PermissionName }),
        navigator.permissions.query({ name: "camera" as PermissionName })
      ]);

      const updateStatus = () => {
        setStatus({ location: locStatus.state, camera: camStatus.state });
        // Agar users settings se allow kar de toh modal khud band ho jaye
        if (locStatus.state === "granted" && camStatus.state === "granted") {
          setIsOpen(false);
        }
      };

      updateStatus();
      locStatus.onchange = updateStatus;
      camStatus.onchange = updateStatus;
    } catch (err) { 
      console.warn("Scan failed, using manual fallback", err); 
    }
  }, []);

  useEffect(() => { 
    scanPermissions(); 
    // Mobile par jab user tab switch karke wapas aaye
    window.addEventListener('focus', scanPermissions);
    return () => window.removeEventListener('focus', scanPermissions);
  }, [scanPermissions]);

  // 2. 📍 Action Handlers (Mobile Optimized)
  const handleAction = (type: 'location' | 'camera') => {
    if (type === 'location') {
      navigator.geolocation.getCurrentPosition(
        () => scanPermissions(),
        () => setStatus(p => ({ ...p, location: "denied" })),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          stream.getTracks().forEach(t => t.stop());
          scanPermissions();
        })
        .catch(() => setStatus(p => ({ ...p, camera: "denied" })));
    }
  };

  const copySettingsLink = () => {
    const settingsUrl = `chrome://settings/content/siteDetails?site=${encodeURIComponent(window.location.origin)}`;
    navigator.clipboard.writeText(settingsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const allClear = status.location === "granted" && status.camera === "granted";
  if (allClear) return null;

  return (
    <>
      {/* 🚨 Floating Trigger Button (With Hover Expansion) */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 z-[999] bg-red-600 text-white p-4 rounded-[25px] shadow-[0_20px_50px_rgba(220,38,38,0.4)] animate-bounce border-4 border-white flex items-center gap-0 hover:gap-3 group transition-all duration-500 ease-in-out active:scale-90 hover:scale-110"
      >
        <ShieldAlert size={26} className="shrink-0" />
        <span className="text-[11px] font-[1000] uppercase tracking-[2px] overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-500 whitespace-nowrap italic">Fix Access</span>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </button>

      {/* 🎴 Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 font-sans text-left">
          <div className="w-full max-w-[420px] bg-white rounded-[3.5rem] shadow-2xl border border-white animate-in zoom-in-95 p-8 relative overflow-hidden">
            
            {/* ✅ Header: Heading and Icon in the same line */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-blue-400 shadow-lg shrink-0">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-[0.9] border-l-2 border-slate-100 pl-4">
                  Hardware <br/> <span className="text-blue-600">Auth</span>entication
                </h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="bg-slate-100 p-2 rounded-xl text-slate-300 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Cards */}
            <div className="space-y-4">
              <StatusCard label="LOCATION (GPS)" status={status.location} icon={<MapPin size={20}/>} onEnable={() => handleAction('location')} />
              <StatusCard label="SCANNER (CAMERA)" status={status.camera} icon={<Camera size={20}/>} onEnable={() => handleAction('camera')} />
            </div>

            {/* Troubleshooting Steps (Lock + View Site Info) */}
            {(status.location === "denied" || status.camera === "denied") && (
              <div className="mt-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in slide-in-from-top-2 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 italic tracking-widest text-center">Security Policy Fix</p>
                <div className="space-y-3 mb-6">
                  {/* Step 1: Universal Button Guide */}
                  <Step num="1" text={<>URL bar mein <span className="text-blue-600 underline font-black italic">Lock (🔒)</span> ya <span className="text-blue-600 underline inline-flex items-center gap-1 font-black italic">View Site Info <SlidersHorizontal size={10} /></span> ko dabayein.</>} />
                  <Step num="2" text={<>Menu mein <span className="italic">Site Settings</span> ya <span className="italic">Permissions</span> ko open karein.</>} />
                  <Step num="3" text={<><span className="text-emerald-600 font-black italic">Allow</span> Location & Camera sensors ko enable karein.</>} />
                </div>

                {/* Manual Link Box */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 relative shadow-sm">
                  <div onClick={copySettingsLink} className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl cursor-pointer hover:border-blue-400 transition-all">
                    <p className="text-[9px] font-mono text-slate-400 truncate tracking-tight uppercase font-bold italic">Copy Settings Link</p>
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                  </div>
                  {copied && (
                    <div className="mt-2 space-y-1 animate-in fade-in">
                      <p className="text-[8px] font-black text-blue-600 uppercase flex items-center gap-1 italic"><MousePointer2 size={10}/> New Tab kholiye</p>
                      <p className="text-[8px] font-black text-blue-600 uppercase flex items-center gap-1 italic"><ExternalLink size={10}/> Paste karke Enter karein</p>
                    </div>
                  )}
                </div>

                <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg italic tracking-widest">
                  <RefreshCcw size={14} /> Refresh System
                </button>
              </div>
            )}

            {/* Bottom Action Button */}
            <button 
              disabled={!allClear}
              onClick={() => setIsOpen(false)}
              className={`w-full mt-6 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
                allClear ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
              }`}
            >
              {allClear ? <>Portal Activated <ArrowRight size={20}/></> : <>Awaiting Auth <Zap className="animate-pulse" size={18}/></>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ✅ Reusable Step Component
function Step({ num, text }: { num: string, text: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start text-[11px] font-bold text-slate-700 leading-tight tracking-tight">
      <span className="bg-red-200 text-red-700 w-5 h-5 rounded-lg flex items-center justify-center text-[9px] shrink-0 font-black italic shadow-sm">{num}</span>
      <p>{text}</p>
    </div>
  );
}

// ✅ Status Card Component
function StatusCard({ label, status, icon, onEnable }: any) {
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  return (
    <div className={`p-1 rounded-[2.5rem] transition-all duration-500 ${isGranted ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-100 border border-slate-200 shadow-inner'}`}>
      <div className="flex items-center justify-between p-4 bg-white rounded-[2.3rem] shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-4 relative">
          <div className={`p-3 rounded-2xl transition-all ${isGranted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-50' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
          <div className="text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 italic tracking-widest">{label}</p>
            <p className={`text-xs font-[1000] italic uppercase tracking-tighter ${isGranted ? 'text-emerald-600' : 'text-slate-700'}`}>{isGranted ? '✓ Verified' : isDenied ? '✕ Restricted' : 'Pending'}</p>
          </div>
        </div>
        {!isGranted && <button onClick={onEnable} className="bg-[#111827] text-white px-5 py-2.5 rounded-2xl text-[10px] font-[1000] uppercase italic tracking-widest active:scale-90 transition-all shadow-md">Enable</button>}
      </div>
    </div>
  );
}