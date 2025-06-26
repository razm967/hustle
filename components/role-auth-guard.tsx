import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/user-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowRight, Home } from "lucide-react"

interface RoleAuthGuardProps {
  children: React.ReactNode
  requiredRole: 'employer' | 'employee'
  redirectTo?: string
}

export default function RoleAuthGuard({ 
  children, 
  requiredRole,
  redirectTo = '/auth/signin' 
}: RoleAuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'wrong-role' | 'authorized'>('loading')
  const [userRole, setUserRole] = useState<'employer' | 'employee' | null>(null)

  useEffect(() => {
    checkAuthAndRole()
  }, [])

  const checkAuthAndRole = async () => {
    try {
      const { user, profile, error } = await getCurrentUserProfile()
      
      if (!user || error) {
        // Not authenticated - redirect to signin
        setAuthState('unauthenticated')
        router.push(redirectTo)
        return
      }

      if (!profile || !profile.role) {
        // User exists but no profile/role - redirect to signin
        setAuthState('unauthenticated')
        router.push(redirectTo)
        return
      }

      setUserRole(profile.role)

      if (profile.role !== requiredRole) {
        // Wrong role - show error message
        setAuthState('wrong-role')
      } else {
        // Correct role - allow access
        setAuthState('authorized')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState('unauthenticated')
      router.push(redirectTo)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToCorrectDashboard = () => {
    if (userRole === 'employer') {
      router.push('/employer')
    } else if (userRole === 'employee') {
      router.push('/employee')
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  // Loading state
  if (isLoading || authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Wrong role - show friendly error message
  if (authState === 'wrong-role') {
    const currentRoleDisplay = userRole === 'employer' ? 'Employer' : 'Employee'
    const targetRoleDisplay = requiredRole === 'employer' ? 'Employer' : 'Employee'
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-xl font-semibold">Access Restricted</CardTitle>
            <CardDescription>
              You're trying to access the {targetRoleDisplay} interface, but you're registered as a {currentRoleDisplay}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              You can only access the interface that matches your account type.
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleGoToCorrectDashboard}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to {currentRoleDisplay} Dashboard
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Unauthenticated - this shouldn't render since we redirect, but just in case
  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
} 