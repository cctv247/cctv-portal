"use client";
import React, { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, Cpu 
} from "lucide-react";

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

  // 🛡️ BROWSER BAR SYNC: Body ko fix karke browser ko modal scroll pe force karein
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
    };
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleChange = (key: keyof DeviceData, value: string) => {
    if (typeof setDevice === "function") {
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
          longitude: pos.coords.longitude.toFixed(6),
        });
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-md flex items-start justify-center overflow-hidden">
      
      {/* 📱 FULL SCREEN WRAPPER: dvh is key for mobile bars */}
      <div className="bg-white w-full max-w-2xl h-[100dvh] sm:h-[92vh] sm:mt-6 sm:rounded-[45px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden relative">
        
        {/* --- 🏗️ HEADER (Fixed at top of modal) --- */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100 shrink-0 bg-white z-20">
          <div className="flex items-center gap-4 text-left">
            <div className="text-blue-600">
               <Database size={30} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[20px] font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Terminal Config</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mt-2 leading-none italic uppercase">Modern Admin Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all border border-slate-100">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 SCROLLABLE CONTENT (THIS TRIGGERS HIDING BARS) --- */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-8 pt-8 pb-40 text-left overscroll-contain touch-pan-y custom-scroll">
          
          {/* Internal spacer to force browser to recognize "Scrollable" area */}
          <div className="min-h-[101%]"> 
            
            {/* Identity Section */}
            <div className="space-y-3 mb-8">
               <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest leading-none">
                 <Hash size={14} className="text-blue-500" /> Serial Number
               </label>
               <div className="w-full p-6 bg-slate-50 border border-slate-200 border-dashed rounded-[25px] font-mono font-black text-slate-500 text-sm break-all text-center shadow-inner">
                 {device.device_sn}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <InputField label="Site Name" icon={<Monitor size={12}/>} value={device.site_name} onChange={(v: string) => handleChange('site_name', v)} />
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest leading-none uppercase">Category</label>
                <select 
                  value={device.category} 
                  onChange={e => handleChange('category', e.target.value)} 
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none"
                >
                  <option value="DVR (Analog)">📹 DVR (Analog)</option>
                  <option value="NVR (IP)">🖥️ NVR (IP)</option>
                  <option value="IP Camera">👁️ IP Camera</option>
                  <option value="Biometric">☝️ Biometric</option>
                </select>
              </div>
              <InputField label="Model Number" icon={<Cpu size={12}/>} value={device.model} onChange={(v: string) => handleChange('model', v)} />
              <InputField label="Network IP / URL" icon={<Monitor size={12}/>} value={device.ip_address} onChange={(v: string) => handleChange('ip_address', v)} />
            </div>

            {/* --- 🔐 SECURITY KEYS (Light Sky Blue) --- */}
            <div className="bg-blue-50/60 p-7 rounded-[40px] border border-blue-100 space-y-6 mb-8">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase text-blue-600 flex items-center gap-2 tracking-widest leading-none uppercase">
                  <ShieldCheck size={18} strokeWidth={2.5} /> Security Keys
                </label>
                <button type="button" onClick={() => setShowPass(!showPass)} className="p-2.5 bg-white rounded-xl text-blue-500 shadow-sm border border-blue-100 active:scale-95 transition-all">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="User Name" value={device.user_name} onChange={(v: string) => handleChange('user_name', v)} light />
                <InputField label="User Password" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v: string) => handleChange('user_pass', v)} light />
                <InputField label="Admin Name" value={device.admin_name} onChange={(v: string) => handleChange('admin_name', v)} light />
                <InputField label="Admin Password" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v: string) => handleChange('admin_pass', v)} light />
              </div>
              <InputField label="V-Code" type={showPass ? "text" : "password"} value={device.v_code} onChange={(v: string) => handleChange('v_code', v)} light />
            </div>

            {/* GPS Section */}
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest leading-none uppercase">
                  <MapPin size={16} className="text-red-500" /> GPS Geofencing
                </label>
                <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[10px] font-black bg-slate-900 text-white px-5 py-3 rounded-2xl active:scale-95 flex items-center gap-2 shadow-lg transition-all">
                  {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} SYNC GPS
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {['latitude', 'longitude', 'radius'].map((key) => (
                   <div key={key} className="p-4 rounded-[22px] bg-slate-50 border border-slate-100 shadow-inner">
                     <label className="text-[8px] font-black uppercase text-slate-400 text-center block mb-1 uppercase leading-none">{key.slice(0,3)}</label>
                     <input 
                      value={device[key as keyof DeviceData]} 
                      onChange={e => handleChange(key as keyof DeviceData, e.target.value)} 
                      className="w-full bg-transparent text-center font-[1000] text-xs text-slate-800 outline-none" 
                     />
                   </div>
                 ))}
              </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-4 mb-12">
              <label className="text-[11px] font-black uppercase text-slate-400 ml-5 tracking-widest flex items-center gap-2 leading-none uppercase">
                <Info size={18} className="text-slate-300" /> Site Notes
              </label>
              <textarea 
                rows={4} 
                value={device.device_notes} 
                onChange={e => handleChange('device_notes', e.target.value)} 
                className="w-full p-6 bg-slate-50/50 border border-slate-100 rounded-[35px] font-bold text-sm outline-none focus:border-blue-400 shadow-inner resize-none transition-all" 
                placeholder="Hardware maintenance specifics..." 
              />
            </div>

            {/* --- 💾 ACTION BUTTONS (Natural flow - end of scroll) --- */}
            <div className="flex flex-col gap-4 pb-32">
              <button 
                onClick={onUpdate}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-6 rounded-[28px] font-[1000] uppercase text-[15px] tracking-[4px] shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 transition-all border-b-8 border-blue-900"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} 
                {isSaving ? "Syncing Configuration..." : "Sync Master Data"}
              </button>
              <button onClick={onClose} className="w-full py-5 bg-slate-100 text-slate-400 rounded-[28px] font-black uppercase text-[12px] tracking-[2px] active:scale-95 transition-all">
                Discard Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// 🧰 Sub-Component: InputField (TypeScript Clean)
interface InputFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  light?: boolean;
}

function InputField({ label, icon, value, onChange, type = "text", light = false }: InputFieldProps) {
  return (
    <div className="space-y-2.5 text-left">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-1 leading-none uppercase">
        {icon}{label}
      </label>
      <input 
        type={type}
        value={value || ""} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        className={`w-full p-4 border-2 rounded-[22px] font-bold text-sm outline-none transition-all ${
          light ? 'bg-white border-transparent focus:border-blue-300' : 'bg-white border-slate-100 focus:border-blue-500'
        }`} 
      />
    </div>
  );
}