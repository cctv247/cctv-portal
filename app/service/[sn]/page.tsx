"use client";
// app/service/[sn]/page.tsx
import { useState, useEffect } from "react";
import { COMPANY } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/lib/components/AuthGuard"; 
import MasterDialog from "@/lib/components/MasterDialog"; 
import { 
  ClipboardCheck, User, Wrench, Calendar, 
  Save, Loader2, MessageSquare, ShieldCheck, 
  Tag, Edit3, X, PhoneCall, Sparkles, Languages 
} from "lucide-react";

export default function ServiceReportPage() {
  const params = useParams();
  const router = useRouter();
  const sn = (params?.sn as string) || "";

  // Form & System States
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<{ site_name?: string; category?: string } | null>(null);
  const [displayName, setDisplayName] = useState<string>(""); 
  const [isAmcClient, setIsAmcClient] = useState<boolean>(true);

  // AI Multi-Language States
  const [aiLang, setAiLang] = useState<"en" | "hi" | "mr">("en");
  const [aiLoadingWork, setAiLoadingWork] = useState(false);
  const [aiLoadingRemarks, setAiLoadingRemarks] = useState(false);

  // MasterDialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "danger" | "success",
    onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
  });

  // Default Next AMC Date (+60 Days)
  const getDefaultNextDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    technician_name: "",
    work_done: "",
    service_type: "Routine Service",
    status: "Completed ✅",
    remarks: "",
    next_service_date: getDefaultNextDate()
  });

  // Browser Sync & Initial Data
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    window.addEventListener("resize", setHeight);
    setHeight();

    const fetchInitialData = async () => {
      if (!sn) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const name = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
          setDisplayName(name);
          setFormData((prev) => ({ ...prev, technician_name: prev.technician_name || name }));
        }

        const { data } = await supabase
          .from("devices")
          .select("site_name, category")
          .eq("device_sn", sn)
          .maybeSingle();

        if (data) {
          setDevice(data);
        }
      } catch (error) {
        console.error("Initial data fetch error:", error);
      }
    };

    fetchInitialData();
    return () => { 
      document.body.style.overflow = "unset"; 
      window.removeEventListener("resize", setHeight);
    };
  }, [sn]);

  // AI Polish Handler (Groq Backend)
  const handleAiPolish = async (field: "work_done" | "remarks") => {
    const rawText = formData[field]?.trim();
    if (!rawText) {
      setDialog({
        isOpen: true,
        title: "Input Empty",
        message: "Pehle kuch simple shabd ya technician notes likhein, fir AI use technical format me convert karega!",
        type: "warning",
        onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (aiLoadingWork || aiLoadingRemarks) return;

    if (field === "work_done") setAiLoadingWork(true);
    else setAiLoadingRemarks(true);

    try {
      const res = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: rawText, 
          type: field,
          lang: aiLang 
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `AI service error: status ${res.status}`);
      }

      if (data?.polishedText) {
        setFormData((prev) => ({ ...prev, [field]: data.polishedText.trim() }));
      } else {
        throw new Error("Invalid response received from AI.");
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "AI Polish Failed",
        message: err.message || "Failed to process AI text polish.",
        type: "danger",
        onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
      });
    } finally {
      if (field === "work_done") setAiLoadingWork(false);
      else setAiLoadingRemarks(false);
    }
  };

  // Submit Handler
  const handleSaveReport = async () => {
    if (!formData.technician_name.trim()) {
      setDialog({
        isOpen: true,
        title: "Auth Required",
        message: "Technician identity is required to authorize this maintenance log.",
        type: "warning",
        onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (!formData.work_done.trim()) {
      setDialog({
        isOpen: true,
        title: "Technical Details Missing",
        message: "Please provide a brief description of the technical work completed.",
        type: "warning",
        onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setLoading(true);
    const finalNextDate = isAmcClient ? (formData.next_service_date || getDefaultNextDate()) : null;

    try {
      const { error: logError } = await supabase.from("service_logs").insert([
        { 
          device_sn: sn, 
          site_name: device?.site_name || "Site", 
          technician_name: formData.technician_name.trim(),
          work_done: formData.work_done.trim(),
          service_type: formData.service_type,
          status: formData.status,
          remarks: formData.remarks.trim(),
          next_service_date: finalNextDate,
          created_at: new Date().toISOString() 
        }
      ]);

      if (logError) {
        setDialog({
          isOpen: true,
          title: "Database Conflict",
          message: logError.message,
          type: "danger",
          onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
        });
        setLoading(false);
        return;
      }

      await supabase.from("devices").update({ 
        last_maintenance: new Date().toISOString().split("T")[0]
      }).eq("device_sn", sn); 

      setDialog({
        isOpen: true,
        title: "Report Synchronized",
        message: "Technical service log has been successfully uploaded to the cloud.",
        type: "success",
        onConfirm: () => router.push("/admin") 
      });
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Save Failed",
        message: err.message || "Failed to submit report.",
        type: "danger",
        onConfirm: () => setDialog((prev) => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}>
      <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-900/10 backdrop-blur-sm sm:items-center">
        <div 
          style={{ height: "calc(var(--vh, 1vh) * 100)" }}
          className="animate-in slide-in-from-bottom relative flex w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl duration-700 sm:h-auto sm:max-h-[95vh] sm:rounded-[40px]"
        >
          {/* HEADER */}
          <div className="sticky top-0 z-[110] flex shrink-0 items-center justify-between border-b border-slate-50 bg-white/95 p-4 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-left italic">
              <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-100">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <h3 className="text-lg leading-none font-[1000] tracking-tighter text-slate-900 uppercase italic">Create Service Report</h3>
                <p className="mt-1 leading-none font-black tracking-[3px] text-[9px] text-blue-500 uppercase italic"> {COMPANY?.name || "Modern Enterprises"}</p>
              </div>
            </div>
            <button onClick={() => router.back()} className="rounded-xl border border-slate-200/50 bg-slate-100 p-2.5 text-slate-400 active:scale-90">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* FORM BODY */}
          <div className="custom-scroll flex-1 touch-pan-y space-y-6 overflow-y-auto overscroll-contain bg-[#fcfdfe] px-5 pt-5 pb-40 text-left sm:px-8">
            
            {/* Status Badges & Language Selector */}
            <div className="animate-in fade-in flex flex-wrap items-center justify-between gap-2 duration-500">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-white">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  <span className="font-black tracking-widest text-[9px] uppercase">{displayName || "Technician"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  <Tag size={10} className="text-blue-500" />
                  <span className="font-mono font-black tracking-wider text-[9px] text-slate-500">SN: {sn}</span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 shadow-inner">
                <Languages size={12} className="mr-0.5 ml-1.5 text-slate-400" />
                <button 
                  type="button" 
                  onClick={() => setAiLang("en")} 
                  disabled={aiLoadingWork || aiLoadingRemarks}
                  className={`rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase transition-all ${
                    aiLang === "en" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  EN
                </button>
                <button 
                  type="button" 
                  onClick={() => setAiLang("hi")} 
                  disabled={aiLoadingWork || aiLoadingRemarks}
                  className={`rounded-full px-2 py-0.5 text-[8.5px] font-black transition-all ${
                    aiLang === "hi" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  हिन्दी
                </button>
                <button 
                  type="button" 
                  onClick={() => setAiLang("mr")} 
                  disabled={aiLoadingWork || aiLoadingRemarks}
                  className={`rounded-full px-2 py-0.5 text-[8.5px] font-black transition-all ${
                    aiLang === "mr" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-l-4 border-blue-500 pl-3">
              <h2 className="font-black tracking-[3px] text-slate-700 text-[11px] uppercase italic">
                {device?.site_name || "Loading Site..."}
              </h2>
              {device?.category && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold tracking-wider text-[9px] text-slate-500 uppercase">
                  {device.category}
                </span>
              )}
            </div>

            <div className="space-y-5">
              {/* Technician Name */}
              <div className="space-y-1.5">
                <label className="ml-3 flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
                  <User size={12} className="text-blue-500" /> Technician
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-black text-slate-700 italic shadow-sm transition-all outline-none focus:border-blue-500"
                    value={formData.technician_name} 
                    onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })} 
                  />
                  <Edit3 size={14} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-300" />
                </div>
              </div>

              {/* Work Description with AI Polish */}
              <div className="space-y-1.5">
                <div className="mr-1 ml-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
                    <Wrench size={12} className="text-blue-500" /> Work Description
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => handleAiPolish("work_done")}
                    disabled={aiLoadingWork || aiLoadingRemarks}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 text-[9px] font-black tracking-wider text-white uppercase shadow-sm transition-all hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aiLoadingWork ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>{aiLoadingWork ? "Polishing..." : `AI Polish (${aiLang.toUpperCase()})`}</span>
                  </button>
                </div>

                <textarea 
                  className="min-h-[110px] w-full resize-none rounded-[25px] border border-slate-200 bg-white p-5 text-xs font-bold text-slate-700 shadow-inner transition-all outline-none focus:border-purple-400"
                  placeholder="Simple words me likhein (e.g. 2 camera check kiya 1 bnc change kiya power supply ok)..." 
                  value={formData.work_done} 
                  onChange={(e) => setFormData({ ...formData, work_done: e.target.value })} 
                />
              </div>

              {/* Grid: Job Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="ml-3 font-black text-[9px] text-slate-400 uppercase italic">Job Type</label>
                  <select 
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white p-3.5 font-black text-slate-600 text-[10px] shadow-sm outline-none focus:border-blue-500"
                    value={formData.service_type} 
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  >
                    <option value="Routine Service">Routine Service</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Emergency">Emergency 🚨</option>
                    <option value="Installation">Installation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="ml-3 font-black text-[9px] text-slate-400 uppercase italic">Status</label>
                  <select 
                    className={`w-full rounded-2xl border p-3.5 font-black text-[10px] shadow-sm outline-none appearance-none ${
                      formData.status.includes("✅") ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-orange-200 bg-orange-50 text-orange-600"
                    }`}
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Completed ✅">Completed ✅</option>
                    <option value="Pending ⏳">Pending ⏳</option>
                  </select>
                </div>
              </div>

              {/* Remarks with AI Polish */}
              <div className="space-y-1.5">
                <div className="mr-1 ml-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 font-black tracking-widest text-[9px] text-slate-400 uppercase italic">
                    <MessageSquare size={12} className="text-blue-500" /> Technical Remarks
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => handleAiPolish("remarks")}
                    disabled={aiLoadingRemarks || aiLoadingWork}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 text-[9px] font-black tracking-wider text-white uppercase shadow-sm transition-all hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aiLoadingRemarks ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>{aiLoadingRemarks ? "Polishing..." : `AI Polish (${aiLang.toUpperCase()})`}</span>
                  </button>
                </div>

                <textarea 
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-bold text-slate-700 shadow-sm transition-all outline-none focus:border-purple-400" 
                  placeholder="Remarks (e.g. Sab working hai 1 camera angle set kiya)..." 
                  value={formData.remarks} 
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} 
                />
              </div>

              {/* Maintenance Plan (AMC vs Non-AMC) */}
              <div className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 leading-none font-black tracking-wider text-[10px] text-slate-700 uppercase italic">
                    <ShieldCheck size={14} className="text-blue-600" /> Maintenance Support Plan
                  </label>
                  <div className="flex rounded-2xl bg-slate-100 p-1">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAmcClient(true);
                        if (!formData.next_service_date) setFormData((prev) => ({ ...prev, next_service_date: getDefaultNextDate() }));
                      }}
                      className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase transition-all ${
                        isAmcClient ? "bg-emerald-600 text-white shadow-md" : "text-slate-400"
                      }`}
                    >
                      AMC Client
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAmcClient(false);
                        setFormData((prev) => ({ ...prev, next_service_date: "" }));
                      }}
                      className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase transition-all ${
                        !isAmcClient ? "bg-amber-600 text-white shadow-md" : "text-slate-400"
                      }`}
                    >
                      Non-AMC
                    </button>
                  </div>
                </div>

                {isAmcClient ? (
                  <div className="animate-in fade-in rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 duration-300">
                    <label className="flex items-center gap-2 leading-none font-black tracking-[1px] text-[9px] text-emerald-800 uppercase italic">
                      <Calendar size={12} className="text-emerald-600" /> Next Routine Service Due Date
                    </label>
                    <input 
                      type="date" 
                      value={formData.next_service_date}
                      className="mt-2 w-full cursor-pointer border-none bg-transparent text-sm font-black text-emerald-900 outline-none" 
                      onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })} 
                    />
                  </div>
                ) : (
                  <div className="animate-in fade-in flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-4 duration-300">
                    <div className="flex items-center gap-2.5">
                      <PhoneCall size={16} className="text-amber-600" />
                      <div>
                        <p className="leading-none font-black text-[10px] text-amber-900 uppercase">On-Call Service Active</p>
                        <p className="mt-1 leading-none font-bold text-[8px] text-amber-600 uppercase">Slip: "NON-AMC (ON-CALL SERVICE)"</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-200 px-2.5 py-1 font-black text-[9px] text-amber-900 uppercase">No Contract</span>
                  </div>
                )}
              </div>

            </div>

            {/* Submit Action */}
            <div className="relative z-[50] pt-4 pb-20">
              <button 
                type="button"
                onClick={handleSaveReport} 
                disabled={loading || aiLoadingWork || aiLoadingRemarks}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[25px] border-black border-b-[6px] bg-slate-900 py-5 text-sm font-black tracking-[4px] text-white uppercase italic shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {loading ? "Submitting..." : "Submit Report"}
              </button>
              <p className="mt-8 text-center leading-none font-[1000] tracking-tighter text-[22px] text-emerald-200 uppercase italic sm:text-[10px]">
                <span>{(COMPANY?.app?.name || "Cctv Portal").split(" ")[0]}</span>
                <span className="ml-1.5 text-blue-200 italic">{(COMPANY?.app?.name || "Cctv Portal").split(" ")[1] || ""}</span>
                <span className="ml-3 font-black tracking-[2px] text-blue-300/50 text-[14px] italic sm:text-[8px]">
                  {COMPANY?.app?.version || "v2.0"}
                </span>
              </p>
            </div>

          </div>
        </div>

        {/* MasterDialog Notification */}
        <MasterDialog 
          isOpen={dialog.isOpen} 
          onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))} 
          onConfirm={dialog.onConfirm} 
          title={dialog.title} 
          message={dialog.message} 
          type={dialog.type} 
        />
      </div>
    </AuthGuard>
  );
}