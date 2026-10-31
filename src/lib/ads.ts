// Banners in the ad slot on the home page (below the search box, above „Na co masz ochotę?”). Until there are
// advertisers, these are the site's own banners. A venue ad gets the „Reklama” label.

export type Ad = {
  id: string;
  etykieta: "Reklama" | "szamanie.pl";
  tytul: string;
  podpis: string;
  cta: string;
  href: string;
  tlo: string; // CSS background
  ciemna: boolean; // light text on a dark background
  ikona: "megafon" | "menu" | "procent";
};

export const ADS: Ad[] = [
  {
    id: "twoja-reklama",
    etykieta: "szamanie.pl",
    tytul: "Tu może być Twoja reklama",
    podpis: "Pokaż swój lokal głodnym z Kraśnika i okolic",
    cta: "Dla lokali",
    href: "/dla-lokali",
    tlo: "linear-gradient(118deg, #ff6400 0%, #ff8f2e 55%, #ffc46b 100%)",
    ciemna: false,
    ikona: "megafon",
  },
  {
    id: "menu-lokalu",
    etykieta: "szamanie.pl",
    tytul: "Masz lokal? Dodaj menu",
    podpis: "Goście zbiorą zamówienie z Twojego menu i od razu zadzwonią",
    cta: "Jak to działa",
    href: "/dla-lokali",
    tlo: "radial-gradient(120% 140% at 100% 0%, #5a2a0c 0%, #1a120d 55%, #0e0e0e 100%)",
    ciemna: true,
    ikona: "menu",
  },
  {
    id: "promocje",
    etykieta: "szamanie.pl",
    tytul: "Promocje lokali w jednym miejscu",
    podpis: "Wkrótce: zniżki i dania dnia z całej okolicy",
    cta: "Dodaj promocję",
    href: "/dla-lokali",
    tlo: "linear-gradient(118deg, #157a3a 0%, #2f9e57 60%, #9be15d 100%)",
    ciemna: true,
    ikona: "procent",
  },
];
