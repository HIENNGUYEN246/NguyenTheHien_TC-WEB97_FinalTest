import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helloRouter from "./routes/helloRoutes.js";
import teacherRouter from "./routes/teacherRoutes.js";
import positionRouter from "./routes/positionRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern-app";

app.use(cors());
app.use(express.json());
app.use("/api", helloRouter);
app.use("/api", teacherRouter);
app.use("/api", positionRouter);
app.use("/api", userRouter);

app.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB and server listening on http://localhost:${PORT}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
});
