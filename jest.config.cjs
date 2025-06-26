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
    "!lib/ui-builder/registry/**/*.{js,jsx,ts,tsx}",
    "!lib/ui-builder/context/**/*.{js,jsx,ts,tsx}",
    "!lib/ui-builder/hooks/use-auto-scroll.ts",
    "!lib/ui-builder/hooks/use-dnd-event-handlers.ts",
    "!lib/ui-builder/hooks/use-keyboard-shortcuts-dnd.ts",
    "!lib/ui-builder/hooks/use-drop-validation.ts",
    "!lib/ui-builder/hooks/use-dnd-sensors.ts",
    "!components/ui/ui-builder/internal/components/multi-select.tsx",
    "!components/ui/ui-builder/components/markdown.tsx",
    "!components/ui/ui-builder/components/icon.tsx",
    "!components/ui/ui-builder/components/flexbox.tsx",
    "!components/ui/ui-builder/components/grid.tsx",
    "!components/ui/ui-builder/components/codeblock.tsx",
    "!components/ui/ui-builder/types.ts",
    "!components/ui/ui-builder/internal/form-fields/iconname-field.tsx",
    "!components/ui/ui-builder/internal/form-fields/classname-control/*",
    "!components/ui/ui-builder/internal/utils/tailwind-classes.ts",
    "!components/ui/ui-builder/internal/components/divider-control.tsx",
    "!components/ui/ui-builder/internal/canvas/auto-frame.tsx"
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
