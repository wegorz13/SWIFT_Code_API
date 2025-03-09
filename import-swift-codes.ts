import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { SwiftData } from "./models/swift-data";

export async function importSwiftData(filePath: string) {
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
            console.warn("Skipping row due to missing fields", row);
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
          if (data.length > 0) {
            try {
              let insertedCount = 0;

              for (const entry of data) {
                const existingRecord = await SwiftData.findOne({
                  swiftCode: entry.swiftCode,
                });

                if (!existingRecord) {
                  await SwiftData.create(entry);
                  insertedCount++;
                }
              }
              console.log(`Successfully inserted ${insertedCount} records`);
              resolve(insertedCount);
            } catch (error) {
              console.error("Database insert error", error);
              reject(error);
            }
          } else {
            console.warn("No valid records to insert");
            resolve([]);
          }
        })
        .on("error", (error) => {
          console.error("CSV parsing error", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("Import error", error);
    throw error;
  }
}
