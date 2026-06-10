import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.find({ participants: req.userId })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participantId } = req.body;

    let conv = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.userId, participantId], $size: 2 },
    }).populate("participants", "-password");

    if (!conv) {
      conv = await Conversation.create({ participants: [req.userId, participantId] });
      conv = await conv.populate("participants", "-password");
    }

    res.status(201).json(conv);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/group", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participantIds, groupName } = req.body;
    const conv = await Conversation.create({
      participants: [req.userId, ...participantIds],
      isGroup: true,
      groupName,
    });
    const populated = await conv.populate("participants", "-password");
    res.status(201).json(populated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Message.updateMany(
      { conversation: req.params.id },
      { $addToSet: { deletedFor: req.userId } }
    );
    res.json({ message: "Conversation cleared" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
