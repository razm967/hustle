import { getCurrentUserProfile } from './user-utils'

export interface ProfileValidationResult {
  isValid: boolean
  missingFields: string[]
  message: string
}

/**
 * Validates employer profile for job posting requirements
 * Requires: birth_date, phone
 */
export async function validateEmployerProfileForJobPosting(): Promise<ProfileValidationResult> {
  try {
    const { profile } = await getCurrentUserProfile()
    
    if (!profile) {
      return {
        isValid: false,
        missingFields: ['profile'],
        message: 'Profile not found. Please complete your profile first.'
      }
    }

    const missingFields: string[] = []
    
    if (!profile.birth_date || profile.birth_date.trim() === '') {
      missingFields.push('birth date')
    }
    
    if (!profile.phone || profile.phone.trim() === '') {
      missingFields.push('phone number')
    }

    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        message: `Please complete your profile before posting a job. Missing: ${missingFields.join(', ')}.`
      }
    }

    return {
      isValid: true,
      missingFields: [],
      message: 'Profile is complete!'
    }
  } catch (error) {
    console.error('Error validating employer profile:', error)
    return {
      isValid: false,
      missingFields: ['unknown'],
      message: 'Error validating profile. Please try again.'
    }
  }
}

/**
 * Validates employee profile for job application requirements
 * Requires: birth_date, phone
 */
export async function validateEmployeeProfileForApplication(): Promise<ProfileValidationResult> {
  try {
    const { profile } = await getCurrentUserProfile()
    
    if (!profile) {
      return {
        isValid: false,
        missingFields: ['profile'],
        message: 'Profile not found. Please complete your profile first.'
      }
    }

    const missingFields: string[] = []
    
    if (!profile.birth_date || profile.birth_date.trim() === '') {
      missingFields.push('birth date')
    }
    
    if (!profile.phone || profile.phone.trim() === '') {
      missingFields.push('phone number')
    }

    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        message: `Please complete your profile before applying for jobs. Missing: ${missingFields.join(', ')}.`
      }
    }

    return {
      isValid: true,
      missingFields: [],
      message: 'Profile is complete!'
    }
  } catch (error) {
    console.error('Error validating employee profile:', error)
    return {
      isValid: false,
      missingFields: ['unknown'],
      message: 'Error validating profile. Please try again.'
    }
  }
} 