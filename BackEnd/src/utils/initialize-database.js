import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.NEON_URL) {
  throw new Error("NEON_URL is not configured in BackEnd/.env");
}

const pool = new pg.Pool({ connectionString: process.env.NEON_URL });

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      hashed_password TEXT NOT NULL,
      user_role VARCHAR(30) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      composition TEXT,
      dosage TEXT,
      side_effects TEXT,
      contraindications TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE medicines
      ADD COLUMN IF NOT EXISTS pzn VARCHAR(255),
      ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
      ADD COLUMN IF NOT EXISTS package_size VARCHAR(255),
      ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN NOT NULL DEFAULT FALSE;

    UPDATE medicines
    SET stock_quantity = stock
    WHERE stock_quantity IS NULL;

    UPDATE medicines
    SET package_size = dosage
    WHERE package_size IS NULL AND dosage IS NOT NULL;

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id INTEGER GENERATED ALWAYS AS (id) STORED UNIQUE,
      user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      medicine_id INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      medicine_name VARCHAR(255) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      dosage TEXT,
      frequency VARCHAR(255),
      prescription_required BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_health_preferences (
      user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
      allergy_text TEXT,
      allergy_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
      image_url TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agent_activity_logs (
      id SERIAL PRIMARY KEY,
      trace_id VARCHAR(120) NOT NULL,
      user_id INTEGER,
      activity_type VARCHAR(50) NOT NULL,
      intent VARCHAR(50),
      medicine_name VARCHAR(255),
      input_message TEXT,
      response_preview TEXT,
      status VARCHAR(20) NOT NULL,
      http_status INTEGER,
      duration_ms INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx
      ON chat_messages (user_id, created_at, id);
  `);

  console.log("Database schema initialized successfully.");
} finally {
  await pool.end();
}
