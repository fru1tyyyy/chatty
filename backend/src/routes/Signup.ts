import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../components/User";

const router = Router();

router.post("/", async(req, res) => {
    try{
        const{username, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({message: "Register Successfully :D "});
    } catch(err){
        res.status(500).json({message: "server.error"});
    }
});

export default router;
