import type { DatabaseSync } from "node:sqlite";
import { openDatabase } from "./db/otworz.mjs";

// Jedno połączenie na proces; w trybie dev przetrwa przeładowania modułów.
const globalny = globalThis as typeof globalThis & { szamanieDb?: DatabaseSync };

export const db = (globalny.szamanieDb ??= openDatabase());
