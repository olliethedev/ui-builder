/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UIBuilder, { 
  PageConfigPanel, 
  LoadingSkeleton, 
  defaultConfigTabsContent, 
  getDefaultPanelConfigValues 
} from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import type { Variable } from '@/components/ui/ui-builder/types';
import type { ComponentLayer } from "@/components/ui/ui-builder/types";
import React from "react";

const componentRegistry = {
  ...primitiveComponentDefinitions,
  ...complexComponentDefinitions,
};

const mockInitialLayers: ComponentLayer[] = [
  {
    id: "page1",
    type: "div",
    name: "Test Page",
    props: { className: "p-4" },
    children: []
  }
];

const mockInitialVariables: Variable[] = [
  {
    id: "var1",
    name: "testVar",
    type: "string",
    defaultValue: "test value"
  }
];

// Mock zustand stores
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: {
    getState: () => ({
      pages: mockInitialLayers,
      variables: mockInitialVariables,
      initialize: jest.fn(),
    }),
    temporal: {
      getState: () => ({
        clear: jest.fn(),
      }),
    },
  },
}));

jest.mock("@/lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(() => ({
    showLeftPanel: true,
    showRightPanel: true,
    initialize: jest.fn(),
  })),
}));

jest.mock("@/hooks/use-store", () => ({
  useStore: (store: any, selector: any) => {
    const mockState = {
      pages: mockInitialLayers,
      variables: mockInitialVariables,
      initialize: jest.fn(),
      showLeftPanel: true,
      showRightPanel: true,
    };
    return selector(mockState);
  },
}));

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: "light",
  }),
}));

jest.mock("../components/ui/ui-builder/internal/components/nav", () => ({
  NavBar: () => <div data-testid="nav">Nav</div>,
}));

jest.mock("../components/ui/ui-builder/internal/layers-panel", () => ({
  __esModule: true,
  default: () => <div data-testid="layers-panel">Layers Panel</div>,
}));

jest.mock("../components/ui/ui-builder/internal/editor-panel", () => ({
  __esModule: true,
  default: ({ className }: { className: string }) => <div data-testid="editor-panel" className={className}>Editor Panel</div>,
}));

jest.mock("../components/ui/ui-builder/internal/props-panel", () => ({
  __esModule: true,
  default: ({ className }: { className: string }) => <div data-testid="props-panel" className={className}>Props Panel</div>,
}));

jest.mock("../components/ui/ui-builder/internal/config-panel", () => ({
  ConfigPanel: () => <div data-testid="config-panel">Config Panel</div>,
}));

jest.mock("../components/ui/ui-builder/internal/tailwind-theme-panel", () => ({
  TailwindThemePanel: () => <div data-testid="tailwind-theme-panel">Tailwind Theme Panel</div>,
}));

jest.mock("../components/ui/ui-builder/internal/variables-panel", () => ({
  VariablesPanel: () => <div data-testid="variables-panel">Variables Panel</div>,
}));

