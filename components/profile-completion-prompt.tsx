'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { ProfileValidationResult } from '@/lib/profile-validation'

interface ProfileCompletionPromptProps {
  validation: ProfileValidationResult
  userType: 'employer' | 'employee'
  action: string // e.g., "post a job", "apply for jobs"
  onClose?: () => void
}

export default function ProfileCompletionPrompt({ 
  validation, 
  userType, 
  action, 
  onClose 
}: ProfileCompletionPromptProps) {
  const profilePath = userType === 'employer' ? '/employer/profile' : '/employee/profile'
  
  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <AlertCircle className="h-5 w-5" />
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Your profile needs to be completed before you can {action}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="border-orange-200 dark:border-orange-800">
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            {validation.message}
          </AlertDescription>
        </Alert>
        
        {validation.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Please add the following information to your profile:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {validation.missingFields.map((field) => (
                <li key={field} className="capitalize">{field}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex gap-3 pt-2">
          <Button asChild className="flex-1">
            <Link href={profilePath} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Complete Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 