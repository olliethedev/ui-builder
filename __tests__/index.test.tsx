/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import UIBuilder from "../components/ui/ui-builder";

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: "light", // add other properties if needed
  }),
}));

jest.mock("../components/ui/ui-builder/internal/nav", () => ({
  NavBar: () => <div data-testid="nav">Nav</div>,
}));

it("UIBuilder: renders", async () => {
  render(<UIBuilder />);
  const themeProvider = await screen.findByTestId("theme-provider");
  expect(themeProvider).toBeInTheDocument();
});

it("UIBuilder: renders component-editor", async () => {
  render(<UIBuilder />);
  const componentEditor = await screen.findByTestId("component-editor");
  expect(componentEditor).toBeInTheDocument();
});

it("UIBuilder: renders page-config-panel", async () => {
  render(<UIBuilder />);
  const pageConfigPanel = await screen.findByTestId("page-config-panel");
  expect(pageConfigPanel).toBeInTheDocument();
});
