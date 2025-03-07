import mongoose from "mongoose";

const swiftDataSchema = new mongoose.Schema({
  countryISO2: { type: String, required: true },
  swiftCode: { type: String, required: true },
  bankName: { type: String, required: true },
  address: { type: String, required: true },
  countryName: { type: String, required: true },
  isHeadquarter: { type: Boolean, required: true },
});

export const SwiftData = mongoose.model("SwiftData", swiftDataSchema);
