import { runPharmacyAgent } from "../agents/pharmacy.agent.js";
import { chatRepository } from "../repositories/chat.repository.js";
import { orderService } from "../services/order.service.js";

export async function chatWithAgent(req, res) {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ success: false, error: "Message is required" });
  try {
    const userId = req.user?.user_id || null;
    const history = userId
      ? await chatRepository.listMessages(userId)
      : Array.isArray(req.body?.history)
        ? req.body.history
        : [];

    const result = await runPharmacyAgent({
      message,
      history,
      context: { userId: req.user?.user_id || null, role: req.user?.role || "user" },
    });
    if (userId) {
      await chatRepository.addMessage(userId, "user", message);
      await chatRepository.addMessage(userId, "assistant", result.reply);
    }
    const draft = result.order || result.toolResults.find((tool) => tool.name === "prepare_order_draft")?.result;
    return res.json({
      success: true,
      reply: result.reply,
      tool_results: result.toolResults.map(({ name, ok }) => ({ name, ok })),
      showOrderModal: Boolean(draft?.items?.length || result.order),
      order: result.order || draft?.items?.[0] || null,
    });
  } catch (error) {
    console.error("[chat] Agent failure:", error.message);
    return res.status(502).json({ success: false, error: "The pharmacy assistant is temporarily unavailable" });
  }
}

export async function getChatHistory(req, res) {
  try {
    const messages = await chatRepository.listMessages(req.user.user_id);
    return res.json({ success: true, messages });
  } catch (error) {
    console.error("[chat.history] Failed to load history:", error.message);
    return res.status(500).json({ success: false, error: "Unable to load chat history" });
  }
}

export async function clearChatHistory(req, res) {
  try {
    await chatRepository.clearMessages(req.user.user_id);
    return res.json({ success: true });
  } catch (error) {
    console.error("[chat.history] Failed to clear history:", error.message);
    return res.status(500).json({ success: false, error: "Unable to clear chat history" });
  }
}

export async function confirmOrder(req, res) {
  const userId = req.user?.user_id;
  const items = req.body?.items || (req.body?.medicine_id ? [{ medicine_id: req.body.medicine_id, quantity: req.body.quantity }] : []);
  if (!userId) return res.status(401).json({ success: false, error: "Authentication is required to place an order" });
  try {
    const result = await orderService.createConfirmedOrder(userId, items);
    const first = result.orders[0];
    return res.json({
      success: true,
      message: `Order confirmed. Total: Rs ${result.totalAmount}.`,
      email_sent: result.email_sent,
      order: first ? { order_id: first.id, medicine_name: first.medicine_name, quantity: first.quantity, total_price: first.total_price } : null,
      orders: result.orders,
      totalAmount: result.totalAmount,
    });
  } catch (error) {
    console.error("[order] Confirmation failed:", error.message);
    return res.status(400).json({ success: false, error: error.message });
  }
}
