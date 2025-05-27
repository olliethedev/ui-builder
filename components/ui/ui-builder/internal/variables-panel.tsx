"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { useLayerStore, Variable } from "@/lib/ui-builder/store/layer-store";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";

interface VariablesPanelProps {
  className?: string;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({ className }) => {
  const { variables, addVariable, updateVariable, removeVariable } = useLayerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);

  const handleRemoveVariable = (id: string) => {
    removeVariable(id);
    incrementRevision();
  };

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variables</h3>
        <Button
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variable
        </Button>
      </div>

      {isAdding && (
        <AddVariableForm
          onSave={(name, type, defaultValue) => {
            addVariable(name, type, defaultValue);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      <div className="space-y-2">
        {variables.map((variable) => (
          <VariableCard
            key={variable.id}
            variable={variable}
            isEditing={editingId === variable.id}
            onEdit={() => setEditingId(variable.id)}
            onSave={(updates) => {
              updateVariable(variable.id, updates);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
            onDelete={() => handleRemoveVariable(variable.id)}
          />
        ))}
      </div>

      {variables.length === 0 && !isAdding && (
        <div className="text-center text-muted-foreground py-8">
          No variables defined. Click &quot;Add Variable&quot; to create one.
        </div>
      )}
    </div>
  );
};

interface AddVariableFormProps {
  onSave: (name: string, type: Variable['type'], defaultValue: any) => void;
  onCancel: () => void;
}

const AddVariableForm: React.FC<AddVariableFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<Variable['type']>("string");
  const [defaultValue, setDefaultValue] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    
    let parsedValue: any = defaultValue;
    try {
      if (type === "number") {
        parsedValue = parseFloat(defaultValue) || 0;
      } else if (type === "boolean") {
        parsedValue = defaultValue.toLowerCase() === "true";
      } else if (type === "object" || type === "array") {
        parsedValue = JSON.parse(defaultValue || (type === "array" ? "[]" : "{}"));
      }
    } catch (e) {
      // Keep as string if parsing fails
    }

    onSave(name, type, parsedValue);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Add New Variable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="var-name">Name</Label>
          <Input
            id="var-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="variableName"
          />
        </div>
        
        <div>
          <Label htmlFor="var-type">Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as Variable['type'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="var-default">Default Value</Label>
          <Input
            id="var-default"
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder={getPlaceholderForType(type)}
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
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
  onEdit: () => void;
  onSave: (updates: Partial<Omit<Variable, 'id'>>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const VariableCard: React.FC<VariableCardProps> = ({
  variable,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [name, setName] = useState(variable.name);
  const [type, setType] = useState(variable.type);
  const [defaultValue, setDefaultValue] = useState(
    typeof variable.defaultValue === "object" 
      ? JSON.stringify(variable.defaultValue, null, 2)
      : String(variable.defaultValue)
  );

  const handleSave = () => {
    let parsedValue: any = defaultValue;
    try {
      if (type === "number") {
        parsedValue = parseFloat(defaultValue) || 0;
      } else if (type === "boolean") {
        parsedValue = defaultValue.toLowerCase() === "true";
      } else if (type === "object" || type === "array") {
        parsedValue = JSON.parse(defaultValue || (type === "array" ? "[]" : "{}"));
      }
    } catch (e) {
      // Keep as string if parsing fails
    }

    onSave({ name, type, defaultValue: parsedValue });
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div>
            <Label htmlFor={`edit-name-${variable.id}`}>Name</Label>
            <Input
              id={`edit-name-${variable.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor={`edit-type-${variable.id}`}>Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as Variable['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`edit-default-${variable.id}`}>Default Value</Label>
            <Input
              id={`edit-default-${variable.id}`}
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder={getPlaceholderForType(type)}
            />
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
              <span className="text-xs bg-muted px-2 py-1 rounded">{variable.type}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {typeof variable.defaultValue === "object" 
                ? JSON.stringify(variable.defaultValue)
                : String(variable.defaultValue)
              }
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getPlaceholderForType(type: Variable['type']): string {
  switch (type) {
    case "string":
      return "Enter text...";
    case "number":
      return "0";
    case "boolean":
      return "true";
    case "object":
      return "{}";
    case "array":
      return "[]";
    default:
      return "";
  }
} 