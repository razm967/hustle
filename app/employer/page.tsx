"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmployerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Employer Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 text-center">
          Post jobs, find talented teens, and manage your hiring process.
        </p>
        
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
    </div>
  )
} 