"use client";
// app/components/PermissionGate.tsx
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
          <span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative h-4 w-4 rounded-full border-2 border-white bg-red-500"></span>
        </span>
      </button>

      {/* 🎴 Master Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-[420px] rounded-[3.5rem] border border-white bg-white p-7 shadow-2xl sm:p-8">
            
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="shrink-0 rounded-2xl bg-slate-900 p-3 text-blue-400 shadow-lg">
                  <Settings2 size={24} />
                </div>
                <h2 className="border-l-2 border-slate-100 pl-4 text-2xl leading-[0.9] font-[1000] tracking-tighter text-slate-900 uppercase italic">
                  Hardware <br/> <span className="text-blue-600">Auth</span>entication
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-slate-50 p-2 rounded-xl text-slate-300 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 space-y-4">
              <StatusCard label="LOCATION (GPS)" status={status.location} icon={<MapPin size={20}/>} onEnable={() => handleAction('location')} />
              <StatusCard label="SCANNER (CAMERA)" status={status.camera} icon={<Camera size={20}/>} onEnable={() => handleAction('camera')} />
            </div>

            {/* 🛠️ Troubleshooting Section */}
            {(status.location === "denied" || status.camera === "denied") && (
              <div className="rounded-[2.5rem] border border-slate-200 bg-slate-50 p-6 shadow-inner">
                <div className="mb-4 flex items-center justify-center gap-2">
                  {device === 'windows' ? <Monitor size={14}/> : <Smartphone size={14}/>}
                  <p className="font-black tracking-widest text-[10px] text-slate-500 uppercase italic italic">{device} Solution</p>
                </div>
                
                <div className="mb-6 space-y-4">
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
                      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="mb-2 font-black tracking-tighter text-[8px] text-slate-400 uppercase italic">Direct Settings Link (PC)</p>
                        <button onClick={copySettingsLink} className="flex w-full items-center justify-between rounded-lg border border-transparent bg-slate-50 p-2 transition-all hover:border-blue-300">
                          <span className="mr-2 truncate font-mono text-[9px] text-blue-600 italic">chrome://settings/content/siteDetails...</span>
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
    <div className="flex items-start gap-3 leading-tight font-bold text-[11px] text-slate-700">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-red-200 font-[1000] text-red-700 text-[9px] italic shadow-sm">{num}</span>
      <p className="tracking-tight italic">{text}</p>
    </div>
  );
}

function StatusCard({ label, status, icon, onEnable }: any) {
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  return (
    <div className={`p-1 rounded-[2.5rem] transition-all duration-500 ${isGranted ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-100 border border-slate-200 shadow-inner'}`}>
      <div className="group relative flex items-center justify-between overflow-hidden rounded-[2.3rem] bg-white p-4 shadow-sm">
        <div className="relative flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all ${isGranted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-50' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
          <div className="text-left">
            <p className="mb-1 leading-none font-[1000] tracking-widest text-[9px] text-slate-400 uppercase italic">{label}</p>
            <p className={`text-xs font-[1000] italic uppercase tracking-tighter ${isGranted ? 'text-emerald-600' : 'text-slate-700'}`}>{isGranted ? '✓ Verified' : isDenied ? '✕ Restricted' : 'Pending'}</p>
          </div>
        </div>
        {!isGranted && <button onClick={onEnable} className="rounded-2xl bg-[#111827] px-5 py-2.5 font-[1000] tracking-widest text-white text-[10px] uppercase italic shadow-md transition-all active:scale-90">Enable</button>}
      </div>
    </div>
  );
}