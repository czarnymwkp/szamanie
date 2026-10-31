import type { Metadata, Viewport } from "next";
import { Nunito, Space_Grotesk } from "next/font/google";
import { BING_WERYFIKACJA, GOOGLE_WERYFIKACJA, SITE_URL } from "@/lib/konfiguracja";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
});

// Krój nagłówków strony głównej (font-grotesk).
const grotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "szamanie.pl — gdzie zjeść w Kraśniku i okolicy",
    template: "%s | szamanie.pl",
  },
  description:
    "Restauracje, pizzerie, kebaby i kawiarnie w Kraśniku i powiecie kraśnickim. Godziny otwarcia, telefon i dojazd w jednym miejscu.",
  openGraph: { siteName: "szamanie.pl", locale: "pl_PL", type: "website" },
  // potwierdzenie własności w Search Console i Bing Webmaster (kody w lib/konfiguracja.ts)
  verification: {
    google: GOOGLE_WERYFIKACJA || undefined,
    other: BING_WERYFIKACJA ? { "msvalidate.01": BING_WERYFIKACJA } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6400",
};

// Nagłówek i stopka serwisu są w app/(serwis)/layout.tsx; propozycje wyglądu (app/propozycje) mają własne.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${nunito.variable} ${grotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-tlo font-sans text-tekst">
        <a
          href="#tresc"
          className="sr-only z-50 rounded-full bg-tekst px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Przejdź do treści
        </a>
        {children}
      </body>
    </html>
  );
}
