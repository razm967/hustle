"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, MapPin, Clock, Calendar, ArrowRight, Tag, Bookmark, BookmarkCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { JobsService } from "@/lib/jobs-service"
import type { JobWithStatus } from "@/lib/database-types"

interface JobListingsProps {
  jobs: JobWithStatus[]
  onJobSaved?: () => void // Callback to refresh data when a job is saved/unsaved
}

export default function JobListings({ jobs, onJobSaved }: JobListingsProps) {
  const router = useRouter()
  const [savingJobId, setSavingJobId] = useState<string | null>(null)

  const handleViewJob = (jobId: string) => {
    router.push(`/employee/job/${jobId}`)
  }

  const handleSaveJob = async (e: React.MouseEvent, jobId: string, isSaved: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setSavingJobId(jobId)

    try {
      if (isSaved) {
        await JobsService.unsaveJob(jobId)
      } else {
        await JobsService.saveJob(jobId)
      }
      
      // Call the callback to refresh data
      if (onJobSaved) {
        onJobSaved()
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
    } finally {
      setSavingJobId(null)
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Jobs Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for new opportunities!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Available Jobs ({jobs.length})
      </h2>
      
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="relative hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleViewJob(job.id)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
                    {job.title}
                    {/* Application Status Badge */}
                    {job.application_status === 'applied' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        Applied
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
                  {/* Save/Unsave Button */}
                  <Button
                    type="button"
                    onClick={(e) => handleSaveJob(e, job.id, job.is_saved || false)}
                    variant="ghost"
                    size="icon"
                    disabled={savingJobId === job.id}
                    className="h-8 w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  >
                    {job.is_saved ? (
                      <BookmarkCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
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

                {/* Available Dates */}
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
        ))}
      </div>
    </div>
  )
} 