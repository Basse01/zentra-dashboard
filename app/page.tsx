"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Fel lösenord");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07070f] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#0F7FFF] opacity-[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#7E22CE] opacity-[0.07] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-2xl font-bold tracking-widest bg-gradient-to-r from-[#0F7FFF] to-[#c026d3] bg-clip-text text-transparent">
            ZENTRA AI
          </span>
          <p className="text-gray-500 text-sm mt-2">Användningsdashboard</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-px bg-gradient-to-br from-[#0F7FFF33] to-[#7E22CE33]">
          <div className="bg-[#0d0d1a] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Lösenord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#141428] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0F7FFF] transition-colors"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!password || loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#0F7FFF] to-[#7E22CE] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? "Loggar in..." : "Logga in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
