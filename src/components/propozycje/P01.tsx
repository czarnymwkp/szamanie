import BanerDlaLokali from "../BanerDlaLokali";
import Katalog from "../Katalog";
import Naglowek from "../serwis/Naglowek";
import Stopka from "../serwis/Stopka";
import Klasyczny from "../szablony/Klasyczny";
import { adresPropozycji, prefiksLokalu, type PropsGlownej, type PropsLokalu } from "./wspolne";

// 1 · Pomarańczowy klasyk — obecny wygląd serwisu.
export function P01Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  return (
    <>
      <Naglowek start={adresPropozycji(nr)} />
      <main id="tresc" className="flex-1">
        <Katalog lokale={lokale} miejscowosci={miejscowosci} prefiks={prefiksLokalu(nr)} />
        <BanerDlaLokali />
      </main>
      <Stopka />
    </>
  );
}

export function P01Lokal({ lokal, nr }: PropsLokalu) {
  return (
    <>
      <Naglowek start={adresPropozycji(nr)} />
      <main id="tresc" className="flex-1">
        <Klasyczny lokal={lokal} powrot={adresPropozycji(nr)} />
      </main>
      <Stopka />
    </>
  );
}
