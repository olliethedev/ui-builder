import AutoFormCheckbox from "./fields/checkbox";
import AutoFormDate from "./fields/date";
import AutoFormEnum from "./fields/enum";
import AutoFormInput from "./fields/input";
import AutoFormNumber from "./fields/number";
import AutoFormRadioGroup from "./fields/radio-group";
import AutoFormSwitch from "./fields/switch";
import AutoFormTextarea from "./fields/textarea";

export const INPUT_COMPONENTS = {
  checkbox: AutoFormCheckbox,
  date: AutoFormDate,
  select: AutoFormEnum,
  radio: AutoFormRadioGroup,
  switch: AutoFormSwitch,
  textarea: AutoFormTextarea,
  number: AutoFormNumber,
  fallback: AutoFormInput,
};

/**
 * Define handlers for specific Zod types.
 * You can expand this object to support more types.
 * 
 * Supports both:
 * - Zod v3 style: "ZodBoolean", "ZodEnum", etc. (from _def.typeName)
 * - Zod v4 style: "boolean", "enum", etc. (from _def.type)
 */
export const DEFAULT_ZOD_HANDLERS: {
  [key: string]: keyof typeof INPUT_COMPONENTS;
} = {
  // Zod v3 style type names
  ZodBoolean: "checkbox",
  ZodDate: "date",
  ZodEnum: "select",
  ZodNativeEnum: "select",
  ZodNumber: "number",
  // Zod v4 style type names (lowercase, no "Zod" prefix)
  boolean: "checkbox",
  date: "date",
  enum: "select",
  nativeEnum: "select",
  number: "number",
  int: "number",
  float: "number",
};
