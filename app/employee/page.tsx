"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Bell, Briefcase, MapPin, Calendar, Clock, CheckCheck, Star, Timer, Award, CheckSquare, DollarSign } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"
import { supabase } from "@/lib/supabase"
import { useFeedback } from "@/components/ui/feedback"
import { EarningsChart } from "@/components/ui/chart"
import { RatingsChart } from "@/components/ui/ratings-chart"

interface ApplicationNotification {
  id: string
  job_id: string
  status: 'accepted' | 'rejected'
  updated_at: string
  job: {
    id: string
    title: string
    description: string
    location?: string
    pay: string
    employer_id: string
    status: string
    is_rated?: boolean
  }
  employer: {
    full_name?: string
    company_name?: string
    email: string
  }
}

export default function EmployeeDashboard() {
  const { showSuccess, showError } = useFeedback()
  
  const [notifications, setNotifications] = useState<ApplicationNotification[]>([])
  const [ratings, setRatings] = useState<{ work_quality: number; availability: number; friendliness: number; total_ratings: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [completingJob, setCompletingJob] = useState(false)
  const [earningsData, setEarningsData] = useState<Array<{
    id: string
    title: string
    pay: string
    duration: string | null
    completed_at: string
    calculated_earnings: number
  }> | null>(null)

  useEffect(() => {
    fetchNotifications()
    fetchUserRatings()
    fetchEarningsData()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await JobsService.getApplicationNotifications()
      if (data && !error) {
        setNotifications(data)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRatings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await JobsService.getEmployeeRatings(user.id)
        if (data) {
          setRatings(data)
        }
      }
    } catch (err) {
      console.error('Error fetching ratings:', err)
    }
  }

  const fetchEarningsData = async () => {
    try {
      const { data, error } = await JobsService.getEmployeeEarnings()
      if (error) {
        showError(error)
      } else if (data) {
        setEarningsData(data)
      }
    } catch (err) {
      console.error('Error fetching earnings data:', err)
      showError('Failed to load earnings data')
    }
  }

  const handleCompleteJob = (jobId: string) => {
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
          await fetchNotifications()
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

  const getStatusBadge = (status: string, job: ApplicationNotification['job']) => {
    // Show completed status first
    if (job.status === 'completed') {
      return (
        <>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Award className="h-3 w-3 mr-1" />
            Job Completed
          </Badge>
          {job.is_rated && (
            <Badge variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              Rated
            </Badge>
          )}
        </>
      )
    }

    // Show in progress status
    if (job.status === 'in_progress') {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    }

    // Only show application status if job is not completed or in progress
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckSquare className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Timer className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-gray-900 dark:to-green-900">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Employee Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-center">
          Find jobs, apply for opportunities, and earn money from one-time tasks.
        </p>

        {/* Application Notifications */}
        {!loading && notifications.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Recent Application Updates
                </CardTitle>
                <CardDescription>
                  Latest updates on your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {notification.job.title}
                            </h4>
                            {getStatusBadge(notification.status, notification.job)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              {notification.employer.company_name || notification.employer.full_name || 'Employer'}
                            </div>
                            {notification.job.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {notification.job.location}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(notification.updated_at)}
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Pay: {notification.job.pay}
                          </div>
                        </div>
                        
                        {/* Complete Job Button for accepted applications - only show if job is not completed */}
                        {notification.status === 'accepted' && notification.job.status !== 'completed' && (
                          <Button
                            onClick={() => handleCompleteJob(notification.job_id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 ml-4"
                          >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length > 3 && (
                    <div className="text-center">
                      <Link href="/employee/saved">
                        <Button variant="outline" size="sm">
                          View All Applications
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings Chart */}
        {!loading && earningsData && (
          <div className="max-w-4xl mx-auto mb-8">
            <EarningsChart data={earningsData} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div>
                <div className="flex items-center gap-2 text-lg mb-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Total Earnings
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${earningsData?.reduce((sum, job) => sum + job.calculated_earnings, 0).toFixed(2) || '0.00'}
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div>
                <div className="flex items-center gap-2 text-lg mb-1">
                  <CheckCheck className="h-5 w-5 text-blue-600" />
                  Completed Jobs
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {earningsData?.length || 0}
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div>
                <div className="flex items-center gap-2 text-lg mb-1">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  Average Payment
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  ${earningsData && earningsData.length > 0 
                    ? (earningsData.reduce((sum, job) => sum + job.calculated_earnings, 0) / earningsData.length).toFixed(2) 
                    : '0.00'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Employee Ratings Display */}
        {!loading && ratings && ratings.total_ratings > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <RatingsChart data={ratings} />
          </div>
        )}
        
        {/* Dashboard Cards with Navigation */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                Browse Jobs
              </CardTitle>
              <CardDescription>
                Find local one-time jobs that match your skills and schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/employee/browse-jobs">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Browse Available Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                My Applications
              </CardTitle>
              <CardDescription>
                Track your job applications and manage interviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/employee/saved">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View My Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                My Profile
              </CardTitle>
              <CardDescription>
                Update your profile and work preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/employee/profile">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

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