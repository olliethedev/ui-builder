/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ClickableWrapper } from "@/components/ui/ui-builder/internal/clickable-wrapper";
import { Layer } from "@/lib/ui-builder/store/layer-store";
import { getScrollParent } from "@/lib/ui-builder/utils/get-scroll-parent";

describe("ClickableWrapper", () => {
  const mockLayer: Layer = {
    id: "layer-1",
    type: "BUTTON",
    props: {},
    children: [],
  };

  const defaultProps = {
    layer: mockLayer,
    isSelected: false,
    zIndex: 1,
    totalLayers: 5,
    onSelectElement: jest.fn(),
    children: <span>Child Element</span>,
    onDuplicateLayer: jest.fn(),
    onDeleteLayer: jest.fn(),
    listenToScrollParent: true, // Set to true to enable scroll parent listening
    observeMutations: false,
  };

  beforeAll(() => {
    // Mock ResizeObserver
    (global as unknown as any).ResizeObserver = class ResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };

    // Mock MutationObserver
    (global as unknown as any).MutationObserver = class MutationObserver {
      observe = jest.fn();
      disconnect = jest.fn();
      takeRecords = jest.fn().mockReturnValue([]);
    };

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 100,
      left: 100,
      bottom: 200,
      right: 200,
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      toJSON: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <ClickableWrapper {...defaultProps} data-testid="clickable-wrapper" />
    );
    expect(screen.getByText("Child Element")).toBeInTheDocument();
  });

  it("renders LayerMenu when isSelected is true", () => {
    render(
      <ClickableWrapper
        {...defaultProps}
        isSelected={true}
        data-testid="clickable-wrapper"
      />
    );
    expect(
      screen.getByText(mockLayer.type.replaceAll("_", ""))
    ).toBeInTheDocument();
  });

  it("returns null if no scrollable parent is found", () => {
    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    const result = getScrollParent(child);
    expect(result).toBeNull();

    // Cleanup
    document.body.removeChild(parent);
  });
});
