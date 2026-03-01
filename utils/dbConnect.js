import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()
let cached =null;
export const dbConnect =async()=>{
    try {
        if(!cached){
            cached = await mongoose.connect(process.env.MONGODB_URL);//here we connect the database

        }
        console.log('Database connected successfully..');
    } catch (error) {
        console.log("Database connection failed..",error)
        process.exit(1);
    }
}

