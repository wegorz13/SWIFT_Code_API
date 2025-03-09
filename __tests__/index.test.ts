import app from "../index";

describe("Server initialization", () => {
  it("should start the server without errors", async () => {
    expect(app).toBeDefined();
  });
});
