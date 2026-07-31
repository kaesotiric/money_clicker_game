import { PGlite } from "@electric-sql/pglite";

let database: PGlite;

if (import.meta.env.MODE === "test") {
    // Vitest uses an in-memory database
    database = new PGlite();
} else {
    // The browser application uses IndexedDB
    database = new PGlite("idb://money-clicker");
}

export default function db(): PGlite {
    return database;
}