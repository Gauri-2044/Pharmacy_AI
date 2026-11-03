import { medicineRepository } from "../repositories/medicine.repository.js";

export const medicineService = {
  async searchCatalog(name) {
    const normalized = String(name || "").trim();
    if (!normalized) return { query: "", matches: await medicineRepository.search(""), requiresClarification: false };
    if (normalized.length > 120) throw new Error("A medicine name is required");
    const matches = await medicineRepository.search(normalized);
    return {
      query: normalized,
      matches: matches.map(({ id, name: medicineName, composition, dosage, price, stock, category }) => ({
        id, name: medicineName, composition, dosage, price, stock, category,
      })),
      requiresClarification: matches.length > 1,
    };
  },

  async getDetails(medicineId) {
    const id = Number(medicineId);
    if (!Number.isInteger(id) || id <= 0) throw new Error("medicine_id must be a positive integer");
    const medicine = await medicineRepository.findById(id);
    if (!medicine) throw new Error("Medicine not found");
    return medicine;
  },

  async checkInventory(medicineId) {
    const id = Number(medicineId);
    if (!Number.isInteger(id) || id <= 0) throw new Error("medicine_id must be a positive integer");
    const medicine = await medicineRepository.getInventory(id);
    if (!medicine) throw new Error("Medicine not found");
    return { medicine_id: medicine.id, medicine_name: medicine.name, stock: medicine.stock, available: medicine.stock > 0 };
  },
};
