"use client";

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

  const scanPermissions = useCallback(async () => {
    if (!navigator.permissions || !navigator.mediaDevices) {
      setStatus(prev => ({ ...prev, isSupported: false, loading: false }));
      return;
    }
    try {
      const [locStatus, camStatus] = await Promise.all([
        navigator.permissions.query({ name: "geolocation" as PermissionName }),
        navigator.permissions.query({ name: "camera" as PermissionName })
      ]);
      setStatus(prev => ({
        ...prev,
        location: locStatus.state,
        camera: camStatus.state,
        loading: false
      }));
      locStatus.onchange = () => setStatus(p => ({ ...p, location: locStatus.state }));
      camStatus.onchange = () => setStatus(p => ({ ...p, camera: camStatus.state }));
    } catch (err) {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { scanPermissions(); }, [scanPermissions]);

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setStatus(p => ({ ...p, location: "granted" })),
      () => setStatus(p => ({ ...p, location: "denied" })),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleCamera = async () => {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
        
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div className="bg-slate-900 p-4 rounded-[1.5rem] rotate-3 shadow-lg text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Shield</p>
              <p className="text-xs font-black text-slate-800 uppercase italic">v4.5 Locked</p>
            </div>
          </div>

          <h1 className="text-3xl font-[1000] text-slate-900 leading-[0.9] mb-4 uppercase italic tracking-tighter">
            Hardware <br/> Authentication
          </h1>

          <div className="space-y-4 mt-8">
            <PermissionRow label="Location (GPS)" status={status.location} icon={<MapPin size={20}/>} onAction={handleLocation} />
            <PermissionRow label="Scanner (Camera)" status={status.camera} icon={<Camera size={20}/>} onAction={handleCamera} />
          </div>

          {/* 🛠️ BLOCK GUIDE */}
          {(status.location === "denied" || status.camera === "denied") && (
            <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
              <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-6 shadow-sm">
                <div className="flex gap-4 mb-4 text-red-700">
                  <Settings2 size={24} className="shrink-0" />
                  <div>
                    <p className="text-sm font-black uppercase italic leading-none mb-1">Access Blocked</p>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter italic">Fixing Steps Below:</p>
                  </div>
                </div>

                {/* ✅ Option 1: Lock Icon (RE-ADDED ALL 3 LINES) */}
                <div className="bg-white/60 p-4 rounded-2xl mb-4 border border-red-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 italic">Option 1: Quick Fix (Mobile/PC)</p>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center text-[11px] font-bold text-slate-700">
                      <span className="bg-red-200 text-red-700 w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-black italic">1</span>
                      <p>URL bar mein <span className="text-blue-600 font-black italic underline">Lock (🔒)</span> ko dabayein.</p>
                    </div>
                    <div className="flex gap-3 items-center text-[11px] font-bold text-slate-700">
                      <span className="bg-red-200 text-red-700 w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-black italic">2</span>
                      <p><span className="underline italic">Site Settings</span> {'>'} <span className="underline italic">Permissions</span> mein jayein.</p>
                    </div>
                    <div className="flex gap-3 items-center text-[11px] font-bold text-slate-700">
                      <span className="bg-red-200 text-red-700 w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-black italic">3</span>
                      <p><span className="text-emerald-600 font-black italic underline">Allow</span> Location aur Camera kar dein.</p>
                    </div>
                  </div>
                </div>

                {/* ✅ Option 2: Manual Link + Usage Guide */}
                <div className="bg-white/60 p-4 rounded-2xl mb-5 border border-red-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 italic">Option 2: Manual Link (Desktop)</p>
                  
                  <div 
                    onClick={copySettingsLink}
                    className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer hover:border-blue-400 transition-all group mb-4 shadow-sm"
                  >
                     <p className="text-[10px] font-mono font-bold text-slate-400 truncate pr-4 italic tracking-tighter">chrome://settings/content/siteDetails...</p>
                     <div className="shrink-0 bg-slate-900 text-white p-1.5 rounded-lg group-active:scale-90 transition-transform">
                        {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                     </div>
                  </div>

                  <div className={`space-y-2 transition-all duration-500 ${copied ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex items-start gap-2">
                      <MousePointer2 size={12} className="text-blue-500 mt-0.5" />
                      <p className="text-[9px] font-black text-slate-500 uppercase leading-tight italic">Link copy karke <span className="text-slate-900 underline">New Tab</span> kholiye.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ExternalLink size={12} className="text-blue-500 mt-0.5" />
                      <p className="text-[9px] font-black text-slate-500 uppercase leading-tight italic tracking-tight">Address bar mein <span className="text-slate-900 underline">Paste</span> karke Enter dabayein.</p>
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

          <button
            disabled={!allClear}
            onClick={() => window.location.href = '/admin'}
            className={`w-full mt-10 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
              allClear ? 'bg-blue-600 text-white scale-100 shadow-blue-200' : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
            }`}
          >
            {allClear ? <>Initialize Portal <ArrowRight size={20}/></> : <>Awaiting Access <Zap className="animate-pulse" size={18}/></>}
          </button>
        </div>

        <div className="bg-slate-50 p-5 text-center border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Modern Enterprises • Secure Node</p>
        </div>
      </div>
    </div>
  );
}

function PermissionRow({ label, status, icon, onAction }: any) {
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  return (
    <div className={`p-1 rounded-[2rem] transition-all duration-500 ${isGranted ? 'bg-emerald-50 shadow-inner border border-emerald-100' : 'bg-slate-100 border border-slate-200'}`}>
      <div className="flex items-center justify-between p-4 bg-white rounded-[1.8rem] shadow-sm">
        <div className="flex items-center gap-4 text-slate-700">
          <div className={`p-3 rounded-2xl ${isGranted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 tracking-tighter italic">{label}</p>
            <p className={`text-xs font-[1000] italic tracking-tighter ${isGranted ? 'text-emerald-600' : 'text-slate-700'}`}>{isGranted ? '✓ FULL ACCESS' : isDenied ? '✖ BLOCKED' : 'READY TO AUTH'}</p>
          </div>
        </div>
        {!isGranted && <button onClick={onAction} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter active:scale-90 transition-all shadow-md">Enable</button>}
      </div>
    </div>
  );
}