import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import * as z from "zod";
import { INPUT_COMPONENTS } from "./config";
import type { 
  SerializableInputProps,
  StringInputProps,
  NumberInputProps,
  BooleanInputProps,
  DateInputProps,
  EnumInputProps,
  TypedInputProps,
} from "./shared-form-types";

// Re-export discriminated input prop types for field components
export type {
  SerializableInputProps,
  StringInputProps,
  NumberInputProps,
  BooleanInputProps,
  DateInputProps,
  EnumInputProps,
  TypedInputProps,
};

/**
 * Available field types for AutoForm fieldConfig.
 * These map to the input components in ./config.ts
 */
export type AutoFormFieldType = keyof typeof INPUT_COMPONENTS;

/**
 * Input props for form fields.
 * 
 * This is the runtime type that accepts any input props.
 * For type-safe props, use the discriminated types:
 * - StringInputProps for text inputs
 * - NumberInputProps for number inputs
 * - BooleanInputProps for checkboxes/switches
 * - DateInputProps for date pickers
 * - EnumInputProps for selects/radios
 */
export type FieldInputProps = SerializableInputProps & 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof SerializableInputProps> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof SerializableInputProps>;

/**
 * Configuration for a single field in AutoForm.
 * 
 * Note: This type is designed to align with form-builder's FormBuilderFieldProps
 * so that JSON Schema properties can be easily converted to field configs.
 */
export type FieldConfigItem = {
  /** Description text or React node */
  description?: React.ReactNode;
  /** Input props passed to the field component */
  inputProps?: FieldInputProps;
  /** Display label */
  label?: string;
  /** Field type override - built-in type or custom component */
  fieldType?:
    | keyof typeof INPUT_COMPONENTS
    | React.FC<AutoFormInputComponentProps>;
  /** Wrapper component for custom field layout */
  renderParent?: (props: {
    children: React.ReactNode;
  }) => React.ReactElement | null;
  /** Display order for field ordering */
  order?: number;
};

/**
 * FieldConfig for nested objects - allows both FieldConfigItem properties
 * AND nested field configs for child properties.
 */
export type FieldConfigObject = FieldConfigItem & {
  [key: string]: FieldConfigItem | FieldConfigObject | undefined;
};

/**
 * For object fields, allow both FieldConfigItem properties (label, description, etc.)
 * AND nested field configs for the object's properties.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod generic inference
export type FieldConfig<SchemaType extends z.infer<z.ZodObject<any, any>>> = {
  [Key in keyof SchemaType]?: FieldConfigItem | FieldConfigObject;
};

export enum DependencyType {
  DISABLES,
  REQUIRES,
  HIDES,
  SETS_OPTIONS,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod generic inference
type BaseDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> = {
  sourceField: keyof SchemaType;
  type: DependencyType;
  targetField: keyof SchemaType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic field value types
  when: (sourceFieldValue: any, targetFieldValue: any) => boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod generic inference
export type ValueDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  BaseDependency<SchemaType> & {
    type:
      | DependencyType.DISABLES
      | DependencyType.REQUIRES
      | DependencyType.HIDES;
  };

export type EnumValues = readonly [string, ...string[]];

export type OptionsDependency<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod generic inference
  SchemaType extends z.infer<z.ZodObject<any, any>>,
> = BaseDependency<SchemaType> & {
  type: DependencyType.SETS_OPTIONS;

  // Partial array of values from sourceField that will trigger the dependency
  options: EnumValues;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod generic inference
export type Dependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  | ValueDependency<SchemaType>
  | OptionsDependency<SchemaType>;

/**
 * A FormInput component can handle a specific Zod type (e.g. "ZodBoolean")
 */
export type AutoFormInputComponentProps = {
  zodInputProps: React.InputHTMLAttributes<HTMLInputElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form field name type
  field: ControllerRenderProps<FieldValues, any>;
  fieldConfigItem: FieldConfigItem;
  label: string;
  isRequired: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic field props from Zod schema
  fieldProps: any;
  zodItem: z.ZodType;
  className?: string;
};
