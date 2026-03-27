
// Service Report form
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { 
  ClipboardCheck, User, Wrench, CheckCircle2, 
  Calendar, Save, Loader2, ArrowLeft,
  AlertTriangle, MessageSquare, History
} from 'lucide-react';

export default function ServiceReportPage() {
  const params = useParams();
  const router = useRouter();
  const sn = params.sn as string;

  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    technician_name: '',
    work_done: '',
    service_type: 'Routine Service',
    status: 'Completed ✅',
    remarks: '',
    next_service_date: ''
  });

  useEffect(() => {
    const fetchDevice = async () => {
      const { data } = await supabase.from('devices').select('site_name, model').eq('sn', sn).single();
      if (data) setDevice(data);
    };
    fetchDevice();
  }, [sn]);

  const handleSaveReport = async () => {
    if (!formData.technician_name || !formData.work_done) return alert("⚠️ Please fill Technician Name and Work Done!");
    
    setLoading(true);
    const { error } = await supabase.from('service_logs').insert([{
      device_sn: sn,
      ...formData,
      created_at: new Date()
    }]);

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert("✅ Service Log Saved Successfully!");
      router.push('/admin'); // Ya jahan aap bhejna chahein
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-[50px] p-9 shadow-2xl border border-white relative overflow-hidden">
        
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

        {/* Back Button */}
        <button onClick={() => router.back()} className="absolute left-8 top-8 p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all border border-slate-100">
          <ArrowLeft size={20} />
        </button>

        {/* Title Section */}
        <div className="flex flex-col items-center mb-8 text-center mt-6">
          <div className="bg-emerald-50 p-5 rounded-[28px] mb-3 shadow-inner border border-white">
             <ClipboardCheck className="text-emerald-600" size={34} strokeWidth={2.5} />
          </div>
          <h1 className="text-[26px] font-[1000] text-slate-800 tracking-tighter leading-none uppercase italic">Service Report</h1>
          <div className="mt-3 flex flex-col items-center">
            <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[3px]">{device?.site_name || 'LOADING...'}</span>
            <p className="text-slate-300 font-bold text-[9px] uppercase mt-1 tracking-widest">SN: {sn}</p>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-3 custom-scroll mb-8 px-1 text-left">
          
          {/* Technician Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
              <User size={13} className="text-emerald-500" /> Technician Name
            </label>
            <input 
              className="w-full p-5 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[15px] font-bold text-slate-700 focus:border-emerald-200 transition-all"
              placeholder="Engineer Name"
              onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
            />
          </div>

          {/* Issue / Work Done */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
              <Wrench size={13} className="text-emerald-500" /> Work Done / Issue
            </label>
            <textarea 
              className="w-full p-5 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-semibold text-slate-700 min-h-[100px] focus:border-emerald-200"
              placeholder="Describe the service..."
              onChange={(e) => setFormData({...formData, work_done: e.target.value})}
            />
          </div>

          {/* Type & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">🔧 Type</label>
              <select 
                className="w-full p-5 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[13px] font-bold text-slate-700 appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, service_type: e.target.value})}
              >
                <option value="Routine Service">Routine Service</option>
                <option value="Repairing">Repairing</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">✅ Status</label>
              <select 
                className="w-full p-5 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[13px] font-bold text-slate-700 appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Completed ✅">Completed ✅</option>
                <option value="Pending ⏳">Pending ⏳</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
              <MessageSquare size={13} className="text-emerald-500" /> Remarks
            </label>
            <input 
              className="w-full p-5 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-bold text-slate-700 focus:border-emerald-200"
              placeholder="Any other notes?"
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
            />
          </div>

          {/* Next Service Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-600 uppercase ml-4 tracking-widest flex items-center gap-2">
              <Calendar size={13} /> Schedule Next Service
            </label>
            <input 
              type="date"
              className="w-full p-5 bg-emerald-50/50 border-2 border-emerald-100 rounded-[25px] outline-none text-[14px] font-black text-emerald-700 focus:border-emerald-300 transition-all"
              onChange={(e) => setFormData({...formData, next_service_date: e.target.value})}
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSaveReport}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-black text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[18px] uppercase tracking-widest"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} 
          {loading ? 'UPLOADING...' : 'Save Service Log'}
        </button>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </div>
  );
}