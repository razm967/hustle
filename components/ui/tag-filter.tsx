"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Tag, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { JOB_TAGS } from "./tag-selector"

interface TagFilterProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  className?: string
}

export default function TagFilter({
  selectedTags,
  onChange,
  disabled = false,
  className
}: TagFilterProps) {
  const [showAllTags, setShowAllTags] = useState(false)

  const handleTagToggle = (tag: string) => {
    if (disabled) return
    
    if (selectedTags.includes(tag)) {
      // Remove tag
      onChange(selectedTags.filter(t => t !== tag))
    } else {
      // Add tag
      onChange([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (disabled) return
    onChange(selectedTags.filter(t => t !== tag))
  }

  const handleClearAll = () => {
    if (disabled) return
    onChange([])
  }

  const getDisplayTags = () => {
    if (showAllTags) return JOB_TAGS
    // Show commonly searched tags first
    const popularTags = [
      "No Experience", "Teen Friendly", "Flexible Hours", "Physical Work",
      "Customer Service", "Indoor", "Outdoor", "One-Time", "Weekend Work",
      "Food Service", "Retail", "Tutoring", "Pet Care", "Remote"
    ]
    return popularTags
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Filter by Tags
        </Label>
        <div className="flex gap-2">
          {selectedTags.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear Tags
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
            disabled={disabled}
            className="text-xs"
          >
            {showAllTags ? 'Show Popular' : 'Show All'}
          </Button>
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Filters:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700"
              >
                <Filter className="h-3 w-3" />
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {showAllTags ? 'All Tags:' : 'Popular Tags:'}
        </Label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {getDisplayTags().map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "secondary"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedTags.includes(tag) 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "hover:bg-gray-300 dark:hover:bg-gray-600",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <span className="ml-1">✓</span>
              )}
            </Badge>
          ))}
        </div>
      </div>

      {selectedTags.length > 0 && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Showing jobs that match {selectedTags.length === 1 ? 'this tag' : 'any of these tags'}
        </p>
      )}
    </div>
  )
} 