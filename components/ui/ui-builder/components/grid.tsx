import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const gridVariants = cva(
  "grid",
  {
    variants: {
      columns: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        7: "grid-cols-7",
        8: "grid-cols-8",
        auto: "grid-cols-auto",
      },
      autoRows: {
        none: "auto-rows-none",
        min: "auto-rows-min",
        max: "auto-rows-max",
        fr: "auto-rows-fr",
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
      gap: {
        0: "gap-0",
        1: "gap-1",
        2: "gap-2",
        4: "gap-4",
        8: "gap-8",
      },
      templateRows: {
        none: "grid-rows-none",
        1: "grid-rows-1",
        2: "grid-rows-2",
        3: "grid-rows-3",
        4: "grid-rows-4",
        5: "grid-rows-5",
        6: "grid-rows-6",
      },
    },
    defaultVariants: {
      columns: 1,
      autoRows: "none",
      justify: "start",
      align: "start",
      gap: 0,
      templateRows: "none",
    },
  }
)

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns, autoRows, justify, align, gap, templateRows, ...props }, ref) => {
    return (
      <div
        className={cn(
          gridVariants({
            columns,
            autoRows,
            justify,
            align,
            gap,
            templateRows,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

export { Grid, gridVariants }