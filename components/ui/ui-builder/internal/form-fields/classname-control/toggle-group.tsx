import { ReactNode, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { ChevronDown, XIcon } from "lucide-react";

type ToggleGroupProps = {
  label: string;
  options: ToggleOption[];
  value?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  className?: string;
  allowDeselect?: boolean;
  hideLabel?: boolean;
  multiple?: boolean;
};

export type ToggleOption = {
  className?: string;
  value: string;
  tooltip: string;
  label?: string;
  icon?: ReactNode;
  dropdown?: {
    items: { value: string; label: ReactNode }[];
    defaultValue?: string;
    dropdownDisplay?: "grid";
  };
};

export function ToggleGroup({
  label,
  options,
  value = null,
  onChange,
  className,
  allowDeselect = true,
  hideLabel = false,
  multiple = false,
}: ToggleGroupProps) {
  // Helper to normalize value to array for multi-select
  const valueArray = useMemo(() => multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : value, [multiple, value]);

  const getIsSelected = useCallback((option: ToggleOption) => {
    if (option.dropdown) {
      if (multiple) {
        return option.dropdown.items.some((item) =>
          (valueArray as string[]).includes(
            typeof item.value === "string" ? item.value : ""
          )
        );
      } else {
        return option.dropdown.items.some(
          (item) =>
            value === (typeof item.value === "string" ? item.value : undefined)
        );
      }
    }
    if (multiple) {
      return (valueArray as string[]).includes(option.value);
    }
    return value === option.value;
  }, [multiple, valueArray, value]);

  const handleToggleClick = useCallback((option: ToggleOption) => {
    if (multiple) {
      let newValue: string[] = Array.isArray(valueArray) ? [...valueArray] : [];
      if (option.dropdown) {
        // For dropdown, add/remove all dropdown items
        const dropdownValues = option.dropdown.items.map((item) =>
          typeof item.value === "string" ? item.value : ""
        );
        const hasAny = dropdownValues.some((v) => newValue.includes(v));
        if (hasAny && allowDeselect) {
          newValue = newValue.filter((v) => !dropdownValues.includes(v));
        } else {
          // Add first dropdown value if none selected
          if (!hasAny && dropdownValues[0]) {
            newValue.push(dropdownValues[0]);
          }
        }
      } else {
        const idx = newValue.indexOf(option.value);
        if (idx > -1 && allowDeselect) {
          newValue.splice(idx, 1);
        } else if (idx === -1) {
          newValue.push(option.value);
        }
      }
      onChange?.(newValue.length ? newValue : null);
    } else {
      if (getIsSelected(option) && allowDeselect) {
        onChange?.(null);
        return;
      }
      if (option.dropdown) {
        const dropdownValue =
          option.dropdown.defaultValue ||
          (option.dropdown.items[0] &&
          typeof option.dropdown.items[0].value === "string"
            ? option.dropdown.items[0].value
            : null) ||
          null;
        onChange?.(dropdownValue);
      } else {
        onChange?.(option.value);
      }
    }
  }, [multiple, valueArray, allowDeselect, onChange, getIsSelected]);

  const handleDropdownSelect = useCallback((optionValue: string, dropdownValue: string) => {
    if (multiple) {
      let newValue: string[] = Array.isArray(valueArray) ? [...valueArray] : [];
      // Remove all values from this dropdown's set
      const dropdownValues =
        options
          .find((opt) => opt.value === optionValue)
          ?.dropdown?.items.map((item) =>
            typeof item.value === "string" ? item.value : ""
          ) || [];
      newValue = newValue.filter((v) => !dropdownValues.includes(v));
      // Add the selected value
      if (!newValue.includes(dropdownValue)) {
        newValue.push(dropdownValue);
      }
      onChange?.(newValue.length ? newValue : null);
    } else {
      onChange?.(dropdownValue);
    }
  }, [multiple, valueArray, options, onChange]);

  const selectedClass = "bg-background font-semibold shadow-sm";

  // Single event handlers that use data attributes to avoid creating functions on each render
  const handleToggleClickEvent = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const optionValue = e.currentTarget.dataset.optionValue;
    const option = options.find(opt => opt.value === optionValue);
    if (option) {
      handleToggleClick(option);
    }
  }, [options, handleToggleClick]);

  const handleDropdownSelectEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const optionValue = e.currentTarget.dataset.optionValue;
    const dropdownValue = e.currentTarget.dataset.dropdownValue;
    if (optionValue && dropdownValue) {
      handleDropdownSelect(optionValue, dropdownValue);
    }
  }, [handleDropdownSelect]);

  const handleCloseAutoFocus = useCallback((e: Event) => e.preventDefault(), []);

  // Memoized style object
  const minWidthStyle = useMemo(() => ({ minWidth: 0 }), []);

  return (
    <div>
      {!hideLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex items-center gap-1 flex-wrap bg-muted rounded-md p-1 w-fit",
          className
        )}
      >
        {options.map((option) => {
          const isSelected = getIsSelected(option);

          if (option.dropdown) {
            // For multi, show selected dropdown item if any
            let selectedDropdownItem = null;
            if (multiple) {
              selectedDropdownItem = option.dropdown.items.find((item) =>
                (valueArray as string[]).includes(
                  typeof item.value === "string" ? item.value : ""
                )
              );
            } else {
              selectedDropdownItem = option.dropdown.items.find(
                (item) =>
                  value ===
                  (typeof item.value === "string" ? item.value : undefined)
              );
            }
            return (
              <DropdownMenu key={option.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "gap-px p-1 min-w-8 h-8 flex items-center justify-between rounded-r-none",
                            isSelected && selectedClass
                          )}
                          onClick={handleToggleClickEvent}
                          data-option-value={option.value}
                          aria-label={
                            option.tooltip || option.label || option.value
                          }
                          aria-pressed={isSelected}
                        >
                          <span
                            className="flex flex-row items-center gap-1"
                            style={minWidthStyle}
                          >
                            {option.icon ? (
                              <div className="contents text-muted-foreground">
                                {option.icon}
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-xs leading-3 font-normal">
                                {option.label}{isSelected && ":"}
                              </div>
                            )}
                            {isSelected && option.dropdown && (
                              <DropdownOption>
                                {selectedDropdownItem?.label ||
                                  option.dropdown.defaultValue ||
                                  ""}
                              </DropdownOption>
                            )}
                          </span>
                          <ChevronDown className="!size-3 ml-1 text-muted-foreground/60 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      {/* X icon to clear selection, outside the trigger */}
                      {isSelected && option.dropdown && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-1 focus:outline-none cursor-pointer rounded-l-none rounded-r-md border-l-border border-l",
                            selectedClass
                          )}
                          aria-label="Clear selection"
                          onClick={handleToggleClickEvent}
                          data-option-value={option.value}
                        >
                          <XIcon className="!size-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{option.tooltip}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="end"
                  onCloseAutoFocus={handleCloseAutoFocus}
                  className={cn(
                    "max-h-96 overflow-y-auto",
                    option.dropdown.dropdownDisplay === "grid"
                      ? "grid grid-cols-5 gap-px p-1 "
                      : ""
                  )}
                >
                  {option.dropdown.items.map((item) => (
                    <DropdownMenuItem
                      key={
                        typeof item.value === "string" ? item.value : undefined
                      }
                      className={
                        (
                          multiple
                            ? (valueArray as string[]).includes(
                                typeof item.value === "string" ? item.value : ""
                              )
                            : value ===
                              (typeof item.value === "string"
                                ? item.value
                                : undefined)
                        )
                          ? selectedClass
                          : ""
                      }
                      onClick={handleDropdownSelectEvent}
                      data-option-value={option.value}
                      data-dropdown-value={typeof item.value === "string" ? item.value : ""}
                      aria-label={
                        typeof item.label === "string" ? item.label : undefined
                      }
                      aria-selected={
                        multiple
                          ? (valueArray as string[]).includes(
                              typeof item.value === "string" ? item.value : ""
                            )
                          : value ===
                            (typeof item.value === "string"
                              ? item.value
                              : undefined)
                      }
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-px p-1 min-w-8 h-8 text-xs flex items-center justify-between",
                    isSelected && selectedClass
                  )}
                  onClick={handleToggleClickEvent}
                  data-option-value={option.value}
                  aria-label={option.tooltip || option.label || option.value}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      "text-sx text-muted-foreground",
                      option.icon
                        ? "flex flex-row items-center gap-1"
                        : "flex flex-col items-center justify-center flex-1"
                    )}
                    style={minWidthStyle}
                  >
                    {option.icon}
                    {option.label && (
                      <span
                        className={cn(
                          option.icon && "ml-2",
                          !isSelected && "font-normal"
                        )}
                      >
                        {option.label}
                      </span>
                    )}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{option.tooltip}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export function DropdownOption({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-row items-center justify-start text-center w-full">
      {color && (
        <span
          className={cn(
            "inline-block size-[14px] rounded-full border border-border mr-1",
            color
          )}
        />
      )}
      <span className="text-xs text-muted-foreground">{children}</span>
    </div>
  );
}