"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Tag, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// Predefined job tags
export const JOB_TAGS = [
  // Work Type
  "Physical Work", "Mental Work", "Creative Work", "Technical Work",
  
  // Skills Required
  "No Experience", "Basic Skills", "Specialized Skills", "Language Skills",
  
  // Work Environment
  "Indoor", "Outdoor", "Remote", "Customer Service",
  
  // Time Commitment
  "Flexible Hours", "Weekend Work", "Evening Work", "One-Time",
  
  // Industry
  "Retail", "Food Service", "Tutoring", "Pet Care", "Cleaning", 
  "Gardening", "Delivery", "Tech Support", "Babysitting", "Events",
  
  // Requirements
  "Own Transportation", "Team Work", "Independent", "Lifting Required",
  
  // Age Appropriate
  "Teen Friendly", "Summer Job", "After School", "Holiday Work"
] as const

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  className?: string
}

export default function TagSelector({
  selectedTags,
  onChange,
  disabled = false,
  className
}: TagSelectorProps) {
  const [showAllTags, setShowAllTags] = useState(false)

  // Group tags by category for better organization
  const tagCategories = {
    "Work Type": ["Physical Work", "Mental Work", "Creative Work", "Technical Work"],
    "Experience": ["No Experience", "Basic Skills", "Specialized Skills", "Language Skills"],
    "Environment": ["Indoor", "Outdoor", "Remote", "Customer Service"],
    "Schedule": ["Flexible Hours", "Weekend Work", "Evening Work", "One-Time"],
    "Industry": ["Retail", "Food Service", "Tutoring", "Pet Care", "Cleaning", "Gardening", "Delivery", "Tech Support", "Babysitting", "Events"],
    "Requirements": ["Own Transportation", "Team Work", "Independent", "Lifting Required"],
    "Teen Jobs": ["Teen Friendly", "Summer Job", "After School", "Holiday Work"]
  }

  const handleTagToggle = (tag: string) => {
    if (disabled) return
    
    if (selectedTags.includes(tag)) {
      // Remove tag
      onChange(selectedTags.filter(t => t !== tag))
    } else {
      // Add tag (limit to 8 tags)
      if (selectedTags.length < 8) {
        onChange([...selectedTags, tag])
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (disabled) return
    onChange(selectedTags.filter(t => t !== tag))
  }

  const getDisplayTags = () => {
    if (showAllTags) return JOB_TAGS
    // Show commonly used tags first
    const commonTags = [
      "No Experience", "Teen Friendly", "Flexible Hours", "Physical Work",
      "Customer Service", "Indoor", "Outdoor", "One-Time", "Weekend Work",
      "Food Service", "Retail", "Tutoring", "Pet Care", "Cleaning"
    ]
    return commonTags
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Job Tags
          <span className="text-xs text-gray-500">
            ({selectedTags.length}/8 selected)
          </span>
        </Label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select tags that describe this job to help employees find it easier
        </p>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Tags:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="flex items-center gap-1 px-3 py-1"
              >
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Available Tags:
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
            disabled={disabled}
            className="text-xs"
          >
            {showAllTags ? 'Show Common' : 'Show All'}
            <Plus className={cn("h-3 w-3 ml-1 transition-transform", showAllTags && "rotate-45")} />
          </Button>
        </div>

        {showAllTags ? (
          // Categorized view for all tags
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(tagCategories).map(([category, tags]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 border-b pb-1">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTags.includes(tag) 
                          ? "bg-green-600 hover:bg-green-700" 
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
            ))}
          </div>
        ) : (
          // Simple grid view for common tags
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {getDisplayTags().map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedTags.includes(tag) 
                    ? "bg-green-600 hover:bg-green-700" 
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
        )}
      </div>

      {/* Tag limit warning */}
      {selectedTags.length >= 8 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Maximum of 8 tags reached. Remove a tag to add a new one.
        </p>
      )}
    </div>
  )
} 