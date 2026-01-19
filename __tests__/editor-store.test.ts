import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import type { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

describe('EditorStore', () => {
  const mockRegistry: ComponentRegistry = {
    Button: {
      schema: z.object({
        label: z.string().default('Button'),
        disabled: z.boolean().default(false),
      }),
      from: '@/components/ui/button',
      component: () => null,
    },
    Input: {
      schema: z.object({
        placeholder: z.string().default('Enter text'),
        type: z.string().default('text'),
      }),
      from: '@/components/ui/input',
      component: () => null,
    },
    Card: {
      schema: z.object({
        title: z.string().default('Card Title'),
        content: z.string().default('Card Content'),
      }),
      from: '@/components/ui/card',
      component: () => null,
    },
  };

  beforeEach(() => {
    // Reset the store to its initial state before each test
    useEditorStore.setState({
      previewMode: 'responsive',
      registry: {},
      persistLayerStoreConfig: true,
      revisionCounter: 0,
      allowPagesCreation: true,
      allowPagesDeletion: true,
      allowVariableEditing: true,
    });
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.previewMode).toBe('responsive');
      expect(result.current.registry).toEqual({});
      expect(result.current.persistLayerStoreConfig).toBe(true);
      expect(result.current.revisionCounter).toBe(0);
      expect(result.current.allowPagesCreation).toBe(true);
      expect(result.current.allowPagesDeletion).toBe(true);
      expect(result.current.allowVariableEditing).toBe(true);
    });
  });

  describe('Preview Mode', () => {
    it('should set preview mode to mobile', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPreviewMode('mobile');
      });

      expect(result.current.previewMode).toBe('mobile');
    });

    it('should set preview mode to tablet', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPreviewMode('tablet');
      });

      expect(result.current.previewMode).toBe('tablet');
    });

    it('should set preview mode to desktop', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPreviewMode('desktop');
      });

      expect(result.current.previewMode).toBe('desktop');
    });

    it('should set preview mode to responsive', () => {
      const { result } = renderHook(() => useEditorStore());

      // First change to another mode
      act(() => {
        result.current.setPreviewMode('mobile');
      });

      // Then change back to responsive
      act(() => {
        result.current.setPreviewMode('responsive');
      });

      expect(result.current.previewMode).toBe('responsive');
    });
  });

  describe('Initialize', () => {
    it('should initialize the store with provided registry and config', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.initialize(
          mockRegistry,
          false, // persistLayerStoreConfig
          false, // allowPagesCreation
          false, // allowPagesDeletion
          false  // allowVariableEditing
        );
      });

      expect(result.current.registry).toEqual(mockRegistry);
      expect(result.current.persistLayerStoreConfig).toBe(false);
      expect(result.current.allowPagesCreation).toBe(false);
      expect(result.current.allowPagesDeletion).toBe(false);
      expect(result.current.allowVariableEditing).toBe(false);
    });

    it('should initialize with all permissions enabled', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.initialize(
          mockRegistry,
          true, // persistLayerStoreConfig
          true, // allowPagesCreation
          true, // allowPagesDeletion
          true  // allowVariableEditing
        );
      });

      expect(result.current.registry).toEqual(mockRegistry);
      expect(result.current.persistLayerStoreConfig).toBe(true);
      expect(result.current.allowPagesCreation).toBe(true);
      expect(result.current.allowPagesDeletion).toBe(true);
      expect(result.current.allowVariableEditing).toBe(true);
    });

    it('should initialize with empty registry', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.initialize(
          {}, // empty registry
          true,
          true,
          true,
          true
        );
      });

      expect(result.current.registry).toEqual({});
    });
  });

  describe('Component Definition Retrieval', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useEditorStore());
      act(() => {
        result.current.initialize(mockRegistry, true, true, true, true);
      });
    });

    it('should return component definition for existing component', () => {
      const { result } = renderHook(() => useEditorStore());

      const buttonDef = result.current.getComponentDefinition('Button');
      expect(buttonDef).toEqual(mockRegistry.Button);

      const inputDef = result.current.getComponentDefinition('Input');
      expect(inputDef).toEqual(mockRegistry.Input);

      const cardDef = result.current.getComponentDefinition('Card');
      expect(cardDef).toEqual(mockRegistry.Card);
    });

    it('should return undefined for non-existent component', () => {
      const { result } = renderHook(() => useEditorStore());

      const nonExistentDef = result.current.getComponentDefinition('NonExistentComponent');
      expect(nonExistentDef).toBeUndefined();
    });

    it('should warn and return undefined when registry is not initialized', () => {
      const { result } = renderHook(() => useEditorStore());
      
      // Reset registry to uninitialized state
      act(() => {
        useEditorStore.setState({ registry: undefined as any });
      });

      console.warn = jest.fn();

      const componentDef = result.current.getComponentDefinition('Button');

      expect(console.warn).toHaveBeenCalledWith('Registry accessed via editor store before initialization.');
      expect(componentDef).toBeUndefined();
    });

    it('should handle null/undefined registry gracefully', () => {
      const { result } = renderHook(() => useEditorStore());
      
      // Set registry to null
      act(() => {
        useEditorStore.setState({ registry: null as any });
      });

      console.warn = jest.fn();

      const componentDef = result.current.getComponentDefinition('Button');

      expect(console.warn).toHaveBeenCalledWith('Registry accessed via editor store before initialization.');
      expect(componentDef).toBeUndefined();
    });

    it('should handle empty string component type', () => {
      const { result } = renderHook(() => useEditorStore());

      const componentDef = result.current.getComponentDefinition('');
      expect(componentDef).toBeUndefined();
    });
  });

  describe('Persist Layer Store Config', () => {
    it('should set persistLayerStoreConfig to false', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPersistLayerStoreConfig(false);
      });

      expect(result.current.persistLayerStoreConfig).toBe(false);
    });

    it('should set persistLayerStoreConfig to true', () => {
      const { result } = renderHook(() => useEditorStore());

      // First set to false
      act(() => {
        result.current.setPersistLayerStoreConfig(false);
      });

      // Then set back to true
      act(() => {
        result.current.setPersistLayerStoreConfig(true);
      });

      expect(result.current.persistLayerStoreConfig).toBe(true);
    });
  });

  describe('Revision Counter', () => {
    it('should increment revision counter', () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.revisionCounter).toBe(0);

      act(() => {
        result.current.incrementRevision();
      });

      expect(result.current.revisionCounter).toBe(1);

      act(() => {
        result.current.incrementRevision();
      });

      expect(result.current.revisionCounter).toBe(2);
    });

    it('should increment revision counter multiple times', () => {
      const { result } = renderHook(() => useEditorStore());

      const incrementCount = 10;
      
      act(() => {
        for (let i = 0; i < incrementCount; i++) {
          result.current.incrementRevision();
        }
      });

      expect(result.current.revisionCounter).toBe(incrementCount);
    });
  });

  describe('Pages Creation Permission', () => {
    it('should set allowPagesCreation to false', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setAllowPagesCreation(false);
      });

      expect(result.current.allowPagesCreation).toBe(false);
    });

    it('should set allowPagesCreation to true', () => {
      const { result } = renderHook(() => useEditorStore());

      // First set to false
      act(() => {
        result.current.setAllowPagesCreation(false);
      });

      // Then set back to true
      act(() => {
        result.current.setAllowPagesCreation(true);
      });

      expect(result.current.allowPagesCreation).toBe(true);
    });
  });

  describe('Pages Deletion Permission', () => {
    it('should set allowPagesDeletion to false', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setAllowPagesDeletion(false);
      });

      expect(result.current.allowPagesDeletion).toBe(false);
    });

    it('should set allowPagesDeletion to true', () => {
      const { result } = renderHook(() => useEditorStore());

      // First set to false
      act(() => {
        result.current.setAllowPagesDeletion(false);
      });

      // Then set back to true
      act(() => {
        result.current.setAllowPagesDeletion(true);
      });

      expect(result.current.allowPagesDeletion).toBe(true);
    });
  });

  describe('Variable Editing Permission', () => {
    it('should set allowVariableEditing to false', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setAllowVariableEditing(false);
      });

      expect(result.current.allowVariableEditing).toBe(false);
    });

    it('should set allowVariableEditing to true', () => {
      const { result } = renderHook(() => useEditorStore());

      // First set to false
      act(() => {
        result.current.setAllowVariableEditing(false);
      });

      // Then set back to true
      act(() => {
        result.current.setAllowVariableEditing(true);
      });

      expect(result.current.allowVariableEditing).toBe(true);
    });
  });

  describe('State Persistence Across Multiple Operations', () => {
    it('should maintain state across multiple operations', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.initialize(mockRegistry, false, false, false, false);
        result.current.setPreviewMode('mobile');
        result.current.incrementRevision();
        result.current.incrementRevision();
        result.current.setAllowPagesCreation(true);
      });

      expect(result.current.registry).toEqual(mockRegistry);
      expect(result.current.previewMode).toBe('mobile');
      expect(result.current.revisionCounter).toBe(2);
      expect(result.current.persistLayerStoreConfig).toBe(false);
      expect(result.current.allowPagesCreation).toBe(true);
      expect(result.current.allowPagesDeletion).toBe(false);
      expect(result.current.allowVariableEditing).toBe(false);
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPreviewMode('mobile');
        result.current.setPreviewMode('tablet');
        result.current.setPreviewMode('desktop');
        result.current.setPreviewMode('responsive');
      });

      expect(result.current.previewMode).toBe('responsive');

      act(() => {
        result.current.setPersistLayerStoreConfig(false);
        result.current.setPersistLayerStoreConfig(true);
        result.current.setPersistLayerStoreConfig(false);
      });

      expect(result.current.persistLayerStoreConfig).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle getComponentDefinition with special characters', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.initialize(mockRegistry, true, true, true, true);
      });

      const specialComponentDef = result.current.getComponentDefinition('Component-With_Special.Characters!@#$%^&*()');
      expect(specialComponentDef).toBeUndefined();
    });

    it('should handle getComponentDefinition with very long component name', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.initialize(mockRegistry, true, true, true, true);
      });

      const longName = 'A'.repeat(1000);
      const longComponentDef = result.current.getComponentDefinition(longName);
      expect(longComponentDef).toBeUndefined();
    });

    it('should handle setting permissions with identical values', () => {
      const { result } = renderHook(() => useEditorStore());

      // Set to same value multiple times
      act(() => {
        result.current.setAllowPagesCreation(true);
        result.current.setAllowPagesCreation(true);
        result.current.setAllowPagesCreation(true);
      });

      expect(result.current.allowPagesCreation).toBe(true);
    });

    it('should handle registry with undefined values', () => {
      const { result } = renderHook(() => useEditorStore());

      const registryWithUndefined = {
        ...mockRegistry,
        UndefinedComponent: undefined as any,
      };

      act(() => {
        result.current.initialize(registryWithUndefined, true, true, true, true);
      });

      const undefinedComponentDef = result.current.getComponentDefinition('UndefinedComponent');
      expect(undefinedComponentDef).toBeUndefined();
    });
  });

  describe('Store Integration', () => {
    it('should work with multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useEditorStore());
      const { result: result2 } = renderHook(() => useEditorStore());

      act(() => {
        result1.current.setPreviewMode('mobile');
      });

      // Both hooks should reflect the same state
      expect(result1.current.previewMode).toBe('mobile');
      expect(result2.current.previewMode).toBe('mobile');

      act(() => {
        result2.current.incrementRevision();
      });

      // Both hooks should reflect the incremented revision
      expect(result1.current.revisionCounter).toBe(1);
      expect(result2.current.revisionCounter).toBe(1);
    });

    it('should maintain state consistency across different operations', () => {
      const { result } = renderHook(() => useEditorStore());

      // Perform a series of operations
      act(() => {
        result.current.initialize(mockRegistry, true, true, true, true);
        result.current.setPreviewMode('tablet');
        result.current.setPersistLayerStoreConfig(false);
        result.current.incrementRevision();
        result.current.setAllowPagesCreation(false);
        result.current.setAllowPagesDeletion(false);
        result.current.setAllowVariableEditing(false);
      });

      // Verify all state is as expected
      expect(result.current.registry).toEqual(mockRegistry);
      expect(result.current.previewMode).toBe('tablet');
      expect(result.current.persistLayerStoreConfig).toBe(false);
      expect(result.current.revisionCounter).toBe(1);
      expect(result.current.allowPagesCreation).toBe(false);
      expect(result.current.allowPagesDeletion).toBe(false);
      expect(result.current.allowVariableEditing).toBe(false);

      // Verify component definition lookup still works
      const buttonDef = result.current.getComponentDefinition('Button');
      expect(buttonDef).toEqual(mockRegistry.Button);
    });
  });
});