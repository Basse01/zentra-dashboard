"use client";

import { useRouter, usePathname } from "next/navigation";

export default function MonthSelector({
  options,
  selected,
}: {
  options: { value: string; label: string }[];
  selected: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={selected}
      onChange={(e) => router.push(`${pathname}?month=${e.target.value}`)}
      className="px-4 py-2 bg-[#0d0d1a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#0F7FFF] transition-colors cursor-pointer appearance-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0d0d1a]">
          {o.label}
        </option>
      ))}
    </select>
  );
}
