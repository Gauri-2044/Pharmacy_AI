import { toolRegistry } from "./tool.registry.js";

export async function executeTool(name, args, context) {
  const tool = toolRegistry[name];
  if (!tool) return { ok: false, error: "Unsupported tool" };
  try {
    if (!args || typeof args !== "object" || Array.isArray(args)) throw new Error("Tool arguments must be an object");
    const result = await tool(args, context);
    return { ok: true, result };
  } catch (error) {
    console.error(`[agent.tool] ${name} failed:`, error.message);
    return { ok: false, error: error.message };
  }
}
