"use client";
import { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, User, Lock, Cpu
} from "lucide-react";

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: any) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen || !device) return null;

  // 🛠️ Device Update Handler
  const handleChange = (key: string, value: string) => {
    if (typeof setDevice === 'function') {
      setDevice({ ...device, [key]: value });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDevice({
          ...device,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        });
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center animate-in fade-in duration-300 overflow-hidden">
      
      {/* 📱 Full Screen Container: Optimized for Browser Bar Auto-Hide */}
      <div className="bg-white w-full max-w-2xl h-full sm:h-[92vh] sm:mt-6 sm:rounded-[45px] shadow-2xl flex flex-col overflow-y-auto custom-scroll animate-in slide-in-from-bottom-10 duration-500">
        
        {/* --- 🏗️ HEADER (Icon Background Removed) --- */}
        <div className="p-6 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-blue-600">
               <Database size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[20px] font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Terminal Config</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mt-1.5">Modern Admin Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-300 active:scale-90 transition-all border border-slate-100">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 BODY --- */}
        <div className="p-6 sm:p-10 space-y-8 text-left pb-32">
          
          {/* Identity Section */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest">
               <Hash size={14} className="text-blue-500" /> Serial Number
             </label>
             <div className="w-full p-5 bg-slate-50 border border-slate-200 border-dashed rounded-[22px] font-mono font-black text-slate-500 text-sm break-all text-center">
               {device.device_sn}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="🏢 Site Name" icon={<Monitor size={14}/>} value={device.site_name} onChange={(v) => handleChange('site_name', v)} />
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase text-slate-400 ml-2 tracking-widest">📁 Category</label>
              <select value={device.category} onChange={e => handleChange('category', e.target.value)} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none">
                <option value="DVR (Analog)">📹 DVR</option>
                <option value="NVR (IP)">🖥️ NVR</option>
                <option value="IP Camera">👁️ IP Cam</option>
                <option value="Biometric">☝️ Bio</option>
              </select>
            </div>
            <InputField label="🏷️ Model Number" icon={<Cpu size={14}/>} value={device.model} onChange={(v) => handleChange('model', v)} />
            <InputField label="🌐 Static IP / URL" icon={<Monitor size={14}/>} value={device.ip_address} onChange={(v) => handleChange('ip_address', v)} />
          </div>

          {/* --- 🔐 ACCESS CREDENTIALS (New Light Blue Theme) --- */}
          <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100 space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <label className="text-[11px] font-black uppercase text-blue-600 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={18} strokeWidth={2.5} /> Security Keys
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="p-2.5 bg-white rounded-xl text-blue-500 shadow-sm border border-blue-100 active:scale-95">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <InputField label="👤 User Name" value={device.user_name} onChange={(v) => handleChange('user_name', v)} light />
              <InputField label="🔑 User Pass" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v) => handleChange('user_pass', v)} light />
              <InputField label="🛡️ Admin Name" value={device.admin_name} onChange={(v) => handleChange('admin_name', v)} light />
              <InputField label="🔒 Admin Pass" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v) => handleChange('admin_pass', v)} light />
            </div>

            <InputField label="🔐 Verification Code (V-Code)" type={showPass ? "text" : "password"} value={device.v_code} onChange={(v) => handleChange('v_code', v)} light />
          </div>

          {/* GPS Section */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-2">
              <label className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <MapPin size={16} className="text-red-500" /> GPS Geofencing
              </label>
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[10px] font-black bg-slate-900 text-white px-5 py-2.5 rounded-xl active:scale-95 flex items-center gap-2 transition-all shadow-lg">
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} SYNC GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {['latitude', 'longitude', 'radius'].map((key) => (
                 <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                   <label className="text-[8px] font-black uppercase text-slate-400 text-center block mb-1">{key.slice(0,3)}</label>
                   <input value={device[key]} onChange={e => handleChange(key, e.target.value)} className="w-full bg-transparent text-center font-bold text-xs outline-none" />
                 </div>
               ))}
            </div>
          </div>

          {/* Maintenance Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 leading-none">
              <Info size={16} className="text-slate-300" /> Maintenance Remarks
            </label>
            <textarea rows={3} value={device.device_notes} onChange={e => handleChange('device_notes', e.target.value)} className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-[25px] font-bold text-sm outline-none focus:border-blue-400 shadow-inner resize-none" placeholder="Enter hardware specific notes..." />
          </div>

          {/* --- 💾 ACTION BUTTONS (Optimized Size) --- */}
          <div className="pt-6 flex flex-col gap-3 pb-20">
            <button 
              onClick={onUpdate}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black uppercase text-[14px] tracking-[2px] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18}/>} 
              {isSaving ? "Syncing..." : "Sync Master Data"}
            </button>
            <button onClick={onClose} className="w-full py-4 text-slate-400 font-black uppercase text-[11px] tracking-[2px] active:scale-95 transition-all">
              Discard Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// 🧰 Reusable Sub-Component
function InputField({ label, icon, value, onChange, type = "text", light = false }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-1">
        {icon}{label}
      </label>
      <input 
        type={type}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={`w-full p-4 border-2 rounded-2xl font-bold text-sm outline-none transition-all ${light ? 'bg-white border-transparent focus:border-blue-300' : 'bg-white border-slate-100 focus:border-blue-500'}`} 
      />
    </div>
  );
}