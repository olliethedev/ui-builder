import React from "react";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import ClassNameField from "@/components/ui/ui-builder/internal/classname-field";

// Mock the ClassNameMultiselect component
jest.mock("@/components/ui/ui-builder/internal/classname-multiselect", () => {
  return function MockClassNameMultiselect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    return (
      <input
        data-testid="classname-multiselect"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

// Wrapper component that provides form context
function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      className: ""
    }
  });
  
  return (
    <FormProvider {...methods}>
      <form>
        {children}
      </form>
    </FormProvider>
  );
}

describe("ClassNameField", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
        />
      </FormWrapper>
    );

    expect(screen.getByTestId("classname-multiselect")).toBeInTheDocument();
    expect(screen.getByTestId("classname-multiselect")).toHaveValue("test-class");
  });

  it("renders with label", () => {
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
          label="CSS Classes"
        />
      </FormWrapper>
    );

    expect(screen.getByText("CSS Classes")).toBeInTheDocument();
  });

  it("renders with required indicator when isRequired is true", () => {
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
          label="CSS Classes"
          isRequired={true}
        />
      </FormWrapper>
    );

    expect(screen.getByText("CSS Classes")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("*")).toHaveClass("text-destructive");
  });

  it("does not render required indicator when isRequired is false", () => {
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
          label="CSS Classes"
          isRequired={false}
        />
      </FormWrapper>
    );

    expect(screen.getByText("CSS Classes")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders with description", () => {
    const description = "Enter CSS class names";
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
          description={description}
        />
      </FormWrapper>
    );

    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it("renders with description as React node", () => {
    const description = <span data-testid="custom-description">Custom description</span>;
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
          description={description}
        />
      </FormWrapper>
    );

    expect(screen.getByTestId("custom-description")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(
      <FormWrapper>
        <ClassNameField
          className="test-class"
          onChange={mockOnChange}
          label="CSS Classes"
        />
      </FormWrapper>
    );

    // No description should be present
    expect(screen.getByText("CSS Classes")).toBeInTheDocument();
    // Ensure no description text is present
    expect(screen.queryByText(/Enter.*class/)).not.toBeInTheDocument();
  });

  it("passes className and onChange to ClassNameMultiselect", () => {
    render(
      <FormWrapper>
        <ClassNameField
          className="initial-class"
          onChange={mockOnChange}
        />
      </FormWrapper>
    );

    const multiselect = screen.getByTestId("classname-multiselect");
    expect(multiselect).toHaveValue("initial-class");
  });
});