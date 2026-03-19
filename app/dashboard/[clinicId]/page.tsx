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
        {/* Back + title */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#6366f1] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a]">{clinicName}</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Totalt (6 mån): <span className="font-semibold text-[#1a1a1a]">{totalSEK.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Monthly table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f8f8]">
                <th className="text-left px-6 py-4 font-medium text-gray-500">Månad</th>
                <th className="text-right px-6 py-4 font-medium text-gray-500">Deepgram</th>
                <th className="text-right px-6 py-4 font-medium text-gray-500">Azure OpenAI</th>
                <th className="text-right px-6 py-4 font-medium text-gray-500">Kostnad (SEK)</th>
              </tr>
            </thead>
            <tbody>
              {monthly.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">
                    Ingen data de senaste 6 månaderna
                  </td>
                </tr>
              ) : (
                monthly.map((row) => (
                  <tr key={row.month} className="border-b border-gray-50 hover:bg-[#f8f8f8] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1a1a1a] capitalize">
                      {formatMonth(row.month)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {Math.round(row.deepgram_seconds)} sek
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {row.azure_requests} req
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a]">
                      {formatSEK(row.total_cost_usd, sekRate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {monthly.length > 1 && (
              <tfoot>
                <tr className="bg-[#f8f8f8] border-t border-gray-200">
                  <td className="px-6 py-4 font-semibold text-[#1a1a1a]">Totalt</td>
                  <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a]">
                    {Math.round(monthly.reduce((s, m) => s + m.deepgram_seconds, 0))} sek
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a]">
                    {monthly.reduce((s, m) => s + m.azure_requests, 0)} req
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[#6366f1]">
                    {totalSEK.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </main>
    </div>
  );
}
