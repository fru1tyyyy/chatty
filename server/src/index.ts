import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db";
import { initSocket } from "./socket";
import authRoutes from "./routes/auth";
import conversationRoutes from "./routes/conversations";
import messageRoutes from "./routes/messages";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Socket.io
initSocket(httpServer);

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});