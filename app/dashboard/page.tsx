import Link from "next/link";
import { getClinics, getMonthUsage, aggregateByClinic, getSEKRate, formatSEK, formatMonth } from "@/lib/supabase";
import MonthSelector from "./MonthSelector";
import LogoutButton from "./LogoutButton";

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: formatMonth(value) });
  }
  return options;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const now = new Date();
  const selectedMonth =
    searchParams.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, month] = selectedMonth.split("-").map(Number);

  const [clinics, rows, sekRate] = await Promise.all([
    getClinics(),
    getMonthUsage(year, month),
    getSEKRate(),
  ]);

  const aggregated = aggregateByClinic(rows, clinics);
  const totalSEK = aggregated.reduce((sum, c) => sum + c.total_cost_usd * sekRate, 0);

  const monthOptions = getMonthOptions();

  return (
    <div className="min-h-screen bg-[#07070f]">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0F7FFF] opacity-[0.04] blur-[140px]" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7E22CE] opacity-[0.04] blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-widest bg-gradient-to-r from-[#0F7FFF] to-[#c026d3] bg-clip-text text-transparent">
              ZENTRA AI
            </span>
            <span className="text-white/20">|</span>
            <span className="text-gray-500 text-sm">Användningsdashboard</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="relative max-w-[1100px] mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Översikt</h2>
            <p className="text-gray-500 text-sm mt-1">
              Total kostnad:{" "}
              <span className="font-semibold text-white">
                {totalSEK.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          <MonthSelector options={monthOptions} selected={selectedMonth} />
        </div>

        {/* Clinic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregated.map((clinic) => (
            <Link
              key={clinic.clinic_id}
              href={`/dashboard/${clinic.clinic_id}?name=${encodeURIComponent(clinic.name)}`}
              className="group relative rounded-2xl p-px bg-white/[0.06] hover:bg-gradient-to-br hover:from-[#0F7FFF55] hover:to-[#7E22CE55] transition-all duration-300"
            >
              <div className="bg-[#0d0d1a] rounded-2xl p-6 h-full group-hover:bg-[#0a0a16] transition-colors">
                <div className="flex items-start justify-between mb-5">
                  <h3 className="font-semibold text-white group-hover:text-[#60a5fa] transition-colors text-sm">
                    {clinic.name}
                  </h3>
                  <svg className="w-4 h-4 text-white/20 group-hover:text-[#60a5fa] transition-colors mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <p className="text-3xl font-bold text-white mb-5">
                  {formatSEK(clinic.total_cost_usd, sekRate)}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Deepgram</span>
                    <span className="font-medium text-gray-300">{Math.round(clinic.deepgram_seconds)} sek</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Azure OpenAI</span>
                    <span className="font-medium text-gray-300">{clinic.azure_requests} req</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {aggregated.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            Ingen data för {formatMonth(selectedMonth)}
          </div>
        )}
      </main>
    </div>
  );
}
