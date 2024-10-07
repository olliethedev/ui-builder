import { z } from 'zod';
import { getDefaultProps } from '@/lib/ui-builder/store/schema-utils';

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
