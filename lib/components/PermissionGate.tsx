"use client";

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

  const scanPermissions = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.permissions) return;
    try {
      const [locStatus, camStatus] = await Promise.all([
        navigator.permissions.query({ name: "geolocation" as PermissionName }),
        navigator.permissions.query({ name: "camera" as PermissionName })
      ]);
      setStatus({ location: locStatus.state, camera: camStatus.state });
      locStatus.onchange = () => setStatus(p => ({ ...p, location: locStatus.state }));
      camStatus.onchange = () => setStatus(p => ({ ...p, camera: camStatus.state }));
    } catch (err) { console.warn("Scan failed", err); }
  }, []);

  useEffect(() => { scanPermissions(); }, [scanPermissions]);

  const handleAction = (type: 'location' | 'camera') => {
    if (type === 'location') {
      navigator.geolocation.getCurrentPosition(
        () => setStatus(p => ({ ...p, location: "granted" })),
        () => setStatus(p => ({ ...p, location: "denied" })),
        // Mobile GPS ke liye high accuracy zaroori hai
        { enableHighAccuracy: true, timeout: 10000 } 
      );
    } else {
      // ✅ Mobile par back camera hi open karega
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          stream.getTracks().forEach(t => t.stop());
          setStatus(p => ({ ...p, camera: "granted" }));
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
      {/* 🚨 Floating Trigger Button (Touch Optimized) */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 z-[999] bg-red-600 text-white p-4 rounded-[22px] shadow-2xl animate-bounce border-4 border-white flex items-center gap-0 group transition-all duration-500 active:scale-90"
      >
        <ShieldAlert size={26} className="shrink-0" />
        <span className="text-[11px] font-[1000] uppercase tracking-[2px] overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-500 whitespace-nowrap italic">Fix Access</span>
      </button>

      {/* 🎴 Modal Overlay (Mobile Friendly Scroll) */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-[420px] bg-white rounded-[3rem] shadow-2xl border border-white p-6 sm:p-8 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-blue-400 shadow-lg shrink-0">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-[0.9] border-l-2 border-slate-100 pl-3">
                  Hardware <br/> <span className="text-blue-600">Auth</span>entication
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-slate-50 p-2 rounded-xl text-slate-300 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <StatusCard label="LOCATION (GPS)" status={status.location} icon={<MapPin size={20}/>} onEnable={() => handleAction('location')} />
              <StatusCard label="SCANNER (CAMERA)" status={status.camera} icon={<Camera size={20}/>} onEnable={() => handleAction('camera')} />
            </div>

            {/* Troubleshooting Steps */}
            {(status.location === "denied" || status.camera === "denied") && (
              <div className="mt-8 p-5 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 italic tracking-widest text-center">Security Policy Fix</p>
                <div className="space-y-3 mb-6">
                  <Step num="1" text={<>URL bar mein <span className="text-blue-600 underline font-black italic">Lock (🔒)</span> ko dabayein.</>} />
                  <Step num="2" text={<>Wahan <span className="italic">Permissions</span> ko allow karein.</>} />
                </div>

                {/* Refresh for Mobile */}
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 shadow-lg italic">
                  <RefreshCcw size={14} /> Refresh System
                </button>
              </div>
            )}

            <button 
              disabled={!allClear}
              onClick={() => setIsOpen(false)}
              className={`w-full mt-6 py-5 sm:py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
                allClear ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
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

function Step({ num, text }: any) {
  return (
    <div className="flex gap-3 items-start text-[11px] font-bold text-slate-700 leading-tight">
      <span className="bg-red-200 text-red-700 w-5 h-5 rounded-lg flex items-center justify-center text-[9px] shrink-0 font-black italic shadow-sm">{num}</span>
      <p>{text}</p>
    </div>
  );
}

function StatusCard({ label, status, icon, onEnable }: any) {
  const isGranted = status === "granted";
  return (
    <div className={`p-1 rounded-[2.5rem] transition-all duration-500 ${isGranted ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-100 border border-slate-200'}`}>
      <div className="flex items-center justify-between p-4 bg-white rounded-[2.3rem] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 relative">
          <div className={`p-3 rounded-2xl transition-all ${isGranted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
          <div className="text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
            <p className={`text-xs font-[1000] italic uppercase ${isGranted ? 'text-emerald-600' : 'text-slate-700'}`}>{isGranted ? '✓ Verified' : 'Pending'}</p>
          </div>
        </div>
        {!isGranted && <button onClick={onEnable} className="bg-[#111827] text-white px-5 py-2.5 rounded-2xl text-[10px] font-[1000] uppercase italic active:scale-90">Enable</button>}
      </div>
    </div>
  );
}