import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { beautifyObjectName } from "../helpers";
import AutoFormObject from "./object";

/**
 * Get the def type from a Zod schema (Zod v4 compatible).
 */
function getDefType(schema: z.ZodType): string {
  return (schema as any)._zod?.def?.type || "";
}

/**
 * Get the element type from an array or wrapped array schema.
 * Handles: array, optional array, default array, nullable array
 * In Zod v4, array element type is at _zod.def.element
 */
function getArrayElementType(item: z.ZodType): z.ZodType | null {
  const def = (item as any)._zod?.def;
  const defType = getDefType(item);

  // Direct array
  if (defType === "array") {
    return def?.element || null;
  }

  // Wrapped types (default, optional, nullable) - unwrap and recurse
  if (["default", "optional", "nullable"].includes(defType)) {
    const innerType = def?.innerType;
    if (innerType) {
      return getArrayElementType(innerType);
    }
  }

  return null;
}

export default function AutoFormArray({
  name,
  item,
  form,
  path = [],
  fieldConfig,
}: {
  name: string;
  item: z.ZodArray<any> | z.ZodDefault<any>;
  form: ReturnType<typeof useForm>;
  path?: string[];
  fieldConfig?: any;
}) {
  // The full path for useFieldArray - path already includes the array name
  const fieldPath = path.join(".");
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldPath,
  });
  const title = fieldConfig?.label ?? beautifyObjectName(name);

  const itemDefType = getArrayElementType(item);

  return (
    <AccordionItem value={name} className="border-none">
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {fields.map((_field, index) => {
          const key = _field.id;
          return (
            <div className="mt-4 flex flex-col" key={`${key}`}>
              <AutoFormObject
                schema={itemDefType as z.ZodObject<any, any>}
                form={form}
                fieldConfig={fieldConfig}
                path={[...path, index.toString()]}
              />
              <div className="my-4 flex justify-end">
                <Button
                  variant="secondary"
                  size="icon"
                  type="button"
                  className="hover:bg-zinc-300 hover:text-black focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white dark:text-black dark:hover:bg-zinc-300 dark:hover:text-black dark:hover:ring-0 dark:hover:ring-offset-0 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0"
                  onClick={() => remove(index)}
                >
                  <Trash className="size-4 " />
                </Button>
              </div>

              <Separator />
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({})}
          className="mt-4 flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Add
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
