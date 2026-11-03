export const toolDefinitions = [
  {
    name: "search_medicine_catalog",
    description: "Search the pharmacy catalog by exact name, alias, or safe fuzzy name matching.",
    parameters: { type: "OBJECT", properties: { name: { type: "STRING", description: "Medicine name to search" } }, required: ["name"] },
  },
  {
    name: "get_medicine_details",
    description: "Get database details for a selected medicine.",
    parameters: { type: "OBJECT", properties: { medicine_id: { type: "INTEGER" } }, required: ["medicine_id"] },
  },
  {
    name: "check_inventory",
    description: "Read-only inventory check for a selected medicine.",
    parameters: { type: "OBJECT", properties: { medicine_id: { type: "INTEGER" } }, required: ["medicine_id"] },
  },
  {
    name: "prepare_order_draft",
    description: "Prepare an order summary for explicit user review; never places an order.",
    parameters: { type: "OBJECT", properties: { items: { type: "ARRAY", items: { type: "OBJECT" } } }, required: ["items"] },
  },
  {
    name: "get_order_status",
    description: "Get an order belonging to the authenticated user, or any order for an admin.",
    parameters: { type: "OBJECT", properties: { order_id: { type: "INTEGER" } }, required: ["order_id"] },
  },
];
