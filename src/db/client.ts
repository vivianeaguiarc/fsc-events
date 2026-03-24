import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

export const db = drizzle(process.env.DATABASE_URL, { schema });
