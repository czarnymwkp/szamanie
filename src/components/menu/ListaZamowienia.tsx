"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList, Phone, Share2, Trash2, Users, X } from "lucide-react";
import { renderSVG } from "uqr";
import { zl } from "@/lib/ceny";
import type { Dostawa } from "@/lib/menu";
import { linkTelefonu, odmiana } from "@/lib/nazwy";
import Licznik from "./Licznik";
import { ZNACZNIK, odkoduj, zakoduj } from "./razem";
import { ODBIOR, type ListaLokalu, type PozycjaListy } from "./useLista";

// imię do „Zamawiamy razem” pamiętamy w przeglądarce, żeby nie wpisywać go przy każdym zamówieniu
const IMIE = "szamanie:imie";
function czytajImie() {
  try {
    return localStorage.getItem(IMIE) ?? "";
  } catch {
    return "";
  }
}

const sumaPozycji = (pozycje: PozycjaListy[]) => pozycje.reduce((s, p) => s + (p.gr ?? 0) * p.ilosc, 0);

/**
 * Pasek „Twoja lista” na dole ekranu i okno z listą. Przy dzwonieniu lista przełącza się w „ściągawkę”:
 * duże litery, ekran nie gaśnie — żeby zamawiać z telefonu, a nie z kartki. „Zamawiamy razem”: kod QR i link
 * z listą, druga osoba dopisuje swoje i podaje dalej (razem.ts); na liście pozycje są wtedy pogrupowane po osobach.
 */
