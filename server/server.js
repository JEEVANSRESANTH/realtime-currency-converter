import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import http from "http";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import currencyRoutes from "./routes/currencies.js";
import historyRoutes from "./routes/history.js";
import { initSocket, getIO } from "./socket/index.js";
import { startRateWatcher } from "./services/rateWatcher.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});
app.use("/api", limiter);

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/currencydb")
  .then(() => {
    console.log("MongoDB Connected");
    startRateWatcher();
  })
  .catch((err) => console.log(err));

initSocket(server);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/history", historyRoutes);

app.get("/api/connected-clients", (req, res) => {
  const count = getIO().engine?.clientsCount || 0;
  res.json({ count });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port " + (process.env.PORT || 5000));
});

app.get("/", (req, res) => {
  res.send("Currency API Running 🚀");
});
