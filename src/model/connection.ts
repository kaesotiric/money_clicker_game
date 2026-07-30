import { PGlite } from '@electric-sql/pglite';

// let src = import.meta.env.VITE_DATABASE_URL;

// if(src == 'memory://'){
//     db().exec(ddl);
// }

const pgliteDb = await PGlite.create('idb://money-clicker'); // Our permanent storage

export default function db(){
    return pgliteDb;
}