"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Briefcase, FileText, MapPin } from "lucide-react"
import PaymentInput from "@/components/ui/payment-input"
import DateSelection from "@/components/ui/date-selection"
import DurationInput from "@/components/ui/duration-input"
import { JobsService, type CreateJobData } from "@/lib/jobs-service"
import type { Job } from "@/lib/database-types"

interface JobPostFormProps {
  onJobPost?: (job: Job) => void
}

// Form data interface
interface JobFormData {
  title: string
  description: string
  location: string
  pay: string
  duration: string
  available_dates: string
}

export default function JobPostForm({ onJobPost }: JobPostFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    pay: "",
    duration: "",
    available_dates: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    // Simple validation
    if (!formData.title || !formData.description || !formData.pay) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare job data for database
      const jobData: CreateJobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        pay: formData.pay,
        duration: formData.duration || undefined,
        available_dates: formData.available_dates || undefined
      }

      // Save job to database
      const { data: newJob, error: jobError } = await JobsService.createJob(jobData)

      if (jobError) {
        setError(jobError)
        setIsSubmitting(false)
        return
      }

      if (newJob) {
        // Call the callback if provided
        if (onJobPost) {
          onJobPost(newJob)
        }

        // Reset form
        setFormData({
          title: "",
          description: "",
          location: "",
          pay: "",
          duration: "",
          available_dates: ""
        })

        alert("Job posted successfully!")
      }
    } catch (err) {
      console.error('Error posting job:', err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePaymentChange = (value: string) => {
    setFormData({
      ...formData,
      pay: value
    })
  }

  const handleDurationChange = (value: string) => {
    setFormData({
      ...formData,
      duration: value
    })
  }

  const handleDateChange = (value: string) => {
    setFormData({
      ...formData,
      available_dates: value
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>
          Fill out the details below to post a job for teen workers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Lawn Mowing, Dog Walking, Tutoring"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what needs to be done, any requirements, etc."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Downtown, Near School, Remote"
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Input */}
          <PaymentInput
            value={formData.pay}
            onChange={handlePaymentChange}
            disabled={isSubmitting}
            required
          />

          {/* Duration Input */}
          <DurationInput
            value={formData.duration}
            onChange={handleDurationChange}
            disabled={isSubmitting}
          />

          {/* Date Selection */}
          <DateSelection
            value={formData.available_dates || ""}
            onChange={handleDateChange}
            disabled={isSubmitting}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Posting Job..." : "Post Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 