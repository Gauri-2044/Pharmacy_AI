import { userPreferencesRepository } from "../repositories/user-preferences.repository.js";

const medicineTerms = (medicine) => [
  medicine.name,
  medicine.composition,
  medicine.description,
  medicine.dosage,
].filter(Boolean).join(" ").toLowerCase();

export async function checkMedicineAgainstUserAllergies(userId, medicine) {
  if (!userId) return [];
  const preferences = await userPreferencesRepository.findByUserId(userId);
  const analysis = preferences?.allergy_analysis;
  const searchableMedicine = medicineTerms(medicine);
  if (!analysis?.matchedTriggers?.length || !searchableMedicine) return [];

  return analysis.matchedTriggers
    .filter((trigger) => {
      if (trigger.label === "Penicillin-family medicine") {
        return /\b(amoxicillin|penicillin|ampicillin|beta-lactam)\b/i.test(searchableMedicine);
      }
      if (trigger.label === "Sulfonamide medicine") {
        return /\b(sulfa|sulfonamide|sulfamethoxazole)\b/i.test(searchableMedicine);
      }
      if (trigger.label === "Latex") {
        return /\blatex\b/i.test(searchableMedicine);
      }
      return false;
    })
    .map((trigger) => ({
      type: "allergy_safety_warning",
      allergy: trigger.label,
      message: `This medicine may be associated with the reported ${trigger.label} allergy. Do not proceed without pharmacist or clinician review.`,
    }));
}
