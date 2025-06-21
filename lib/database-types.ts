// Database types for Supabase tables

export interface UserProfile {
  id: string
  email: string
  role: 'employer' | 'employee'
  full_name?: string
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
  is_saved?: boolean
} 