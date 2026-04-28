"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, MapPin, Camera, Settings2, X, 
  RefreshCcw, Zap, ArrowRight, SlidersHorizontal, 
  Trash2, Smartphone, Monitor, Info, CheckCircle2, Copy, Check
} from "lucide-react";

/**
 * 🛡️ Master Hardware Guard
 * Supports: iOS (Safari/Chrome), Android, Windows (Chrome/Edge/Firefox)
 */
export default function PermissionGate() {
  const [status, setStatus] = useState({ location: "prompt", camera: "prompt" });
  const [isOpen, setIsOpen] = useState(false);
  const [device, setDevice] = useState<"ios" | "android" | "windows">("android");
  const [copied, setCopied] = useState(false);

  // 1. 🔍 Universal Device & Permission Scanner
  const scanPermissions = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Detect Device Type
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setDevice("ios");
    else if (/windows/.test(ua)) setDevice("windows");
    else setDevice("android");

    try {
      const [locStatus, camStatus] = await Promise.all([
        navigator.permissions.query({ name: "geolocation" as PermissionName }),
        navigator.permissions.query({ name: "camera" as PermissionName })
      ]);

      const update = () => {
        setStatus({ location: locStatus.state, camera: camStatus.state });
        if (locStatus.state === "granted" && camStatus.state === "granted") {
          setIsOpen(false);
        }
      };

      update();
      locStatus.onchange = update;
      camStatus.onchange = update;
    } catch (err) {
      console.warn("Permission API limited on this browser.");
    }
  }, []);

  useEffect(() => {
    scanPermissions();
    // Re-check when user comes back from Settings
    window.addEventListener('focus', scanPermissions);
    return () => window.removeEventListener('focus', scanPermissions);
  }, [scanPermissions]);

  // 2. ⚡ Manual Trigger Actions
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
      {/* 🚨 Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 z-[999] bg-red-600 text-white p-4 rounded-[22px] shadow-[0_20px_50px_rgba(220,38,38,0.5)] animate-bounce border-4 border-white active:scale-90 transition-all group"
      >
        <ShieldAlert size={26} className="shrink-0" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </button>

      {/* 🎴 Master Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-[420px] bg-white rounded-[3.5rem] shadow-2xl border border-white p-7 sm:p-8 relative">
            
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-blue-400 shadow-lg shrink-0">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-[0.9] border-l-2 border-slate-100 pl-4">
                  Hardware <br/> <span className="text-blue-600">Auth</span>entication
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-slate-50 p-2 rounded-xl text-slate-300 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <StatusCard label="LOCATION (GPS)" status={status.location} icon={<MapPin size={20}/>} onEnable={() => handleAction('location')} />
              <StatusCard label="SCANNER (CAMERA)" status={status.camera} icon={<Camera size={20}/>} onEnable={() => handleAction('camera')} />
            </div>

            {/* 🛠️ Troubleshooting Section */}
            {(status.location === "denied" || status.camera === "denied") && (
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  {device === 'windows' ? <Monitor size={14}/> : <Smartphone size={14}/>}
                  <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest italic">{device} Solution</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  {device === "ios" ? (
                    <>
                      <Step num="1" text={<>iPhone ki **Settings App** (Main) kholiye.</>} />
                      <Step num="2" text={<>**Chrome** dhoond kar wahan Camera & Location toggle **ON** karein.</>} />
                      <Step num="3" text={<>Agar toggle nahi hai toh **Privacy &gt; Camera** mein check karein.</>} />
                    </>
                  ) : device === "windows" ? (
                    <>
                      <Step num="1" text={<>URL bar mein **Lock (🔒)** par click karke Permission Reset karein.</>} />
                      <Step num="2" text={<>Chrome Settings mein jaakar manually **Allow** karein.</>} />
                      {/* PC Specific Settings Link */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 mt-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-2 italic tracking-tighter">Direct Settings Link (PC)</p>
                        <button onClick={copySettingsLink} className="w-full flex items-center justify-between bg-slate-50 p-2 rounded-lg hover:border-blue-300 border border-transparent transition-all">
                          <span className="text-[9px] font-mono text-blue-600 truncate mr-2 italic">chrome://settings/content/siteDetails...</span>
                          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Step num="1" text={<>Upar **Lock (🔒)** ya **Tune** icon ko dabayein.</>} />
                      <Step num="2" text={<>**Site Settings** mein jaakar Reset ya Allow karein.</>} />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="py-3 bg-white border border-red-100 text-red-500 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Trash2 size={12} /> Clear Cache
                  </button>
                  <button onClick={() => window.location.reload()} className="py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 active:scale-95 shadow-lg italic tracking-widest">
                    <RefreshCcw size={12} /> Refresh
                  </button>
                </div>
              </div>
            )}

            <button 
              disabled={!allClear}
              onClick={() => setIsOpen(false)}
              className={`w-full mt-6 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
                allClear ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
              }`}
            >
              {allClear ? <>Portal Activated <CheckCircle2 size={20}/></> : <>Awaiting Auth <Zap className="animate-pulse" size={18}/></>}
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
      <span className="bg-red-200 text-red-700 w-5 h-5 rounded-lg flex items-center justify-center text-[9px] shrink-0 font-[1000] italic shadow-sm">{num}</span>
      <p className="tracking-tight italic">{text}</p>
    </div>
  );
}

function StatusCard({ label, status, icon, onEnable }: any) {
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  return (
    <div className={`p-1 rounded-[2.5rem] transition-all duration-500 ${isGranted ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-100 border border-slate-200 shadow-inner'}`}>
      <div className="flex items-center justify-between p-4 bg-white rounded-[2.3rem] shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-4 relative">
          <div className={`p-3 rounded-2xl transition-all ${isGranted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-50' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
          <div className="text-left">
            <p className="text-[9px] font-[1000] text-slate-400 uppercase leading-none mb-1 italic tracking-widest">{label}</p>
            <p className={`text-xs font-[1000] italic uppercase tracking-tighter ${isGranted ? 'text-emerald-600' : 'text-slate-700'}`}>{isGranted ? '✓ Verified' : isDenied ? '✕ Restricted' : 'Pending'}</p>
          </div>
        </div>
        {!isGranted && <button onClick={onEnable} className="bg-[#111827] text-white px-5 py-2.5 rounded-2xl text-[10px] font-[1000] uppercase italic tracking-widest active:scale-90 transition-all shadow-md">Enable</button>}
      </div>
    </div>
  );
}