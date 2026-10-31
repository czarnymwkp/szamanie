import type { DatabaseSync } from "node:sqlite";
import { openDatabase } from "./db/open.mjs";

// Jedno połączenie na proces; w trybie dev przetrwa przeładowania modułów.
const globalStore = globalThis as typeof globalThis & { szamanieDb?: DatabaseSync };

export const db = (globalStore.szamanieDb ??= openDatabase());
