import { GoogleGenAI } from "@google/genai";

const normalizeApiKey = (value) => String(value || "").trim().replace(/^["']|["']$/g, "");

export function getGeminiClient() {
  const apiKey = normalizeApiKey(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
