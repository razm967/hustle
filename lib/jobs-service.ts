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
  images?: string[]
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

      // Start a transaction
      const { data, error } = await supabase.rpc('create_job_with_images', {
        job_data: {
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          latitude: jobData.latitude,
          longitude: jobData.longitude,
          pay: jobData.pay,
          duration: jobData.duration,
          available_dates: jobData.available_dates,
          tags: jobData.tags,
          employer_id: user.id,
          status: 'open'
        },
        image_urls: jobData.images || []
      })

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

      if (!jobs) {
        return { data: [], error: null }
      }

      // Get employer profiles for all jobs
      const employerIds = [...new Set(jobs.map(job => job.employer_id))]
      const { data: employers, error: employersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, company_name, email')
        .in('id', employerIds)

      if (employersError) {
        console.error('Error fetching employers:', employersError)
        return { data: null, error: employersError.message }
      }

      // Create a map of employer profiles
      const employerMap = new Map(
        (employers || []).map(employer => [
          employer.id,
          employer
        ])
      )

      if (!user) {
        // Add employer info to jobs and return if no user
        const jobsWithEmployers = jobs.map(job => ({
          ...job,
          employer_name: employerMap.get(job.employer_id)?.company_name || 
                        employerMap.get(job.employer_id)?.full_name || 
                        'Unknown Employer',
          employer_email: employerMap.get(job.employer_id)?.email
        }))
        return { data: jobsWithEmployers as JobWithStatus[], error: null }
      }

      // Get user's applications and saved jobs
      const [applicationsResult, savedJobsResult] = await Promise.all([
        supabase
          .from('job_applications')
          .select('job_id, status')
          .eq('employee_id', user.id),
        supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('employee_id', user.id)
      ])

      const applications = applicationsResult.data || []
      const appliedJobIds = new Set(applications.map(app => app.job_id))
      const rejectedJobIds = new Set(applications.filter(app => app.status === 'rejected').map(app => app.job_id))
      const savedJobIds = new Set(savedJobsResult.data?.map(saved => saved.job_id) || [])

      // Filter out jobs where the current employee has been rejected
      const availableJobs = jobs.filter(job => !rejectedJobIds.has(job.id))

      // Add status information and employer name to jobs
      const jobsWithStatus: JobWithStatus[] = availableJobs.map(job => ({
        ...job,
        application_status: appliedJobIds.has(job.id) ? 'applied' as const : 
                          savedJobIds.has(job.id) ? 'saved' as const : null,
        is_saved: savedJobIds.has(job.id),
        employer_name: employerMap.get(job.employer_id)?.company_name || 
                      employerMap.get(job.employer_id)?.full_name || 
                      'Unknown Employer',
        employer_email: employerMap.get(job.employer_id)?.email
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

      // Get saved jobs
      const { data: savedJobs, error } = await supabase
        .from('saved_jobs')
        .select('job_id, created_at')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved jobs:', error)
        return { data: null, error: error.message }
      }

      if (!savedJobs || savedJobs.length === 0) {
        return { data: [], error: null }
      }

      // Get job details for saved jobs
      const savedJobIds = savedJobs.map(saved => saved.job_id)
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', savedJobIds)

      if (jobsError) {
        console.error('Error fetching saved job details:', jobsError)
        return { data: null, error: jobsError.message }
      }

      // Get user's applications to check status
      const { data: applications } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('employee_id', user.id)

      const appliedJobIds = new Set(applications?.map(app => app.job_id) || [])

      // Transform the data to match JobWithStatus interface
      const jobsWithStatus: JobWithStatus[] = (jobs || [])
        .map(job => ({
          ...job,
          application_status: appliedJobIds.has(job.id) ? 'applied' as const : 'saved' as const,
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

      // Get applied jobs
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select('job_id, status, created_at')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applied jobs:', error)
        return { data: null, error: error.message }
      }

      if (!applications || applications.length === 0) {
        return { data: [], error: null }
      }

      // Get job details for applied jobs
      const appliedJobIds = applications.map(app => app.job_id)
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', appliedJobIds)

      if (jobsError) {
        console.error('Error fetching applied job details:', jobsError)
        return { data: null, error: jobsError.message }
      }

      // Get employer details for the jobs
      const employerIds = jobs?.map(job => job.employer_id) || []
      const { data: employers, error: employersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, company_name, email')
        .in('id', employerIds)

      if (employersError) {
        console.error('Error fetching employer details for applied jobs:', employersError)
        // Continue without employer data if there's an error
      }

      // Get user's saved jobs and ratings to check status
      const [savedJobsResult, ratingsResult] = await Promise.all([
        supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('employee_id', user.id),
        supabase
          .from('employee_ratings')
          .select('job_id')
          .eq('employee_id', user.id)
      ])

      const savedJobIds = new Set(savedJobsResult.data?.map(saved => saved.job_id) || [])
      const ratedJobIds = new Set(ratingsResult.data?.map(rating => rating.job_id) || [])

      // Create maps for easy lookup
      const applicationsMap = new Map(applications.map(app => [app.job_id, app]))
      const employersMap = new Map(employers?.map(emp => [emp.id, emp]) || [])

      // Transform the data to match JobWithStatus interface
      const jobsWithStatus: JobWithStatus[] = (jobs || [])
        .map(job => {
          const application = applicationsMap.get(job.id)
          const employer = employersMap.get(job.employer_id)
          
          return {
            ...job,
            application_status: 'applied' as const,
            application_result: application?.status || 'pending', // Add application result status
            is_saved: savedJobIds.has(job.id),
            is_rated: ratedJobIds.has(job.id),
            // Add employer information to the job object for consistency with notifications
            employer_name: employer?.full_name || employer?.company_name || 'Unknown Employer',
            employer_email: employer?.email || 'Unknown Email'
          }
        })

      return { data: jobsWithStatus, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Get job details with employer information
  static async getJobWithEmployer(jobId: string): Promise<{ 
    data: (JobWithStatus & { employer?: { full_name?: string; email: string; phone?: string; company_name?: string } }) | null; 
    error: string | null 
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      // Get job details first
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        return { data: null, error: jobError.message }
      }

      if (!jobData) {
        return { data: null, error: "Job not found" }
      }

      // Get employer profile separately
      const { data: employerData, error: employerError } = await supabase
        .from('user_profiles')
        .select('full_name, email, phone, company_name')
        .eq('id', jobData.employer_id)
        .single()

      if (employerError) {
        console.error('Error fetching employer profile:', employerError)
        // Continue without employer data if profile not found
      }

      let jobWithStatus: JobWithStatus & { employer?: { full_name?: string; email: string; phone?: string; company_name?: string } } = {
        ...jobData,
        employer: employerData || undefined,
        application_status: null,
        is_saved: false
      }

      // If user is authenticated, check application and save status
      if (user) {
        const [applicationsResult, savedJobsResult] = await Promise.all([
          supabase
            .from('job_applications')
            .select('job_id')
            .eq('employee_id', user.id)
            .eq('job_id', jobId)
            .single(),
          supabase
            .from('saved_jobs')
            .select('job_id')
            .eq('employee_id', user.id)
            .eq('job_id', jobId)
            .single()
        ])

        jobWithStatus.application_status = applicationsResult.data ? 'applied' : 
                                         savedJobsResult.data ? 'saved' : null
        jobWithStatus.is_saved = !!savedJobsResult.data
      }

      return { data: jobWithStatus, error: null }
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

  // Get applications for employer's jobs
  static async getEmployerApplications(): Promise<{ 
    data: Array<{
      id: string
      job_id: string
      employee_id: string
      status: 'pending' | 'accepted' | 'rejected'
      message?: string
      created_at: string
      updated_at: string
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
      employee: {
        id: string
        full_name?: string
        email: string
        phone?: string
        location?: string
        bio?: string
      }
    }> | null; 
    error: string | null 
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // First get employer's job IDs
      const { data: employerJobs, error: employerJobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('employer_id', user.id)

      if (employerJobsError) {
        console.error('Error fetching employer jobs:', employerJobsError)
        return { data: null, error: employerJobsError.message }
      }

      if (!employerJobs || employerJobs.length === 0) {
        return { data: [], error: null }
      }

      const employerJobIds = employerJobs.map(job => job.id)

      // Get applications for employer's jobs
      const { data: applications, error: appsError } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', employerJobIds)
        .order('created_at', { ascending: false })

      if (appsError) {
        console.error('Error fetching applications:', appsError)
        return { data: null, error: appsError.message }
      }

      if (!applications || applications.length === 0) {
        return { data: [], error: null }
      }

      // Get job details
      const applicationJobIds = applications.map(app => app.job_id)
      const { data: jobs, error: jobDetailsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', applicationJobIds)

      if (jobDetailsError) {
        console.error('Error fetching job details:', jobDetailsError)
        return { data: null, error: jobDetailsError.message }
      }

      // Get employee details
      const employeeIds = applications.map(app => app.employee_id)
      const { data: employees, error: employeesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, phone, location, bio, birth_date')
        .in('id', employeeIds)

      if (employeesError) {
        console.error('Error fetching employee details:', employeesError)
        return { data: null, error: employeesError.message }
      }

      // Combine the data
      const jobsMap = new Map(jobs?.map(job => [job.id, job]) || [])
      const employeesMap = new Map(employees?.map(emp => [emp.id, emp]) || [])

      const enrichedApplications = applications.map(app => ({
        ...app,
        job: jobsMap.get(app.job_id) || {
          id: app.job_id,
          title: 'Unknown Job',
          description: '',
          pay: '',
          status: 'unknown'
        },
        employee: employeesMap.get(app.employee_id) || {
          id: app.employee_id,
          email: 'Unknown Employee'
        }
      }))

      return { data: enrichedApplications, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Update application status
  static async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application status:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Accept application with proper job management
  static async acceptApplication(applicationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // First get the application details
      const { data: application, error: appError } = await supabase
        .from('job_applications')
        .select('job_id, employee_id')
        .eq('id', applicationId)
        .single()

      if (appError || !application) {
        return { success: false, error: 'Application not found' }
      }

      // Update application status to accepted
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error accepting application:', updateError)
        return { success: false, error: updateError.message }
      }

      // Update job status to in_progress
      const { error: jobUpdateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.job_id)

      if (jobUpdateError) {
        console.error('Error updating job status:', jobUpdateError)
        // Note: We don't return error here as the application was already accepted
        // The job status update is secondary
      }

      // Optionally: Reject all other pending applications for this job
      const { error: rejectOthersError } = await supabase
        .from('job_applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('job_id', application.job_id)
        .eq('status', 'pending')
        .neq('id', applicationId)

      if (rejectOthersError) {
        console.error('Error rejecting other applications:', rejectOthersError)
        // This is also optional, so we don't fail the whole operation
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error in acceptApplication:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Get application notifications for employee dashboard
  static async getApplicationNotifications(): Promise<{ 
    data: Array<{
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
        }
      employer: {
        full_name?: string
        company_name?: string
        email: string
      }
    }> | null; 
    error: string | null 
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get accepted and rejected applications from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: applications, error: appsError } = await supabase
        .from('job_applications')
        .select('id, job_id, status, updated_at')
        .eq('employee_id', user.id)
        .in('status', ['accepted', 'rejected'])
        .gte('updated_at', thirtyDaysAgo.toISOString())
        .order('updated_at', { ascending: false })

      if (appsError) {
        console.error('Error fetching application notifications:', appsError)
        return { data: null, error: appsError.message }
      }

      if (!applications || applications.length === 0) {
        return { data: [], error: null }
      }

      // Get job details and ratings
      const jobIds = applications.map(app => app.job_id)
      const [jobsResult, ratingsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, description, location, pay, employer_id, status')
          .in('id', jobIds),
        supabase
          .from('employee_ratings')
          .select('job_id')
          .eq('employee_id', user.id)
          .in('job_id', jobIds)
      ])

      const { data: jobs, error: jobsError } = jobsResult
      if (jobsError) {
        console.error('Error fetching job details for notifications:', jobsError)
        return { data: null, error: jobsError.message }
      }

      // Get employer details
      const employerIds = jobs?.map(job => job.employer_id) || []
      const { data: employers, error: employersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, company_name, email')
        .in('id', employerIds)

      // Create a set of rated job IDs
      const ratedJobIds = new Set(ratingsResult.data?.map(r => r.job_id) || [])

      if (employersError) {
        console.error('Error fetching employer details for notifications:', employersError)
        return { data: null, error: employersError.message }
      }

      // Combine the data
      const jobsMap = new Map(jobs?.map(job => [job.id, job]) || [])
      const employersMap = new Map(employers?.map(emp => [emp.id, emp]) || [])

      const notifications = applications.map(app => {
        const job = jobsMap.get(app.job_id)
        const employer = job ? employersMap.get(job.employer_id) : null
        
        return {
          ...app,
          job: job || {
            id: app.job_id,
            title: 'Unknown Job',
            description: '',
            pay: '',
            employer_id: '',
            status: 'unknown',
            is_rated: false
          },
          employer: employer || {
            email: 'Unknown Employer'
          },
          is_rated: job ? ratedJobIds.has(job.id) : false
        }
      })

      // Filter out notifications for completed jobs if the application was accepted
      const activeNotifications = notifications.filter(notification => 
        !(notification.status === 'accepted' && notification.job.status === 'completed')
      )

      return { data: activeNotifications, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Complete a job (employee marks job as completed)
  static async completeJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" }
      }

      // Update job status to completed
      const { error: jobUpdateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (jobUpdateError) {
        console.error('Error completing job:', jobUpdateError)
        return { success: false, error: jobUpdateError.message }
      }

      // Get job details for notification
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('employer_id, title')
        .eq('id', jobId)
        .single()

      if (!jobError && job) {
        // Create notification for employer
        await supabase
          .from('employer_notifications')
          .insert({
            employer_id: job.employer_id,
            job_id: jobId,
            employee_id: user.id,
            type: 'job_completed',
            message: `Job "${job.title}" has been completed. Please rate the employee.`
          })
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Submit employee rating
  static async submitEmployeeRating(jobId: string, employeeId: string, ratings: {
    work_quality: number;
    availability: number;
    friendliness: number;
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" }
      }

      // Check if rating already exists
      const { data: existingRating } = await supabase
        .from('employee_ratings')
        .select('id')
        .eq('job_id', jobId)
        .eq('employer_id', user.id)
        .eq('employee_id', employeeId)
        .single()

      if (existingRating) {
        return { success: false, error: "Rating already submitted for this job" }
      }

      const { error } = await supabase
        .from('employee_ratings')
        .insert({
          job_id: jobId,
          employer_id: user.id,
          employee_id: employeeId,
          work_quality: ratings.work_quality,
          availability: ratings.availability,
          friendliness: ratings.friendliness
        })

      if (error) {
        console.error('Error submitting rating:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Get employee average ratings
  static async getEmployeeRatings(employeeId: string): Promise<{ 
    data: {
      work_quality: number;
      availability: number;
      friendliness: number;
      total_ratings: number;
    } | null; 
    error: string | null 
  }> {
    try {
      const { data: ratings, error } = await supabase
        .from('employee_ratings')
        .select('work_quality, availability, friendliness')
        .eq('employee_id', employeeId)

      if (error) {
        console.error('Error fetching employee ratings:', error)
        return { data: null, error: error.message }
      }

      if (!ratings || ratings.length === 0) {
        return { 
          data: { work_quality: 0, availability: 0, friendliness: 0, total_ratings: 0 }, 
          error: null 
        }
      }

      const averages = {
        work_quality: ratings.reduce((sum, r) => sum + r.work_quality, 0) / ratings.length,
        availability: ratings.reduce((sum, r) => sum + r.availability, 0) / ratings.length,
        friendliness: ratings.reduce((sum, r) => sum + r.friendliness, 0) / ratings.length,
        total_ratings: ratings.length
      }

      return { data: averages, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Get employer notifications
  static async getEmployerNotifications(): Promise<{ 
    data: Array<{
      id: string;
      job_id: string;
      employee_id: string;
      type: string;
      message: string;
      is_read: boolean;
      created_at: string;
      job?: { title: string };
      employee?: { full_name: string; email: string };
    }> | null; 
    error: string | null 
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get notifications that haven't been read AND don't have ratings yet
      const { data: notifications, error } = await supabase
        .from('employer_notifications')
        .select('*')
        .eq('employer_id', user.id)
        .eq('is_read', false)
        .eq('type', 'job_completed')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching employer notifications:', error)
        return { data: null, error: error.message }
      }

      // Get job and employee details, and filter out already rated jobs
      if (notifications && notifications.length > 0) {
        const jobIds = notifications.map(n => n.job_id)
        const employeeIds = notifications.map(n => n.employee_id)

        const [jobsResult, employeesResult, ratingsResult] = await Promise.all([
          supabase.from('jobs').select('id, title').in('id', jobIds),
          supabase.from('user_profiles').select('id, full_name, email').in('id', employeeIds),
          supabase.from('employee_ratings').select('job_id, employee_id').eq('employer_id', user.id).in('job_id', jobIds)
        ])

        const jobsMap = new Map(jobsResult.data?.map(j => [j.id, j]) || [])
        const employeesMap = new Map(employeesResult.data?.map(e => [e.id, e]) || [])
        const ratedJobs = new Set(ratingsResult.data?.map(r => `${r.job_id}-${r.employee_id}`) || [])

        // Filter out notifications for jobs that already have ratings
        const unratedNotifications = notifications.filter(n => 
          !ratedJobs.has(`${n.job_id}-${n.employee_id}`)
        )

        const enrichedNotifications = unratedNotifications.map(n => ({
          ...n,
          job: jobsMap.get(n.job_id),
          employee: employeesMap.get(n.employee_id)
        }))

        return { data: enrichedNotifications, error: null }
      }

      return { data: notifications || [], error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('employer_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Get job images
  static async getJobImages(jobId: string): Promise<{ data: { id: string; image_url: string }[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('job_images')
        .select('id, image_url')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching job images:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Delete job image
  static async deleteJobImage(imageId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('job_images')
        .delete()
        .eq('id', imageId)

      if (error) {
        console.error('Error deleting job image:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  static async getEmployeeEarnings(): Promise<{ 
    data: Array<{
      id: string
      title: string
      pay: string
      duration: string | null
      completed_at: string
      calculated_earnings: number
    }> | null
    error: string | null 
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get all completed jobs for the employee
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          job_id,
          jobs!inner (
            id,
            title,
            pay,
            duration,
            updated_at
          )
        `)
        .eq('employee_id', user.id)
        .eq('status', 'accepted')
        .eq('jobs.status', 'completed')

      if (applicationsError) {
        console.error('Error fetching completed jobs:', applicationsError)
        return { data: null, error: applicationsError.message }
      }

      if (!applications) {
        return { data: [], error: null }
      }

      // Calculate earnings for each job
      const jobsWithEarnings = applications.map(app => {
        // Explicitly type the job from the response
        const job = (app as any).jobs as {
          id: string
          title: string
          pay: string
          duration: string | null
          updated_at: string
        }
        
        if (!job) return null

        // Parse pay amount and check if it's hourly
        const payString = job.pay.toLowerCase()
        const payMatch = payString.match(/\$(\d+)(?:\s*\/\s*hr)?/)
        const isHourly = payString.includes('/hr') || payString.includes('per hour')
        
        let calculatedEarnings = 0
        
        if (payMatch) {
          const baseRate = parseInt(payMatch[1])
          
          if (isHourly && job.duration) {
            // Parse duration (assuming format like "2 hours" or "2.5 hours")
            const durationMatch = job.duration.match(/(\d+(?:\.\d+)?)\s*hours?/)
            if (durationMatch) {
              const hours = parseFloat(durationMatch[1])
              calculatedEarnings = baseRate * hours
            } else {
              calculatedEarnings = baseRate // Default to base rate if duration parsing fails
            }
          } else {
            calculatedEarnings = baseRate // Fixed rate job
          }
        }

        return {
          id: job.id,
          title: job.title,
          pay: job.pay,
          duration: job.duration,
          completed_at: job.updated_at,
          calculated_earnings: calculatedEarnings
        }
      }).filter((job): job is NonNullable<typeof job> => job !== null)

      return { 
        data: jobsWithEarnings,
        error: null 
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Employer Analytics Functions
  static async getEmployerAnalytics(): Promise<{
    data: {
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
    } | null
    error: string | null
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get all employer's jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)

      if (jobsError) {
        console.error('Error fetching employer jobs:', jobsError)
        return { data: null, error: jobsError.message }
      }

      const totalJobs = jobs?.length || 0
      const activeJobs = jobs?.filter(job => job.status === 'open' || job.status === 'in_progress').length || 0
      const completedJobs = jobs?.filter(job => job.status === 'completed').length || 0

      // Get all applications for employer's jobs
      const jobIds = jobs?.map(job => job.id) || []
      let totalApplications = 0
      let pendingApplications = 0
      let acceptedApplications = 0
      let rejectedApplications = 0

      if (jobIds.length > 0) {
        const { data: applications } = await supabase
          .from('job_applications')
          .select('status, employee_id')
          .in('job_id', jobIds)

        if (applications) {
          totalApplications = applications.length
          pendingApplications = applications.filter(app => app.status === 'pending').length
          acceptedApplications = applications.filter(app => app.status === 'accepted').length
          rejectedApplications = applications.filter(app => app.status === 'rejected').length
        }
      }

      // Calculate average employee rating given by this employer
      const { data: ratings } = await supabase
        .from('employee_ratings')
        .select('work_quality, availability, friendliness')
        .eq('employer_id', user.id)

      let averageEmployeeRating = 0
      if (ratings && ratings.length > 0) {
        const totalRatings = ratings.length * 3 // 3 categories per rating
        const sumRatings = ratings.reduce((sum, rating) => 
          sum + rating.work_quality + rating.availability + rating.friendliness, 0
        )
        averageEmployeeRating = Number((sumRatings / totalRatings).toFixed(1))
      }

      // Calculate total spent on completed jobs
      const completedJobsList = jobs?.filter(job => job.status === 'completed') || []
      let totalSpent = 0
      completedJobsList.forEach(job => {
        const payMatch = job.pay.match(/\$(\d+)/)
        if (payMatch) {
          totalSpent += parseInt(payMatch[1])
        }
      })

      // Get top employees based on ratings and job completion
      let topEmployees: Array<{
        id: string
        name: string
        email: string
        jobsCompleted: number
        averageRating: number
      }> = []

      if (jobIds.length > 0) {
        const { data: employeeData } = await supabase
          .from('job_applications')
          .select(`
            employee_id,
            user_profiles!inner (
              id,
              full_name,
              email
            )
          `)
          .in('job_id', jobIds)
          .eq('status', 'accepted')

        if (employeeData) {
          const employeeMap = new Map()
          
          employeeData.forEach(app => {
            const profile = (app as any).user_profiles
            if (profile) {
              const existing = employeeMap.get(profile.id) || {
                id: profile.id,
                name: profile.full_name || 'Unknown',
                email: profile.email,
                jobsCompleted: 0,
                totalRating: 0,
                ratingCount: 0
              }
              existing.jobsCompleted++
              employeeMap.set(profile.id, existing)
            }
          })

          // Add rating data
          if (ratings) {
            const { data: ratingDetails } = await supabase
              .from('employee_ratings')
              .select('employee_id, work_quality, availability, friendliness')
              .eq('employer_id', user.id)

            ratingDetails?.forEach(rating => {
              const employee = employeeMap.get(rating.employee_id)
              if (employee) {
                employee.totalRating += rating.work_quality + rating.availability + rating.friendliness
                employee.ratingCount += 3
              }
            })
          }

          topEmployees = Array.from(employeeMap.values())
            .map(emp => ({
              ...emp,
              averageRating: emp.ratingCount > 0 ? Number((emp.totalRating / emp.ratingCount).toFixed(1)) : 0
            }))
            .sort((a, b) => b.jobsCompleted - a.jobsCompleted || b.averageRating - a.averageRating)
            .slice(0, 5)
        }
      }

      // Get recent activity
      const recentActivity: Array<{
        type: 'job_posted' | 'application_received' | 'job_completed' | 'employee_rated'
        message: string
        date: string
      }> = []

      // Recent job posts
      const recentJobs = jobs?.slice(0, 2).map(job => ({
        type: 'job_posted' as const,
        message: `Posted job: ${job.title}`,
        date: job.created_at
      })) || []

      // Recent applications
      if (jobIds.length > 0) {
        const { data: recentApps } = await supabase
          .from('job_applications')
          .select(`
            created_at,
            jobs!inner (title),
            user_profiles!inner (full_name, email)
          `)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(2)

        const appActivity = recentApps?.map(app => ({
          type: 'application_received' as const,
          message: `New application for ${(app as any).jobs.title} from ${(app as any).user_profiles.full_name || (app as any).user_profiles.email}`,
          date: app.created_at
        })) || []

        recentActivity.push(...appActivity)

        // Recent employee ratings
        const { data: recentRatings } = await supabase
          .from('employee_ratings')
          .select(`
            created_at,
            jobs!inner (title),
            user_profiles!inner (full_name, email)
          `)
          .eq('employer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2)

        const ratingActivity = recentRatings?.map(rating => ({
          type: 'employee_rated' as const,
          message: `Rated ${(rating as any).user_profiles.full_name || (rating as any).user_profiles.email} for ${(rating as any).jobs.title}`,
          date: rating.created_at
        })) || []

        recentActivity.push(...ratingActivity)
      }

      recentActivity.push(...recentJobs)
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return {
        data: {
          totalJobs,
          activeJobs,
          completedJobs,
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          averageEmployeeRating,
          totalSpent,
          topEmployees,
          recentActivity: recentActivity.slice(0, 5)
        },
        error: null
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }

  // Get employer spending data for chart
  static async getEmployerSpendingData(): Promise<{
    data: Array<{
      id: string
      title: string
      pay: string
      duration: string | null
      completed_at: string
      calculated_spending: number
    }> | null
    error: string | null
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" }
      }

      // Get all completed jobs for the employer
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, pay, duration, updated_at')
        .eq('employer_id', user.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: true })

      if (jobsError) {
        console.error('Error fetching completed jobs:', jobsError)
        return { data: null, error: jobsError.message }
      }

      if (!jobs) {
        return { data: [], error: null }
      }

      // Calculate spending for each job
      const jobsWithSpending = jobs.map(job => {
        // Parse pay amount and check if it's hourly
        const payString = job.pay.toLowerCase()
        const payMatch = payString.match(/\$(\d+)(?:\s*\/\s*hr)?/)
        const isHourly = payString.includes('/hr') || payString.includes('per hour')
        
        let calculatedSpending = 0
        
        if (payMatch) {
          const baseRate = parseInt(payMatch[1])
          
          if (isHourly && job.duration) {
            // Parse duration (assuming format like "2 hours" or "2.5 hours")
            const durationMatch = job.duration.match(/(\d+(?:\.\d+)?)\s*hours?/)
            if (durationMatch) {
              const hours = parseFloat(durationMatch[1])
              calculatedSpending = baseRate * hours
            } else {
              calculatedSpending = baseRate // Default to base rate if duration parsing fails
            }
          } else {
            calculatedSpending = baseRate // Fixed rate job
          }
        }

        return {
          id: job.id,
          title: job.title,
          pay: job.pay,
          duration: job.duration,
          completed_at: job.updated_at,
          calculated_spending: calculatedSpending
        }
      })

      return { 
        data: jobsWithSpending,
        error: null 
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: "An unexpected error occurred" }
    }
  }
} 