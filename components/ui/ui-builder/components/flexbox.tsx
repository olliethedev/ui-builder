import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const flexboxVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        column: "flex-col",
        rowReverse: "flex-row-reverse",
        columnReverse: "flex-col-reverse",
      },
      justify: {
        start: "justify-start",
        end: "justify-end",
        center: "justify-center",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      align: {
        start: "items-start",
        end: "items-end",
        center: "items-center",
        baseline: "items-baseline",
        stretch: "items-stretch",
      },
      wrap: {
        nowrap: "flex-nowrap",
        wrap: "flex-wrap",
        wrapReverse: "flex-wrap-reverse",
      },
      gap: {
        0: "gap-0",
        1: "gap-1",
        2: "gap-2",
        4: "gap-4",
        8: "gap-8",
      },
    },
    defaultVariants: {
      direction: "row",
      justify: "start",
      align: "start",
      wrap: "nowrap",
      gap: 0,
    },
  }
)

export interface FlexboxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexboxVariants> {}

const Flexbox = React.forwardRef<HTMLDivElement, FlexboxProps>(
  ({ className, direction, justify, align, wrap, gap, ...props }, ref) => {
    return (
      <div
        className={cn(flexboxVariants({ direction, justify, align, wrap, gap, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Flexbox.displayName = "Flexbox"

export { Flexbox, flexboxVariants }