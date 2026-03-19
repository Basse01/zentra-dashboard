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
      className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#6366f1] transition-colors cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
