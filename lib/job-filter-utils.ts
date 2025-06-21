import type { Job, JobWithStatus } from "./database-types"
import type { JobFilters } from "@/components/job-filters"
import { isWithinInterval, parseISO } from "date-fns"

/**
 * Filters jobs based on the provided filter criteria
 */
export function filterJobs(jobs: (Job | JobWithStatus)[], filters: JobFilters): (Job | JobWithStatus)[] {
  return jobs.filter(job => {
    // Date filter - check if job's available dates overlap with filter date range
    if (filters.dateRange?.from) {
      if (!job.available_dates) return false
      
      // Parse job's available dates
      const jobDates = parseJobDates(job.available_dates)
      if (!jobDates) return false
      
      const filterStart = filters.dateRange.from
      const filterEnd = filters.dateRange.to || filters.dateRange.from
      
      // Check if there's any overlap between job dates and filter dates
      const hasOverlap = checkDateOverlap(jobDates, { from: filterStart, to: filterEnd })
      if (!hasOverlap) return false
    }
    
    // Payment filter
    if (filters.minPay !== undefined || filters.maxPay !== undefined) {
      const jobPay = parsePayment(job.pay)
      if (jobPay === null) return false
      
      if (filters.minPay !== undefined && jobPay < filters.minPay) return false
      if (filters.maxPay !== undefined && jobPay > filters.maxPay) return false
    }
    
    // Duration filter
    if (filters.duration) {
      if (!job.duration) return false
      
      // Normalize duration strings for comparison
      const normalizedJobDuration = normalizeDuration(job.duration)
      const normalizedFilterDuration = normalizeDuration(filters.duration)
      
      if (normalizedJobDuration !== normalizedFilterDuration) return false
    }
    
    // Location filter
    if (filters.location) {
      if (!job.location) return false
      
      // Smart location matching - split search terms and check if all are found
      const jobLocation = job.location.toLowerCase()
      const filterLocation = filters.location.toLowerCase()
      
      // Split filter into words and remove empty strings
      const searchTerms = filterLocation.split(/[\s,]+/).filter(term => term.length > 0)
      
      // Check if all search terms are found in the job location
      const allTermsFound = searchTerms.every(term => jobLocation.includes(term))
      
      if (!allTermsFound) return false
    }
    
    // Distance filter - check if job is within user's specified radius
    if (filters.userLocation && filters.maxDistance !== undefined) {
      if (!job.latitude || !job.longitude) return false
      
      const distance = calculateDistance(
        filters.userLocation.coordinates,
        [job.longitude, job.latitude]
      )
      
      if (distance > filters.maxDistance) return false
    }
    
    // Tag filter - check if job has any of the selected tags
    if (filters.tags && filters.tags.length > 0) {
      if (!job.tags || job.tags.length === 0) return false
      
      // Check if job has at least one of the selected tags
      const hasMatchingTag = filters.tags.some(filterTag => 
        job.tags!.includes(filterTag)
      )
      
      if (!hasMatchingTag) return false
    }
    
    return true
  })
}

/**
 * Parses job's available_dates string into date range
 */
function parseJobDates(availableDates: string): { from: Date; to: Date } | null {
  try {
    // Handle date ranges (e.g., "Jan 15, 2024 to Jan 20, 2024")
    if (availableDates.includes(' to ') || availableDates.includes(' - ')) {
      const parts = availableDates.split(/ to | - /)
      if (parts.length === 2) {
        const from = new Date(parts[0].trim())
        const to = new Date(parts[1].trim())
        
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
          return { from, to }
        }
      }
    }
    
    // Handle single dates
    const date = new Date(availableDates.trim())
    if (!isNaN(date.getTime())) {
      return { from: date, to: date }
    }
    
    return null
  } catch (error) {
    console.warn('Failed to parse job dates:', availableDates, error)
    return null
  }
}

/**
 * Checks if two date ranges overlap
 */
function checkDateOverlap(
  range1: { from: Date; to: Date },
  range2: { from: Date; to: Date }
): boolean {
  return range1.from <= range2.to && range2.from <= range1.to
}

/**
 * Parses payment string to number
 */
function parsePayment(paymentStr: string): number | null {
  try {
    // Remove currency symbols and extract number
    const cleanedStr = paymentStr.replace(/[$,\s]/g, '')
    
    // Handle hourly rates (e.g., "$15/hour")
    if (cleanedStr.includes('/')) {
      const parts = cleanedStr.split('/')
      const amount = parseFloat(parts[0])
      return !isNaN(amount) ? amount : null
    }
    
    // Handle simple amounts
    const amount = parseFloat(cleanedStr)
    return !isNaN(amount) ? amount : null
  } catch (error) {
    console.warn('Failed to parse payment:', paymentStr, error)
    return null
  }
}

/**
 * Calculate distance between two coordinates in km
 */
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371 // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Normalizes duration strings for comparison
 */
function normalizeDuration(duration: string): string {
  const normalized = duration.toLowerCase().trim()
  
  // Common duration mappings
  const durationMap: Record<string, string> = {
    '1 hr': '1 hour',
    '2 hrs': '2 hours',
    '3 hrs': '3 hours',
    '4 hrs': '4 hours',
    '1h': '1 hour',
    '2h': '2 hours',
    '3h': '3 hours',
    '4h': '4 hours',
    'half-day': 'half day',
    'full-day': 'full day',
    'all day': 'full day',
    '1 day': 'full day',
    'one day': 'full day',
    'week': 'weekly',
    'month': 'monthly'
  }
  
  return durationMap[normalized] || normalized
}

/**
 * Gets filter summary for display
 */
export function getFilterSummary(filters: JobFilters): string {
  const parts: string[] = []
  
  if (filters.dateRange?.from) {
    if (filters.dateRange.to && filters.dateRange.from.getTime() !== filters.dateRange.to.getTime()) {
      parts.push(`dates: ${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`)
    } else {
      parts.push(`date: ${filters.dateRange.from.toLocaleDateString()}`)
    }
  }
  
  if (filters.minPay !== undefined || filters.maxPay !== undefined) {
    if (filters.minPay !== undefined && filters.maxPay !== undefined) {
      parts.push(`pay: $${filters.minPay} - $${filters.maxPay}`)
    } else if (filters.minPay !== undefined) {
      parts.push(`pay: $${filters.minPay}+`)
    } else {
      parts.push(`pay: up to $${filters.maxPay}`)
    }
  }
  
  if (filters.duration) {
    parts.push(`duration: ${filters.duration}`)
  }
  
  if (filters.location) {
    parts.push(`location: ${filters.location}`)
  }
  
  if (filters.userLocation && filters.maxDistance !== undefined) {
    parts.push(`within ${filters.maxDistance}km of ${filters.userLocation.name}`)
  }
  
  if (filters.tags && filters.tags.length > 0) {
    if (filters.tags.length === 1) {
      parts.push(`tag: ${filters.tags[0]}`)
    } else {
      parts.push(`tags: ${filters.tags.join(', ')}`)
    }
  }
  
  return parts.length > 0 ? `Filtered by ${parts.join(', ')}` : ''
} 