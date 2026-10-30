import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { BookOpen, Leaf, QrCode, Smartphone, Truck, Users, X } from "lucide-react";
import { PAPIER, TloSzkic, reka } from "@/components/szkic/szkic";

export const metadata: Metadata = { title: "Propozycje: ikonka „Zamawiamy razem”" };

/** Ramka telefonu z makietą fragmentu strony. */
function Telefon({ nr, tytul, opis, children }: { nr: number; tytul: string; opis: string; children: ReactNode }) {
  return (
    <section className="flex flex-col items-center">
      <h2 className={`${reka.className} self-start text-3xl`}>
        {nr}. {tytul}
      </h2>
      <p className="mb-4 self-start text-sm font-semibold text-tekst-2">{opis}</p>
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-[2.2rem] border-[6px] border-tekst bg-tlo shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="m-papier relative isolate min-h-[380px] p-4">{children}</div>
      </div>
    </section>
  );
}

/** Dolny pasek „Twoja lista” jak na stronie lokalu (makieta). */
function Pasek({ dodatek }: { dodatek?: ReactNode }) {
  return (
    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2.5 rounded-full bg-tekst py-2 pr-4 pl-2 text-tlo shadow-[0_10px_24px_rgba(0,0,0,0.3)]">
        <span className="flex size-9 items-center justify-center rounded-full bg-akcent font-black text-na-akcencie">2</span>
        <span className="flex-1 text-sm font-extrabold">Twoja lista</span>
        <span className="text-sm font-black">50 zł</span>
      </div>
      {dodatek}
    </div>
  );
}

/** Kawałek menu nad paskiem (makieta). */
function Menu() {
  return (
    <ul className="space-y-2.5">
      {[
        ["Margherita", "28 zł"],
        ["Capricciosa", "33 zł"],
        ["Diavola", "34 zł"],
      ].map(([n, c]) => (
        <li key={n} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
          <span className="font-extrabold">{n}</span>
          <span className="text-sm font-bold text-tekst-2">{c}</span>
        </li>
      ))}
    </ul>
  );
}

