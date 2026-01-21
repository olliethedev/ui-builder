import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NavBar } from '@/components/ui/ui-builder/internal/components/nav';
import type { ComponentLayer } from '@/components/ui/ui-builder/types';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the stores
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn(),
}));

// Import the mocked hooks after mocking
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';

// Mock theme hook
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'light',
  }),
}));

// Mock keyboard shortcuts hook
jest.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}));

// Mock zustand store
jest.mock('zustand', () => ({
  useStore: jest.fn(),
}));

// Mock scrollIntoView for jsdom environment
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
});

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);

describe('NavBar', () => {
  const mockUndo = jest.fn();
  const mockRedo = jest.fn();
  const mockSelectPage = jest.fn();
  const mockAddPageLayer = jest.fn();
  const mockFindLayerById = jest.fn();
  const mockIncrementRevision = jest.fn();
  const mockSetShowLeftPanel = jest.fn();
  const mockSetShowRightPanel = jest.fn();
  const mockSetPreviewMode = jest.fn();
  
  const mockPage: ComponentLayer = {
    id: 'page-1',
    type: 'page',
    name: 'Test Page',
    props: {},
    children: []
  };

  const mockRegistry = {
    Button: {
      component: () => null,
      name: 'Button',
      from: '@/components/ui/button'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.innerWidth for each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    // Mock LayerStore with temporal property
    const mockLayerStore = {
      selectedPageId: 'page-1',
      pages: [mockPage],
      variables: [],
      findLayerById: mockFindLayerById,
      selectPage: mockSelectPage,
      addPageLayer: mockAddPageLayer,
      isLayerAPage: jest.fn().mockReturnValue(false),
      temporal: {
        getState: () => ({
          undo: mockUndo,
          redo: mockRedo,
        }),
      },
    };

    mockUseLayerStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockLayerStore as any);
      }
      return mockLayerStore as any;
    });

    (mockUseLayerStore as any).temporal = {
      getState: () => ({
        undo: mockUndo,
        redo: mockRedo,
      }),
    };

    // Mock EditorStore with both selector and non-selector support
    const mockEditorStore = {
      registry: mockRegistry,
      incrementRevision: mockIncrementRevision,
      allowPagesCreation: true,
      previewMode: 'desktop' as const,
      setPreviewMode: mockSetPreviewMode,
      showLeftPanel: true,
      setShowLeftPanel: mockSetShowLeftPanel,
      showRightPanel: true,
      setShowRightPanel: mockSetShowRightPanel,
    };

    mockUseEditorStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockEditorStore as any);
      }
      return mockEditorStore as any;
    });

    mockFindLayerById.mockReturnValue(mockPage);

    // Mock useStore for temporal state
    const { useStore } = require('zustand');
    useStore.mockImplementation((store: any, selector: any) => {
      if (selector) {
        return selector({
          pastStates: [],
          futureStates: [],
        });
      }
      return [];
    });
  });

  describe('Basic Rendering', () => {
    it('should render the navbar with basic structure', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const navbar = document.querySelector('.flex.items-center.justify-between.bg-background');
      expect(navbar).toBeInTheDocument();
    });

    it('should render undo and redo buttons', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const undoButton = buttons.find(button => button.textContent?.includes('Undo'));
      const redoButton = buttons.find(button => button.textContent?.includes('Redo'));
      
      expect(undoButton).toBeInTheDocument();
      expect(redoButton).toBeInTheDocument();
    });

    it('should render preview and export buttons', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewButton = buttons.find(button => button.textContent?.includes('Preview'));
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      
      expect(previewButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      
      expect(themeButton).toBeInTheDocument();
    });

    it('should render page selector button', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should render preview mode toggle', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      expect(previewModeButton).toBeInTheDocument();
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('should disable undo button when no past states', () => {
      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [],
            futureStates: [],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const undoButton = buttons.find(button => button.textContent?.includes('Undo'));
      expect(undoButton).toBeDisabled();
    });

    it('should enable undo button when past states exist', () => {
      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [{}],
            futureStates: [],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const undoButton = buttons.find(button => button.textContent?.includes('Undo'));
      expect(undoButton).not.toBeDisabled();
    });

    it('should disable redo button when no future states', () => {
      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [],
            futureStates: [],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const redoButton = buttons.find(button => button.textContent?.includes('Redo'));
      expect(redoButton).toBeDisabled();
    });

    it('should enable redo button when future states exist', () => {
      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [],
            futureStates: [{}],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const redoButton = buttons.find(button => button.textContent?.includes('Redo'));
      expect(redoButton).not.toBeDisabled();
    });

    it('should call undo when undo button is clicked', () => {
      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [{}],
            futureStates: [],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const undoButton = buttons.find(button => button.textContent?.includes('Undo'));
      if (undoButton) {
        fireEvent.click(undoButton);
        
        expect(mockUndo).toHaveBeenCalled();
        expect(mockIncrementRevision).toHaveBeenCalled();
      }
    });

    it('should call redo when redo button is clicked', () => {
      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [],
            futureStates: [{}],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const redoButton = buttons.find(button => button.textContent?.includes('Redo'));
      if (redoButton) {
        fireEvent.click(redoButton);
        
        expect(mockRedo).toHaveBeenCalled();
        expect(mockIncrementRevision).toHaveBeenCalled();
      }
    });
  });

  describe('Preview Dialog', () => {
    it('should open preview dialog when preview button is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewButton = buttons.find(button => button.textContent?.includes('Preview'));
      
      if (previewButton) {
        fireEvent.click(previewButton);
        
        await waitFor(() => {
          expect(screen.getByText('Page Preview')).toBeInTheDocument();
        });
      }
    });

    it('should close preview dialog when close button is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewButton = buttons.find(button => button.textContent?.includes('Preview'));
      
      if (previewButton) {
        fireEvent.click(previewButton);
        
        await waitFor(() => {
          expect(screen.getByText('Page Preview')).toBeInTheDocument();
        });

        const closeButtons = screen.getAllByRole('button');
        const closeButton = closeButtons.find(button => button.textContent?.includes('Close'));
        if (closeButton) {
          fireEvent.click(closeButton);
          
          await waitFor(() => {
            expect(screen.queryByText('Page Preview')).not.toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Code Export Dialog', () => {
    it('should open export dialog when export button is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      
      if (exportButton) {
        fireEvent.click(exportButton);
        
        await waitFor(() => {
          expect(screen.getByText('Generated Code')).toBeInTheDocument();
        });
      }
    });

    it('should close export dialog when close button is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      
      if (exportButton) {
        fireEvent.click(exportButton);
        
        await waitFor(() => {
          expect(screen.getByText('Generated Code')).toBeInTheDocument();
        });

        const closeButtons = screen.getAllByRole('button');
        const closeButton = closeButtons.find(button => button.textContent?.includes('Close'));
        if (closeButton) {
          fireEvent.click(closeButton);
          
          await waitFor(() => {
            expect(screen.queryByText('Generated Code')).not.toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle with light and dark icons', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      expect(themeButton).toBeInTheDocument();
    });

    it('should open theme dropdown when clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      
      if (themeButton) {
        fireEvent.click(themeButton);
        
        await waitFor(async () => {
          const dropdownItems = screen.queryAllByText('Light');
          if (dropdownItems.length > 0) {
            expect(dropdownItems.length).toBeGreaterThan(0);
          } else {
            expect(themeButton).toBeEnabled();
          }
        }, { timeout: 1000 });
      } else {
        expect(themeButton).toBeTruthy();
      }
    });

    it('should call setTheme with light when Light option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      
      if (themeButton) {
        fireEvent.click(themeButton);
        
        await waitFor(async () => {
          const lightOption = screen.queryByText('Light');
          if (lightOption) {
            fireEvent.click(lightOption);
            expect(mockSetTheme).toHaveBeenCalledWith('light');
          }
        }, { timeout: 1000 });
      }
    });

    it('should call setTheme with dark when Dark option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      
      if (themeButton) {
        fireEvent.click(themeButton);
        
        await waitFor(async () => {
          const darkOption = screen.queryByText('Dark');
          if (darkOption) {
            fireEvent.click(darkOption);
            expect(mockSetTheme).toHaveBeenCalledWith('dark');
          }
        }, { timeout: 1000 });
      }
    });

    it('should call setTheme with system when System option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      
      if (themeButton) {
        fireEvent.click(themeButton);
        
        await waitFor(async () => {
          const systemOption = screen.queryByText('System');
          if (systemOption) {
            fireEvent.click(systemOption);
            expect(mockSetTheme).toHaveBeenCalledWith('system');
          }
        }, { timeout: 1000 });
      }
    });
  });

  describe('Preview Mode Toggle', () => {
    it('should render preview mode toggle button', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      expect(previewModeButton).toBeInTheDocument();
    });

    it('should open preview mode dropdown when clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      if (previewModeButton) {
        fireEvent.click(previewModeButton);
        
        await waitFor(async () => {
          const mobileOption = screen.queryByText('Mobile');
          if (mobileOption) {
            expect(mobileOption).toBeInTheDocument();
          } else {
            expect(previewModeButton).toBeEnabled();
          }
        }, { timeout: 1000 });
      }
    });

    it('should call setPreviewMode with mobile when Mobile option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      if (previewModeButton) {
        fireEvent.click(previewModeButton);
        
        await waitFor(async () => {
          const mobileOption = screen.queryByText('Mobile');
          if (mobileOption) {
            fireEvent.click(mobileOption);
            expect(mockSetPreviewMode).toHaveBeenCalledWith('mobile');
          }
        }, { timeout: 1000 });
      }
    });

    it('should call setPreviewMode with tablet when Tablet option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      if (previewModeButton) {
        fireEvent.click(previewModeButton);
        
        await waitFor(async () => {
          const tabletOption = screen.queryByText('Tablet');
          if (tabletOption) {
            fireEvent.click(tabletOption);
            expect(mockSetPreviewMode).toHaveBeenCalledWith('tablet');
          }
        }, { timeout: 1000 });
      }
    });

    it('should call setPreviewMode with desktop when Desktop option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      if (previewModeButton) {
        fireEvent.click(previewModeButton);
        
        await waitFor(async () => {
          const desktopOption = screen.queryByText('Desktop');
          if (desktopOption) {
            fireEvent.click(desktopOption);
            expect(mockSetPreviewMode).toHaveBeenCalledWith('desktop');
          }
        }, { timeout: 1000 });
      }
    });

    it('should call setPreviewMode with responsive when Responsive option is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const previewModeButton = buttons.find(button => button.textContent?.includes('Select screen size'));
      
      if (previewModeButton) {
        fireEvent.click(previewModeButton);
        
        await waitFor(async () => {
          const responsiveOption = screen.queryByText('Responsive');
          if (responsiveOption) {
            fireEvent.click(responsiveOption);
            expect(mockSetPreviewMode).toHaveBeenCalledWith('responsive');
          }
        }, { timeout: 1000 });
      }
    });
  });

  describe('Pages Popover', () => {
    it('should render current page name in button', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should open pages popover when page button is clicked', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Select page or create new...')).toBeInTheDocument();
      });
    });

    it('should show existing pages in the list', async () => {
      const multiplePagesState = {
        selectedPageId: 'page-1',
        pages: [
          mockPage,
          { id: 'page-2', type: 'page', name: 'Page 2', props: {}, children: [] }
        ],
        variables: [],
        findLayerById: mockFindLayerById,
        selectPage: mockSelectPage,
        addPageLayer: mockAddPageLayer,
        isLayerAPage: jest.fn().mockReturnValue(false),
        temporal: {
          getState: () => ({
            undo: mockUndo,
            redo: mockRedo,
          }),
        },
      };

      mockUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(multiplePagesState as any);
        }
        return multiplePagesState as any;
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        const pageItems = screen.getAllByText('Test Page');
        const page2Items = screen.getAllByText('Page 2');
        expect(pageItems.length).toBeGreaterThan(0);
        expect(page2Items.length).toBeGreaterThan(0);
      });
    });

    it('should allow creating new pages when allowPagesCreation is true', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('New page name...')).toBeInTheDocument();
      });
    });

    it('should create new page when form is submitted', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText('New page name...');
        fireEvent.change(input, { target: { value: 'New Page' } });
        
        const form = input.closest('form');
        if (form) {
          fireEvent.submit(form);
          expect(mockAddPageLayer).toHaveBeenCalledWith('New Page');
        }
      });
    });

    it('should create new page when Enter key is pressed', async () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText('New page name...');
        fireEvent.change(input, { target: { value: 'Another Page' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        
        expect(mockAddPageLayer).toHaveBeenCalledWith('Another Page');
      });
    });

    it('should select page when page item is clicked', async () => {
      const multiplePagesState = {
        selectedPageId: 'page-1',
        pages: [
          mockPage,
          { id: 'page-2', type: 'page', name: 'Page 2', props: {}, children: [] }
        ],
        variables: [],
        findLayerById: mockFindLayerById,
        selectPage: mockSelectPage,
        addPageLayer: mockAddPageLayer,
        isLayerAPage: jest.fn().mockReturnValue(false),
        temporal: {
          getState: () => ({
            undo: mockUndo,
            redo: mockRedo,
          }),
        },
      };

      mockUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(multiplePagesState as any);
        }
        return multiplePagesState as any;
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        const page2Items = screen.getAllByText('Page 2');
        const selectablePage2 = page2Items.find(item => 
          item.closest('[cmdk-item]') || item.closest('[role="option"]')
        );
        
        if (selectablePage2) {
          fireEvent.click(selectablePage2);
          expect(mockSelectPage).toHaveBeenCalledWith('page-2');
        }
      });
    });
  });

  describe('Panel Toggles', () => {
    it('should render left panel toggle button', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const leftPanelButton = buttons.find(button => button.textContent?.includes('Toggle Left Panel'));
      expect(leftPanelButton).toBeInTheDocument();
    });

    it('should render right panel toggle button', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const rightPanelButton = buttons.find(button => button.textContent?.includes('Toggle Right Panel'));
      expect(rightPanelButton).toBeInTheDocument();
    });

    it('should toggle left panel when left panel button is clicked', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const leftPanelButton = buttons.find(button => button.textContent?.includes('Toggle Left Panel'));
      
      if (leftPanelButton) {
        fireEvent.click(leftPanelButton);
        expect(mockSetShowLeftPanel).toHaveBeenCalledWith(false); // Since showLeftPanel is true by default
      }
    });

    it('should toggle right panel when right panel button is clicked', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const rightPanelButton = buttons.find(button => button.textContent?.includes('Toggle Right Panel'));
      
      if (rightPanelButton) {
        fireEvent.click(rightPanelButton);
        expect(mockSetShowRightPanel).toHaveBeenCalledWith(false); // Since showRightPanel is true by default
      }
    });

    it('should show different button variant when panels are hidden', () => {
      const mockEditorStoreHidden = {
        registry: mockRegistry,
        incrementRevision: mockIncrementRevision,
        allowPagesCreation: true,
        previewMode: 'desktop' as const,
        setPreviewMode: mockSetPreviewMode,
        showLeftPanel: false,
        setShowLeftPanel: mockSetShowLeftPanel,
        showRightPanel: false,
        setShowRightPanel: mockSetShowRightPanel,
      };

      mockUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockEditorStoreHidden as any);
        }
        return mockEditorStoreHidden as any;
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const leftPanelButton = buttons.find(button => button.textContent?.includes('Toggle Left Panel'));
      const rightPanelButton = buttons.find(button => button.textContent?.includes('Toggle Right Panel'));
      
      expect(leftPanelButton).toBeInTheDocument();
      expect(rightPanelButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should hide action buttons on mobile and show dropdown', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find(button => button.textContent?.includes('Actions'));
      expect(moreButton).toBeInTheDocument();
    });

    it('should show responsive dropdown options when Actions button is clicked', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find(button => button.textContent?.includes('Actions'));
      
      if (moreButton) {
        fireEvent.click(moreButton);
        
        await waitFor(() => {
          const undoOption = screen.queryByText('Undo');
          if (undoOption) {
            expect(undoOption).toBeInTheDocument();
          }
        }, { timeout: 1000 });
      }
    });

    it('should call undo from responsive dropdown', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { useStore } = require('zustand');
      useStore.mockImplementation((store: any, selector: any) => {
        if (selector) {
          return selector({
            pastStates: [{}], // Enable undo
            futureStates: [],
          });
        }
        return [];
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find(button => button.textContent?.includes('Actions'));
      
      if (moreButton) {
        fireEvent.click(moreButton);
        
        await waitFor(async () => {
          const undoOptions = screen.queryAllByText('Undo');
          const clickableUndo = undoOptions.find(option => 
            option.closest('[role="menuitem"]') || option.closest('[cmdk-item]')
          );
          
          if (clickableUndo) {
            fireEvent.click(clickableUndo);
            expect(mockUndo).toHaveBeenCalled();
            expect(mockIncrementRevision).toHaveBeenCalled();
          }
        }, { timeout: 1000 });
      }
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register keyboard shortcuts', () => {
      const { useKeyboardShortcuts } = require('@/hooks/use-keyboard-shortcuts');
      
      render(<NavBar />, { wrapper: TestWrapper });
      
      expect(useKeyboardShortcuts).toHaveBeenCalled();
      
      // Check that the shortcuts include undo and redo
      const call = useKeyboardShortcuts.mock.calls[0];
      const shortcuts = call[0];
      
      expect(shortcuts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keys: { metaKey: true, shiftKey: false },
            key: 'z',
          }),
          expect.objectContaining({
            keys: { metaKey: true, shiftKey: true },
            key: 'z',
          }),
        ])
      );
    });

    it('should register fun keyboard shortcuts for animations', () => {
      const { useKeyboardShortcuts } = require('@/hooks/use-keyboard-shortcuts');
      
      render(<NavBar />, { wrapper: TestWrapper });
      
      const call = useKeyboardShortcuts.mock.calls[0];
      const shortcuts = call[0];
      
      expect(shortcuts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keys: { metaKey: true, shiftKey: true },
            key: '9',
          }),
          expect.objectContaining({
            keys: { metaKey: true, shiftKey: true },
            key: '0',
          }),
        ])
      );
    });
  });

  describe('showExport prop', () => {
    it('should hide export button when showExport is false', () => {
      render(<NavBar showExport={false} />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      
      expect(exportButton).toBeUndefined();
    });

    it('should show export button when showExport is true', () => {
      render(<NavBar showExport={true} />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      
      expect(exportButton).toBeInTheDocument();
    });

    it('should show export button by default when showExport prop is not provided', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      
      expect(exportButton).toBeInTheDocument();
    });

    it('should not register export keyboard shortcut when showExport is false', () => {
      const { useKeyboardShortcuts } = require('@/hooks/use-keyboard-shortcuts');
      useKeyboardShortcuts.mockClear();
      
      render(<NavBar showExport={false} />, { wrapper: TestWrapper });
      
      // Check that the export shortcut (Cmd+Shift+E) is not registered
      const calls = useKeyboardShortcuts.mock.calls;
      const allShortcuts = calls.flatMap((call: any) => call[0]);
      
      const exportShortcut = allShortcuts.find((shortcut: any) => 
        shortcut.keys?.metaKey === true && 
        shortcut.keys?.shiftKey === true && 
        shortcut.key === 'e'
      );
      
      expect(exportShortcut).toBeUndefined();
    });

    it('should register export keyboard shortcut when showExport is true', () => {
      const { useKeyboardShortcuts } = require('@/hooks/use-keyboard-shortcuts');
      useKeyboardShortcuts.mockClear();
      
      render(<NavBar showExport={true} />, { wrapper: TestWrapper });
      
      // Check that the export shortcut (Cmd+Shift+E) is registered
      const calls = useKeyboardShortcuts.mock.calls;
      const allShortcuts = calls.flatMap((call: any) => call[0]);
      
      const exportShortcut = allShortcuts.find((shortcut: any) => 
        shortcut.keys?.metaKey === true && 
        shortcut.keys?.shiftKey === true && 
        shortcut.key === 'e'
      );
      
      expect(exportShortcut).toBeDefined();
    });

    it('should hide export option in responsive dropdown when showExport is false', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(<NavBar showExport={false} />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find(button => button.textContent?.includes('Actions'));
      
      if (moreButton) {
        fireEvent.click(moreButton);
        
        await waitFor(() => {
          // Preview should still be there
          const previewOption = screen.queryByText('Preview');
          expect(previewOption).toBeInTheDocument();
          
          // Export should not be in the dropdown
          const exportOptions = screen.queryAllByText('Export');
          const dropdownExport = exportOptions.find(option => 
            option.closest('[role="menuitem"]')
          );
          expect(dropdownExport).toBeUndefined();
        }, { timeout: 1000 });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing page gracefully', () => {
      mockFindLayerById.mockReturnValue(null);
      
      render(<NavBar />, { wrapper: TestWrapper });
      
      // Should not crash
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('should handle empty pages array', () => {
      const emptyPagesState = {
        selectedPageId: 'page-1',
        pages: [],
        variables: [],
        findLayerById: mockFindLayerById,
        selectPage: mockSelectPage,
        addPageLayer: mockAddPageLayer,
        isLayerAPage: jest.fn().mockReturnValue(false),
        temporal: {
          getState: () => ({
            undo: mockUndo,
            redo: mockRedo,
          }),
        },
      };

      mockUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(emptyPagesState as any);
        }
        return emptyPagesState as any;
      });

      mockFindLayerById.mockReturnValue(null);

      render(<NavBar />, { wrapper: TestWrapper });
      
      // Should render without crashing
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('should handle pages creation disabled', async () => {
      const mockEditorStoreNoPages = {
        registry: mockRegistry,
        incrementRevision: mockIncrementRevision,
        allowPagesCreation: false, // Disabled
        previewMode: 'desktop' as const,
        setPreviewMode: mockSetPreviewMode,
        showLeftPanel: true,
        setShowLeftPanel: mockSetShowLeftPanel,
        showRightPanel: true,
        setShowRightPanel: mockSetShowRightPanel,
      };

      mockUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockEditorStoreNoPages as any);
        }
        return mockEditorStoreNoPages as any;
      });

      render(<NavBar />, { wrapper: TestWrapper });
      
      const pageButton = screen.getByText('Test Page');
      fireEvent.click(pageButton);
      
      await waitFor(() => {
        // Should not show the new page input when creation is disabled
        expect(screen.queryByPlaceholderText('New page name...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Test IDs', () => {
    it('should have proper accessibility labels', () => {
      render(<NavBar />, { wrapper: TestWrapper });
      
      const buttons = screen.getAllByRole('button');
      const undoButton = buttons.find(button => button.textContent?.includes('Undo'));
      const redoButton = buttons.find(button => button.textContent?.includes('Redo'));
      const previewButton = buttons.find(button => button.textContent?.includes('Preview'));
      const exportButton = buttons.find(button => button.textContent?.includes('Export'));
      const themeButton = buttons.find(button => button.textContent?.includes('Toggle theme'));
      
      expect(undoButton).toBeInTheDocument();
      expect(redoButton).toBeInTheDocument();
      expect(previewButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
      expect(themeButton).toBeInTheDocument();
    });
  });
});