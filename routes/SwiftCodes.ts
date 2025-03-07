import express, { Express, Request, Response } from "express";
import { SwiftData } from "../models/SwiftData";

const router = express.Router();

router.get("/country/:iso2_code", async (req, res) => {
  const iso2Code = req.params.iso2_code;
  try {
    const swiftCodes = await SwiftData.find(
      { countryISO2: iso2Code },
      { address: true, name: true, countryIso2Code: true, swiftCode: true }
    );
    res.json({ countryISO2: iso2Code, swiftCodes: swiftCodes }); //ma byc inna odpowiedz
  } catch {
    res.status(500); //dodac err message
  }
});

router.get("/:swift_code", async (req, res) => {
  const swiftCode = req.params.swift_code;
  try {
    const data = await SwiftData.find({ swiftCode: swiftCode });
    res.json(data); //ma byc inna odpowiedz
  } catch {
    res.status(500).json({ message: "Internal server error" }); //dodac err message
  }
});

router.post("/", async (req, res) => {
  const {
    address,
    bankName,
    countryISO2,
    countryName,
    isHeadquarter,
    swiftCode,
  } = req.body;

  if (
    !swiftCode ||
    !bankName ||
    !countryISO2 ||
    !address ||
    !countryName ||
    !isHeadquarter
  ) {
    res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    const existingCode = await SwiftData.find({ swiftCode: swiftCode });

    if (existingCode.length > 0) {
      res.status(409).json({ message: "SWIFT code already exists" });
      return;
    }
    const newSwiftData = new SwiftData({
      countryISO2,
      swiftCode,
      bankName,
      address,
      countryName,
      isHeadquarter,
    });
    await newSwiftData.save();
    res.status(201).json({ message: "SWIFT code added successfully" });
  } catch {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// In your SwiftCodes.ts router file
router.delete("/", async (req, res) => {
  try {
    const result = await SwiftData.deleteMany({});

    res.json({
      message: "Collection cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear Collection Error:", error);
    res.status(500).json({
      message: "Failed to clear collection",
    });
  }
});

router.delete("/:swift_code", async (req, res) => {
  const swiftCode = req.params.swift_code;
  try {
    const swiftCodeToDelete = await SwiftData.find({ swiftCode: swiftCode });
    if (swiftCodeToDelete.length == 0) {
      res.status(404).json({ message: "SWIFT code doesn't exist" });
      return;
    }
    await SwiftData.deleteOne({ swiftCode: swiftCode });
    res.status(201).json({ message: "SWIFT code deleted successfully" });
  } catch {
    res.status(500);
  }
});

export default router;
