// Schemat bazy SQLite. Wykonywany przy każdym otwarciu bazy, więc tylko CREATE ... IF NOT EXISTS.
// Plik .mjs, bo korzystają z niego i aplikacja, i skrypty w scripts/.
export const SCHEMAT = `
CREATE TABLE IF NOT EXISTS lokale (
  id              INTEGER PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  osm_id          TEXT UNIQUE,              -- np. node-123; NULL dla lokali dodanych ręcznie
  nazwa           TEXT NOT NULL,
  typ             TEXT NOT NULL,            -- restaurant, fast_food, cafe, pub, bar, ice_cream, food_court
  kuchnie         TEXT NOT NULL DEFAULT '[]', -- JSON, np. ["pizza","kebab"]
  lat             REAL NOT NULL,
  lon             REAL NOT NULL,
  gmina           TEXT,
  miejscowosc     TEXT,
  adres           TEXT,
  telefon         TEXT,
  www             TEXT,
  facebook        TEXT,
  godziny         TEXT,                     -- format opening_hours z OSM
  dostawa         INTEGER NOT NULL DEFAULT 0,
  na_wynos        INTEGER NOT NULL DEFAULT 0,
  opis            TEXT,
  ukryty          INTEGER NOT NULL DEFAULT 0,
  reczna_edycja   INTEGER NOT NULL DEFAULT 0, -- 1 = import z OSM nie nadpisuje tego lokalu
  utworzono       TEXT NOT NULL DEFAULT (datetime('now')),
  zaktualizowano  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS zdjecia (
  id         INTEGER PRIMARY KEY,
  lokal_id   INTEGER NOT NULL REFERENCES lokale(id) ON DELETE CASCADE,
  plik       TEXT NOT NULL,
  kolejnosc  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS zdjecia_lokal ON zdjecia(lokal_id, kolejnosc);

-- Płatne dodatki lokalu. Pakiet działa, gdy dzisiejsza data mieści się w [od_dnia, do_dnia].
--   top     = lokal wyżej na liście, z etykietą „Promowane”
--   galeria = pełna galeria zdjęć (bez pakietu widać tylko pierwsze zdjęcie)
CREATE TABLE IF NOT EXISTS pakiety (
  id         INTEGER PRIMARY KEY,
  lokal_id   INTEGER NOT NULL REFERENCES lokale(id) ON DELETE CASCADE,
  rodzaj     TEXT NOT NULL CHECK (rodzaj IN ('top', 'galeria')),
  od_dnia    TEXT NOT NULL,
  do_dnia    TEXT NOT NULL,
  notatka    TEXT,
  utworzono  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS pakiety_lokal ON pakiety(lokal_id, rodzaj);
`;

