import jwt from "jsonwebtoken"

export const isAuthenticated =async(req,res,next)=>{
    try {
        const token = req.cookies.token;//here we get that token from the browser

        if(!token){
            return res.status(403).json({
                message:"User is not authenticated..",
                success:false
            })
        }
        //now agar token mil chuka hai then we decode that
        const decode = jwt.verify(token, process.env.JWT_TOKEN);//it return the payload

        if(!decode){
            return res.status(400).json({
                message:"User is not authenticated..",
                success:false
            })
        }
        req.id =decode.userId,
        req.role =decode.role//here we set that value in req object

        next();//call the next router
    } catch (error) {
        console.log('Error during the authentication of user:',error)
        return res.status(403).json({
            message:"User authentication failed..",
            success:false
        })
    }
}

export const isAdmin=async(req,res,next)=>{
    try {
        const role =req.role;//here we get that user role after the isAuthenticated passing of middlewar

        if(role!=="admin"){
            return res.status(401).json({
                message:"You are authenticated to this route..",
                success:false
            })
        }
        next();//agar admin hai to pass the route
    } catch (error) {
        console.log('Error during the authentication of role')
        return res.status(403).json({
            message:"User role authentication failed..",
            success:false
        })
    }
}