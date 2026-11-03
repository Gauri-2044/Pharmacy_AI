import { medicineRepository } from "../repositories/medicine.repository.js";
import { medicineService } from "../services/medicine.service.js";

export async function getAllMedicines(req, res) {
  try {
    const result = await medicineRepository.search("");
    return res.json(result);
  } catch (error) {
    console.error("[medicines.list]", error.message);
    return res.status(500).json({ message: "Failed to fetch medicines" });
  }
}

export async function getMedicineById(req, res) {
  try {
    const medicine = await medicineService.getDetails(req.params.id);
    return res.json(medicine);
  } catch (error) {
    return res.status(error.message === "Medicine not found" ? 404 : 400).json({ message: error.message });
  }
}

export async function searchMedicines(req, res) {
  try {
    const result = await medicineService.searchCatalog(req.query?.q || "");
    return res.json(result.matches);
  } catch (error) {
    console.error("[medicines.search]", error.message);
    return res.status(400).json({ message: error.message });
  }
}
