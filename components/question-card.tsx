"use client"

import { cn } from "@/lib/utils"
import type { TestOption } from "@/lib/test-questions"

interface QuestionCardProps {
  option: TestOption
  isSelected: boolean
  onSelect: () => void
}

export function QuestionCard({ option, isSelected, onSelect }: QuestionCardProps) {
  const Icon = option.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
        isSelected
          ? "border-foreground bg-secondary shadow-md"
          : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
          isSelected ? "bg-foreground text-background" : "bg-secondary text-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {option.label}
      </span>
    </button>
  )
}
