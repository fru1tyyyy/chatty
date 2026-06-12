import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();
router.use(authenticate);

router.get("/search", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q) { res.json([]); return; }

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("username email avatar status").limit(10);

    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
