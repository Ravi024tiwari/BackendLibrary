import express, { Router } from "express"

export const adminRouter =Router();

import { getAllStudents } from "../controllers/admin.controller.js";
import { isAuthenticated,isAdmin } from "../middleware/isAuthenticated.js";

// Route: GET /api/v1/admin/students
adminRouter.get("/admin/all-students", isAuthenticated, isAdmin, getAllStudents);
