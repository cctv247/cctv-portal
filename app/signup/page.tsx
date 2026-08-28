"use client";
// app/signup/page.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/components/AuthGuard";
import { 
  Lock, Mail, Loader2, ShieldCheck, 
  User, Activity, ArrowLeft, Users, ChevronDown
} from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState("engineer"); // Default role
  const [loading, setLoading] = useState(false);
  
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any,
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: userType, // 🚩 Ab yahan 'admin' ya 'engineer' jayega
            display_name: fullName.toUpperCase()
          }
        }
      });

      if (error) throw error;

      setDialog({
        isOpen: true,
        title: "✅ Node Deployed",
        message: `${userType.toUpperCase()} profile created for ${fullName}. Activation link dispatched.`,
        type: "success"
      });
      
      setEmail(""); setPassword(""); setFullName("");
      
    } catch (err: any) {
      setDialog({ 
        isOpen: true, 
        title: "🚨 System Error", 
        message: err.message || "Registration failed.", 
        type: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
    if(dialog.type === 'success') router.push('/admin');
  };

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <div className="flex min-h-screen w-full items-center justify-center bg-[#020617] p-4 font-sans sm:p-6 lg:p-8">
        
        <div className="relative w-full max-w-[540px] rounded-[35px] border border-slate-800/80 bg-[#0f172a] p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          
          {/* Header Navigation */}
          <button 
            onClick={() => router.push('/')} 
            className="mb-6 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-black tracking-[3px] text-[10px] uppercase italic">Back to Terminal</span>
          </button>

          {/* Title Header */}
          <div className="mb-8 flex flex-col text-left">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-3.5 shadow-inner">
                <Users className="text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="leading-none font-[1000] tracking-tighter text-[22px] text-white uppercase italic sm:text-[26px]">
                  User <span className="text-blue-500">Registry</span>
                </h1>
                <p className="mt-2 font-black tracking-[3px] text-[9px] text-slate-400 uppercase italic">
                  Assign System Role • {COMPANY?.name || "Modern Enterprises"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 text-left">
            
            {/* 🚩 ROLE SELECTION DROPDOWN */}
            <div className="space-y-1.5">
              <label className="ml-3 flex items-center gap-1.5 font-black tracking-[3px] text-[9px] text-slate-400 uppercase">
                <Activity size={12} className="text-blue-400" /> Access Level
              </label>
              <div className="relative">
                <select 
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full py-3.5 pl-4 pr-10 bg-[#020617] border-2 border-slate-800 rounded-[20px] outline-none text-[13px] font-bold text-white focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  <option value="engineer">FIELD ENGINEER</option>
                  <option value="super_admin">SYSTEM ADMIN</option>
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="ml-3 flex items-center gap-1.5 font-black tracking-[3px] text-[9px] text-slate-400 uppercase">
                <User size={12} className="text-blue-400" /> Full Identity
              </label>
              <input 
                type="text" 
                required 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Ex: Shaikh Wazahul" 
                className="w-full p-3.5 bg-[#020617] border-2 border-slate-800 rounded-[20px] outline-none text-[13px] font-bold text-white focus:border-blue-500 transition-all placeholder:text-slate-600" 
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="ml-3 flex items-center gap-1.5 font-black tracking-[3px] text-[9px] text-slate-400 uppercase">
                <Mail size={12} className="text-blue-400" /> Operator Email
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="operator@gmail.com" 
                className="w-full p-3.5 bg-[#020617] border-2 border-slate-800 rounded-[20px] outline-none text-[13px] font-bold text-white focus:border-blue-500 transition-all placeholder:text-slate-600" 
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="ml-3 flex items-center gap-1.5 font-black tracking-[3px] text-[9px] text-slate-400 uppercase">
                <Lock size={12} className="text-blue-400" /> Passkey
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full p-3.5 bg-[#020617] border-2 border-slate-800 rounded-[20px] outline-none text-[13px] font-bold text-white focus:border-blue-500 transition-all placeholder:text-slate-600" 
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[24px] border-blue-900 border-b-[5px] bg-blue-600 py-4 font-[1000] tracking-[3px] text-white text-[12px] uppercase italic shadow-xl transition-all hover:bg-blue-500 active:scale-[0.98] active:border-b-0 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />} 
                <span>{loading ? 'Initializing...' : 'Deploy Operator'}</span>
              </button>
            </div>
          </form>
        </div>

        <MasterDialog 
          isOpen={dialog.isOpen} 
          onClose={closeDialog} 
          onConfirm={closeDialog} 
          title={dialog.title} 
          message={dialog.message} 
          type={dialog.type} 
          confirmText="Acknowledge" 
        />
      </div>
    </AuthGuard>
  );
}