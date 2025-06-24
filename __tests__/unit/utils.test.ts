import { formatCurrency, toNumber, formatPercentage } from "@/src/lib/utils"

describe("Utility Functions - Unit Tests", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers correctly", () => {
      expect(formatCurrency(100)).toBe("₹100.00")
      expect(formatCurrency(1234.56)).toBe("₹1234.56")
      expect(formatCurrency("500")).toBe("₹500.00")
    })

    it("should handle zero and negative numbers", () => {
      expect(formatCurrency(0)).toBe("₹0.00")
      expect(formatCurrency(-100)).toBe("₹-100.00")
    })

    it("should handle null and undefined values", () => {
      expect(formatCurrency(null)).toBe("₹0.00")
      expect(formatCurrency(undefined)).toBe("₹0.00")
    })

    it("should handle string inputs", () => {
      expect(formatCurrency("123.45")).toBe("₹123.45")
      expect(formatCurrency("invalid")).toBe("₹0.00")
    })
  })

  describe("toNumber", () => {
    it("should convert valid inputs to numbers", () => {
      expect(toNumber(100)).toBe(100)
      expect(toNumber("123.45")).toBe(123.45)
      expect(toNumber("0")).toBe(0)
    })

    it("should handle invalid inputs", () => {
      expect(toNumber(null)).toBe(0)
      expect(toNumber(undefined)).toBe(0)
      expect(toNumber("invalid")).toBe(0)
      expect(toNumber("")).toBe(0)
    })
  })

  describe("formatPercentage", () => {
    it("should format percentages correctly", () => {
      expect(formatPercentage(50)).toBe("50.0%")
      expect(formatPercentage(75.5)).toBe("75.5%")
      expect(formatPercentage("25")).toBe("25.0%")
    })

    it("should handle edge cases", () => {
      expect(formatPercentage(0)).toBe("0.0%")
      expect(formatPercentage(100)).toBe("100.0%")
      expect(formatPercentage(null)).toBe("0.0%")
      expect(formatPercentage(undefined)).toBe("0.0%")
    })
  })
})
