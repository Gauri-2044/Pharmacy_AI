import { db } from "../utils/db.js";

export const chatRepository = {
  async listMessages(userId, limit = 30) {
    const result = await db.query(
      `SELECT id, role, content, created_at
       FROM chat_messages
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2`,
      [userId, limit],
    );

    return result.rows.reverse();
  },

  async addMessage(userId, role, content) {
    const result = await db.query(
      `INSERT INTO chat_messages (user_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING id, role, content, created_at`,
      [userId, role, content],
    );
    return result.rows[0];
  },

  async clearMessages(userId) {
    await db.query("DELETE FROM chat_messages WHERE user_id = $1", [userId]);
  },
};
