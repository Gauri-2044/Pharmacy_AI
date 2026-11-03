import { db } from "../utils/db.js";

let schemaPromise;

async function getSchema(client) {
  if (!schemaPromise) {
    schemaPromise = client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'medicines'`
    ).then(({ rows }) => new Set(rows.map((row) => row.column_name)));
  }
  return schemaPromise;
}

const column = (schema, preferred, fallback) => schema.has(preferred) ? preferred : fallback;

async function selectFields(client) {
  const schema = await getSchema(client);
  const id = column(schema, "med_id", "id");
  const name = column(schema, "med_name", "name");
  const stock = schema.has("stock_quantity") && schema.has("stock")
    ? "COALESCE(stock_quantity, stock)"
    : column(schema, "stock_quantity", "stock");
  const prescription = column(schema, "requires_prescription", "prescription_required");
  return {
    schema,
    id,
    name,
    stock,
    prescription,
    fields: `${id} AS id, ${name} AS name, description,
      ${schema.has("composition") ? "composition" : "NULL::text"} AS composition,
      ${schema.has("dosage") ? "dosage" : schema.has("package_size") ? "package_size" : "NULL::text"} AS dosage,
      ${schema.has("side_effects") ? "side_effects" : "NULL::text"} AS side_effects,
      ${schema.has("contraindications") ? "contraindications" : "NULL::text"} AS contraindications,
      price, ${stock} AS stock, ${schema.has("category") ? "category" : "NULL::text"} AS category,
      ${schema.has("requires_prescription") ? "requires_prescription" : schema.has("prescription_required") ? "prescription_required" : "false"} AS prescription_required,
      created_at, updated_at`,
  };
}

const normalizeMedicine = (row) => ({
  ...row,
  price: Number(row.price),
  stock: Number(row.stock),
});

export const medicineRepository = {
  async findById(id, client = db) {
    const { fields, id: idColumn } = await selectFields(client);
    const result = await client.query(`SELECT ${fields} FROM medicines WHERE ${idColumn} = $1 LIMIT 1`, [id]);
    return result.rows[0] ? normalizeMedicine(result.rows[0]) : null;
  },

  async findByIdForUpdate(id, client) {
    const { fields, id: idColumn } = await selectFields(client);
    const result = await client.query(`SELECT ${fields} FROM medicines WHERE ${idColumn} = $1 FOR UPDATE`, [id]);
    return result.rows[0] ? normalizeMedicine(result.rows[0]) : null;
  },

  async search(name, client = db) {
    const { fields, id: idColumn, name: nameColumn, schema } = await selectFields(client);
    if (!name) {
      const result = await client.query(`SELECT ${fields} FROM medicines ORDER BY ${nameColumn} ASC`);
      return result.rows.map(normalizeMedicine);
    }

    const exact = await client.query(
      `SELECT ${fields} FROM medicines WHERE LOWER(${nameColumn}) = LOWER($1)
       ORDER BY ${nameColumn} ASC LIMIT 10`,
      [name]
    );
    if (exact.rows.length) return exact.rows.map(normalizeMedicine);

    const aliasesAvailable = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'medicine_aliases'
       ) AS available`
    );
    if (aliasesAvailable.rows[0]?.available) {
      const aliases = await client.query(
        `SELECT ${fields}
         FROM medicines m
         JOIN medicine_aliases a ON a.medicine_id = m.${idColumn}
         WHERE LOWER(a.alias) = LOWER($1)
         ORDER BY m.${nameColumn} ASC LIMIT 10`,
        [name]
      );
      if (aliases.rows.length) return aliases.rows.map(normalizeMedicine);
    }

    const extension = await client.query(
      "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS available"
    );
    if (extension.rows[0]?.available) {
      const fuzzy = await client.query(
        `SELECT ${fields}, similarity(${nameColumn}, $1) AS match_score
         FROM medicines
         WHERE similarity(${nameColumn}, $1) >= 0.25
         ORDER BY match_score DESC, ${nameColumn} ASC LIMIT 10`,
        [name]
      );
      if (fuzzy.rows.length) return fuzzy.rows.map(normalizeMedicine);
    }

    const partial = await client.query(
      `SELECT ${fields} FROM medicines
       WHERE LOWER(${nameColumn}) LIKE LOWER($1)
       ORDER BY ${nameColumn} ASC LIMIT 10`,
      [`%${name}%`]
    );
    return partial.rows.map(normalizeMedicine);
  },

  async getInventory(medicineId, client = db) {
    const { id: idColumn, name: nameColumn, stock } = await selectFields(client);
    const result = await client.query(
      `SELECT ${idColumn} AS id, ${nameColumn} AS name, ${stock} AS stock, price
       FROM medicines WHERE ${idColumn} = $1 LIMIT 1`,
      [medicineId]
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], stock: Number(result.rows[0].stock), price: Number(result.rows[0].price) };
  },
};
