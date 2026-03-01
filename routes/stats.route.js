import express, { Router } from "express";
import { getStudentStats,getAdminStats } from "../controllers/stats.controller.js";
import {isAuthenticated,isAdmin} from "../middleware/isAuthenticated.js"


const statsRouter =Router()

statsRouter.route("/student/dashboard").get(isAuthenticated, getStudentStats);
statsRouter.route("/admin/dashboard").get(isAuthenticated, isAdmin, getAdminStats);

export {statsRouter};