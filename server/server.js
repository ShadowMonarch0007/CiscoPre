import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import groupRoutes from "./routes/groupRoutes.js";
import { errorHandler } from "./middleware/error.js";
dotenv.config();

import { connectDB } from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/groups", groupRoutes);

// centralized error handler
app.use(errorHandler);