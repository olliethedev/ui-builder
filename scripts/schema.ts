import { z } from "zod"

/**
 * Schema definitions for shadcn registry format (v4)
 * Based on: https://ui.shadcn.com/docs/registry/registry-json
 * and: https://ui.shadcn.com/docs/registry/registry-item-json
 */

export const registryItemTypeSchema = z.enum([
  "registry:style",
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:item",
])

export const registryItemFileSchema = z.object({
  path: z.string(),
  type: registryItemTypeSchema,
  content: z.string().optional(),
  target: z.string().optional(),
})

export const registryCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

export const registryItemSchema = z.object({
  name: z.string(),
  type: registryItemTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  cssVars: registryCssVarsSchema.optional(),
  meta: z.record(z.string(), z.any()).optional(),
  docs: z.string().optional(),
})

export const registrySchema = z.object({
  $schema: z.string(),
  name: z.string(),
  homepage: z.string().optional(),
  items: z.array(registryItemSchema),
})

export type RegistryItemType = z.infer<typeof registryItemTypeSchema>
export type RegistryItemFile = z.infer<typeof registryItemFileSchema>
export type RegistryCssVars = z.infer<typeof registryCssVarsSchema>
export type RegistryItem = z.infer<typeof registryItemSchema>
export type Registry = z.infer<typeof registrySchema>
