import { renderHook, act } from '@testing-library/react';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

// Mock the editor store
jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: {
    getState: jest.fn(() => ({
      registry: {
        Button: {
          schema: z.object({
            label: z.string().default('Click me'),
            className: z.string().optional(),
          }),
        },
      },
    })),
  },
}));

describe('Layer Store - Variables', () => {
  beforeEach(() => {
    // Reset the store to a clean state before each test
    const { result } = renderHook(() => useLayerStore());
    act(() => {
      // Use setState to completely reset the store state
      result.current.initialize([
        {
          id: 'test-page',
          type: 'div',
          name: 'Test Page',
          props: { className: 'p-4 flex flex-col gap-2' },
          children: [],
        }
      ], 'test-page');
      
      // Manually reset variables array since initialize doesn't handle it
      useLayerStore.setState({ variables: [] });
    });
  });

  describe('Variable CRUD Operations', () => {
    it('should add a new variable', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const variables = result.current.variables;
      expect(variables).toHaveLength(1);
      expect(variables[0]).toMatchObject({
        name: 'userName',
        type: 'string',
        defaultValue: 'John Doe',
      });
      expect(variables[0].id).toBeDefined();
    });

    it('should add multiple variables of different types', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
        result.current.addVariable('userAge', 'number', 25);
        result.current.addVariable('isActive', 'boolean', true);
      });

      const variables = result.current.variables;
      expect(variables).toHaveLength(3);
      
      expect(variables[0]).toMatchObject({
        name: 'userName',
        type: 'string',
        defaultValue: 'John Doe',
      });
      
      expect(variables[1]).toMatchObject({
        name: 'userAge',
        type: 'number',
        defaultValue: 25,
      });
      
      expect(variables[2]).toMatchObject({
        name: 'isActive',
        type: 'boolean',
        defaultValue: true,
      });
    });

    it('should update an existing variable', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a variable first
      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const variableId = result.current.variables[0].id;

      // Update the variable
      act(() => {
        result.current.updateVariable(variableId, {
          name: 'fullName',
          type: 'string',
          defaultValue: 'Jane Smith',
        });
      });

      const variables = result.current.variables;
      expect(variables).toHaveLength(1);
      expect(variables[0]).toMatchObject({
        id: variableId,
        name: 'fullName',
        type: 'string',
        defaultValue: 'Jane Smith',
      });
    });

    it('should partially update a variable', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a variable first
      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const variableId = result.current.variables[0].id;

      // Partially update the variable (only name)
      act(() => {
        result.current.updateVariable(variableId, {
          name: 'fullName',
        });
      });

      const variables = result.current.variables;
      expect(variables[0]).toMatchObject({
        id: variableId,
        name: 'fullName',
        type: 'string', // Should remain unchanged
        defaultValue: 'John Doe', // Should remain unchanged
      });
    });

    it('should ignore updates to non-existent variables', () => {
      const { result } = renderHook(() => useLayerStore());

      // Try to update a non-existent variable
      act(() => {
        result.current.updateVariable('non-existent-id', {
          name: 'newName',
        });
      });

      // Should not crash and variables should remain empty
      expect(result.current.variables).toHaveLength(0);
    });

    it('should remove a variable', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add multiple variables
      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
        result.current.addVariable('userAge', 'number', 25);
      });

      const variableId = result.current.variables[0].id;

      // Remove the first variable
      act(() => {
        result.current.removeVariable(variableId);
      });

      const variables = result.current.variables;
      expect(variables).toHaveLength(1);
      expect(variables[0].name).toBe('userAge');
    });

    it('should ignore removal of non-existent variables', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a variable
      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      // Try to remove a non-existent variable
      act(() => {
        result.current.removeVariable('non-existent-id');
      });

      // Should not crash and original variable should remain
      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe('userName');
    });
  });

  describe('Variable Binding', () => {
    it('should bind a prop to a variable', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // Bind the label prop to the variable
      act(() => {
        result.current.bindPropToVariable(layerId, 'label', variableId);
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.label).toEqual({ __variableRef: variableId });
    });

    it('should unbind a prop from a variable and set default value', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // First bind the prop
      act(() => {
        result.current.bindPropToVariable(layerId, 'label', variableId);
      });

      // Then unbind it
      act(() => {
        result.current.unbindPropFromVariable(layerId, 'label');
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      // Should be set to the default value from schema
      expect(layer.props.label).toBe('Click me');
    });
  });

  describe('Variable Reference Cleanup', () => {
    it('should clean up variable references when a variable is removed', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // Bind the label prop to the variable
      act(() => {
        result.current.bindPropToVariable(layerId, 'label', variableId);
      });

      // Verify the binding exists
      let layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.label).toEqual({ __variableRef: variableId });

      // Remove the variable
      act(() => {
        result.current.removeVariable(variableId);
      });

      // The prop should be reset to default value
      layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.label).toBe('Click me'); // Default from schema
    });

    it('should clean up multiple variable references across different layers', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add multiple layers and a variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layers = result.current.findLayersForPageId(result.current.selectedPageId!)!;
      const variableId = result.current.variables[0].id;

      // Bind the same variable to both layers
      act(() => {
        result.current.bindPropToVariable(layers[0].id, 'label', variableId);
        result.current.bindPropToVariable(layers[1].id, 'label', variableId);
      });

      // Remove the variable
      act(() => {
        result.current.removeVariable(variableId);
      });

      // Both layers should have their props reset
      const updatedLayers = result.current.findLayersForPageId(result.current.selectedPageId!)!;
      expect((updatedLayers[0] as ComponentLayer).props.label).toBe('Click me');
      expect((updatedLayers[1] as ComponentLayer).props.label).toBe('Click me');
    });

    it('should handle removal of variables with no references', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a variable without any references
      act(() => {
        result.current.addVariable('unusedVar', 'string', 'Unused');
      });

      const variableId = result.current.variables[0].id;

      // Remove the variable (should not crash)
      act(() => {
        result.current.removeVariable(variableId);
      });

      expect(result.current.variables).toHaveLength(0);
    });

    it('should preserve non-variable props when cleaning up variable references', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // Set both variable and non-variable props
      act(() => {
        result.current.updateLayer(layerId, {
          className: 'custom-class',
        });
        result.current.bindPropToVariable(layerId, 'label', variableId);
      });

      // Remove the variable
      act(() => {
        result.current.removeVariable(variableId);
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.label).toBe('Click me'); // Reset to default
      expect(layer.props.className).toBe('custom-class'); // Preserved
    });
  });

  describe('Edge Cases', () => {
    it('should handle variable operations with empty store', () => {
      const { result } = renderHook(() => useLayerStore());

      // Try operations on empty store
      act(() => {
        result.current.updateVariable('non-existent', { name: 'test' });
        result.current.removeVariable('non-existent');
        result.current.bindPropToVariable('non-existent-layer', 'prop', 'non-existent-var');
      });

      // Should not crash
      expect(result.current.variables).toHaveLength(0);
    });

    it('should generate unique IDs for variables', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addVariable('var1', 'string', 'value1');
        result.current.addVariable('var2', 'string', 'value2');
        result.current.addVariable('var3', 'string', 'value3');
      });

      const variables = result.current.variables;
      const ids = variables.map(v => v.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(3); // All IDs should be unique
    });

    it('should handle variable binding to non-existent layers gracefully', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const variableId = result.current.variables[0].id;

      // Try to bind to non-existent layer (should not crash)
      act(() => {
        result.current.bindPropToVariable('non-existent-layer', 'label', variableId);
      });

      // Variable should still exist
      expect(result.current.variables).toHaveLength(1);
    });
  });

  describe('Immutable Bindings', () => {
    it('should prevent unbinding immutable variable bindings', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // Bind the label prop to the variable and mark as immutable
      act(() => {
        result.current.bindPropToVariable(layerId, 'label', variableId);
        // Set immutable binding using the test helper
        result.current.setImmutableBinding(layerId, 'label', true);
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.label).toEqual({ __variableRef: variableId });
      expect(result.current.isBindingImmutable(layerId, 'label')).toBe(true);

      // Try to unbind immutable binding (should fail)
      act(() => {
        result.current.unbindPropFromVariable(layerId, 'label');
      });

      // Binding should still exist
      const layerAfterUnbind = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layerAfterUnbind.props.label).toEqual({ __variableRef: variableId });
    });

    it('should allow unbinding mutable variable bindings', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // Bind the label prop to the variable (mutable by default)
      act(() => {
        result.current.bindPropToVariable(layerId, 'label', variableId);
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.label).toEqual({ __variableRef: variableId });
      expect(result.current.isBindingImmutable(layerId, 'label')).toBe(false);

      // Unbind mutable binding (should succeed)
      act(() => {
        result.current.unbindPropFromVariable(layerId, 'label');
      });

      // Binding should be removed and default value set
      const layerAfterUnbind = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layerAfterUnbind.props.label).toBe('Click me'); // Default from schema
    });

    it('should correctly track immutable bindings across layer operations', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer and variable
      act(() => {
        result.current.addComponentLayer('Button', result.current.selectedPageId!);
        result.current.addVariable('userName', 'string', 'John Doe');
      });

      const layerId = result.current.findLayersForPageId(result.current.selectedPageId!)![0].id;
      const variableId = result.current.variables[0].id;

      // Bind and mark as immutable
      act(() => {
        result.current.bindPropToVariable(layerId, 'label', variableId);
        // Set immutable binding using the test helper
        result.current.setImmutableBinding(layerId, 'label', true);
      });

      expect(result.current.isBindingImmutable(layerId, 'label')).toBe(true);
      expect(result.current.isBindingImmutable(layerId, 'nonExistentProp')).toBe(false);
      expect(result.current.isBindingImmutable('nonExistentLayer', 'label')).toBe(false);
    });
  });
}); 