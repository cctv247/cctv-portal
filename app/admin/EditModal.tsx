"use client";

// app/admin/EditModal.tsx
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { COMPANY } from "@/lib/config";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Cpu, Hash, Layers, Target, KeyRound, Globe, Settings,
  Camera, HardDrive, Zap, Calendar
} from "lucide-react";

// 🚩 Zaroori: Map dynamic import
const MapPicker = dynamic(() => import("@/lib/components/MapPicker"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full animate-pulse flex-col items-center justify-center gap-3 rounded-[35px] border-2 border-dashed border-slate-200 bg-slate-50">
      <Loader2 className="animate-spin text-blue-500" size={30} />
      <p className="font-black tracking-widest text-[10px] text-slate-400 uppercase">Waking up Satellites...</p>
    </div>
  )
});

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
  camera_count?: number;
  device_count?: number;
  power_count?: number;
  is_reseller?: boolean;
  last_maintenance?: string;
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

  // 🛡️ MODAL LOCK & VIEWPORT SYNC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const setHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      window.addEventListener('resize', setHeight);
      setHeight();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleChange = (key: keyof DeviceData, value: any) => {
    if (typeof setDevice === "function") setDevice({ ...device, [key]: value });
  };

  // 🔄 RESELLER TOGGLE WITH AUTO LAST_MAINTENANCE CURRENT DATE LOGIC
  const handleToggleReseller = () => {
    const isCurrentlyInactive = !device.is_reseller;

    if (isCurrentlyInactive) {
      const todayDate = new Date().toISOString().split("T")[0];
      setDevice({
        ...device,
        is_reseller: true,
        last_maintenance: device.last_maintenance || todayDate
      });
    } else {
      setDevice({
        ...device,
        is_reseller: false
      });
    }
  };

  // 🚀 MASTER GPS UPDATE LOGIC
  const handleGetLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude.toFixed(8);
        const newLng = pos.coords.longitude.toFixed(8);
        
        setDevice({ 
          ...device, 
          latitude: newLat, 
          longitude: newLng 
        });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-[999] flex items-stretch justify-center bg-slate-900/60 p-0 backdrop-blur-md duration-300 sm:items-center">
      
      <div 
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        className="animate-in slide-in-from-bottom relative flex w-full max-w-xl flex-col overflow-hidden bg-[#fcfdfe] shadow-2xl duration-500 sm:h-auto sm:max-h-[95vh] sm:rounded-[45px]" >
        
        {/* 🏗️ STICKY HEADER */}
        <div className="sticky top-0 z-[110] flex shrink-0 items-center justify-between border-b border-slate-50 bg-white/95 p-6 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-left italic">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-lg leading-none font-[1000] tracking-tighter text-slate-900 uppercase italic">Edit Device Details</h3>
              <p className="mt-1 leading-none font-black tracking-[3px] text-[9px] text-blue-500 uppercase italic">{COMPANY?.name || "Modern Enterprises"}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200/50 bg-slate-100 p-2.5 text-slate-400 transition-all active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 📝 SCROLLABLE BODY */}
        <div className="custom-scroll flex-1 space-y-8 overflow-y-auto overscroll-contain bg-[#fcfdfe] px-6 pt-6 pb-44 text-left sm:px-10">
          
          {/* Identity Identifier */}
          <div className="space-y-2">
            <label className="ml-4 flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
              <Hash size={12} className="text-blue-500" /> Device SN
            </label>
            <div className="rounded-[22px] border-2 border-dashed border-slate-100 bg-slate-50 p-4 text-left font-mono font-black break-all text-slate-500 text-[11px] italic shadow-inner select-all">
              {device.device_sn}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputField label="Site Name" icon="🏢" value={device.site_name} onChange={(v:any) => handleChange('site_name', v)} />
            
            <div className="space-y-1.5 text-left">
              <label className="ml-4 flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
                <Layers size={12} className="text-blue-500"/> Category
              </label>
              <select 
                value={device.category} 
                onChange={e => handleChange('category', e.target.value)} 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black italic text-slate-800 text-[12px] outline-none appearance-none focus:border-blue-500 shadow-sm transition-all"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>

            <InputField label="Model No." icon={<Settings size={16} />} value={device.model} onChange={(v:any) => handleChange('model', v)} />
            <InputField label="Network IP" icon={<Globe size={16} />} value={device.ip_address} onChange={(v:any) => handleChange('ip_address', v)} />
          </div>

          {/* 🆕 HARDWARE TRACKING METRICS BLOCK */}
          <div className="space-y-4 rounded-[40px] border border-slate-100 bg-white p-6 shadow-xl">
            <p className="flex items-center gap-2 font-black tracking-widest text-[10px] text-blue-600 uppercase italic">
              <HardDrive size={16} className="text-blue-500"/> Hardware Inventory Metrics
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="ml-2 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase">
                  <Camera size={11} className="text-emerald-500"/> Cameras
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={device.camera_count ?? 0} 
                  onChange={(e) => handleChange('camera_count', Number(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center font-black text-slate-800 text-sm outline-none focus:border-blue-400 shadow-inner"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="ml-2 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase">
                  <HardDrive size={11} className="text-blue-500"/> Recorders
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={device.device_count ?? 1} 
                  onChange={(e) => handleChange('device_count', Number(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center font-black text-slate-800 text-sm outline-none focus:border-blue-400 shadow-inner"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="ml-2 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase">
                  <Zap size={11} className="text-amber-500"/> Power Supply
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={device.power_count ?? 1} 
                  onChange={(e) => handleChange('power_count', Number(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center font-black text-slate-800 text-sm outline-none focus:border-blue-400 shadow-inner"
                />
              </div>
            </div>

            {/* ℹ️ RESELLER TOGGLE WITH INTERACTIVE TOOLTIP */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0 text-purple-600" />
                <span className="font-black text-[10px] text-slate-700 uppercase italic">
                  Reseller Maintenance Contract
                </span>
                
                {/* Floating Info Tooltip */}
                <div className="group relative flex cursor-pointer items-center">
                  <Info size={13} className="text-slate-400 transition-colors group-hover:text-blue-600" />
                  
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-[150] mb-2 w-64 -translate-x-1/2 rounded-2xl bg-slate-900 p-3 text-left text-white opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
                    <p className="font-black tracking-wider text-[9px] text-blue-400 uppercase">
                      Contract Status Guide
                    </p>
                    <p className="mt-1 leading-tight font-medium text-[8pt] text-slate-300">
                      <strong className="text-emerald-400">Yes (Active):</strong> Third-party reseller/dealer AMC. Isko enable karte hi maintenance date aaj ki set ho jayegi.<br/>
                      <strong className="mt-1 block text-amber-400">No (Direct):</strong> Non-AMC site. Client direct support aur on-demand charges par rahega.
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleToggleReseller}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                  device.is_reseller !== false 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-300'
                }`}
              >
                {device.is_reseller !== false ? "Yes (Active)" : "No (Direct)"}
              </button>
            </div>

            {/* 📅 LAST MAINTENANCE DATE EDIT FIELD WITH TOOLTIP */}
            <div className="flex flex-col gap-2 rounded-2xl border border-blue-100/60 bg-blue-50/30 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="flex items-center gap-1.5 font-black text-[9px] text-blue-900 uppercase italic">
                    <Calendar size={13} className="text-blue-600" /> AMC Start Date
                  </label>
                  
                  {/* ℹ️ Floating Info Tooltip for AMC Start Date, 365-Day Validity & Set Today */}
                  <div className="group relative flex cursor-pointer items-center">
                    <Info size={12} className="text-slate-400 transition-colors group-hover:text-blue-600" />
                    
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-[150] mb-2 w-72 -translate-x-1/2 rounded-2xl bg-slate-900 p-3.5 text-left text-white opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
                      <p className="font-black tracking-wider text-[9px] text-blue-400 uppercase">
                        AMC Start &amp; 365-Day Expiry Guide
                      </p>
                      <p className="mt-1 leading-tight font-medium text-[8pt] text-slate-300">
                        <strong className="text-blue-300">AMC Start Date:</strong> Contract start date. Agar yeh date <strong className="text-amber-400">365 din se purani</strong> ho gayi toh system portal par automatically <strong className="text-red-400">Non-AMC (Expired)</strong> status show karega.<br/>
                        <strong className="mt-1.5 block text-emerald-400">Set Today:</strong> Naye saal ke AMC renewal par date ko aaj ki date par reset karne ke liye.
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleChange('last_maintenance', new Date().toISOString().split("T")[0])}
                  className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Set Today
                </button>
              </div>
              <input
                type="date"
                value={device.last_maintenance ? device.last_maintenance.split("T")[0] : ""}
                onChange={(e) => handleChange('last_maintenance', e.target.value)}
                className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-slate-800 text-[11px] outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* 🔐 SECURITY VAULT */}
          <div className="space-y-5 rounded-[40px] border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-2 font-[1000] tracking-widest text-[10px] text-blue-600 uppercase italic">
                <ShieldCheck size={18}/> Access Credentials
              </span>
              <button onClick={() => setShowPass(!showPass)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="User ID" icon="👤" value={device.user_name} onChange={(v:any) => handleChange('user_name', v)} light />
              <InputField label="User Pass" icon="🔑" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v:any) => handleChange('user_pass', v)} light />
              <InputField label="Admin ID" icon="🛠️" value={device.admin_name} onChange={(v:any) => handleChange('admin_name', v)} light />
              <InputField label="Admin Pass" icon="🔒" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v:any) => handleChange('admin_pass', v)} light />
            </div>
            <InputField label="Verification Code (V-Code)" icon={<KeyRound size={16} className="text-orange-500" />} type={showPass ? "text" : "password"} value={device.v_code} onChange={(v:any) => handleChange('v_code', v)} light />
          </div>

          {/* 📍 GPS & SATELLITE SECTION */}
          <div className="relative space-y-5 overflow-hidden rounded-[40px] border border-slate-100 bg-white p-2 shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="flex items-center gap-2 font-[1000] tracking-[2px] text-[11px] text-red-600 uppercase italic">
                  <MapPin size={18} /> Satellite Geo-Tagging
                </span>
                <span className="ml-7 font-black tracking-widest text-[8px] text-slate-300 uppercase">20x High-Detail Zoom</span>
              </div>
              <button 
                onClick={handleGetLocation} 
                disabled={isLocating} 
                className="group flex items-center gap-2 rounded-2xl border-b-4 border-black bg-slate-900 px-5 py-3 text-white shadow-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                <span className="font-black tracking-widest text-[10px] uppercase italic">Update GPS</span>
              </button>
            </div>

            {/* 🗺️ MAP PICKER INTEGRATION */}
            <MapPicker 
              lat={parseFloat(device.latitude as string)} 
              lng={parseFloat(device.longitude as string)} 
              radius={parseInt(device.radius as string)} 
              onLocationChange={(lat: string, lng: string) => {
                setDevice({ ...device, latitude: lat, longitude: lng });
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Latitude" icon="📍" value={device.latitude} onChange={(v:any) => handleChange('latitude', v)} light />
              <InputField label="Longitude" icon="📍" value={device.longitude} onChange={(v:any) => handleChange('longitude', v)} light />
            </div>

            {/* 🎯 GEOFENCE RADIUS SECTION WITH HOVER TOOLTIP */}
            <div className="space-y-2 text-left">
              <div className="ml-4 flex items-center gap-2">
                <label className="flex items-center gap-1.5 font-black text-[9px] text-slate-400 uppercase italic">
                  <Target size={12} className="text-blue-500" /> Geofence Radius (Meters)
                </label>
                
                {/* Floating Info Tooltip */}
                <div className="group relative flex cursor-pointer items-center">
                  <Info size={12} className="text-slate-400 transition-colors group-hover:text-blue-600" />
                  
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-[150] mb-2 w-64 -translate-x-1/2 rounded-2xl bg-slate-900 p-3 text-left text-white opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
                    <p className="font-black tracking-wider text-[9px] text-blue-400 uppercase">
                      Geofence Radius Guide
                    </p>
                    <p className="mt-1 leading-tight font-medium text-[8pt] text-slate-300">
                      Site location se customer/technician ka max allowed distance (meters mein). Is daayre ke andar hone par hi QR scan aur Password Request accept hogi. Standard: <strong className="text-emerald-400">100m - 200m</strong>.
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="number" 
                  value={device.radius || "100"} 
                  onChange={e => handleChange('radius', e.target.value)} 
                  className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl font-black text-[13px] text-blue-900 outline-none pl-12 shadow-inner" 
                />
                <div className="absolute top-1/2 left-4 -translate-y-1/2 text-xs font-black text-blue-300 italic">M</div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2 pb-10 text-left">
            <label className="ml-4 flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
              <Info size={14} className="text-slate-300" /> Technical Remarks
            </label>
            <textarea 
              rows={4} value={device.device_notes || ""} onChange={e => handleChange('device_notes', e.target.value)} 
              className="w-full p-5 bg-white border border-slate-200 rounded-[30px] font-bold text-slate-700 outline-none text-[12px] focus:border-blue-500 transition-all resize-none shadow-inner" 
              placeholder="Enter site specific notes..."
            />
          </div>

          {/* 🏁 FOOTER ACTION */}
          <div className="pt-2 pb-20">
            <button 
              onClick={(e) => { e.preventDefault(); onUpdate(); }} 
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-5 rounded-[30px] font-[1000] uppercase text-[15px] tracking-[4px] flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all border-b-[6px] border-blue-900 italic cursor-pointer"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
              {isSaving ? "SYNCING CLOUD..." : "Update Device"}
            </button>
            <p className="mt-8 text-center leading-none font-[1000] tracking-tighter text-[22px] text-emerald-200 uppercase italic sm:text-[10px]">
              <span>
                {(COMPANY?.app?.name || "Cctv Portal").split(' ')[0]}
              </span>
              <span className="ml-1.5 text-blue-200 italic">
                {(COMPANY?.app?.name || "Cctv Portal").split(' ')[1] || ""}
              </span>
              <span className="ml-3 font-black tracking-[2px] text-blue-300/50 text-[14px] italic sm:text-[8px]">
                {COMPANY?.app?.version || "v2.0"}
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable Input Field
function InputField({ label, icon, value, onChange, type = "text", light = false }: any) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="ml-4 flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
        <span className="text-base opacity-70">{icon}</span> {label}
      </label>
      <input 
        type={type} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-4 border rounded-2xl font-black italic text-slate-800 text-[12px] outline-none transition-all shadow-sm ${
          light 
            ? 'bg-slate-50 border-transparent focus:border-blue-200 shadow-inner' 
            : 'bg-white border-slate-200 focus:border-blue-500 shadow-sm'
        }`} 
      />
    </div>
  );
}