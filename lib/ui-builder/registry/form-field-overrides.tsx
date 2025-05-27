import { ClassNameField } from "@/components/ui/ui-builder/internal/classname-control";
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
} from "@/components/ui/ui-builder/types";
import IconNameField from "@/components/ui/ui-builder/internal/iconname-field";
import { Textarea } from "@/components/ui/textarea";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLayerStore } from "../store/layer-store";
import { isVariableReference } from "../utils/variable-resolver";
import { Link, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "../store/editor-store";
import { Card, CardContent } from "@/components/ui/card";

export const classNameFieldOverrides: FieldConfigFunction = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layer,
  allowBinding = false
) => {
  return {
    fieldType: ({
      label,
      isRequired,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
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
          <ChildrenSearchableSelect
            layer={layer}
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

export const iconNameFieldOverrides: FieldConfigFunction = (layer) => {
  return {
    fieldType: ({
      label,
      isRequired,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
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

export const childrenAsTextareaFieldOverrides: FieldConfigFunction = (
  layer
) => {
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

export const childrenAsTipTapFieldOverrides: FieldConfigFunction = (layer) => {
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
          <MinimalTiptapEditor
            immediatelyRender={false}
            output="markdown"
            editable={true}
            value={layer.children as string}
            editorClassName="focus:outline-none px-4 py-2 h-full"
            onChange={(content) => {
              console.log({ content });
              //if string call field.onChange
              if (typeof content === "string") {
                field.onChange(content);
              } else {
                console.warn("Tiptap content is not a string");
              }
            }}
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

export const commonFieldOverrides = (allowBinding = false) => {
  return {
    className: (layer: ComponentLayer) => classNameFieldOverrides(layer, allowBinding),
    children: (layer: ComponentLayer) => childrenFieldOverrides(layer, allowBinding),
  };
};

export const textInputFieldOverrides: FieldConfigFunction = (layer, allowBinding = false) => {
  return {
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
      <FormFieldWithVariableBinding
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
        allowVariableBinding={allowBinding}
        propName={field.name}
      >
        <Input
          value={field.value as string}
          onChange={field.onChange}
          {...fieldProps}
        />
      </FormFieldWithVariableBinding>
    ),
  };
};

/**
 * Combined component that provides form field wrapper with optional variable binding
 */
export function FormFieldWithVariableBinding({
  label,
  isRequired,
  fieldConfigItem,
  children,
  allowVariableBinding = false,
  propName,
}: {
  label: string;
  isRequired?: boolean;
  fieldConfigItem?: { description?: React.ReactNode };
  children: React.ReactNode;
  allowVariableBinding?: boolean;
  propName?: string;
}) {
  const {
    variables,
    bindPropToVariable,
    unbindPropFromVariable,
    selectedLayerId,
    findLayerById,
  } = useLayerStore();
  const selectedLayer = findLayerById(selectedLayerId);

  const incrementRevision = useEditorStore((state) => state.incrementRevision);

  // If variable binding is not allowed or no propName provided, just render the form wrapper
  if (!allowVariableBinding || !propName || !selectedLayer) {
    return (
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>{children}</FormControl>
        {fieldConfigItem?.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    );
  }

  const currentValue = selectedLayer.props[propName];
  const isCurrentlyBound = isVariableReference(currentValue);
  const boundVariable = isCurrentlyBound
    ? variables.find((v) => v.id === currentValue.__variableRef)
    : null;

  const handleBindToVariable = (variableId: string) => {
    bindPropToVariable(selectedLayer.id, propName, variableId);
  };

  const handleUnbind = () => {
    // Use the new unbind function which sets default value from schema
    unbindPropFromVariable(selectedLayer.id, propName);
    incrementRevision();
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>
        {label}
        {isRequired && <span className="text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <div className="flex items-center gap-2">
            {!isCurrentlyBound && <div className="flex-1">{children}</div>}
            {isCurrentlyBound && boundVariable && (
              <Card className="w-full">
                <CardContent className="py-1 px-4">
                  <div className="flex items-center gap-2 w-full">
                    <Link className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 ">
                        <span className="font-medium">
                          {boundVariable.name}
                        </span>
                        <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                          {boundVariable.type}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {String(boundVariable.defaultValue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex-shrink-0">
              {isCurrentlyBound && boundVariable ? (
                // Bound state - show unbind button
                <Tooltip>
                  <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleUnbind}
                  className="px-3"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                </Button>
                </TooltipTrigger>
                <TooltipContent>Unbind Variable</TooltipContent>
                </Tooltip>
              ) : (
                // Unbound state - show dropdown to bind variables
                <DropdownMenu>
                  <Tooltip>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="px-3">
                          <Link className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <TooltipContent>Bind to Variable</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                      Bind to Variable
                    </div>
                    {variables.length > 0 ? (
                      variables.map((variable) => (
                        <DropdownMenuItem
                          key={variable.id}
                          onClick={() => handleBindToVariable(variable.id)}
                          className="flex flex-col items-start p-3"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Link className="h-4 w-4 flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 ">
                                <span className="font-medium">
                                  {variable.name}
                                </span>
                                <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                                  {variable.type}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground truncate">
                                {String(variable.defaultValue)}
                              </span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No variables defined
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </FormControl>
      {fieldConfigItem?.description && (
        <FormDescription>{fieldConfigItem.description}</FormDescription>
      )}
    </FormItem>
  );
}
