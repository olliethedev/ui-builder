// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

jest.mock("remark-gfm", () => () => {
})

jest.mock("remark-math", () => () => {
})

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

global.ResizeObserver = ResizeObserver;
