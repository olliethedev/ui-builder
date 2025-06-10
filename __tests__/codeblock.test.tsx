import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeBlock, programmingLanguages } from '@/components/ui/ui-builder/codeblock';

// Mock the syntax highlighter to avoid complexity in tests
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language, ...props }: any) => (
    <div data-testid="syntax-highlighter" data-language={language} {...props}>
      {children}
    </div>
  ),
}));

// Mock the copy hook
const mockCopyToClipboard = jest.fn();
jest.mock('@/hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: () => ({
    isCopied: false,
    copyToClipboard: mockCopyToClipboard,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CopyIcon: () => <div data-testid="copy-icon">Copy</div>,
  CheckIcon: () => <div data-testid="check-icon">Check</div>,
}));

describe('CodeBlock', () => {
  beforeEach(() => {
    mockCopyToClipboard.mockClear();
  });

  it('should render with basic props', () => {
    render(<CodeBlock language="javascript" value="console.log('hello');" />);
    
    expect(screen.getByTestId('codeblock-javascript')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
  });

  it('should display the correct language', () => {
    render(<CodeBlock language="python" value="print('hello')" />);
    
    expect(screen.getByText('python')).toBeInTheDocument();
    expect(screen.getByTestId('codeblock-python')).toBeInTheDocument();
  });

  it('should display code content in syntax highlighter', () => {
    const code = "const x = 'test';";
    render(<CodeBlock language="typescript" value={code} />);
    
    const highlighter = screen.getByTestId('syntax-highlighter');
    expect(highlighter).toHaveTextContent(code);
    expect(highlighter).toHaveAttribute('data-language', 'typescript');
  });

  it('should show copy icon by default', () => {
    render(<CodeBlock language="javascript" value="test" />);
    
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
  });

  it('should call copyToClipboard when copy button is clicked', () => {
    const code = "const test = 'value';";
    render(<CodeBlock language="javascript" value={code} />);
    
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);
    
    expect(mockCopyToClipboard).toHaveBeenCalledWith(code);
  });

  it('should have proper accessibility attributes', () => {
    render(<CodeBlock language="javascript" value="test" />);
    
    const copyButton = screen.getByRole('button');
    expect(copyButton).toBeInTheDocument();
    expect(screen.getByText('Copy code')).toBeInTheDocument();
  });

  it('should handle empty code value', () => {
    render(<CodeBlock language="javascript" value="" />);
    
    const highlighter = screen.getByTestId('syntax-highlighter');
    expect(highlighter).toHaveTextContent('');
  });

  it('should handle different languages', () => {
    const languages = ['python', 'java', 'typescript', 'html', 'css'];
    
    languages.forEach(lang => {
      render(<CodeBlock language={lang} value={`// ${lang} code`} />);
      expect(screen.getByText(lang)).toBeInTheDocument();
      expect(screen.getByTestId(`codeblock-${lang}`)).toBeInTheDocument();
    });
  });

  it('should handle multiline code', () => {
    const multilineCode = `function test() {
  return 'hello world';
}`;
    
    render(<CodeBlock language="javascript" value={multilineCode} />);
    
    const highlighter = screen.getByTestId('syntax-highlighter');
    expect(highlighter).toHaveTextContent(expect.stringContaining('function test()'));
    expect(highlighter).toHaveTextContent(expect.stringContaining('hello world'));
  });
});

describe('programmingLanguages', () => {
  it('should contain expected language mappings', () => {
    expect(programmingLanguages.javascript).toBe('.js');
    expect(programmingLanguages.python).toBe('.py');
    expect(programmingLanguages.typescript).toBe('.ts');
    expect(programmingLanguages.java).toBe('.java');
    expect(programmingLanguages.html).toBe('.html');
    expect(programmingLanguages.css).toBe('.css');
  });

  it('should handle c++ variant naming', () => {
    expect(programmingLanguages.cpp).toBe('.cpp');
    expect(programmingLanguages['c++']).toBe('.cpp');
  });

  it('should handle c# naming', () => {
    expect(programmingLanguages['c#']).toBe('.cs');
  });

  it('should return undefined for unknown language', () => {
    expect(programmingLanguages.unknownlang).toBeUndefined();
  });

  it('should have all expected languages', () => {
    const expectedLanguages = [
      'javascript', 'python', 'java', 'c', 'cpp', 'c++', 'c#', 'ruby',
      'php', 'swift', 'objective-c', 'kotlin', 'typescript', 'go', 'perl',
      'rust', 'scala', 'haskell', 'lua', 'shell', 'sql', 'html', 'css', 'tsx'
    ];

    expectedLanguages.forEach(lang => {
      expect(programmingLanguages[lang]).toBeDefined();
    });
  });
});

// Test with isCopied true state
describe('CodeBlock with isCopied state', () => {
  const mockCopyToClipboardCopied = jest.fn();
  
  beforeEach(() => {
    mockCopyToClipboardCopied.mockClear();
    
    // Mock the hook to return isCopied as true
    jest.doMock('@/hooks/use-copy-to-clipboard', () => ({
      useCopyToClipboard: () => ({
        isCopied: true,
        copyToClipboard: mockCopyToClipboardCopied,
      }),
    }));
  });

  afterEach(() => {
    jest.dontMock('@/hooks/use-copy-to-clipboard');
  });

  it('should show check icon when copied', () => {
    // Clear module cache to get the new mock
    delete require.cache[require.resolve('@/components/ui/ui-builder/codeblock')];
    const { CodeBlock: CodeBlockWithCopied } = require('@/components/ui/ui-builder/codeblock');
    
    render(<CodeBlockWithCopied language="javascript" value="test" />);
    
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('copy-icon')).not.toBeInTheDocument();
  });

  it('should not call copyToClipboard when already copied', () => {
    // Clear module cache to get the new mock
    delete require.cache[require.resolve('@/components/ui/ui-builder/codeblock')];
    const { CodeBlock: CodeBlockWithCopied } = require('@/components/ui/ui-builder/codeblock');
    
    render(<CodeBlockWithCopied language="javascript" value="test" />);
    
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);
    
    expect(mockCopyToClipboardCopied).not.toHaveBeenCalled();
  });
});