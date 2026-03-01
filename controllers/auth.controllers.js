import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const registerUser =async(req,res)=>{
    try {
        const {name,email,password,mobileNo,role} =req.body;//here we get that field from user

        if(!name || !email || !password || !mobileNo){
            return res.status(401).json({
                message:"Please fill all credentials..",
                success:false,
                
            })
        }
        let user =await User.findOne({email});//here we check that is User is already exit or not
      
        if(user){
            return res.status(401).json({
                message:"Email is already registered...",
                success:false,
                
            })
        }
        // Now we hash that password 
        const hashPassword =await bcrypt.hash(password, 10);//here we hash tht password

        user =await User.create({
            name,
            email,
            password:hashPassword,
            mobileNo,
            role
        })

        //At the end we return the Resposne from there
        return res.status(201).json({
            message:"User registered successfully..",
            success:true,
            user
        })
    } catch (error) {
        console.log("Error during the registeration of User..",error);
        return res.status(500).json({
            message:"User registration failed..",
            success:false,
        })
    }
}

//now for the login of user

export const login =async(req,res)=>{
    try {
        const {email,password} =req.body;//we will do login wiht email

        if(!email || !password){
            return res.status(401).json({
                message:"Please filled both email and password..",
                success:false
            })
        }
        let user =await User.findOne({email});

        if(!user){
            return res.status(404).json({
                message:"User is not registered yet...firstly signup the account..",
                success:false
            })
        }
        const isPasswordCorrect= await bcrypt.compare(password,user.password);
       
        if(!isPasswordCorrect){
            return res.status(400).json({
                success:false,
                message:"Email or password is incorrect..",
            })
        }
        //agar hamare pass user hai to
        // now we will create a cookie taki logged in user ki data ko store kr sake
         const tokenData = {
            userId: user._id,
            role: user.role // Now your backend knows the role from the token
        };
        const token =await jwt.sign(tokenData, process.env.JWT_TOKEN,{expiresIn:'1d'});//here we create the token


       
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            maxAge:1*24*60*60*100
        })

        return res.status(200).json({
            message:"User logged in successfully..",
            success:true,
            user
        })

    } catch (error) {
        console.log('Failed during login of user:',error);
        return res.status(500).json({
            message:"Failed to login the user",
            success:false
        })
    }
}

export const logout = async (req, res) => {
    try {
        
        return res.status(200).cookie("token", "", { 
                httpOnly: true,
                expires: new Date(0), // Immediate expiration
                sameSite: 'strict',
                secure: false
            })
            .json({
                message: "Logged out successfully.",
                success: true
            });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "Internal server error during logout.",
            success: false
        });
    }
};