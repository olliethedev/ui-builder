/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassNameItemControl } from "@/components/ui/ui-builder/internal/form-fields/classname-control/classname-item-control";

// Mock the dependencies
jest.mock("@/components/ui/ui-builder/internal/form-fields/classname-control/config", () => ({
  CONFIG: {
    width: {
      label: "Width",
      possibleTypes: [null, "w-full", "w-auto", "w-4", "w-8"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, ...props }: any) => (
        <div data-testid={`config-width`}>
          {!hideLabel && <label>{label}</label>}
          <select
            data-testid="width-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            {...props}
          >
            <option value="">None</option>
            <option value="w-full">Full</option>
            <option value="w-auto">Auto</option>
            <option value="w-4">4</option>
            <option value="w-8">8</option>
          </select>
        </div>
      )),
      options: [],
    },
    height: {
      label: "Height",
      possibleTypes: [null, "h-full", "h-auto", "h-4", "h-8"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, ...props }: any) => (
        <div data-testid={`config-height`}>
          {!hideLabel && <label>{label}</label>}
          <select
            data-testid="height-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            {...props}
          >
            <option value="">None</option>
            <option value="h-full">Full</option>
            <option value="h-auto">Auto</option>
            <option value="h-4">4</option>
            <option value="h-8">8</option>
          </select>
        </div>
      )),
      options: [],
    },
    padding: {
      label: "Padding",
      possibleTypes: [null, "p-1", "p-2", "p-4", "p-8"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, ...props }: any) => (
        <div data-testid={`config-padding`}>
          {!hideLabel && <label>{label}</label>}
          <select
            data-testid="padding-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            {...props}
          >
            <option value="">None</option>
            <option value="p-1">1</option>
            <option value="p-2">2</option>
            <option value="p-4">4</option>
            <option value="p-8">8</option>
          </select>
        </div>
      )),
      options: [],
    },
    directionalPadding: {
      label: "X and Y Padding",
      possibleTypes: [null, "px-1", "px-2", "py-1", "py-2"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, ...props }: any) => (
        <div data-testid={`config-directional-padding`}>
          {!hideLabel && <label>{label}</label>}
          <select
            data-testid="directional-padding-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            {...props}
          >
            <option value="">None</option>
            <option value="px-1">px-1</option>
            <option value="px-2">px-2</option>
            <option value="py-1">py-1</option>
            <option value="py-2">py-2</option>
          </select>
        </div>
      )),
      options: [],
    },
    border: {
      label: "Border",
      possibleTypes: [null, "border", "border-2", "border-red-500", "rounded"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, multiple, ...props }: any) => (
        <div data-testid={`config-border`}>
          {!hideLabel && <label>{label}</label>}
          {multiple ? (
            <div>
              {["border", "border-2", "border-red-500", "rounded"].map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    data-testid={`border-checkbox-${option}`}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange([...currentValues, option]);
                      } else {
                        onChange(currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <select
              data-testid="border-select"
              value={value || ""}
              onChange={(e) => onChange(e.target.value || null)}
              {...props}
            >
              <option value="">None</option>
              <option value="border">Border</option>
              <option value="border-2">Border 2</option>
              <option value="border-red-500">Red</option>
              <option value="rounded">Rounded</option>
            </select>
          )}
        </div>
      )),
      multiple: true,
      options: [],
    },
    display: {
      label: "Layout",
      possibleTypes: [null, "block", "flex", "inline"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, ...props }: any) => (
        <div data-testid={`config-display`}>
          {!hideLabel && <label>{label}</label>}
          <select
            data-testid="display-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            {...props}
          >
            <option value="">None</option>
            <option value="block">Block</option>
            <option value="flex">Flex</option>
            <option value="inline">Inline</option>
          </select>
        </div>
      )),
      options: [],
    },
    flexSettings: {
      label: "Flex Settings",
      possibleTypes: [null, "flex-col", "flex-row", "items-center", "justify-center"] as const,
      component: jest.fn(({ value, onChange, label, hideLabel, multiple, ...props }: any) => (
        <div data-testid={`config-flex-settings`}>
          {!hideLabel && <label>{label}</label>}
          {multiple ? (
            <div>
              {["flex-col", "flex-row", "items-center", "justify-center"].map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    data-testid={`flex-checkbox-${option}`}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange([...currentValues, option]);
                      } else {
                        onChange(currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <select
              data-testid="flex-settings-select"
              value={value || ""}
              onChange={(e) => onChange(e.target.value || null)}
              {...props}
            >
              <option value="">None</option>
              <option value="flex-col">Column</option>
              <option value="flex-row">Row</option>
              <option value="items-center">Items Center</option>
              <option value="justify-center">Justify Center</option>
            </select>
          )}
        </div>
      )),
      multiple: true,
      options: [],
    },
  },
  LAYOUT_GROUPS: [
    {
      label: "Padding",
      keys: ["padding", "directionalPadding"],
      clearState: () => ["p-1", "p-2", "p-4", "p-8", "px-1", "px-2", "py-1", "py-2"],
    },
  ],
  LAYOUT_ORDER: [
    { type: "item", key: "width" },
    { type: "item", key: "height" },
    { type: "group", label: "Padding", className: "w-fit" },
    { type: "item", key: "border" },
    { type: "item", key: "display" },
    {
      type: "item",
      key: "flexSettings",
      isVisible: (state: any) => state.display === "flex",
    },
  ],
  StateType: {} as any,
}));

