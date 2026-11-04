import { app } from "../src/app.js";

console.log("[vercel] API function loaded", {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || "not set",
});

export default function handler(req, res) {
  const requestPath = (req.url || "").split("?")[0];
  console.log(`[vercel] request received: ${req.method} ${requestPath}`);
  return app(req, res);
}
