import { getGeminiClient, GEMINI_MODEL } from "../config/gemini.js";
import { toolDefinitions } from "./tool.definitions.js";
import { executeTool } from "./tool.executor.js";

const systemInstruction = `You are a pharmacy catalog and ordering assistant.
You may search the catalog, show database medicine information, check inventory, prepare order drafts, and show authenticated order status.
Never diagnose, prescribe, change dosages, claim clinical equivalence, or place an order. Prescription-required dispensing needs pharmacist verification.
Use tools for database facts. Ask for clarification when medicine identity is ambiguous.`;

const fallbackName = (message) => {
  const match = String(message).match(/(?:of|for|buy|order|search)\s+([a-z0-9][a-z0-9 -]{1,80})/i);
  return (match?.[1] || String(message).replace(/[?.!]/g, "")).replace(/^\d+\s+/, "").trim();
};

async function localFallback(message, context) {
  if (!/\b(medicine|drug|pharmacy|prescription|dosage|dose|pill|tablet|stock|price|order|buy|purchase)\b/i.test(message)) {
    return "I can help with pharmacy catalog searches, medicine details, inventory checks, and order drafts. What medicine would you like to ask about?";
  }
  const requestedName = fallbackName(message);
  const result = await executeTool("search_medicine_catalog", { name: requestedName }, context);
  if (!result.ok) return "I could not search the medicine catalog right now. Please try again.";
  if (!result.result.matches.length) return `I could not find a reliable catalog match for "${result.result.query}". Please check the spelling or provide the strength and dosage form.`;
  if (result.result.requiresClarification) return `I found multiple possible matches for "${result.result.query}". Please select a specific medicine by name, strength, or dosage form.`;
  const medicine = result.result.matches[0];
  if (/\b(order|buy|purchase)\b/i.test(message)) {
    const quantity = Number(message.match(/\b(\d+)\b/)?.[1] || 1);
    if (medicine.stock < quantity) return `Insufficient stock for ${medicine.name}. Only ${medicine.stock} units are available.`;
    return {
      reply: `I found ${medicine.name}. Please review the order draft for ${quantity} unit(s) at Rs ${medicine.price * quantity}, then confirm it.`,
      toolResults: [{ name: "prepare_order_draft", ok: true }],
      order: { medicine_id: medicine.id, medicine_name: medicine.name, quantity, price_per_unit: medicine.price, total_price: medicine.price * quantity },
    };
  }
  return `${medicine.name} is in the catalog at Rs ${medicine.price}. Stock: ${medicine.stock}. Please use a specific medicine selection before preparing an order.`;
}

export async function runPharmacyAgent({ message, history = [], context = {} }) {
  const ai = getGeminiClient();
  if (!ai) {
    const fallback = await localFallback(message, context);
    return typeof fallback === "string" ? { reply: fallback, toolResults: [] } : fallback;
  }

  const contents = [
    { role: "user", parts: [{ text: systemInstruction }] },
    ...history.slice(-10).map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: String(entry.content || "").slice(0, 2000) }],
    })),
    { role: "user", parts: [{ text: String(message).slice(0, 4000) }] },
  ];
  const toolResults = [];

  for (let turn = 0; turn < 4; turn += 1) {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.1,
        tools: [{ functionDeclarations: toolDefinitions }],
      },
    });
    const parts = response?.candidates?.[0]?.content?.parts || [];
    const calls = parts.filter((part) => part.functionCall);
    if (!calls.length) {
      return { reply: String(response?.text || "I could not generate a response. Please try again."), toolResults };
    }

    contents.push({ role: "model", parts });
    const functionResponses = [];
    for (const part of calls) {
      const call = part.functionCall;
      const result = await executeTool(call.name, call.args || {}, context);
      toolResults.push({ name: call.name, ok: result.ok, result: result.ok ? result.result : undefined });
      functionResponses.push({ functionResponse: { name: call.name, response: result.ok ? result.result : { error: result.error } } });
    }
    contents.push({ role: "user", parts: functionResponses });
  }

  throw new Error("Gemini tool-calling cycle exceeded its limit");
}
