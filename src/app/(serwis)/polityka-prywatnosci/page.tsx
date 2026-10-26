import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ADMINISTRATOR, KONTAKT_EMAIL } from "@/lib/konfiguracja";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Jakie dane przetwarza szamanie.pl, w jakim celu i jak poprosić o poprawienie lub usunięcie danych lokalu.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

// Opis zgodny z tym, co serwis faktycznie robi: bez kont, ciasteczek i analityki; ulubione i lista zamówienia
// tylko w localStorage; lokalizacja liczona w przeglądarce. Przy zmianie tego (konta, statystyki) — zaktualizować.
const AKTUALIZACJA = "25 października 2026";

function Punkt({ tytul, children }: { tytul: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black">{tytul}</h2>
      <div className="mt-2 space-y-2 leading-relaxed font-semibold text-tekst-2">{children}</div>
    </section>
  );
}

export default function PolitykaPrywatnosci() {
  const kontakt = KONTAKT_EMAIL ? (
    <a href={`mailto:${KONTAKT_EMAIL}`} className="font-bold text-akcent-tekst underline">
      {KONTAKT_EMAIL}
    </a>
  ) : (
    "adres podany na stronie Dla lokali"
  );
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="animate-wjazd text-3xl font-black lg:text-4xl">Polityka prywatności</h1>
      <p className="mt-3 animate-wjazd font-semibold text-tekst-2 [animation-delay:80ms]">
        Ostatnia aktualizacja: {AKTUALIZACJA}
      </p>

      <Punkt tytul="Kto odpowiada za dane">
        <p>
          Administratorem danych jest {ADMINISTRATOR || "właściciel serwisu szamanie.pl"}. W sprawach danych osobowych
          napisz na {kontakt}.
        </p>
      </Punkt>

      <Punkt tytul="Odwiedzający stronę">
        <p>
          Do korzystania z szamanie.pl nie potrzebujesz konta. Nie używamy ciasteczek śledzących, narzędzi analitycznych
          ani reklam.
        </p>
        <p>
          Ulubione lokale i lista do zamówienia zapisują się tylko w pamięci Twojej przeglądarki (localStorage). Nie
          trafiają na nasz serwer. Usuniesz je, czyszcząc dane tej strony w przeglądarce.
        </p>
        <p>
          Gdy wybierzesz „Blisko mnie”, przeglądarka zapyta o zgodę na lokalizację. Położenie służy tylko do policzenia
          odległości do lokali na Twoim urządzeniu i nie jest wysyłane na serwer.
        </p>
        <p>
          Serwer, jak każdy serwer WWW, może przez krótki czas zapisywać techniczne dane połączenia: adres IP, czas i
          adres otwartej strony. Używamy ich tylko do zapewnienia bezpieczeństwa i usuwania awarii. Podstawą jest nasz
          prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).
        </p>
      </Punkt>

      <Punkt tytul="Dane lokali">
        <p>
          Pokazujemy publicznie dostępne informacje o lokalach gastronomicznych: nazwę, adres, telefon, godziny otwarcia,
          adresy stron i profili, menu z cenami. Pochodzą z OpenStreetMap (licencja ODbL), ze stron internetowych lokali
          albo od samych lokali. Gdy lokal prowadzi osoba fizyczna, część tych informacji może być jej danymi osobowymi.
        </p>
        <p>
          Przetwarzamy je, żeby goście mogli znaleźć lokal, sprawdzić godziny i zadzwonić. Podstawą jest prawnie
          uzasadniony interes (art. 6 ust. 1 lit. f RODO). Prowadzisz lokal i chcesz poprawić dane albo usunąć wpis?
          Napisz na {kontakt}. Poprawimy albo usuniemy wpis bezpłatnie.
        </p>
      </Punkt>

      <Punkt tytul="Kontakt z nami">
        <p>
          Jeśli do nas napiszesz, użyjemy Twojego adresu e-mail i treści wiadomości tylko do odpowiedzi i załatwienia
          sprawy. Przechowujemy je, dopóki jest to do tego potrzebne.
        </p>
      </Punkt>

      <Punkt tytul="Komu przekazujemy dane">
        <p>
          Dane są przechowywane na serwerze, który wynajmujemy od firmy hostingowej. Nie sprzedajemy ich i nie
          udostępniamy do celów reklamowych.
        </p>
        <p>
          Przycisk „Prowadź” otwiera aplikację do nawigacji w telefonie albo Mapy Google, a linki prowadzą do stron i
          profili lokali. Za przetwarzanie danych w tych aplikacjach i serwisach odpowiadają ich właściciele.
        </p>
      </Punkt>

      <Punkt tytul="Twoje prawa">
        <p>
          Możesz żądać dostępu do swoich danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania. Możesz też
          wnieść sprzeciw wobec przetwarzania. Wystarczy napisać na {kontakt}.
        </p>
        <p>
          Masz także prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
        </p>
      </Punkt>
    </div>
  );
}
