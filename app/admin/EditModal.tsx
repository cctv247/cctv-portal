"use client";
import React, { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, Cpu, User, Lock
} from "lucide-react";

// --- TYPES ---
interface DeviceData {
  device_sn: string;
  site_name: string;
  category: string;
  model: string;
  ip_address: string;
  user_name: string;
  user_pass: string;
  admin_name: string;
  admin_pass: string;
  v_code: string;
  latitude: string | number;
  longitude: string | number;
  radius: string | number;
  device_notes: string;
  [key: string]: any;
}

interface EditModalProps {
  isOpen: boolean;
  device: DeviceData | null;
  onClose: () => void;
  onUpdate: () => void;
  isSaving: boolean;
  setDevice: (device: DeviceData) => void;
}

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: EditModalProps) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 🛡️ VIEWPORT & SCROLL LOCK (Professional App-Shell Logic)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleChange = (key: keyof DeviceData, value: string) => {
    setDevice({ ...device, [key]: value });
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
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      
      {/* 📱 FULL VIEWPORT WRAPPER (100dvh for mobile bars handling) */}
      <div className="bg-[#f8fafc] w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden relative">
        
        {/* --- 🏗️ HEADER (Sticky & Branding) --- */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 italic">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100 text-white">
               <Database size={24} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Edit Master</h3>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 leading-none">Configuration Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90 border border-slate-200 transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 SCROLLABLE BODY (Independent Scroll) --- */}
        <div className="flex-1 overflow-y-auto px-6 space-y-8 pt-8 pb-32 overscroll-contain custom-scroll text-left">
          
          {/* Identity Section */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-[3px]">
               <Hash size={14} className="text-blue-500" /> Device Serial
             </label>
             <div className="p-6 bg-white border-2 border-slate-100 border-dashed rounded-[30px] font-mono font-black text-slate-500 text-sm text-center shadow-sm uppercase">
               {device.device_sn}
             </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="Site Name" icon={<Monitor size={14}/>} value={device.site_name} onChange={(v) => handleChange('site_name', v)} />
            
            <div className="space-y-2">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-3 tracking-widest">Category</label>
              <select 
                value={device.category} 
                onChange={e => handleChange('category', e.target.value)} 
                className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-black text-sm outline-none appearance-none cursor-pointer focus:border-blue-500 shadow-sm transition-all"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>

            <InputField label="Model" icon={<Cpu size={14}/>} value={device.model} onChange={(v) => handleChange('model', v)} />
            <InputField label="Network IP" icon={<Monitor size={14}/>} value={device.ip_address} onChange={(v) => handleChange('ip_address', v)} />
          </div>

          {/* SECURITY CARD */}
          <div className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10 px-1">
              <label className="text-[11px] font-[1000] uppercase text-slate-900 flex items-center gap-2 tracking-widest leading-none">
                <ShieldCheck size={18} className="text-blue-600" /> Security Keys
              </label>
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="p-2.5 bg-slate-50 rounded-xl text-slate-400 border border-slate-200 active:scale-95 transition-all"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <InputField label="User" value={device.user_name} onChange={(v) => handleChange('user_name', v)} light />
              <InputField label="Pass" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v) => handleChange('user_pass', v)} light />
              <InputField label="Admin" value={device.admin_name} onChange={(v) => handleChange('admin_name', v)} light />
              <InputField label="Admin Pass" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v) => handleChange('admin_pass', v)} light />
            </div>
            <InputField label="V-Code" value={device.v_code} onChange={(v) => handleChange('v_code', v)} light />
          </div>

          {/* GPS CARD */}
          <div className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-xl space-y-5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-[1000] uppercase text-slate-900 flex items-center gap-2 tracking-widest">
                <MapPin size={18} className="text-red-500" /> Geofencing
              </label>
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={isLocating} 
                className="text-[9px] font-black bg-slate-900 text-white px-5 py-3 rounded-full active:scale-95 flex items-center gap-2 shadow-lg transition-all"
              >
                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} SYNC
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {['latitude', 'longitude', 'radius'].map((key) => (
                 <div key={key} className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 shadow-inner text-center">
                   <label className="text-[8px] font-black uppercase text-slate-400 block mb-1 leading-none">{key.slice(0,3)}</label>
                   <input 
                     value={device[key]} 
                     onChange={e => handleChange(key, e.target.value)} 
                     className="w-full bg-transparent text-center font-mono font-black text-[11px] text-slate-800 outline-none" 
                   />
                 </div>
               ))}
            </div>
          </div>

          {/* NOTES */}
          <div className="space-y-3">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
              <Info size={16} className="text-slate-300" /> Technical Notes
            </label>
            <textarea 
              rows={3} 
              value={device.device_notes} 
              onChange={e => handleChange('device_notes', e.target.value)} 
              className="w-full p-6 bg-white border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none focus:border-blue-500 shadow-sm resize-none transition-all" 
              placeholder="Important hardware remarks..." 
            />
          </div>

          {/* 💾 ACTION FOOTER (Thumb Friendly) */}
          <div className="flex flex-col gap-3 pb-20">
            <button 
              onClick={onUpdate} 
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-[1000] uppercase text-sm tracking-[3px] shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all border-b-4 border-blue-800"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {isSaving ? "Syncing Configuration..." : "Sync Master Data"}
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🧰 Input Field Sub-Component (Strongly Typed)
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  type?: string;
  light?: boolean;
}

function InputField({ label, icon, value, onChange, type = "text", light = false }: InputFieldProps) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-3 tracking-widest flex items-center gap-1 leading-none">
        {icon}{label}
      </label>
      <input 
        type={type} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-5 border-2 rounded-[25px] font-black text-sm outline-none transition-all ${
          light ? 'bg-slate-50 border-transparent focus:border-blue-200 shadow-inner' : 'bg-white border-slate-100 focus:border-blue-500 shadow-sm'
        }`} 
      />
    </div>
  );
}