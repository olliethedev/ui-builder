import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClassNameMultiselect from "@/components/ui/ui-builder/internal/classname-multiselect";

// Mock the MultipleSelector component
jest.mock("@/components/ui/ui-builder/multi-select", () => ({
  __esModule: true,
  default: ({ 
    value, 
    onChange, 
    placeholder, 
    creatable, 
    emptyIndicator, 
    loadingIndicator, 
    onSearch,
    defaultOptions,
    ...props 
  }: any) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState<any[]>([]);

    const handleSearch = async (val: string) => {
      setSearchValue(val);
      if (onSearch && val) {
        setIsLoading(true);
        try {
          const results = await onSearch(val);
          setSearchResults(results);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const handleOptionClick = (option: any) => {
      const newValue = [...(value || []), option];
      onChange?.(newValue);
    };

    const handleRemove = (optionToRemove: any) => {
      const newValue = (value || []).filter((v: any) => v.value !== optionToRemove.value);
      onChange?.(newValue);
    };

    return (
      <div data-testid="multiple-selector">
        <input
          data-testid="search-input"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {/* Selected values */}
        <div data-testid="selected-values">
          {(value || []).map((item: any, index: number) => (
            <div key={index} data-testid={`selected-${item.value}`}>
              {item.label}
              <button 
                data-testid={`remove-${item.value}`}
                onClick={() => handleRemove(item)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && <div data-testid="loading-indicator">{loadingIndicator}</div>}

        {/* Search results */}
        {!isLoading && searchResults.length > 0 && (
          <div data-testid="search-results">
            {searchResults.map((result: any, index: number) => (
              <button
                key={index}
                data-testid={`option-${result.value}`}
                onClick={() => handleOptionClick(result)}
              >
                {result.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty indicator */}
        {!isLoading && searchValue && searchResults.length === 0 && (
          <div data-testid="empty-indicator">{emptyIndicator}</div>
        )}

        {/* Creatable option */}
        {creatable && searchValue && !searchResults.some((r: any) => r.value === searchValue) && (
          <button
            data-testid={`create-${searchValue}`}
            onClick={() => handleOptionClick({ value: searchValue, label: searchValue })}
          >
            Create "{searchValue}"
          </button>
        )}
      </div>
    );
  },
}));

// Mock the tailwind classes
jest.mock("@/components/ui/ui-builder/internal/tailwind-classes", () => ({
  TAILWIND_CLASSES_WITH_BREAKPOINTS: [
    "bg-red-500",
    "text-blue-600", 
    "p-4",
    "m-2",
    "flex",
    "grid",
    "bg-green-300",
    "text-red-400",
  ],
}));

describe("ClassNameMultiselect", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with basic props", () => {
    render(<ClassNameMultiselect {...defaultProps} />);
    
    expect(screen.getByTestId("multiple-selector")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type class name...")).toBeInTheDocument();
  });

  it("handles empty value correctly", () => {
    render(<ClassNameMultiselect value="" onChange={defaultProps.onChange} />);
    
    const selectedValues = screen.getByTestId("selected-values");
    expect(selectedValues.children).toHaveLength(0);
  });

  it("handles single class value correctly", () => {
    render(<ClassNameMultiselect value="bg-red-500" onChange={defaultProps.onChange} />);
    
    expect(screen.getByTestId("selected-bg-red-500")).toBeInTheDocument();
    expect(screen.getByTestId("selected-bg-red-500")).toHaveTextContent("bg-red-500");
  });

  it("handles multiple class values correctly", () => {
    render(<ClassNameMultiselect value="bg-red-500 text-blue-600 p-4" onChange={defaultProps.onChange} />);
    
    expect(screen.getByTestId("selected-bg-red-500")).toBeInTheDocument();
    expect(screen.getByTestId("selected-text-blue-600")).toBeInTheDocument();
    expect(screen.getByTestId("selected-p-4")).toBeInTheDocument();
  });

  it("filters out empty classes from value", () => {
    render(<ClassNameMultiselect value="bg-red-500  text-blue-600   " onChange={defaultProps.onChange} />);
    
    expect(screen.getByTestId("selected-bg-red-500")).toBeInTheDocument();
    expect(screen.getByTestId("selected-text-blue-600")).toBeInTheDocument();
    expect(screen.queryByTestId("selected-")).not.toBeInTheDocument();
  });

  it("calls onChange when a class is removed", async () => {
    const mockOnChange = jest.fn();
    render(<ClassNameMultiselect value="bg-red-500 text-blue-600" onChange={mockOnChange} />);
    
    const removeButton = screen.getByTestId("remove-bg-red-500");
    await userEvent.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith("text-blue-600");
  });

  it("calls onChange when a class is added", async () => {
    const mockOnChange = jest.fn();
    render(<ClassNameMultiselect value="bg-red-500" onChange={mockOnChange} />);
    
    const searchInput = screen.getByTestId("search-input");
    await userEvent.type(searchInput, "bg");
    
    // Wait for search results
    await waitFor(() => {
      expect(screen.getByTestId("search-results")).toBeInTheDocument();
    });
    
    const optionButton = screen.getByTestId("option-bg-green-300");
    await userEvent.click(optionButton);
    
    expect(mockOnChange).toHaveBeenCalledWith("bg-red-500 bg-green-300");
  });

  it("performs search with matching classes", async () => {
    render(<ClassNameMultiselect {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    await userEvent.type(searchInput, "bg");
    
    await waitFor(() => {
      expect(screen.getByTestId("search-results")).toBeInTheDocument();
    });
    
    expect(screen.getByTestId("option-bg-red-500")).toBeInTheDocument();
    expect(screen.getByTestId("option-bg-green-300")).toBeInTheDocument();
    expect(screen.queryByTestId("option-text-blue-600")).not.toBeInTheDocument();
  });

  it("shows loading indicator during search", async () => {
    render(<ClassNameMultiselect {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "bg" } });
    
    // Check if loading indicator appears briefly
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty indicator when no results found", async () => {
    render(<ClassNameMultiselect {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    await userEvent.type(searchInput, "nonexistent-class");
    
    await waitFor(() => {
      expect(screen.getByTestId("empty-indicator")).toBeInTheDocument();
    });
    
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("supports creatable functionality", async () => {
    const mockOnChange = jest.fn();
    render(<ClassNameMultiselect value="" onChange={mockOnChange} />);
    
    const searchInput = screen.getByTestId("search-input");
    await userEvent.type(searchInput, "custom-class");
    
    await waitFor(() => {
      const createButton = screen.getByTestId("create-custom-class");
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveTextContent('Create "custom-class"');
    });
    
    const createButton = screen.getByTestId("create-custom-class");
    await userEvent.click(createButton);
    
    expect(mockOnChange).toHaveBeenCalledWith("custom-class");
  });

  it("handles onChange with multiple selections correctly", async () => {
    const mockOnChange = jest.fn();
    render(<ClassNameMultiselect value="" onChange={mockOnChange} />);
    
    // Add first class
    const searchInput = screen.getByTestId("search-input");
    await userEvent.type(searchInput, "bg");
    
    await waitFor(() => {
      expect(screen.getByTestId("search-results")).toBeInTheDocument();
    });
    
    const firstOption = screen.getByTestId("option-bg-red-500");
    await userEvent.click(firstOption);
    
    expect(mockOnChange).toHaveBeenCalledWith("bg-red-500");
  });

  it("handles null/undefined value gracefully", () => {
    // @ts-ignore - Testing runtime behavior
    render(<ClassNameMultiselect value={null} onChange={defaultProps.onChange} />);
    
    const selectedValues = screen.getByTestId("selected-values");
    expect(selectedValues.children).toHaveLength(0);
  });

  it("searches for partial matches correctly", async () => {
    render(<ClassNameMultiselect {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    await userEvent.type(searchInput, "red");
    
    await waitFor(() => {
      expect(screen.getByTestId("search-results")).toBeInTheDocument();
    });
    
    expect(screen.getByTestId("option-bg-red-500")).toBeInTheDocument();
    expect(screen.getByTestId("option-text-red-400")).toBeInTheDocument();
    expect(screen.queryByTestId("option-bg-green-300")).not.toBeInTheDocument();
  });

  it("returns promise from searchClasses function", async () => {
    render(<ClassNameMultiselect {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    
    // Trigger search and verify it returns a promise (indicated by loading state)
    fireEvent.change(searchInput, { target: { value: "test" } });
    
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
    });
  });

  it("preserves class order when converting from string to options", () => {
    render(<ClassNameMultiselect value="z-10 bg-red-500 text-white p-4" onChange={defaultProps.onChange} />);
    
    const selectedValues = screen.getByTestId("selected-values");
    const children = Array.from(selectedValues.children);
    
    expect(children[0]).toHaveAttribute("data-testid", "selected-z-10");
    expect(children[1]).toHaveAttribute("data-testid", "selected-bg-red-500");
    expect(children[2]).toHaveAttribute("data-testid", "selected-text-white");
    expect(children[3]).toHaveAttribute("data-testid", "selected-p-4");
  });

  it("handles onChange when removing all classes", async () => {
    const mockOnChange = jest.fn();
    render(<ClassNameMultiselect value="bg-red-500" onChange={mockOnChange} />);
    
    const removeButton = screen.getByTestId("remove-bg-red-500");
    await userEvent.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith("");
  });
});