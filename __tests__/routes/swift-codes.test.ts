import request from "supertest";
import app from "../../index";
import { SwiftData } from "../../models/swift-data";
import { connectDB, disconnectDB } from "../../setup-test-db";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("GET /v1/swift-codes/:swift_code - Headquarter and branch", () => {
  beforeEach(async () => {
    await SwiftData.create([
      {
        swiftCode: "ALBPPLPWXXX",
        bankName: "Test Bank",
        address: "Cracow HQ",
        countryISO2: "PL",
        countryName: "POLAND",
        isHeadquarter: true,
      },
      {
        swiftCode: "ALBPPLPWBMW",
        bankName: "Test Bank",
        address: "Warsaw Branch",
        countryName: "POLAND",
        countryISO2: "PL",
        isHeadquarter: false,
      },
    ]);
  });

  afterEach(async () => {
    await SwiftData.deleteMany({});
  });

  it("Should return headquarter details along with branches", async () => {
    const res = await request(app).get("/v1/swift-codes/ALBPPLPWXXX");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("swiftCode", "ALBPPLPWXXX");
    expect(res.body).toHaveProperty("branches");
    expect(res.body.branches).toHaveLength(1);
    expect(res.body.branches[0].swiftCode).toBe("ALBPPLPWBMW");
  });

  it("Should return single branch information", async () => {
    const res = await request(app).get("/v1/swift-codes/ALBPPLPWBMW");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("swiftCode", "ALBPPLPWBMW");
    expect(res.body).toHaveProperty("bankName", "Test Bank");
    expect(res.body).toHaveProperty("address", "Warsaw Branch");
    expect(res.body).toHaveProperty("countryName", "POLAND");
    expect(res.body).toHaveProperty("countryISO2", "PL");
    expect(res.body).toHaveProperty("isHeadquarter", false);
  });

  it("Should return error message", async () => {
    const res = await request(app).get("/v1/swift-codes/wrong_code");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Swift code doesn't exist");
  });
});

describe("GET /country/:iso2_code", () => {
  beforeEach(async () => {
    await SwiftData.create([
      {
        swiftCode: "ALBPPLPWXXX",
        bankName: "Test Bank",
        address: "Cracow HQ",
        countryISO2: "PL",
        countryName: "POLAND",
        isHeadquarter: true,
      },
      {
        swiftCode: "ALBPPLPWBMW",
        bankName: "Test Bank",
        address: "Warsaw Branch",
        countryName: "POLAND",
        countryISO2: "PL",
        isHeadquarter: false,
      },
    ]);
  });

  it("should return country SWIFT codes", async () => {
    const res = await request(app).get("/v1/swift-codes/country/PL");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("countryName", "POLAND");
    expect(res.body).toHaveProperty("countryISO2", "PL");
    expect(res.body.swiftCodes).toHaveLength(2);
  });

  it("should return 404 if country doesnt exist", async () => {
    const res = await request(app).get("/v1/swift-codes/country/XX");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Country doesn't exist");
  });
});

describe("POST /v1/swift-codes", () => {
  it("should add a new SWIFT code", async () => {
    const res = await request(app).post("/v1/swift-codes").send({
      swiftCode: "TESTBANKXXX",
      bankName: "Test Bank",
      countryISO2: "PL",
      countryName: "POLAND",
      address: "123 Test Street",
      isHeadquarter: true,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "SWIFT code added successfully");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/v1/swift-codes")
      .send({ swiftCode: "TEST1234XXX" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing required fields");
  });

  it("should return 409 if SWIFT code already exists", async () => {
    await SwiftData.create({
      swiftCode: "EXIST123XXX",
      bankName: "Existing Bank",
      countryISO2: "DE",
      countryName: "GERMANY",
      address: "123 Test Street",
      isHeadquarter: true,
    });
    const res = await request(app).post("/v1/swift-codes").send({
      swiftCode: "EXIST123XXX",
      bankName: "Existing Bank",
      countryISO2: "DE",
      countryName: "GERMANY",
      address: "123 Test Street",
      isHeadquarter: true,
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message", "SWIFT code already exists");
  });
});

describe("DELETE /v1/swift-codes/:swift_code", () => {
  beforeEach(async () => {
    await SwiftData.create({
      swiftCode: "DELETE12XXX",
      bankName: "Delete Bank",
      countryISO2: "DE",
      countryName: "GERMANY",
      address: "123 Test Street",
      isHeadquarter: true,
    });
  });

  it("should delete a SWIFT code", async () => {
    const res = await request(app).delete("/v1/swift-codes/DELETE12XXX");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty(
      "message",
      "SWIFT code deleted successfully"
    );

    const check = await SwiftData.findOne({ swiftCode: "DELETE12XXX" });
    expect(check).toBeNull();
  });

  it("should return 404 if SWIFT code does not exist", async () => {
    const res = await request(app).delete("/v1/swift-codes/NONEXISTXXX");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "SWIFT code doesn't exist");
  });
});
