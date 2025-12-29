import { DatePicker } from "@/components/ui/date-picker";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import type { AutoFormInputComponentProps } from "../types";
import { getBaseType } from "../utils";

/**
 * Convert a value to a Date object if needed.
 * Handles both Date objects (from z.date()) and ISO strings (from z.fromJSONSchema with format: date-time)
 */
function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

export default function AutoFormDate({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
  zodItem,
}: AutoFormInputComponentProps) {
  // Determine if the underlying schema expects a Date object or string
  // z.date() has base type "ZodDate", while z.fromJSONSchema with format: date-time creates a ZodString
  const baseType = getBaseType(zodItem);
  const expectsDateObject = baseType === "ZodDate";
  
  const handleChange = (date: Date | undefined) => {
    if (!date) {
      field.onChange(undefined);
      return;
    }
    // If the schema is z.date(), pass Date object
    // If the schema is string (from JSON Schema), pass ISO string
    if (expectsDateObject) {
      field.onChange(date);
    } else {
      field.onChange(date.toISOString());
    }
  };

  return (
    <FormItem>
      <AutoFormLabel
        label={fieldConfigItem?.label || label}
        isRequired={isRequired}
      />
      <FormControl>
        <DatePicker
          date={toDate(field.value)}
          setDate={handleChange}
          {...fieldProps}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />

      <FormMessage />
    </FormItem>
  );
}
