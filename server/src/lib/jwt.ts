import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string): { userId: string } =>
  jwt.verify(token, SECRET) as { userId: string };
