"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, CheckCircle, Rocket, Loader2, Database, ShieldCheck, Disc } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sn: '', site_name: '', category: 'DVR (Analog)',
    model: '', ip_address: '', user_pass: '',
    admin_pass: '', v_code: '', device_notes: '',
    radius: '200' // Default string value for input
  });

  const handleSave = async () => {
    if (!formData.sn || !formData.site_name) return alert("⚠️ Please fill SN and Site Name!");
    
    setLoading(true);
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      // Sirf device ki location save karne ke liye GPS fetch kar rahe hain
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { 
          enableHighAccuracy: true, 
          timeout: 8000 
        })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (e) { 
      console.warn("GPS Denied - Saving without coordinates"); 
    }

    // Database mein insertion
    const { error } = await supabase.from('devices').insert([
      { 
        ...formData, 
        radius: parseInt(formData.radius) || 200, // Number mein convert karke save
        latitude: lat, 
        longitude: lng 
      }
    ]);

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert("✅ Device Saved Successfully!");
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-[50px] p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] border border-white relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-emerald-50 p-5 rounded-[25px] mb-3">
             <Rocket className="text-emerald-600" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-[26px] font-[1000] text-slate-800 tracking-tight leading-none uppercase">Register New Device</h1>
        </div>

        {/* Scrollable Form */}
        <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-3 custom-scroll mb-8">
          
          <InputField label="🔢 SERIAL NUMBER (SN)" placeholder="Ex: SN9922X..." 
            onChange={(v) => setFormData({...formData, sn: v.toUpperCase()})} highlight={true} />
          
          <InputField label="🏢 SITE / CUSTOMER NAME" placeholder="Ex: Sharma Villa" 
            onChange={(v) => setFormData({...formData, site_name: v})} />

          <div className="grid grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">📁 Category</label>
              <select 
                className="w-full p-5 mt-2 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-bold text-slate-700 appearance-none cursor-pointer focus:border-emerald-200"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="DVR (Analog)">📟 DVR</option>
                <option value="NVR (IP System)">🖥️ NVR</option>
                <option value="IP Camera">👁️ IP Cam</option>
                <option value="Biometric">☝️ Bio</option>
              </select>
            </div>

            {/* RADIUS INPUT FIELD - NEW ADDITION */}
            <div className="text-left">
              <label className="text-[10px] font-black text-blue-400 uppercase ml-4 tracking-widest flex items-center gap-1">
                <Disc size={12} /> Radius (M)
              </label>
              <input 
                type="number"
                value={formData.radius}
                className="w-full p-5 mt-2 bg-blue-50/30 border-2 border-blue-50 rounded-[25px] outline-none text-[15px] font-black text-blue-600 focus:border-blue-200 text-center"
                placeholder="200"
                onChange={(e) => setFormData({...formData, radius: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="🏷️ MODEL" placeholder="DS-7A08..." onChange={(v) => setFormData({...formData, model: v})} />
            <InputField label="🌐 IP ADDRESS" placeholder="192.168.1..." onChange={(v) => setFormData({...formData, ip_address: v})} />
          </div>

          <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="👤 USER" placeholder="Admin" onChange={(v) => setFormData({...formData, user_pass: v})} />
              <InputField label="🔑 PASS" placeholder="****" onChange={(v) => setFormData({...formData, admin_pass: v})} />
            </div>
            <InputField label="🔐 V-CODE" placeholder="P2P Verification" onChange={(v) => setFormData({...formData, v_code: v})} />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">📝 TECHNICAL NOTES</label>
            <textarea 
              className="w-full p-5 mt-2 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-semibold min-h-[90px]"
              placeholder="Notes..."
              onChange={(e) => setFormData({...formData, device_notes: e.target.value})}
            />
          </div>

          {/* GPS Pin Status Info */}
          <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 p-5 rounded-[30px] flex items-center gap-4">
            <MapPin size={20} className="text-emerald-600" />
            <div className="text-left">
              <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Auto Geo-Tagging</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase">Current location will be saved as device origin.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#1a9e52] hover:bg-emerald-700 text-white font-black py-6 rounded-[30px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50 text-[18px] uppercase tracking-widest"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} strokeWidth={3} />} 
          {loading ? 'Processing...' : 'Save to Cloud'}
        </button>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </div>
  );
}

function InputField({ label, placeholder, onChange, highlight = false }: any) {
  return (
    <div className="w-full text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none">{label}</label>
      <input 
        className={`w-full p-5 mt-2 bg-[#f8fafc] border-2 rounded-[25px] outline-none text-[15px] font-bold text-slate-700 transition-all
          ${highlight ? 'border-emerald-100 focus:border-emerald-400' : 'border-slate-50 focus:border-emerald-200'}
        `}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}