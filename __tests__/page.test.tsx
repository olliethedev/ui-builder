/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Page from "../app/page";

it("App Router: Works with Server Components", async () => {
  render(<Page />);
  const mainPage = await screen.findByTestId("main-page");
  expect(mainPage).toBeInTheDocument();
});
