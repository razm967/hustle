"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Bell, Star, CheckCircle } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"

export default function EmployerDashboard() {
  const [notifications, setNotifications] = useState<any[]>([])
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
    fetchNotifications()
  }, [])

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
        // Mark notification as read and refresh
        await JobsService.markNotificationAsRead(selectedNotification.id)
        await fetchNotifications()
        setShowRatingDialog(false)
        setSelectedNotification(null)
        setRatings({ work_quality: 5, availability: 5, friendliness: 5 })
      } else {
        alert(`Error submitting rating: ${error}`)
      }
    } catch (err) {
      console.error('Error submitting rating:', err)
      alert('An unexpected error occurred')
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
          <div className="max-w-4xl mx-auto mb-8">
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
        
        {/* Dashboard Cards with Navigation */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Payment System
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Secure payment processing for completed tasks.
            </p>
            <Link href="/employer/payments">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Manage Payments
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Quick Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed Jobs</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
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