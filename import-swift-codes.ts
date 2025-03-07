import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { SwiftData } from "./models/SwiftData";

export async function importSwiftData(filePath: string) {
  console.log("📂 Importing data from:", filePath);

  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== ".csv") throw new Error("Only .csv files are supported");

    const data: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const countryISO2 = row["COUNTRY ISO2 CODE"];
          const swiftCode = row["SWIFT CODE"];
          const bankName = row["NAME"];
          const address = row["ADDRESS"];
          const countryName = row["COUNTRY NAME"];

          if (
            !countryISO2 ||
            !swiftCode ||
            !bankName ||
            !address ||
            !countryName
          ) {
            console.warn("⚠️ Skipping row due to missing fields:", row);
            return;
          }

          data.push({
            countryISO2,
            swiftCode,
            bankName,
            address,
            countryName,
            isHeadquarter: swiftCode.slice(-3) === "XXX",
          });
        })
        .on("end", async () => {
          console.log(`✅ Processed ${data.length} valid records`);

          if (data.length > 0) {
            try {
              const result = await SwiftData.insertMany(data);
              console.log(`✅ Successfully inserted ${result.length} records`);
              resolve(result);
            } catch (dbError) {
              console.error("❌ Database Insert Error:", dbError);
              reject(dbError);
            }
          } else {
            console.warn("⚠️ No valid records to insert.");
            resolve([]);
          }
        })
        .on("error", (error) => {
          console.error("❌ CSV Parsing Error:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("❌ Import Error:", error);
    throw error;
  }
}
