// Runs before `npm run build` (npm prebuild hook). Opens the database once in a single process: creates the
// schema, runs migrations and switches the file to WAL. Without it, parallel `next build` workers opening a fresh
// database (e.g. in CI, where data/ does not exist) race on the WAL switch and fail with "database is locked".
import { openDatabase } from "../src/lib/db/open.mjs";

openDatabase().close();
