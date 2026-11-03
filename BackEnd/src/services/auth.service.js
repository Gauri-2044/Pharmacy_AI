import bcrypt from "bcrypt";
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
    if (!email || !password) throw new Error("All fields are required");
    const user = await userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.hashed_password))) throw new Error("Invalid credentials");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined in environment variables");
    return {
      token: jwt.sign({ user_id: user.user_id, role: user.user_role }, process.env.JWT_SECRET, { expiresIn: "1d" }),
      user: { user_id: user.user_id, username: user.user_name, email: user.email, role: user.user_role },
    };
  },
};
