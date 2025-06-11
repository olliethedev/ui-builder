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
  transformIgnorePatterns: [
    "node_modules/(?!(lowlight|@tiptap|react-markdown|remark-gfm|remark-math|he-tree-react|micromark|mdast-util|unist-util|decode-named-character-reference|character-entities|zwitch|longest-streak|markdown-table|ccount|escape-string-regexp|react-medium-image-zoom)/)"
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "components/ui/ui-builder/**/*.{js,jsx,ts,tsx}",
    "lib/ui-builder/**/*.{js,jsx,ts,tsx}",
    "!**/*complex-component-definitions.ts",
    "!**/*primitive-component-definitions.ts",
    "!components/ui/ui-builder/multi-select.tsx",
    "!components/ui/ui-builder/markdown.tsx",
    "!components/ui/ui-builder/icon.tsx",
    "!components/ui/ui-builder/flexbox.tsx",
    "!components/ui/ui-builder/grid.tsx",
    "!components/ui/ui-builder/codeblock.tsx",
    "!components/ui/ui-builder/types.ts",
    "!components/ui/ui-builder/internal/iconname-field.tsx",
    "!components/ui/ui-builder/internal/classname-control/*",
    "!components/ui/ui-builder/internal/tailwind-classes.ts",
    "!lib/ui-builder/registry/form-field-overrides.tsx"
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
