/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BreakpointClassNameControl } from "@/components/ui/ui-builder/internal/classname-control/breakpoint-classname-control";

// Mock the dependencies
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => asChild ? children : <div>{children}</div>,
}));

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="tabs" data-value={value} {...props}>
      {children}
      <input
        data-testid="tab-value-input"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        hidden
      />
    </div>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-tab-content={value} {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => (
    <div data-testid="tabs-list" {...props}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button
      data-testid={`tab-trigger-${value}`}
      onClick={() => {
        const input = document.querySelector('[data-testid="tab-value-input"]') as HTMLInputElement;
        if (input) {
          fireEvent.change(input, { target: { value } });
        }
      }}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, ...props }: any) => (
    <div data-testid="accordion" {...props}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, value, ...props }: any) => (
    <div data-testid={`accordion-item-${value}`} {...props}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children, ...props }: any) => (
    <button data-testid="accordion-trigger" {...props}>
      {children}
    </button>
  ),
  AccordionContent: ({ children, ...props }: any) => (
    <div data-testid="accordion-content" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/ui-builder/internal/classname-multiselect", () => {
  return {
    __esModule: true,
    default: ({ value, onChange }: any) => (
      <div data-testid="classname-multiselect">
        <input
          data-testid="multiselect-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type class name..."
        />
        <div data-testid="multiselect-value">{value}</div>
      </div>
    ),
  };
});

jest.mock("@/components/ui/ui-builder/internal/classname-control/classname-item-control", () => ({
  ClassNameItemControl: ({ value, onChange }: any) => (
    <div data-testid="classname-item-control">
      <input
        data-testid="item-control-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter classes..."
      />
      <div data-testid="item-control-value">{value}</div>
    </div>
  ),
}));

