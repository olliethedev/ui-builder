import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

export default function AutoFormRadioGroup({
  label,
  isRequired,
  field,
  zodItem,
  fieldProps,
  fieldConfigItem,
}: AutoFormInputComponentProps) {
  const baseSchema = getBaseSchema(zodItem) as unknown as z.ZodEnum<any>;
  const values = getEnumValues(baseSchema);

  return (
    <div>
      <FormItem>
        <AutoFormLabel
          label={fieldConfigItem?.label || label}
          isRequired={isRequired}
        />
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            {...fieldProps}
          >
            {values?.map((value: string) => (
              <FormItem
                key={value}
                className="mb-2 flex items-center gap-3 space-y-0"
              >
                <FormControl>
                  <RadioGroupItem value={value} />
                </FormControl>
                <FormLabel className="font-normal">{value}</FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
    </div>
  );
}
