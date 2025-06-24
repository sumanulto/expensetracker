import { NextRequest } from "next/server";
import { generateToken } from "@/src/lib/auth";

// FIX: We are testing the actual middleware, so we need to import its real implementation, not the mock.
const { getUser } = jest.requireActual('@/src/lib/middleware');

describe("Middleware - Unit Tests", () => {
  it("should return user data for a valid token", () => {
    const userId = 123;
    const token = generateToken(userId);
    const request = new NextRequest("http://localhost", {
      headers: {
        cookie: `token=${token}`,
      },
    });

    const user = getUser(request);

    expect(user).toBeDefined();
    expect(user?.userId).toBe(userId);
  });

  it("should return null for a missing token", () => {
    const request = new NextRequest("http://localhost");
    const user = getUser(request);
    expect(user).toBeNull();
  });

  it("should return null for an invalid token", () => {
    const request = new NextRequest("http://localhost", {
      headers: {
        cookie: "token=invalid-token",
      },
    });
    const user = getUser(request);
    expect(user).toBeNull();
  });
});