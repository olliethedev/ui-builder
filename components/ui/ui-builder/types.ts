 
import { type ZodObject, type ZodSchema, type ZodTuple } from "zod";
import type React from "react";
import { type ComponentType as ReactComponentType, type ReactNode } from 'react';
import {
    type FieldConfigItem,
  } from "@/components/ui/auto-form/types";

export type {
    AutoFormInputComponentProps,
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

// Enhanced prop value types that can accommodate React props, variables, and common data types
export type PropValue = 
  | ReactNode 
  | VariableReference 
  | Record<string, any> 
  | any[] 
  | string 
  | number 
  | boolean 
  | null 
  | undefined;

// Generic component props that allow for flexible but safer typing
export type ComponentProps<TProps extends Record<string, PropValue> = Record<string, PropValue>> = TProps;

// Enhanced ComponentLayer with generic prop typing
// Children can be:
// - ComponentLayer[] for nested components
// - string for text content
// - VariableReference for dynamic text content bound to a variable
export interface ComponentLayer<TProps extends Record<string, PropValue> = Record<string, PropValue>> {
    id: string;
    name?: string;
    type: string;
    /**
     * Optional page type identifier. Only meaningful on page-level layers (top-level entries in the pages array).
     * Used to determine which PageTypeRenderer to use for this page in the editor canvas.
     * Undefined means the default web renderer is used.
     */
    pageType?: string;
    props: ComponentProps<TProps>;
    children: ComponentLayer[] | string | VariableReference;
}

// Variable value types - more specific than before
// 'function' type variables reference a key in the FunctionRegistry
export type VariableValueType = 'string' | 'number' | 'boolean' | 'function';

// Type-safe variable values based on their type
// For function type, the value is the FunctionRegistry key
export type VariableValue<T extends VariableValueType> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'function' ? string :  // References functionRegistry key
  never;

// Enhanced Variable interface with generic typing
export interface Variable<T extends VariableValueType = VariableValueType> {
  id: string;
  name: string;
  type: T;
  defaultValue: VariableValue<T>;
}

// Variable reference marker for props
export interface VariableReference {
  __variableRef: string;
}

// Default variable binding configuration
export interface DefaultVariableBinding {
  propName: string;
  variableId: string;
  immutable?: boolean;
}

// Enhanced registry entry with better component typing
export interface RegistryEntry<T extends ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<any> | ZodSchema<any>;
  from?: string;
  isFromDefaultExport?: boolean;
  defaultChildren?: ComponentLayer[] | string | VariableReference;
  defaultVariableBindings?: DefaultVariableBinding[];
  fieldOverrides?: Record<string, FieldConfigFunction>;
  /** 
   * If defined, this component can only be added as a child of the specified parent types.
   * Used to filter component options in the add popover and validate drag-and-drop.
   * Example: TabsTrigger has childOf: ["TabsList"]
   */
  childOf?: string[];
  /**
   * When true, the editor will render this component without wrapping it in the
   * ElementSelector / MeasureRange <span> overlay. Use this for components that
   * render structural HTML elements (<html>, <head>, <body>) which cannot legally
   * be children of a <span> according to the HTML spec. Without this flag, those
   * elements are moved or suppressed by the browser, making canvas content invisible.
   *
   * Layers with this flag set can still be selected via the layer tree panel; they
   * simply won't have click-to-select overlays in the canvas.
   */
  skipEditorWrapper?: boolean;
}

// Improved field config function type
export type FieldConfigFunction = (layer: ComponentLayer, allowVariableBinding?: boolean) => FieldConfigItem;

// Enhanced ComponentRegistry with better typing
export type ComponentRegistry = Record<string, RegistryEntry<ReactComponentType<any>>>;

// Type-safe layer change handler with registry awareness
export type LayerChangeHandler<TRegistry extends ComponentRegistry = ComponentRegistry> = 
  (layers: Array<ComponentLayer & {
    type: keyof TRegistry;
  }>) => void;

// Type-safe variable change handler  
export type VariableChangeHandler = (variables: Variable[]) => void;

// Helper types for extracting component props from registry
export type ExtractComponentProps<
  TRegistry extends ComponentRegistry,
  TComponentName extends keyof TRegistry
> = TRegistry[TComponentName] extends RegistryEntry<ReactComponentType<infer TProps>>
  ? TProps
  : never;

// Type-safe layer change handler with registry awareness
export type TypedLayerChangeHandler<TRegistry extends ComponentRegistry> = 
  (layers: Array<ComponentLayer & {
    type: keyof TRegistry;
  }>) => void;

// Utility function types for creating variables
export type CreateVariable = <T extends VariableValueType>(
  id: string,
  name: string,
  type: T,
  defaultValue: VariableValue<T>
) => Variable<T>;

// Utility to check if a value is a variable reference
export function isVariableReference(value: any): value is VariableReference {
  return typeof value === 'object' && value !== null && '__variableRef' in value;
}

// Type-safe variable creation helper
export const createVariable: CreateVariable = <T extends VariableValueType>(
  id: string,
  name: string,
  type: T,
  defaultValue: VariableValue<T>
): Variable<T> => ({
  id,
  name,
  type,
  defaultValue,
});

