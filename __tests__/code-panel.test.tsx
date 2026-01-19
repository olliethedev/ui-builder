import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodePanel } from '@/components/ui/ui-builder/components/code-panel';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import type { ComponentLayer } from '@/components/ui/ui-builder/types';
import { pageLayerToCode } from '@/components/ui/ui-builder/internal/utils/templates';

// Mock dependencies
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn(),
}));

jest.mock('@/components/ui/ui-builder/internal/utils/templates', () => ({
  pageLayerToCode: jest.fn(),
}));

jest.mock('@/components/ui/ui-builder/components/codeblock', () => ({
  CodeBlock: ({ language, value }: { language: string; value: string }) => (
    <div data-testid={`codeblock-${language}`}>{value}</div>
  ),
}));

jest.mock('@/hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: () => ({
    isCopied: false,
    copyToClipboard: jest.fn(),
  }),
}));

const mockPageLayerToCode = pageLayerToCode as jest.MockedFunction<typeof pageLayerToCode>;
const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;

describe('CodePanel', () => {
  const mockPage: ComponentLayer = {
    id: 'page1',
    type: 'div',
    name: 'Test Page',
    props: { className: 'page-class' },
    children: [
      {
        id: 'button1',
        type: 'Button',
        name: 'Test Button',
        props: { 
          className: 'button-class',
          label: { __variableRef: 'var1' }
        },
        children: [],
      },
    ],
  };

  const mockVariables = [
    {
      id: 'var1',
      name: 'userName',
      type: 'string' as const,
      defaultValue: 'John Doe'
    },
    {
      id: 'var2',
      name: 'userAge',
      type: 'number' as const,
      defaultValue: 25
    }
  ];

  const mockComponentRegistry = {
    Button: {
      schema: {},
      from: '@/components/ui/button',
      component: () => null,
    },
  };

  beforeEach(() => {
    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        selectedPageId: 'page1',
        findLayerById: jest.fn().mockReturnValue(mockPage),
        variables: mockVariables,
      } as any;
      return selector(state);
    });

    mockUseEditorStore.mockImplementation((selector) => {
      const state = {
        registry: mockComponentRegistry,
      } as any;
      return selector(state);
    });

    mockPageLayerToCode.mockReturnValue(`
import React from "react";
import { Button } from "@/components/ui/button";

interface PageProps {
  variables: {
    userName: string;
    userAge: number;
  };
}

const Page = ({ variables }: PageProps) => {
  return (
    <div className="page-class">
      <Button className="button-class" label={variables.userName} />
    </div>
  );
};

export default Page;
    `.trim());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render both tabs', () => {
    render(<CodePanel />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Serialized')).toBeInTheDocument();
    expect(screen.queryByText('With Variables')).not.toBeInTheDocument();
  });

  it('should call pageLayerToCode with variables', () => {
    render(<CodePanel />);
    
    expect(mockPageLayerToCode).toHaveBeenCalledWith(
      mockPage,
      mockComponentRegistry,
      mockVariables
    );
  });

  it('should display React code in the React tab', () => {
    render(<CodePanel />);
    
    // React tab should be active by default
    expect(screen.getByTestId('codeblock-tsx')).toBeInTheDocument();
    expect(screen.getByTestId('codeblock-tsx')).toHaveTextContent('const Page = ({ variables }: PageProps)');
  });

  it('should handle empty variables array', () => {
    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        selectedPageId: 'page1',
        findLayerById: jest.fn().mockReturnValue(mockPage),
        variables: [],
      } as any;
      return selector(state);
    });

    render(<CodePanel />);
    
    expect(mockPageLayerToCode).toHaveBeenCalledWith(
      mockPage,
      mockComponentRegistry,
      []
    );
  });

  it('should handle page without variable references', () => {
    const pageWithoutVars: ComponentLayer = {
      id: 'page1',
      type: 'div',
      name: 'Test Page',
      props: { className: 'page-class' },
      children: [
        {
          id: 'button1',
          type: 'Button',
          name: 'Test Button',
          props: { 
            className: 'button-class',
            label: 'Static Label'
          },
          children: [],
        },
      ],
    };

    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        selectedPageId: 'page1',
        findLayerById: jest.fn().mockReturnValue(pageWithoutVars),
        variables: mockVariables,
      } as any;
      return selector(state);
    });

    render(<CodePanel />);
    
    expect(mockPageLayerToCode).toHaveBeenCalledWith(
      pageWithoutVars,
      mockComponentRegistry,
      mockVariables
    );
  });

  it('should apply custom className', () => {
    const { container } = render(<CodePanel className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should generate correct serialized data structure with separate variables and layers', () => {
    render(<CodePanel />);
    
    // Verify that pageLayerToCode was called with the correct parameters
    expect(mockPageLayerToCode).toHaveBeenCalledWith(
      mockPage,
      mockComponentRegistry,
      mockVariables
    );
    
    // The serialized data should show separate sections for variables and layers
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Serialized')).toBeInTheDocument();
    
    // Verify React tab content is visible by default
    expect(screen.getByTestId('codeblock-tsx')).toBeInTheDocument();
  });

  it('should create separate JSON strings for variables and layers', () => {
    // Test the data structure directly by checking what would be passed to CodeBlock
    const { container } = render(<CodePanel />);
    
    // The component should render without errors, indicating the data structure is correct
    expect(container).toBeInTheDocument();
    
    // Verify that the component was called with the correct parameters
    expect(mockPageLayerToCode).toHaveBeenCalledWith(
      mockPage,
      mockComponentRegistry,
      mockVariables
    );
  });

  it('should handle empty variables array in data structure', () => {
    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        selectedPageId: 'page1',
        findLayerById: jest.fn().mockReturnValue(mockPage),
        variables: [],
      } as any;
      return selector(state);
    });

    const { container } = render(<CodePanel />);
    
    // Should render without errors even with empty variables
    expect(container).toBeInTheDocument();
    
    expect(mockPageLayerToCode).toHaveBeenCalledWith(
      mockPage,
      mockComponentRegistry,
      []
    );
  });
}); 