import React from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { BreakpointClassNameControl } from "@/components/ui/ui-builder/internal/classname-control/breakpoint-classname-control";

interface BreakpointClassNameFieldProps {
  className: string;
  onChange: (newClassName: string) => void;
  description?: React.ReactNode;
  label?: string;
  isRequired?: boolean;
}

export const BreakpointClassNameField: React.FC<BreakpointClassNameFieldProps> = ({
  className,
  onChange,
  description,
  label,
  isRequired,
}) => {

  return (
    <FormItem className="flex flex-col">
      <FormLabel>
        Styles
        {isRequired && <span className="text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <BreakpointClassNameControl value={className} onChange={onChange} />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};

export default BreakpointClassNameField;
