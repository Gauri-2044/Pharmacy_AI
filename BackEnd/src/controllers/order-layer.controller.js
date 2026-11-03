import { orderRepository } from "../repositories/order.repository.js";
import { orderService } from "../services/order.service.js";

export async function createOrder(req, res) {
  try {
    const result = await orderService.createConfirmedOrder(req.user.user_id, req.body?.items);
    return res.status(201).json({
      message: "Order placed successfully",
      orderIds: result.orders.map((order) => order.id),
      totalAmount: result.totalAmount,
      email_sent: result.email_sent,
    });
  } catch (error) {
    console.error("[orders.create]", error.message);
    return res.status(400).json({ message: error.message });
  }
}

export async function listOrders(req, res) {
  try {
    return res.json(await orderRepository.listForUser(req.user.user_id, req.user.role));
  } catch (error) {
    console.error("[orders.list]", error.message);
    return res.status(500).json({ message: "Error fetching orders" });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await orderRepository.findByIdForUser(req.params.orderId, req.user.user_id, req.user.role);
    return order ? res.json([order]) : res.status(404).json({ message: "Order not found" });
  } catch (error) {
    console.error("[orders.get]", error.message);
    return res.status(500).json({ message: "Error fetching order" });
  }
}

export async function cancelOrder(req, res) {
  try {
    const order = await orderRepository.cancel(req.params.orderId, req.user.user_id, req.user.role);
    return order ? res.json({ message: "Order cancelled successfully", order }) : res.status(404).json({ message: "Order not found" });
  } catch (error) {
    console.error("[orders.cancel]", error.message);
    return res.status(500).json({ message: "Error cancelling order" });
  }
}
