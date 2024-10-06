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
import { iconNames } from "@/components/ui/ui-builder/icon";

interface IconNameFieldProps{

  description?: React.ReactNode;
  label?: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const IconNameField: React.FC<IconNameFieldProps> = ({
  value,
  onChange,
  description,
  label,
  isRequired,
}) => {
  const searchNames = async (value: string): Promise<Option[]> => {
    return new Promise((resolve) => {
      const res = iconNames.filter((option) => option.toLowerCase().includes(value.toLowerCase()));
      resolve(
        res.map((name) => ({
          value: name,
          label: name,
        }))
      );
    });
  };

  const handleChange = useCallback(
    (values: Option[]) => {
      if (values.length > 0) {
        onChange(values[0].value);
      }
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
          value={[{value: value, label: value}]}
          maxSelected={1}
          defaultOptions={[]}
          
          onChange={handleChange}
          placeholder="Type icon name..."
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
          onSearch={searchNames}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};

export default IconNameField;
