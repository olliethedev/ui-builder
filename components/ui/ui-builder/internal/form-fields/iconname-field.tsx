import React, { useCallback, useMemo } from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import MultipleSelector, {
  Option,
} from "@/components/ui/ui-builder/internal/components/multi-select";
import { iconNames } from "@/components/ui/ui-builder/components/icon";

const EMPTY_OPTIONS: Option[] = [];

interface IconNameFieldProps {
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
  const searchNames = useCallback(async (value: string): Promise<Option[]> => {
    return new Promise((resolve) => {
      const res = iconNames.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      resolve(
        res.map((name) => ({
          value: name,
          label: name,
        }))
      );
    });
  }, []);

  const handleChange = useCallback(
    (values: Option[]) => {
      if (values.length > 0) {
        onChange(values[0].value);
      }
    },
    [onChange]
  );

  const multipleSelectorValues = useMemo(() => {
    return [{ value: value, label: value }];
  }, [value]);

  const emptyIndicator = useMemo(() => (
    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
      No results found.
    </p>
  ), []);

  const loadingIndicator = useMemo(() => (
    <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
      Loading...
    </p>
  ), []);

  return (
    <FormItem className="flex flex-col">
      <FormLabel>
        {label}
        {isRequired && <span className="text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <MultipleSelector
          value={multipleSelectorValues}
          maxSelected={1}
          defaultOptions={EMPTY_OPTIONS}
          onChange={handleChange}
          placeholder="Type icon name..."
          emptyIndicator={emptyIndicator}
          loadingIndicator={loadingIndicator}
          onSearch={searchNames}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};

export default IconNameField;
