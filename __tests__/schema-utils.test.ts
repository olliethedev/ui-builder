import { z } from 'zod';
import { getDefaultProps, patchSchema, addDefaultValues } from '@/lib/ui-builder/store/schema-utils';

describe('getDefaultProps', () => {
  it('should return default value for boolean type', () => {
    const schema = z.object({
      isActive: z.boolean().default(true),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ isActive: true });
  });

  it('should return default value for date type', () => {
    const fixedDate = new Date('2023-01-01T00:00:00Z');
    const schema = z.object({
      createdAt: z.date().default(fixedDate),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ createdAt: fixedDate });
  });

  it('should return default value for number type', () => {
    const schema = z.object({
      count: z.number().default(42),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ count: 42 });
  });

  it('should return default value for string type', () => {
    const schema = z.object({
      name: z.string().default('John Doe'),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ name: 'John Doe' });
  });

  it('should return default value for enum of booleans', () => {
    const schema = z.object({
      status: z.enum(['true', 'false'] as const).default('true'),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ status: 'true' });
  });

  it('should return default value for enum of dates', () => {
    const fixedDate1 = new Date('2023-01-01T00:00:00Z');
    const fixedDate2 = new Date('2023-06-01T00:00:00Z');

    // Zod does not have a built-in enum for dates, so we use string representations
    const schema = z.object({
      eventDate: z.enum([
        fixedDate1.toISOString(),
        fixedDate2.toISOString(),
      ] as const).default(fixedDate1.toISOString()),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ eventDate: fixedDate1.toISOString() });
  });

  it('should return default value for enum of numbers', () => {
    const schema = z.object({
      level: z.enum(['1', '2', '3'] as const).default('1'),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ level: '1' });
  });

  it('should return default value for enum of strings', () => {
    const schema = z.object({
      role: z.enum(['admin', 'user', 'guest'] as const).default('user'),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ role: 'user' });
  });

  it('should return default values for object with boolean, date, number, and string', () => {
    const fixedDate = new Date('2023-01-01T00:00:00Z');
    const schema = z.object({
      isActive: z.boolean().default(false),
      createdAt: z.date().default(fixedDate),
      count: z.number().default(10),
      name: z.string().default('Test Name'),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({
      isActive: false,
      createdAt: fixedDate,
      count: 10,
      name: 'Test Name',
    });
  });

  it('should return default values for array of objects with boolean, date, number, and string', () => {
    const fixedDate = new Date('2023-01-01T00:00:00Z');
    const itemSchema = z.object({
      isActive: z.boolean().default(true),
      createdAt: z.date().default(fixedDate),
      count: z.number().default(5),
      name: z.string().default('Item Name'),
    });

    const schema = z.object({
      items: z.array(itemSchema).default([
        {
          isActive: true,
          createdAt: fixedDate,
          count: 5,
          name: 'Item Name',
        },
      ]),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({
      items: [
        {
          isActive: true,
          createdAt: fixedDate,
          count: 5,
          name: 'Item Name',
        },
      ],
    });
  });

  it('should not return default values for optional fields without defaults', () => {
    const schema = z.object({
      isActive: z.boolean().optional(),
      name: z.string().optional(),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({});
  });

  it('should return default values for some fields and not for others', () => {
    const schema = z.object({
      isActive: z.boolean().default(true),
      name: z.string().optional(),
      count: z.number().default(10),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({
      isActive: true,
      count: 10,
    });
  });

  it('should not handle required object fields', () => {
    const schema = z.object({
      user: z.object({
        isAdmin: z.boolean().optional(),
        profile: z.object({
          age: z.number().optional(),
          email: z.string().default('user@example.com'),
        }).optional(),
      }).default({
        isAdmin: false,
        profile: {
          age: 20,
          email: 'user@example.com',
        },
      })
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({
      user: {
        isAdmin: false,
        profile: {
          age: 20,
          email: 'user@example.com',
        },
      },
    });
  });

  it('should not handle nested optional fields', () => {
    const schema = z.object({
      user: z.object({
        isAdmin: z.boolean().optional(),
        profile: z.object({
          age: z.number().optional(),
          email: z.string().default('user@example.com'),
        }).optional(),
      }),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({
      user: undefined,
    });
  });

  it('should return an empty object when all fields are optional without defaults', () => {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({});
  });

  it('should ignore optional fields when combined with required fields having defaults', () => {
    const schema = z.object({
      isActive: z.boolean().default(false),
      createdAt: z.date().default(new Date('2023-01-01T00:00:00Z')),
      optionalField: z.string().optional(),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({
      isActive: false,
      createdAt: new Date('2023-01-01T00:00:00Z'),
    });
  });
  it('should log a warning if no default value is set for a required field', () => {
    const schema = z.object({
      requiredField: z.string(),
    });

    console.warn = jest.fn();

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({});
    expect(console.warn).toHaveBeenCalledWith('No default value set for required field "requiredField".');
  });
  it('should correctly handle nullable fields', () => {
    const schema = z.object({
      nullableField: z.string().nullable().default("some default value"),
    });

    const defaults = getDefaultProps(schema);
    expect(defaults).toEqual({ nullableField: "some default value" });
  });
});

describe('patchSchema', () => {
  it('should add className property to schema', () => {
    const schema = z.object({
      title: z.string().default('Test'),
    });

    const patchedSchema = patchSchema(schema);
    
    // Check that className is present in the shape
    expect(patchedSchema.shape).toHaveProperty('className');
    expect(patchedSchema.shape.className).toBeDefined();
  });

  it('should transform union of literals to enum with default', () => {
    const schema = z.object({
      size: z.union([
        z.literal('small'),
        z.literal('medium'), 
        z.literal('large')
      ])
    });

    const patchedSchema = patchSchema(schema);
    
    // Parse a valid value to ensure enum works
    const result = patchedSchema.parse({ size: 'medium', className: 'test-class' });
    expect(result.size).toBe('medium');
  });

  it('should add coercion to number and date fields', () => {
    const schema = z.object({
      count: z.number(),
      createdAt: z.date(),
    });

    const patchedSchema = patchSchema(schema);
    
    // Test that string numbers and dates are coerced
    const result = patchedSchema.parse({ 
      count: '42', 
      createdAt: '2023-01-01',
      className: 'test'
    });
    expect(result.count).toBe(42);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('should handle complex nested schemas', () => {
    const schema = z.object({
      config: z.object({
        theme: z.union([z.literal('light'), z.literal('dark')]),
        fontSize: z.number().default(14),
      }),
      tags: z.array(z.string()),
    });

    const patchedSchema = patchSchema(schema);
    
    const result = patchedSchema.parse({
      config: {
        theme: 'dark',
        fontSize: 16,
      },
      tags: ['tag1', 'tag2'],
      className: 'wrapper'
    }) as { config: { theme: string; fontSize: number }; className: string };
    
    expect(result.config.theme).toBe('dark');
    expect(result.config.fontSize).toBe(16);
    expect(result.className).toBe('wrapper');
  });

  it('should handle nullable and optional unions', () => {
    const schema = z.object({
      optionalSize: z.union([z.literal('xs'), z.literal('sm')]).optional(),
      nullableSize: z.union([z.literal('md'), z.literal('lg')]).nullable(),
    });

    const patchedSchema = patchSchema(schema);
    
    // In Zod v4, nullable means "can be null" not "is optional with default"
    // So we need to provide a value for nullable fields
    const result1 = patchedSchema.parse({ className: 'test', nullableSize: null });
    expect(result1.optionalSize).toBeUndefined();
    expect(result1.nullableSize).toBeNull();

    const result2 = patchedSchema.parse({ 
      optionalSize: 'xs',
      nullableSize: 'lg',
      className: 'test'
    });
    expect(result2.optionalSize).toBe('xs');
    expect(result2.nullableSize).toBe('lg');
  });
});

describe('addDefaultValues', () => {
  beforeEach(() => {
    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should add default values to existing schema fields', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
      isActive: z.boolean().optional(),
    });

    const defaultValues = {
      title: 'Default Title',
      count: 42,
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    // The defaults are applied when the field is not provided
    const result = schemaWithDefaults.parse({ isActive: true });
    expect(result.title).toBe('Default Title');
    expect(result.count).toBe(42);
    expect(result.isActive).toBe(true);
  });

  it('should handle enum fields with defaults', () => {
    const schema = z.object({
      status: z.enum(['active', 'inactive', 'pending']),
      priority: z.enum(['low', 'medium', 'high']),
    });

    const defaultValues = {
      status: 'active' as const,
      priority: 'medium' as const,
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    const result = schemaWithDefaults.parse({});
    expect(result.status).toBe('active');
    expect(result.priority).toBe('medium');
  });

  it('should handle optional fields with defaults', () => {
    const schema = z.object({
      name: z.string().optional(),
      age: z.number().optional(),
    });

    const defaultValues = {
      name: 'John Doe',
      age: 30,
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    const result = schemaWithDefaults.parse({});
    expect(result.name).toBe('John Doe');
    expect(result.age).toBe(30);
  });

  it('should handle nullable fields with defaults', () => {
    const schema = z.object({
      description: z.string().nullable(),
      score: z.number().nullable(),
    });

    const defaultValues = {
      description: 'Default description',
      score: 0,
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    const result = schemaWithDefaults.parse({});
    expect(result.description).toBe('Default description');
    expect(result.score).toBe(0);
  });

  it('should warn about keys that do not exist in schema', () => {
    const schema = z.object({
      title: z.string(),
    });

    const defaultValues = {
      title: 'Valid Title',
      nonExistentField: 'Should warn',
    };

    addDefaultValues(schema, defaultValues);
    
    expect(console.warn).toHaveBeenCalledWith(
      'Key "nonExistentField" does not exist in the schema and will be ignored.'
    );
  });

  it('should not warn in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Clear any previous console.warn calls
    jest.clearAllMocks();
    
    // Use Object.defineProperty to temporarily override NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
    });

    const schema = z.object({
      title: z.string(),
    });

    const defaultValues = {
      title: 'Valid Title',
      nonExistentField: 'Should not warn in production',
    };

    addDefaultValues(schema, defaultValues);
    
    // Should not warn about non-existent field in production
    expect(console.warn).toHaveBeenCalledTimes(0);

    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true,
    });
  });

  it('should handle mixed existing and non-existing fields', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
    });

    const defaultValues = {
      title: 'Valid Title',
      count: 100,
      invalidField1: 'Should warn',
      invalidField2: 42,
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    // Parse with missing fields to trigger defaults
    const result = schemaWithDefaults.parse({});
    expect(result.title).toBe('Valid Title');
    expect(result.count).toBe(100);
    
    expect(console.warn).toHaveBeenCalledWith(
      'Key "invalidField1" does not exist in the schema and will be ignored.'
    );
    expect(console.warn).toHaveBeenCalledWith(
      'Key "invalidField2" does not exist in the schema and will be ignored.'
    );
  });

  it('should preserve original field behavior when no default is provided', () => {
    const schema = z.object({
      title: z.string(),
      optionalField: z.string().optional(),
    });

    const defaultValues = {
      title: 'Default Title',
      // No default for optionalField
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    const result = schemaWithDefaults.parse({});
    expect(result.title).toBe('Default Title');
    expect(result.optionalField).toBeUndefined();
  });

  it('should handle empty defaultValues object', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
    });

    const schemaWithDefaults = addDefaultValues(schema, {});
    
    // Should behave the same as original schema
    expect(() => schemaWithDefaults.parse({})).toThrow();
    
    const result = schemaWithDefaults.parse({ title: 'Test', count: 5 });
    expect(result.title).toBe('Test');
    expect(result.count).toBe(5);
  });

  it('should handle complex nested default values', () => {
    const schema = z.object({
      config: z.object({
        theme: z.string(),
        settings: z.object({
          autoSave: z.boolean(),
        }),
      }),
      metadata: z.array(z.string()),
    });

    const defaultValues = {
      config: {
        theme: 'dark',
        settings: {
          autoSave: true,
        },
      },
      metadata: ['tag1', 'tag2'],
    };

    const schemaWithDefaults = addDefaultValues(schema, defaultValues);
    
    const result = schemaWithDefaults.parse({});
    expect(result.config.theme).toBe('dark');
    expect(result.config.settings.autoSave).toBe(true);
    expect(result.metadata).toEqual(['tag1', 'tag2']);
  });
});
