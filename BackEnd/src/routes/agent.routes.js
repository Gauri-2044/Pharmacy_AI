// src/routes/agent.routes.js
import express from "express";
import { chatWithAgent, confirmOrder, getChatHistory, clearChatHistory } from "../controllers/chat.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/chat/history", authenticate, getChatHistory);
router.delete("/chat/history", authenticate, clearChatHistory);
router.post("/chat", authenticate, chatWithAgent);
router.post("/confirm-order", authenticate, confirmOrder);

export default router;
