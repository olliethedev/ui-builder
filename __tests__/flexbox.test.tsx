import React from 'react';
import { render, screen } from '@testing-library/react';
import { Flexbox, flexboxVariants } from '@/components/ui/ui-builder/flexbox';

describe('Flexbox', () => {
  it('should render with default variants', () => {
    render(<Flexbox data-testid="flexbox">Test content</Flexbox>);
    
    const flexbox = screen.getByTestId('flexbox');
    expect(flexbox).toBeInTheDocument();
    expect(flexbox).toHaveClass('flex');
    expect(flexbox).toHaveClass('flex-row');
    expect(flexbox).toHaveClass('justify-start');
    expect(flexbox).toHaveClass('items-start');
    expect(flexbox).toHaveClass('flex-nowrap');
    expect(flexbox).toHaveClass('gap-0');
  });

  it('should apply custom direction variants', () => {
    const directions = ['row', 'column', 'rowReverse', 'columnReverse'] as const;
    const expectedClasses = ['flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse'];

    directions.forEach((direction, index) => {
      render(<Flexbox direction={direction} data-testid={`flexbox-${direction}`}>Test</Flexbox>);
      const flexbox = screen.getByTestId(`flexbox-${direction}`);
      expect(flexbox).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom justify variants', () => {
    const justifyValues = ['start', 'end', 'center', 'between', 'around', 'evenly'] as const;
    const expectedClasses = ['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'];

    justifyValues.forEach((justify, index) => {
      render(<Flexbox justify={justify} data-testid={`flexbox-${justify}`}>Test</Flexbox>);
      const flexbox = screen.getByTestId(`flexbox-${justify}`);
      expect(flexbox).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom align variants', () => {
    const alignValues = ['start', 'end', 'center', 'baseline', 'stretch'] as const;
    const expectedClasses = ['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'];

    alignValues.forEach((align, index) => {
      render(<Flexbox align={align} data-testid={`flexbox-${align}`}>Test</Flexbox>);
      const flexbox = screen.getByTestId(`flexbox-${align}`);
      expect(flexbox).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom wrap variants', () => {
    const wrapValues = ['nowrap', 'wrap', 'wrapReverse'] as const;
    const expectedClasses = ['flex-nowrap', 'flex-wrap', 'flex-wrap-reverse'];

    wrapValues.forEach((wrap, index) => {
      render(<Flexbox wrap={wrap} data-testid={`flexbox-${wrap}`}>Test</Flexbox>);
      const flexbox = screen.getByTestId(`flexbox-${wrap}`);
      expect(flexbox).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom gap variants', () => {
    const gapValues = [0, 1, 2, 4, 8] as const;
    const expectedClasses = ['gap-0', 'gap-1', 'gap-2', 'gap-4', 'gap-8'];

    gapValues.forEach((gap, index) => {
      render(<Flexbox gap={gap} data-testid={`flexbox-gap-${gap}`}>Test</Flexbox>);
      const flexbox = screen.getByTestId(`flexbox-gap-${gap}`);
      expect(flexbox).toHaveClass(expectedClasses[index]);
    });
  });

  it('should combine multiple variants', () => {
    render(
      <Flexbox 
        direction="column"
        justify="center"
        align="center"
        wrap="wrap"
        gap={4}
        data-testid="combined-flexbox"
      >
        Test content
      </Flexbox>
    );

    const flexbox = screen.getByTestId('combined-flexbox');
    expect(flexbox).toHaveClass('flex');
    expect(flexbox).toHaveClass('flex-col');
    expect(flexbox).toHaveClass('justify-center');
    expect(flexbox).toHaveClass('items-center');
    expect(flexbox).toHaveClass('flex-wrap');
    expect(flexbox).toHaveClass('gap-4');
  });

  it('should accept custom className', () => {
    render(<Flexbox className="custom-class" data-testid="custom-flexbox">Test</Flexbox>);
    
    const flexbox = screen.getByTestId('custom-flexbox');
    expect(flexbox).toHaveClass('custom-class');
    expect(flexbox).toHaveClass('flex'); // Should still have default flex class
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Flexbox ref={ref}>Test content</Flexbox>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should pass through other HTML attributes', () => {
    render(
      <Flexbox 
        id="test-id"
        role="region"
        aria-label="Flexbox container"
        data-testid="attributes-flexbox"
      >
        Test content
      </Flexbox>
    );

    const flexbox = screen.getByTestId('attributes-flexbox');
    expect(flexbox).toHaveAttribute('id', 'test-id');
    expect(flexbox).toHaveAttribute('role', 'region');
    expect(flexbox).toHaveAttribute('aria-label', 'Flexbox container');
  });

  it('should render children correctly', () => {
    render(
      <Flexbox data-testid="parent-flexbox">
        <div>Child 1</div>
        <div>Child 2</div>
        <span>Child 3</span>
      </Flexbox>
    );

    const flexbox = screen.getByTestId('parent-flexbox');
    expect(flexbox).toHaveTextContent('Child 1Child 2Child 3');
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should have correct displayName', () => {
    expect(Flexbox.displayName).toBe('Flexbox');
  });
});

describe('flexboxVariants', () => {
  it('should generate correct class for default variants', () => {
    const result = flexboxVariants();
    expect(result).toContain('flex');
    expect(result).toContain('flex-row');
    expect(result).toContain('justify-start');
    expect(result).toContain('items-start');
    expect(result).toContain('flex-nowrap');
    expect(result).toContain('gap-0');
  });

  it('should generate correct class for custom variants', () => {
    const result = flexboxVariants({
      direction: 'column',
      justify: 'center',
      align: 'center',
      wrap: 'wrap',
      gap: 4,
    });

    expect(result).toContain('flex');
    expect(result).toContain('flex-col');
    expect(result).toContain('justify-center');
    expect(result).toContain('items-center');
    expect(result).toContain('flex-wrap');
    expect(result).toContain('gap-4');
  });

  it('should handle className override', () => {
    const result = flexboxVariants({
      className: 'custom-class',
    });

    expect(result).toContain('custom-class');
    expect(result).toContain('flex');
  });
});