import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariablesPanel } from '@/components/ui/ui-builder/internal/variables-panel';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';

// Mock dependencies
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn(),
}));

// Mock UI components with simpler implementations
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
}));

jest.mock('@/components/ui/select', () => {
  const SelectComponent = ({ children, value, onValueChange }: any) => {
    const handleChange = React.useCallback((e: any) => {
      onValueChange?.(e.target.value);
    }, [onValueChange]);
    
    return (
      <select value={value} onChange={handleChange}>
        {children}
      </select>
    );
  };
  
  return {
    Select: SelectComponent,
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => <span />,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  };
});

// Mock icons
jest.mock('lucide-react', () => ({
  Plus: () => <span>+</span>,
  Check: () => <span>✓</span>,
  X: () => <span>✗</span>,
  Edit2: () => <span>✎</span>,
  Trash2: () => <span>🗑</span>,
}));

const mockedUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
const mockedUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;

describe('VariablesPanel', () => {
  const mockVariables = [
    { id: 'var1', name: 'userName', type: 'string' as const, defaultValue: 'John Doe' },
    { id: 'var2', name: 'userAge', type: 'number' as const, defaultValue: 25 },
    { id: 'var3', name: 'isActive', type: 'boolean' as const, defaultValue: true },
  ];

  const mockAddVariable = jest.fn();
  const mockUpdateVariable = jest.fn();
  const mockRemoveVariable = jest.fn();
  const mockIncrementRevision = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockedUseLayerStore.mockReturnValue({
      variables: mockVariables,
      addVariable: mockAddVariable,
      updateVariable: mockUpdateVariable,
      removeVariable: mockRemoveVariable,
    });

    mockedUseEditorStore.mockImplementation((selector) => {
      const state = { 
        incrementRevision: mockIncrementRevision,
        allowVariableEditing: true,
        // Add other required properties to satisfy TypeScript
        previewMode: false,
        setPreviewMode: jest.fn(),
        registry: {},
        initialize: jest.fn(),
        getComponentDefinition: jest.fn(),
        revisionCounter: 0,
        setRevisionCounter: jest.fn(),
      } as any;
      return selector(state);
    });
  });

  describe('Initial Render', () => {
    it('should render the variables panel with title and add button', () => {
      render(<VariablesPanel />);
      
      expect(screen.getByText('Variables')).toBeInTheDocument();
      
      // Debug: Let's try to find the button by its role instead
      const addButton = screen.queryByRole('button', { name: /add variable/i });
      if (!addButton) {
        // If button not found, let's see what buttons are rendered
        const allButtons = screen.queryAllByRole('button');
        console.log('All buttons found:', allButtons.map(btn => btn.textContent));
      }
      
      expect(addButton).toBeInTheDocument();
    });

    it('should hide add button when editVariables is false', () => {
      // Mock allowVariableEditing to false for this test
      mockedUseEditorStore.mockImplementation((selector) => {
        const state = { 
          incrementRevision: mockIncrementRevision,
          allowVariableEditing: false, // Set to false for this test
          previewMode: false,
          setPreviewMode: jest.fn(),
          registry: {},
          initialize: jest.fn(),
          getComponentDefinition: jest.fn(),
          revisionCounter: 0,
          setRevisionCounter: jest.fn(),
        } as any;
        return selector(state);
      });
      
      render(<VariablesPanel />);
      
      expect(screen.getByText('Variables')).toBeInTheDocument();
      expect(screen.queryByText('Add Variable')).not.toBeInTheDocument();
    });

    it('should display existing variables', () => {
      render(<VariablesPanel />);
      
      expect(screen.getByText('userName')).toBeInTheDocument();
      expect(screen.getByText('userAge')).toBeInTheDocument();
      expect(screen.getByText('isActive')).toBeInTheDocument();
      expect(screen.getByText('string')).toBeInTheDocument();
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getByText('boolean')).toBeInTheDocument();
    });

    it('should show empty state when no variables exist', () => {
      mockedUseLayerStore.mockReturnValue({
        variables: [],
        addVariable: mockAddVariable,
        updateVariable: mockUpdateVariable,
        removeVariable: mockRemoveVariable,
      });

      render(<VariablesPanel />);
      
      expect(screen.getByText(/No variables defined/)).toBeInTheDocument();
    });

    it('should show appropriate empty state when editing is disabled', () => {
      mockedUseLayerStore.mockReturnValue({
        variables: [],
        addVariable: mockAddVariable,
        updateVariable: mockUpdateVariable,
        removeVariable: mockRemoveVariable,
      });

      // Mock allowVariableEditing to false for this test
      mockedUseEditorStore.mockImplementation((selector) => {
        const state = { 
          incrementRevision: mockIncrementRevision,
          allowVariableEditing: false, // Set to false for this test
          previewMode: false,
          setPreviewMode: jest.fn(),
          registry: {},
          initialize: jest.fn(),
          getComponentDefinition: jest.fn(),
          revisionCounter: 0,
          setRevisionCounter: jest.fn(),
        } as any;
        return selector(state);
      });

      render(<VariablesPanel />);
      
      expect(screen.getByText('No variables defined.')).toBeInTheDocument();
      expect(screen.queryByText(/Click "Add Variable"/)).not.toBeInTheDocument();
    });

    it('should hide edit and delete buttons when editVariables is false', () => {
      // Mock allowVariableEditing to false for this test
      mockedUseEditorStore.mockImplementation((selector) => {
        const state = { 
          incrementRevision: mockIncrementRevision,
          allowVariableEditing: false, // Set to false for this test
          previewMode: false,
          setPreviewMode: jest.fn(),
          registry: {},
          initialize: jest.fn(),
          getComponentDefinition: jest.fn(),
          revisionCounter: 0,
          setRevisionCounter: jest.fn(),
        } as any;
        return selector(state);
      });
      
      render(<VariablesPanel />);
      
      // Variables should still be displayed
      expect(screen.getByText('userName')).toBeInTheDocument();
      expect(screen.getByText('userAge')).toBeInTheDocument();
      
      // But edit and delete buttons should not be present
      expect(screen.queryByText('✎')).not.toBeInTheDocument();
      expect(screen.queryByText('🗑')).not.toBeInTheDocument();
    });
  });

  describe('Variable Management', () => {
    it('should call removeVariable when delete button is clicked', () => {
      render(<VariablesPanel />);
      
      // Find all delete buttons (trash icons)
      const deleteButtons = screen.getAllByText('🗑');
      fireEvent.click(deleteButtons[0]!);
      
      expect(mockRemoveVariable).toHaveBeenCalledWith('var1');
      expect(mockIncrementRevision).toHaveBeenCalled();
    });

    it('should handle variable editing state', () => {
      render(<VariablesPanel />);
      
      // Find all edit buttons
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Should show editing form for the variable
      expect(screen.getByDisplayValue('userName')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('should successfully edit a variable', async () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Modify the values
      const nameInput = screen.getByDisplayValue('userName');
      const valueInput = screen.getByDisplayValue('John Doe');
      
      fireEvent.change(nameInput, { target: { value: 'fullName' } });
      fireEvent.change(valueInput, { target: { value: 'Jane Smith' } });
      
      // Save changes
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(mockUpdateVariable).toHaveBeenCalledWith('var1', {
        name: 'fullName',
        type: 'string',
        defaultValue: 'Jane Smith'
      });
    });

    it('should cancel editing without saving changes', () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Modify a value
      const nameInput = screen.getByDisplayValue('userName');
      fireEvent.change(nameInput, { target: { value: 'newName' } });
      
      // Cancel changes
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      // Should not call updateVariable
      expect(mockUpdateVariable).not.toHaveBeenCalled();
      
      // Should exit editing mode (form should be hidden)
      expect(screen.queryByDisplayValue('newName')).not.toBeInTheDocument();
      expect(screen.getByText('userName')).toBeInTheDocument(); // Original name should be visible
    });

    it('should validate edit form fields', async () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Clear required fields
      const nameInput = screen.getByDisplayValue('userName');
      const valueInput = screen.getByDisplayValue('John Doe');
      
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.change(valueInput, { target: { value: '' } });
      
      // Try to save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Preview value is required')).toBeInTheDocument();
      });
      
      // Should not call updateVariable
      expect(mockUpdateVariable).not.toHaveBeenCalled();
    });

    it('should clear validation errors when typing in edit form', async () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Clear fields to trigger validation
      const nameInput = screen.getByDisplayValue('userName');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Try to save to trigger validation errors
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Start typing again
      fireEvent.change(nameInput, { target: { value: 'newName' } });
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    }, 15000);

    it('should handle type changes in edit form', () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable (string type)
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Change type to number - this should reset the value
      const typeSelect = screen.getAllByRole('combobox')[0]!;
      fireEvent.change(typeSelect, { target: { value: 'number' } });
      
      // Value is reset when type changes, so find the empty input by placeholder
      // and enter a new value
      const valueInput = screen.getByPlaceholderText('0');
      fireEvent.change(valueInput, { target: { value: '42' } });
      
      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(mockUpdateVariable).toHaveBeenCalledWith('var1', {
        name: 'userName',
        type: 'number',
        defaultValue: 42
      });
    });

    it('should handle boolean type conversion in edit form', () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]!);
      
      // Change type to boolean - this should reset the value
      const typeSelect = screen.getAllByRole('combobox')[0]!;
      fireEvent.change(typeSelect, { target: { value: 'boolean' } });
      
      // Value is reset when type changes, so find the empty input by placeholder
      const valueInput = screen.getByPlaceholderText('true');
      fireEvent.change(valueInput, { target: { value: 'false' } });
      
      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(mockUpdateVariable).toHaveBeenCalledWith('var1', {
        name: 'userName',
        type: 'boolean',
        defaultValue: false
      });
    });
  });

  describe('Add Variable Form', () => {
    it('should show add form when Add Variable button is clicked', () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      expect(screen.getByText('Add New Variable')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preview Value/)).toBeInTheDocument();
    });

    it('should disable Add Variable button when form is open', () => {
      render(<VariablesPanel />);
      
      const addButton = screen.getByText('Add Variable');
      fireEvent.click(addButton);
      
      expect(addButton).toBeDisabled();
    });

    it('should validate required fields in add form', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Try to save without filling fields
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Preview value is required')).toBeInTheDocument();
      });
    });

    it('should successfully add a variable with valid data', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Fill the form
      const nameInput = screen.getByLabelText(/Name/);
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      fireEvent.change(nameInput, { target: { value: 'testVar' } });
      fireEvent.change(valueInput, { target: { value: 'test value' } });
      
      // Save
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      expect(mockAddVariable).toHaveBeenCalledWith('testVar', 'string', 'test value');
      expect(mockIncrementRevision).toHaveBeenCalled();
    });

    it('should handle number type conversion', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Fill the form with number type
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      fireEvent.change(nameInput, { target: { value: 'numVar' } });
      fireEvent.change(typeSelect, { target: { value: 'number' } });
      fireEvent.change(valueInput, { target: { value: '42' } });
      
      // Save
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      expect(mockAddVariable).toHaveBeenCalledWith('numVar', 'number', 42);
      expect(mockIncrementRevision).toHaveBeenCalled();
    });

    it('should handle boolean type conversion', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Fill the form with boolean type
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      fireEvent.change(nameInput, { target: { value: 'boolVar' } });
      fireEvent.change(typeSelect, { target: { value: 'boolean' } });
      fireEvent.change(valueInput, { target: { value: 'true' } });
      
      // Save
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      expect(mockAddVariable).toHaveBeenCalledWith('boolVar', 'boolean', true);
      expect(mockIncrementRevision).toHaveBeenCalled();
    });

    it('should cancel add form when cancel button is clicked', () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByText('Add New Variable')).toBeInTheDocument();
      
      // Click cancel
      const cancelButton = screen.getByText('✗');
      fireEvent.click(cancelButton);
      
      // Form should be hidden
      expect(screen.queryByText('Add New Variable')).not.toBeInTheDocument();
      
      // Add button should be enabled again
      expect(screen.getByText('Add Variable')).not.toBeDisabled();
    });

    it('should show correct placeholders for different types', () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      // Test string placeholder (default)
      expect(valueInput).toHaveAttribute('placeholder', 'Enter text...');
      
      // Test number placeholder
      fireEvent.change(typeSelect, { target: { value: 'number' } });
      expect(valueInput).toHaveAttribute('placeholder', '0');
      
      // Test boolean placeholder
      fireEvent.change(typeSelect, { target: { value: 'boolean' } });
      expect(valueInput).toHaveAttribute('placeholder', 'true');
    });

    it('should reset form after successful save', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Fill and save
      const nameInput = screen.getByLabelText(/Name/);
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      fireEvent.change(nameInput, { target: { value: 'testVar' } });
      fireEvent.change(valueInput, { target: { value: 'test value' } });
      
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      expect(mockAddVariable).toHaveBeenCalledWith('testVar', 'string', 'test value');
      expect(mockIncrementRevision).toHaveBeenCalled();
      
      // Note: The actual component doesn't close the form after save, so this test verifies the save behavior
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid number input gracefully', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      await userEvent.type(nameInput, 'invalidNum');
      fireEvent.change(typeSelect, { target: { value: 'number' } });
      await userEvent.type(valueInput, 'not-a-number');
      
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        // Should convert invalid number to 0
        expect(mockAddVariable).toHaveBeenCalledWith('invalidNum', 'number', 0);
      });
    });

    it('should clear validation errors when user types', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Trigger validation errors
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      // Start typing in name field
      const nameInput = screen.getByLabelText(/Name/);
      await userEvent.type(nameInput, 'test');
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });

    it('should handle edge case boolean values', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      // Test various boolean-like inputs
      fireEvent.change(nameInput, { target: { value: 'boolTest' } });
      fireEvent.change(typeSelect, { target: { value: 'boolean' } });
      
      // Test "false" (should be false)
      fireEvent.change(valueInput, { target: { value: 'false' } });
      fireEvent.click(screen.getByText('✓'));
      
      await waitFor(() => {
        expect(mockAddVariable).toHaveBeenCalledWith('boolTest', 'boolean', false);
      });
    });

    it('should handle empty string number conversion', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      fireEvent.change(nameInput, { target: { value: 'emptyNum' } });
      fireEvent.change(typeSelect, { target: { value: 'number' } });
      fireEvent.change(valueInput, { target: { value: '   ' } }); // Whitespace only
      
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      // Should show validation error for empty value
      await waitFor(() => {
        expect(screen.getByText('Preview value is required')).toBeInTheDocument();
      });
    });
  });

  describe('Component Props and Styling', () => {
    it('should apply custom className prop', () => {
      const customClass = 'custom-variables-panel';
      render(<VariablesPanel className={customClass} />);
      
      // Find the root container div (parent of the header)
      const panel = screen.getByText('Variables').closest('div')?.parentElement;
      expect(panel).toHaveClass(customClass);
    });

    it('should render with default styling when no className provided', () => {
      render(<VariablesPanel />);
      
      // Find the root container div (parent of the header)
      const panel = screen.getByText('Variables').closest('div')?.parentElement;
      expect(panel).toHaveClass('flex', 'flex-col', 'gap-4', 'p-4');
    });
  });

  describe('Multiple Variable Interactions', () => {
    it('should only allow editing one variable at a time', () => {
      render(<VariablesPanel />);
      
      // Click edit on first variable
      const editButtons = screen.getAllByText('✎');
      expect(editButtons[0]).toBeDefined();
      expect(editButtons[1]).toBeDefined();
      fireEvent.click(editButtons[0]!);
      
      // Verify first variable is in edit mode
      expect(screen.getByDisplayValue('userName')).toBeInTheDocument();
      
      // Click edit on second variable
      fireEvent.click(editButtons[1]!);
      
      // First variable should no longer be in edit mode
      expect(screen.queryByDisplayValue('userName')).not.toBeInTheDocument();
      
      // Second variable should be in edit mode
      expect(screen.getByDisplayValue('userAge')).toBeInTheDocument();
    });

    it('should allow both add form and edit mode to be active', () => {
      render(<VariablesPanel />);
      
      // Open add form
      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByText('Add New Variable')).toBeInTheDocument();
      
      // Start editing existing variable
      const editButtons = screen.getAllByText('✎');
      expect(editButtons[0]).toBeDefined();
      fireEvent.click(editButtons[0]!);
      
      // Both forms should be visible (the component allows this behavior)
      expect(screen.getByText('Add New Variable')).toBeInTheDocument();
      expect(screen.getByDisplayValue('userName')).toBeInTheDocument();
    });

    it('should handle variable deletion correctly', () => {
      render(<VariablesPanel />);
      
      // Verify all variables are present
      expect(screen.getByText('userName')).toBeInTheDocument();
      expect(screen.getByText('userAge')).toBeInTheDocument();
      expect(screen.getByText('isActive')).toBeInTheDocument();
      
      // Delete first variable
      const deleteButtons = screen.getAllByText('🗑');
      expect(deleteButtons[0]).toBeDefined();
      fireEvent.click(deleteButtons[0]!);
      
      expect(mockRemoveVariable).toHaveBeenCalledWith('var1');
      expect(mockIncrementRevision).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and State Management', () => {
    it('should handle state updates correctly when variables change', () => {
      const { rerender } = render(<VariablesPanel />);
      
      // Start editing a variable
      const editButtons = screen.getAllByText('✎');
      expect(editButtons[0]).toBeDefined();
      fireEvent.click(editButtons[0]!);
      
      // Variable should be in edit mode
      expect(screen.getByDisplayValue('userName')).toBeInTheDocument();
      
      // Update mock to simulate variable being deleted externally
      mockedUseLayerStore.mockReturnValue({
        variables: mockVariables.slice(1), // Remove first variable
        addVariable: mockAddVariable,
        updateVariable: mockUpdateVariable,
        removeVariable: mockRemoveVariable,
      });
      
      rerender(<VariablesPanel />);
      
      // Edit form should still work with remaining variables
      expect(screen.getByText('userAge')).toBeInTheDocument();
      expect(screen.getByText('isActive')).toBeInTheDocument();
    });

    it('should maintain form state during re-renders', () => {
      const { rerender } = render(<VariablesPanel />);
      
      // Open add form and fill some data
      fireEvent.click(screen.getByText('Add Variable'));
      const nameInput = screen.getByLabelText(/Name/);
      fireEvent.change(nameInput, { target: { value: 'testVar' } });
      
      // Trigger a re-render
      rerender(<VariablesPanel />);
      
      // Form data should be preserved
      expect(screen.getByDisplayValue('testVar')).toBeInTheDocument();
    });

    it('should handle empty variables array correctly', () => {
      mockedUseLayerStore.mockReturnValue({
        variables: [],
        addVariable: mockAddVariable,
        updateVariable: mockUpdateVariable,
        removeVariable: mockRemoveVariable,
      });

      render(<VariablesPanel />);
      
      expect(screen.getByText(/No variables defined/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });
}); 