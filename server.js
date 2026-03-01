import express from "express"
import cors from "cors"
import { dbConnect } from "./utils/dbConnect.js";
import dotenv from "dotenv"
import { userRouter } from "./routes/user.route.js";
import { bookRouter } from "./routes/book.route.js";
import { statsRouter } from "./routes/stats.route.js";
import { transectionRouter } from "./routes/transection.route.js";
import { authRouter } from "./routes/auth.route.js";
import { adminRouter } from "./routes/admin.route.js";
import cookieParser from "cookie-parser";


 const app =express();

dotenv.config();//here we configure the dotenv

const PORT =process.env.PORT||8080
const FRONTEND_URL=process.env.FRONTEND_URL 

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:FRONTEND_URL,
    credentials:true
}))
app.use(cookieParser());//here we call that cookie-parser as well

dbConnect();//here we connect our database

app.listen(PORT,()=>{
    console.log(`Server is listening at port:`,PORT);//here we connect the port
})

app.get("/",(req,res)=>{
    res.json({
        message:"Backend working properly.."
    })
})

app.use("/api/v1",authRouter)
app.use("/api/v1",userRouter);
app.use("/api/v1",bookRouter)
app.use("/api/v1",statsRouter)
app.use("/api/v1",transectionRouter)
app.use("/api/v1",adminRouter)

export default app;