"use client";
// app/add-device/page.tsx 
import AuthGuard from "@/lib/components/AuthGuard";
import { useState } from 'react';
import dynamic from "next/dynamic"; // 🚩 Map integration ke liye
import { COMPANY } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';
import { encryptData } from '@/lib/crypto';

import { 
  MapPin, Loader2, Database, Disc, Navigation, MousePointer2, 
  ShieldCheck, Hash, X, Monitor, Key, Lock, Fingerprint, User, 
  CircuitBoard, ClipboardEdit, Globe, Settings, Target, Camera,
  HardDrive, Zap, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterDialog from '@/lib/components/MasterDialog';

// 🚩 Dynamic Import for MapPicker (No SSR Error)
const MapPicker = dynamic(() => import("@/lib/components/MapPicker"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full animate-pulse items-center justify-center rounded-[35px] border-2 border-dashed border-slate-200 bg-slate-50">
      <p className="font-black tracking-widest text-[10px] text-slate-300 uppercase italic">Syncing Satellite Map...</p>
    </div>
  )
});

interface FormData {
  device_sn: string; site_name: string; category: string; model: string;
  ip_address: string; user_name: string; user_pass: string;
  admin_name: string; admin_pass: string; v_code: string;
  device_notes: string; radius: string; latitude: string; longitude: string;
  // 🆕 Hardware Metrics
  camera_count: number;
  device_count: number;
  power_count: number;
  is_reseller: boolean;
}

