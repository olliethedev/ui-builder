import React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ChildrenSearchableSelect } from "@/components/ui/ui-builder/internal/form-fields/children-searchable-select";
import {
  AutoFormInputComponentProps,
  ComponentLayer,
  FieldConfigFunction,
} from "@/components/ui/ui-builder/types";
import IconNameField from "@/components/ui/ui-builder/internal/form-fields/iconname-field";
import { Textarea } from "@/components/ui/textarea";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLayerStore } from "../store/layer-store";
import { isVariableReference } from "../utils/variable-resolver";
import { Link, LockKeyhole, Unlink } from "lucide-react";
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
import BreakpointClassNameControl from "@/components/ui/ui-builder/internal/form-fields/classname-control";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const classNameFieldOverrides: FieldConfigFunction = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layer,
) => {
  return {
    fieldType: ({
      label,
      isRequired,
      field,
      fieldConfigItem,
    }: AutoFormInputComponentProps) => (
      <FormFieldWrapper
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
      >
        <BreakpointClassNameControl
          value={field.value}
          onChange={field.onChange}
        />
      </FormFieldWrapper>
    ),
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const childrenFieldOverrides: FieldConfigFunction = (
  layer,
) => {
  return {
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
      <FormFieldWrapper
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
      >
        <ChildrenSearchableSelect
          layer={layer}
          onChange={field.onChange}
          {...fieldProps}
        />
      </FormFieldWrapper>
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
      <FormFieldWrapper
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
      >
        <Textarea
          value={layer.children as string}
          onChange={field.onChange}
          {...fieldProps}
        />
      </FormFieldWrapper>
    ),
  };
};

export const childrenAsTipTapFieldOverrides: FieldConfigFunction = (
  layer,
) => {
  return {
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
      <FormFieldWrapper
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
      >
        <MinimalTiptapEditor
          immediatelyRender={false}
          output="markdown"
          editable={true}
          value={layer.children as string}
          editorClassName="focus:outline-none px-4 py-2 h-full"
          // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
          onChange={(content) => {
            //if string call field.onChange
            if (typeof content === "string") {
              field.onChange(content);
            } else {
              console.warn("Tiptap content is not a string");
            }
          }}
          {...fieldProps}
        />
      </FormFieldWrapper>
    ),
  };
};

// Memoized common field overrides to avoid recreating objects
const memoizedCommonFieldOverrides = new Map<boolean, Record<string, FieldConfigFunction>>();

export const commonFieldOverrides = (allowBinding = false) => {
  if (memoizedCommonFieldOverrides.has(allowBinding)) {
    return memoizedCommonFieldOverrides.get(allowBinding)!;
  }
  
  const overrides = {
    className: (layer: ComponentLayer) => classNameFieldOverrides(layer),
    children: (layer: ComponentLayer) => childrenFieldOverrides(layer),
  };
  
  memoizedCommonFieldOverrides.set(allowBinding, overrides);
  return overrides;
};

export const commonVariableRenderParentOverrides = (propName: string) => {
  return {
    renderParent: ({ children }: { children: React.ReactNode }) => (
      <VariableBindingWrapper propName={propName}>{children}</VariableBindingWrapper>
    ),
  };
};

export const textInputFieldOverrides = (
  layer: ComponentLayer,
  allowVariableBinding = false,
  propName: string
) => {
  return {
    renderParent: allowVariableBinding
      ? ({ children }: { children: React.ReactNode }) => (
          <VariableBindingWrapper propName={propName}>
            {children}
          </VariableBindingWrapper>
        )
      : undefined,
    fieldType: ({
      label,
      isRequired,
      fieldConfigItem,
      field,
      fieldProps,
    }: AutoFormInputComponentProps) => (
      <FormFieldWrapper
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
      >
        <Input
          value={field.value as string}
          // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
          onChange={(e) => field.onChange(e.target.value)}
          {...fieldProps}
        />
      </FormFieldWrapper>
    ),
  };
};

export function VariableBindingWrapper({
  propName,
  children,
}: {
  propName: string;
  children: React.ReactNode;
}) {
  const variables = useLayerStore((state) => state.variables);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const isBindingImmutable = useLayerStore((state) => state.isBindingImmutable);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);
  const unbindPropFromVariable = useLayerStore(
    (state) => state.unbindPropFromVariable
  );
  const bindPropToVariable = useLayerStore((state) => state.bindPropToVariable);

  const selectedLayer = findLayerById(selectedLayerId);

  // If variable binding is not allowed or no propName provided, just render the form wrapper
  if (!selectedLayer) {
    return <>{children}</>;
  }

  const currentValue = selectedLayer.props[propName];
  const isCurrentlyBound = isVariableReference(currentValue);
  const boundVariable = isCurrentlyBound
    ? variables.find((v) => v.id === currentValue.__variableRef)
    : null;
  const isImmutable = isBindingImmutable(selectedLayer.id, propName);

  const handleBindToVariable = (variableId: string) => {
    bindPropToVariable(selectedLayer.id, propName, variableId);
    incrementRevision();
  };

  // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
  const handleUnbind = () => {
    // Use the new unbind function which sets default value from schema
    unbindPropFromVariable(selectedLayer.id, propName);
    incrementRevision();
  };

  return (
    <div className="flex w-full gap-2 items-end">
      {isCurrentlyBound && boundVariable ? (
        // Bound state - show variable info and unbind button
        <div className="flex flex-col gap-2 w-full">
          <Label>{propName.charAt(0).toUpperCase() + propName.slice(1)}</Label>
          <div className="flex items-end gap-2 w-full">
            <Card className="w-full">
              <CardContent className="py-1 px-4">
                <div className="flex items-center gap-2 w-full">
                  <Link className="h-4 w-4 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium">{boundVariable.name}</span>
                      <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                        {boundVariable.type}
                      </span>
                      {isImmutable && (
                        <Badge data-testid="immutable-badge" className="rounded">
                          <LockKeyhole strokeWidth={3} className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {String(boundVariable.defaultValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {!isImmutable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleUnbind}
                    className="px-3 h-10"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unbind Variable</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      ) : (
        // Unbound state - show normal field with bind button
        <>
          <div className="flex-1">{children}</div>
          <div className="flex justify-end">
            <DropdownMenu>
              <Tooltip>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3 h-10">
                      <Link className="h-4 w-4 my-1" />
                    </Button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent>Bind Variable</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                  Bind to Variable
                </div>
                {variables.length > 0 ? (
                  variables.map((variable) => (
                    <DropdownMenuItem
                      key={variable.id}
                      // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                      onClick={() => handleBindToVariable(variable.id)}
                      className="flex flex-col items-start p-3"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Link className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 ">
                            <span className="font-medium">{variable.name}</span>
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
          </div>
        </>
      )}
    </div>
  );
}

export function FormFieldWrapper({
  label,
  isRequired,
  fieldConfigItem,
  children,
}: {
  label: string;
  isRequired?: boolean;
  fieldConfigItem?: { description?: React.ReactNode };
  children: React.ReactNode;
}) {
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
