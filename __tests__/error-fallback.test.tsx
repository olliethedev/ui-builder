import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorFallback } from "@/components/ui/ui-builder/internal/components/error-fallback";

describe("ErrorFallback", () => {
  it("renders error message", () => {
    const error = new Error("Test error message");
    
    render(<ErrorFallback error={error} />);
    
    expect(screen.getByText("Component Error")).toBeInTheDocument();
    expect(screen.getByText("Error: Test error message")).toBeInTheDocument();
  });

  it("renders with unknown error when message is not provided", () => {
    const error = new Error();
    error.message = "";
    
    render(<ErrorFallback error={error} />);
    
    expect(screen.getByText("Component Error")).toBeInTheDocument();
    expect(screen.getByText("Error: Unknown error")).toBeInTheDocument();
  });

  it("renders with unknown error when error is null", () => {
    render(<ErrorFallback error={null as any} />);
    
    expect(screen.getByText("Component Error")).toBeInTheDocument();
    expect(screen.getByText("Error: Unknown error")).toBeInTheDocument();
  });

  it("renders with unknown error when error is undefined", () => {
    render(<ErrorFallback error={undefined as any} />);
    
    expect(screen.getByText("Component Error")).toBeInTheDocument();
    expect(screen.getByText("Error: Unknown error")).toBeInTheDocument();
  });

  it("renders stack trace in details element", () => {
    const error = new Error("Test error");
    error.stack = "Error: Test error\n    at test.js:1:1";
    
    render(<ErrorFallback error={error} />);
    
    expect(screen.getByText("Stack trace")).toBeInTheDocument();
    // Use getByText with a function to match partial text
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && 
             content.includes("Error: Test error") && 
             content.includes("at test.js:1:1");
    })).toBeInTheDocument();
  });

  it("renders with empty stack trace when not provided", () => {
    const error = new Error("Test error");
    error.stack = undefined;
    
    render(<ErrorFallback error={error} />);
    
    expect(screen.getByText("Stack trace")).toBeInTheDocument();
    // The pre element should still be there but empty
    const preElement = screen.getByText("Stack trace").parentElement?.querySelector('pre');
    expect(preElement).toBeInTheDocument();
  });

  it("has correct CSS classes for styling", () => {
    const error = new Error("Test error");
    
    const { container } = render(<ErrorFallback error={error} />);
    
    const errorDiv = container.firstChild as HTMLElement;
    expect(errorDiv).toHaveClass("p-4", "border", "border-red-500", "bg-red-100", "text-red-700", "rounded", "flex-grow", "w-full");
  });

  it("has correct structure with heading, message, and details", () => {
    const error = new Error("Test error message");
    error.stack = "Error: Test error\n    at test.js:1:1";
    
    render(<ErrorFallback error={error} />);
    
    // Check heading
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Component Error");
    expect(heading).toHaveClass("font-bold", "mb-2");
    
    // Check details element
    const details = screen.getByRole("group");
    expect(details).toBeInTheDocument();
    
    // Check summary
    const summary = screen.getByText("Stack trace");
    expect(summary).toHaveClass("cursor-pointer");
    
    // Check pre element with flexible matching
    const preElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && 
             content.includes("Error: Test error") && 
             content.includes("at test.js:1:1");
    });
    expect(preElement).toHaveClass("mt-2", "text-xs", "whitespace-pre-wrap");
  });
});