/** Podgląd 5 propozycji, jak pokazać, że lista może przechodzić z telefonu na telefon („Zamawiamy razem”). */
export default function PropozycjeRazem() {
  return (
    <div style={PAPIER} className="m-papier relative isolate min-h-screen text-tekst">
      <TloSzkic />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">
          „Zamawiamy razem” — <span className={`${reka.className} text-akcent-tekst`}>5 propozycji ikonki</span>
        </h1>
        <p className="mt-3 max-w-2xl font-semibold text-tekst-2">
          Jak dać znać, że listę można podać drugiej osobie (kod QR / link), żeby dopisała swoje. Można też łączyć — np.
          1 + 2 albo 3 + 5.
        </p>

        <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <Telefon nr={1} tytul="Plakietka przy menu" opis="Na górze strony lokalu, obok „Dowóz” i „Menu”. Dotknięcie → krótko „jak to działa”.">
            <div className="h-24 rounded-lg bg-[url(/zdjecia/dania/pizza-salami.jpg)] bg-cover bg-center" />
            <h3 className="mt-3 text-2xl leading-none font-black">
              <span className="bg-[linear-gradient(transparent_55%,#ffd36e_55%,#ffd36e_90%,transparent_90%)]">Pizzeria Golińska</span>
            </h3>
            <p className="mt-1 text-xs font-bold text-tekst-2">Restauracja · Pizza</p>
            <p className="mt-3 flex flex-wrap gap-2 text-sm font-extrabold">
              <span className="inline-flex -rotate-2 items-center gap-1.5 bg-akcent px-2.5 py-1 text-na-akcencie">
                <Truck className="size-4" aria-hidden /> Dowóz
              </span>
              <span className="inline-flex rotate-1 items-center gap-1.5 bg-[#fff3a8] px-2.5 py-1">
                <BookOpen className="size-4" aria-hidden /> Menu · 24
              </span>
              <span className="inline-flex -rotate-1 items-center gap-1.5 bg-[#bfe9ff] px-2.5 py-1 ring-2 ring-tekst">
                <Users className="size-4" aria-hidden /> Zamawiaj razem
              </span>
            </p>
            <p className={`${reka.className} mt-4 rotate-[-2deg] text-xl text-akcent-tekst`}>każdy dopisze swoje ze swojego telefonu ↑</p>
          </Telefon>

          <Telefon nr={2} tytul="Guzik przy pasku listy" opis="Obok paska „Twoja lista” okrągły guzik z kodem QR — od razu otwiera kod do zeskanowania.">
            <Menu />
            <Pasek
              dodatek={
                <span className="flex size-[52px] shrink-0 flex-col items-center justify-center rounded-full border-2 border-tekst bg-[#bfe9ff] shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                  <QrCode className="size-5" aria-hidden />
                  <span className="text-[9px] leading-none font-black">RAZEM</span>
                </span>
              }
            />
          </Telefon>

          <Telefon nr={3} tytul="Dymek po pierwszym daniu" opis="Pojawia się raz, po dodaniu pierwszego dania. Zamyka się krzyżykiem i więcej nie wraca.">
            <Menu />
            <div className="absolute inset-x-5 bottom-[84px] rotate-[-1.5deg] rounded-2xl border-[2.5px] border-tekst bg-white p-3 pr-8 shadow-[4px_4px_0_#1d1b19]">
              <p className={`${reka.className} text-[1.35rem] leading-tight`}>
                Zamawiasz z kimś? Pokaż mu kod QR — każdy doda swoje ze swojego telefonu!
              </p>
              <X className="absolute top-2 right-2 size-4" aria-hidden />
              <span className="absolute -bottom-[11px] left-10 size-5 rotate-45 border-r-[2.5px] border-b-[2.5px] border-tekst bg-white" />
            </div>
            <Pasek />
          </Telefon>

          <Telefon nr={4} tytul="Karteczka nad menu" opis="Żółta karteczka nad menu z trzema krokami — tłumaczy, zanim ktoś zacznie wybierać.">
            <div className="rotate-[-1.2deg] bg-[#fff3a8] p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.12)]">
              <p className={`${reka.className} text-[1.7rem] leading-none`}>Zamawiacie razem?</p>
              <ol className="mt-3 space-y-2 text-sm font-bold">
                <li className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-tekst text-xs text-tlo">1</span> Zaznacz swoje dania
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-tekst text-xs text-tlo">2</span>
                  Pokaż kod QR <QrCode className="size-4" aria-hidden /> albo wyślij link
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-tekst text-xs text-tlo">3</span> Ostatni dzwoni i zamawia
                </li>
              </ol>
              <p className="mt-3 flex items-center justify-center gap-1 text-tekst-2" aria-hidden>
                <Smartphone className="size-6" /> → <Smartphone className="size-6" /> → <Smartphone className="size-6" /> →
                <span className="text-xl">📞</span>
              </p>
            </div>
            <div className="mt-4">
              <Menu />
            </div>
          </Telefon>

          <Telefon nr={5} tytul="Znaczek na liście lokali" opis="Na głównej, przy lokalach z menu (tylko tam to działa) — obok „Dowóz” i listka wege.">
            <div className="mx-auto w-[60%] rotate-[-1.5deg] bg-white p-2 pb-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <div className="relative">
                <Image src="/zdjecia/dania/pizza-margherita.jpg" alt="" width={300} height={300} className="aspect-square w-full object-cover" />
                <span className="absolute -bottom-2 -left-2 flex h-7 -rotate-3 items-center gap-1 rounded-full border-2 border-tekst bg-akcent pr-2 pl-2 text-[11px] font-black text-na-akcencie">
                  <Truck className="size-3.5" aria-hidden /> Dowóz
                </span>
                <span className="absolute -right-2 -bottom-2 flex gap-1">
                  <span className="flex size-7 -rotate-6 items-center justify-center rounded-full border-2 border-tekst bg-[#bfe9ff]">
                    <Users className="size-3.5" aria-label="zamówisz razem" />
                  </span>
                  <span className="flex size-7 rotate-12 items-center justify-center rounded-full border-2 border-tekst bg-[#86efac]">
                    <Leaf className="size-3.5 text-[#15803d]" aria-label="wege" />
                  </span>
                </span>
              </div>
              <h3 className="mt-3 text-[15px] leading-tight font-black">Si!</h3>
              <p className="text-xs font-semibold text-tekst-2">Restauracja · Włoska</p>
            </div>
            <p className={`${reka.className} mt-5 text-center text-xl text-akcent-tekst`}>
              niebieski ludzik = „zamówisz razem ze znajomymi”
            </p>
          </Telefon>
        </div>
      </main>
    </div>
  );
}
