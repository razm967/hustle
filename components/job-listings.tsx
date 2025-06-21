"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, MapPin, Clock, Calendar, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Job } from "@/lib/database-types"

interface JobListingsProps {
  jobs: Job[]
}

export default function JobListings({ jobs }: JobListingsProps) {
  const router = useRouter()

  const handleViewJob = (jobId: string) => {
    router.push(`/employee/job/${jobId}`)
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Jobs Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for new opportunities!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Available Jobs ({jobs.length})
      </h2>
      
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="relative hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleViewJob(job.id)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-green-600 dark:text-green-400">
                    {job.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                {job.description}
              </p>
              
              {/* Job Details */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">{job.pay}</span>
                </div>
                
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{job.location}</span>
                  </div>
                )}
                
                {job.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>{job.duration}</span>
                  </div>
                )}

                {/* Available Dates */}
                {job.available_dates && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>{job.available_dates}</span>
                  </div>
                )}
              </div>
              
              {/* View Details Arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewJob(job.id)
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                >
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: '24px', height: '24px' }} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 