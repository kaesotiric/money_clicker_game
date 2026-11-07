import { PGlite } from "@electric-sql/pglite";

let database: PGlite;

if (import.meta.env.MODE === "test") {
    // Memory database
    database = new PGlite();
} else {
    // The browser application idb
    database = new PGlite("idb://money-clicker");
}

export default function db(): PGlite {
    return database;
}