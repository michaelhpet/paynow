import { randomUUID } from "crypto";
import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const payments = sqliteTable("payments", {
  id: text("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text().notNull(),
  email: text().notNull(),
  amount: real().notNull(),
  status: text().notNull(),
  reference: text().notNull(),
  access_code: text().notNull(),
  created_at: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
