import { NextRequest } from "next/server";
import { POST as login } from "@/src/app/api/auth/login/route";
import { POST as register } from "@/src/app/api/auth/register/route";
import db from "@/src/lib/db";
import { verifyPassword } from "@/src/lib/auth";

// The db module is globally mocked in jest.setup.ts. We cast it to its mocked type.
const mockedDb = db as jest.Mocked<typeof db>;

// We also mock parts of the auth library to control their behavior in tests.
jest.mock("@/src/lib/auth", () => ({
  ...jest.requireActual("@/src/lib/auth"), // Use actual implementations by default
  generateToken: jest.fn((userId) => `mock_token_for_${userId}`),
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(async (password) => `hashed_${password}`),
}));

describe("Auth API Endpoints", () => {
  // Before each test, clear all mock history and implementations
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      // Arrange: Mock the database INSERT to return a successful result.
      mockedDb.execute.mockResolvedValue([{ insertId: 123 }] as any);

      const request = new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: "testregister",
          email: "test.register@example.com",
          password: "password123",
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await register(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(responseData.message).toBe("User registered successfully");
      expect(responseData.user).toEqual({
        id: 123,
        username: "testregister",
        email: "test.register@example.com",
      });
      expect(response.headers.get("set-cookie")).toContain("token=mock_token_for_123");
    });

    it("should return 409 for a duplicate email", async () => {
      // Arrange: Mock the database to throw a duplicate entry error.
      const duplicateError = new Error("Duplicate entry 'test.register@example.com' for key 'users.email'") as any;
      duplicateError.code = "ER_DUP_ENTRY";
      mockedDb.execute.mockRejectedValue(duplicateError);

      const request = new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: "anotheruser",
          email: "test.register@example.com",
          password: "password123",
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await register(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(responseData.error).toBe("Username or email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    const loginUserEmail = "test.login@example.com";
    const loginUserPassword = "password123";
    const userFromDb = {
      id: 1,
      username: "testlogin",
      email: loginUserEmail,
      password: "hashed_password",
    };

    it("should log in a user successfully with correct credentials", async () => {
      // Arrange: Mock DB to find the user and password verification to succeed.
      mockedDb.execute.mockResolvedValue([[userFromDb]] as any);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: loginUserEmail,
          password: loginUserPassword,
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await login(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.message).toBe("Login successful");
      expect(response.headers.get("set-cookie")).toContain("token=mock_token_for_1");
    });

    it("should return 401 for incorrect password", async () => {
      // Arrange: Mock DB to find the user but password verification to fail.
      mockedDb.execute.mockResolvedValue([[userFromDb]] as any);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: loginUserEmail,
          password: "wrongpassword",
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await login(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Invalid credentials");
    });

    it("should return 401 for a non-existent user", async () => {
      // Arrange: Mock DB to return no user.
      mockedDb.execute.mockResolvedValue([[]] as any);

      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: "nouser@example.com",
          password: "password123",
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await login(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Invalid credentials");
    });
  });
});