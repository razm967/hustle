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
  pay: string
  duration?: string
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