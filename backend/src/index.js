import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [frontendUrl].filter(Boolean)
  : ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Bufferchat backend is running!");
});


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend", "dist", "index.html")
    );
  });
}

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log("server is running on PORT:" + PORT);
    });
  } catch (error) {
    console.error("Server startup failed. Check MONGODB_URI and MongoDB network access.");
    process.exitCode = 1;
  }
};

startServer();
