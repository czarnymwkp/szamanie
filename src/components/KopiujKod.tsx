"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Pole z kodem do wklejenia i przycisk „Kopiuj”. */
export default function KopiujKod({ kod, etykieta }: { kod: string; etykieta: string }) {
  const [skopiowane, setSkopiowane] = useState(false);
  return (
    <div>
      <textarea
        readOnly
        value={kod}
        aria-label={etykieta}
        rows={4}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full resize-none rounded-xl border-[1.5px] border-obrys-2 bg-white p-3 font-mono text-xs"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(kod);
            setSkopiowane(true);
            setTimeout(() => setSkopiowane(false), 2000);
          } catch {
            // brak dostępu do schowka — kod można zaznaczyć w polu
          }
        }}
        className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-tekst px-4 text-sm font-black text-white active:scale-95"
      >
        {skopiowane ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {skopiowane ? "Skopiowane" : "Kopiuj kod"}
      </button>
    </div>
  );
}
