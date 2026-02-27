import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../components/User";

const router = Router();

router.post("/", async(req, res) => {
    try{
        const{email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "invalid login info"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid login info"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET as string, {expiresIn: "1d"});
        res.json({token});
    } catch(err){
        res.status(500).json({message: "Server Error"});
    }
});

export default router;
