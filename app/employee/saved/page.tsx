"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, MapPin, Clock, Calendar, ArrowRight, Tag, Bookmark, BookmarkCheck, CheckCircle, Clock as ClockIcon, XCircle, Filter, Briefcase, Star, Timer, CheckSquare, CircleDot, Award, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { JobsService } from "@/lib/jobs-service"
import type { JobWithStatus } from "@/lib/database-types"
import { useFeedback } from "@/components/ui/feedback"

export default function SavedJobsPage() {
  const router = useRouter()
  const { showSuccess, showError } = useFeedback()
  
  const [savedJobs, setSavedJobs] = useState<JobWithStatus[]>([])
  const [appliedJobs, setAppliedJobs] = useState<JobWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [savingJobId, setSavingJobId] = useState<string | null>(null)
  const [applicationFilter, setApplicationFilter] = useState<string>("all")
  
  // Job completion state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [completingJob, setCompletingJob] = useState(false)

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
      showSuccess("Job removed from bookmarks", "Bookmark Removed")
      // Refresh the saved jobs list
      loadJobs()
    } catch (error) {
      console.error('Error unsaving job:', error)
    } finally {
      setSavingJobId(null)
    }
  }

  // Job completion handlers
  const handleCompleteJob = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedJobId(jobId)
    setShowCompleteDialog(true)
  }

  const confirmCompleteJob = async () => {
    if (!selectedJobId) return
    
    setCompletingJob(true)
    try {
      const { success, error } = await JobsService.completeJob(selectedJobId)
      
      if (success) {
        showSuccess('Job marked as completed successfully!', 'Success')
        
        // Add a small delay to ensure database update is complete
        setTimeout(async () => {
          await loadJobs()
        }, 500)
        
        setShowCompleteDialog(false)
        setSelectedJobId(null)
      } else {
        showError(`Error completing job: ${error}`, 'Error')
      }
    } catch (err) {
      console.error('Error completing job:', err)
      showError('An unexpected error occurred', 'Error')
    } finally {
      setCompletingJob(false)
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
              {job.status === 'completed' ? (
                <>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Job Completed
                  </Badge>
                  {job.is_rated && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Rated
                    </Badge>
                  )}
                </>
              ) : job.application_status === 'applied' && job.application_result && (
                <>
                  {job.application_result === 'pending' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                      <Timer className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {(job.application_result === 'accepted' || job.status === 'in_progress') && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Accepted
                    </Badge>
                  )}
                  {job.application_result === 'rejected' && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Applied on {new Date(job.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Complete Job Button for accepted applications - only show if job is not completed */}
            {job.application_result === 'accepted' && job.status !== 'completed' && (
              <Button
                onClick={(e) => handleCompleteJob(e, job.id)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                title="Mark job as completed"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            
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
          
          {/* Employer Information */}
          {job.employer_name && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{job.employer_name}</span>
            </div>
          )}
          
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

  // Count applications by status
  const pendingCount = appliedJobs.filter(job => job.application_result === 'pending').length
  const acceptedCount = appliedJobs.filter(job => job.application_result === 'accepted' || job.status === 'in_progress').length
  const rejectedCount = appliedJobs.filter(job => job.application_result === 'rejected').length
  const completedCount = appliedJobs.filter(job => job.status === 'completed').length
  const ratedCount = appliedJobs.filter(job => job.is_rated).length

  // Filter applied jobs by application status
  const getFilteredAppliedJobs = () => {
    switch (applicationFilter) {
      case "pending":
        return appliedJobs.filter(job => job.application_result === 'pending')
      case "accepted":
        return appliedJobs.filter(job => job.application_result === 'accepted' || job.status === 'in_progress')
      case "rejected":
        return appliedJobs.filter(job => job.application_result === 'rejected')
      case "completed":
        return appliedJobs.filter(job => job.status === 'completed')
      case "rated":
        return appliedJobs.filter(job => job.is_rated)
      default:
        return appliedJobs
    }
  }

  const filteredAppliedJobs = getFilteredAppliedJobs()

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Jobs ({savedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="applied" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            My Applications ({appliedJobs.length})
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Applications
                </h2>
                {/* Compact Stats */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-gray-100">
                    <CircleDot className="h-3 w-3 mr-1" />
                    <span className="font-semibold">{appliedJobs.length}</span> Total
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    <Timer className="h-3 w-3 mr-1" />
                    <span className="font-semibold">{pendingCount}</span> Pending
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckSquare className="h-3 w-3 mr-1" />
                    <span className="font-semibold">{acceptedCount}</span> Accepted
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <XCircle className="h-3 w-3 mr-1" />
                    <span className="font-semibold">{rejectedCount}</span> Rejected
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <Award className="h-3 w-3 mr-1" />
                    <span className="font-semibold">{completedCount}</span> Completed
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    <Star className="h-3 w-3 mr-1" />
                    <span className="font-semibold">{ratedCount}</span> Rated
                  </Badge>
                </div>
              </div>
              
              {/* Application Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={applicationFilter} onValueChange={setApplicationFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4" />
                        All Applications ({appliedJobs.length})
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-purple-500" />
                        Pending ({pendingCount})
                      </div>
                    </SelectItem>
                    <SelectItem value="accepted">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        Accepted ({acceptedCount})
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Rejected ({rejectedCount})
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        Completed ({completedCount})
                      </div>
                    </SelectItem>
                    <SelectItem value="rated">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Rated ({ratedCount})
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Cards */}
            {filteredAppliedJobs.length === 0 ? (
              renderEmptyState(
                applicationFilter === "all" ? "No Applications Yet" : 
                applicationFilter === "pending" ? "No Pending Applications" :
                applicationFilter === "accepted" ? "No Accepted Applications" :
                applicationFilter === "rejected" ? "No Rejected Applications" :
                "No Rated Jobs",
                applicationFilter === "all" ? "Jobs you've applied to will appear here. Start applying to opportunities!" :
                applicationFilter === "pending" ? "Applications that are pending review will appear here." :
                applicationFilter === "accepted" ? "Applications that have been accepted will appear here." :
                applicationFilter === "rejected" ? "Applications that have been rejected will appear here." :
                "Jobs that you've rated will appear here."
              )
            ) : (
              <div className="grid gap-4">
                {filteredAppliedJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Complete Job Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this job as completed? This will notify the employer and they may rate your performance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCompleteDialog(false)}
              disabled={completingJob}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmCompleteJob}
              disabled={completingJob}
              className="bg-green-600 hover:bg-green-700"
            >
              {completingJob ? "Completing..." : "Yes, Complete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 