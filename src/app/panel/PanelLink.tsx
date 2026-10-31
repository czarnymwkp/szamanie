"use client";

import { Check, Copy, Link2, MessageSquare, Share2 } from "lucide-react";
import { useState, useTransition } from "react";
import { field, smallButton } from "@/components/panel/style";

const content = (address: string, name: string) =>
  `Link do panelu lokalu ${name} na szamanie.pl: ${address} — otwórz go, żeby zmienić menu, ceny i godziny. Nie przekazuj go nikomu.`;

/** A ready panel link: to copy, send by SMS or share (WhatsApp, Messenger). */
export function ShowLink({ sciezka, telefon, nazwa }: { sciezka: string; telefon: string | null; nazwa: string }) {
  const [skopiowano, setSkopiowano] = useState(false);
  const address = `${window.location.origin}${sciezka}`;
  const number = telefon?.replace(/[^\d+]/g, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setSkopiowano(true);
    } catch {
      // without HTTPS (e.g. a preview by IP address) there is no clipboard — the text can be selected in the field next to it
    }
  }

  return (
    <div className="w-full space-y-2 rounded-xl bg-krem p-3">
      <input
        readOnly
        value={address}
        aria-label="Link do panelu"
        onFocus={(e) => e.currentTarget.select()}
        className={`${field} py-2 text-sm`}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={`${smallButton} bg-white`}>
          {skopiowano ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {skopiowano ? "Skopiowano" : "Kopiuj"}
        </button>
        {number && (
          // „?&body=” works on both Android and iPhone
          <a href={`sms:${number}?&body=${encodeURIComponent(content(address, nazwa))}`} className={`${smallButton} bg-white`}>
            <MessageSquare className="size-4" aria-hidden /> SMS na {telefon}
          </a>
        )}
        {"share" in navigator && (
          <button
            type="button"
            onClick={() => navigator.share({ text: content(address, nazwa) }).catch(() => {})}
            className={`${smallButton} bg-white`}
          >
            <Share2 className="size-4" aria-hidden /> Udostępnij
          </button>
        )}
      </div>
      <p className="text-xs text-tekst-2">Link działa, dopóki nie utworzysz nowego albo nie odbierzesz dostępu.</p>
    </div>
  );
}

/** Admin button: a new panel link for the account (the old one stops working). */
export default function PanelLink({
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

  if (sciezka) return <ShowLink sciezka={sciezka} telefon={telefon} nazwa={nazwa} />;
  return (
    <button
      type="button"
      disabled={trwa}
      onClick={() => startTransition(async () => setSciezka(await utworz()))}
      title={maLink ? "Poprzedni link przestanie działać" : undefined}
      className={`${smallButton} bg-akcent text-na-akcencie`}
    >
      <Link2 className="size-4" aria-hidden /> {maLink ? "Nowy link do panelu" : "Link do panelu"}
    </button>
  );
}
