"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar as CalendarIcon, DollarSign, Clock, Filter, X, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import SmartLocationFilter from "./smart-location-filter"
import TagFilter from "./ui/tag-filter"
import type { Job } from "@/lib/database-types"

export interface JobFilters {
  dateRange?: DateRange
  minPay?: number
  maxPay?: number
  duration?: string
  location?: string
  userLocation?: { name: string; coordinates: [number, number] }
  maxDistance?: number
  tags?: string[]
}

interface JobFiltersProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  onClearFilters: () => void
  jobs?: Job[]
}

export default function JobFilters({ filters, onFiltersChange, onClearFilters, jobs = [] }: JobFiltersProps) {
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [localMinPay, setLocalMinPay] = useState(filters.minPay?.toString() || "")
  const [localMaxPay, setLocalMaxPay] = useState(filters.maxPay?.toString() || "")
  const [localLocation, setLocalLocation] = useState(filters.location || "")
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Duration options
  const durationOptions = [
    { value: "any", label: "Any Duration" },
    { value: "1 hour", label: "1 Hour" },
    { value: "2 hours", label: "2 Hours" },
    { value: "3 hours", label: "3 Hours" },
    { value: "4 hours", label: "4 Hours" },
    { value: "half day", label: "Half Day" },
    { value: "full day", label: "Full Day" },
    { value: "multiple days", label: "Multiple Days" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ]

  const handleDateSelect = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: range
    })
  }

  const handlePayChange = () => {
    // Clear any previous error
    setPaymentError(null)
    
    const minPay = localMinPay ? parseFloat(localMinPay) : undefined
    const maxPay = localMaxPay ? parseFloat(localMaxPay) : undefined
    
    // Validate that max is not smaller than min
    if (minPay !== undefined && maxPay !== undefined && maxPay < minPay) {
      setPaymentError("Maximum payment cannot be smaller than minimum payment")
      return
    }
    
    onFiltersChange({
      ...filters,
      minPay: minPay && !isNaN(minPay) ? minPay : undefined,
      maxPay: maxPay && !isNaN(maxPay) ? maxPay : undefined
    })
  }

  const handleDurationChange = (value: string) => {
    onFiltersChange({
      ...filters,
      duration: value === "any" ? undefined : value
    })
  }

  const handleLocationChange = () => {
    onFiltersChange({
      ...filters,
      location: localLocation || undefined
    })
  }

  const handleUserLocationChange = (userLocation?: { name: string; coordinates: [number, number] }) => {
    onFiltersChange({
      ...filters,
      userLocation
    })
  }

  const handleDistanceChange = (distance?: number) => {
    onFiltersChange({
      ...filters,
      maxDistance: distance
    })
  }

  const handleClearAll = () => {
    // Reset local states
    setLocalMinPay("")
    setLocalMaxPay("")
    setLocalLocation("")
    setPaymentError(null)
    // Clear filters
    onClearFilters()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange?.from) count++
    if (filters.minPay || filters.maxPay) count++
    if (filters.duration) count++
    if (filters.location) count++
    if (filters.userLocation && filters.maxDistance) count++
    if (filters.tags && filters.tags.length > 0) count++
    return count
  }

  const getDateDisplayText = () => {
    if (!filters.dateRange?.from) return "Select dates"
    if (!filters.dateRange.to) return format(filters.dateRange.from, "MMM dd, yyyy")
    return `${format(filters.dateRange.from, "MMM dd")} - ${format(filters.dateRange.to, "MMM dd, yyyy")}`
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Available Dates
            </Label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDateDisplayText()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  numberOfMonths={2}
                  initialFocus
                />
                <div className="p-3 border-t flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDateSelect(undefined)}
                  >
                    Clear
                  </Button>
                  <Button size="sm" onClick={() => setIsDateOpen(false)}>
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Range
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Min $"
                value={localMinPay}
                onChange={(e) => setLocalMinPay(e.target.value)}
                onBlur={handlePayChange}
                onKeyDown={(e) => e.key === 'Enter' && handlePayChange()}
                type="number"
                min="0"
                step="1"
                className="w-full"
              />
              <Input
                placeholder="Max $"
                value={localMaxPay}
                onChange={(e) => setLocalMaxPay(e.target.value)}
                onBlur={handlePayChange}
                onKeyDown={(e) => e.key === 'Enter' && handlePayChange()}
                type="number"
                min="0"
                step="1"
                className="w-full"
              />
            </div>
            {paymentError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{paymentError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Duration Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <Select value={filters.duration || "any"} onValueChange={handleDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Any Duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Smart Location Filter */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <SmartLocationFilter
              value={filters.location}
              userLocation={filters.userLocation}
              maxDistance={filters.maxDistance}
              jobs={jobs}
              onChange={(location) => onFiltersChange({ ...filters, location })}
              onUserLocationChange={handleUserLocationChange}
              onDistanceChange={handleDistanceChange}
            />
          </div>

          {/* Tag Filter */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <TagFilter
              selectedTags={filters.tags || []}
              onChange={(tags) => onFiltersChange({ ...filters, tags: tags.length > 0 ? tags : undefined })}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
                             {filters.dateRange?.from && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Dates: {getDateDisplayText()}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDateSelect(undefined)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
                             {(filters.minPay || filters.maxPay) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Pay: ${filters.minPay || 0} - ${filters.maxPay || '∞'}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLocalMinPay("")
                      setLocalMaxPay("")
                      onFiltersChange({ ...filters, minPay: undefined, maxPay: undefined })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
                             {filters.duration && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Duration: {filters.duration}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDurationChange("any")
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
                             {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLocalLocation("")
                      onFiltersChange({ ...filters, location: undefined })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
                             {filters.userLocation && filters.maxDistance && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Within {filters.maxDistance}km of {filters.userLocation.name}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFiltersChange({ ...filters, userLocation: undefined, maxDistance: undefined })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
                             {filters.tags && filters.tags.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tags: {filters.tags.join(', ')}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFiltersChange({ ...filters, tags: undefined })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 