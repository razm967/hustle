'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('No user found:', userError)
          router.push('/auth/signin')
          return
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('No profile found:', profileError)
          // Wait a bit and try again (trigger might be slow)
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const { data: retryProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (retryProfile) {
            // Redirect based on role
            if (retryProfile.role === 'employer') {
              router.push('/employer')
            } else {
              router.push('/employee')
            }
          } else {
            router.push('/auth/signup')
          }
        } else {
          // Redirect based on role
          if (profile.role === 'employer') {
            router.push('/employer')
          } else {
            router.push('/employee')
          }
        }
      } catch (error) {
        console.error('Auth success error:', error)
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthSuccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Setting up your account...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
} 