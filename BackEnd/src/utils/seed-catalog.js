import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.NEON_URL) {
  throw new Error("NEON_URL is not configured in BackEnd/.env");
}

const catalog = [
  ["Paracetamol 500 mg", "TEST-MED-001", 35, 100, "Pack of 10 tablets", "Synthetic catalogue entry for testing medicine search."],
  ["ORS Powder", "TEST-MED-002", 25, 80, "Pack of 1 sachet", "Oral rehydration salts product catalogue entry."],
  ["Cetirizine 10 mg", "TEST-MED-003", 45, 60, "Pack of 10 tablets", "Synthetic catalogue entry for search and inventory testing."],
  ["Antacid Chewable Tablets", "TEST-MED-004", 55, 45, "Pack of 10 tablets", "Antacid product catalogue entry."],
  ["Calamine Lotion", "TEST-MED-005", 85, 30, "100 ml bottle", "Topical healthcare product catalogue entry."],
  ["Povidone Iodine Solution", "TEST-MED-006", 110, 25, "100 ml bottle", "Antiseptic product catalogue entry."],
  ["Saline Nasal Drops", "TEST-MED-007", 50, 40, "10 ml bottle", "Nasal saline product catalogue entry."],
  ["Zinc Tablets", "TEST-MED-008", 65, 50, "Pack of 10 tablets", "Synthetic catalogue entry for search testing."],
  ["Vitamin C Tablets", "TEST-MED-009", 75, 70, "Pack of 10 tablets", "Synthetic catalogue entry for inventory testing."],
  ["Ibuprofen 200 mg", "TEST-MED-010", 40, 0, "Pack of 10 tablets", "Synthetic catalogue entry with zero stock for availability testing."],
];

const pool = new pg.Pool({ connectionString: process.env.NEON_URL });

try {
  for (const [name, pzn, price, stock, packageSize, description] of catalog) {
    await pool.query(
      `INSERT INTO medicines
        (name, pzn, price, stock, stock_quantity, package_size, description, requires_prescription, dosage)
       VALUES ($1, $2, $3, $4, $4, $5::text, $6, FALSE, $5::text)
       ON CONFLICT (name) DO UPDATE SET
         pzn = EXCLUDED.pzn,
         price = EXCLUDED.price,
         stock = EXCLUDED.stock,
         stock_quantity = EXCLUDED.stock_quantity,
         package_size = EXCLUDED.package_size,
         description = EXCLUDED.description,
         requires_prescription = EXCLUDED.requires_prescription,
         dosage = EXCLUDED.dosage,
         updated_at = CURRENT_TIMESTAMP`,
      [name, pzn, price, stock, packageSize, description]
    );
  }

  console.log(`Inserted or updated ${catalog.length} catalogue medicines.`);
} finally {
  await pool.end();
}
