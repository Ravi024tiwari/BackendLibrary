import express, { Router } from "express"
import {registerUser,login,logout} from "../controllers/auth.controllers.js"

export const authRouter =Router()

authRouter.post("/register",registerUser);
authRouter.post("/login",login)
authRouter.post("/logout",logout)

