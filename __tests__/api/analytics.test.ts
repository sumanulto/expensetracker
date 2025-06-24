import { NextRequest } from "next/server";
import { GET as getAnalytics } from "@/src/app/api/analytics/route";
import { generateToken } from "@/src/lib/auth";
import pool from "@/src/lib/db";
import { getUser } from "@/src/lib/middleware";

// Mocks are now global, so we just need to cast them
const mockExecute = (pool as any).execute as jest.Mock;
const mockGetUser = getUser as jest.Mock;

describe("Analytics API Endpoint", () => {
  const mockUser = { userId: 1 };
  const mockToken = generateToken(1);

  // NOTE: The afterAll hook that called db.end() has been REMOVED.
  // The global teardown script now handles this.

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockReturnValue(mockUser);
  });

  describe("GET /api/analytics", () => {
    it("should return analytics data", async () => {
      const mockCategoryData = [{ category: "Food", total: 500, count: 5, average: 100 }];
      mockExecute.mockResolvedValue([mockCategoryData]);

      const request = new NextRequest("http://localhost/api/analytics", {
        headers: { Cookie: `token=${mockToken}` },
      });

      const response = await getAnalytics(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.categoryData).toEqual(mockCategoryData);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange: Mock the database to reject the query
      const dbError = new Error("Database connection failed");
      mockExecute.mockRejectedValue(dbError);

      // Temporarily silence console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest("http://localhost/api/analytics", {
        headers: { Cookie: `token=${mockToken}` },
      });

      // Act
      const response = await getAnalytics(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Internal server error");
      expect(console.error).toHaveBeenCalledWith("Error fetching analytics:", dbError);

      // Restore console.error to its original state
      consoleErrorSpy.mockRestore();
    });
  });
});