// Zmiany schematu po wersji bazowej. Baza pamięta, ile migracji już wykonała (PRAGMA user_version),
// więc nowe dopisuj tylko na końcu i nigdy nie zmieniaj istniejących.
export const MIGRACJE = [
  // 1: wygląd podstrony lokalu, wybierany przez właściciela w abonamencie
  "ALTER TABLE lokale ADD COLUMN szablon TEXT NOT NULL DEFAULT 'klasyczny'",
  // 2: więcej danych kontaktowych, udogodnienia oraz logo/zdjęcia pobrane ze stron lokali.
  //    Grafiki z cudzych stron mają zatwierdzone = 0 i nie są publikowane, dopóki właściciel się nie zgodzi.
  `ALTER TABLE lokale ADD COLUMN email TEXT;
   ALTER TABLE lokale ADD COLUMN instagram TEXT;
   ALTER TABLE lokale ADD COLUMN menu_url TEXT;
   ALTER TABLE lokale ADD COLUMN cechy TEXT NOT NULL DEFAULT '{}';
   ALTER TABLE lokale ADD COLUMN strona_sprawdzona TEXT;
   ALTER TABLE zdjecia ADD COLUMN rodzaj TEXT NOT NULL DEFAULT 'zdjecie';
   ALTER TABLE zdjecia ADD COLUMN zrodlo TEXT;
   ALTER TABLE zdjecia ADD COLUMN zatwierdzone INTEGER NOT NULL DEFAULT 0;`,
  // 3: miejscowości powiatu — punkt odniesienia „blisko mnie”, gdy klient nie udostępni lokalizacji
  `CREATE TABLE miejscowosci (
     nazwa  TEXT PRIMARY KEY,
     typ    TEXT NOT NULL,   -- town, village
     lat    REAL NOT NULL,
     lon    REAL NOT NULL
   );`,
  // 4: ręczne poprawki (admin teraz, właściciel w panelu później). wartosc = JSON.
  `CREATE TABLE poprawki (
     lokal_id   INTEGER NOT NULL REFERENCES lokale(id) ON DELETE CASCADE,
     pole       TEXT NOT NULL,
     wartosc    TEXT NOT NULL,
     autor      TEXT,
     utworzono  TEXT NOT NULL DEFAULT (datetime('now')),
     PRIMARY KEY (lokal_id, pole)
   );`,
  // 5: menu z cenami i strefy dostawy (na start z plików dane/lokale/*.txt, później z panelu lokalu).
  //    Ceny w groszach. menu.ceny = JSON [{"wariant":"32 cm","gr":2700}] (wariant null, gdy cena jedna).
  `CREATE TABLE menu (
     id         INTEGER PRIMARY KEY,
     lokal_id   INTEGER NOT NULL REFERENCES lokale(id) ON DELETE CASCADE,
     sekcja     TEXT NOT NULL,
     nazwa      TEXT NOT NULL,
     opis       TEXT,
     ceny       TEXT NOT NULL DEFAULT '[]',
     cechy      TEXT NOT NULL DEFAULT '[]',  -- JSON: wege, ostre, polecane, sezonowe
     zdjecie    TEXT,                        -- własne zdjęcie lokalu (public/); bez niego — poglądowe
     kolejnosc  INTEGER NOT NULL DEFAULT 0,
     szukaj     TEXT NOT NULL                -- nazwa + opis + sekcja bez polskich znaków, do wyszukiwarki dań
   );
   CREATE INDEX menu_lokal ON menu(lokal_id, kolejnosc);
   CREATE TABLE menu_sekcje (
     lokal_id   INTEGER NOT NULL REFERENCES lokale(id) ON DELETE CASCADE,
     nazwa      TEXT NOT NULL,
     opis       TEXT,
     kolejnosc  INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (lokal_id, nazwa)
   );
   CREATE TABLE strefy_dostawy (
     id         INTEGER PRIMARY KEY,
     lokal_id   INTEGER NOT NULL REFERENCES lokale(id) ON DELETE CASCADE,
     nazwa      TEXT NOT NULL,                -- jak podaje lokal, np. „Urzędów (Rankowskie, Mikuszewskie)”
     miejsca    TEXT NOT NULL DEFAULT '[]',   -- JSON z nazwami z tabeli miejscowosci
     cena_gr    INTEGER,                      -- NULL = lokal nie podaje ceny
     min_gr     INTEGER,                      -- minimalne zamówienie; NULL = brak
     kolejnosc  INTEGER NOT NULL DEFAULT 0
   );
   CREATE INDEX strefy_lokal ON strefy_dostawy(lokal_id, kolejnosc);
   ALTER TABLE lokale ADD COLUMN menu_zrodlo TEXT;
   ALTER TABLE lokale ADD COLUMN menu_sprawdzono TEXT;
   ALTER TABLE lokale ADD COLUMN dostawa_zrodlo TEXT;
   ALTER TABLE lokale ADD COLUMN dostawa_sprawdzono TEXT;
   ALTER TABLE lokale ADD COLUMN dostawa_uwagi TEXT;`,
];
