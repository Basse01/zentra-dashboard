import Link from "next/link";
import { getClinicHistory, aggregateByMonth, getSEKRate, formatSEK, formatMonth } from "@/lib/supabase";
import LogoutButton from "../LogoutButton";

export default async function ClinicDetailPage({
  params,
  searchParams,
}: {
  params: { clinicId: string };
  searchParams: { name?: string };
}) {
  const clinicName = searchParams.name ? decodeURIComponent(searchParams.name) : params.clinicId;

  const [rows, sekRate] = await Promise.all([
    getClinicHistory(params.clinicId, 6),
    getSEKRate(),
  ]);

  const monthly = aggregateByMonth(rows);
  const totalSEK = monthly.reduce((sum, m) => sum + m.total_cost_usd * sekRate, 0);

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
        {/* Back + title */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#60a5fa] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <h2 className="text-2xl font-bold text-white">{clinicName}</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Totalt (6 mån):{" "}
              <span className="font-semibold text-white">
                {totalSEK.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>

        {/* Monthly table */}
        <div className="rounded-2xl p-px bg-white/[0.06] overflow-hidden">
          <div className="bg-[#0d0d1a] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-4 font-medium text-gray-500">Månad</th>
                  <th className="text-right px-6 py-4 font-medium text-gray-500">Deepgram</th>
                  <th className="text-right px-6 py-4 font-medium text-gray-500">Azure OpenAI</th>
                  <th className="text-right px-6 py-4 font-medium text-gray-500">Kostnad (SEK)</th>
                </tr>
              </thead>
              <tbody>
                {monthly.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-600">
                      Ingen data de senaste 6 månaderna
                    </td>
                  </tr>
                ) : (
                  monthly.map((row) => (
                    <tr key={row.month} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white capitalize">
                        {formatMonth(row.month)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        {Math.round(row.deepgram_seconds)} sek
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        {row.azure_requests} req
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-white">
                        {formatSEK(row.total_cost_usd, sekRate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {monthly.length > 1 && (
                <tfoot>
                  <tr className="border-t border-white/[0.08] bg-white/[0.02]">
                    <td className="px-6 py-4 font-semibold text-white">Totalt</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-300">
                      {Math.round(monthly.reduce((s, m) => s + m.deepgram_seconds, 0))} sek
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-300">
                      {monthly.reduce((s, m) => s + m.azure_requests, 0)} req
                    </td>
                    <td className="px-6 py-4 text-right font-bold bg-gradient-to-r from-[#0F7FFF] to-[#c026d3] bg-clip-text text-transparent">
                      {totalSEK.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
