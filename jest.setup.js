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
