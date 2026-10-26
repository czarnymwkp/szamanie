// Style propozycji 8 (neo-brutalizm), wspólne dla strony głównej i strony lokalu.
// Osobny plik, bo strona lokalu to komponent serwerowy, a strona główna — kliencki.
export const ramka = "border-[3px] border-tekst shadow-[5px_5px_0_#111]";
// Najechanie przesuwa element i wydłuża cień, kliknięcie „wciska” go.
export const ramkaHover =
  "transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#111]";
