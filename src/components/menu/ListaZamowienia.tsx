"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList, Phone, Share2, Trash2, X } from "lucide-react";
import { zl } from "@/lib/ceny";
import type { Dostawa } from "@/lib/menu";
import { linkTelefonu } from "@/lib/nazwy";
import Licznik from "./Licznik";
import { ODBIOR, type ListaLokalu } from "./useLista";

/**
 * Pasek „Twoja lista” na dole ekranu i okno z listą. Przy dzwonieniu lista przełącza się w „ściągawkę”:
 * duże litery, ekran nie gaśnie — żeby zamawiać z telefonu, a nie z kartki.
 */
export default function ListaZamowienia({
  l,
  nazwa,
  telefon,
  dostawa,
}: {
  l: ListaLokalu;
  nazwa: string;
  telefon: string | null;
  dostawa: Dostawa | null;
}) {
  const okno = useRef<HTMLDialogElement>(null);
  const [sciagawka, setSciagawka] = useState(false);
  const [skopiowano, setSkopiowano] = useState(false);
  const { lista, liczba, sumaGr } = l;

  const strefa = dostawa?.strefy.find((s) => s.nazwa === lista.strefa) ?? null;
  const odbior = lista.strefa === ODBIOR;
  const kosztDostawy = strefa?.cenaGr ?? 0;
  const brakDoMinimum = strefa?.minGr && sumaGr < strefa.minGr ? strefa.minGr - sumaGr : 0;
  const razem = sumaGr + kosztDostawy;

  // Pasek zasłaniałby dół strony — robimy mu miejsce.
  useEffect(() => {
    document.body.style.paddingBottom = liczba ? "6rem" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [liczba]);

  // Ściągawka: ekran nie gaśnie w czasie rozmowy (po powrocie do przeglądarki blokadę trzeba wziąć ponownie).
  useEffect(() => {
    if (!sciagawka || !("wakeLock" in navigator)) return;
    let blokada: WakeLockSentinel | null = null;
    const wez = () => {
      if (document.visibilityState === "visible") {
        navigator.wakeLock.request("screen").then((b) => (blokada = b), () => {});
      }
    };
    wez();
    document.addEventListener("visibilitychange", wez);
    return () => {
      document.removeEventListener("visibilitychange", wez);
      blokada?.release().catch(() => {});
    };
  }, [sciagawka]);

  const tekst = () =>
    [
      `Zamówienie — ${nazwa}`,
      ...lista.pozycje.map((p) => `${p.ilosc} × ${p.nazwa}${p.wariant ? ` (${p.wariant})` : ""}`),
      lista.uwagi && `Uwagi: ${lista.uwagi}`,
      strefa ? `Dostawa: ${strefa.nazwa}` : odbior ? "Odbiór osobisty" : "",
      sumaGr ? `Razem ok. ${zl(razem)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const udostepnij = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `Zamówienie — ${nazwa}`, text: tekst() });
      else {
        await navigator.clipboard.writeText(tekst());
        setSkopiowano(true);
        setTimeout(() => setSkopiowano(false), 2000);
      }
    } catch {}
  };

  const zamknij = () => {
    okno.current?.close();
    setSciagawka(false);
  };

  return (
    <>
      {liczba > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => okno.current?.showModal()}
            className="pointer-events-auto mx-auto flex w-full max-w-md animate-wjazd items-center gap-3 rounded-full bg-tekst py-2.5 pr-5 pl-2.5 text-tlo shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition active:scale-[0.98]"
          >
            <span key={liczba} className="flex size-10 animate-kolysanie items-center justify-center rounded-full bg-akcent font-black text-na-akcencie">
              {liczba}
            </span>
            <span className="flex-1 text-left font-extrabold">Twoja lista do zamówienia</span>
            {sumaGr > 0 && <span className="font-black">{zl(sumaGr)}</span>}
          </button>
        </div>
      )}

      <dialog
        ref={okno}
        aria-label="Twoja lista do zamówienia"
        onClick={(e) => e.target === e.currentTarget && zamknij()}
        onClose={() => setSciagawka(false)}
        className="mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-tlo p-0 text-tekst shadow-2xl backdrop:bg-black/55 open:flex open:animate-wysun open:flex-col sm:m-auto sm:max-w-lg sm:rounded-[1.75rem]"
      >
        <div className="flex items-center gap-3 border-b border-obrys px-5 py-4">
          {sciagawka ? (
            <button type="button" onClick={() => setSciagawka(false)} className="flex items-center gap-1.5 text-sm font-extrabold">
              <ArrowLeft className="size-4" aria-hidden /> Edytuj listę
            </button>
          ) : (
            <h2 className="flex items-center gap-2 font-grotesk text-xl font-bold">
              <ClipboardList className="size-5 text-akcent-tekst" aria-hidden /> Twoja lista
            </h2>
          )}
          <button type="button" onClick={zamknij} aria-label="Zamknij" className="ml-auto flex size-9 items-center justify-center rounded-full bg-krem">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {sciagawka ? (
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <p className="text-sm font-extrabold text-tekst-2 uppercase">Zamawiasz w: {nazwa}</p>
            <ul className="mt-4 space-y-3">
              {lista.pozycje.map((p) => (
                <li key={p.klucz} className="text-[1.75rem] leading-tight font-black">
                  <span className="text-akcent-tekst">{p.ilosc} ×</span> {p.nazwa}
                  {p.wariant && <span className="font-bold text-tekst-2"> ({p.wariant})</span>}
                </li>
              ))}
            </ul>
            {lista.uwagi && <p className="mt-5 rounded-2xl bg-krem p-4 text-xl font-bold">Uwagi: {lista.uwagi}</p>}
            <p className="mt-5 text-xl font-extrabold">
              {strefa ? `Dostawa: ${strefa.nazwa}` : odbior ? "Odbiór osobisty" : ""}
            </p>
            {sumaGr > 0 && <p className="mt-1 text-xl font-extrabold">Razem ok. {zl(razem)}</p>}
            <p className="mt-6 text-xs font-semibold text-tekst-2">Ekran nie zgaśnie, dopóki ta lista jest otwarta.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <p className="pt-3 text-sm font-bold text-tekst-2">{nazwa}</p>
            <ul className="divide-y divide-obrys">
              {lista.pozycje.map((p) => (
                <li key={p.klucz} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug font-extrabold">
                      {p.nazwa}
                      {p.wariant && <span className="font-bold text-tekst-2"> · {p.wariant}</span>}
                    </p>
                    <p className="text-sm font-bold text-tekst-2">
                      {p.gr === null ? "cena w lokalu" : `${p.ilosc} × ${zl(p.gr)}`}
                    </p>
                  </div>
                  <Licznik
                    ile={p.ilosc}
                    nazwa={p.nazwa}
                    dodaj={() => l.zmienIlosc(p.klucz, 1)}
                    zmien={(o) => l.zmienIlosc(p.klucz, o)}
                  />
                </li>
              ))}
            </ul>

            <label className="mt-3 block">
              <span className="text-sm font-extrabold">Uwagi do zamówienia</span>
              <textarea
                value={lista.uwagi}
                onChange={(e) => l.ustawUwagi(e.target.value)}
                rows={2}
                placeholder="np. bez cebuli, sos osobno, odbiór o 18:30"
                className="mt-1 w-full resize-none rounded-2xl border-[1.5px] border-obrys-2 bg-karta px-4 py-3 font-semibold outline-none focus:border-tekst"
              />
            </label>

            {dostawa && (
              <label className="mt-3 block">
                <span className="text-sm font-extrabold">Dostawa</span>
                <select
                  value={lista.strefa ?? ""}
                  onChange={(e) => l.ustawStrefe(e.target.value || null)}
                  className="mt-1 h-12 w-full rounded-2xl border-[1.5px] border-obrys-2 bg-karta px-4 font-bold outline-none focus:border-tekst"
                >
                  <option value="">Wybierz miejscowość…</option>
                  <option value={ODBIOR}>Odbiór osobisty</option>
                  {dostawa.strefy.map((s) => (
                    <option key={s.nazwa} value={s.nazwa}>
                      {s.nazwa}
                      {s.cenaGr !== null ? ` — ${s.cenaGr ? zl(s.cenaGr) : "gratis"}` : ""}
                      {s.minGr ? `, min. ${zl(s.minGr)}` : ""}
                    </option>
                  ))}
                </select>
                {brakDoMinimum > 0 && (
                  <span className="mt-1.5 block text-sm font-extrabold text-zamkniete">
                    Do minimalnego zamówienia brakuje {zl(brakDoMinimum)}.
                  </span>
                )}
              </label>
            )}

            {sumaGr > 0 && (
              <dl className="mt-4 space-y-1 rounded-2xl bg-karta p-4 text-sm font-bold">
                <div className="flex justify-between">
                  <dt className="text-tekst-2">Dania</dt>
                  <dd>{zl(sumaGr)}</dd>
                </div>
                {strefa && (
                  <div className="flex justify-between">
                    <dt className="text-tekst-2">Dostawa</dt>
                    <dd>{strefa.cenaGr === null ? "zapytaj" : strefa.cenaGr ? zl(strefa.cenaGr) : "gratis"}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-lg font-black">
                  <dt>Razem ok.</dt>
                  <dd>{zl(razem)}</dd>
                </div>
                {l.bezCeny && <p className="text-xs text-tekst-2">Część pozycji nie ma ceny — doliczy lokal.</p>}
              </dl>
            )}
            <p className="mt-2 text-xs font-semibold text-tekst-2">
              To Twoja ściągawka, nie zamówienie — lokal przyjmuje zamówienia przez telefon.
            </p>
          </div>
        )}

        <div className="space-y-2 border-t border-obrys bg-tlo px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {telefon ? (
            <a
              href={linkTelefonu(telefon)}
              onClick={() => setSciagawka(true)}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-akcent text-lg font-black text-na-akcencie transition active:scale-[0.98]"
            >
              <Phone className="size-5" aria-hidden /> Zadzwoń i zamów
            </a>
          ) : (
            <p className="text-center text-sm font-bold text-tekst-2">Lokal nie podał telefonu — zamówisz na miejscu.</p>
          )}
          {!sciagawka && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSciagawka(true)}
                className="flex h-11 flex-1 items-center justify-center rounded-full border-[1.5px] border-tekst text-sm font-extrabold"
              >
                Duże litery
              </button>
              <button
                type="button"
                onClick={udostepnij}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-tekst text-sm font-extrabold"
              >
                <Share2 className="size-4" aria-hidden /> {skopiowano ? "Skopiowano" : "Wyślij"}
              </button>
              <button
                type="button"
                onClick={() => {
                  l.wyczysc();
                  zamknij();
                }}
                aria-label="Wyczyść listę"
                className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-obrys-2 text-tekst-2"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
