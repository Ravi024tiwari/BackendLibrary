import express, { Router } from "express"
import { updateProfile,getProfile,deleteUser,searchStudent } from "../controllers/user.controller.js";
import { isAuthenticated,isAdmin } from "../middleware/isAuthenticated.js";
import { multipleUpload, singleUpload } from "../middleware/multer.js";

export const userRouter =Router();

userRouter.route("/profile").get(isAuthenticated, getProfile);
userRouter.route("/profile/update").put(isAuthenticated, singleUpload, updateProfile);// here we upload single profile pics


// Admin specific routes
userRouter.route("/admin/delete/:id").delete(isAuthenticated, isAdmin, deleteUser);
userRouter.route("/admin/search-student").get(isAuthenticated, isAdmin, searchStudent);

