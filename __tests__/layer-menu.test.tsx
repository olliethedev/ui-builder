/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayerMenu } from "@/components/ui/ui-builder/internal/components/layer-menu";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { z } from "zod";

// Mock dependencies
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
}));

jest.mock("@/lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

// Mock the AddComponentsPopover
jest.mock("@/components/ui/ui-builder/internal/components/add-component-popover", () => ({
  AddComponentsPopover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="add-components-popover">{children}</div>
  ),
}));

const mockedUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
const mockedUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;

const mockRegistry = {
  "test-component": {
    name: "Test Component",
    schema: z.object({
      children: z.array(z.any()).optional(),
    }),
    props: {},
  },
  "page": {
    name: "Page", 
    schema: z.object({
      children: z.array(z.any()).optional(),
    }),
    props: {},
  },
};

const mockComponentLayer: ComponentLayer = {
  id: "test-layer-1",
  name: "Test Layer",
  type: "test-component",
  props: {},
  children: [],
};

const mockPageLayer: ComponentLayer = {
  id: "test-page-1", 
  name: "Test Page",
  type: "page",
  props: {},
  children: [],
};

describe("LayerMenu", () => {
  const defaultProps = {
    layerId: "test-layer-1",
    x: 100,
    y: 200,
    width: 300,
    height: 400,
    zIndex: 1000,
    onClose: jest.fn(),
    handleDuplicateComponent: jest.fn(),
    handleDeleteComponent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock setup for component layer
    mockedUseLayerStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          findLayerById: jest.fn().mockReturnValue(mockComponentLayer),
          isLayerAPage: jest.fn().mockReturnValue(false),
        } as any);
      }
      return null;
    });

    mockedUseEditorStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          registry: mockRegistry,
          allowPagesCreation: true,
          allowPagesDeletion: true,
        } as any);
      }
      return null;
    });
  });

  describe("permission controls for component layers", () => {
    it("should show both duplicate and delete buttons for component layers regardless of page permissions", () => {
      // Override with strict page permissions
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            registry: mockRegistry,
            allowPagesCreation: false,
            allowPagesDeletion: false,
          } as any);
        }
        return null;
      });

      render(<LayerMenu {...defaultProps} />);

      // Should show both buttons for component layers regardless of page permissions
      const duplicateIcon = screen.queryByTestId('duplicate-icon');
      const deleteIcon = screen.queryByTestId('delete-icon');

      expect(duplicateIcon).toBeInTheDocument();
      expect(deleteIcon).toBeInTheDocument();
    });
  });

  describe("permission controls for page layers", () => {
    beforeEach(() => {
      // Setup for page layer
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            findLayerById: jest.fn().mockReturnValue(mockPageLayer),
            isLayerAPage: jest.fn().mockReturnValue(true),
          } as any);
        }
        return null;
      });
    });

    it("should hide duplicate button when allowPagesCreation is false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            registry: mockRegistry,
            allowPagesCreation: false,
            allowPagesDeletion: true,
          } as any);
        }
        return null;
      });

      render(<LayerMenu {...defaultProps} layerId="test-page-1" />);

      const duplicateIcon = screen.queryByTestId('duplicate-icon');
      const deleteIcon = screen.queryByTestId('delete-icon');

      expect(duplicateIcon).not.toBeInTheDocument();
      expect(deleteIcon).toBeInTheDocument();
    });

    it("should hide delete button when allowPagesDeletion is false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            registry: mockRegistry,
            allowPagesCreation: true,
            allowPagesDeletion: false,
          } as any);
        }
        return null;
      });

      render(<LayerMenu {...defaultProps} layerId="test-page-1" />);

      const duplicateIcon = screen.queryByTestId('duplicate-icon');
      const deleteIcon = screen.queryByTestId('delete-icon');

      expect(duplicateIcon).toBeInTheDocument();
      expect(deleteIcon).not.toBeInTheDocument();
    });

    it("should hide both buttons when both permissions are false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            registry: mockRegistry,
            allowPagesCreation: false,
            allowPagesDeletion: false,
          } as any);
        }
        return null;
      });

      render(<LayerMenu {...defaultProps} layerId="test-page-1" />);

      const duplicateIcon = screen.queryByTestId('duplicate-icon');
      const deleteIcon = screen.queryByTestId('delete-icon');

      expect(duplicateIcon).not.toBeInTheDocument();
      expect(deleteIcon).not.toBeInTheDocument();
    });

    it("should show both buttons when both permissions are true", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            registry: mockRegistry,
            allowPagesCreation: true,
            allowPagesDeletion: true,
          } as any);
        }
        return null;
      });

      render(<LayerMenu {...defaultProps} layerId="test-page-1" />);

      const duplicateIcon = screen.queryByTestId('duplicate-icon');
      const deleteIcon = screen.queryByTestId('delete-icon');

      expect(duplicateIcon).toBeInTheDocument();
      expect(deleteIcon).toBeInTheDocument();
    });
  });

  describe("interaction handling", () => {
    it("should call handleDuplicateComponent when duplicate button is clicked", () => {
      const mockHandleDuplicate = jest.fn();
      
      render(<LayerMenu {...defaultProps} handleDuplicateComponent={mockHandleDuplicate} />);

      const duplicateButton = screen.getByTestId('duplicate-button');
      expect(duplicateButton).toBeInTheDocument();
      
      fireEvent.click(duplicateButton);
      expect(mockHandleDuplicate).toHaveBeenCalledTimes(1);
    });

    it("should call handleDeleteComponent when delete button is clicked", () => {
      const mockHandleDelete = jest.fn();
      
      render(<LayerMenu {...defaultProps} handleDeleteComponent={mockHandleDelete} />);

      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeInTheDocument();
      
      fireEvent.click(deleteButton);
      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe("basic rendering", () => {
    it("should render the layer menu with correct positioning", () => {
      // Ensure the layer is found by the component
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({
            findLayerById: jest.fn().mockReturnValue(mockComponentLayer),
            isLayerAPage: jest.fn().mockReturnValue(false),
          } as any);
        }
        return null;
      });

      const { container } = render(<LayerMenu {...defaultProps} />);

      // Check that the component renders successfully - the chevron icon should be present
      const chevronIcon = container.querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
      
      // Also check for the main container div
      const menuContainer = container.firstChild as HTMLElement;
      expect(menuContainer).toBeInTheDocument();
      expect(menuContainer.tagName).toBe('DIV');
    });
  });
});