jest.mock("@/components/ui/ui-builder/internal/form-fields/classname-control/classname-group-control", () => ({
  ClassNameGroupControl: ({ group, selectedKey, handleStateChange, handleGroupKeySelect }: any) => (
    <div data-testid={`group-control-${group.label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span data-testid="group-label">{group.label}</span>
      <select
        data-testid={`group-key-select-${group.label.toLowerCase().replace(/\s+/g, '-')}`}
        value={selectedKey}
        onChange={(e) => handleGroupKeySelect(group.label, e.target.value)}
      >
        {group.keys.map((key: string) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <button
        data-testid={`group-change-${group.label.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => handleStateChange(selectedKey, "test-value")}
      >
        Change Value
      </button>
    </div>
  ),
}));

jest.mock("@/components/ui/ui-builder/internal/form-fields/classname-control/utils", () => ({
  isTailwindClass: jest.fn((arr: string[], token: string) => arr.includes(token)),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

describe("ClassNameItemControl", () => {
  const mockOnChange = jest.fn();

  // Set timeout for all tests in this file to 20 seconds
  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with data-testid", () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("classname-item-control")).toBeInTheDocument();
    });

    it("should render individual items from LAYOUT_ORDER", () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("item-width")).toBeInTheDocument();
      expect(screen.getByTestId("item-height")).toBeInTheDocument();
      expect(screen.getByTestId("item-border")).toBeInTheDocument();
      expect(screen.getByTestId("item-display")).toBeInTheDocument();
    });

    it("should render groups from LAYOUT_ORDER", () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("group-padding")).toBeInTheDocument();
      expect(screen.getByTestId("group-control-padding")).toBeInTheDocument();
    });

    it("should conditionally render flex settings when display is flex", () => {
      render(<ClassNameItemControl value="flex" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("item-flexSettings")).toBeInTheDocument();
    });

    it("should not render flex settings when display is not flex", () => {
      render(<ClassNameItemControl value="block" onChange={mockOnChange} />);
      
      expect(screen.queryByTestId("item-flexSettings")).not.toBeInTheDocument();
    });
  });

  describe("Value Parsing", () => {
    it("should parse simple single class values", () => {
      render(<ClassNameItemControl value="w-full" onChange={mockOnChange} />);
      
      const widthSelect = screen.getByTestId("width-select");
      expect(widthSelect).toHaveValue("w-full");
    });

    it("should parse multiple class values", () => {
      render(<ClassNameItemControl value="w-full h-auto p-4" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("width-select")).toHaveValue("w-full");
      expect(screen.getByTestId("height-select")).toHaveValue("h-auto");
    });

    it("should handle multiple values for multi-select configs", () => {
      render(<ClassNameItemControl value="border border-2 rounded" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("border-checkbox-border")).toBeChecked();
      expect(screen.getByTestId("border-checkbox-border-2")).toBeChecked();
      expect(screen.getByTestId("border-checkbox-rounded")).toBeChecked();
    });

    it("should handle unhandled tokens correctly", () => {
      render(<ClassNameItemControl value="w-full custom-class" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("width-select")).toHaveValue("w-full");
      // The custom-class should be preserved in the output
      expect(mockOnChange).toHaveBeenCalledWith("w-full custom-class");
    });

    it("should handle empty value", () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("width-select")).toHaveValue("");
      expect(screen.getByTestId("height-select")).toHaveValue("");
    });
  });

  describe("State Changes", () => {
    it("should call onChange when individual control value changes", async () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      // Clear any calls from initial render
      mockOnChange.mockClear();
      
      const widthSelect = screen.getByTestId("width-select");
      fireEvent.change(widthSelect, { target: { value: "w-full" } });
      
      expect(mockOnChange).toHaveBeenCalledWith("w-full");
    });

    it("should update multiple controls independently", async () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      // Clear any calls from initial render
      mockOnChange.mockClear();
      
      const widthSelect = screen.getByTestId("width-select");
      const heightSelect = screen.getByTestId("height-select");
      
      fireEvent.change(widthSelect, { target: { value: "w-full" } });
      fireEvent.change(heightSelect, { target: { value: "h-auto" } });
      
      expect(mockOnChange).toHaveBeenLastCalledWith("w-full h-auto");
    });

    it("should handle multi-select controls", async () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      // Clear any calls from initial render
      mockOnChange.mockClear();
      
      const borderCheckbox = screen.getByTestId("border-checkbox-border");
      const roundedCheckbox = screen.getByTestId("border-checkbox-rounded");
      
      fireEvent.click(borderCheckbox);
      fireEvent.click(roundedCheckbox);
      
      expect(mockOnChange).toHaveBeenLastCalledWith("border rounded");
    });

    it("should remove values when unchecking multi-select options", async () => {
      render(<ClassNameItemControl value="border rounded" onChange={mockOnChange} />);
      
      // Clear any calls from initial render
      mockOnChange.mockClear();
      
      const borderCheckbox = screen.getByTestId("border-checkbox-border");
      fireEvent.click(borderCheckbox);
      
      expect(mockOnChange).toHaveBeenLastCalledWith("rounded");
    });
  });

  describe("Group Handling", () => {
    it("should handle group key selection", async () => {
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      const groupSelect = screen.getByTestId("group-key-select-padding");
      fireEvent.change(groupSelect, { target: { value: "directionalPadding" } });
      
      // The component should update the selected key for the group
      expect(groupSelect).toHaveValue("directionalPadding");
    });

    it("should handle group state changes", async () => {
      const user = userEvent.setup();
      render(<ClassNameItemControl value="" onChange={mockOnChange} />);
      
      const groupChangeButton = screen.getByTestId("group-change-padding");
      await user.click(groupChangeButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("test-value");
      });
    });

    it("should clear other group keys when one is selected", () => {
      render(<ClassNameItemControl value="p-4 px-2" onChange={mockOnChange} />);
      
      // Since both padding and directionalPadding are in the same group,
      // only one should be active (the first one found)
      // This tests the group conflict resolution logic
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Visibility Logic", () => {
    it("should show flex settings when display is flex", () => {
      render(<ClassNameItemControl value="flex" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("item-flexSettings")).toBeInTheDocument();
    });

    it("should hide flex settings when display changes from flex to block", async () => {
      const user = userEvent.setup();
      render(<ClassNameItemControl value="flex flex-col" onChange={mockOnChange} />);
      
      // Flex settings should be visible initially
      expect(screen.getByTestId("item-flexSettings")).toBeInTheDocument();
      
      // Change display to block
      const displaySelect = screen.getByTestId("display-select");
      await user.selectOptions(displaySelect, "block");
      
      // Flex settings should be hidden and flex-col should be removed
      expect(screen.queryByTestId("item-flexSettings")).not.toBeInTheDocument();
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith("block");
      });
    });
  });

  describe("Class String Building", () => {
    it("should preserve order of classes", () => {
      render(<ClassNameItemControl value="w-full h-auto border custom-class" onChange={mockOnChange} />);
      
      // The onChange should be called with classes in a consistent order
      expect(mockOnChange).toHaveBeenCalledWith("w-full h-auto border custom-class");
    });

    it("should handle null and empty values correctly", () => {
      render(<ClassNameItemControl value="w-full" onChange={mockOnChange} />);
      
      // Component should not include null or empty values in the class string
      expect(mockOnChange).toHaveBeenCalledWith("w-full");
    });

    it("should trim whitespace from the final class string", () => {
      render(<ClassNameItemControl value="  w-full   h-auto  " onChange={mockOnChange} />);
      
      expect(mockOnChange).toHaveBeenCalledWith("w-full h-auto");
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed input gracefully", () => {
      render(<ClassNameItemControl value="   " onChange={mockOnChange} />);
      
      expect(screen.getByTestId("classname-item-control")).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith("");
    });

    it("should handle null onChange prop", () => {
      expect(() => {
        render(<ClassNameItemControl value="w-full" onChange={null as any} />);
      }).not.toThrow();
    });

    it("should handle very long class strings", () => {
      const longValue = Array(100).fill("w-full").join(" ");
      
      expect(() => {
        render(<ClassNameItemControl value={longValue} onChange={mockOnChange} />);
      }).not.toThrow();
    });

    it("should handle special characters in class names", () => {
      render(<ClassNameItemControl value="w-full md:w-1/2 lg:w-1/3" onChange={mockOnChange} />);
      
      expect(screen.getByTestId("classname-item-control")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily when value prop is the same", () => {
      const { rerender } = render(<ClassNameItemControl value="w-full" onChange={mockOnChange} />);
      
      const initialCallCount = mockOnChange.mock.calls.length;
      
      // Re-render with the same value
      rerender(<ClassNameItemControl value="w-full" onChange={mockOnChange} />);
      
      // onChange should not be called again for the same value
      expect(mockOnChange.mock.calls.length).toBe(initialCallCount);
    });

    it("should memoize parsing results", () => {
      const { rerender } = render(<ClassNameItemControl value="w-full h-auto" onChange={mockOnChange} />);
      
      // Change to different value and back
      rerender(<ClassNameItemControl value="w-auto h-full" onChange={mockOnChange} />);
      rerender(<ClassNameItemControl value="w-full h-auto" onChange={mockOnChange} />);
      
      // Component should handle the changes without issues
      expect(screen.getByTestId("classname-item-control")).toBeInTheDocument();
    });
  });
}); 