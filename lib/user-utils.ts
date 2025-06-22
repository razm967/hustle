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