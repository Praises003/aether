import express from "express";
import { checkJobResult } from "../controllers/resultController.js";

const router = express.Router();

router.get("/:jobId", checkJobResult);

export default router;