import express, { Express, Request, Response } from "express";
import { SwiftData } from "../models/swift-data";

const router = express.Router();

router.get("/country/:iso2_code", async (req, res) => {
  const countryISO2 = req.params.iso2_code;
  try {
    const swiftData = await SwiftData.findOne(
      { countryISO2: countryISO2 },
      {
        countryName: 1,
        _id: 0,
      }
    );

    if (!swiftData) {
      res.status(404).json({ message: "Country doesn't exist" });
      return;
    }

    const countryName = swiftData?.countryName;

    const swiftCodes = await SwiftData.find(
      { countryISO2: countryISO2 },
      {
        address: 1,
        name: 1,
        countryISO2: 1,
        swiftCode: 1,
        isHeadquarter: 1,
        _id: 0,
      }
    );
    res.json({
      countryISO2: countryISO2,
      countryName: countryName,
      swiftCodes: swiftCodes,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:swift_code", async (req, res) => {
  const swiftCode = req.params.swift_code;
  try {
    const data = await SwiftData.findOne({ swiftCode: swiftCode });
    if (!data?.swiftCode) {
      res.status(404).json({
        message: "Swift code doesn't exist",
      });
      return;
    }
    if (!data.isHeadquarter) {
      res.json(data); //ma byc inna odpowiedz
    } else {
      const branchPrefix = swiftCode.slice(0, 8); // First 8 characters
      const branches = await SwiftData.find(
        {
          swiftCode: { $ne: swiftCode, $regex: `^${branchPrefix}` }, // Matches same first 8 letters, excludes itself
        },
        { _id: 0, __v: 0 }
      );

      res.json({
        address: data.address,
        bankName: data.bankName,
        countryISO2: data.countryISO2,
        coutryName: data.countryName,
        swiftCode: data.swiftCode,
        branches: branches,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
    return;
  }

  try {
    const existingCode = await SwiftData.findOne({ swiftCode: swiftCode });

    if (existingCode?.swiftCode == swiftCode) {
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

router.delete("/:swift_code", async (req, res) => {
  const swiftCode = req.params.swift_code;
  try {
    const deleted = await SwiftData.deleteOne({ swiftCode: swiftCode });

    if (deleted.deletedCount === 0) {
      res.status(404).json({ message: "SWIFT code doesn't exist" });
      return;
    }

    res.status(201).json({ message: "SWIFT code deleted successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
