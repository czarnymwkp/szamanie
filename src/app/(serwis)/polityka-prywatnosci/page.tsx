import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ADMIN_EMAIL, CONTACT_EMAIL, UMAMI_ID } from "@/lib/config";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Jakie dane przetwarza szamanie.pl, w jakim celu i jak poprosić o poprawienie lub usunięcie danych lokalu.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

// Describes what the site actually does: no accounts and no cookies; Umami analytics (cookieless) only when UMAMI_ID is
// set — then also a new „last updated” date; favorites and the order list only in localStorage; location computed in
// the browser. Update this when any of that changes (accounts, analytics).
const UPDATE = "25 października 2026";

function Point({ tytul, children }: { tytul: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black">{tytul}</h2>
      <div className="mt-2 space-y-2 leading-relaxed font-semibold text-tekst-2">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  const contact = CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-akcent-tekst underline">
      {CONTACT_EMAIL}
    </a>
  ) : (
    "adres podany na stronie Dla lokali"
  );
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="animate-wjazd text-3xl font-black lg:text-4xl">Polityka prywatności</h1>
      <p className="mt-3 animate-wjazd font-semibold text-tekst-2 [animation-delay:80ms]">
        Ostatnia aktualizacja: {UPDATE}
      </p>

      <Point tytul="Kto odpowiada za dane">
        <p>
          Administratorem danych jest {ADMIN_EMAIL || "właściciel serwisu szamanie.pl"}. W sprawach danych osobowych
          napisz na {contact}.
        </p>
      </Point>

      <Point tytul="Odwiedzający stronę">
        {UMAMI_ID ? (
          <>
            <p>
              Do korzystania z szamanie.pl nie potrzebujesz konta. Nie używamy ciasteczek śledzących ani reklam.
            </p>
            <p>
              Liczymy odwiedziny narzędziem Umami, które działa na naszym serwerze i nie zapisuje niczego na Twoim
              urządzeniu (bez ciasteczek). Zbiera dane zbiorcze: otwarte strony, skąd przyszło wejście, rodzaj
              urządzenia i przeglądarki, kraj oraz kliknięcia w telefon i dojazd do lokalu. Nie zapisuje adresu IP i nie
              pozwala nam Cię rozpoznać. Służy nam do ulepszania serwisu i pokazywania lokalom zbiorczych statystyk.
              Podstawą jest nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).
            </p>
          </>
        ) : (
          <p>
            Do korzystania z szamanie.pl nie potrzebujesz konta. Nie używamy ciasteczek śledzących, narzędzi
            analitycznych ani reklam.
          </p>
        )}
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
      </Point>

      <Point tytul="Dane lokali">
        <p>
          Pokazujemy publicznie dostępne informacje o lokalach gastronomicznych: nazwę, adres, telefon, godziny otwarcia,
          adresy stron i profili, menu z cenami. Pochodzą z OpenStreetMap (licencja ODbL), ze stron internetowych lokali
          albo od samych lokali. Gdy lokal prowadzi osoba fizyczna, część tych informacji może być jej danymi osobowymi.
        </p>
        <p>
          Przetwarzamy je, żeby goście mogli znaleźć lokal, sprawdzić godziny i zadzwonić. Podstawą jest prawnie
          uzasadniony interes (art. 6 ust. 1 lit. f RODO). Prowadzisz lokal i chcesz poprawić dane albo usunąć wpis?
          Napisz na {contact}. Poprawimy albo usuniemy wpis bezpłatnie.
        </p>
      </Point>

      <Point tytul="Kontakt z nami">
        <p>
          Jeśli do nas napiszesz, użyjemy Twojego adresu e-mail i treści wiadomości tylko do odpowiedzi i załatwienia
          sprawy. Przechowujemy je, dopóki jest to do tego potrzebne.
        </p>
      </Point>

      <Point tytul="Komu przekazujemy dane">
        <p>
          Dane są przechowywane na serwerze, który wynajmujemy od firmy hostingowej. Nie sprzedajemy ich i nie
          udostępniamy do celów reklamowych.
        </p>
        <p>
          Przycisk „Prowadź” otwiera aplikację do nawigacji w telefonie albo Mapy Google, a linki prowadzą do stron i
          profili lokali. Za przetwarzanie danych w tych aplikacjach i serwisach odpowiadają ich właściciele.
        </p>
      </Point>

      <Point tytul="Twoje prawa">
        <p>
          Możesz żądać dostępu do swoich danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania. Możesz też
          wnieść sprzeciw wobec przetwarzania. Wystarczy napisać na {contact}.
        </p>
        <p>
          Masz także prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
        </p>
      </Point>
    </div>
  );
}
