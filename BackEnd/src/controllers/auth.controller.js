import { authService } from "../services/auth.service.js";

export async function registerUser(req, res) {
  try {
    await authService.register(req.body || {});
    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    const status = ["User already exists", "Passwords do not match", "All fields are required"].includes(error.message) ? 400 : 500;
    console.error("[auth.register]", error.message);
    return res.status(status).json({ message: status === 500 ? "Server error" : error.message });
  }
}

export async function loginUser(req, res) {
  try {
    const result = await authService.authenticate(req.body?.email, req.body?.password);
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ message: "Login successful", ...result });
  } catch (error) {
    const status = ["All fields are required", "Invalid credentials"].includes(error.message) ? 400 : 500;
    console.error("[auth.login]", error.message);
    return res.status(status).json({ message: status === 500 ? "Server error" : error.message });
  }
}

export function logoutUser(req, res) {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res.json({ message: "Logged out successfully" });
}

export function getCurrentUser(req, res) {
  return res.json({ user: req.user || null });
}
