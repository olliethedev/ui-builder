import React, { useCallback } from "react";

import MultipleSelector, {
  Option,
} from "@/components/ui/ui-builder/multi-select";
import { TAILWIND_CLASSES_WITH_BREAKPOINTS } from "@/components/ui/ui-builder/internal/tailwind-classes";

interface ClassNameMultiselectProps {
  value: string;
  onChange: (newClassName: string) => void;
}

const ClassNameMultiselect: React.FC<ClassNameMultiselectProps> = ({
  value,
  onChange,
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
    <MultipleSelector
          defaultOptions={[]}
          value={
            value?.split(" ")
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
  );
};

export default ClassNameMultiselect;
