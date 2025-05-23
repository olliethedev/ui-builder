import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassNameMultiselect from "@/components/ui/ui-builder/internal/classname-multiselect";
import { ClassNameItemControl } from "@/components/ui/ui-builder/internal/classname-control/classname-item-control";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface BreakpointClassNameControlProps {
  onChange?: (classes: string) => void;
  value?: string;
}
export const BreakpointClassNameControl = ({
  onChange,
  value,
}: BreakpointClassNameControlProps) => {
  // Helper to parse classString into base, md, rest
  const parseClassString = (str: string) => {
    const tokens = str.trim().split(/\s+/);
    const base: string[] = [];
    const md: string[] = [];
    const rest: string[] = [];
    for (const token of tokens) {
      if (token.startsWith("md:")) {
        md.push(token.slice(3));
      } else if (token.includes(":")) {
        rest.push(token);
      } else if (token) {
        base.push(token);
      }
    }
    return {
      base: base.join(" "),
      md: md.join(" "),
      rest: rest.join(" "),
    };
  };

  // State for the full class string
  const [classString, setClassString] = useState(value || "");
  // State for the tab
  const [tab, setTab] = useState<"base" | "md">("base");

  // Sync classString with value prop (uncontrolled to controlled fix)
  useEffect(() => {
    if (typeof value === "string" && value !== classString) {
      setClassString(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Parse the class string for the tabs
  const { base, md, rest } = parseClassString(classString);

  // Handlers for each tab
  const handleBaseChange = (newBase: string) => {
    const newClassString = [
      newBase,
      md &&
        md
          .split(" ")
          .map((cls) => `md:${cls}`)
          .join(" "),
      rest,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    setClassString(newClassString);
  };
  const handleMdChange = (newMd: string) => {
    const mdClasses = newMd
      .split(" ")
      .filter(Boolean)
      .map((cls) => `md:${cls}`)
      .join(" ");
    const newClassString = [base, mdClasses, rest]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    setClassString(newClassString);
  };

  // When classString changes, call parent onChange
  useEffect(() => {
    if (onChange) onChange(classString);
  }, [classString, onChange]);

  // When multiselect changes, update classString (and tabs will re-parse)
  const handleMultiselectChange = (newClassString: string) => {
    setClassString(newClassString);
  };

  return (
    <div className="w-full border rounded-lg" data-testid="breakpoint-classname-control">
      <TooltipProvider>
        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "base" | "md")}
          className="w-full"
          data-testid="breakpoint-tabs"
        >
          <TabsList className="w-full grid grid-cols-2" data-testid="breakpoint-tabs-list">
            <TabsTrigger value="base" data-testid="base-tab-trigger">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Base</span>
                </TooltipTrigger>
                <TooltipContent>
                  Base styles for all screen sizes
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="md" data-testid="md-tab-trigger">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Tablet & Desktop</span>
                </TooltipTrigger>
                <TooltipContent>
                  Overrides for screens larger than 768px (md:*)
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-0" value="base" data-testid="base-tab-content">
            <ClassNameItemControl value={base} onChange={handleBaseChange} />
          </TabsContent>
          <TabsContent className="mt-0" value="md" data-testid="md-tab-content">
            <ClassNameItemControl value={md} onChange={handleMdChange} />
          </TabsContent>
        </Tabs>
        <Accordion type="single" collapsible defaultValue="" data-testid="classes-accordion">
          <AccordionItem value="classes" className="border-t border-b-0 px-4" data-testid="classes-accordion-item">
            <AccordionTrigger className="text-sm" data-testid="classes-accordion-trigger">Edit Classes</AccordionTrigger>
            <AccordionContent data-testid="classes-accordion-content">
              <ClassNameMultiselect
                value={classString}
                onChange={handleMultiselectChange}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TooltipProvider>
    </div>
  );
};
