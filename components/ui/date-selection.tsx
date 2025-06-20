"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface DateSelectionProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

export default function DateSelection({ value, onChange, disabled, required }: DateSelectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState<"single" | "range">("single")
  
  // Parse existing value to extract dates
  const parseValue = (val: string) => {
    if (!val) return { single: undefined, range: { from: undefined, to: undefined } }
    
    // Check if it's a range (contains "to" or "-")
    if (val.includes(" to ") || val.includes(" - ")) {
      const parts = val.split(/ to | - /)
      if (parts.length === 2) {
        try {
          const from = new Date(parts[0])
          const to = new Date(parts[1])
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            return { 
              single: undefined, 
              range: { from, to } 
            }
          }
        } catch (e) {
          // Fall back to single date parsing
        }
      }
    }
    
    // Try to parse as single date
    try {
      const date = new Date(val)
      if (!isNaN(date.getTime())) {
        return { 
          single: date, 
          range: { from: undefined, to: undefined } 
        }
      }
    } catch (e) {
      // Invalid date
    }
    
    return { single: undefined, range: { from: undefined, to: undefined } }
  }

  const { single: initialSingle, range: initialRange } = parseValue(value)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSingle)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    initialRange.from && initialRange.to ? initialRange : undefined
  )

  const updateValue = (date?: Date, range?: DateRange) => {
    if (selectionMode === "single" && date) {
      const formatted = format(date, "MMM dd, yyyy")
      onChange(formatted)
    } else if (selectionMode === "range" && range?.from) {
      if (range.to) {
        const formatted = `${format(range.from, "MMM dd, yyyy")} to ${format(range.to, "MMM dd, yyyy")}`
        onChange(formatted)
      } else {
        const formatted = format(range.from, "MMM dd, yyyy")
        onChange(formatted)
      }
    } else {
      onChange("")
    }
  }

  const handleSingleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    updateValue(date, undefined)
  }

  const handleRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    updateValue(undefined, range)
  }

  const handleModeToggle = (mode: "single" | "range") => {
    setSelectionMode(mode)
    if (mode === "single") {
      setSelectedRange(undefined)
      if (selectedDate) {
        updateValue(selectedDate, undefined)
      } else {
        onChange("")
      }
    } else {
      setSelectedDate(undefined)
      if (selectedRange) {
        updateValue(undefined, selectedRange)
      } else {
        onChange("")
      }
    }
  }

  const clearSelection = () => {
    setSelectedDate(undefined)
    setSelectedRange(undefined)
    onChange("")
  }

  const getDisplayText = () => {
    if (!value) return "Select date(s)"
    return value
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4" />
        Available Dates {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="flex gap-2">
                <Button
                  variant={selectionMode === "single" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeToggle("single")}
                >
                  Single Date
                </Button>
                <Button
                  variant={selectionMode === "range" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeToggle("range")}
                >
                  Date Range
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectionMode === "single" 
                  ? "Select a specific date" 
                  : "Select a range of possible dates"
                }
              </p>
            </div>
            
            {selectionMode === "single" ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSingleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            ) : (
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={handleRangeSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                numberOfMonths={2}
              />
            )}
            
            <div className="p-3 border-t flex justify-between">
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {value && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearSelection}
            disabled={disabled}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Preview/Help Text */}
      {value && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectionMode === "single" 
            ? "Job available on this specific date" 
            : "Job can be scheduled on any of these dates"
          }
        </div>
      )}
    </div>
  )
} 