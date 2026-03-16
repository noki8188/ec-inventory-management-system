import { signToken, verifyToken } from "../src/utils/jwt.js";

describe("jwt helpers", () => {
  it("encodes and decodes role payload", () => {
    const token = signToken({ userId: 12, role: "ADMIN" });
    expect(verifyToken(token)).toMatchObject({ userId: 12, role: "ADMIN" });
  });
});
