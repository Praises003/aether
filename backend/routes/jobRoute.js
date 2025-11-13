import express from "express";
import { executeFunction} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", executeFunction);

export default router;