export default function AddDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  
  // 🔔 Master Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any, 
    onConfirm: () => setDialog(prev => ({...prev, isOpen: false}))
  });

  const [formData, setFormData] = useState<FormData>({
    device_sn: '', site_name: '', category: 'DVR (Analog)', model: '',
    ip_address: '', user_name: 'user', user_pass: '', 
    admin_name: 'admin', admin_pass: '', 
    v_code: '', device_notes: '', radius: '100', latitude: '19.1623522', longitude: '72.9335731',
    camera_count: 0,
    device_count: 1,
    power_count: 1,
    is_reseller: true
  });

  const handleSave = async () => {
    // 🚩 Validation Check
    if (!formData.device_sn || !formData.site_name) {
      setDialog({ 
        isOpen: true, title: "Missing Data", 
        message: "Serial Number aur Site Name daalna zaroori hai bhai!", 
        type: "warning", 
        onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
      });
      return;
    }
    
    setLoading(true);
    let finalLat = parseFloat(formData.latitude);
    let finalLng = parseFloat(formData.longitude);

    if (!isManual) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        console.warn("Auto GPS Timeout, using Picker/Manual coordinates.");
      }
    }

    try {
      // 🔒 Encryption & Insertion
      const { error } = await supabase.from('devices').insert([{ 
        ...formData,
        camera_count: Number(formData.camera_count) || 0,
        device_count: Number(formData.device_count) || 1,
        power_count: Number(formData.power_count) || 1,
        user_pass: formData.user_pass ? encryptData(formData.user_pass) : '',
        admin_pass: formData.admin_pass ? encryptData(formData.admin_pass) : '',
        v_code: formData.v_code ? encryptData(formData.v_code) : '',
        radius: parseInt(formData.radius) || 100,
        latitude: finalLat,
        longitude: finalLng 
      }]);

      if (error) throw error;

      setDialog({ 
        isOpen: true, title: "Registered!", 
        message: `${formData.site_name} successfully add ho gaya hai.`, 
        type: "success", 
        onConfirm: () => router.push('/admin') 
      });
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Database Error", message: err.message, type: "danger", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <div className="custom-scroll fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto bg-slate-900/60 p-0 backdrop-blur-md sm:items-center">
        
        <div className="animate-in slide-in-from-bottom relative flex min-h-screen w-full max-w-xl flex-col bg-white shadow-2xl duration-500 sm:h-auto sm:max-h-[95vh] sm:min-h-0 sm:rounded-[45px]">

          {/* 🏗️ STICKY HEADER */}
          <div className="sticky top-0 z-[110] flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-left italic">
              <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-xl shadow-blue-100">
                <CircuitBoard size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h3 className="text-lg leading-none font-[1000] tracking-tighter text-slate-900 uppercase italic">Register Device</h3>
                <p className="mt-1.5 leading-none font-black tracking-[3px] text-[9px] text-blue-500 uppercase italic">{COMPANY?.name || "Modern Enterprises"}</p>
              </div>
            </div>
            <button onClick={() => router.back()} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90 border border-slate-200/50 shadow-inner">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* 📝 FORM BODY */}
          <div className="flex-1 space-y-8 bg-white p-6 pb-28 text-left sm:p-10">
            
            <InputField label="Device Serial Number (SN)" placeholder="S0420250605CCWRGB..." value={formData.device_sn} icon={<Hash size={14}/>} onChange={(v: string) => setFormData({...formData, device_sn: v.toUpperCase()})} highlight={true} />
            
            <InputField label="Site / Client Name" placeholder="Ex: Shaikh Villa" value={formData.site_name} icon={<Database size={14}/>} onChange={(v: string) => setFormData({...formData, site_name: v})} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="ml-4 flex items-center gap-1.5 leading-none font-black tracking-widest text-[9px] text-slate-400 uppercase"><Monitor size={12}/> Category</label>
                <select className="w-full appearance-none rounded-[25px] border-2 border-slate-50 bg-slate-50 p-5 text-sm font-bold text-slate-700 shadow-sm transition-all outline-none focus:border-blue-400"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="DVR (Analog)">📹 DVR (Analog)</option>
                  <option value="NVR (IP System)">🖥️ NVR (IP)</option>
                  <option value="IP Camera">👁️ IP Camera</option>
                  <option value="Biometric">☝️ Biometric</option>
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="ml-4 flex items-center gap-1.5 leading-none font-black tracking-widest text-[9px] text-blue-400 uppercase"><Target size={12}/> Radius (M)</label>
                <input type="number" value={formData.radius} className="w-full rounded-[25px] border-2 border-blue-50 bg-blue-50/50 p-5 text-center font-black text-blue-600 shadow-sm transition-all outline-none focus:border-blue-400"
                  onChange={(e) => setFormData({...formData, radius: e.target.value})} />
              </div>
            </div>

            {/* 🆕 HARDWARE TRACKING METRICS BLOCK */}
            <div className="space-y-4 rounded-[35px] border border-slate-100 bg-slate-50 p-6">
              <p className="flex items-center gap-2 font-black tracking-widest text-[10px] text-slate-400 uppercase">
                <HardDrive size={14} className="text-blue-600"/> Hardware Inventory Metrics
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="ml-2 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase">
                    <Camera size={10} className="text-emerald-500"/> Cameras
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.camera_count} 
                    onChange={(e) => setFormData({...formData, camera_count: Number(e.target.value)})}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-center font-black text-slate-800 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="ml-2 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase">
                    <HardDrive size={10} className="text-blue-500"/> Recorders
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.device_count} 
                    onChange={(e) => setFormData({...formData, device_count: Number(e.target.value)})}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-center font-black text-slate-800 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="ml-2 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase">
                    <Zap size={10} className="text-amber-500"/> Power Supply
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.power_count} 
                    onChange={(e) => setFormData({...formData, power_count: Number(e.target.value)})}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-center font-black text-slate-800 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 pt-2">
                <span className="flex items-center gap-2 font-black text-[10px] text-slate-600 uppercase">
                  <ShieldCheck size={14} className="text-purple-600" /> Reseller Maintenance Contract
                </span>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, is_reseller: !formData.is_reseller})}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    formData.is_reseller ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {formData.is_reseller ? "Yes (Active)" : "No"}
                </button>
              </div>
            </div>

            {/* 📍 GPS CONTROLS WITH MAP INTEGRATION */}
            <div className="flex gap-2 rounded-[30px] border border-slate-100 bg-slate-50 p-2">
              <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Navigation size={14} /> Auto GPS</button>
              <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${isManual ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}><MapPin size={14} /> Manual Map</button>
            </div>

            {isManual && (
              <div className="animate-in fade-in zoom-in-95 space-y-4 duration-500">
                {/* 🚩 INTERACTIVE SATELLITE MAP */}
                <MapPicker 
                  lat={parseFloat(formData.latitude)} 
                  lng={parseFloat(formData.longitude)} 
                  radius={parseInt(formData.radius)} 
                  onLocationChange={(lat, lng) => setFormData({...formData, latitude: String(lat), longitude: String(lng)})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Latitude" icon={<Globe size={12}/>} value={formData.latitude} onChange={(v) => setFormData({...formData, latitude: v})} />
                  <InputField label="Longitude" icon={<Globe size={12}/>} value={formData.longitude} onChange={(v) => setFormData({...formData, longitude: v})} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Model No." placeholder="iDS-7104HQHI-M1/S" icon={<Settings size={12}/>} value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
              <InputField label="Static IP" placeholder="192.168.0.101" icon={<Navigation size={12}/>} value={formData.ip_address} onChange={(v: string) => setFormData({...formData, ip_address: v})} />
            </div>

            {/* Security Credentials Group */}
            <div className="space-y-6 rounded-[40px] border border-blue-100/50 bg-blue-50/30 p-6">
              <div className="flex items-center gap-2 px-2 leading-none font-black tracking-widest text-blue-600 text-[10px] uppercase italic"><ShieldCheck size={16} /> Security Credentials</div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="User ID" icon={<User size={12}/>} value={formData.user_name} onChange={(v: string) => setFormData({...formData, user_name: v})} />
                <InputField label="User Pass" icon={<Key size={12}/>} placeholder="****" value={formData.user_pass} onChange={(v: string) => setFormData({...formData, user_pass: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Admin ID" icon={<ShieldCheck size={12}/>} value={formData.admin_name} onChange={(v: string) => setFormData({...formData, admin_name: v})} />
                <InputField label="Admin Pass" icon={<Lock size={12}/>} placeholder="****" value={formData.admin_pass} onChange={(v: string) => setFormData({...formData, admin_pass: v})} />
              </div>
              <InputField label="P2P V-Code" icon={<Fingerprint size={12}/>} placeholder="Verification Code" value={formData.v_code} onChange={(v: string) => setFormData({...formData, v_code: v})} />
            </div>

            {/* Notes Section */}
            <div className="space-y-2 text-left">
              <label className="ml-6 flex items-center gap-1.5 font-black tracking-widest text-[9px] text-slate-400 uppercase"><ClipboardEdit size={12}/> Maintenance Notes</label>
              <textarea className="min-h-[120px] w-full resize-none rounded-[30px] border-2 border-slate-50 bg-slate-50 p-6 text-sm font-bold text-slate-700 shadow-inner transition-all outline-none focus:border-blue-400"
                placeholder="Hardware specifics..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
            </div>

            {/* Register Button */}
            <div className="pt-6">
              <button onClick={handleSave} disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-4 rounded-[30px] border-emerald-900 border-b-[6px] bg-[#1a9e52] py-6 font-[1000] tracking-[4px] text-white text-[16px] uppercase italic shadow-xl transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Database size={24} />} 
                {loading ? 'Processing...' : 'Register Device'}
              </button>
            </div>

            {/* 🏢 Branded Footer */}
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

      <MasterDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog(prev => ({...prev, isOpen: false}))} 
        onConfirm={dialog.onConfirm} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type} 
        confirmText="Understood" 
      />
    </AuthGuard>
  );
}

function InputField({ label, placeholder, onChange, value, highlight = false, icon }: {
  label: string; placeholder?: string; onChange: (v: string) => void; value: string; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-2 text-left font-bold">
      <label className="ml-4 flex items-center gap-1.5 leading-none font-black tracking-widest text-[9px] text-slate-400 uppercase">{icon}{label}</label>
      <input className={`w-full p-5 bg-slate-50 border-2 rounded-[25px] outline-none text-sm font-bold text-slate-700 transition-all shadow-sm ${highlight ? 'border-emerald-100 focus:border-emerald-400' : 'border-slate-50 focus:border-blue-400'}`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}