import React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ChildrenSearchableSelect } from "@/components/ui/ui-builder/internal/form-fields/children-searchable-select";
import type {
  AutoFormInputComponentProps,
  ComponentLayer,
  FieldConfigFunction,
  Variable,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const childrenAsTextareaFieldOverrides = (
  layer: ComponentLayer,
  allowVariableBinding = false
) => {
  return {
    renderParent: allowVariableBinding
      ? ({ children }: { children: React.ReactNode }) => (
          <ChildrenVariableBindingWrapper>
            {children}
          </ChildrenVariableBindingWrapper>
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
        <Textarea
          value={typeof layer.children === 'string' ? layer.children : ''}
          onChange={field.onChange}
          {...fieldProps}
        />
      </FormFieldWrapper>
    ),
  };
};

export const childrenAsTipTapFieldOverrides = (
  layer: ComponentLayer,
  allowVariableBinding = false
) => {
  return {
    renderParent: allowVariableBinding
      ? ({ children }: { children: React.ReactNode }) => (
          <ChildrenVariableBindingWrapper>
            {children}
          </ChildrenVariableBindingWrapper>
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
        <MinimalTiptapEditor
          immediatelyRender={false}
          output="markdown"
          editable={true}
          value={typeof layer.children === 'string' ? layer.children : ''}
          editorClassName="focus:outline-none px-4 py-2 h-full"
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

/**
 * Component for function props that shows a dropdown of all functions
 * from the function registry, with optional variable binding.
 */
function FunctionPropField({
  propName,
  label,
  isRequired,
  fieldConfigItem,
}: {
  propName: string;
  label: string;
  isRequired?: boolean;
  fieldConfigItem?: { description?: React.ReactNode };
}) {
  const variables = useLayerStore((state) => state.variables);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const isBindingImmutable = useLayerStore((state) => state.isBindingImmutable);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);
  const functionRegistry = useEditorStore((state) => state.functionRegistry);
  const unbindPropFromVariable = useLayerStore(
    (state) => state.unbindPropFromVariable
  );
  const bindPropToVariable = useLayerStore((state) => state.bindPropToVariable);

  const selectedLayer = findLayerById(selectedLayerId);

  if (!selectedLayer || !functionRegistry) {
    return (
      <FormFieldWrapper
        label={label}
        isRequired={isRequired}
        fieldConfigItem={fieldConfigItem}
      >
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="No function registry available" />
          </SelectTrigger>
        </Select>
      </FormFieldWrapper>
    );
  }

  // Get function-type variables for binding option
  const functionVariables = variables.filter((v) => v.type === 'function');

  const currentValue = selectedLayer.props[propName];
  const isCurrentlyBound = isVariableReference(currentValue);
  const boundVariable = isCurrentlyBound
    ? variables.find((v) => v.id === currentValue.__variableRef)
    : null;
  const isImmutable = isBindingImmutable(selectedLayer.id, propName);

  // Get the function registry entries as array
  const functionEntries = Object.entries(functionRegistry);

  // Get the current selected function ID (from direct binding or via variable)
  const getCurrentFunctionId = (): string => {
    if (isCurrentlyBound && boundVariable) {
      // It's bound to a variable - get the function ID from the variable
      return `var:${boundVariable.id}`;
    }
    // Check if there's a direct function reference stored in props
    // Direct function binding stores the function ID directly
    const directFuncId = selectedLayer.props[`__function_${propName}`];
    if (typeof directFuncId === 'string') {
      return `func:${directFuncId}`;
    }
    return '';
  };

  const handleValueChange = (value: string) => {
    if (value === '__none__') {
      // Clear the function
      unbindPropFromVariable(selectedLayer.id, propName);
      // Also remove any direct function binding
      const newProps = { ...selectedLayer.props };
      delete newProps[`__function_${propName}`];
      delete newProps[propName];
      updateLayer(selectedLayer.id, newProps);
      incrementRevision();
      return;
    }

    if (value.startsWith('var:')) {
      // Bind to a function-type variable
      const variableId = value.replace('var:', '');
      bindPropToVariable(selectedLayer.id, propName, variableId);
      // Remove direct function binding if any
      const newProps = { ...selectedLayer.props };
      delete newProps[`__function_${propName}`];
      updateLayer(selectedLayer.id, newProps);
      incrementRevision();
    } else if (value.startsWith('func:')) {
      // Direct function binding from registry
      const funcId = value.replace('func:', '');
      const funcDef = functionRegistry[funcId];
      if (funcDef) {
        // Store the function ID for code generation and store the actual function
        unbindPropFromVariable(selectedLayer.id, propName);
        updateLayer(selectedLayer.id, { 
          ...selectedLayer.props, 
          [propName]: funcDef.fn,
          [`__function_${propName}`]: funcId 
        });
        incrementRevision();
      }
    }
  };

  const currentFunctionId = getCurrentFunctionId();

  // Get display text for current selection
  const getDisplayText = () => {
    if (currentFunctionId.startsWith('var:')) {
      const varId = currentFunctionId.replace('var:', '');
      const variable = variables.find((v) => v.id === varId);
      if (variable) {
        const funcId = String(variable.defaultValue);
        const funcDef = functionRegistry[funcId];
        return `📎 ${variable.name} → ${funcDef?.name || funcId}`;
      }
    } else if (currentFunctionId.startsWith('func:')) {
      const funcId = currentFunctionId.replace('func:', '');
      const funcDef = functionRegistry[funcId];
      return funcDef?.name || funcId;
    }
    return 'Select a function...';
  };

  return (
    <FormFieldWrapper
      label={label}
      isRequired={isRequired}
      fieldConfigItem={fieldConfigItem}
    >
      <div className="flex gap-2 items-center">
        <Select
          value={currentFunctionId}
          onValueChange={handleValueChange}
          disabled={isImmutable}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a function...">
              {getDisplayText()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {/* Option to clear */}
            <SelectItem value="__none__">
              <span className="text-muted-foreground">None (clear)</span>
            </SelectItem>

            {/* Direct functions from registry */}
            {functionEntries.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Functions
                </div>
                {functionEntries.map(([id, funcDef]) => (
                  <SelectItem key={`func:${id}`} value={`func:${id}`}>
                    <div className="flex flex-col">
                      <span>{funcDef.name}</span>
                      {funcDef.description && (
                        <span className="text-xs text-muted-foreground">
                          {funcDef.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </>
            )}

            {/* Function-type variables */}
            {functionVariables.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-1">
                  Function Variables
                </div>
                {functionVariables.map((variable) => {
                  const funcId = String(variable.defaultValue);
                  const funcDef = functionRegistry[funcId];
                  return (
                    <SelectItem key={`var:${variable.id}`} value={`var:${variable.id}`}>
                      <div className="flex items-center gap-2">
                        <Link className="h-3 w-3" />
                        <div className="flex flex-col">
                          <span>{variable.name}</span>
                          <span className="text-xs text-muted-foreground">
                            → {funcDef?.name || funcId}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </>
            )}
          </SelectContent>
        </Select>
        {isImmutable && (
          <Badge data-testid="immutable-badge" className="rounded shrink-0">
            <LockKeyhole strokeWidth={3} className="w-3 h-3" />
          </Badge>
        )}
      </div>
    </FormFieldWrapper>
  );
}

/**
 * Field override for function props (onClick, onSubmit, etc.)
 * Shows a dropdown to select directly from functionRegistry,
 * with optional variable binding for function-type variables.
 */
export const functionPropFieldOverrides = (propName: string): ReturnType<FieldConfigFunction> => {
  return {
    fieldType: (props: AutoFormInputComponentProps) => (
      <FunctionPropField propName={propName} {...props} />
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
  isFunctionProp = false,
}: {
  propName: string;
  children: React.ReactNode;
  /** Set to true when binding to function props (onClick, onSubmit, etc.) */
  isFunctionProp?: boolean;
}) {
  const variables = useLayerStore((state) => state.variables);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const isBindingImmutable = useLayerStore((state) => state.isBindingImmutable);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);
  const functionRegistry = useEditorStore((state) => state.functionRegistry);
  const unbindPropFromVariable = useLayerStore(
    (state) => state.unbindPropFromVariable
  );
  const bindPropToVariable = useLayerStore((state) => state.bindPropToVariable);

  const selectedLayer = findLayerById(selectedLayerId);

  // If variable binding is not allowed or no propName provided, just render the form wrapper
  if (!selectedLayer) {
    return <>{children}</>;
  }

  // Filter variables based on prop type
  // Function props should only show function-type variables
  // Non-function props should show non-function variables
  const filteredVariables = variables.filter((v) => 
    isFunctionProp ? v.type === 'function' : v.type !== 'function'
  );

  const currentValue = selectedLayer.props[propName];
  const isCurrentlyBound = isVariableReference(currentValue);
  const boundVariable = isCurrentlyBound
    ? variables.find((v) => v.id === currentValue.__variableRef)
    : null;
  const isImmutable = isBindingImmutable(selectedLayer.id, propName);

  // Get function display name for function-type variables
  const getFunctionDisplayValue = (variable: Variable) => {
    if (variable.type === 'function' && functionRegistry) {
      const funcId = String(variable.defaultValue);
      const funcDef = functionRegistry[funcId];
      return funcDef ? funcDef.name : funcId;
    }
    return String(variable.defaultValue);
  };

  const handleBindToVariable = (variableId: string) => {
    bindPropToVariable(selectedLayer.id, propName, variableId);
    incrementRevision();
  };

  const handleUnbind = () => {
    // Use the new unbind function which sets default value from schema
    unbindPropFromVariable(selectedLayer.id, propName);
    incrementRevision();
  };

  const emptyMessage = isFunctionProp 
    ? "No function variables defined" 
    : "No variables defined";

  const bindLabel = isFunctionProp 
    ? "Bind to Function Variable" 
    : "Bind to Variable";

  const tooltipLabel = isFunctionProp 
    ? "Bind Function" 
    : "Bind Variable";

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
                      {getFunctionDisplayValue(boundVariable)}
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
                <TooltipContent>{tooltipLabel}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                  {bindLabel}
                </div>
                {filteredVariables.length > 0 ? (
                  filteredVariables.map((variable) => (
                    <DropdownMenuItem
                      key={variable.id}
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
                            {getFunctionDisplayValue(variable)}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {emptyMessage}
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

/**
 * Wrapper component for children variable binding.
 * Similar to VariableBindingWrapper but specifically for layer.children.
 */
export function ChildrenVariableBindingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const variables = useLayerStore((state) => state.variables);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const isChildrenBindingImmutable = useLayerStore((state) => state.isChildrenBindingImmutable);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);
  const unbindChildrenFromVariable = useLayerStore(
    (state) => state.unbindChildrenFromVariable
  );
  const bindChildrenToVariable = useLayerStore((state) => state.bindChildrenToVariable);

  const selectedLayer = findLayerById(selectedLayerId);

  if (!selectedLayer) {
    return <>{children}</>;
  }

  const currentValue = selectedLayer.children;
  const isCurrentlyBound = isVariableReference(currentValue);
  const boundVariable = isCurrentlyBound
    ? variables.find((v) => v.id === currentValue.__variableRef)
    : null;
  const isImmutable = isChildrenBindingImmutable(selectedLayer.id);

  const handleBindToVariable = (variableId: string) => {
    bindChildrenToVariable(selectedLayer.id, variableId);
    incrementRevision();
  };

  const handleUnbind = () => {
    unbindChildrenFromVariable(selectedLayer.id);
    incrementRevision();
  };

  return (
    <div className="flex w-full gap-2 items-end">
      {isCurrentlyBound && boundVariable ? (
        // Bound state - show variable info and unbind button
        <div className="flex flex-col gap-2 w-full">
          <Label>Children</Label>
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
                        <Badge data-testid="immutable-children-badge" className="rounded">
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
                <TooltipContent>Bind Children to Variable</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                  Bind Children to Variable
                </div>
                {variables.filter(v => v.type === 'string').length > 0 ? (
                  variables
                    .filter(v => v.type === 'string')
                    .map((variable) => (
                      <DropdownMenuItem
                        key={variable.id}
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
                    No string variables defined
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
