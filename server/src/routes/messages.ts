import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";

const router = Router();
router.use(authenticate);

router.get("/:conversationId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
      deletedFor: { $ne: req.userId },
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: req.params.conversationId, readBy: { $ne: req.userId } },
      { $addToSet: { readBy: req.userId } }
    );

    res.json(messages);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:conversationId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, type = "text" } = req.body;
    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.userId,
      content,
      type,
      readBy: [req.userId],
    });

    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populated = await message.populate("sender", "username avatar");
    res.status(201).json(populated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Message.findByIdAndUpdate(req.params.id, {
      $addToSet: { deletedFor: req.userId },
    });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
