import Image from "next/image";
import Link from "next/link";
import Header from "@/components/serwis/Naglowek";
import Footer from "@/components/serwis/Stopka";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="tresc" className="mx-auto flex max-w-md flex-1 flex-col items-center px-5 py-20 text-center">
        <Image src="/znak.png" alt="" width={120} height={120} className="animate-unoszenie" />
        <h1 className="mt-6 text-3xl font-black">Tu nic nie ma</h1>
        <p className="mt-2 font-semibold text-tekst-2">Ta strona nie istnieje albo lokal został usunięty.</p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-tekst px-5 py-3 font-black text-white transition hover:-translate-y-0.5"
        >
          Wróć do listy lokali
        </Link>
      </main>
      <Footer />
    </>
  );
}
