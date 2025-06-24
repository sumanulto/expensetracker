import { jest } from '@jest/globals';

// --- Mock the database module (default export) ---
// Correctly mocks the default export so that `db.execute` can be referenced in tests.
jest.mock("@/src/lib/db", () => ({
  __esModule: true,
  default: {
    execute: jest.fn(),
    getConnection: jest.fn(),
  },
}));

// --- Mock the getUser middleware (named export) ---
jest.mock("@/src/lib/middleware", () => ({
  __esModule: true,
  getUser: jest.fn(),
}));

// --- Mock next/server (Corrected) ---
jest.mock("next/server", () => ({
  __esModule: true,
  NextRequest: class MockNextRequest {
    url: string;
    headers: Map<string, string>;
    cookies: {
        get: (name: string) => { name: string; value: string } | undefined;
        set: jest.Mock;
    };
    _body: any;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.headers = new Map(Object.entries(init?.headers as Record<string, string> || {}));
      this._body = init?.body;
      this.cookies = {
        get: (name: string) => {
          const cookieHeader = this.headers.get('cookie');
          if (!cookieHeader) return undefined;
          const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
          if (match) {
            return { name, value: decodeURIComponent(match[2]) };
          }
          return undefined;
        },
        set: jest.fn(),
      };
    }

    async json() {
      if (typeof this._body === 'string') {
        try {
          return JSON.parse(this._body);
        } catch (e) {
          return {};
        }
      }
      return this._body || {};
    }
  },
  NextResponse: {
    json: (data: any, options?: { status?: number }) => {
      const headers = new Map();
      return {
        json: async () => data,
        status: options?.status || 200,
        headers: headers,
        cookies: {
          set: jest.fn((name, value) => {
            // Simulate setting a cookie by adding it to the headers
            const cookieString = `${name}=${value}`;
            headers.set('set-cookie', cookieString);
          }),
          delete: jest.fn(),
        },
        ...options,
      };
    },
  },
}));