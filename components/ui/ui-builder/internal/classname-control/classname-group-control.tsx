import { CONFIG, ConfigItem, StateType } from "@/components/ui/ui-builder/internal/classname-control/config";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

type ClassNameGroupControlProps = {
    groupConfig: ConfigItem;
    group: {
      label: string;
      keys: string[];
    };
    state: StateType;
    handleStateChange: (
      key: keyof StateType,
      value: string | string[] | null
    ) => void;
    handleGroupKeySelect: (groupLabel: string, key: string) => void;
    selectedKey: string | string[] | null;
  };
  
  export function ClassNameGroupControl({
    groupConfig,
    group,
    state,
    handleStateChange,
    handleGroupKeySelect,
    selectedKey,
  }: ClassNameGroupControlProps) {
    return (
      <>
        <span className="text-xs font-medium text-muted-foreground">
          {group.label}
        </span>
        <div className="flex flex-row">
          <div>
            <groupConfig.component
              {...groupConfig}
              {...("multiple" in groupConfig
                ? { multiple: groupConfig.multiple }
                : {})}
              hideLabel={true}
              value={state[selectedKey as keyof StateType]}
              onChange={(value: string | string[] | null) =>
                handleStateChange(selectedKey as keyof StateType, value)
              }
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-xs px-2 py-1">
                <MoreVertical className="!size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {group.keys.map((key) => (
                <DropdownMenuItem
                  key={String(key)}
                  onClick={() => handleGroupKeySelect(group.label, String(key))}
                  className={
                    selectedKey === String(key)
                      ? "bg-secondary-foreground/10"
                      : ""
                  }
                >
                  {CONFIG[String(key)].label || String(key)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }