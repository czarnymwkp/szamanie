"use client";

import { POLISH_DAYS, weekday, dayDescription, type Week } from "@/lib/godziny";
import { useNow } from "./useTeraz";

export default function HoursTable({ tydzien }: { tydzien: Week }) {
  const now = useNow();
  const today = now ? weekday(now) : -1;
  return (
    <table className="w-full text-sm">
      <tbody>
        {tydzien.map((ranges, d) => (
          <tr key={POLISH_DAYS[d]} className={d === today ? "font-bold" : ""}>
            <th scope="row" className="py-1 pr-4 text-left font-[inherit]">
              {POLISH_DAYS[d]}
            </th>
            <td className={`py-1 text-right ${ranges.length ? "" : "opacity-60"}`}>{dayDescription(ranges)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
