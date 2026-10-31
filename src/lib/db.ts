import type { DatabaseSync } from "node:sqlite";
import { openDatabase } from "./db/open.mjs";

// One connection per process; in dev mode it survives module reloads.
const globalStore = globalThis as typeof globalThis & { szamanieDb?: DatabaseSync };

export const db = (globalStore.szamanieDb ??= openDatabase());
