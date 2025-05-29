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

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span />,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

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
      expect(screen.getByText('Add Variable')).toBeInTheDocument();
    });

    it('should hide add button when editVariables is false', () => {
      render(<VariablesPanel editVariables={false} />);
      
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

      render(<VariablesPanel editVariables={false} />);
      
      expect(screen.getByText('No variables defined.')).toBeInTheDocument();
      expect(screen.queryByText(/Click "Add Variable"/)).not.toBeInTheDocument();
    });

    it('should hide edit and delete buttons when editVariables is false', () => {
      render(<VariablesPanel editVariables={false} />);
      
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
      fireEvent.click(deleteButtons[0]);
      
      expect(mockRemoveVariable).toHaveBeenCalledWith('var1');
      expect(mockIncrementRevision).toHaveBeenCalled();
    });

    it('should handle variable editing state', () => {
      render(<VariablesPanel />);
      
      // Find all edit buttons
      const editButtons = screen.getAllByText('✎');
      fireEvent.click(editButtons[0]);
      
      // Should show editing form for the variable
      expect(screen.getByDisplayValue('userName')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
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
      
      await userEvent.type(nameInput, 'testVar');
      await userEvent.type(valueInput, 'test value');
      
      // Save
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockAddVariable).toHaveBeenCalledWith('testVar', 'string', 'test value');
      });
    });

    it('should handle number type conversion', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Fill the form with number type
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      await userEvent.type(nameInput, 'numVar');
      fireEvent.change(typeSelect, { target: { value: 'number' } });
      await userEvent.type(valueInput, '42');
      
      // Save
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockAddVariable).toHaveBeenCalledWith('numVar', 'number', 42);
      });
    });

    it('should handle boolean type conversion', async () => {
      render(<VariablesPanel />);
      
      fireEvent.click(screen.getByText('Add Variable'));
      
      // Fill the form with boolean type
      const nameInput = screen.getByLabelText(/Name/);
      const typeSelect = screen.getByRole('combobox');
      const valueInput = screen.getByLabelText(/Preview Value/);
      
      await userEvent.type(nameInput, 'boolVar');
      fireEvent.change(typeSelect, { target: { value: 'boolean' } });
      await userEvent.clear(valueInput);
      await userEvent.type(valueInput, 'true');
      
      // Save
      const saveButton = screen.getByText('✓');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockAddVariable).toHaveBeenCalledWith('boolVar', 'boolean', true);
      });
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
  });
}); 