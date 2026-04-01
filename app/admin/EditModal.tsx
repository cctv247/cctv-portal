"use client";
import { useState } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, User, Lock, Key
} from "lucide-react";

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: any) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen || !device) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (typeof setDevice === 'function') {
          setDevice({
            ...device,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          });
        }
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-md flex items-start justify-center animate-in fade-in duration-300 overflow-hidden">
      
      {/* 📱 Full Screen Container - Instruction: Scroll down hone pe browser bar hide ho sake */}
      <div className="bg-white w-full max-w-2xl h-full sm:h-[95vh] sm:mt-6 sm:rounded-[45px] shadow-2xl flex flex-col overflow-y-auto custom-scroll animate-in slide-in-from-bottom-10 duration-500">
        
        {/* --- 🏗️ HEADER (Instruction: Header icon bg hata de) --- */}
        <div className="p-6 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <Database className="text-blue-600" size={28} strokeWidth={2.5} />
            <div>
              <h3 className="text-[20px] font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Edit Device Details</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mt-1.5 italic">Modern Enterprises</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-300 active:scale-90 transition-all">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 BODY --- */}
        <div className="p-6 sm:p-10 space-y-8 text-left pb-32">
          
          {/* Identity Section */}
          <div className="space-y-6">
             <div className="space-y-2">
               <label className="flex items-center gap-2 text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest leading-none">
                 <Hash size={12} className="text-blue-500" /> Device SN
               </label>
               <div className="w-full p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[25px] font-mono font-black text-slate-500 text-sm shadow-inner text-center">
                 {device.device_sn}
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest leading-none">🏷️ Model No.</label>
                  <input value={device.model} onChange={e => setDevice({...device, model: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-[20px] font-bold text-sm outline-none focus:border-blue-500" placeholder="DS-XXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest leading-none">🏢 Site Name</label>
                  <input value={device.site_name} onChange={e => setDevice({...device, site_name: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-[20px] font-bold text-sm outline-none focus:border-blue-500" placeholder="Modern Towers" />
                </div>
             </div>
          </div>

          {/* 🛡️ SECURITY ACCESS (Instruction: Light Card with Emoji) */}
          <div className="bg-blue-50/50 p-6 rounded-[40px] border border-blue-100/50 space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <label className="text-[11px] font-[1000] uppercase text-blue-600 flex items-center gap-2 tracking-widest leading-none">
                🔐 Access Credentials
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="bg-white p-2.5 rounded-xl text-blue-500 shadow-sm border border-blue-100 active:scale-95">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest leading-none">👤 User ID</label>
                  <input value={device.user_name} onChange={e => setDevice({...device, user_name: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-bold text-sm text-slate-700 outline-none focus:border-blue-300 shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest leading-none">🛡️ Admin ID</label>
                  <input value={device.admin_name} onChange={e => setDevice({...device, admin_name: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-bold text-sm text-slate-700 outline-none focus:border-blue-300 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest leading-none">🔑 User Pass</label>
                  <input type={showPass ? "text" : "password"} value={device.user_pass} onChange={e => setDevice({...device, user_pass: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-bold text-sm text-slate-700 outline-none focus:border-blue-300 shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest leading-none">🔒 Admin Pass</label>
                  <input type={showPass ? "text" : "password"} value={device.admin_pass} onChange={e => setDevice({...device, admin_pass: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-bold text-sm text-slate-700 outline-none focus:border-blue-300 shadow-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest leading-none">📡 V-Code / P2P Key</label>
                <input type={showPass ? "text" : "password"} value={device.v_code} onChange={e => setDevice({...device, v_code: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-bold text-sm text-slate-700 outline-none focus:border-blue-300 shadow-sm" placeholder="Verification Code" />
              </div>
            </div>
          </div>

          {/* GPS Section */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-2">
              <label className="text-[11px] font-[1000] uppercase text-slate-400 flex items-center gap-2 tracking-widest leading-none">
                📍 GPS Geofence
              </label>
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[10px] font-black bg-slate-900 text-white px-4 py-2.5 rounded-xl active:scale-95 flex items-center gap-2 shadow-lg">
                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} SYNC GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
               {[
                 { label: 'Latitude', key: 'latitude' },
                 { label: 'Longitude', key: 'longitude' },
                 { label: 'Rad(m)', key: 'radius', c: 'text-blue-600 bg-blue-100/50' }
               ].map((item) => (
                 <div key={item.key} className={`p-4 rounded-[22px] border border-slate-100 shadow-inner ${item.c || 'bg-slate-50 text-slate-700'}`}>
                   <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">{item.label}</label>
                   <input value={device[item.key]} onChange={e => setDevice({...device, [item.key]: e.target.value})} className="w-full bg-transparent text-center font-[1000] text-xs outline-none" />
                 </div>
               ))}
            </div>
          </div>

          {/* 🛠️ ACTION BUTTONS (Instruction: Size chota kare, names user-friendly) */}
          <div className="pt-10 flex flex-col gap-4 pb-20">
            <button 
              onClick={onUpdate}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-[1000] uppercase text-[13px] tracking-[3px] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all border-b-4 border-blue-900"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18}/>} 
              {isSaving ? "SYCHRONIZING..." : "Save Terminal Data"}
            </button>
            <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-400 rounded-[22px] font-black uppercase text-[11px] tracking-[2px] active:scale-95">
              Discard Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}