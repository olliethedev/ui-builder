import React, { useMemo, useState, useEffect, useCallback } from "react";
import { CONFIG, LAYOUT_GROUPS, LAYOUT_ORDER, StateType } from "@/components/ui/ui-builder/internal/form-fields/classname-control/config";
import { ClassNameGroupControl } from "@/components/ui/ui-builder/internal/form-fields/classname-control/classname-group-control";
import { cn } from "@/lib/utils";
import { isTailwindClass } from "@/components/ui/ui-builder/internal/form-fields/classname-control/utils";

interface ClassNameItemControlProps {
    value: string;
    onChange: (value: string) => void;
}

export function ClassNameItemControl({ value, onChange }: ClassNameItemControlProps) {
    // Memoize parsing for performance
    const parsed = useMemo(() => {
      if (value) {
        const tokens = value.trim().split(/\s+/);
        // Parse all keys
        const parsedState = Object.entries(CONFIG).reduce(
          (acc, [key, config]) => {
            const parsed = tokens.filter((token) => isTailwindClass(config.possibleTypes.filter((type): type is string => type !== null), token));
            if (parsed.length > 0) {
              (acc as any)[key] = config.multiple ? parsed : parsed[0];
            }
            return acc;
          },
          Object.fromEntries(Object.keys(CONFIG).map((k) => [k, null])) as Record<
            string,
            any
          >
        ) as StateType;
        // For each group, only allow one key to be active at a time
        const initialSelected: { [groupLabel: string]: string } = {};
        LAYOUT_GROUPS.forEach((group) => {
          // If multiple keys have values, clear all but the first
          let found = false;
          group.keys.forEach((key) => {
            if (parsedState[key]) {
              if (!found) {
                found = true;
                initialSelected[group.label] = key;
              } else {
                parsedState[key] = null;
              }
            }
          });
          if (!found) initialSelected[group.label] = group.keys[0];
        });
        // Find handled tokens
        const handledTokens = new Set(
          Object.values(parsedState).flatMap((v) =>
            Array.isArray(v) ? v : v ? [v] : []
          )
        );
        const unhandledTokens = tokens.filter(
          (token) => !handledTokens.has(token)
        );
        return {
          parsedState,
          unhandledTokens,
          initialSelected,
        };
      } else {
        // Reset state if value is empty
        const initialSelected: { [groupLabel: string]: string } = {};
        LAYOUT_GROUPS.forEach((group) => {
          initialSelected[group.label] = group.keys[0];
        });
        return {
          parsedState: {} as StateType,
          unhandledTokens: [],
          initialSelected,
        };
      }
    }, [value]);
  
    const [state, setState] = useState<StateType>(parsed.parsedState);
    const [unhandled, setUnhandled] = useState<string[]>(parsed.unhandledTokens);
    const [selectedKeys, setSelectedKeys] = useState<{
      [groupLabel: string]: string;
    }>(parsed.initialSelected);
  
    // Only update state if parsed result changes (deep compare)
    useEffect(() => {
      const stateChanged =
        JSON.stringify(state) !== JSON.stringify(parsed.parsedState);
      const unhandledChanged =
        JSON.stringify(unhandled) !== JSON.stringify(parsed.unhandledTokens);
      const selectedChanged =
        JSON.stringify(selectedKeys) !== JSON.stringify(parsed.initialSelected);
      if (stateChanged) setState(parsed.parsedState);
      if (unhandledChanged) setUnhandled(parsed.unhandledTokens);
      if (selectedChanged) setSelectedKeys(parsed.initialSelected);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsed]);
  
    // Helper to build class string from state and unhandled
    const buildClassString = (
      customState: StateType = state,
      customUnhandled: string[] = unhandled
    ) => {
      const classes: string[] = [];
      for (const key in customState) {
        const value = customState[key as keyof StateType];
        if (value) {
          if (Array.isArray(value)) {
            classes.push(...value);
          } else {
            classes.push(value);
          }
        }
      }
      return [...classes, ...customUnhandled].join(" ").trim();
    };
  
    // Handler for UI changes (toggles, dropdowns, etc.)
    const handleStateChange = useCallback((
      key: keyof StateType,
      value: string | string[] | null
    ) => {
      setState((prev) => {
        const newState = { ...prev, [key]: value };
        // If this key is part of a group, update selectedKeys and clear other keys in the group
        const group = LAYOUT_GROUPS.find((g) => g.keys.includes(key as string));
        if (group) {
          setSelectedKeys((prevSel) => ({
            ...prevSel,
            [group.label]: key as string,
          }));
          // Clear other keys in the group
          group.keys.forEach((k) => {
            if (k !== key) newState[k] = null;
          });
          // Also clear from unhandled
          if (typeof group.clearState === "function") {
            const classesToClear = group.clearState(key as string, newState);
            setUnhandled((prevUnhandled) =>
              prevUnhandled.filter((token) => !classesToClear.includes(token))
            );
          }
        }
  
        // if visibility changes from visible to invisible null the value for that key in the newState
        const layoutOrderItemsInvisible = LAYOUT_ORDER.filter(
          (item) => item.isVisible && !item.isVisible(newState)
        );
        layoutOrderItemsInvisible.forEach((item) => {
          if (item.type === "item") {
            newState[item.key] = null;
          } else if (item.type === "group") {
            const group = LAYOUT_GROUPS.find((g) => g.label === item.label);
            if (group) {
              group.keys.forEach((key) => {
                newState[key] = null;
              });
            }
          }
        });
  
        return newState;
      });
    }, []);
  
    // Helper to create bound change handlers
    const createChangeHandler = useCallback((key: keyof StateType) => 
      (value: string | string[] | null) => handleStateChange(key, value),
      [handleStateChange]
    );
  
    // Handler for group key selection
    const handleGroupKeySelect = (groupLabel: string, key: string) => {
      setSelectedKeys((prev) => ({
        ...prev,
        [groupLabel]: key,
      }));
      const group = LAYOUT_GROUPS.find((g) => g.label === groupLabel);
      if (group) {
        let classesToClear: string[] = [];
        setState((prevState) => {
          const newState = { ...prevState };
          if (typeof group.clearState === "function") {
            classesToClear = group.clearState(key, newState);
          }
          // Remove all classes in classesToClear from state for all keys in the group except the selected one
          for (const k of group.keys) {
            if (k !== key) {
              const config = CONFIG[k];
              if (!config) continue;
              if (config.multiple && Array.isArray(newState[k])) {
                newState[k] = (newState[k] as string[]).filter(
                  (v) => !classesToClear.includes(v as any)
                );
                if (Array.isArray(newState[k]) && newState[k]?.length === 0)
                  newState[k] = null;
              } else if (classesToClear.includes(newState[k] as any)) {
                newState[k] = null;
              }
            }
          }
          // Remove from unhandled synchronously
          setUnhandled((prevUnhandled) =>
            prevUnhandled.filter((token) => !classesToClear.includes(token))
          );
          // Set the selected key's value to null if it was not previously set
          if (!newState[key]) newState[key] = null;
          return newState;
        });
      }
    };
  
    // Call onChange with the new class string after state/unhandled change
    useEffect(() => {
      const classString = buildClassString(state, unhandled);
      if (onChange) onChange(classString);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, unhandled]);
  
    return (
      <div className="w-full" data-testid="classname-item-control">
        <div className="flex flex-wrap gap-y-1 px-4 pt-2 pb-4">
          {LAYOUT_ORDER.map((entry) => {
            if (entry.type === "group") {
              const group = LAYOUT_GROUPS.find((g) => g.label === entry.label);
              if (!group) return null;
              const keys = group.keys.map(String);
              const selectedKey = selectedKeys[group.label] || keys[0];
              if (entry.isVisible && !entry.isVisible(state)) return null;
              const groupConfig = CONFIG[selectedKey as keyof typeof CONFIG];
  
              return (
                <div key={group.label} className={cn("w-full", entry.className)} data-testid={`group-${group.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <ClassNameGroupControl
                    groupConfig={groupConfig}
                    group={group}
                    state={state}
                    handleStateChange={handleStateChange}
                    handleGroupKeySelect={handleGroupKeySelect}
                    selectedKey={selectedKey}
                  />
                </div>
              );
            } else if (entry.type === "item") {
              if (entry.isVisible && !entry.isVisible(state)) return null;
              const configKey = entry.key;
              const ungroupedConfig = CONFIG[configKey];
              return (
                <div key={configKey} className={cn("w-full", entry.className)} data-testid={`item-${configKey}`}>
                  <ungroupedConfig.component
                    {...ungroupedConfig}
                    {...("multiple" in ungroupedConfig
                      ? { multiple: ungroupedConfig.multiple }
                      : {})}
                    value={state[configKey]}
                    onChange={createChangeHandler(configKey)}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }