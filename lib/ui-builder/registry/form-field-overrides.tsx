import ClassNameField from "@/components/ui/ui-builder/internal/classname-field";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ChildrenSearchableSelect } from "@/components/ui/ui-builder/internal/children-searchable-select";
import {
  AutoFormInputComponentProps,
  FieldConfigItem,
} from "@/components/ui/auto-form/types";
import { ComponentLayer, TextLayer } from "@/lib/ui-builder/store/layer-store";
import IconNameField from "@/components/ui/ui-builder/internal/iconname-field";

export const classNameFieldOverrides = (
  layer: ComponentLayer | TextLayer
): FieldConfigItem => {
  return {
    fieldType: ({ label, isRequired, field }: AutoFormInputComponentProps) => (
      <ClassNameField
        label={label}
        isRequired={isRequired}
        className={layer.props.className}
        onChange={field.onChange}
      />
    ),
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const childrenFieldOverrides = (layer: ComponentLayer | TextLayer): FieldConfigItem => {
  return {
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
    }: AutoFormInputComponentProps) => (
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <ChildrenSearchableSelect />
        </FormControl>
        {fieldConfigItem.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    ),
  };
};

export const iconNameFieldOverrides = (
  layer: ComponentLayer | TextLayer
): FieldConfigItem => {
  return {
    fieldType: ({ label, isRequired, field }: AutoFormInputComponentProps) => (
      <IconNameField
        label={label}
        isRequired={isRequired}
        value={layer.props.iconName}
        onChange={field.onChange}
      />
    ),
  };
};
