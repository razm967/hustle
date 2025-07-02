"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, MessageSquare, Briefcase, Calendar, Timer, CheckSquare } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"
import { getUserInitials } from "@/lib/user-utils"

interface JobApplication {
  id: string
  job_id: string
  employee_id: string
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  created_at: string
  updated_at: string
  // Job details
  job: {
    id: string
    title: string
    description: string
    location?: string
    pay: string
    duration?: string
    available_dates?: string
    status: string
  }
  // Employee details
  employee: {
    id: string
    full_name?: string
    email: string
    phone?: string
    location?: string
    bio?: string
  }
}

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await JobsService.getEmployerApplications()
      
      if (fetchError) {
        setError(fetchError)
        return
      }

      // Filter out accepted applications - only show pending and rejected
      const filteredApplications = (data || []).filter(app => app.status !== 'accepted')
      setApplications(filteredApplications)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'accepted' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(applicationId))
    
    try {
      let success = false
      let actionError = null

      if (action === 'accepted') {
        // Use the comprehensive accept method
        const result = await JobsService.acceptApplication(applicationId)
        success = result.success
        actionError = result.error
      } else {
        // Use the regular update method for rejection
        const result = await JobsService.updateApplicationStatus(applicationId, action)
        success = result.success
        actionError = result.error
      }
      
      if (success) {
        // Refresh applications (this will automatically filter out accepted ones)
        await fetchApplications()
      } else {
        alert(`Failed to ${action} application: ${actionError}`)
      }
    } catch (err) {
      console.error(`Error ${action} application:`, err)
      alert(`An unexpected error occurred. Please try again.`)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(applicationId)
        return newSet
      })
    }
  }

  // Contact functions
  const handleEmailContact = (email: string) => {
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Use mailto on mobile
      window.location.href = `mailto:${email}`
    } else {
      // Open Gmail compose on desktop
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank')
    }
  }

  const handleWhatsAppContact = (phone: string) => {
    // Remove any non-digit characters and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Use WhatsApp app on mobile
      window.location.href = `https://wa.me/${cleanPhone}`
    } else {
      // Use WhatsApp Web on desktop
      window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}`, '_blank')
    }
  }

  const handlePhoneContact = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs"><Timer className="h-3 w-3 mr-1" />Pending</Badge>
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"><CheckSquare className="h-3 w-3 mr-1" />Accepted</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const groupedApplications = applications.reduce((groups, app) => {
    const jobTitle = app.job.title
    if (!groups[jobTitle]) {
      groups[jobTitle] = []
    }
    groups[jobTitle].push(app)
    return groups
  }, {} as Record<string, JobApplication[]>)

  if (loading) {
    return (
      <div className="employer-content p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="employer-content p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="employer-content p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Applications</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Review and manage pending applications for your job postings
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {applications.length}
            </div>
            <div className="text-sm text-gray-500">Pending Applications</div>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Pending Applications
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  When people apply for your jobs, their applications will appear here. Accepted applications are automatically moved to your job management.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedApplications).map(([jobTitle, jobApplications]) => (
              <Card key={jobTitle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    {jobTitle}
                  </CardTitle>
                  <CardDescription>
                    {jobApplications.length} application{jobApplications.length !== 1 ? 's' : ''} • 
                    {jobApplications[0].job.location && ` ${jobApplications[0].job.location} • `}
                    {jobApplications[0].job.pay}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobApplications.map((application) => (
                      <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Avatar */}
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage src="/placeholder-avatar.jpg" alt="Applicant" />
                              <AvatarFallback className="bg-blue-600 text-white">
                                {getUserInitials(application.employee.full_name, application.employee.email)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Applicant Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {application.employee.full_name || 'Anonymous Applicant'}
                                </h4>
                                {getStatusBadge(application.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{application.employee.email}</span>
                                </div>
                                {application.employee.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 flex-shrink-0" />
                                    <span>{application.employee.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 flex-shrink-0" />
                                  <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Contact Buttons */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Button
                                  onClick={() => handleEmailContact(application.employee.email)}
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-2"
                                >
                                  <Mail className="h-4 w-4" />
                                  Email
                                </Button>
                                {application.employee.phone && (
                                  <>
                                    <Button
                                      onClick={() => handleWhatsAppContact(application.employee.phone!)}
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      WhatsApp
                                    </Button>
                                    <Button
                                      onClick={() => handlePhoneContact(application.employee.phone!)}
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Phone className="h-4 w-4" />
                                      Call
                                    </Button>
                                  </>
                                )}
                              </div>

                              {/* Application Message */}
                              {application.message && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        Application Message:
                                      </p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                        {application.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Employee Bio */}
                              {application.employee.bio && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        About the Applicant:
                                      </p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                        {application.employee.bio}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Mobile responsive positioning */}
                          {application.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto w-full">
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'accepted')}
                                disabled={processingIds.has(application.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none lg:flex-none h-12 sm:h-9 lg:h-9 text-sm font-medium"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'rejected')}
                                disabled={processingIds.has(application.id)}
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none lg:flex-none h-12 sm:h-9 lg:h-9 text-sm font-medium"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 