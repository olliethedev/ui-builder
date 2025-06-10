import React from 'react';
import { render, screen } from '@testing-library/react';
import { Markdown } from '@/components/ui/ui-builder/markdown';

// Mock the CodeBlock component since it's already tested
jest.mock('@/components/ui/ui-builder/codeblock', () => ({
  CodeBlock: ({ language, value }: { language: string; value: string }) => (
    <div data-testid={`codeblock-${language}`}>
      {value}
    </div>
  ),
}));

// Mock ReactMarkdown to control its behavior in tests
jest.mock('react-markdown', () => {
  return ({ children, components, className }: any) => {
    return (
      <div className={className} data-testid="mocked-markdown">
        {children}
      </div>
    );
  };
});

describe('Markdown', () => {
  it('should render basic markdown content', () => {
    render(<Markdown>Hello **world**</Markdown>);
    
    const markdown = screen.getByTestId('mocked-markdown');
    expect(markdown).toBeInTheDocument();
    expect(markdown).toHaveTextContent('Hello **world**');
  });

  it('should apply default prose classes', () => {
    render(<Markdown>Test content</Markdown>);
    
    const markdown = screen.getByTestId('mocked-markdown');
    expect(markdown).toHaveClass('prose');
    expect(markdown).toHaveClass('break-words');
    expect(markdown).toHaveClass('prose-headings:text-secondary-foreground');
    expect(markdown).toHaveClass('max-w-none');
  });

  it('should accept custom className', () => {
    render(<Markdown className="custom-markdown-class">Test</Markdown>);
    
    const markdown = screen.getByTestId('mocked-markdown');
    expect(markdown).toHaveClass('custom-markdown-class');
    expect(markdown).toHaveClass('prose'); // Should still have default prose class
  });

  it('should render with empty content', () => {
    render(<Markdown children="" />);
    
    const markdown = screen.getByTestId('mocked-markdown');
    expect(markdown).toBeInTheDocument();
  });

  it('should handle multiline content', () => {
    const multilineContent = `# Heading 1

This is a paragraph.

## Heading 2

Another paragraph.`;

    render(<Markdown>{multilineContent}</Markdown>);
    
    const markdown = screen.getByTestId('mocked-markdown');
    expect(markdown).toBeInTheDocument();
    expect(markdown).toHaveTextContent(expect.stringContaining('Heading 1'));
    expect(markdown).toHaveTextContent(expect.stringContaining('paragraph'));
  });
});

// Test the actual component logic by testing the components function directly
describe('Markdown component functions', () => {
  // Extract components from the actual Markdown component
  const getMarkdownComponents = () => {
    let components: any;
    
    // Mock ReactMarkdown to capture the components
    jest.doMock('react-markdown', () => {
      return ({ components: comp }: any) => {
        components = comp;
        return <div data-testid="capture-components" />;
      };
    });

    const MarkdownActual = require('@/components/ui/ui-builder/markdown').Markdown;
    render(<MarkdownActual>Test</MarkdownActual>);
    
    return components;
  };

  it('should create anchor component with correct props', () => {
    const components = getMarkdownComponents();
    
    // Test the anchor component function
    const anchor = components.a({
      href: 'https://example.com',
      className: 'test-class',
      children: 'Test Link'
    });

    // Render the anchor component to test it
    const { container } = render(anchor);
    const link = container.querySelector('a');
    
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveClass('text-blue-500');
    expect(link).toHaveClass('hover:text-blue-600');
  });

  it('should create image component with responsive classes', () => {
    const components = getMarkdownComponents();
    
    const img = components.img({
      src: 'test.jpg',
      alt: 'Test Image',
      className: 'custom-class'
    });

    const { container } = render(img);
    const image = container.querySelector('img');
    
    expect(image).toHaveAttribute('src', 'test.jpg');
    expect(image).toHaveAttribute('alt', 'Test Image');
    expect(image).toHaveClass('w-full');
    expect(image).toHaveClass('h-auto');
    expect(image).toHaveClass('custom-class');
  });

  it('should render inline code correctly', () => {
    const components = getMarkdownComponents();
    
    const code = components.code({
      className: '',
      children: 'inline code'
    });

    const { container } = render(code);
    const codeElement = container.querySelector('code');
    
    expect(codeElement).toHaveClass('whitespace-pre-wrap');
    expect(codeElement).toHaveTextContent('inline code');
  });

  it('should render code block with CodeBlock component', () => {
    const components = getMarkdownComponents();
    
    const codeBlock = components.code({
      className: 'language-python',
      children: 'print("hello")'
    });

    render(codeBlock);
    
    const codeBlockElement = screen.getByTestId('codeblock-python');
    expect(codeBlockElement).toBeInTheDocument();
    expect(codeBlockElement).toHaveTextContent('print("hello")');
  });

  it('should strip trailing newline from code block', () => {
    const components = getMarkdownComponents();
    
    const codeBlock = components.code({
      className: 'language-javascript',
      children: 'console.log("test");\n'
    });

    render(codeBlock);
    
    const codeBlockElement = screen.getByTestId('codeblock-javascript');
    expect(codeBlockElement).toHaveTextContent('console.log("test");');
  });

  it('should handle code without language class as inline', () => {
    const components = getMarkdownComponents();
    
    const code = components.code({
      className: 'not-language-class',
      children: 'some code'
    });

    const { container } = render(code);
    const codeElement = container.querySelector('code');
    
    expect(codeElement).toHaveClass('whitespace-pre-wrap');
    expect(codeElement).toHaveTextContent('some code');
  });
});