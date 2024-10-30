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
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";
import IconNameField from "@/components/ui/ui-builder/internal/iconname-field";
import { Textarea } from "@/components/ui/textarea";

export const classNameFieldOverrides = (
  layer: ComponentLayer 
): FieldConfigItem => {
  return {
    fieldType: ({ label, isRequired, field, fieldProps }: AutoFormInputComponentProps) => (
      <ClassNameField
        label={label}
        isRequired={isRequired}
        className={field.value}
        onChange={field.onChange}
        {...fieldProps}
      />
    ),
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const childrenFieldOverrides = (layer: ComponentLayer): FieldConfigItem => {
  return {
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <ChildrenSearchableSelect layer={layer} onChange={field.onChange} {...fieldProps} />
        </FormControl>
        {fieldConfigItem.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    ),
  };
};

export const iconNameFieldOverrides = (
  layer: ComponentLayer
): FieldConfigItem => {
  return {
    fieldType: ({ label, isRequired, field, fieldProps }: AutoFormInputComponentProps) => (
      <IconNameField
        label={label}
        isRequired={isRequired}
        value={layer.props.iconName}
        onChange={field.onChange}
        {...fieldProps}
      />
    ),
  };
};

export const childrenAsTextareaFieldOverrides = (layer: ComponentLayer): FieldConfigItem => {
  return {
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          {/* <ChildrenTextArea layer={layer} /> */}
          <Textarea
            value={layer.children as string}
            onChange={field.onChange}
            {...fieldProps}
        />
        </FormControl>
        {fieldConfigItem.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    ),
  };
};