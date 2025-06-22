"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Bell, Briefcase, MapPin, Calendar, Clock } from "lucide-react"
import { JobsService } from "@/lib/jobs-service"

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
  }
  employer: {
    full_name?: string
    company_name?: string
    email: string
  }
}

export default function EmployeeDashboard() {
  const [notifications, setNotifications] = useState<ApplicationNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
                            {getStatusBadge(notification.status)}
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

        {/* Quick Stats Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Quick Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {notifications.filter(n => n.status === 'accepted').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Applications Accepted</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Recent Updates</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">⭐ 0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 