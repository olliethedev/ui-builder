import React from 'react';
import { render, screen } from '@testing-library/react';
import { Grid, gridVariants } from '@/components/ui/ui-builder/grid';

describe('Grid', () => {
  it('should render with default variants', () => {
    render(<Grid data-testid="grid">Test content</Grid>);
    
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('auto-rows-none');
    expect(grid).toHaveClass('justify-start');
    expect(grid).toHaveClass('items-start');
    expect(grid).toHaveClass('gap-0');
    expect(grid).toHaveClass('grid-rows-none');
  });

  it('should apply custom columns variants', () => {
    const columnValues = [1, 2, 3, 4, 5, 6, 7, 8, 'auto'] as const;
    const expectedClasses = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-auto'];

    columnValues.forEach((columns, index) => {
      render(<Grid columns={columns} data-testid={`grid-cols-${columns}`}>Test</Grid>);
      const grid = screen.getByTestId(`grid-cols-${columns}`);
      expect(grid).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom autoRows variants', () => {
    const autoRowValues = ['none', 'min', 'max', 'fr'] as const;
    const expectedClasses = ['auto-rows-none', 'auto-rows-min', 'auto-rows-max', 'auto-rows-fr'];

    autoRowValues.forEach((autoRows, index) => {
      render(<Grid autoRows={autoRows} data-testid={`grid-auto-${autoRows}`}>Test</Grid>);
      const grid = screen.getByTestId(`grid-auto-${autoRows}`);
      expect(grid).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom justify variants', () => {
    const justifyValues = ['start', 'end', 'center', 'between', 'around', 'evenly'] as const;
    const expectedClasses = ['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'];

    justifyValues.forEach((justify, index) => {
      render(<Grid justify={justify} data-testid={`grid-justify-${justify}`}>Test</Grid>);
      const grid = screen.getByTestId(`grid-justify-${justify}`);
      expect(grid).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom align variants', () => {
    const alignValues = ['start', 'end', 'center', 'baseline', 'stretch'] as const;
    const expectedClasses = ['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'];

    alignValues.forEach((align, index) => {
      render(<Grid align={align} data-testid={`grid-align-${align}`}>Test</Grid>);
      const grid = screen.getByTestId(`grid-align-${align}`);
      expect(grid).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom gap variants', () => {
    const gapValues = [0, 1, 2, 4, 8] as const;
    const expectedClasses = ['gap-0', 'gap-1', 'gap-2', 'gap-4', 'gap-8'];

    gapValues.forEach((gap, index) => {
      render(<Grid gap={gap} data-testid={`grid-gap-${gap}`}>Test</Grid>);
      const grid = screen.getByTestId(`grid-gap-${gap}`);
      expect(grid).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom templateRows variants', () => {
    const templateRowValues = ['none', 1, 2, 3, 4, 5, 6] as const;
    const expectedClasses = ['grid-rows-none', 'grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6'];

    templateRowValues.forEach((templateRows, index) => {
      render(<Grid templateRows={templateRows} data-testid={`grid-rows-${templateRows}`}>Test</Grid>);
      const grid = screen.getByTestId(`grid-rows-${templateRows}`);
      expect(grid).toHaveClass(expectedClasses[index]);
    });
  });

  it('should combine multiple variants', () => {
    render(
      <Grid 
        columns={3}
        autoRows="min"
        justify="center"
        align="center"
        gap={4}
        templateRows={2}
        data-testid="combined-grid"
      >
        Test content
      </Grid>
    );

    const grid = screen.getByTestId('combined-grid');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-3');
    expect(grid).toHaveClass('auto-rows-min');
    expect(grid).toHaveClass('justify-center');
    expect(grid).toHaveClass('items-center');
    expect(grid).toHaveClass('gap-4');
    expect(grid).toHaveClass('grid-rows-2');
  });

  it('should accept custom className', () => {
    render(<Grid className="custom-grid-class" data-testid="custom-grid">Test</Grid>);
    
    const grid = screen.getByTestId('custom-grid');
    expect(grid).toHaveClass('custom-grid-class');
    expect(grid).toHaveClass('grid'); // Should still have default grid class
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Grid ref={ref}>Test content</Grid>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should pass through other HTML attributes', () => {
    render(
      <Grid 
        id="test-grid-id"
        role="grid"
        aria-label="Grid container"
        data-testid="attributes-grid"
      >
        Test content
      </Grid>
    );

    const grid = screen.getByTestId('attributes-grid');
    expect(grid).toHaveAttribute('id', 'test-grid-id');
    expect(grid).toHaveAttribute('role', 'grid');
    expect(grid).toHaveAttribute('aria-label', 'Grid container');
  });

  it('should render children correctly', () => {
    render(
      <Grid data-testid="parent-grid">
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
        <div>Grid Item 3</div>
      </Grid>
    );

    const grid = screen.getByTestId('parent-grid');
    expect(grid).toHaveTextContent('Grid Item 1Grid Item 2Grid Item 3');
    expect(screen.getByText('Grid Item 1')).toBeInTheDocument();
    expect(screen.getByText('Grid Item 2')).toBeInTheDocument();
    expect(screen.getByText('Grid Item 3')).toBeInTheDocument();
  });

  it('should have correct displayName', () => {
    expect(Grid.displayName).toBe('Grid');
  });

  it('should work with auto columns', () => {
    render(<Grid columns="auto" data-testid="auto-grid">Test</Grid>);
    
    const grid = screen.getByTestId('auto-grid');
    expect(grid).toHaveClass('grid-cols-auto');
  });

  it('should handle all template row options', () => {
    const templateRows = ['none', 1, 2, 3, 4, 5, 6] as const;
    
    templateRows.forEach(rows => {
      render(<Grid templateRows={rows} data-testid={`template-${rows}`}>Test</Grid>);
      const grid = screen.getByTestId(`template-${rows}`);
      expect(grid).toHaveClass(`grid-rows-${rows}`);
    });
  });

  it('should handle maximum columns configuration', () => {
    render(<Grid columns={8} data-testid="max-cols-grid">Test</Grid>);
    
    const grid = screen.getByTestId('max-cols-grid');
    expect(grid).toHaveClass('grid-cols-8');
  });
});

describe('gridVariants', () => {
  it('should generate correct class for default variants', () => {
    const result = gridVariants();
    expect(result).toContain('grid');
    expect(result).toContain('grid-cols-1');
    expect(result).toContain('auto-rows-none');
    expect(result).toContain('justify-start');
    expect(result).toContain('items-start');
    expect(result).toContain('gap-0');
    expect(result).toContain('grid-rows-none');
  });

  it('should generate correct class for custom variants', () => {
    const result = gridVariants({
      columns: 4,
      autoRows: 'fr',
      justify: 'center',
      align: 'center',
      gap: 4,
      templateRows: 3,
    });

    expect(result).toContain('grid');
    expect(result).toContain('grid-cols-4');
    expect(result).toContain('auto-rows-fr');
    expect(result).toContain('justify-center');
    expect(result).toContain('items-center');
    expect(result).toContain('gap-4');
    expect(result).toContain('grid-rows-3');
  });

  it('should handle className override', () => {
    const result = gridVariants({
      className: 'custom-grid-class',
    });

    expect(result).toContain('custom-grid-class');
    expect(result).toContain('grid');
  });

  it('should handle auto columns variant', () => {
    const result = gridVariants({
      columns: 'auto',
    });

    expect(result).toContain('grid-cols-auto');
  });
});