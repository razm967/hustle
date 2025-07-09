import { supabase } from "./supabase"

/**
 * Calculates age from birth date
 */
export function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Gets age tier based on employee age
 * Junior: 14 years old (Bronze)
 * Youth: 15-16 years old (Silver)
 * Senior: 17-18 years old (Gold)
 */
export function getAgeTier(birthDate?: string): { tier: string; age: number | null; color: string } | null {
  const age = calculateAge(birthDate)
  
  if (age === null) return null
  
  if (age === 14) {
    return { tier: 'Junior', age, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' }
  } else if (age >= 15 && age <= 16) {
    return { tier: 'Youth', age, color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' }
  } else if (age >= 17 && age <= 18) {
    return { tier: 'Senior', age, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
  }
  
  // Return null for ages outside the employment range (under 14 or over 18)
  return null
}

/**
 * Validates if employee age meets minimum requirement (14+)
 */
export function validateEmployeeAge(birthDate?: string): { isValid: boolean; age: number | null; message: string } {
  const age = calculateAge(birthDate)
  
  if (age === null) {
    return {
      isValid: false,
      age: null,
      message: 'Please enter your birth date to verify you meet the minimum age requirement.'
    }
  }
  
  if (age < 14) {
    return {
      isValid: false,
      age,
      message: 'You must be at least 14 years old to create an employee profile and apply for jobs.'
    }
  }
  
  return {
    isValid: true,
    age,
    message: 'Age requirement met.'
  }
}

/**
 * Gets user initials from full name
 */
export function getUserInitials(fullName?: string, email?: string): string {
  if (fullName) {
    const names = fullName.trim().split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    } else if (names.length === 1 && names[0].length > 0) {
      return names[0].substring(0, 2).toUpperCase()
    }
  }
  
  // Fallback to email initials if no full name
  if (email) {
    const emailPart = email.split('@')[0]
    if (emailPart.length >= 2) {
      return emailPart.substring(0, 2).toUpperCase()
    }
  }
  
  // Final fallback
  return 'US'
}

/**
 * Gets current user profile data
 */
export async function getCurrentUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { user: null, profile: null, error: userError?.message || 'No user found' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return { user, profile: null, error: profileError.message }
    }

    return { user, profile, error: null }
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return { user: null, profile: null, error: 'Failed to fetch user data' }
  }
} 