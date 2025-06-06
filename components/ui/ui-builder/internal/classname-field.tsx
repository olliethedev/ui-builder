import React from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
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
