import { hashPassword, verifyPassword, generateToken, verifyToken } from "@/src/lib/auth"

describe("Auth Utilities - Unit Tests", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "testpassword123"
      const hashedPassword = await hashPassword(password)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it("should generate different hashes for the same password", async () => {
      const password = "testpassword123"
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testpassword123"
      const hashedPassword = await hashPassword(password)

      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it("should reject incorrect password", async () => {
      const password = "testpassword123"
      const wrongPassword = "wrongpassword"
      const hashedPassword = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const userId = 123
      const token = generateToken(userId)

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3) // JWT has 3 parts
    })
  })

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const userId = 123
      const token = generateToken(userId)

      const decoded = verifyToken(token)
      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(userId)
    })

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.token.here"

      const decoded = verifyToken(invalidToken)
      expect(decoded).toBeNull()
    })

    it("should return null for expired token", () => {
      // Create a token that expires immediately
      const jwt = require("jsonwebtoken")
      const expiredToken = jwt.sign({ userId: 123 }, process.env.JWT_SECRET, { expiresIn: "0s" })

      // Wait a moment to ensure expiration
      setTimeout(() => {
        const decoded = verifyToken(expiredToken)
        expect(decoded).toBeNull()
      }, 100)
    })
  })
})
