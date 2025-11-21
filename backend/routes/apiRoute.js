import express from "express";
import {
  getApiFunctions,
  getApiFunctionById,
  createApiFunction,
  deleteApiFunction
} from "../controllers/apiController.js";

const router = express.Router();

// 🧩 GET all available API functions
router.get("/", getApiFunctions);
router.get("/:id", getApiFunctionById);
// 🧩 POST a new API function to the marketplace
router.post("/", createApiFunction);
router.delete("/:id", deleteApiFunction);

export default router;
