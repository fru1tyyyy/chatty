import mongoose from "mongoose";

export const connectDB = async () => {
    const url = process.env.MONGODB_URI || "mongodb://localhost:27017/chatappp";
    try {
        await mongoose.connect(url);
        console.log("MongoDB connected :D");
    } catch (err){
        console.error("MongoDB connected unsuccessful :(", err);
        process.exit(1);
    }
};
