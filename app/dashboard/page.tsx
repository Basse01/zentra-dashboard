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
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-[#1a1a1a] tracking-wide">ZENTRA AI</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-500 text-sm">Användningsdashboard</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a]">Översikt</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Total kostnad: <span className="font-semibold text-[#1a1a1a]">{totalSEK.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 })}</span>
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
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-[#6366f1] hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#6366f1] transition-colors">
                  {clinic.name}
                </h3>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-[#6366f1] transition-colors mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <p className="text-2xl font-bold text-[#1a1a1a] mb-4">
                {formatSEK(clinic.total_cost_usd, sekRate)}
              </p>

              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Deepgram</span>
                  <span className="font-medium text-[#1a1a1a]">{Math.round(clinic.deepgram_seconds)} sek</span>
                </div>
                <div className="flex justify-between">
                  <span>Azure OpenAI</span>
                  <span className="font-medium text-[#1a1a1a]">{clinic.azure_requests} req</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {aggregated.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Ingen data för {formatMonth(selectedMonth)}
          </div>
        )}
      </main>
    </div>
  );
}
