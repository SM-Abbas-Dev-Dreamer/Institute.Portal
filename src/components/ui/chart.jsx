"use client"

import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ChartContainer({ config, children }) {
  return (
    <div className="w-full h-full relative" data-config={JSON.stringify(config)}>
      {children}
    </div>
  )
}

export function ChartTooltip({ content, cursor = true, ...props }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <g {...props}>{cursor && <rect fill="transparent" />}</g>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ChartTooltipContent({ hideLabel, label, value }) {
  return (
    <div className="text-sm">
      {!hideLabel && label && <div className="font-medium">{label}</div>}
      <div>{value}</div>
    </div>
  )
}
