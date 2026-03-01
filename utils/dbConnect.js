import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()
export const dbConnect =async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);//here we connect the database
        console.log('Database connected successfully..');
    } catch (error) {
        console.log("Database connection failed..",error)
        process.exit(1);
    }
}

