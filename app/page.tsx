
"use client";
// app/page.tsx
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-xl bg-white/10 p-8 text-center backdrop-blur-lg">

        <h1 className="mb-5 text-2xl font-semibold text-white">CCTV System</h1>

        {/* Engineer Button */}
        <button
          onClick={() => router.push("/admin")}
          className="w-full bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-all p-3 mb-3 rounded font-semibold text-black"
        >
          🛠 Engineer
        </button>

        {/* Admin Button */}
        <button
          onClick={() => router.push("/admin")}
          className="w-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all p-3 mb-3 rounded font-semibold text-white"
        >
          ⚙️ Admin
        </button>

        {/* Permission Button */}
        <button
          onClick={() => router.push("/permission")}
          className="w-full bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all p-3 mb-3 rounded font-semibold text-white"
        >
          🔐 Permission
        </button>

        {/* Signup Button */}
        <button
          onClick={() => router.push("/signup")}
          className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all p-3 rounded font-semibold text-white"
        >
          👥 Add New User
        </button>

      </div>
    </div>
  );
}
