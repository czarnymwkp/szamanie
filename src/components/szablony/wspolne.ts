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
import type { Venue } from "@/lib/lokale";
import { facebookUrl, instagramUrl, phoneUrl, websiteUrl } from "@/lib/nazwy";

export type Contact = { etykieta: string; tekst: string; href: string; ikona: LucideIcon; zewnetrzny: boolean };

const host = (url: string) => {
  try {
    return new URL(websiteUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Wszystkie znane kontakty lokalu (telefon, menu, www, social media, e-mail) w jednej liście. */
export function venueContacts(l: Venue): Contact[] {
  const list: (Contact | false | null)[] = [
    !!l.telefon && { etykieta: "Telefon", tekst: l.telefon, href: phoneUrl(l.telefon), ikona: Phone, zewnetrzny: false },
    !!l.menuUrl && { etykieta: "Menu", tekst: host(l.menuUrl), href: websiteUrl(l.menuUrl), ikona: BookOpen, zewnetrzny: true },
    !!l.www && { etykieta: "Strona", tekst: host(l.www), href: websiteUrl(l.www), ikona: Globe, zewnetrzny: true },
    !!l.facebook && {
      etykieta: "Facebook",
      tekst: "profil na Facebooku",
      href: facebookUrl(l.facebook),
      ikona: ExternalLink,
      zewnetrzny: true,
    },
    !!l.instagram && {
      etykieta: "Instagram",
      tekst: "profil na Instagramie",
      href: instagramUrl(l.instagram),
      ikona: AtSign,
      zewnetrzny: true,
    },
    !!l.email && { etykieta: "E-mail", tekst: l.email, href: `mailto:${l.email}`, ikona: Mail, zewnetrzny: false },
  ];
  return list.filter((k): k is Contact => !!k);
}

type Service = { ikona: LucideIcon; nazwa: string };

/** „Przyjazny dla…”: zwierzęta, niepełnosprawni, wege, wegańskie — na stronie lokalu widoczne od razu pod nazwą. */
export function venueBadges(venue: Venue): Service[] {
  const c = venue.cechy;
  const list: (Service | false | undefined)[] = [
    c.zwierzeta && { ikona: PawPrint, nazwa: "Zwierzęta mile widziane" },
    c.wozek && {
      ikona: Accessibility,
      nazwa: c.wozek === "yes" ? "Dostępny dla niepełnosprawnych" : "Częściowo dostępny dla wózków",
    },
    c.wege && { ikona: Leaf, nazwa: "Opcje wegetariańskie" },
    c.wegan && { ikona: Vegan, nazwa: "Opcje wegańskie" },
  ];
  return list.filter((u) => !!u);
}

/** Usługi i udogodnienia lokalu do pokazania jako „pigułki”; `bezPlakietek` — bez tych z plakietkiLokalu. */
export function venueServices(venue: Venue, { bezPlakietek = false } = {}): Service[] {
  const c = venue.cechy;
  const list: (Service | false | undefined)[] = [
    venue.naWynos && { ikona: ShoppingBag, nazwa: "Na wynos" },
    venue.dostawa && { ikona: Truck, nazwa: "Dostawa" },
    c.ogrodek && { ikona: TreePalm, nazwa: "Ogródek" },
    c.karta && { ikona: CreditCard, nazwa: "Płatność kartą" },
    c.wifi && { ikona: Wifi, nazwa: "Wi-Fi" },
    c.klimatyzacja && { ikona: Snowflake, nazwa: "Klimatyzacja" },
    ...(bezPlakietek ? [] : venueBadges(venue)),
  ];
  return list.filter((u) => !!u);
}

/** Adres mapy OpenStreetMap do osadzenia (iframe) z pinezką lokalu. */
export function mapUrl(venue: Pick<Venue, "lat" | "lon">, zoom = 1) {
  const d = { lat: 0.0032 * zoom, lon: 0.0065 * zoom };
  return (
    "https://www.openstreetmap.org/export/embed.html?layer=mapnik" +
    `&bbox=${venue.lon - d.lon},${venue.lat - d.lat},${venue.lon + d.lon},${venue.lat + d.lat}` +
    `&marker=${venue.lat},${venue.lon}`
  );
}
