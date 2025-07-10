/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Page from "../app/page";

//mock codeblock component
jest.mock("../components/ui/ui-builder/components/codeblock", () => {
  return {
    CodeBlock: () => <div data-testid="codeblock">CodeBlock</div>,
  };
});

it("Main Component", async () => {
  render(<Page />);
  const mainPage = await screen.findByTestId("main-page");
  expect(mainPage).toBeInTheDocument();
});
