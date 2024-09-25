import React, { useCallback } from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import MultipleSelector, {
  Option,
} from "@/components/ui/ui-builder/multi-select";
import { TAILWIND_CLASSES } from "@/components/ui/ui-builder/internal/tailwind-classes";

interface ClassNameFieldProps {
  className: string;
  onChange: (newClassName: string) => void;
  description?: React.ReactNode;
  label?: string;
  isRequired?: boolean;
}

const ClassNameField: React.FC<ClassNameFieldProps> = ({
  className,
  onChange,
  description,
  label,
  isRequired,
}) => {
  const searchClasses = async (value: string): Promise<Option[]> => {
    return new Promise((resolve) => {
      const res = TAILWIND_CLASSES.filter((option) => option.includes(value));
      resolve(
        res.map((cls) => ({
          value: cls,
          label: cls,
        }))
      );
    });
  };

  const handleChange = useCallback(
    (values: Option[]) => {
      const newClassName = values.map((v) => v.value).join(" ");
      onChange(newClassName);
    },
    [onChange]
  );

  return (
    <FormItem className="flex flex-col">
      <FormLabel>
        {label}
        {isRequired && <span className="text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <MultipleSelector
          defaultOptions={[]}
          value={
            className?.split(" ")
              .filter((cls) => cls.trim() !== "")
              .map((cls: string) => ({
                value: cls,
                label: cls,
              })) || []
          }
          onChange={handleChange}
          placeholder="Type class name..."
          creatable
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              No results found.
            </p>
          }
          loadingIndicator={
            <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
              Loading...
            </p>
          }
          onSearch={searchClasses}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};

export default ClassNameField;
