import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swiftCodeRouter from "./routes/SwiftCodes";
import { importSwiftData } from "./import-swift-codes";

dotenv.config();
const port = 8080;

const app = express();

// do zmiany "mongodb://127.0.0.1:27017/swiftcodes"
mongoose.connect(
  process.env.DATABASE_URL || "mongodb://mongo:27017/swiftcodes",
  {
    serverSelectionTimeoutMS: 5000,
  }
);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to MongoDB"));

// uncomment if you want to load data from csv file when building
// (async () => {
//   try {
//     console.log("Importing SWIFT codes...");
//     await importSwiftData("/app/data/SWIFT_CODES.csv"); // Adjust the path to match your Docker setup
//     console.log("Data import successful!");
//   } catch (error) {
//     console.error("Failed to import initial data:", error);
//   }
// })();

app.use(express.json());

app.use("/v1/swift-codes", swiftCodeRouter);

app.get("/", (req, res) => {
  res.json("endpoint hit");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

export default app;
