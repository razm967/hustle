"use client"

import { useState, useEffect, useMemo } from "react"
import JobListings from "@/components/job-listings"
import JobFilters from "@/components/job-filters"
import type { JobFilters as JobFiltersType } from "@/components/job-filters"
import { JobsService } from "@/lib/jobs-service"
import { filterJobs, getFilterSummary } from "@/lib/job-filter-utils"
import type { JobWithStatus } from "@/lib/database-types"

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFiltersType>({})

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, filters)
  }, [jobs, filters])

  // Handle filter changes
  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({})
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: jobsError } = await JobsService.getAvailableJobs()
      
      if (jobsError) {
        setError(jobsError)
        return
      }

      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError("Failed to load jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Callback for when a job is saved/unsaved to refresh the data
  const handleJobSaved = () => {
    fetchJobs()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchJobs}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect job opportunity for you
          </p>
        </div>

        {/* Filters */}
        <JobFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          jobs={jobs}
        />

        {/* Filter Summary */}
        {Object.keys(filters).some(key => filters[key as keyof JobFiltersType] !== undefined) && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {getFilterSummary(filters)} • Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}

        {/* Job Listings */}
        <JobListings jobs={filteredJobs} onJobSaved={handleJobSaved} />
      </div>
    </div>
  )
} 