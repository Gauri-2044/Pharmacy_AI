CREATE TABLE IF NOT EXISTS user_health_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  allergy_text TEXT,
  allergy_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
