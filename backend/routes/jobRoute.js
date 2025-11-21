// routes/hcsRoute.js
import express from "express";
import { submitJobToHCS } from "../controllers/jobController.js";

const router = express.Router();

// Single endpoint to trigger HCS job submission
router.post("/submit", submitJobToHCS);

export default router;