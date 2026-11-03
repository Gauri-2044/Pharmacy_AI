import { medicineService } from "../services/medicine.service.js";
import { orderService } from "../services/order.service.js";

export const toolRegistry = {
  search_medicine_catalog: ({ name }) => medicineService.searchCatalog(name),
  get_medicine_details: ({ medicine_id }) => medicineService.getDetails(medicine_id),
  check_inventory: ({ medicine_id }) => medicineService.checkInventory(medicine_id),
  prepare_order_draft: ({ items }, context) => orderService.prepareDraft(context.userId, items),
  get_order_status: ({ order_id }, context) => orderService.getStatus(order_id, context.userId, context.role),
};
