import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __drizzleDb: ReturnType<typeof drizzle> | undefined;
}

function getSqlite(): Database.Database {
  if (!global.__sqlite) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    global.__sqlite = new Database(dbPath);
    global.__sqlite.pragma("journal_mode = WAL");
  }
  return global.__sqlite;
}

function getDrizzle() {
  if (!global.__drizzleDb) {
    global.__drizzleDb = drizzle(getSqlite(), { schema });
  }
  return global.__drizzleDb;
}

function lazyProxy<T extends object>(getReal: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const real = getReal() as any;
      const value = real[prop];
      return typeof value === "function" ? value.bind(real) : value;
    },
  });
}

export const sqlite = lazyProxy(getSqlite);
export const db = lazyProxy(getDrizzle) as ReturnType<typeof drizzle<typeof schema>>;