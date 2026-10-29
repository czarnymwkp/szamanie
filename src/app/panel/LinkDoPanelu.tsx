"use client";

import { Check, Copy, Link2, MessageSquare, Share2 } from "lucide-react";
import { useState, useTransition } from "react";
import { pole, przyciskMaly } from "@/components/panel/style";

const tresc = (adres: string, nazwa: string) =>
  `Link do panelu lokalu ${nazwa} na szamanie.pl: ${adres} — otwórz go, żeby zmienić menu, ceny i godziny. Nie przekazuj go nikomu.`;

/** Gotowy link do panelu: do skopiowania, wysłania SMS-em albo udostępnienia (WhatsApp, Messenger). */
export function PokazLink({ sciezka, telefon, nazwa }: { sciezka: string; telefon: string | null; nazwa: string }) {
  const [skopiowano, setSkopiowano] = useState(false);
  const adres = `${window.location.origin}${sciezka}`;
  const numer = telefon?.replace(/[^\d+]/g, "");

  async function kopiuj() {
    try {
      await navigator.clipboard.writeText(adres);
      setSkopiowano(true);
    } catch {
      // bez HTTPS (np. podgląd po adresie IP) schowek jest niedostępny — tekst do zaznaczenia jest w polu obok
    }
  }

  return (
    <div className="w-full space-y-2 rounded-xl bg-krem p-3">
      <input
        readOnly
        value={adres}
        aria-label="Link do panelu"
        onFocus={(e) => e.currentTarget.select()}
        className={`${pole} py-2 text-sm`}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={kopiuj} className={`${przyciskMaly} bg-white`}>
          {skopiowano ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {skopiowano ? "Skopiowano" : "Kopiuj"}
        </button>
        {numer && (
          // „?&body=” działa i na Androidzie, i na iPhonie
          <a href={`sms:${numer}?&body=${encodeURIComponent(tresc(adres, nazwa))}`} className={`${przyciskMaly} bg-white`}>
            <MessageSquare className="size-4" aria-hidden /> SMS na {telefon}
          </a>
        )}
        {"share" in navigator && (
          <button
            type="button"
            onClick={() => navigator.share({ text: tresc(adres, nazwa) }).catch(() => {})}
            className={`${przyciskMaly} bg-white`}
          >
            <Share2 className="size-4" aria-hidden /> Udostępnij
          </button>
        )}
      </div>
      <p className="text-xs text-tekst-2">Link działa, dopóki nie utworzysz nowego albo nie odbierzesz dostępu.</p>
    </div>
  );
}

/** Przycisk admina: nowy link do panelu dla konta (stary przestaje działać). */
export default function LinkDoPanelu({
  utworz,
  telefon,
  nazwa,
  maLink,
}: {
  utworz: () => Promise<string>;
  telefon: string | null;
  nazwa: string;
  maLink: boolean;
}) {
  const [sciezka, setSciezka] = useState<string | null>(null);
  const [trwa, startTransition] = useTransition();

  if (sciezka) return <PokazLink sciezka={sciezka} telefon={telefon} nazwa={nazwa} />;
  return (
    <button
      type="button"
      disabled={trwa}
      onClick={() => startTransition(async () => setSciezka(await utworz()))}
      title={maLink ? "Poprzedni link przestanie działać" : undefined}
      className={`${przyciskMaly} bg-akcent text-na-akcencie`}
    >
      <Link2 className="size-4" aria-hidden /> {maLink ? "Nowy link do panelu" : "Link do panelu"}
    </button>
  );
}
