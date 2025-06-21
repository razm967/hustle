"use client"

import { supabase } from "./supabase"
import type { Job, SavedJob, JobWithStatus } from "./database-types"

export interface CreateJobData {
  title: string
  description: string
  location?: string
  latitude?: number
  longitude?: number
  pay: string
  duration?: string
  available_dates?: string
  tags?: string[]
}

export class JobsService {
  // Create a new job
  static async createJob(jobData: CreateJobData): Promise<{ data: Job | null; error: string | null }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Insert job into database
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          employer_id: user.id,
          status: 'open'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating job:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Get jobs for an employer
  static async getEmployerJobs(): Promise<{ data: Job[] | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching employer jobs:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Get all open jobs for employees with status information
  static async getAvailableJobs(): Promise<{ data: JobWithStatus[] | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Get all open jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error('Error fetching available jobs:', jobsError)
        return { data: null, error: jobsError.message }
      }

      if (!user || !jobs) {
        return { data: jobs as JobWithStatus[], error: null }
      }

      // Get user's applications and saved jobs
      const [applicationsResult, savedJobsResult] = await Promise.all([
        supabase
          .from('job_applications')
          .select('job_id')
          .eq('employee_id', user.id),
        supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('employee_id', user.id)
      ])

      const appliedJobIds = new Set(applicationsResult.data?.map(app => app.job_id) || [])
      const savedJobIds = new Set(savedJobsResult.data?.map(saved => saved.job_id) || [])

      // Add status information to jobs
      const jobsWithStatus: JobWithStatus[] = jobs.map(job => ({
        ...job,
        application_status: appliedJobIds.has(job.id) ? 'applied' as const : 
                          savedJobIds.has(job.id) ? 'saved' as const : null,
        is_saved: savedJobIds.has(job.id)
      }))

      return { data: jobsWithStatus, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Apply for a job
  static async applyForJob(jobId: string, message?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" }
      }

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          employee_id: user.id,
          message: message || null,
          status: 'pending'
        })

      if (error) {
        console.error('Error applying for job:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Save a job
  static async saveJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" }
      }

      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          job_id: jobId,
          employee_id: user.id
        })

      if (error) {
        console.error('Error saving job:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Unsave a job
  static async unsaveJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" }
      }

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('employee_id', user.id)

      if (error) {
        console.error('Error unsaving job:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Get saved jobs for current user
  static async getSavedJobs(): Promise<{ data: JobWithStatus[] | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get saved jobs with job details
      const { data: savedJobs, error } = await supabase
        .from('saved_jobs')
        .select(`
          job_id,
          created_at,
          jobs (*)
        `)
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved jobs:', error)
        return { data: null, error: error.message }
      }

      if (!savedJobs) {
        return { data: [], error: null }
      }

      // Get user's applications to check status
      const { data: applications } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('employee_id', user.id)

      const appliedJobIds = new Set(applications?.map(app => app.job_id) || [])

      // Transform the data to match JobWithStatus interface
      const jobsWithStatus: JobWithStatus[] = savedJobs
        .filter(savedJob => savedJob.jobs) // Filter out any null jobs
        .map(savedJob => ({
          ...(savedJob.jobs as unknown as Job),
          application_status: appliedJobIds.has(savedJob.job_id) ? 'applied' as const : 'saved' as const,
          is_saved: true
        }))

      return { data: jobsWithStatus, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Get applied jobs for current user
  static async getAppliedJobs(): Promise<{ data: JobWithStatus[] | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get applied jobs with job details
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select(`
          job_id,
          status,
          created_at,
          jobs (*)
        `)
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applied jobs:', error)
        return { data: null, error: error.message }
      }

      if (!applications) {
        return { data: [], error: null }
      }

      // Get user's saved jobs to check status
      const { data: savedJobs } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('employee_id', user.id)

      const savedJobIds = new Set(savedJobs?.map(saved => saved.job_id) || [])

      // Transform the data to match JobWithStatus interface
      const jobsWithStatus: JobWithStatus[] = applications
        .filter(application => application.jobs) // Filter out any null jobs
        .map(application => ({
          ...(application.jobs as unknown as Job),
          application_status: 'applied' as const,
          is_saved: savedJobIds.has(application.job_id)
        }))

      return { data: jobsWithStatus, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Update job status
  static async updateJobStatus(jobId: string, status: Job['status']): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)

      if (error) {
        console.error('Error updating job status:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }
} 