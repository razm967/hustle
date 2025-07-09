"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Bell, Star, CheckCircle, Briefcase, Users, DollarSign, TrendingUp, Clock } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"
import { useFeedback } from "@/components/ui/feedback"
import { SpendingChart } from "@/components/ui/chart"

interface EmployerAnalytics {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  averageEmployeeRating: number
  totalSpent: number
  topEmployees: Array<{
    id: string
    name: string
    email: string
    jobsCompleted: number
    averageRating: number
  }>
  recentActivity: Array<{
    type: 'job_posted' | 'application_received' | 'job_completed' | 'employee_rated'
    message: string
    date: string
  }>
}

export default function EmployerDashboard() {
  const { showSuccess, showError } = useFeedback()
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<EmployerAnalytics | null>(null)
  const [spendingData, setSpendingData] = useState<Array<{
    id: string
    title: string
    pay: string
    duration: string | null
    completed_at: string
    calculated_spending: number
  }> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [ratings, setRatings] = useState({
    work_quality: 5,
    availability: 5,
    friendliness: 5
  })
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchAnalytics(),
      fetchSpendingData()
    ])
  }

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await JobsService.getEmployerAnalytics()
      if (data && !error) {
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
    }
  }

  const fetchSpendingData = async () => {
    try {
      const { data, error } = await JobsService.getEmployerSpendingData()
      if (data && !error) {
        setSpendingData(data)
      }
    } catch (err) {
      console.error('Error fetching spending data:', err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await JobsService.getEmployerNotifications()
      if (data && !error) {
        setNotifications(data)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRateEmployee = (notification: any) => {
    setSelectedNotification(notification)
    setShowRatingDialog(true)
  }

  const submitRating = async () => {
    if (!selectedNotification) return
    
    setSubmittingRating(true)
    try {
      const { success, error } = await JobsService.submitEmployeeRating(
        selectedNotification.job_id,
        selectedNotification.employee_id,
        ratings
      )
      
      if (success) {
        showSuccess('Employee rating submitted successfully!', 'Success')
        
        // Mark notification as read and refresh
        await JobsService.markNotificationAsRead(selectedNotification.id)
        await fetchNotifications()
        setShowRatingDialog(false)
        setSelectedNotification(null)
        setRatings({ work_quality: 5, availability: 5, friendliness: 5 })
      } else {
        showError(`Error submitting rating: ${error}`, 'Rating Failed')
      }
    } catch (err) {
      console.error('Error submitting rating:', err)
      showError('An unexpected error occurred', 'Error')
    } finally {
      setSubmittingRating(false)
    }
  }

  const skipRating = async () => {
    if (!selectedNotification) return
    
    try {
      await JobsService.markNotificationAsRead(selectedNotification.id)
      await fetchNotifications()
      setShowRatingDialog(false)
      setSelectedNotification(null)
    } catch (err) {
      console.error('Error skipping rating:', err)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Employer Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-center">
          Post jobs, find talented teens, and manage your hiring process.
        </p>

        {/* Job Completion Notifications */}
        {!loading && notifications.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  Job Completion Notifications
                </CardTitle>
                <CardDescription>
                  Rate employees who have completed your jobs
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
                              {notification.job?.title || 'Job'} - Completed
                            </h4>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Employee: {notification.employee?.full_name || notification.employee?.email || 'Unknown'}
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleRateEmployee(notification)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 ml-4"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Rate Employee
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Stats */}
        {!loading && analytics && (
          <div className="max-w-6xl mx-auto mb-8">
            {/* Stats and Application Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
              {/* Overview Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 dark:text-gray-400">Total Jobs</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{analytics.totalJobs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 dark:text-gray-400">Active Jobs</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{analytics.activeJobs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 dark:text-gray-400">Applications</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{analytics.totalApplications}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600 dark:text-gray-400">Total Spent</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">${analytics.totalSpent}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {analytics.pendingApplications}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Accepted</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {analytics.acceptedApplications}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {analytics.rejectedApplications}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spending Chart */}
            {spendingData && spendingData.length > 0 && (
              <div className="mb-6">
                <SpendingChart data={spendingData} />
              </div>
            )}

            {/* Recent Activity */}
            {analytics.recentActivity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'job_posted' ? 'bg-purple-100 dark:bg-purple-900' :
                          activity.type === 'application_received' ? 'bg-blue-100 dark:bg-blue-900' :
                          activity.type === 'employee_rated' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-green-100 dark:bg-green-900'
                        }`}>
                          {activity.type === 'job_posted' && <Briefcase className="h-4 w-4 text-purple-600" />}
                          {activity.type === 'application_received' && <Users className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'employee_rated' && <Star className="h-4 w-4 text-yellow-600" />}
                          {activity.type === 'job_completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}


        
        {/* Dashboard Cards with Navigation */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Post a Job
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create job listings for one-time tasks and projects.
            </p>
            <Link href="/employer/post-job">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Post New Job
              </Button>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Manage Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Review and manage applications from teens.
            </p>
            <Link href="/employer/applications">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View Applications
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* Employee Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Employee Performance</DialogTitle>
            <DialogDescription>
              Rate {selectedNotification?.employee?.full_name || 'the employee'} on their performance for "{selectedNotification?.job?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Work Quality: {ratings.work_quality}/10</Label>
              <Slider
                value={[ratings.work_quality]}
                onValueChange={(value) => setRatings(prev => ({ ...prev, work_quality: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Availability: {ratings.availability}/10</Label>
              <Slider
                value={[ratings.availability]}
                onValueChange={(value) => setRatings(prev => ({ ...prev, availability: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Friendliness: {ratings.friendliness}/10</Label>
              <Slider
                value={[ratings.friendliness]}
                onValueChange={(value) => setRatings(prev => ({ ...prev, friendliness: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={skipRating}
              disabled={submittingRating}
            >
              Skip
            </Button>
            <Button 
              onClick={submitRating}
              disabled={submittingRating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 