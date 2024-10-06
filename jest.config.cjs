/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testRegex: ".*\\.test\\.[jt]sx?$",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "react-markdown": "<rootDir>/__tests__/__mocks__/react-markdown.js"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "components/ui/ui-builder/**/*.{js,jsx,ts,tsx}",
    "lib/ui-builder/**/*.{js,jsx,ts,tsx}",
    // Add more folders as needed
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
