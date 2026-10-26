"use client";

import { DNI_PL, dzienTygodnia, opisDnia, type Tydzien } from "@/lib/godziny";
import { useTeraz } from "./useTeraz";

export default function TabelaGodzin({ tydzien }: { tydzien: Tydzien }) {
  const teraz = useTeraz();
  const dzis = teraz ? dzienTygodnia(teraz) : -1;
  return (
    <table className="w-full text-sm">
      <tbody>
        {tydzien.map((przedzialy, d) => (
          <tr key={DNI_PL[d]} className={d === dzis ? "font-bold" : ""}>
            <th scope="row" className="py-1 pr-4 text-left font-[inherit]">
              {DNI_PL[d]}
            </th>
            <td className={`py-1 text-right ${przedzialy.length ? "" : "opacity-60"}`}>{opisDnia(przedzialy)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
