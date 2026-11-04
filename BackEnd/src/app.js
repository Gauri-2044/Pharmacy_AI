import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import agentRouter from "./routes/agent.routes.js";
import medicineRouter from "./routes/medicines.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
import prescriptionRoute from "./services/prescriptionRoute.js";

export const app = express();

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const startedAt = Date.now();
  const requestPath = req.originalUrl.split("?")[0];

  res.setHeader("x-request-id", requestId);
  console.log(`[request:start] ${requestId} ${req.method} ${requestPath}`);

  res.on("finish", () => {
    console.log(
      `[request:end] ${requestId} ${req.method} ${requestPath} ${res.statusCode} ${Date.now() - startedAt}ms`,
    );
  });

  next();
});

// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowed = [
//       process.env.CORS_ORIGIN,
//       "http://localhost:5173",
//       "http://localhost:5175",
//       "http://127.0.0.1:5173",
//       "http://127.0.0.1:5175",
//     ].filter(Boolean);

//     if (!origin) return callback(null, true);
//     if (allowed.includes(origin) || process.env.CORS_ORIGIN === "true") {
//       return callback(null, true);
//     }
//     return callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5175",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.json({ status: "ok", pid: process.pid });
});

app.use("/api", prescriptionRoute);
app.use("/api/auth", authRouter);
app.use("/api/chat", agentRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/agent", agentRouter);

app.use((req, res) => {
  const requestPath = req.originalUrl.split("?")[0];
  console.warn(`[request:404] ${req.method} ${requestPath}`);
  res.status(404).json({ error: "Route not found", path: requestPath });
});

app.use((error, req, res, next) => {
  const requestPath = req.originalUrl.split("?")[0];
  console.error(`[request:error] ${req.method} ${requestPath}`, error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(error.status || 500).json({
    error: "Internal server error",
    requestId: res.getHeader("x-request-id"),
  });
});

export default app;
