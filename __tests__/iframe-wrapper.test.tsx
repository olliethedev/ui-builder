/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { IframeWrapper } from "@/components/ui/ui-builder/internal/iframe-wrapper";

// Mock ReactDOM.createPortal to render children directly for testing
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {
    act(() => {
      // Simulate initial resize within act
      this.callback([], this);
    });
  }
  disconnect() {}
  unobserve() {}
}
(global as unknown as any).ResizeObserver = MockResizeObserver;

// Mock offsetWidth for parent elements
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get: () => 600, // Set the desired initial width
});

describe("IframeWrapper", () => {
  const mockChildren = <div data-testid="child-content">Child Content</div>;

  const renderIframeWrapper = (props = {}) => {
    return render(
      <IframeWrapper resizable={false} frameId="test-frame" {...props}>
        {mockChildren}
      </IframeWrapper>
    );
  };

  it("renders the iframe correctly", async () => {
    renderIframeWrapper();
    const iframe = screen.getByTitle("Page Editor") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("id", "test-frame");
  });

  it("renders children inside the iframe", async () => {
    renderIframeWrapper();
    // Since createPortal is mocked to render children directly,
    // we can check for the child content in the document
    const child = await screen.findByTestId("child-content");
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent("Child Content");
  });

  it("applies resizable behavior when resizable is true", () => {
    renderIframeWrapper({ resizable: true });
    const resizer = screen.getAllByTestId("resizer");
    expect(resizer.length).toBe(2); // One at top-right and one at bottom-right
  });

  it("handles iframe load event correctly", async () => {
    renderIframeWrapper();
    const iframe = screen.getByTitle("Page Editor") as HTMLIFrameElement;

    // Initially, iframe opacity should be 0
    expect(iframe).toHaveStyle("opacity: 0");

    // Simulate iframe load
    act(() => {
      fireEvent.load(iframe);
    });

    // After load, opacity should transition to 1
    expect(iframe).toHaveStyle("opacity: 1");
  });

  it("does not render resizer when resizable is false", async () => {
    await renderIframeWrapper({ resizable: false });
    const resizers = screen.queryAllByTestId("resizer");
    expect(resizers.length).toBe(0);
  });
});
