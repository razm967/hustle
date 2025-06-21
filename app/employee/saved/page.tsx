"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, MapPin, Clock, Calendar, ArrowRight, Tag, Bookmark, BookmarkCheck, CheckCircle, Clock as ClockIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { JobsService } from "@/lib/jobs-service"
import type { JobWithStatus } from "@/lib/database-types"

export default function SavedJobsPage() {
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<JobWithStatus[]>([])
  const [appliedJobs, setAppliedJobs] = useState<JobWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [savingJobId, setSavingJobId] = useState<string | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const [savedResult, appliedResult] = await Promise.all([
        JobsService.getSavedJobs(),
        JobsService.getAppliedJobs()
      ])

      if (savedResult.data) {
        setSavedJobs(savedResult.data)
      }

      if (appliedResult.data) {
        setAppliedJobs(appliedResult.data)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewJob = (jobId: string) => {
    router.push(`/employee/job/${jobId}`)
  }

  const handleUnsaveJob = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSavingJobId(jobId)

    try {
      await JobsService.unsaveJob(jobId)
      // Refresh the saved jobs list
      loadJobs()
    } catch (error) {
      console.error('Error unsaving job:', error)
    } finally {
      setSavingJobId(null)
    }
  }

  const renderJobCard = (job: JobWithStatus, showUnsaveButton = false) => (
    <Card key={job.id} className="relative hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleViewJob(job.id)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
              {job.title}
              {/* Status Badges */}
              {job.application_status === 'applied' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                  Applied
                </Badge>
              )}
              {job.status === 'completed' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {job.status === 'in_progress' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {job.status}
            </Badge>
            {/* Unsave Button for saved jobs */}
            {showUnsaveButton && (
              <Button
                type="button"
                onClick={(e) => handleUnsaveJob(e, job.id)}
                variant="ghost"
                size="icon"
                disabled={savingJobId === job.id}
                className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Remove from saved"
              >
                <BookmarkCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
          {job.description}
        </p>
        
        {/* Job Details */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium">{job.pay}</span>
          </div>
          
          {job.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{job.location}</span>
            </div>
          )}
          
          {job.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{job.duration}</span>
            </div>
          )}

          {job.available_dates && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span>{job.available_dates}</span>
            </div>
          )}
        </div>

        {/* Job Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* View Details Arrow */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              handleViewJob(job.id)
            }}
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
          >
            <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: '24px', height: '24px' }} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmptyState = (title: string, description: string) => (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )

  // Filter applied jobs by status
  const pendingJobs = appliedJobs.filter(job => job.status === 'open')
  const inProgressJobs = appliedJobs.filter(job => job.status === 'in_progress')
  const completedJobs = appliedJobs.filter(job => job.status === 'completed')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading your jobs...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Jobs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your saved and applied jobs
        </p>
      </div>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved ({savedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="applied" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Applied ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Progress ({inProgressJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Saved Jobs ({savedJobs.length})
            </h2>
            {savedJobs.length === 0 ? (
              renderEmptyState(
                "No Saved Jobs", 
                "Jobs you save will appear here. Start browsing to find opportunities!"
              )
            ) : (
              <div className="grid gap-4">
                {savedJobs.map((job) => renderJobCard(job, true))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applied" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Applied Jobs ({pendingJobs.length})
            </h2>
            {pendingJobs.length === 0 ? (
              renderEmptyState(
                "No Applied Jobs", 
                "Jobs you've applied to will appear here. Start applying to opportunities!"
              )
            ) : (
              <div className="grid gap-4">
                {pendingJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Jobs In Progress ({inProgressJobs.length})
            </h2>
            {inProgressJobs.length === 0 ? (
              renderEmptyState(
                "No Jobs In Progress", 
                "Jobs that are currently being worked on will appear here."
              )
            ) : (
              <div className="grid gap-4">
                {inProgressJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Completed Jobs ({completedJobs.length})
            </h2>
            {completedJobs.length === 0 ? (
              renderEmptyState(
                "No Completed Jobs", 
                "Jobs you've completed will appear here."
              )
            ) : (
              <div className="grid gap-4">
                {completedJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 