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

class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {
    // Mock observe method - automatically trigger as visible for testing
    this.callback([{ isIntersecting: true }]);
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
global.IntersectionObserver = IntersectionObserver;
