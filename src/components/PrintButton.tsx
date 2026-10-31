"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ tekst }: { tekst: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-tekst px-5 font-black text-white active:scale-95"
    >
      <Printer className="size-5" aria-hidden />
      {tekst}
    </button>
  );
}