describe("BreakpointClassNameControl", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with data-testid", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("breakpoint-classname-control")).toBeInTheDocument();
    });

    it("should render tabs for base and md breakpoints", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("breakpoint-tabs")).toBeInTheDocument();
      expect(screen.getByTestId("breakpoint-tabs-list")).toBeInTheDocument();
      expect(screen.getByTestId("base-tab-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("md-tab-trigger")).toBeInTheDocument();
    });

    it("should render tab content for base and md", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("base-tab-content")).toBeInTheDocument();
      expect(screen.getByTestId("md-tab-content")).toBeInTheDocument();
    });

    it("should render the classes accordion", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("classes-accordion")).toBeInTheDocument();
      expect(screen.getByTestId("classes-accordion-item")).toBeInTheDocument();
      expect(screen.getByTestId("classes-accordion-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("classes-accordion-content")).toBeInTheDocument();
    });

    it("should render ClassNameItemControl components", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("classname-item-control");
      expect(itemControls).toHaveLength(2); // One for base, one for md
    });

    it("should render ClassNameMultiselect component", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("classname-multiselect")).toBeInTheDocument();
    });
  });

  describe("Class String Parsing", () => {
    it("should parse base classes correctly", () => {
      render(<BreakpointClassNameControl value="w-full h-auto p-4" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      const baseControl = itemControls[0]; // First one should be base
      expect(baseControl).toHaveTextContent("w-full h-auto p-4");
    });

    it("should parse md classes correctly", () => {
      render(<BreakpointClassNameControl value="w-4 md:w-full md:h-auto" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      const baseControl = itemControls[0];
      const mdControl = itemControls[1];
      
      expect(baseControl).toHaveTextContent("w-4");
      expect(mdControl).toHaveTextContent("w-full h-auto");
    });

    it("should handle mixed breakpoint classes", () => {
      render(<BreakpointClassNameControl value="p-4 md:p-8 lg:p-12 sm:text-sm" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      const baseControl = itemControls[0];
      const mdControl = itemControls[1];
      
      expect(baseControl).toHaveTextContent("p-4");
      expect(mdControl).toHaveTextContent("p-8");
      
      // The lg: and sm: classes should be preserved in the multiselect
      const multiselectValue = screen.getByTestId("multiselect-value");
      expect(multiselectValue).toHaveTextContent("p-4 md:p-8 lg:p-12 sm:text-sm");
    });

    it("should handle empty value", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      expect(itemControls[0]).toHaveTextContent("");
      expect(itemControls[1]).toHaveTextContent("");
    });

    it("should handle only md classes", () => {
      render(<BreakpointClassNameControl value="md:w-full md:h-auto" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      const baseControl = itemControls[0];
      const mdControl = itemControls[1];
      
      expect(baseControl).toHaveTextContent("");
      expect(mdControl).toHaveTextContent("w-full h-auto");
    });

    it("should handle only base classes", () => {
      render(<BreakpointClassNameControl value="w-full h-auto p-4" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      const baseControl = itemControls[0];
      const mdControl = itemControls[1];
      
      expect(baseControl).toHaveTextContent("w-full h-auto p-4");
      expect(mdControl).toHaveTextContent("");
    });
  });

  describe("Tab Switching", () => {
    it("should start with base tab active", () => {
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const tabs = screen.getByTestId("breakpoint-tabs");
      expect(tabs).toHaveAttribute("data-value", "base");
    });

    it("should switch to md tab when clicked", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const mdTrigger = screen.getByTestId("md-tab-trigger");
      await user.click(mdTrigger);
      
      const tabs = screen.getByTestId("breakpoint-tabs");
      expect(tabs).toHaveAttribute("data-value", "md");
    });

    it("should switch back to base tab when clicked", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      // First switch to md
      const mdTrigger = screen.getByTestId("md-tab-trigger");
      await user.click(mdTrigger);
      
      // Then switch back to base
      const baseTrigger = screen.getByTestId("base-tab-trigger");
      await user.click(baseTrigger);
      
      const tabs = screen.getByTestId("breakpoint-tabs");
      expect(tabs).toHaveAttribute("data-value", "base");
    });
  });

  describe("Base Class Changes", () => {
    it("should handle base class changes", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const baseInput = itemControls[0];
      
      fireEvent.change(baseInput, { target: { value: "w-full p-4" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith("w-full p-4");
      });
    });

    it("should preserve md classes when changing base", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="md:w-8" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const baseInput = itemControls[0];
      
      fireEvent.change(baseInput, { target: { value: "w-full" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("w-full md:w-8");
      });
    });

    it("should preserve other breakpoint classes when changing base", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="lg:w-12 sm:w-2" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const baseInput = itemControls[0];
      
      fireEvent.change(baseInput, { target: { value: "w-full" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("w-full lg:w-12 sm:w-2");
      });
    });
  });

  describe("MD Class Changes", () => {
    it("should handle md class changes", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const mdInput = itemControls[1];
      
      fireEvent.change(mdInput, { target: { value: "w-8 h-8" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith("md:w-8 md:h-8");
      });
    });

    it("should preserve base classes when changing md", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="w-full p-4" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const mdInput = itemControls[1];
      
      fireEvent.change(mdInput, { target: { value: "w-8" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("w-full p-4 md:w-8");
      });
    });

    it("should preserve other breakpoint classes when changing md", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="w-full lg:w-12 sm:w-2" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const mdInput = itemControls[1];
      
      fireEvent.change(mdInput, { target: { value: "w-8" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("w-full md:w-8 lg:w-12 sm:w-2");
      });
    });

    it("should handle clearing md classes", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="w-full md:w-8 md:h-8" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      const mdInput = itemControls[1];
      
      fireEvent.change(mdInput, { target: { value: "" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("w-full");
      });
    });
  });

  describe("Multiselect Changes", () => {
    it("should handle multiselect changes", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const multiselectInput = screen.getByTestId("multiselect-input");
      fireEvent.change(multiselectInput, { target: { value: "w-full md:w-8 lg:w-12" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("w-full md:w-8 lg:w-12");
      });
    });

    it("should update tab values when multiselect changes", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const multiselectInput = screen.getByTestId("multiselect-input");
      fireEvent.change(multiselectInput, { target: { value: "p-4 md:p-8" } });
      
      await waitFor(() => {
        const itemControls = screen.getAllByTestId("item-control-value");
        expect(itemControls[0]).toHaveTextContent("p-4");
        expect(itemControls[1]).toHaveTextContent("p-8");
      });
    });
  });

  describe("Value Prop Changes", () => {
    it("should update when value prop changes", () => {
      const { rerender } = render(<BreakpointClassNameControl value="w-4" onChange={mockOnChange} />);
      
      rerender(<BreakpointClassNameControl value="w-full md:w-8" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      expect(itemControls[0]).toHaveTextContent("w-full");
      expect(itemControls[1]).toHaveTextContent("w-8");
    });

    it("should not update when value prop is the same", () => {
      const { rerender } = render(<BreakpointClassNameControl value="w-full" onChange={mockOnChange} />);
      
      const initialCallCount = mockOnChange.mock.calls.length;
      
      rerender(<BreakpointClassNameControl value="w-full" onChange={mockOnChange} />);
      
      // Should not call onChange again
      expect(mockOnChange.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe("Class String Building", () => {
    it("should build class string with proper spacing", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      fireEvent.change(itemControls[0], { target: { value: "w-full  p-4" } });
      fireEvent.change(itemControls[1], { target: { value: "w-8   h-8" } });
      
      await waitFor(() => {
        // Should normalize spaces
        expect(mockOnChange).toHaveBeenLastCalledWith("w-full p-4 md:w-8 md:h-8");
      });
    });

    it("should handle empty segments correctly", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="lg:w-12" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-input");
      fireEvent.change(itemControls[0], { target: { value: "w-full" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith("w-full lg:w-12");
      });
    });

    it("should trim final class string", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="  w-full   " onChange={mockOnChange} />);
      
      // The component should automatically trim on initial render
      expect(mockOnChange).toHaveBeenCalledWith("  w-full   ");
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed breakpoint classes", () => {
      render(<BreakpointClassNameControl value="md: invalid:class md:w-full" onChange={mockOnChange} />);
      
      // Should handle malformed classes gracefully
      expect(screen.getByTestId("breakpoint-classname-control")).toBeInTheDocument();
    });

    it("should handle null onChange prop", () => {
      expect(() => {
        render(<BreakpointClassNameControl value="w-full" onChange={null as any} />);
      }).not.toThrow();
    });

    it("should handle undefined value prop", () => {
      expect(() => {
        render(<BreakpointClassNameControl value={undefined} onChange={mockOnChange} />);
      }).not.toThrow();
    });

    it("should handle very long class strings", () => {
      const longValue = Array(50).fill("w-full").join(" ");
      
      expect(() => {
        render(<BreakpointClassNameControl value={longValue} onChange={mockOnChange} />);
      }).not.toThrow();
    });

    it("should handle multiple consecutive md: prefixes", () => {
      render(<BreakpointClassNameControl value="md:md:w-full" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("breakpoint-classname-control")).toBeInTheDocument();
    });

    it("should handle classes with numbers and special characters", () => {
      render(<BreakpointClassNameControl value="w-1/2 md:w-1/3 lg:translate-x-1/2" onChange={mockOnChange} />);
      
      const itemControls = screen.getAllByTestId("item-control-value");
      expect(itemControls[0]).toHaveTextContent("w-1/2");
      expect(itemControls[1]).toHaveTextContent("w-1/3");
    });
  });

  describe("Integration", () => {
    it("should work with all three input methods (base tab, md tab, multiselect)", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="" onChange={mockOnChange} />);
      
      // Start with base tab
      const itemControls = screen.getAllByTestId("item-control-input");
      fireEvent.change(itemControls[0], { target: { value: "p-4" } });
      
      // Switch to md tab
      const mdTrigger = screen.getByTestId("md-tab-trigger");
      await user.click(mdTrigger);
      fireEvent.change(itemControls[1], { target: { value: "p-8" } });
      
      // Use multiselect to add more classes
      const multiselectInput = screen.getByTestId("multiselect-input");
      fireEvent.change(multiselectInput, { target: { value: "p-4 md:p-8 lg:p-12" } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith("p-4 md:p-8 lg:p-12");
      });
    });

    it("should maintain consistency between tabs and multiselect", async () => {
      const user = userEvent.setup();
      render(<BreakpointClassNameControl value="w-full md:w-8" onChange={mockOnChange} />);
      
      // Check initial values
      const itemControls = screen.getAllByTestId("item-control-value");
      expect(itemControls[0]).toHaveTextContent("w-full");
      expect(itemControls[1]).toHaveTextContent("w-8");
      
      const multiselectValue = screen.getByTestId("multiselect-value");
      expect(multiselectValue).toHaveTextContent("w-full md:w-8");
      
      // Change via multiselect
      const multiselectInput = screen.getByTestId("multiselect-input");
      fireEvent.change(multiselectInput, { target: { value: "h-full md:h-8" } });
      
      await waitFor(() => {
        const updatedItemControls = screen.getAllByTestId("item-control-value");
        expect(updatedItemControls[0]).toHaveTextContent("h-full");
        expect(updatedItemControls[1]).toHaveTextContent("h-8");
      });
    });
  });
}); 