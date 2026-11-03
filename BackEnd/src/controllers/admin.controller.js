import { db } from "../utils/db.js";

/* ===========================
   DASHBOARD
=========================== */
export const getAdminDashboard = async (req, res) => {
  try {
    // Total medicines count
    const medicinesResult = await db.query(
      "SELECT COUNT(*) AS totalmedicines FROM medicines"
    );

    // Low stock alerts (stock <= 10 and > 0)
    const lowStockResult = await db.query(
      "SELECT COUNT(*) AS lowstockalerts FROM medicines WHERE COALESCE(stock_quantity, stock) <= 10 AND COALESCE(stock_quantity, stock) > 0"
    );

    // Out of stock alerts (stock = 0)
    const outOfStockResult = await db.query(
      "SELECT COUNT(*) AS outofstockalerts FROM medicines WHERE COALESCE(stock_quantity, stock) = 0"
    );

    // Total orders
    const ordersResult = await db.query(
      "SELECT COUNT(*) AS totalorders FROM orders"
    );

    // Orders today
    const ordersToday = await db.query(
      "SELECT COUNT(*) AS orderstoday FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );

    res.status(200).json({
      totalMedicines: parseInt(medicinesResult.rows[0].totalmedicines),
      lowStockAlerts: parseInt(lowStockResult.rows[0].lowstockalerts),
      outOfStockAlerts: parseInt(outOfStockResult.rows[0].outofstockalerts),
      ordersToday: parseInt(ordersToday.rows[0].orderstoday),
      totalOrders: parseInt(ordersResult.rows[0].totalorders)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};


/* ===========================
   USERS
=========================== */
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT user_id, user_name AS username, email, user_role FROM users"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await db.query(
      "UPDATE users SET user_role = $1 WHERE user_id = $2 RETURNING *",
      [role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};


/* ===========================
   ORDERS
=========================== */
export const getAllOrders = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM orders");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const result = await db.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};


/* ===========================
   MEDICINES
=========================== */

export const getAllMedicinesAdmin = async (req, res) => {
  try {
    const { q = "", stockStatus = "all" } = req.query;
    const where = [];
    const params = [];
    let i = 1;

    if (q && String(q).trim()) {
      where.push(`LOWER(med_name) LIKE LOWER($${i})`);
      params.push(`%${String(q).trim()}%`);
      i++;
    }

    if (stockStatus === "out") {
      where.push("COALESCE(stock_quantity, stock) = 0");
    } else if (stockStatus === "low") {
      where.push("COALESCE(stock_quantity, stock) <= 10 AND COALESCE(stock_quantity, stock) > 0");
    } else if (stockStatus === "in") {
      where.push("COALESCE(stock_quantity, stock) > 10");
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const result = await db.query(
      `SELECT med_id AS id, med_name AS name, pzn, price, stock,
              stock_quantity, package_size, description,
              requires_prescription, created_at, updated_at,
              CASE
                WHEN COALESCE(stock_quantity, stock) = 0 THEN 'OUT_OF_STOCK'
                WHEN COALESCE(stock_quantity, stock) <= 10 THEN 'LOW_STOCK'
                ELSE 'IN_STOCK'
              END AS stock_status
       FROM medicines
       ${whereClause}
       ORDER BY COALESCE(stock_quantity, stock) ASC, med_name ASC`,
      params
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch medicines" });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      composition,
      dosage,
      side_effects,
      contraindications,
      stock,
      category,
    } = req.body;

    const result = await db.query(
      `INSERT INTO medicines
       (med_id, med_name, pzn, price, stock, package_size, description, requires_prescription, stock_quantity)
       VALUES (
         (SELECT COALESCE(MAX(med_id), 0) + 1 FROM medicines),
         $1, $2, $3, $4, $5, $6, $7, $8
       )
       RETURNING *`,
      [
        name,
        req.body.pzn || name,
        price,
        stock ?? 0,
        description,
        req.body.package_size || null,
        Boolean(req.body.requires_prescription),
        stock ?? 0,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Create Medicine Error:", error);
    res.status(500).json({ message: "Failed to create medicine" });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      stock,
      description,
      composition,
      dosage,
      side_effects,
      contraindications,
      category,
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "name, price and stock are required" });
    }

    const result = await db.query(
      `UPDATE medicines
       SET med_name = $1,
           price = $2,
           stock = $3,
           description = $4,
           stock_quantity = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE med_id = $5
       RETURNING *`,
      [
        name,
        price,
        stock,
        description,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update medicine" });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM medicines WHERE med_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete medicine" });
  }
};


/* ===========================
   AGENT LOGS
=========================== */
export const getAgentLogs = async (req, res) => {
  try {
    await db.query(`
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
      )
    `);

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const result = await db.query(
      `SELECT id, trace_id, user_id, activity_type, intent, medicine_name,
              input_message, response_preview, status, http_status, duration_ms, created_at
       FROM agent_activity_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.status(200).json({
      logs: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("[admin.agent-logs] Error:", error.message);
    res.status(500).json({ message: "Failed to fetch agent logs" });
  }
};
