import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from './config/db.js';
import authRoute from "./routes/authRoute.js";
import apiRoute from "./routes/apiRoute.js";
import jobRoute from "./routes/jobRoute.js";
import resultRoute from "./routes/resultRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import {startHCSListener} from "./services/hcsListenerService.js";

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://afiya-yx0e.onrender.com', "https://aether-gilt-delta.vercel.app"];

dotenv.config();

const app = express();


app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use("/api/auth", authRoute);
app.use("/api/function", apiRoute); 
app.use("/api/hcs", jobRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/result", resultRoute);

connectDB();
startHCSListener();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
