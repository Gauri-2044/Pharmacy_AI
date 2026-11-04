import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";

export const authService = {
  async register(input) {
    const { username, phone, email, password, confirmPassword } = input;
    if (!username || !phone || !email || !password || !confirmPassword) throw new Error("All fields are required");
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    if (await userRepository.findByEmail(email)) throw new Error("User already exists");
    return userRepository.create({ username, phone, email, hashedPassword: await bcrypt.hash(password, 10) });
  },

  async authenticate(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) throw new Error("All fields are required");
    const user = await userRepository.findByEmail(normalizedEmail);
    const passwordMatches = user?.hashed_password
      ? await bcrypt.compare(password, user.hashed_password)
      : false;
    const role = String(user?.user_role || "user").trim().toLowerCase();

    console.log("[auth.login.check]", {
      email: normalizedEmail,
      userFound: Boolean(user),
      passwordHashFormat: user?.hashed_password?.startsWith("$2") ? "bcrypt" : "missing-or-invalid",
      role: user ? role : null,
    });

    if (!user || !passwordMatches) throw new Error("Invalid credentials");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined in environment variables");
    return {
      token: jwt.sign({ user_id: user.user_id, role }, process.env.JWT_SECRET, { expiresIn: "1d" }),
      user: { user_id: user.user_id, username: user.user_name, email: user.email, role },
    };
  },
};
