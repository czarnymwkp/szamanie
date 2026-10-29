// Wspólne klasy panelu właściciela. Pola mają 16 px, żeby iPhone nie powiększał strony przy pisaniu.

/** Karta bez wewnętrznego odstępu — dla list z wierszami od krawędzi do krawędzi. */
export const kartaRamka = "rounded-2xl bg-karta shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.05)] ring-1 ring-obrys/60";

export const karta = `${kartaRamka} p-5`;

export const pole =
  "w-full rounded-xl border border-obrys-2 bg-white px-3.5 py-2.5 text-[16px] outline-none transition placeholder:text-tekst-2/60 focus:border-akcent focus:ring-2 focus:ring-akcent/30";

export const etykieta = "mb-1.5 block text-sm font-extrabold";

export const podpowiedz = "mt-1 text-xs text-tekst-2";

const przycisk =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-black transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

export const przyciskGlowny = `${przycisk} bg-akcent text-na-akcencie hover:-translate-y-0.5 hover:shadow-lg`;

export const przyciskDrugi = `${przycisk} border-2 border-tekst hover:bg-tekst hover:text-white`;

export const przyciskMaly =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-extrabold transition active:scale-[0.97] disabled:opacity-60";

export const komunikatBledu = "rounded-xl bg-zamkniete/10 px-4 py-3 text-sm font-bold text-zamkniete";

export const komunikatOk = "rounded-xl bg-otwarte/10 px-4 py-3 text-sm font-bold text-otwarte";
