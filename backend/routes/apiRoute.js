import express from "express";
import {
  getApiFunctions,
  createApiFunction,
} from "../controllers/apiController.js";

const router = express.Router();

// 🧩 GET all available API functions
router.get("/", getApiFunctions);

// 🧩 POST a new API function to the marketplace
router.post("/", createApiFunction);

export default router;
