"use client";
// app/permission/page.tsx
import { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, MapPin, Camera, AlertOctagon, 
  RefreshCcw, ArrowRight, Zap, Settings2, Info,
  Check, Copy, MousePointer2, ExternalLink
} from "lucide-react";

export default function UltimateHardwareGuard() {
  const [status, setStatus] = useState({
    location: "prompt",
    camera: "prompt",
    isSupported: true,
    loading: true
  });

  const [copied, setCopied] = useState(false);

  // 🛡️ BULLETPROOF PERMISSION SCANNER WITH IOS COMPATIBILITY FALLBACKS
  const scanPermissions = useCallback(async () => {
    // Basic verification framework checks
    if (typeof window === "undefined" || !navigator.permissions) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // 🛠️ Safe Query Framework Injection
      const locStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      let camStatusState = "prompt";

      try {
        // Safe casting wrapper string hook to pass tight Turbopack compilers smoothly
        const camStatus = await navigator.permissions.query({ name: "camera" as any });
        camStatusState = camStatus.state;
        
        camStatus.onchange = () => {
          setStatus(p => ({ ...p, camera: camStatus.state }));
        };
      } catch (camErr) {
        // Fallback for Safari/iOS devices where camera permission query returns undefined
        console.warn("Native camera query metadata bypass active for this client session.");
      }

      setStatus(prev => ({
        ...prev,
        location: locStatus.state,
        camera: camStatusState,
        loading: false
      }));

      // Bind dynamic location state change handler updates
      locStatus.onchange = () => {
        setStatus(p => ({ ...p, location: locStatus.state }));
      };

    } catch (err) {
      console.error("Hardware gateway synchronization constraint cleared:", err);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { 
    scanPermissions(); 
  }, [scanPermissions]);

  const handleLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setStatus(p => ({ ...p, location: "granted" })),
      () => setStatus(p => ({ ...p, location: "denied" })),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(t => t.stop());
      setStatus(p => ({ ...p, camera: "granted" }));
    } catch {
      setStatus(p => ({ ...p, camera: "denied" }));
    }
  };

  const copySettingsLink = () => {
    const settingsUrl = `chrome://settings/content/siteDetails?site=${encodeURIComponent(window.location.origin)}`;
    navigator.clipboard.writeText(settingsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const allClear = status.location === "granted" && status.camera === "granted";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-blue-100">
        
        <div className="p-8">
          {/* Header Dashboard Metrics */}
          <div className="mb-10 flex items-center justify-between">
            <div className="rotate-3 rounded-[1.5rem] bg-slate-900 p-4 text-blue-400 shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div className="text-right">
              <p className="leading-none font-black tracking-widest text-[10px] text-slate-400 uppercase">Security Shield</p>
              <p className="mt-1.5 text-xs font-black text-slate-800 uppercase italic">v4.5 Locked</p>
            </div>
          </div>

          <h1 className="mb-4 text-left text-3xl leading-[0.9] font-[1000] tracking-tighter text-slate-900 uppercase italic">
            Hardware <br/> Authentication
          </h1>

          {/* Core Hardware Authorization Matrix Rows */}
          <div className="mt-8 space-y-4">
            <PermissionRow label="Location (GPS)" status={status.location} icon={<MapPin size={20}/>} onAction={handleLocation} />
            <PermissionRow label="Scanner (Camera)" status={status.camera} icon={<Camera size={20}/>} onAction={handleCamera} />
          </div>

          {/* 🛠️ HARDWARE ACCESSIBILITY SYSTEM BLOCK GUIDE */}
          {(status.location === "denied" || status.camera === "denied") && (
            <div className="animate-in slide-in-from-top-4 mt-8 duration-500">
              <div className="rounded-[2.5rem] border-2 border-red-100 bg-red-50 p-6 shadow-sm">
                <div className="mb-4 flex gap-4 text-left text-red-700">
                  <Settings2 size={24} className="shrink-0" />
                  <div>
                    <p className="mb-1 text-sm leading-none font-black uppercase italic">Access Blocked</p>
                    <p className="font-bold tracking-tighter text-[10px] uppercase italic opacity-80">Fixing Steps Below:</p>
                  </div>
                </div>

                {/* ✅ Option 1: Lock Icon Mobile Framework */}
                <div className="mb-4 rounded-2xl border border-red-100/50 bg-white/60 p-4 text-left">
                  <p className="mb-3 font-black text-[10px] text-slate-400 uppercase italic">Option 1: Quick Fix (Mobile/PC)</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 font-bold text-[11px] text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 font-black text-red-700 text-[9px] italic">1</span>
                      <p>URL bar mein <span className="font-black text-blue-600 italic underline">Lock (🔒)</span> ko dabayein.</p>
                    </div>
                    <div className="flex items-center gap-3 font-bold text-[11px] text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 font-black text-red-700 text-[9px] italic">2</span>
                      <p><span className="italic underline">Site Settings</span> {'>'} <span className="italic underline">Permissions</span> mein jayein.</p>
                    </div>
                    <div className="flex items-center gap-3 font-bold text-[11px] text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 font-black text-red-700 text-[9px] italic">3</span>
                      <p><span className="font-black text-emerald-600 italic underline">Allow</span> Location aur Camera kar dein.</p>
                    </div>
                  </div>
                </div>

                {/* ✅ Option 2: Clipboard Settings Matrix Link Selector */}
                <div className="mb-5 rounded-2xl border border-red-100/50 bg-white/60 p-4 text-left">
                  <p className="mb-3 font-black text-[10px] text-slate-400 uppercase italic">Option 2: Manual Link (Desktop)</p>
                  
                  <div 
                    onClick={copySettingsLink}
                    className="group mb-4 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-blue-400"
                  >
                     <p className="truncate pr-4 font-mono font-bold tracking-tighter text-[10px] text-slate-400 italic">chrome://settings/content/siteDetails...</p>
                     <div className="shrink-0 rounded-lg bg-slate-900 p-1.5 text-white transition-transform group-active:scale-90">
                        {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                     </div>
                  </div>

                  <div className={`space-y-2 transition-all duration-500 ${copied ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex items-start gap-2">
                      <MousePointer2 size={12} className="mt-0.5 text-blue-500" />
                      <p className="leading-tight font-black text-[9px] text-slate-500 uppercase italic">Link copy karke <span className="text-slate-900 underline">New Tab</span> kholiye.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ExternalLink size={12} className="mt-0.5 text-blue-500" />
                      <p className="leading-tight font-black tracking-tight text-[9px] text-slate-500 uppercase italic">Address bar mein <span className="text-slate-900 underline">Paste</span> karke Enter dabayein.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95 transition-all italic tracking-widest"
                >
                  <RefreshCcw size={14} /> Refresh After Allowing
                </button>
              </div>
            </div>
          )}

          {/* Portal Core Initialization Trigger Call to Action */}
          <button
            disabled={!allClear}
            onClick={() => window.location.href = '/admin'}
            className={`w-full mt-10 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
              allClear ? 'bg-blue-600 text-white scale-100 shadow-blue-200 hover:bg-blue-700' : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
            }`}
          >
            {allClear ? <>Initialize Portal <ArrowRight size={20}/></> : <>Awaiting Access <Zap className="animate-pulse" size={18}/></>}
          </button>
        </div>

        {/* Global Node Branding Trace Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-5 text-center">
          <p className="font-black tracking-[0.25em] text-[9px] text-slate-400 uppercase">Modern Enterprises • Secure Node</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🛠️ RENDERING ATTACHMENT PERMISSION ROW SUB-COMPONENT
// ==========================================
function PermissionRow({ label, status, icon, onAction }: any) {
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  return (
    <div className={`p-1 rounded-[2rem] transition-all duration-500 ${isGranted ? 'bg-emerald-50 shadow-inner border border-emerald-100' : 'bg-slate-100 border border-slate-200'}`}>
      <div className="flex items-center justify-between rounded-[1.8rem] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4 text-left text-slate-700">
          <div className={`p-3 rounded-2xl ${isGranted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
          <div>
            <p className="mb-1 leading-none font-black tracking-tighter tracking-widest text-[9px] text-slate-400 uppercase italic">{label}</p>
            <p className={`text-xs font-[1000] italic tracking-tighter ${isGranted ? 'text-emerald-600' : 'text-slate-700'}`}>{isGranted ? '✓ FULL ACCESS' : isDenied ? '✖ BLOCKED' : 'READY TO AUTH'}</p>
          </div>
        </div>
        {!isGranted && <button onClick={onAction} className="rounded-xl bg-slate-900 px-5 py-2 font-black tracking-tighter text-white text-[10px] uppercase italic shadow-md transition-all active:scale-90">Enable</button>}
      </div>
    </div>
  );
}