/**
 * Block definition for UI Builder.
 * Blocks are pre-built component compositions that can be inserted as templates.
 */
export interface BlockDefinition {
  /** Unique block name, e.g., "login-01" */
  name: string;
  /** Block category for grouping in UI, e.g., "login", "sidebar", "chart" */
  category: string;
  /** Human-readable description */
  description?: string;
  /** The ComponentLayer tree to insert when this block is selected */
  template: ComponentLayer;
  /** Optional preview image URL */
  thumbnail?: string;
  /** Required shadcn components for this block */
  requiredComponents?: string[];
}

/**
 * Block registry type - a record of block name to block definition
 */
export type BlockRegistry = Record<string, BlockDefinition>;

/**
 * Function definition for the function registry.
 * Describes a function that can be bound to component event handlers.
 */
export interface FunctionDefinition {
  /** Human-readable name for the function */
  name: string;
  /** Zod schema describing the function parameters (use z.tuple for ordered args, z.object for named params) */
  schema: ZodTuple<any, any> | ZodObject<any> | ZodSchema<any>;
  /** The actual function to call at runtime */
  fn: (...args: any[]) => any;
  /** Optional description shown in the UI */
  description?: string;
  /** 
   * Optional TypeScript type signature for code generation.
   * Use this when the Zod schema uses z.custom<T>() or other types 
   * that can't be automatically inferred at runtime.
   * @example "(e: React.FormEvent<HTMLFormElement>) => void"
   * @example "(data: { name: string; email: string }) => Promise<void>"
   */
  typeSignature?: string;
}

/**
 * Function registry type - a record of function ID to function definition.
 * Used to provide callable functions that can be bound to component event handlers.
 */
export type FunctionRegistry = Record<string, FunctionDefinition>;

// ---------------------------------------------------------------------------
// Editor canvas configuration (shared between render-utils and page type API)
// ---------------------------------------------------------------------------

/**
 * Configuration passed to LayerRenderer / RenderLayer when running in editor mode.
 * When undefined, the renderer runs in production/preview mode without editor chrome.
 */
export interface EditorConfig {
  zIndex: number;
  totalLayers: number;
  selectedLayer: ComponentLayer;
  parentUpdated?: boolean;
  onSelectElement: (layerId: string) => void;
}

// ---------------------------------------------------------------------------
// Page Type Renderer API — allows consumers to extend UIBuilder with custom
// page types (email, PDF, react-native-web, etc.) without modifying internals.
// ---------------------------------------------------------------------------

/**
 * Props passed to a custom page type renderer's renderEditorCanvas function.
 */
export interface PageTypeRendererProps {
  page: ComponentLayer;
  componentRegistry: ComponentRegistry;
  editorConfig: EditorConfig;
  variables?: Variable[];
  variableValues?: Record<string, PropValue>;
  functionRegistry?: FunctionRegistry;
}

/**
 * Configuration for a custom page type.
 * Register these via the `pageTypeRenderers` prop on UIBuilder.
 */
export interface PageTypeRenderer {
  /** Display label shown in the page creation UI (e.g. "Email", "PDF") */
  label?: string;
  /** Root layer type for new pages of this type. Defaults to "div" if omitted. */
  defaultRootLayerType?: string;
  /** Initial props for the root layer of a new page. Defaults to DEFAULT_PAGE_PROPS if omitted. */
  defaultRootLayerProps?: Record<string, unknown>;
  /**
   * When true, EditorPanel skips AutoFrame + ResizableWrapper entirely — the renderer
   * owns the full canvas area including scroll and zoom.
   * Reserved for page types that CANNOT render inside an iframe (e.g. PDF viewer, react-native-web).
   * Do NOT use for email — email components render fine in a browser via LayerRenderer.
   */
  skipAutoFrame?: boolean;
  /**
   * Filters the global componentRegistry to control which components appear in the
   * add-component popover for this page type.
   * Return a subset of the registry to restrict available components.
   */
  filterRegistry?: (registry: ComponentRegistry) => ComponentRegistry;
  /** Renders the editor canvas for this page type. */
  renderEditorCanvas: (props: PageTypeRendererProps) => React.ReactNode;
}

/** Map of page type key → renderer config. Passed to UIBuilder via `pageTypeRenderers` prop. */
export type PageTypeRenderers = Record<string, PageTypeRenderer>;

/**
 * Custom code generator for a page type.
 * Registered separately via `pageTypeCodeGenerators` prop on UIBuilder.
 * When present, replaces the default React code tab in the CodePanel for pages of this type.
 */
export interface PageTypeCodeGenerator {
  /** generateCode receives the root page layer and the active registry. Return a string of code. */
  generateCode: (page: ComponentLayer, registry: ComponentRegistry) => string;
  /** Label for the code tab, e.g. "HTML Email", "PDF", "React Native". Defaults to "React". */
  label?: string;
}

/** Map of page type key → code generator. Passed to UIBuilder via `pageTypeCodeGenerators` prop. */
export type PageTypeCodeGenerators = Record<string, PageTypeCodeGenerator>;

