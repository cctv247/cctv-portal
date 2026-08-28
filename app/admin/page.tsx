"use client";

// app/admin/page.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { COMPANY } from "@/lib/config";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/components/AuthGuard";
import RequestManagerModal, { RequestNotification } from "../request/RequestManagerModal";
import { encryptData } from "@/lib/crypto";
import StickerModal from "@/lib/components/StickerModal";
import { 
  Search, Rocket, Pencil, MapPin, Plus, X,
  Loader2, LogOut, ClipboardList, 
  History as HistoryIcon, ShieldCheck, User as UserIcon, ExternalLink, CalendarClock, BellRing, QrCode, PhoneCall
} from "lucide-react";
import EditModal from "./EditModal";
import HistoryModal from "./HistoryModal";
import MasterDialog from "@/lib/components/MasterDialog";

export default function AdminCentral() {
  const router = useRouter();

  // --- STATES ---
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState<string | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isStickerOpen, setIsStickerOpen] = useState(false);

  // Request Management States
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isReqManagerOpen, setIsReqManagerOpen] = useState(false);
  const [filterSn, setFilterSn] = useState<string | null>(null);

  // --- DATA FETCHING (FIXED TO PICK LATEST LOG ONLY) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [devRes, reqRes] = await Promise.all([
        supabase
          .from("devices")
          .select(`*, service_logs (next_service_date, created_at)`)
          .order("site_name", { ascending: true }),
        supabase
          .from("requests")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      ]);

      if (devRes.data) {
        const processed = devRes.data.map((device: any) => {
          const sortedLogs = (device.service_logs || []).sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          const latestLog = sortedLogs[0];
          return { 
            ...device, 
            next_service_date: latestLog ? latestLog.next_service_date : null 
          };
        });
        setDevices(processed);
      }
      if (reqRes.data) setPendingRequests(reqRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- INITIALIZE & REALTIME ---
  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const metadata = session.user.user_metadata;
        setUserRole(metadata?.role || "user");
        const fullName = metadata?.full_name || metadata?.name || session.user.email?.split('@')[0];
        setUserName(fullName);
        
        fetchData();
      }
    };
    initialize();

    const channel = supabase
      .channel('admin-realtime-v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_logs' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  // --- MASTER DIALOG STATE ---
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "danger" | "success" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  // ✅ DATABASE UPDATE LOGIC
  const handleUpdateDevice = async () => {
    if (!selectedDevice) return;
    setDialog(prev => ({ ...prev, isOpen: false }));
    setIsSaving(true);

    try {
      const updatePayload: any = {
        site_name: selectedDevice.site_name,
        category: selectedDevice.category,
        model: selectedDevice.model,
        ip_address: selectedDevice.ip_address,
        user_name: selectedDevice.user_name || "user",
        admin_name: selectedDevice.admin_name || "admin",
        latitude: selectedDevice.latitude ? parseFloat(selectedDevice.latitude) : null,
        longitude: selectedDevice.longitude ? parseFloat(selectedDevice.longitude) : null,
        radius: selectedDevice.radius ? parseInt(selectedDevice.radius) : 100,
        device_notes: selectedDevice.device_notes,
        camera_count: Number(selectedDevice.camera_count) || 0,
        device_count: Number(selectedDevice.device_count) || 1,
        power_count: Number(selectedDevice.power_count) || 1,
        is_reseller: selectedDevice.is_reseller !== false,
        last_maintenance: selectedDevice.last_maintenance || null,
      };

      if (selectedDevice.user_pass) updatePayload.user_pass = encryptData(selectedDevice.user_pass);
      if (selectedDevice.admin_pass) updatePayload.admin_pass = encryptData(selectedDevice.admin_pass);
      if (selectedDevice.v_code) updatePayload.v_code = encryptData(selectedDevice.v_code);

      const { error } = await supabase
        .from("devices")
        .update(updatePayload)
        .eq("device_sn", selectedDevice.device_sn);

      if (error) throw error;
      
      setIsModalOpen(false);
      setSelectedDevice(null);
      await fetchData(); 
    } catch (err: any) {
      alert(`Database Update Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // --- TRIGGER DIALOGS ---
  const triggerUpdateConfirm = () => {
    setDialog({
      isOpen: true,
      title: "Confirm Master Sync?",
      message: `Kya aap ${selectedDevice?.site_name} ka master data database mein update karna chahte hain?`,
      type: "info",
      onConfirm: handleUpdateDevice,
    });
  };

  const triggerLogoutConfirm = () => {
    setDialog({
      isOpen: true,
      title: "System Logout?",
      message: "Kya aap Modern Systems portal se bahar nikalna chahte hain?",
      type: "danger",
      onConfirm: handleLogout,
    });
  };

  const trackOnMap = (device: any) => {
    const { latitude, longitude } = device;
    if (!latitude || !longitude) {
      return alert("⚠️ Is site ki location (Lat/Long) database mein nahi hai!");
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filtered = useMemo(() => devices.filter(d => 
    [d.site_name, d.device_sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
  ), [search, devices]);

  const stats = useMemo(() => ({
    totalSites: devices.length,
    pending: pendingRequests.length,
    activeTypes: new Set(devices.map(d => d.category || 'DVR')).size,
  }), [devices, pendingRequests]);

  const getServiceStatusStyles = (dateString: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const serviceDate = new Date(dateString);
    const diffDays = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "bg-red-600 text-white border-red-700"; 
    if (diffDays === 0) return "bg-orange-600 text-white border-orange-700"; 
    if (diffDays <= 7) return "bg-orange-100 text-orange-700 border-orange-200"; 
    return "bg-emerald-50 text-emerald-700 border-emerald-100"; 
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}> 
      <div className="min-h-screen bg-[#f8fafc] pb-24 text-left font-sans text-slate-800 antialiased">
        {/* --- STICKY HEADER --- */}
        <div className="sticky top-0 z-[100] border-b border-slate-200/50 bg-white/80 px-4 pt-5 pb-5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <div className="flex items-center gap-3 italic">
              <div className="rounded-2xl bg-blue-600 p-2.5 shadow-xl shadow-blue-100"><Rocket className="text-white" size={20} /></div>
              <div>
                <a 
                  href={COMPANY?.links?.linktree || "https://linktr.ee/wazahul"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block text-lg leading-none font-[1000] tracking-tighter text-black uppercase transition-all hover:text-blue-500 sm:text-xl"
                >
                  Admin <span className="text-blue-500 italic">Central</span>
                </a>

                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[1px] border ${
                  isSuperAdmin 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isSuperAdmin ? <ShieldCheck size={10} strokeWidth={3} /> : <UserIcon size={10} strokeWidth={3} />}
                  <span>{userName ? userName : userRole}</span>
                  <span className={`w-1 h-1 rounded-full animate-pulse ml-1 ${isSuperAdmin ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`p-2.5 rounded-2xl shadow-lg transition-all active:scale-90 ${isSearchOpen ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}><Search size={16} /></button>
              <button onClick={() => { setFilterSn(null); setIsReqManagerOpen(true); }} className="relative p-2.5 bg-white border border-slate-200 text-red-500 rounded-2xl shadow-lg active:scale-95 transition-all">
                <BellRing size={16} />
                {stats.pending > 0 && <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 font-black text-white text-[10px] shadow-sm">{stats.pending}</span>}
              </button>
              <button onClick={() => setIsStickerOpen(true)} className="p-2.5 bg-white border border-slate-200 text-blue-600 rounded-2xl shadow-lg active:scale-90 transition-all">
                <QrCode size={16} />
              </button>
              <button onClick={triggerLogoutConfirm} className="rounded-2xl border border-red-50 bg-white p-2.5 text-red-500 shadow-lg active:scale-90"><LogOut size={16} /></button>
            </div>
          </div>

          {isSearchOpen && (
            <div className="animate-in slide-in-from-top-4 mx-auto mt-4 max-w-2xl px-0 duration-300">
              <div className="group relative">
                <Search className="absolute top-1/2 left-6 -translate-y-1/2 text-blue-500" size={18} />
                <input autoFocus type="text" placeholder="Search site, SN or IP..." className="w-full rounded-[25px] border-2 border-blue-100 bg-white p-5 pr-16 pl-16 text-sm font-bold text-slate-700 shadow-xl transition-all outline-none focus:border-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
                <button onClick={() => { setIsSearchOpen(false); setSearch(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400"><X size={18} /></button>
              </div>
            </div>
          )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="mx-auto mt-8 max-w-2xl px-4">
          <div className="mb-10 grid grid-cols-2 gap-4 text-left">
            <div className="relative overflow-hidden rounded-[35px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500"></div>
              <p className="mb-1 leading-none font-black tracking-widest text-[10px] text-slate-400 uppercase">Total Sites</p>
              <h2 className="mt-1 text-4xl leading-none font-[1000] tracking-tighter text-slate-800 italic">{stats.totalSites}</h2>
            </div>
            <div className="relative overflow-hidden rounded-[35px] border border-slate-100 bg-white p-6 text-right shadow-sm">
              <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500"></div>
              <p className="mb-1 leading-none font-black tracking-widest text-[10px] text-slate-400 uppercase">Active Types</p>
              <h2 className="mt-1 text-4xl leading-none font-[1000] tracking-tighter text-slate-800 italic">{stats.activeTypes}</h2>
            </div>
          </div>

          {/* DEVICE LIST */}
          <div className="space-y-7 pb-20">
            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : filtered.map((device) => (
              <div key={device.id} className="group relative overflow-hidden rounded-[40px] border border-slate-100 bg-white p-6 pt-14 shadow-xl transition-all active:scale-[0.98]">
                <RequestNotification deviceSn={device.device_sn} pendingRequests={pendingRequests} onClick={() => { setFilterSn(device.device_sn); setIsReqManagerOpen(true); }} />
                <span className="absolute top-8 right-8 rounded-2xl bg-blue-50 px-4 py-1.5 font-black tracking-widest text-blue-600 text-[9px] uppercase">{device.category || 'DVR'}</span>
                
                <div className="mb-8 space-y-4">
                  <div onClick={() => window.open(`/request/${device.device_sn}`, '_blank')} className="cursor-pointer group/link inline-flex items-center gap-2">
                    <h3 className="leading-none font-[1000] tracking-tighter text-[24px] text-slate-800 uppercase italic">{device.site_name}</h3>
                    <ExternalLink size={16} className="text-slate-300" />
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-3.5 py-1.5 font-mono font-bold tracking-tighter text-[10px] text-slate-500 uppercase">SN: {device.device_sn}</div>
                      <button onClick={() => trackOnMap(device)} className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-90 shadow-sm"><MapPin size={18} /></button>
                    </div>

                    {/* NEXT SERVICE STATUS / NON-AMC INDICATOR */}
                    {device.next_service_date ? (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${getServiceStatusStyles(device.next_service_date)}`}>
                        <CalendarClock size={14} />
                        <div className="flex flex-col">
                          <span className="leading-none font-black text-[8px] uppercase opacity-80">Next Service</span>
                          <span className="mt-1 leading-none font-bold text-[11px]">{new Date(device.next_service_date).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-amber-800 shadow-sm">
                        <PhoneCall size={12} className="text-amber-600" />
                        <span className="font-black tracking-wider text-[9px] uppercase">Non-AMC (On-Call)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* THUMB-FRIENDLY BUTTONS */}
                <div className="flex items-center justify-between gap-1 border-t border-slate-50 pt-6">
                  <button onClick={() => { setSelectedDevice(device); setIsHistoryOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-blue-600 transition-all"><div className="rounded-[20px] bg-slate-50 p-3 active:bg-blue-50"><HistoryIcon size={20} /></div><span className="font-black tracking-widest text-[9px] uppercase">History</span></button>
                  {isSuperAdmin && (
                    <>
                      <button onClick={() => router.push('/add-device')} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-emerald-600"><div className="rounded-[20px] bg-slate-50 p-3 active:bg-emerald-50"><Plus size={20} /></div><span className="font-black tracking-widest text-[9px] uppercase">Add</span></button>
                    
                      <button 
                        onClick={async () => {
                          setLoading(true); 
                          try {
                            const res = await fetch("/api/reveal-password", {
                              method: "POST",
                              body: JSON.stringify({ device_sn: device.device_sn }),
                            });
                            const decryptedData = await res.json();
                            if (decryptedData.error) throw new Error(decryptedData.error);

                            setSelectedDevice({
                              ...device,
                              ...decryptedData 
                            });
                            setIsModalOpen(true);
                          } catch (err: any) {
                            alert("Security Error: Identity verification failed or " + err.message);
                          } finally {
                            setLoading(false);
                          }
                        }} 
                        className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-orange-500"
                      >
                        <div className="rounded-[20px] bg-slate-50 p-3 active:bg-orange-50">
                          <Pencil size={20} />
                        </div>
                        <span className="font-black tracking-widest text-[9px] uppercase">Edit</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => router.push(`/service/${device.device_sn}`)} 
                  className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-indigo-600"><div className="rounded-[20px] bg-slate-50 p-3 active:bg-indigo-50"><ClipboardList size={20} /></div><span className="font-black tracking-widest text-[9px] uppercase">Report</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- GLOBAL MODALS --- */}
        <MasterDialog 
          isOpen={dialog.isOpen}
          onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={dialog.onConfirm}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          isLoading={isSaving}
          confirmText="Yes, Sync Now"
        />

        {selectedDevice && (
          <>
            <EditModal 
              isOpen={isModalOpen} 
              device={selectedDevice} 
              setDevice={setSelectedDevice} 
              onClose={() => { setIsModalOpen(false); setSelectedDevice(null); }} 
              onUpdate={triggerUpdateConfirm} 
              isSaving={isSaving} 
            />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => { setIsHistoryOpen(false); setSelectedDevice(null); }} sn={selectedDevice?.device_sn} siteName={selectedDevice?.site_name} />
          </>
        )}
        <RequestManagerModal isOpen={isReqManagerOpen} onClose={() => { setIsReqManagerOpen(false); setFilterSn(null); }} onRefresh={fetchData} filterSn={filterSn} />
        <StickerModal isOpen={isStickerOpen} onClose={() => setIsStickerOpen(false)} devices={devices} />
      </div>
    </AuthGuard>
  );
}