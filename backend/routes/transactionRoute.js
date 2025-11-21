import express from "express";
import { submitSignedTransaction } from "../controllers/transactionController.js";

const router = express.Router();
router.post("/submit", submitSignedTransaction);

export default router;
