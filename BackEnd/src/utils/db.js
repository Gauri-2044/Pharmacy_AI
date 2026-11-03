import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pg;

const connectionString = process.env.NEON_URL;

if (!connectionString) {
  throw new Error("NEON_URL is not configured in BackEnd/.env");
}

export const db = new Pool({ connectionString });

db.connect()
  .then((client) => {
    client.release();
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
