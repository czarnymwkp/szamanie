"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList, Copy, Phone, Share2, Trash2, Users, X } from "lucide-react";
import { renderSVG } from "uqr";
import { hand } from "@/components/sketch/sketch";
import { formatPln } from "@/lib/prices";
import type { Delivery } from "@/lib/menu";
import { phoneUrl, plural } from "@/lib/format";
import Counter from "./Counter";
import { MARKER, decode, encode } from "./groupOrder";
import { PICKUP, type VenueOrderList, type ListItem } from "./useOrderList";

// the name for „Zamawiamy razem” is remembered in the browser, so it does not have to be typed for every order
const NAME_KEY = "szamanie:imie";
function readName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

// the „Zamawiasz z kimś?” tip is shown once: after closing it or using „Razem” it never comes back
const TIP_SEEN_KEY = "szamanie:dymek-razem";
function tipSeen() {
  try {
    return localStorage.getItem(TIP_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}
function rememberTip() {
  try {
    localStorage.setItem(TIP_SEEN_KEY, "1");
  } catch {}
}

const itemsSum = (items: ListItem[]) => items.reduce((s, p) => s + (p.gr ?? 0) * p.ilosc, 0);

/**
 * The „Twoja lista” bar at the bottom of the screen and the list dialog. While calling, the list switches to a „cheat
 * sheet”: big letters, the screen stays on — so people order from the phone, not from a slip of paper. „Zamawiamy
 * razem”: a QR code and a link with the list; the next person adds their dishes and passes it on (groupOrder.ts); the
 * list then groups items by person.
 */
export default function OrderListDialog({
  l,
  slug,
  dania,
  nazwa,
  telefon,
  dostawa,
}: {
  l: VenueOrderList;
  // without them there is no „Zamawiamy razem”
  slug?: string;
  dania?: Map<string, Omit<ListItem, "ilosc" | "kto">>;
  nazwa: string;
  telefon: string | null;
  dostawa: Delivery | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sciagawka, setSciagawka] = useState(false);
  const [razemOtwarte, setRazemOtwarte] = useState(false);
  const [imie, setImie] = useState("");
  const [skopiowano, setSkopiowano] = useState(false);
  const [dymekZamkniety, setDymekZamkniety] = useState(false);
  const { lista, liczba, sumaGr } = l;

  // „Zamawiamy razem” link (…#razem=…): we take the list and show it right away. The marker is removed from the URL, so
  // a page refresh does not load it a second time.
  useEffect(() => {
    if (!dania) return;
    const acceptLink = () => {
      if (!location.hash.startsWith(MARKER)) return;
      const date = decode(location.hash.slice(MARKER.length), dania);
      history.replaceState(null, "", location.pathname + location.search);
      if (!date?.pozycje.length) return;
      l.przyjmijRazem(date.pozycje, date.uwagi, readName());
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    };
    acceptLink();
    // link opened while this venue page is already open — only the part after „#” changes, without a reload
    window.addEventListener("hashchange", acceptLink);
    return () => window.removeEventListener("hashchange", acceptLink);
  }, [dania, l]);

  // For calling and sending, the same dishes from different people are merged („3 × Margherita”).
  const merged = [
    ...lista.pozycje
      .reduce((m, p) => {
        const z = m.get(p.klucz);
        return m.set(p.klucz, z ? { ...z, ilosc: z.ilosc + p.ilosc } : { ...p, kto: undefined });
      }, new Map<string, ListItem>())
      .values(),
  ];
  // Other people's items (from a link) grouped by name, mine last; without „Zamawiamy razem” — a single list.
  const people = [...new Set(lista.pozycje.flatMap((p) => (p.kto ? [p.kto] : [])))];
  const groups = people.length
    ? [...people, undefined].map((who) => ({ kto: who, pozycje: lista.pozycje.filter((p) => p.kto === who) }))
    : [{ kto: undefined, pozycje: lista.pozycje }];
  const link = (who: string) => `${location.origin}/lokal/${slug}${MARKER}${encode(lista.pozycje, lista.uwagi, who)}`;
  const groupLink = razemOtwarte && imie.trim() ? link(imie.trim()) : "";

  const zone = dostawa?.strefy.find((s) => s.nazwa === lista.strefa) ?? null;
  const pickup = lista.strefa === PICKUP;
  const deliveryCost = zone?.cenaGr ?? 0;
  const missingToMinimum = zone?.minGr && sumaGr < zone.minGr ? zone.minGr - sumaGr : 0;
  const total = sumaGr + deliveryCost;

  // After the first dish a tip above the bar suggests „Zamawiamy razem” — only once, and not to someone who received
  // the list by link (it then has other people's items). count > 0 happens only in the browser, so localStorage is read
  // only then, and the server render matches the first browser render.
  const showTip =
    liczba > 0 && !!slug && !dymekZamkniety && !lista.pozycje.some((p) => p.kto) && !tipSeen();
  const closeTip = () => {
    rememberTip();
    setDymekZamkniety(true);
  };
  const openGroup = () => {
    closeTip();
    setImie((i) => i || readName());
    setRazemOtwarte(true);
  };

  // The bar (and the tip above it) would cover the bottom of the page — we make room for it.
  useEffect(() => {
    document.body.style.paddingBottom = liczba ? (showTip ? "12rem" : "6rem") : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [liczba, showTip]);

  // Cheat sheet: the screen stays on during the call (after returning to the browser the lock has to be acquired
  // again).
  useEffect(() => {
    if (!sciagawka || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const acquire = () => {
      if (document.visibilityState === "visible") {
        navigator.wakeLock.request("screen").then((b) => (lock = b), () => {});
      }
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => {});
    };
  }, [sciagawka]);

  const text = () =>
    [
      `Zamówienie — ${nazwa}`,
      ...merged.map((p) => `${p.ilosc} × ${p.nazwa}${p.wariant ? ` (${p.wariant})` : ""}`),
      lista.uwagi && `Uwagi: ${lista.uwagi}`,
      zone ? `Dostawa: ${zone.nazwa}` : pickup ? "Odbiór osobisty" : "",
      sumaGr ? `Razem ok. ${formatPln(total)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const send = async (title: string, message: string) => {
    try {
      if (navigator.share) await navigator.share({ title: title, text: message });
      else {
        await navigator.clipboard.writeText(message);
        setSkopiowano(true);
        setTimeout(() => setSkopiowano(false), 2000);
      }
    } catch {}
  };
  // the link goes in the message text, not in a separate „url” field: some apps (Messenger, SMS) take only the text
  const sendGroupLink = (who: string) =>
    send(`Zamawiamy razem — ${nazwa}`, `Zamawiamy razem w ${nazwa} — dopisz swoje dania: ${link(who)}`);

  // Bottom „Wyślij”: a link for adding dishes (like „Zamawiamy razem”) instead of the plain list text. Without a saved
  // name, the „Razem” screen first, to enter it; without a slug — the list text as before.
  const share = () => {
    if (!slug) return send(`Zamówienie — ${nazwa}`, text());
    const who = readName();
    if (who) return sendGroupLink(who);
    openGroup();
  };

  // The QR code image to the clipboard (to paste in a chat); when the phone does not accept images in the clipboard — a
  // PNG file.
  const [kodQr, setKodQr] = useState("");
  const copyQrCode = async () => {
    const address = URL.createObjectURL(new Blob([renderSVG(groupLink, { border: 2 })], { type: "image/svg+xml" }));
    const png = new Promise<Blob>((done, error) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 600;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 0, 0, 600, 600);
        URL.revokeObjectURL(address);
        canvas.toBlob((b) => (b ? done(b) : error(new Error("png"))), "image/png");
      };
      img.onerror = error;
      img.src = address;
    });
    const show = (caption: string) => {
      setKodQr(caption);
      setTimeout(() => setKodQr(""), 2500);
    };
    try {
      // Safari wants the promise right away, still within the same click
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      show("Kod skopiowany — wklej go w wiadomości");
    } catch {
      try {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(await png);
        a.download = `zamawiamy-razem-${slug}.png`;
        a.click();
        show("Kod zapisany jako obrazek");
      } catch {}
    }
  };

  const close = () => {
    dialogRef.current?.close();
    setSciagawka(false);
    setRazemOtwarte(false);
  };

  const row = (p: ListItem) => (
    <li key={`${p.kto ?? ""}|${p.klucz}`} className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="leading-snug font-extrabold">
          {p.nazwa}
          {p.wariant && <span className="font-bold text-tekst-2"> · {p.wariant}</span>}
        </p>
        <p className="text-sm font-bold text-tekst-2">{p.gr === null ? "cena w lokalu" : `${p.ilosc} × ${formatPln(p.gr)}`}</p>
      </div>
      <Counter
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
          {showTip && (
            <div className="pointer-events-auto relative mx-auto mb-4 w-full max-w-md animate-wjazd">
              <button
                type="button"
                onClick={() => {
                  openGroup();
                  dialogRef.current?.showModal();
                }}
                className="block w-full rotate-[-1.5deg] rounded-2xl border-[2.5px] border-tekst bg-karta py-3 pr-10 pl-4 text-left text-tekst shadow-[4px_4px_0_#1d1b19]"
              >
                <span className={`${hand.className} block text-[1.4rem] leading-tight`}>
                  Zamawiasz z kimś? Pokaż kod QR albo wyślij link — każdy doda swoje ze swojego telefonu!
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-akcent-tekst">
                  <Users className="size-4" aria-hidden /> Kod QR albo link
                </span>
                {/* the tip's tail pointing at the bar */}
                <span aria-hidden className="absolute -bottom-[11px] left-10 size-5 rotate-45 border-r-[2.5px] border-b-[2.5px] border-tekst bg-karta" />
              </button>
              <button
                type="button"
                onClick={closeTip}
                aria-label="Zamknij podpowiedź"
                className="absolute top-1 right-1 flex size-9 items-center justify-center text-tekst"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="pointer-events-auto mx-auto flex w-full max-w-md animate-wjazd items-center gap-3 rounded-full bg-tekst py-2.5 pr-5 pl-2.5 text-tlo shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition active:scale-[0.98]"
          >
            <span key={liczba} className="flex size-10 animate-kolysanie items-center justify-center rounded-full bg-akcent font-black text-na-akcencie">
              {liczba}
            </span>
            <span className="flex-1 text-left font-extrabold">Twoja lista do zamówienia</span>
            {sumaGr > 0 && <span className="font-black">{formatPln(sumaGr)}</span>}
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Twoja lista do zamówienia"
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => {
          setSciagawka(false);
          setRazemOtwarte(false);
        }}
        className="mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-tlo p-0 text-tekst shadow-2xl backdrop:bg-black/55 open:flex open:animate-wysun open:flex-col sm:m-auto sm:max-w-lg sm:rounded-[1.75rem]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-obrys px-5 py-4">
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
          {/* in the header, not the footer: on small phones (iPhone mini) a footer with three rows of buttons took half the dialog */}
          {!sciagawka && !razemOtwarte && slug && (
            <button
              type="button"
              onClick={openGroup}
              className="ml-auto flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-tekst px-3 text-sm font-extrabold"
            >
              <Users className="size-4" aria-hidden /> Razem
            </button>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Zamknij"
            className={`${!sciagawka && !razemOtwarte && slug ? "" : "ml-auto"} flex size-9 shrink-0 items-center justify-center rounded-full bg-krem`}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {sciagawka ? (
          // flex-auto, not flex-1: Safari on iPhone takes „grow from zero” literally, and a dialog without a height
          // squeezed the middle to nothing (only the header and the button were visible); starting from the content
          // height and shrinking to the screen works everywhere
          <div className="min-h-0 flex-auto overflow-y-auto px-5 py-6">
            <p className="text-sm font-extrabold text-tekst-2 uppercase">Zamawiasz w: {nazwa}</p>
            <ul className="mt-4 space-y-3">
              {merged.map((p) => (
                <li key={p.klucz} className="text-[1.75rem] leading-tight font-black">
                  <span className="text-akcent-tekst">{p.ilosc} ×</span> {p.nazwa}
                  {p.wariant && <span className="font-bold text-tekst-2"> ({p.wariant})</span>}
                </li>
              ))}
            </ul>
            {lista.uwagi && <p className="mt-5 rounded-2xl bg-krem p-4 text-xl font-bold">Uwagi: {lista.uwagi}</p>}
            <p className="mt-5 text-xl font-extrabold">
              {zone ? `Dostawa: ${zone.nazwa}` : pickup ? "Odbiór osobisty" : ""}
            </p>
            {sumaGr > 0 && <p className="mt-1 text-xl font-extrabold">Razem ok. {formatPln(total)}</p>}
            <p className="mt-6 text-xs font-semibold text-tekst-2">Ekran nie zgaśnie, dopóki ta lista jest otwarta.</p>
          </div>
        ) : razemOtwarte ? (
          <div className="min-h-0 flex-auto overflow-y-auto px-5 py-4">
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
                    localStorage.setItem(NAME_KEY, e.target.value.trim());
                  } catch {}
                }}
                maxLength={30}
                placeholder="np. Ania"
                className="mt-1 h-12 w-full rounded-2xl border-[1.5px] border-obrys-2 bg-karta px-4 font-bold outline-none focus:border-tekst"
              />
            </label>
            {groupLink ? (
              <>
                {/* SVG from the uqr library — just the code's squares, no external text */}
                <div
                  role="img"
                  aria-label="Kod QR z listą do zamówienia"
                  // smaller on short screens, so the whole code is visible above the „Wyślij link” button
                  className="mx-auto mt-4 w-[min(15rem,30dvh)] max-w-full rounded-2xl bg-white p-2 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: renderSVG(groupLink, { border: 1 }) }}
                />
                <p className="mt-2 text-center text-xs font-bold text-tekst-2">
                  {liczba} {plural(liczba, ["pozycja", "pozycje", "pozycji"])} od: {[...people.filter((o) => o !== imie.trim()), imie.trim()].join(", ")}
                </p>
                <button
                  type="button"
                  onClick={copyQrCode}
                  className="mx-auto mt-2 flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-tekst px-3.5 text-sm font-extrabold"
                >
                  <Copy className="size-4" aria-hidden /> {kodQr || "Kopiuj kod QR"}
                </button>
              </>
            ) : (
              <p className="mt-4 rounded-2xl bg-krem p-4 text-sm font-bold">
                Wpisz imię — inni zobaczą, które dania są Twoje.
              </p>
            )}
          </div>
        ) : (
          <div className="min-h-0 flex-auto overflow-y-auto px-5 pb-4">
            <p className="pt-3 text-sm font-bold text-tekst-2">{nazwa}</p>
            {groups.map((g) =>
              people.length ? (
                <section key={g.kto ?? ""} className="mt-3">
                  <h3 className="flex justify-between border-b-2 border-tekst pb-1 text-sm font-black">
                    <span>{g.kto ?? "Ty"}</span>
                    {itemsSum(g.pozycje) > 0 && <span>{formatPln(itemsSum(g.pozycje))}</span>}
                  </h3>
                  {g.pozycje.length ? (
                    <ul className="divide-y divide-obrys">{g.pozycje.map(row)}</ul>
                  ) : (
                    <p className="py-3 text-sm font-semibold text-tekst-2">Dodaj swoje dania przyciskiem + w menu.</p>
                  )}
                </section>
              ) : (
                <ul key="lista" className="divide-y divide-obrys">
                  {g.pozycje.map(row)}
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
                  <option value={PICKUP}>Odbiór osobisty</option>
                  {dostawa.strefy.map((s) => (
                    <option key={s.nazwa} value={s.nazwa}>
                      {s.nazwa}
                      {s.cenaGr !== null ? ` — ${s.cenaGr ? formatPln(s.cenaGr) : "gratis"}` : ""}
                      {s.minGr ? `, min. ${formatPln(s.minGr)}` : ""}
                    </option>
                  ))}
                </select>
                {missingToMinimum > 0 && (
                  <span className="mt-1.5 block text-sm font-extrabold text-zamkniete">
                    Do minimalnego zamówienia brakuje {formatPln(missingToMinimum)}.
                  </span>
                )}
              </label>
            )}

            {sumaGr > 0 && (
              <dl className="mt-4 space-y-1 rounded-2xl bg-karta p-4 text-sm font-bold">
                <div className="flex justify-between">
                  <dt className="text-tekst-2">Dania</dt>
                  <dd>{formatPln(sumaGr)}</dd>
                </div>
                {zone && (
                  <div className="flex justify-between">
                    <dt className="text-tekst-2">Dostawa</dt>
                    <dd>{zone.cenaGr === null ? "zapytaj" : zone.cenaGr ? formatPln(zone.cenaGr) : "gratis"}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-lg font-black">
                  <dt>Razem ok.</dt>
                  <dd>{formatPln(total)}</dd>
                </div>
                {l.bezCeny && <p className="text-xs text-tekst-2">Część pozycji nie ma ceny — doliczy lokal.</p>}
              </dl>
            )}
            <p className="mt-2 text-xs font-semibold text-tekst-2">
              To Twoja ściągawka, nie zamówienie — lokal przyjmuje zamówienia przez telefon.
            </p>
          </div>
        )}

        <div className="shrink-0 space-y-2 border-t border-obrys bg-tlo px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {razemOtwarte ? (
            <button
              type="button"
              onClick={() => sendGroupLink(imie.trim())}
              disabled={!groupLink}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-akcent text-lg font-black text-na-akcencie transition active:scale-[0.98] disabled:opacity-40"
            >
              <Share2 className="size-5" aria-hidden /> {skopiowano ? "Link skopiowany" : "Wyślij link"}
            </button>
          ) : telefon ? (
            <a
              href={phoneUrl(telefon)}
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
                onClick={share}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-tekst text-sm font-extrabold"
              >
                <Share2 className="size-4" aria-hidden /> {skopiowano ? "Skopiowano" : "Wyślij"}
              </button>
              <button
                type="button"
                onClick={() => {
                  l.wyczysc();
                  close();
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
