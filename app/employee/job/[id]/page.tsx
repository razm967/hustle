"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, DollarSign, MapPin, Clock, Calendar, MessageSquare, Briefcase, Bookmark, BookmarkCheck, Phone, Mail, MessageCircle } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"
import type { JobWithStatus } from "@/lib/database-types"
import { validateEmployeeProfileForApplication } from "@/lib/profile-validation"
import ProfileCompletionPrompt from "@/components/profile-completion-prompt"
import JobLocationMap from "@/components/ui/job-location-map"
import type { ProfileValidationResult } from "@/lib/profile-validation"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobWithStatus & { employer?: { full_name?: string; email: string; phone?: string; company_name?: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [applying, setApplying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileValidation, setProfileValidation] = useState<ProfileValidationResult | null>(null)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      // Get job details with employer information
      const { data: jobData, error: jobsError } = await JobsService.getJobWithEmployer(jobId)
      
      if (jobsError) {
        setError(jobsError)
        return
      }

      if (!jobData) {
        setError("Job not found")
        return
      }

      setJob(jobData)
    } catch (err) {
      console.error('Error fetching job details:', err)
      setError("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!job) return

    // Check profile completeness before applying
    const validation = await validateEmployeeProfileForApplication()
    if (!validation.isValid) {
      setProfileValidation(validation)
      setShowProfilePrompt(true)
      return
    }

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

  const handleSaveJob = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!job) return

    setSaving(true)
    try {
      if (job.is_saved) {
        await JobsService.unsaveJob(job.id)
      } else {
        await JobsService.saveJob(job.id)
      }
      
      // Refresh job details to get updated save status
      await fetchJobDetails()
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
      alert("An error occurred while saving the job. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Contact functions
  const handleEmailContact = () => {
    if (!job?.employer?.email || job.employer.email === 'Contact via platform') {
      alert('Contact information is not available. Please apply through the platform and the employer will be notified.')
      return
    }
    
    const subject = encodeURIComponent(`Regarding Job: ${job.title}`)
    const body = encodeURIComponent(`Hi ${job.employer.full_name || 'there'},\n\nI'm interested in your job posting: "${job.title}"\n\nBest regards`)
    
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // On mobile, use mailto: which works well with mobile email apps
      window.open(`mailto:${job.employer.email}?subject=${subject}&body=${body}`, '_blank')
    } else {
      // On desktop, open Gmail compose in browser
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(job.employer.email)}&su=${subject}&body=${body}`
      window.open(gmailUrl, '_blank')
    }
  }

  const handleWhatsAppContact = () => {
    if (!job?.employer?.phone) return
    
    // Remove all non-digits and format for WhatsApp
    const phoneNumber = job.employer.phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Hi ${job.employer.full_name || 'there'}, I'm interested in your job posting: "${job.title}"`)
    
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // On mobile, use wa.me which opens the WhatsApp app directly
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
    } else {
      // On desktop, open WhatsApp Web
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`, '_blank')
    }
  }

  const handlePhoneCall = () => {
    if (!job?.employer?.phone) return
    window.open(`tel:${job.employer.phone}`, '_self')
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
                <CardTitle className="text-2xl text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  {job.title}
                  {/* Application Status Badge */}
                  {job.application_status === 'applied' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm">
                      Applied
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base">
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
                  onClick={(e) => handleSaveJob(e)}
                  variant="outline"
                  size="icon"
                  disabled={saving}
                  className="hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  title={job.is_saved ? "Remove from saved" : "Save job"}
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
              {job.available_dates && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-base">{job.available_dates}</span>
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
                {job.available_dates && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          Available Dates:
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {job.available_dates.includes(' to ') || job.available_dates.includes(' - ') 
                            ? `This job can be scheduled on any date between ${job.available_dates}. Contact the employer to arrange the specific timing that works best for both of you.`
                            : `This job is scheduled for ${job.available_dates}. Please confirm your availability for this specific date when applying.`
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

        {/* Employer Contact Information */}
        {job.employer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Employer</CardTitle>
              <CardDescription>
                Get in touch with {job.employer.full_name || 'the employer'} 
                {job.employer.company_name && ` from ${job.employer.company_name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {/* Email Button */}
                <Button 
                  onClick={handleEmailContact}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>

                {/* WhatsApp Button */}
                {job.employer.phone && (
                  <Button 
                    onClick={handleWhatsAppContact}
                    variant="outline"
                    className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}

                {/* Phone Button */}
                {job.employer.phone && (
                  <Button 
                    onClick={handlePhoneCall}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                )}
              </div>
              
              {/* Employer Info */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm space-y-1">
                  <p><strong>Contact:</strong> {job.employer.full_name || 'Not specified'}</p>
                  {job.employer.company_name && (
                    <p><strong>Company:</strong> {job.employer.company_name}</p>
                  )}
                  <p><strong>Email:</strong> {job.employer.email}</p>
                  {job.employer.phone && (
                    <p><strong>Phone:</strong> {job.employer.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Location Map */}
        {job.location && (
          <JobLocationMap 
            jobLocation={job.location}
            jobLatitude={job.latitude}
            jobLongitude={job.longitude}
            className="mb-6"
          />
        )}

        {/* Profile Completion Prompt */}
        {showProfilePrompt && profileValidation && !profileValidation.isValid && (
          <div className="mb-6">
            <ProfileCompletionPrompt 
              validation={profileValidation}
              userType="employee"
              action="apply for jobs"
              onClose={() => setShowProfilePrompt(false)}
            />
          </div>
        )}

        {/* Application Form - Only show if not already applied */}
        {job.application_status !== 'applied' && !showProfilePrompt && (
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
        )}

        {/* Already Applied Message */}
        {job.application_status === 'applied' && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg">
                  <p className="font-medium">You have already applied for this job!</p>
                  <p className="text-sm mt-1">
                    Check your <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" onClick={() => router.push("/employee/saved")}>My Jobs</Button> page to track your application status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 