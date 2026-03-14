// used in package.json script "test:integration" and "pretest:integration"

// Jest Config reference:    https://jestjs.io/docs/configuration

export default {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  transform: { "^.+\\.ts$": ["ts-jest", { useESM: true }] },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },

  // Setup fles and environment
  setupFiles: ["<rootDir>/tests/setup/env.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.integration.setup.ts"],
};