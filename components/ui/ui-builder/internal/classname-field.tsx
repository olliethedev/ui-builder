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
import { TAILWIND_CLASSES_WITH_BREAKPOINTS } from "@/components/ui/ui-builder/internal/tailwind-classes";
import ClassNameMultiselect from "@/components/ui/ui-builder/internal/classname-multiselect";

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
      const res = TAILWIND_CLASSES_WITH_BREAKPOINTS.filter((option) => option.includes(value));
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
        <ClassNameMultiselect value={className} onChange={onChange} />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};

export default ClassNameField;
