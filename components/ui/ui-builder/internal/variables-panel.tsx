"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { Variable } from "@/components/ui/ui-builder/types";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";

const EMPTY_OBJECT = {};

interface VariablesPanelProps {
  className?: string;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  className,
}) => {
  const { variables, addVariable, updateVariable, removeVariable } =
    useLayerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);
  const allowVariableEditing = useEditorStore((state) => state.allowVariableEditing);

  const handleAddVariable = useCallback(
    (name: string, type: Variable["type"], defaultValue: any) => {
      addVariable(name, type, defaultValue);
      incrementRevision();
    },
    [addVariable, incrementRevision]
  );

  const handleSetIsAdding = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleSetIsNotAdding = useCallback(() => {
    setIsAdding(false);
  }, []);

  const handleOnSave = useCallback(
    (id: string, updates: Partial<Omit<Variable, "id">>) => {
      updateVariable(id, updates);
      setEditingId(null);
    },
    [updateVariable]
  );

  const handleOnCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleOnDelete = useCallback(
    (id: string) => {
      removeVariable(id);
      incrementRevision();
    },
    [removeVariable, incrementRevision]
  );

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variables</h3>
        {allowVariableEditing && (
          <Button size="sm" onClick={handleSetIsAdding} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
        )}
      </div>

      {isAdding && allowVariableEditing && (
        <AddVariableForm
          onSave={handleAddVariable}
          onCancel={handleSetIsNotAdding}
        />
      )}

      <div className="space-y-2">
        {variables.map((variable) => (
          <VariableCard
            key={variable.id}
            variable={variable}
            isEditing={editingId === variable.id}
            onEdit={setEditingId}
            onSave={handleOnSave}
            onCancel={handleOnCancel}
            onDelete={handleOnDelete}
            editVariables={allowVariableEditing}
          />
        ))}
      </div>

      {variables.length === 0 && !isAdding && (
        <div className="text-center text-muted-foreground py-8">
          {allowVariableEditing
            ? 'No variables defined. Click "Add Variable" to create one.'
            : "No variables defined."}
        </div>
      )}
    </div>
  );
};

interface AddVariableFormProps {
  onSave: (name: string, type: Variable["type"], defaultValue: any) => void;
  onCancel: () => void;
}

const AddVariableForm: React.FC<AddVariableFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<Variable["type"]>("string");
  const [defaultValue, setDefaultValue] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    defaultValue?: string;
  }>(EMPTY_OBJECT);

  const validateForm = useCallback(() => {
    const newErrors: { name?: string; defaultValue?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!defaultValue.trim()) {
      newErrors.defaultValue = "Preview value is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, defaultValue]);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    let parsedValue: any = defaultValue;
    try {
      if (type === "number") {
        parsedValue = parseFloat(defaultValue) || 0;
      } else if (type === "boolean") {
        parsedValue = defaultValue.toLowerCase() === "true";
      }
    } catch (e) {
      console.warn("Error parsing variable value, keeping as string", e);
    }

    onSave(name, type, parsedValue);
  }, [name, type, defaultValue, onSave, validateForm]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
    },
    [errors.name]
  );

  const handleTypeChange = useCallback(
    (value: string) => setType(value as Variable["type"]),
    []
  );

  const handleDefaultValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDefaultValue(e.target.value);
      if (errors.defaultValue)
        setErrors((prev) => ({ ...prev, defaultValue: undefined }));
    },
    [errors.defaultValue]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Add New Variable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="var-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="var-name"
            value={name}
            onChange={handleNameChange}
            placeholder="variableName"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="var-type">Type</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="var-default">
            Preview Value <span className="text-red-500">*</span>
          </Label>
          <Input
            id="var-default"
            value={defaultValue}
            onChange={handleDefaultValueChange}
            placeholder={getPlaceholderForType(type)}
            className={errors.defaultValue ? "border-red-500" : ""}
          />
          {errors.defaultValue && (
            <p className="text-sm text-red-500 mt-1">{errors.defaultValue}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface VariableCardProps {
  variable: Variable;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (id: string, updates: Partial<Omit<Variable, "id">>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  editVariables: boolean;
}

const VariableCard: React.FC<VariableCardProps> = ({
  variable,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  editVariables,
}) => {
  const [name, setName] = useState(variable.name);
  const [type, setType] = useState(variable.type);
  const [defaultValue, setDefaultValue] = useState(
    String(variable.defaultValue)
  );
  const [errors, setErrors] = useState<{
    name?: string;
    defaultValue?: string;
  }>(EMPTY_OBJECT);

  const validateForm = useCallback(() => {
    const newErrors: { name?: string; defaultValue?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!defaultValue.trim()) {
      newErrors.defaultValue = "Preview value is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, defaultValue]);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    let parsedValue: any = defaultValue;
    try {
      if (type === "number") {
        parsedValue = parseFloat(defaultValue) || 0;
      } else if (type === "boolean") {
        parsedValue = defaultValue.toLowerCase() === "true";
      }
    } catch (e) {
      console.warn("Error parsing variable value, keeping as string", e);
    }

    onSave(variable.id, { name, type, defaultValue: parsedValue });
  }, [name, type, defaultValue, onSave, validateForm, variable.id]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
    },
    [errors.name]
  );

  const handleTypeChange = useCallback(
    (value: string) => setType(value as Variable["type"]),
    []
  );

  const handleDefaultValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDefaultValue(e.target.value);
      if (errors.defaultValue)
        setErrors((prev) => ({ ...prev, defaultValue: undefined }));
    },
    [errors.defaultValue]
  );

  const handleOnEdit = useCallback(() => {
    onEdit(variable.id);
  }, [onEdit, variable.id]);

  const handleOnDelete = useCallback(() => {
    onDelete(variable.id);
  }, [onDelete, variable.id]);

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div>
            <Label htmlFor={`edit-name-${variable.id}`}>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`edit-name-${variable.id}`}
              value={name}
              onChange={handleNameChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`edit-type-${variable.id}`}>Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`edit-default-${variable.id}`}>
              Preview Value <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`edit-default-${variable.id}`}
              value={defaultValue}
              onChange={handleDefaultValueChange}
              placeholder={getPlaceholderForType(type)}
              className={errors.defaultValue ? "border-red-500" : ""}
            />
            {errors.defaultValue && (
              <p className="text-sm text-red-500 mt-1">{errors.defaultValue}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{variable.name}</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {variable.type}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {String(variable.defaultValue)}
            </div>
          </div>
          {editVariables && (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleOnEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleOnDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function getPlaceholderForType(type: Variable["type"]): string {
  switch (type) {
    case "string":
      return "Enter text...";
    case "number":
      return "0";
    case "boolean":
      return "true";
    default:
      return "";
  }
}
