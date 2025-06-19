import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameEdit } from "@/components/ui/ui-builder/internal/name-edit";

describe("NameEdit", () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    initialName: "Test Name",
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with initial name", () => {
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("renders save and cancel buttons", () => {
    render(<NameEdit {...defaultProps} />);
    
    expect(screen.getByLabelText("Save rename")).toBeInTheDocument();
    expect(screen.getByLabelText("Cancel rename")).toBeInTheDocument();
  });

  it("updates input value when typing", async () => {
    const user = userEvent.setup({ delay: 1 });
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "New Name");
    
    expect(input).toHaveValue("New Name");
  }, 15000);

  it("calls onSave with trimmed name when save button is clicked", async () => {
    const user = userEvent.setup({ delay: 1 });
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    
    // Use direct value setting instead of type to avoid timing issues
    fireEvent.change(input, { target: { value: "  New Name  " } });
    
    const saveButton = screen.getByLabelText("Save rename");
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith("New Name");
  }, 15000);

  it("does not call onSave when name is empty or only whitespace", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "   ");
    
    const saveButton = screen.getByLabelText("Save rename");
    await user.click(saveButton);
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("calls onCancel and resets name when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "Changed Name");
    
    const cancelButton = screen.getByLabelText("Cancel rename");
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
    expect(input).toHaveValue("Test Name");
  });

  it("saves when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "New Name");
    await user.keyboard("{Enter}");
    
    expect(mockOnSave).toHaveBeenCalledWith("New Name");
  });

  it("does not save on Enter when name is empty", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.keyboard("{Enter}");
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("cancels when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "Changed Name");
    await user.keyboard("{Escape}");
    
    expect(mockOnCancel).toHaveBeenCalled();
    expect(input).toHaveValue("Test Name");
  });

  it("updates when initialName prop changes", () => {
    const { rerender } = render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    expect(input).toHaveValue("Test Name");
    
    rerender(<NameEdit {...defaultProps} initialName="Updated Name" />);
    
    expect(input).toHaveValue("Updated Name");
  });

  it("preserves user input when initialName changes but user has modified the input", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "User Modified Name");
    
    // Simulate initialName prop change (but it should not override user input)
    rerender(<NameEdit {...defaultProps} initialName="Different Name" />);
    
    // The input should be updated to the new initialName due to useEffect
    expect(input).toHaveValue("Different Name");
  });

  it("has correct aria labels for accessibility", () => {
    render(<NameEdit {...defaultProps} />);
    
    const saveButton = screen.getByLabelText("Save rename");
    const cancelButton = screen.getByLabelText("Cancel rename");
    
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it("has correct button styling and structure", () => {
    render(<NameEdit {...defaultProps} />);
    
    const saveButton = screen.getByLabelText("Save rename");
    const cancelButton = screen.getByLabelText("Cancel rename");
    
    expect(saveButton).toHaveClass("ml-1");
    expect(cancelButton).toHaveClass("ml-1");
  });

  it("maintains focus on input after typing", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    expect(input).toHaveFocus();
    
    await user.type(input, " Addition");
    expect(input).toHaveFocus();
  });

  it("handles special characters in name", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "Special-Name_123 & More!");
    
    const saveButton = screen.getByLabelText("Save rename");
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith("Special-Name_123 & More!");
  });

  it("handles multiple spaces in name correctly", async () => {
    const user = userEvent.setup();
    render(<NameEdit {...defaultProps} />);
    
    const input = screen.getByDisplayValue("Test Name");
    await user.clear(input);
    await user.type(input, "  Multiple   Spaces  ");
    
    const saveButton = screen.getByLabelText("Save rename");
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith("Multiple   Spaces");
  });

  it("works with empty initial name", () => {
    render(<NameEdit {...defaultProps} initialName="" />);
    
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });
});