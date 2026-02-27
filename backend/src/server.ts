import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Login from "./routes/Login";
import Signup from "./routes/Signup";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/Login", Login);
app.use("/api/Signup", Signup);

mongoose.connect(process.env.MONGO_URI as string)
.then(() => {
    console.log("MongoDB connected !!!");
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
})
.catch((err) => console.log(err));
