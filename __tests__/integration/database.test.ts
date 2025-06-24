// Use the REAL database module for this integration test
jest.unmock('@/src/lib/db');

import pool from "@/src/lib/db";

describe("Database Integration Tests", () => {
  // This hook runs once after all tests in this file are complete.
  afterAll(async () => {
    // Close the database connection pool to allow the test runner to exit.
    await pool.end();
  });

  // This test requires a running database connection.
  it("should execute a query through the connection pool", async () => {
    const [rows] = (await pool.execute("SELECT 1 as test")) as any;
    expect(rows[0].test).toBe(1);
  });

  it("should handle multiple concurrent queries", async () => {
    const queries = [
      pool.execute("SELECT 1 as query_number"),
      pool.execute("SELECT 2 as query_number"),
    ];

    const results = await Promise.all(queries);

    results.forEach((result, index) => {
      const [rows] = result as any;
      expect(rows[0].query_number).toBe(index + 1);
    });
  });
});