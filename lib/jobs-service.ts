"use client"

import { supabase } from "./supabase"
import type { Job } from "./database-types"

export interface CreateJobData {
  title: string
  description: string
  location?: string
  pay: string
  duration?: string
  available_dates?: string
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

  // Get all open jobs for employees
  static async getAvailableJobs(): Promise<{ data: Job[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching available jobs:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
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