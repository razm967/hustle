"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import JobPostForm from "@/components/job-post-form"

export default function PostJobPage() {
  const router = useRouter()

  const handleJobPost = (newJob: any) => {
    console.log("New job posted:", newJob)
    // Later we'll save to database
    
    // Redirect back to dashboard after posting
    router.push('/employer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Post a New Job
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 text-center">
          Fill out the details below to post a job for teen workers.
        </p>
        
        {/* Job Posting Form */}
        <JobPostForm onJobPost={handleJobPost} />
      </div>
    </div>
  )
} 