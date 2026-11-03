import { db } from "../utils/db.js";

let tableReady;

async function ensureTable() {
  if (!tableReady) {
    tableReady = db.query(`
      CREATE TABLE IF NOT EXISTS user_health_preferences (
        user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        allergy_text TEXT,
        allergy_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
        image_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  await tableReady;
}

export const userPreferencesRepository = {
  async findByUserId(userId) {
    await ensureTable();
    const result = await db.query(
      `SELECT allergy_text, allergy_analysis, image_url
       FROM user_health_preferences WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async upsert({ userId, allergyText, allergyAnalysis, imageUrl }) {
    await ensureTable();
    const result = await db.query(
      `INSERT INTO user_health_preferences
        (user_id, allergy_text, allergy_analysis, image_url, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         allergy_text = EXCLUDED.allergy_text,
         allergy_analysis = EXCLUDED.allergy_analysis,
         image_url = EXCLUDED.image_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING allergy_text, allergy_analysis, image_url`,
      [userId, allergyText || null, JSON.stringify(allergyAnalysis || {}), imageUrl || null]
    );
    return result.rows[0];
  },
};
