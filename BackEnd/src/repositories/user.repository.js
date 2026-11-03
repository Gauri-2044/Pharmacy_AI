import { db } from "../utils/db.js";

export const userRepository = {
  async findByEmail(email) {
    const result = await db.query(
      "SELECT user_id, user_name, phone, email, hashed_password, user_role FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(userId) {
    const result = await db.query(
      "SELECT user_id, user_name, email, user_role FROM users WHERE user_id = $1 LIMIT 1",
      [userId]
    );
    return result.rows[0] || null;
  },

  async create({ username, phone, email, hashedPassword }) {
    const result = await db.query(
      `INSERT INTO users (user_name, phone, email, hashed_password, user_role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, user_name, phone, email, user_role`,
      [username, phone, email, hashedPassword, "user"]
    );
    return result.rows[0];
  },
};
