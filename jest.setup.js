// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

jest.mock("remark-gfm", () => () => {
})

jest.mock("remark-math", () => () => {
})

jest.mock("lowlight", () => ({
  common: {},
  createLowlight: jest.fn(() => ({
    highlight: jest.fn(() => ({ value: [] })),
    highlightAuto: jest.fn(() => ({ value: [] })),
    register: jest.fn(),
    registered: jest.fn(() => true),
    listLanguages: jest.fn(() => []),
  })),
}));

jest.mock("react-medium-image-zoom", () => ({
  __esModule: true,
  default: ({ children }) => children,
  Zoom: ({ children }) => children,
}));

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
  ThemeProvider: jest.fn(),
}));

// Mock scrollIntoView - required by cmdk library
Element.prototype.scrollIntoView = jest.fn();

// Mock zustand - simplified approach that works with curried functions
jest.mock("zustand", () => ({
  create: jest.fn(() => () => ({})),
}));

// Mock zustand middleware
jest.mock("zustand/middleware", () => ({
  persist: jest.fn((fn) => fn),
  subscribeWithSelector: jest.fn((fn) => fn),
  devtools: jest.fn((fn) => fn),
  createJSONStorage: jest.fn(() => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));

class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    // Mock observe method
  }

  unobserve() {
    // Mock unobserve method
  }

  disconnect() {
    // Mock disconnect method
  }

  // Optionally, you can add a method to trigger the callback manually
  trigger(entries) {
    this.callback(entries);
  }
}

global.ResizeObserver = ResizeObserver;
