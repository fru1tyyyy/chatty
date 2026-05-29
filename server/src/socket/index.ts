import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../lib/jwt";
import { User } from "../models/User";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
}

// userId -> Set of socket IDs (multiple tabs)
const onlineUsers = new Map<string, Set<string>>();

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware
  io.use(async (socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const { userId } = verifyToken(token);
      const user = await User.findById(userId).select("username");
      if (!user) return next(new Error("User not found"));
      socket.userId = userId;
      socket.username = user.username;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`🟢 ${socket.username} connected (${socket.id})`);

    // Track online users
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);

    // Mark user online
    await User.findByIdAndUpdate(userId, { status: "online" });
    io.emit("user:status", { userId, status: "online" });

    // Join all conversation rooms
    const conversations = await Conversation.find({ participants: userId }).select("_id");
    conversations.forEach((c) => socket.join(c._id.toString()));

    // ─── Events ───────────────────────────────────────────────

    // Send a message
    socket.on("message:send", async (data: { conversationId: string; content: string; type?: string }) => {
      try {
        const message = await Message.create({
          conversation: data.conversationId,
          sender: userId,
          content: data.content,
          type: data.type || "text",
          readBy: [userId],
        });

        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });

        const populated = await message.populate("sender", "username avatar");

        // Emit to everyone in the room (including sender)
        io.to(data.conversationId).emit("message:new", populated);

        // Emit conversation update for sidebar refresh
        io.to(data.conversationId).emit("conversation:updated", {
          conversationId: data.conversationId,
          lastMessage: populated,
          lastMessageAt: new Date(),
        });
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicators
    socket.on("typing:start", (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit("typing:start", { userId, username: socket.username, conversationId: data.conversationId });
    });

    socket.on("typing:stop", (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit("typing:stop", { userId, conversationId: data.conversationId });
    });

    // Mark messages as read
    socket.on("messages:read", async (data: { conversationId: string }) => {
      await Message.updateMany(
        { conversation: data.conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      socket.to(data.conversationId).emit("messages:read", { userId, conversationId: data.conversationId });
    });

    // Join a new conversation room (after creating a DM/group)
    socket.on("conversation:join", (conversationId: string) => {
      socket.join(conversationId);
    });

    // ─── Disconnect ───────────────────────────────────────────

    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      sockets?.delete(socket.id);

      if (!sockets || sockets.size === 0) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });
        io.emit("user:status", { userId, status: "offline", lastSeen: new Date() });
        console.log(`🔴 ${socket.username} disconnected`);
      }
    });
  });

  return io;
};
