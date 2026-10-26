// Ustawienia serwisu. Wartości z .env.local (lokalnie) albo ze zmiennych środowiska na serwerze.
export const ADRES_SERWISU = process.env.NEXT_PUBLIC_ADRES_SERWISU ?? "https://szamanie.pl";

// Administrator danych na /polityka-prywatnosci: imię i nazwisko albo firma z adresem (np. „Jan Kowalski, ul. …, Kraśnik”).
// Czytane przy buildzie — na serwerze deploy/wdroz.sh podaje /opt/szamanie/.env do buildu jako .env.production.
export const ADMINISTRATOR = process.env.ADMINISTRATOR ?? "";

// Adres, na który lokale piszą w sprawie pakietów. Pusty = na stronie „Dla lokali” nie ma przycisku kontaktu.
export const KONTAKT_EMAIL = process.env.KONTAKT_EMAIL ?? "";
