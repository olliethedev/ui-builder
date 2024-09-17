export function normalizeSchema(schema: string): string {
  return schema.replace(/\s+/g, ' ').trim();
}