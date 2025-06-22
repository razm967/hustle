// Database types for Supabase tables

export interface UserProfile {
  id: string
  email: string
  role: 'employer' | 'employee'
  full_name?: string
  birth_date?: string
  phone?: string
  location?: string
  latitude?: number
  longitude?: number
  bio?: string
  // Employee-specific fields
  availability?: string
  // Employer-specific fields
  company_name?: string
  company_website?: string
  company_description?: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  description: string
  location?: string
  latitude?: number
  longitude?: number
  pay: string
  duration?: string
  available_dates?: string
  tags?: string[]
  status: 'open' | 'closed' | 'in_progress' | 'completed'
  employer_id: string
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  employee_id: string
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  created_at: string
  updated_at: string
}

// New interface for saved jobs
export interface SavedJob {
  id: string
  job_id: string
  employee_id: string
  created_at: string
}

// Extended job interface with application status for employee views
export interface JobWithStatus extends Job {
  application_status?: 'applied' | 'saved' | null
  application_result?: 'pending' | 'accepted' | 'rejected'
  is_saved?: boolean
} 