import { db } from "../utils/db.js";
import { medicineRepository } from "./medicine.repository.js";

const clientFor = (client) => client || db;

export const orderRepository = {
  async findByIdForUser(orderId, userId, role = "user") {
    const client = clientFor();
    const params = role === "admin" ? [orderId] : [orderId, userId];
    const predicate = role === "admin" ? "id = $1" : "id = $1 AND user_id = $2";
    const result = await client.query(`SELECT * FROM orders WHERE ${predicate} LIMIT 1`, params);
    return result.rows[0] || null;
  },

  async listForUser(userId, role = "user") {
    const result = role === "admin"
      ? await db.query("SELECT * FROM orders ORDER BY created_at DESC")
      : await db.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return result.rows;
  },

  async cancel(orderId, userId, role = "user") {
    const params = role === "admin" ? [orderId] : [orderId, userId];
    const predicate = role === "admin" ? "id = $1" : "id = $1 AND user_id = $2";
    const result = await db.query(
      `UPDATE orders SET status = 'cancelled' WHERE ${predicate} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async createWithInventory({ userId, items }) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const created = [];
      let totalAmount = 0;

      for (const item of items) {
        const medicineId = Number(item.medicine_id);
        const quantity = Number(item.quantity);
        if (!Number.isInteger(medicineId) || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Each item requires a valid medicine_id and positive integer quantity");
        }

        const medicine = await medicineRepository.findByIdForUpdate(medicineId, client);
        if (!medicine) throw new Error(`Medicine with ID ${medicineId} not found`);
        if (Number(medicine.stock) < quantity) throw new Error(`Insufficient stock for ${medicine.name}`);
        const total = Number(medicine.price) * quantity;
        const orderResult = await client.query(
          `INSERT INTO orders
            (user_id, medicine_id, quantity, medicine_name, total_price, dosage,
             frequency, prescription_required, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, medicine_name, quantity, total_price, status, created_at`,
          [userId, medicineId, quantity, medicine.name, total, medicine.dosage || "As directed",
            "As directed", false, "completed"]
        );
        const schemaResult = await client.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'medicines'`
        );
        const columns = new Set(schemaResult.rows.map((row) => row.column_name));
        const idColumn = columns.has("med_id") ? "med_id" : "id";
        const stockColumns = columns.has("stock_quantity") && columns.has("stock")
          ? "stock_quantity = stock_quantity - $1, stock = stock - $1"
          : `${columns.has("stock_quantity") ? "stock_quantity" : "stock"} = ${columns.has("stock_quantity") ? "stock_quantity" : "stock"} - $1`;
        await client.query(
          `UPDATE medicines SET ${stockColumns}, updated_at = CURRENT_TIMESTAMP WHERE ${idColumn} = $2`,
          [quantity, medicineId]
        );
        created.push({ ...orderResult.rows[0], price_per_unit: Number(medicine.price) });
        totalAmount += total;
      }

      await client.query("COMMIT");
      return { orders: created, totalAmount };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
