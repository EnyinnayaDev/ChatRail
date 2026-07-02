import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "swiftorder",
  user: process.env.DB_USER || "swiftorder",
  password: process.env.DB_PASSWORD || "swiftorder",
  port: Number(process.env.DB_PORT || 5432),
  max: 10,
});

pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("[pg] idle client error", err);
});
