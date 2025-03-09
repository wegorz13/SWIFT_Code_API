import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swiftCodeRouter from "./routes/swift-codes";
import { importSwiftData } from "./import-swift-codes";

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== "test") {
  mongoose.connect(
    process.env.DATABASE_URL || "mongodb://mongo:27017/swiftcodes",
    {
      serverSelectionTimeoutMS: 5000,
    }
  );

  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to MongoDB"));

  (async () => {
    try {
      console.log("Importing SWIFT codes...");
      await importSwiftData("/app/data/SWIFT_CODES.csv");
      console.log("Data import successful");
    } catch (error) {
      console.error("Failed to import initial data", error);
    }
  })();
}

app.use(express.json());

app.use("/v1/swift-codes", swiftCodeRouter);

export default app;
