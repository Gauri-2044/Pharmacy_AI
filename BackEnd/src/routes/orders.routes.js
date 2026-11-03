import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  createOrder,
  listOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order-layer.controller.js";

const ordersRouter = express.Router();

// ✅ Get all orders
ordersRouter.get("/orders", authenticate, listOrders);

// ✅ Place Order (DB + Email)
ordersRouter.post("/orders", authenticate, createOrder);

// ✅ Get order by ID
ordersRouter.get("/orders/:orderId", authenticate, getOrderById);

// ✅ Cancel order
ordersRouter.put("/orders/:orderId/cancel", authenticate, cancelOrder);

export default ordersRouter;