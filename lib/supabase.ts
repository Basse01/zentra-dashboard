const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const headers = {
  "Content-Type": "application/json",
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
};

export type Clinic = { id: string; name: string };
export type UsageRow = {
  clinic_id: string;
  service: string;
  input_units: number;
  output_units: number;
  estimated_cost_usd: number;
  created_at: string;
};
export type AggregatedClinic = {
  clinic_id: string;
  name: string;
  deepgram_seconds: number;
  azure_requests: number;
  total_cost_usd: number;
};
export type MonthlyRow = {
  month: string; // "2026-03"
  deepgram_seconds: number;
  azure_requests: number;
  total_cost_usd: number;
};

export async function getClinics(): Promise<Clinic[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clinics?select=id,name&order=name`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getMonthUsage(year: number, month: number): Promise<UsageRow[]> {
  const start = `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00.000Z`;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clinic_usage?select=clinic_id,service,input_units,output_units,estimated_cost_usd&created_at=gte.${start}&created_at=lt.${end}`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getClinicHistory(clinicId: string, months = 6): Promise<UsageRow[]> {
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clinic_usage?select=service,input_units,output_units,estimated_cost_usd,created_at&clinic_id=eq.${clinicId}&created_at=gte.${start.toISOString()}&order=created_at.asc`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export function aggregateByClinic(rows: UsageRow[], clinics: Clinic[]): AggregatedClinic[] {
  const map: Record<string, AggregatedClinic> = {};

  for (const clinic of clinics) {
    map[clinic.id] = {
      clinic_id: clinic.id,
      name: clinic.name,
      deepgram_seconds: 0,
      azure_requests: 0,
      total_cost_usd: 0,
    };
  }

  for (const row of rows) {
    if (!map[row.clinic_id]) continue;
    map[row.clinic_id].total_cost_usd += row.estimated_cost_usd;
    if (row.service === "deepgram") {
      map[row.clinic_id].deepgram_seconds += row.input_units;
    } else {
      map[row.clinic_id].azure_requests += 1;
    }
  }

  return Object.values(map);
}

export function aggregateByMonth(rows: UsageRow[]): MonthlyRow[] {
  const map: Record<string, MonthlyRow> = {};

  for (const row of rows) {
    const month = row.created_at.slice(0, 7); // "2026-03"
    if (!map[month]) {
      map[month] = { month, deepgram_seconds: 0, azure_requests: 0, total_cost_usd: 0 };
    }
    map[month].total_cost_usd += row.estimated_cost_usd;
    if (row.service === "deepgram") {
      map[month].deepgram_seconds += row.input_units;
    } else {
      map[month].azure_requests += 1;
    }
  }

  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

export async function getSEKRate(): Promise<number> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=SEK", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.rates.SEK as number;
  } catch {
    return 10.5;
  }
}

export function formatSEK(usd: number, rate: number): string {
  return (usd * rate).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 });
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
}