export default function ListaZamowienia({
  l,
  slug,
  dania,
  nazwa,
  telefon,
  dostawa,
}: {
  l: ListaLokalu;
  // bez nich (stare propozycje wyglądu) nie ma „Zamawiamy razem”
  slug?: string;
  dania?: Map<string, Omit<PozycjaListy, "ilosc" | "kto">>;
  nazwa: string;
  telefon: string | null;
  dostawa: Dostawa | null;
}) {
  const okno = useRef<HTMLDialogElement>(null);
  const [sciagawka, setSciagawka] = useState(false);
  const [razemOtwarte, setRazemOtwarte] = useState(false);
  const [imie, setImie] = useState("");
  const [skopiowano, setSkopiowano] = useState(false);
  const { lista, liczba, sumaGr } = l;

  // Link „Zamawiamy razem” (…#razem=…): przyjmujemy listę i od razu ją pokazujemy. Znacznik znika z adresu,
  // żeby odświeżenie strony nie wczytało jej drugi raz.
  useEffect(() => {
    if (!dania) return;
    const przyjmij = () => {
      if (!location.hash.startsWith(ZNACZNIK)) return;
      const dane = odkoduj(location.hash.slice(ZNACZNIK.length), (k) => dania.get(k));
      history.replaceState(null, "", location.pathname + location.search);
      if (!dane?.pozycje.length) return;
      l.przyjmijRazem(dane.pozycje, dane.uwagi, czytajImie());
      if (!okno.current?.open) okno.current?.showModal();
    };
    przyjmij();
    // link otwarty, gdy ta strona lokalu już jest otwarta — zmienia się tylko część po „#”, bez przeładowania
    window.addEventListener("hashchange", przyjmij);
    return () => window.removeEventListener("hashchange", przyjmij);
  }, [dania, l]);

  // Do dzwonienia i wysyłki te same dania od różnych osób idą razem („3 × Margherita”).
  const zebrane = [
    ...lista.pozycje
      .reduce((m, p) => {
        const z = m.get(p.klucz);
        return m.set(p.klucz, z ? { ...z, ilosc: z.ilosc + p.ilosc } : { ...p, kto: undefined });
      }, new Map<string, PozycjaListy>())
      .values(),
  ];
  // Pozycje innych osób (z linku) pogrupowane po imionach, moje na końcu; bez „Zamawiamy razem” — jedna lista.
  const osoby = [...new Set(lista.pozycje.flatMap((p) => (p.kto ? [p.kto] : [])))];
  const grupy = osoby.length
    ? [...osoby, undefined].map((kto) => ({ kto, pozycje: lista.pozycje.filter((p) => p.kto === kto) }))
    : [{ kto: undefined, pozycje: lista.pozycje }];
  const linkRazem =
    razemOtwarte && imie.trim()
      ? `${location.origin}/lokal/${slug}${ZNACZNIK}${zakoduj(lista.pozycje, lista.uwagi, imie.trim())}`
      : "";

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
      ...zebrane.map((p) => `${p.ilosc} × ${p.nazwa}${p.wariant ? ` (${p.wariant})` : ""}`),
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

  const wyslijRazem = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `Zamawiamy razem — ${nazwa}`, url: linkRazem });
      else {
        await navigator.clipboard.writeText(linkRazem);
        setSkopiowano(true);
        setTimeout(() => setSkopiowano(false), 2000);
      }
    } catch {}
  };

  const zamknij = () => {
    okno.current?.close();
    setSciagawka(false);
    setRazemOtwarte(false);
  };

  const wiersz = (p: PozycjaListy) => (
    <li key={`${p.kto ?? ""}|${p.klucz}`} className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="leading-snug font-extrabold">
          {p.nazwa}
          {p.wariant && <span className="font-bold text-tekst-2"> · {p.wariant}</span>}
        </p>
        <p className="text-sm font-bold text-tekst-2">{p.gr === null ? "cena w lokalu" : `${p.ilosc} × ${zl(p.gr)}`}</p>
      </div>
      <Licznik
        ile={p.ilosc}
        nazwa={p.nazwa}
        dodaj={() => l.zmienIlosc(p.klucz, 1, p.kto)}
        zmien={(o) => l.zmienIlosc(p.klucz, o, p.kto)}
      />
    </li>
  );

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
        onClose={() => {
          setSciagawka(false);
          setRazemOtwarte(false);
        }}
        className="mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-tlo p-0 text-tekst shadow-2xl backdrop:bg-black/55 open:flex open:animate-wysun open:flex-col sm:m-auto sm:max-w-lg sm:rounded-[1.75rem]"
      >
        <div className="flex items-center gap-3 border-b border-obrys px-5 py-4">
          {sciagawka ? (
            <button type="button" onClick={() => setSciagawka(false)} className="flex items-center gap-1.5 text-sm font-extrabold">
              <ArrowLeft className="size-4" aria-hidden /> Edytuj listę
            </button>
          ) : razemOtwarte ? (
            <h2 className="flex items-center gap-2 font-grotesk text-xl font-bold">
              <button type="button" onClick={() => setRazemOtwarte(false)} aria-label="Wróć do listy" className="-ml-1 flex size-8 items-center justify-center">
                <ArrowLeft className="size-5" aria-hidden />
              </button>
              Zamawiamy razem
            </h2>
          ) : (
            <h2 className="flex items-center gap-2 font-grotesk text-xl font-bold">
              <ClipboardList className="size-5 text-akcent-tekst" aria-hidden /> Twoja lista
            </h2>
          )}
          {/* w nagłówku, nie w stopce: na małych telefonach (iPhone mini) stopka z trzema rzędami zjadała pół okna */}
          {!sciagawka && !razemOtwarte && slug && (
            <button
              type="button"
              onClick={() => {
                setImie((i) => i || czytajImie());
                setRazemOtwarte(true);
              }}
              className="ml-auto flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-tekst px-3 text-sm font-extrabold"
            >
              <Users className="size-4" aria-hidden /> Razem
            </button>
          )}
          <button
            type="button"
            onClick={zamknij}
            aria-label="Zamknij"
            className={`${!sciagawka && !razemOtwarte && slug ? "" : "ml-auto"} flex size-9 shrink-0 items-center justify-center rounded-full bg-krem`}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {sciagawka ? (
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <p className="text-sm font-extrabold text-tekst-2 uppercase">Zamawiasz w: {nazwa}</p>
            <ul className="mt-4 space-y-3">
              {zebrane.map((p) => (
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
        ) : razemOtwarte ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-sm font-semibold text-tekst-2">
              Druga osoba skanuje kod aparatem (albo dostaje link), dopisuje swoje i podaje dalej. Ostatnia dzwoni.
            </p>
            <label className="mt-3 block">
              <span className="text-sm font-extrabold">Twoje imię</span>
              <input
                value={imie}
                onChange={(e) => {
                  setImie(e.target.value);
                  try {
                    localStorage.setItem(IMIE, e.target.value.trim());
                  } catch {}
                }}
                maxLength={30}
                placeholder="np. Ania"
                className="mt-1 h-12 w-full rounded-2xl border-[1.5px] border-obrys-2 bg-karta px-4 font-bold outline-none focus:border-tekst"
              />
            </label>
            {linkRazem ? (
              <>
                {/* SVG z biblioteki uqr — same kwadraty kodu, bez tekstu z zewnątrz */}
                <div
                  role="img"
                  aria-label="Kod QR z listą do zamówienia"
                  // na niskich ekranach mniejszy, żeby cały był widać nad przyciskiem „Wyślij link”
                  className="mx-auto mt-4 w-[min(15rem,30dvh)] max-w-full rounded-2xl bg-white p-2 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: renderSVG(linkRazem, { border: 1 }) }}
                />
                <p className="mt-2 text-center text-xs font-bold text-tekst-2">
                  {liczba} {odmiana(liczba, ["pozycja", "pozycje", "pozycji"])} od: {[...osoby.filter((o) => o !== imie.trim()), imie.trim()].join(", ")}
                </p>
              </>
            ) : (
              <p className="mt-4 rounded-2xl bg-krem p-4 text-sm font-bold">
                Wpisz imię — inni zobaczą, które dania są Twoje.
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <p className="pt-3 text-sm font-bold text-tekst-2">{nazwa}</p>
            {grupy.map((g) =>
              osoby.length ? (
                <section key={g.kto ?? ""} className="mt-3">
                  <h3 className="flex justify-between border-b-2 border-tekst pb-1 text-sm font-black">
                    <span>{g.kto ?? "Ty"}</span>
                    {sumaPozycji(g.pozycje) > 0 && <span>{zl(sumaPozycji(g.pozycje))}</span>}
                  </h3>
                  {g.pozycje.length ? (
                    <ul className="divide-y divide-obrys">{g.pozycje.map(wiersz)}</ul>
                  ) : (
                    <p className="py-3 text-sm font-semibold text-tekst-2">Dodaj swoje dania przyciskiem + w menu.</p>
                  )}
                </section>
              ) : (
                <ul key="lista" className="divide-y divide-obrys">
                  {g.pozycje.map(wiersz)}
                </ul>
              ),
            )}

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
          {razemOtwarte ? (
            <button
              type="button"
              onClick={wyslijRazem}
              disabled={!linkRazem}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-akcent text-lg font-black text-na-akcencie transition active:scale-[0.98] disabled:opacity-40"
            >
              <Share2 className="size-5" aria-hidden /> {skopiowano ? "Link skopiowany" : "Wyślij link"}
            </button>
          ) : telefon ? (
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
          {!sciagawka && !razemOtwarte && (
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
