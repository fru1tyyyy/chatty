import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { signToken } from "../lib/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields required" });
      return;
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      res.status(409).json({ message: "Username or email already taken" });
      return;
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user._id.toString());

    res.status(201).json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
