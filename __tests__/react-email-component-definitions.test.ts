/**
 * Tests for the react-email component registry definitions.
 * Validates that each component entry is correctly configured for UIBuilder.
 */

// Mock @react-email/components to avoid TextDecoder issues in jsdom environment.
// We only test the registry configuration (schemas, childOf, from), not actual rendering.
jest.mock('@react-email/components', () => {
  const makeComp = (name: string) => {
    const comp = () => null;
    comp.displayName = name;
    return comp;
  };
  return {
    Html: makeComp('Html'),
    Head: makeComp('Head'),
    Body: makeComp('Body'),
    Preview: makeComp('Preview'),
    Tailwind: makeComp('Tailwind'),
    Container: makeComp('Container'),
    Section: makeComp('Section'),
    Row: makeComp('Row'),
    Column: makeComp('Column'),
    Text: makeComp('Text'),
    Button: makeComp('Button'),
    Link: makeComp('Link'),
    Img: makeComp('Img'),
    Hr: makeComp('Hr'),
  };
});

import { reactEmailComponentDefinitions } from '@/lib/ui-builder/registry/react-email-component-definitions';

describe('reactEmailComponentDefinitions', () => {
  const expectedComponents = [
    'Html',
    'Head',
    'Body',
    'Preview',
    'Tailwind',
    'Container',
    'Section',
    'Row',
    'Column',
    'Text',
    'Button',
    'Link',
    'Img',
    'Hr',
  ];

  it('should export all expected email components', () => {
    expectedComponents.forEach((name) => {
      expect(reactEmailComponentDefinitions).toHaveProperty(name);
    });
  });

  it('should not export an "Image" component (the correct export is "Img")', () => {
    expect(reactEmailComponentDefinitions).not.toHaveProperty('Image');
  });

  it('every component should have a schema', () => {
    Object.entries(reactEmailComponentDefinitions).forEach(([name, def]) => {
      expect(def.schema).toBeDefined();
    });
  });

  it('every component should have "from" set to "@react-email/components"', () => {
    Object.entries(reactEmailComponentDefinitions).forEach(([name, def]) => {
      expect(def.from).toBe('@react-email/components');
    });
  });

  it('every component should have a React component', () => {
    Object.entries(reactEmailComponentDefinitions).forEach(([name, def]) => {
      expect(typeof def.component).toBe('function');
    });
  });

  describe('childOf constraints', () => {
    it('Head should only be added inside Html', () => {
      expect(reactEmailComponentDefinitions.Head?.childOf).toContain('Html');
    });

    it('Body should be allowed inside Html and Tailwind', () => {
      expect(reactEmailComponentDefinitions.Body?.childOf).toContain('Html');
      expect(reactEmailComponentDefinitions.Body?.childOf).toContain('Tailwind');
    });

    it('Preview should only be added inside Html', () => {
      expect(reactEmailComponentDefinitions.Preview?.childOf).toContain('Html');
    });

    it('Tailwind should only be added inside Html', () => {
      expect(reactEmailComponentDefinitions.Tailwind?.childOf).toContain('Html');
    });

    it('Row should be restricted to layout parents', () => {
      const rowChildOf = reactEmailComponentDefinitions.Row?.childOf;
      expect(rowChildOf).toContain('Section');
      expect(rowChildOf).toContain('Container');
    });

    it('Column should only be added inside Row', () => {
      expect(reactEmailComponentDefinitions.Column?.childOf).toContain('Row');
    });

    it('Html, Container, Section, Text, Button, Link, Img, Hr should have no childOf (can go anywhere)', () => {
      const unrestricted = ['Html', 'Container', 'Section', 'Text', 'Button', 'Link', 'Img', 'Hr'];
      unrestricted.forEach((name) => {
        expect(reactEmailComponentDefinitions[name]?.childOf).toBeUndefined();
      });
    });
  });

  describe('schema shapes', () => {
    it('Html schema should include lang and dir fields', () => {
      const schema = reactEmailComponentDefinitions.Html?.schema;
      expect(schema).toBeDefined();
      // Parse with valid data
      const result = schema!.safeParse({ lang: 'en', dir: 'ltr' });
      expect(result.success).toBe(true);
    });

    it('Html schema lang should default to "en"', () => {
      const schema = reactEmailComponentDefinitions.Html?.schema;
      const result = schema!.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lang).toBe('en');
      }
    });

    it('Button schema should include href and target', () => {
      const schema = reactEmailComponentDefinitions.Button?.schema;
      const result = schema!.safeParse({ href: 'https://example.com', target: '_blank' });
      expect(result.success).toBe(true);
    });

    it('Img schema should include src, alt, width, height', () => {
      const schema = reactEmailComponentDefinitions.Img?.schema;
      const result = schema!.safeParse({ src: 'https://example.com/img.png', alt: 'test', width: 600 });
      expect(result.success).toBe(true);
    });

    it('Tailwind schema should accept a config object', () => {
      const schema = reactEmailComponentDefinitions.Tailwind?.schema;
      const result = schema!.safeParse({ config: { theme: { extend: {} } } });
      expect(result.success).toBe(true);
    });

    it('Preview schema should accept string children', () => {
      const schema = reactEmailComponentDefinitions.Preview?.schema;
      const result = schema!.safeParse({ children: 'Preview text' });
      expect(result.success).toBe(true);
    });
  });

  describe('field overrides', () => {
    it('components with visible text content should have children field overrides', () => {
      const withChildrenOverride = ['Text', 'Button', 'Link'];
      withChildrenOverride.forEach((name) => {
        expect(reactEmailComponentDefinitions[name]?.fieldOverrides?.children).toBeDefined();
      });
    });

    it('components with className prop should have className field override', () => {
      const withClassNameOverride = ['Html', 'Body', 'Container', 'Section', 'Row', 'Column', 'Text', 'Button', 'Link', 'Img', 'Hr'];
      withClassNameOverride.forEach((name) => {
        expect(reactEmailComponentDefinitions[name]?.fieldOverrides?.className).toBeDefined();
      });
    });
  });

  describe('editor wrapper behavior', () => {
    it('marks structural components to skip editor wrapper overlays', () => {
      expect(reactEmailComponentDefinitions.Html?.skipEditorWrapper).toBe(true);
      expect(reactEmailComponentDefinitions.Head?.skipEditorWrapper).toBe(true);
      expect(reactEmailComponentDefinitions.Body?.skipEditorWrapper).toBe(true);
      expect(reactEmailComponentDefinitions.Preview?.skipEditorWrapper).toBe(true);
    });
  });

  describe('default children', () => {
    it('Text should have default string children', () => {
      expect(typeof reactEmailComponentDefinitions.Text?.defaultChildren).toBe('string');
    });

    it('Button should have default string children', () => {
      expect(typeof reactEmailComponentDefinitions.Button?.defaultChildren).toBe('string');
    });

    it('Html should have default empty array children', () => {
      expect(reactEmailComponentDefinitions.Html?.defaultChildren).toEqual([]);
    });
  });
});
