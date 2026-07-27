import { PGlite } from '@electric-sql/pglite';

const pgliteDb = await PGlite.create('idb://money-clicker'); // Our permanent storage

export default function db(){
    return pgliteDb;
}