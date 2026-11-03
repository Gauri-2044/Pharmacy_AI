import { userRepository } from "../repositories/user.repository.js";
import { medicineRepository } from "../repositories/medicine.repository.js";
import { orderRepository } from "../repositories/order.repository.js";
import transporter from "../mailer.js";
import { checkMedicineAgainstUserAllergies } from "./allergy-safety.service.js";

const sendConfirmation = async (user, result) => {
  if (!user?.email || !transporter) return false;
  try {
    await transporter.sendMail({
      from: `"Online Pharmacy" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${result.orders[0]?.id || ""}`,
      text: `Your order has been placed. Total: Rs ${result.totalAmount}.`,
    });
    return true;
  } catch (error) {
    console.error("[order.email] Confirmation failed after commit:", error.message);
    return false;
  }
};

export const orderService = {
  async prepareDraft(userId, items) {
    if (!Array.isArray(items) || items.length === 0) throw new Error("At least one order item is required");
    const draftItems = [];
    for (const item of items) {
      const medicineId = Number(item.medicine_id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(medicineId) || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Each item requires a valid medicine_id and positive integer quantity");
      }
      const medicine = await medicineRepository.findById(medicineId);
      if (!medicine) throw new Error(`Medicine with ID ${medicineId} not found`);
      const safetyWarnings = await checkMedicineAgainstUserAllergies(userId, medicine);
      draftItems.push({
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        quantity,
        price_per_unit: medicine.price,
        total_price: medicine.price * quantity,
        stock_available: medicine.stock,
        available: medicine.stock >= quantity,
        prescription_required: Boolean(medicine.prescription_required),
        safety_warnings: safetyWarnings,
      });
    }
    return {
      user_id: userId,
      items: draftItems,
      total_price: draftItems.reduce((sum, item) => sum + item.total_price, 0),
      safety_warnings: draftItems.flatMap((item) => item.safety_warnings),
      requires_confirmation: true,
    };
  },

  async createConfirmedOrder(userId, items) {
    const draft = await this.prepareDraft(userId, items);
    if (draft.safety_warnings.length) {
      throw new Error("Order paused for allergy safety review. Please contact a qualified pharmacist.");
    }
    const result = await orderRepository.createWithInventory({ userId, items });
    const user = await userRepository.findById(userId);
    return { ...result, email_sent: await sendConfirmation(user, result) };
  },

  async getStatus(orderId, userId, role) {
    const order = await orderRepository.findByIdForUser(orderId, userId, role);
    if (!order) throw new Error("Order not found");
    return order;
  },
};
