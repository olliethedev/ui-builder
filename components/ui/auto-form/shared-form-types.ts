import type { INPUT_COMPONENTS } from "./config";

// ============================================================================
// INPUT PROPS BY BACKING TYPE
// ============================================================================

/**
 * Common input props shared by all field types.
 */
export interface BaseInputProps {
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Whether to show the label (auto-form specific) */
  showLabel?: boolean;
}

/**
 * Input props for string-backed fields (text, email, password, url, phone, textarea).
 */
export interface StringInputProps extends BaseInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** HTML input type (text, email, password, tel, url) */
  type?: "text" | "email" | "password" | "tel" | "url" | string;
  /** Default value */
  defaultValue?: string;
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Regex pattern for validation */
  pattern?: string;
  /** Autocomplete hint */
  autoComplete?: string;
}

/**
 * Input props for number-backed fields.
 */
export interface NumberInputProps extends BaseInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step value for increment/decrement */
  step?: number;
}

/**
 * Input props for boolean-backed fields (checkbox, switch).
 */
export interface BooleanInputProps extends BaseInputProps {
  /** Default value */
  defaultValue?: boolean;
}

/**
 * Input props for date-backed fields.
 */
export interface DateInputProps extends BaseInputProps {
  /** Default value as ISO string or Date */
  defaultValue?: string | Date;
  /** Minimum date as ISO string */
  min?: string;
  /** Maximum date as ISO string */
  max?: string;
}

/**
 * Input props for enum-backed fields (select, radio).
 */
export interface EnumInputProps extends BaseInputProps {
  /** Placeholder text (for select) */
  placeholder?: string;
  /** Default value (must match one of the enum options) */
  defaultValue?: string;
}

/**
 * Union type of all input props by backing type.
 */
export type TypedInputProps = 
  | StringInputProps
  | NumberInputProps
  | BooleanInputProps
  | DateInputProps
  | EnumInputProps;

/**
 * Generic input props that accept any field type.
 * Use this when the backing type is not known at compile time.
 * 
 * This is the catch-all type used for runtime flexibility.
 */
export interface SerializableInputProps extends BaseInputProps {
  placeholder?: string;
  type?: string;
  defaultValue?: unknown;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  /** Allow additional props for extensibility */
  [key: string]: unknown;
}

// ============================================================================
// INPUT PROPS TYPE MAPPING
// ============================================================================

/**
 * Maps backing Zod types to their corresponding input props type.
 */
export interface InputPropsByBackingType {
  string: StringInputProps;
  number: NumberInputProps;
  boolean: BooleanInputProps;
  date: DateInputProps;
  enum: EnumInputProps;
}

/**
 * Get the correct input props type for a backing type.
 */
export type InputPropsFor<T extends keyof InputPropsByBackingType> = InputPropsByBackingType[T];

/**
 * Built-in field types supported by auto-form.
 */
export type AutoFormBuiltinFieldType = keyof typeof INPUT_COMPONENTS;

/**
 * Field types that can be specified in JSON Schema.
 * Either a built-in type name or a custom component.
 */
export type FieldType = 
  | AutoFormBuiltinFieldType
  | (string & {});  // allow any string for extensibility

/**
 * JSON Schema property with form-builder and auto-form metadata.
 * 
 * This is the intermediate format used when:
 * - form-builder serializes field configurations
 * - auto-form parses JSON Schema to build field configs
 */
export interface JSONSchemaPropertyBase {
  // ========================
  // Standard JSON Schema
  // ========================
  /** JSON Schema type */
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  /** Human-readable title (JSON Schema standard) */
  title?: string;
  /** Description text */
  description?: string;
  /** Default value */
  default?: unknown;
  /** Enum values for select/radio fields */
  enum?: (string | number | boolean | null)[];
  /** Minimum value for numbers */
  minimum?: number;
  /** Maximum value for numbers */
  maximum?: number;
  /** Exclusive minimum for numbers */
  exclusiveMinimum?: number;
  /** Exclusive maximum for numbers */
  exclusiveMaximum?: number;
  /** Minimum length for strings */
  minLength?: number;
  /** Maximum length for strings */
  maxLength?: number;
  /** Regex pattern for strings */
  pattern?: string;
  /** Format hint (email, uri, date-time, etc.) */
  format?: string;
  /** Multiple of constraint for numbers */
  multipleOf?: number;
  
  // ========================
  // Nested structures
  // ========================
  /** Properties for object types */
  properties?: Record<string, JSONSchemaPropertyBase>;
  /** Required fields for object types */
  required?: string[];
  /** Additional properties allowed for objects */
  additionalProperties?: boolean;
  /** Item schema for array types */
  items?: JSONSchemaPropertyBase;

  // ========================
  // Form metadata (via Zod .meta())
  // ========================
  /** Display label (form-builder/auto-form) */
  label?: string;
  /** Field type override (checkbox, date, select, radio, switch, textarea, etc.) */
  fieldType?: FieldType;
  /** Placeholder text */
  placeholder?: string;
  /** HTML input type (text, email, password, tel, etc.) */
  inputType?: string;
  /** Additional input props */
  inputProps?: SerializableInputProps;
  /** Display order */
  order?: number;
  
  // ========================
  // Date constraints (from zodToFormSchema)
  // ========================
  /** Minimum date as ISO string */
  formatMinimum?: string;
  /** Maximum date as ISO string */
  formatMaximum?: string;
}

/**
 * Field configuration item that auto-form uses to customize field rendering.
 * This is the target type when converting from JSON Schema.
 * 
 * Note: This is kept in sync with auto-form/types.ts FieldConfigItem
 */
export interface FieldConfigItemBase {
  /** Description text or React node */
  description?: React.ReactNode;
  /** Input props passed to the field component */
  inputProps?: SerializableInputProps;
  /** Display label */
  label?: string;
  /** Field type override */
  fieldType?: FieldType | React.ComponentType<unknown>;
  /** Wrapper component */
  renderParent?: (props: { children: React.ReactNode }) => React.ReactElement | null;
  /** Display order */
  order?: number;
}

/**
 * Mapping of JSON Schema property keys to FieldConfigItem keys.
 * Used when converting between formats.
 */
export const JSON_SCHEMA_TO_FIELD_CONFIG_MAP = {
  // Direct mappings
  label: "label",
  description: "description",
  fieldType: "fieldType",
  inputProps: "inputProps",
  order: "order",
  // Properties that go into inputProps
  placeholder: "inputProps.placeholder",
  inputType: "inputProps.type",
  default: "inputProps.defaultValue",
} as const;

