import {
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from "zod";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import type { AutoFormInputComponentProps } from "../types";
import { getBaseSchema } from "../helpers";

/**
 * Get enum values from a ZodEnum schema.
 * In Zod v4, enum values are accessed via the .options property or .enum property.
 */
function getEnumValues(schema: z.ZodEnum<any>): string[] {
  // Zod v4: use .options or .enum to get the array of enum values
  if (Array.isArray((schema as any).options)) {
    return (schema as any).options;
  }
  // Fallback: try the .enum property which contains {value: value} entries
  if ((schema as any).enum) {
    return Object.values((schema as any).enum);
  }
  // Last resort: check _zod.def.entries
  const def = (schema as any)._zod?.def;
  if (def?.entries) {
    return Object.values(def.entries);
  }
  return [];
}

export default function AutoFormEnum({
  label,
  isRequired,
  field,
  fieldConfigItem,
  zodItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const baseSchema = getBaseSchema(zodItem) as unknown as z.ZodEnum<any>;
  const baseValues = getEnumValues(baseSchema);

  let values: [string, string][] = [];
  if (!baseValues || baseValues.length === 0) {
    values = [];
  } else {
    values = baseValues.map((value: string) => [value, value]);
  }

  function findItem(value: any) {
    return values.find((item) => item[0] === value);
  }

  // Guard: Ignore empty value changes when a valid value is already set.
  // This prevents Radix Select from resetting the value during controlled value transitions.
  const handleValueChange = (val: string) => {
    if (val === "" && field.value && field.value !== "") {
      return; // Ignore spurious empty value callback
    }
    field.onChange(val);
  };

  return (
    <FormItem>
      <AutoFormLabel
        label={fieldConfigItem?.label || label}
        isRequired={isRequired}
      />
      <FormControl>
        <Select
          onValueChange={handleValueChange}
          value={field.value ?? ""}
          {...fieldProps}
        >
          <SelectTrigger className={fieldProps.className}>
            <SelectValue placeholder={fieldConfigItem.inputProps?.placeholder}>
              {field.value ? findItem(field.value)?.[1] : "Select an option"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {values.map(([value, label]) => (
              <SelectItem value={label} key={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
