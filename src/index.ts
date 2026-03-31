import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { seedAdmin } from "./controllers/authController";
import eventRoutes from './routes/eventRoutes';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import meRoutes from "./routes/meRoutes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/me", meRoutes);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("✅ MongoDB Connecté");
    seedAdmin();
  })
  .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`🚀 Serveur sur le port ${PORT}`));
