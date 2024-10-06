/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Page from "../app/page";

//mock codeblock component
jest.mock("../components/ui/ui-builder/codeblock", () => {
  return {
    CodeBlock: () => <div data-testid="codeblock">CodeBlock</div>,
  };
});

it("App Router: Works with Server Components", async () => {
  render(<Page />);
  const mainPage = await screen.findByTestId("main-page");
  expect(mainPage).toBeInTheDocument();
});
