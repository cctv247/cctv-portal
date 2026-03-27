"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Rocket, Pencil, MapPin, Plus, 
  Loader2, Globe, AlertTriangle, LogOut, 
  ClipboardList, Menu, X, History as HistoryIcon
} from "lucide-react";
import EditModal from "./EditModal";
import HistoryModal from "./HistoryModal";

export default function AdminCentral() {
  const router = useRouter();
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async () => {
    setLoading(true);
    const { data } = await supabase.from("devices").select("*").order("site_name", { ascending: true });
    if (data) setDevices(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return devices.filter(d => 
      [d.site_name, d.sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, devices]);

  const handleUpdate = async () => {
    if (!selectedDevice?.id) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("devices")
      .update({
        ...selectedDevice,
        latitude: parseFloat(selectedDevice.latitude),
        longitude: parseFloat(selectedDevice.longitude)
      })
      .eq("id", selectedDevice.id);

    if (error) alert("❌ Error: " + error.message);
    else {
      alert("✅ Updated Successfully!");
      fetchDevices();
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  const trackOnMap = (device: any) => {
    const lat = parseFloat(device.latitude);
    const lng = parseFloat(device.longitude);
    if (!lat || !lng || lat === 0) { alert("GPS coordinates miss hain!"); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 pb-24">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-50 bg-[#f8fafc]/90 backdrop-blur-xl border-b border-slate-200/50 pb-6 pt-5 px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100 group-active:scale-90 transition-all">
                <Rocket className="text-white" size={22} strokeWidth={3} />
              </div>
              <h1 className="text-xl font-[1000] text-slate-900 tracking-tighter italic uppercase">Admin Central</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isMenuOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-[30px] shadow-2xl border border-slate-50 p-2 animate-in zoom-in-95 duration-200 z-[60]">
                    <button onClick={() => router.push('/add-device')} className="w-full flex items-center gap-3 p-4 hover:bg-emerald-50 text-emerald-700 rounded-[22px] transition-all font-bold text-sm">
                      <Plus size={18} strokeWidth={3} /> Add New Device
                    </button>
                    <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-600 rounded-[22px] transition-all font-bold text-sm">
                      <LogOut size={18} /> Logout System
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} strokeWidth={3.5} />
            <input 
              type="text" 
              placeholder="Search site, serial, or IP..." 
              className="w-full p-5 pl-16 rounded-[30px] border-2 border-slate-100 bg-white outline-none font-bold text-slate-700 shadow-sm focus:border-blue-400 focus:ring-4 ring-blue-50 transition-all text-sm" 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* --- DEVICE LIST --- */}
      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-7">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4 text-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px]">Updating Inventory...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((device) => {
            // --- Next Service Date Calculation ---
            const today = new Date();
            const nextService = device.next_service_date ? new Date(device.next_service_date) : null;
            const diffTime = nextService ? nextService.getTime() - today.getTime() : null;
            const diffDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;

            let alertClasses = "bg-slate-100 text-slate-400";
            if (diffDays !== null) {
              if (diffDays < 0) alertClasses = "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200";
              else if (diffDays === 0) alertClasses = "bg-orange-500 text-white animate-bounce shadow-lg shadow-orange-200";
              else if (diffDays <= 3) alertClasses = "bg-amber-400 text-white";
              else alertClasses = "bg-emerald-50 text-emerald-600 border border-emerald-100";
            }

            return (
              <div key={device.id} className="bg-white p-7 rounded-[45px] border border-slate-100 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
                
                {/* 🚨 NEXT SERVICE ALERT RIBBON */}
                {nextService && (
                  <div className={`absolute left-0 top-0 px-5 py-1.5 rounded-br-[20px] text-[9px] font-[1000] uppercase tracking-widest z-10 ${alertClasses}`}>
                    {diffDays !== null && diffDays < 0 ? `⚠️ Overdue ${Math.abs(diffDays)} Days` : 
                     diffDays === 0 ? "🚨 Service Today" : 
                     `📅 Next: ${nextService.toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}`}
                  </div>
                )}

                {/* Category Badge */}
                <span className="absolute right-10 top-10 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                  {device.category || 'DVR'}
                </span>

                <div className="mb-6 text-left mt-6">
                  <h3 className="text-xl font-[1000] text-slate-800 mb-2 leading-tight uppercase tracking-tight">{device.site_name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      SN: {device.sn}
                    </div>
                    
                    {/* Map Icon Button */}
                    {parseFloat(device.latitude) ? (
                      <button onClick={() => trackOnMap(device)} className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100 active:scale-90 transition-all">
                        <MapPin size={16} fill="currentColor" fillOpacity={0.2} />
                      </button>
                    ) : (
                      <div className="p-2 bg-slate-50 text-slate-300 rounded-xl border border-slate-100">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 🚀 QUICK ACTION ICONS ROW */}
                <div className="flex items-center justify-between gap-3 mt-2 pt-4 border-t border-slate-50">
                  <button onClick={() => { setSelectedDevice(device); setIsHistoryOpen(true); }} className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-[25px] hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90">
                    <div className="p-3 bg-slate-50 rounded-2xl"><HistoryIcon size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">History</span>
                  </button>

                  <button onClick={() => router.push(`/engineer/${device.sn}`)} className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-[25px] hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all active:scale-90">
                    <div className="p-3 bg-slate-50 rounded-2xl"><ClipboardList size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Report</span>
                  </button>

                  <button onClick={() => { setSelectedDevice(device); setIsModalOpen(true); }} className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-[25px] hover:bg-slate-50 text-slate-400 hover:text-orange-500 transition-all active:scale-90">
                    <div className="p-3 bg-slate-50 rounded-2xl"><Pencil size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
                  </button>

                  <button onClick={() => window.open(`/request/${device.sn}`, '_blank')} className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-[25px] hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all active:scale-90">
                    <div className="p-3 bg-slate-50 rounded-2xl"><Globe size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Portal</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest opacity-40 italic">
            No Site Matches Your Search
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <EditModal 
        isOpen={isModalOpen} 
        device={selectedDevice} 
        setDevice={setSelectedDevice} 
        onClose={() => setIsModalOpen(false)} 
        onUpdate={handleUpdate} 
        isSaving={isSaving} 
      />

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        sn={selectedDevice?.sn} 
        siteName={selectedDevice?.site_name} 
      />
    </div>
  );
}