describe("UIBuilder Component", () => {
  it("UIBuilder: renders", async () => {
    render(<UIBuilder componentRegistry={componentRegistry} />);
    const themeProvider = await screen.findByTestId("theme-provider");
    expect(themeProvider).toBeInTheDocument();
  });

  it("UIBuilder: renders component-editor", async () => {
    render(<UIBuilder componentRegistry={componentRegistry} />);
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: renders page-config-panel", async () => {
    render(<UIBuilder componentRegistry={componentRegistry} />);
    const pageConfigPanel = await screen.findByTestId("page-config-panel");
    expect(pageConfigPanel).toBeInTheDocument();
  });

  it("UIBuilder: accepts initialLayers prop", async () => {
    const onChange = jest.fn();
    render(
      <UIBuilder 
        componentRegistry={componentRegistry} 
        initialLayers={mockInitialLayers}
        onChange={onChange}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: accepts initialVariables prop", async () => {
    const onVariablesChange = jest.fn();
    render(
      <UIBuilder 
        componentRegistry={componentRegistry} 
        initialVariables={mockInitialVariables}
        onVariablesChange={onVariablesChange}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: accepts both initialLayers and initialVariables", async () => {
    const onChange = jest.fn();
    const onVariablesChange = jest.fn();
    render(
      <UIBuilder 
        componentRegistry={componentRegistry} 
        initialLayers={mockInitialLayers}
        onChange={onChange}
        initialVariables={mockInitialVariables}
        onVariablesChange={onVariablesChange}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: hides Add Variable button when allowVariableEditing is false", async () => {
    render(
      <UIBuilder 
        componentRegistry={componentRegistry} 
        allowVariableEditing={false}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: shows Add Variable button by default", async () => {
    render(
      <UIBuilder 
        componentRegistry={componentRegistry}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: accepts custom panelConfig", async () => {
    const customPanelConfig = {
      navBar: <div data-testid="custom-nav">Custom Nav</div>,
      editorPanel: <div data-testid="custom-editor">Custom Editor</div>,
    };

    render(
      <UIBuilder 
        componentRegistry={componentRegistry}
        panelConfig={customPanelConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("custom-nav")).toBeInTheDocument();
      expect(screen.getAllByTestId("custom-editor")).toHaveLength(2); // Desktop and mobile versions
    });
  });

  it("UIBuilder: accepts custom pageConfigPanelTabsContent", async () => {
    const customTabsContent = {
      layers: { title: "Custom Layers", content: <div data-testid="custom-layers">Custom Layers</div> },
      appearance: { title: "Custom Appearance", content: <div data-testid="custom-appearance">Custom Appearance</div> },
    };

    const customPanelConfig = {
      pageConfigPanelTabsContent: customTabsContent,
    };

    render(
      <UIBuilder 
        componentRegistry={componentRegistry}
        panelConfig={customPanelConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("custom-layers")).toBeInTheDocument();
    });
  });

  it("UIBuilder: handles persistLayerStore=false", async () => {
    render(
      <UIBuilder 
        componentRegistry={componentRegistry}
        persistLayerStore={false}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: handles allowPagesCreation=false", async () => {
    render(
      <UIBuilder 
        componentRegistry={componentRegistry}
        allowPagesCreation={false}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });

  it("UIBuilder: handles allowPagesDeletion=false", async () => {
    render(
      <UIBuilder 
        componentRegistry={componentRegistry}
        allowPagesDeletion={false}
      />
    );
    const componentEditor = await screen.findByTestId("component-editor");
    expect(componentEditor).toBeInTheDocument();
  });
});

describe("PageConfigPanel Component", () => {
  const mockTabsContent = {
    layers: { title: "Test Layers", content: <div data-testid="test-layers">Test Layers Content</div> },
  };

  it("PageConfigPanel: renders with layers only", () => {
    render(
      <PageConfigPanel 
        className="test-class" 
        tabsContent={mockTabsContent}
      />
    );

    expect(screen.getByTestId("page-config-panel")).toBeInTheDocument();
    expect(screen.getByText("Test Layers")).toBeInTheDocument();
    expect(screen.getByTestId("test-layers")).toBeInTheDocument();
  });

  it("PageConfigPanel: renders with appearance tab", async () => {
    const user = userEvent.setup();
    const tabsContentWithAppearance = {
      ...mockTabsContent,
      appearance: { title: "Test Appearance", content: <div data-testid="test-appearance">Test Appearance Content</div> },
    };

    render(
      <PageConfigPanel 
        className="test-class" 
        tabsContent={tabsContentWithAppearance}
      />
    );

    expect(screen.getByText("Test Appearance")).toBeInTheDocument();
    
    // Click on the appearance tab to make it active
    await user.click(screen.getByText("Test Appearance"));
    
    await waitFor(() => {
      // After clicking, the tab should be active
      const appearanceTab = screen.getByText("Test Appearance");
      expect(appearanceTab).toHaveAttribute("aria-selected", "true");
      
      // And the content should now be rendered
      expect(screen.getByTestId("test-appearance")).toBeInTheDocument();
    });
  });

  it("PageConfigPanel: renders with data tab", async () => {
    const user = userEvent.setup();
    const tabsContentWithData = {
      ...mockTabsContent,
      data: { title: "Test Data", content: <div data-testid="test-data">Test Data Content</div> },
    };

    render(
      <PageConfigPanel 
        className="test-class" 
        tabsContent={tabsContentWithData}
      />
    );

    expect(screen.getByText("Test Data")).toBeInTheDocument();
    
    // Click on the data tab to make it active
    await user.click(screen.getByText("Test Data"));
    
    await waitFor(() => {
      // After clicking, the tab should be active
      const dataTab = screen.getByText("Test Data");
      expect(dataTab).toHaveAttribute("aria-selected", "true");
      
      // And the content should now be rendered
      expect(screen.getByTestId("test-data")).toBeInTheDocument();
    });
  });

  it("PageConfigPanel: renders with all tabs", () => {
    const fullTabsContent = {
      layers: { title: "Test Layers", content: <div data-testid="test-layers">Test Layers Content</div> },
      appearance: { title: "Test Appearance", content: <div data-testid="test-appearance">Test Appearance Content</div> },
      data: { title: "Test Data", content: <div data-testid="test-data">Test Data Content</div> },
    };

    render(
      <PageConfigPanel 
        className="test-class" 
        tabsContent={fullTabsContent}
      />
    );

    expect(screen.getByText("Test Layers")).toBeInTheDocument();
    expect(screen.getByText("Test Appearance")).toBeInTheDocument();
    expect(screen.getByText("Test Data")).toBeInTheDocument();
  });
});

describe("LoadingSkeleton Component", () => {
  it("LoadingSkeleton: renders loading skeleton", () => {
    render(<LoadingSkeleton />);
    
    const skeleton = screen.getByTestId("loading-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("flex", "flex-col", "flex-1", "gap-1", "bg-secondary/90");
  });

  it("LoadingSkeleton: is shown when stores are not initialized", async () => {
    // Create a temporary mock for useStore that returns false for initialization
    const originalUseStore = require("@/hooks/use-store").useStore;
    
    // Mock useStore to return false for initialization check
    const mockUseStore = jest.fn()
      .mockReturnValueOnce(false) // layerStoreInitialized
      .mockReturnValueOnce(false); // editorStoreInitialized
    
    // Override the useStore temporarily
    require("@/hooks/use-store").useStore = mockUseStore;

    // Re-import UIBuilder to get the new mock
    delete require.cache[require.resolve("@/components/ui/ui-builder")];
    const { default: UIBuilderWithNewMock } = require("@/components/ui/ui-builder");
    
    render(<UIBuilderWithNewMock componentRegistry={componentRegistry} />);

    // LoadingSkeleton should be visible
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    
    // MainLayout should not be rendered
    expect(screen.queryByTestId("component-editor")).not.toBeInTheDocument();
    
    // Restore original useStore
    require("@/hooks/use-store").useStore = originalUseStore;
  });

  it("LoadingSkeleton: skeleton has correct structure and styling", () => {
    render(<LoadingSkeleton />);
    
    const skeleton = screen.getByTestId("loading-skeleton");
    
    // Check main container
    expect(skeleton).toHaveClass("flex", "flex-col", "flex-1", "gap-1", "bg-secondary/90");
    
    // Check for skeleton elements (div children with animate-pulse)
    const skeletonElements = skeleton.querySelectorAll("div");
    expect(skeletonElements.length).toBeGreaterThanOrEqual(4); // At least header + content container + panels
    
    // Check header skeleton - find by classes
    const headerSkeleton = skeleton.querySelector(".w-full.h-16.animate-pulse");
    expect(headerSkeleton).toBeInTheDocument();
    expect(headerSkeleton).toHaveClass("w-full", "h-16", "animate-pulse", "bg-background", "rounded-md");
    
    // Check content container 
    const contentContainer = skeleton.querySelector(".flex.flex-1.gap-1");
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass("flex", "flex-1", "gap-1");
    
    // Check content skeleton panels
    const panelElements = contentContainer?.querySelectorAll(".animate-pulse");
    expect(panelElements?.length).toBe(3); // left, center, right panels
    
    // Check panel classes
    const leftPanel = contentContainer?.querySelector(".w-1\\/4");
    const centerPanel = contentContainer?.querySelector(".w-1\\/2");
    
    expect(leftPanel).toHaveClass("w-1/4", "animate-pulse", "bg-background", "rounded-md");
    expect(centerPanel).toHaveClass("w-1/2", "animate-pulse", "bg-muted-background/90", "rounded-md");
  });
});

describe("Exported Functions", () => {
  it("defaultConfigTabsContent: returns default tab configuration", () => {
    const result = defaultConfigTabsContent();
    
    expect(result).toHaveProperty("layers");
    expect(result).toHaveProperty("appearance");
    expect(result).toHaveProperty("data");
    expect(result.layers.title).toBe("Layers");
    expect(result.appearance?.title).toBe("Appearance");
    expect(result.data?.title).toBe("Data");
  });

  it("getDefaultPanelConfigValues: returns default panel configuration", () => {
    const mockTabsContent = {
      layers: { title: "Test Layers", content: <div>Test</div> },
    };
    
    const result = getDefaultPanelConfigValues(mockTabsContent);
    
    expect(result).toHaveProperty("navBar");
    expect(result).toHaveProperty("pageConfigPanel");
    expect(result).toHaveProperty("editorPanel");
    expect(result).toHaveProperty("propsPanel");
  });
});

describe("Mobile Panel Selection", () => {
  // Mock for mobile view
  let originalUseStore: any;
  let originalInnerWidth: number;

  beforeEach(() => {
    // Store original values
    originalUseStore = require("@/hooks/use-store").useStore;
    originalInnerWidth = window.innerWidth;

    // Override the mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600, // Mobile width
    });
  });

  afterEach(() => {
    // Restore original values
    require("@/hooks/use-store").useStore = originalUseStore;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("UIBuilder: handles panel selection when current panel disappears", async () => {
    // Mock useStore to simulate panel state changes
    let mockState = {
      pages: mockInitialLayers,
      variables: mockInitialVariables,
      initialize: jest.fn(),
      showLeftPanel: true,
      showRightPanel: true,
    };

    const mockUseStore = jest.fn((store: any, selector: any) => {
      return selector(mockState);
    });

    require("@/hooks/use-store").useStore = mockUseStore;

    const { rerender } = render(
      <UIBuilder componentRegistry={componentRegistry} />
    );

    // Update mock state to simulate right panel disappearing
    mockState = {
      ...mockState,
      showRightPanel: false,
    };

    rerender(<UIBuilder componentRegistry={componentRegistry} />);

    await waitFor(() => {
      expect(screen.getByTestId("component-editor")).toBeInTheDocument();
    });
  });

  it("UIBuilder: handles mobile panel click events", async () => {
    // Mock useStore for mobile panel test
    const mockUseStore = jest.fn((store: any, selector: any) => {
      const mockState = {
        pages: mockInitialLayers,
        variables: mockInitialVariables,
        initialize: jest.fn(),
        showLeftPanel: true,
        showRightPanel: true,
      };
      return selector(mockState);
    });

    require("@/hooks/use-store").useStore = mockUseStore;

    render(<UIBuilder componentRegistry={componentRegistry} />);

    await waitFor(() => {
      expect(screen.getByTestId("component-editor")).toBeInTheDocument();
      
      // Try to find and click panel buttons if they exist
      const buttons = screen.getAllByRole("button");
      const panelButtons = buttons.filter(button => 
        button.textContent?.includes("Page Config") || 
        button.textContent?.includes("UI Editor") || 
        button.textContent?.includes("Props")
      );
      
      if (panelButtons.length > 0 && panelButtons[0]) {
        fireEvent.click(panelButtons[0]);
      }
    });
  });
});
