import {
  Accessibility,
  AtSign,
  BookOpen,
  CreditCard,
  ExternalLink,
  Globe,
  Leaf,
  Mail,
  PawPrint,
  Phone,
  ShoppingBag,
  Snowflake,
  TreePalm,
  Truck,
  Vegan,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { linkFacebooka, linkInstagrama, linkTelefonu, linkWww } from "@/lib/nazwy";

export type Kontakt = { etykieta: string; tekst: string; href: string; ikona: LucideIcon; zewnetrzny: boolean };

const host = (url: string) => {
  try {
    return new URL(linkWww(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Wszystkie znane kontakty lokalu (telefon, menu, www, social media, e-mail) w jednej liście. */
export function kontaktyLokalu(l: Lokal): Kontakt[] {
  const lista: (Kontakt | false | null)[] = [
    !!l.telefon && { etykieta: "Telefon", tekst: l.telefon, href: linkTelefonu(l.telefon), ikona: Phone, zewnetrzny: false },
    !!l.menuUrl && { etykieta: "Menu", tekst: host(l.menuUrl), href: linkWww(l.menuUrl), ikona: BookOpen, zewnetrzny: true },
    !!l.www && { etykieta: "Strona", tekst: host(l.www), href: linkWww(l.www), ikona: Globe, zewnetrzny: true },
    !!l.facebook && {
      etykieta: "Facebook",
      tekst: "profil na Facebooku",
      href: linkFacebooka(l.facebook),
      ikona: ExternalLink,
      zewnetrzny: true,
    },
    !!l.instagram && {
      etykieta: "Instagram",
      tekst: "profil na Instagramie",
      href: linkInstagrama(l.instagram),
      ikona: AtSign,
      zewnetrzny: true,
    },
    !!l.email && { etykieta: "E-mail", tekst: l.email, href: `mailto:${l.email}`, ikona: Mail, zewnetrzny: false },
  ];
  return lista.filter((k): k is Kontakt => !!k);
}

type Usluga = { ikona: LucideIcon; nazwa: string };

/** „Przyjazny dla…”: zwierzęta, niepełnosprawni, wege, wegańskie — na stronie lokalu widoczne od razu pod nazwą. */
export function plakietkiLokalu(lokal: Lokal): Usluga[] {
  const c = lokal.cechy;
  const lista: (Usluga | false | undefined)[] = [
    c.zwierzeta && { ikona: PawPrint, nazwa: "Zwierzęta mile widziane" },
    c.wozek && {
      ikona: Accessibility,
      nazwa: c.wozek === "yes" ? "Dostępny dla niepełnosprawnych" : "Częściowo dostępny dla wózków",
    },
    c.wege && { ikona: Leaf, nazwa: "Opcje wegetariańskie" },
    c.wegan && { ikona: Vegan, nazwa: "Opcje wegańskie" },
  ];
  return lista.filter((u) => !!u);
}

/** Usługi i udogodnienia lokalu do pokazania jako „pigułki”; `bezPlakietek` — bez tych z plakietkiLokalu. */
export function uslugiLokalu(lokal: Lokal, { bezPlakietek = false } = {}): Usluga[] {
  const c = lokal.cechy;
  const lista: (Usluga | false | undefined)[] = [
    lokal.naWynos && { ikona: ShoppingBag, nazwa: "Na wynos" },
    lokal.dostawa && { ikona: Truck, nazwa: "Dostawa" },
    c.ogrodek && { ikona: TreePalm, nazwa: "Ogródek" },
    c.karta && { ikona: CreditCard, nazwa: "Płatność kartą" },
    c.wifi && { ikona: Wifi, nazwa: "Wi-Fi" },
    c.klimatyzacja && { ikona: Snowflake, nazwa: "Klimatyzacja" },
    ...(bezPlakietek ? [] : plakietkiLokalu(lokal)),
  ];
  return lista.filter((u) => !!u);
}

/** Adres mapy OpenStreetMap do osadzenia (iframe) z pinezką lokalu. */
export function adresMapy(lokal: Pick<Lokal, "lat" | "lon">, przyblizenie = 1) {
  const d = { lat: 0.0032 * przyblizenie, lon: 0.0065 * przyblizenie };
  return (
    "https://www.openstreetmap.org/export/embed.html?layer=mapnik" +
    `&bbox=${lokal.lon - d.lon},${lokal.lat - d.lat},${lokal.lon + d.lon},${lokal.lat + d.lat}` +
    `&marker=${lokal.lat},${lokal.lon}`
  );
}
