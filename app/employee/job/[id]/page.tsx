"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, DollarSign, MapPin, Clock, Calendar, MessageSquare, Briefcase } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"
import type { Job } from "@/lib/database-types"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      // For now, we'll get all jobs and find the specific one
      // In a real app, you'd have a getJobById method
      const { data: jobs, error: jobsError } = await JobsService.getAvailableJobs()
      
      if (jobsError) {
        setError(jobsError)
        return
      }

      const foundJob = jobs?.find(j => j.id === jobId)
      if (!foundJob) {
        setError("Job not found")
        return
      }

      setJob(foundJob)
    } catch (err) {
      console.error('Error fetching job details:', err)
      setError("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!job) return

    setApplying(true)
    try {
      const { success, error: applyError } = await JobsService.applyForJob(job.id, message)
      
      if (success) {
        alert("Application submitted successfully!")
        router.push("/employee/browse-jobs")
      } else {
        alert(`Failed to apply: ${applyError}`)
      }
    } catch (err) {
      console.error('Error applying for job:', err)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Job not found"}
          </h1>
          <Button onClick={() => router.push("/employee/browse-jobs")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          onClick={() => router.push("/employee/browse-jobs")} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400 mb-2">
                  <Briefcase className="h-6 w-6 inline mr-2" />
                  {job.title}
                </CardTitle>
                <CardDescription className="text-base">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Job Details */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-lg">{job.pay}</span>
              </div>
              
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-base">{job.location}</span>
                </div>
              )}
              
              {job.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-base">{job.duration}</span>
                </div>
              )}

              {/* Available Dates */}
              {(job as any).available_dates && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-base">{(job as any).available_dates}</span>
                </div>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Job Description
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
                
                {/* Available Dates in Description */}
                {(job as any).available_dates && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          Available Dates:
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {(job as any).available_dates.includes(' to ') || (job as any).available_dates.includes(' - ') 
                            ? `This job can be scheduled on any date between ${(job as any).available_dates}. Contact the employer to arrange the specific timing that works best for both of you.`
                            : `This job is scheduled for ${(job as any).available_dates}. Please confirm your availability for this specific date when applying.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Apply for this Job
            </CardTitle>
            <CardDescription>
              Add a personal message to your application (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the employer why you're interested in this job, your relevant experience, or any questions you have..."
                  rows={4}
                  disabled={applying}
                />
              </div>

              <Button 
                onClick={handleApply}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={applying}
                size="lg"
              >
                {applying ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 