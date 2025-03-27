import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    fill?: string
  }
>(({ className, value, max = 100, fill, ...props }, ref) => {
  const percentage = value != null ? Math.min(Math.max(0, value), max) / max * 100 : 0

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-0 flex-1 transition-all",
          fill ? fill : "bg-primary"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
