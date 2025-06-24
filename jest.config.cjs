const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Point to the setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],

  // Add this transform config to use SWC
  // This tells Jest to use @swc/jest for all .js, .jsx, .ts, and .tsx files
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            // This enables React features like JSX
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
};

module.exports = createJestConfig(customJestConfig);