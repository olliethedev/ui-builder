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
  ComponentLayer,
  FieldConfigFunction,
} from '@/components/ui/ui-builder/types';
import IconNameField from "@/components/ui/ui-builder/internal/iconname-field";
import { Textarea } from "@/components/ui/textarea";

export const classNameFieldOverrides: FieldConfigFunction = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layer
) => {
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
export const childrenFieldOverrides: FieldConfigFunction = (layer) => {
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

export const iconNameFieldOverrides: FieldConfigFunction = (layer) => {
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

export const childrenAsTextareaFieldOverrides: FieldConfigFunction = (layer) => {
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

export const commonFieldOverrides = () => {
  return {
    className: (layer: ComponentLayer)=> classNameFieldOverrides(layer),
    children: (layer: ComponentLayer)=> childrenFieldOverrides(layer)
}
}