"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-gray-900 dark:to-green-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Employee Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-center">
          Find jobs, apply for opportunities, and earn money from one-time tasks.
        </p>
        
        {/* Dashboard Cards with Navigation */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              Browse Jobs
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Find local one-time jobs that match your skills and schedule.
            </p>
            <Link href="/employee/browse-jobs">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Browse Available Jobs
              </Button>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              My Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Track your job applications and manage interviews.
            </p>
            <Link href="/employee/applications">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View My Applications
              </Button>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              Earnings
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View your earnings and payment history.
            </p>
            <Link href="/employee/earnings">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View Earnings
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
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Applications Sent</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">$0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">⭐ 0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 