import MoneyController from "./controller/money-controller.ts";
import ddl from '../create-tables.sql?raw';
import db from './model/connection.ts';
import "./style.css";

db().exec(ddl);
new MoneyController();
