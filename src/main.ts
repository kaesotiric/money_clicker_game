import MoneyController from "./controller/money-controller.ts";
import ddl from '../create-tables.sql?raw';
import db from './model/connection.ts';
import "./style.css";

// Load table in the database
db().exec(ddl);
new MoneyController();
