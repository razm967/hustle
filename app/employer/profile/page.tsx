'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building, Mail, Phone, Globe, Save, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile, getUserInitials } from '@/lib/user-utils'
import type { UserProfile } from '@/lib/database-types'
import { AvatarUpload } from '@/components/ui/avatar-upload'

// Profile form schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EmployerProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userInitials, setUserInitials] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const { user, profile } = await getCurrentUserProfile()
      
      if (profile) {
        setUserProfile(profile)
        const initials = getUserInitials(profile.full_name, user?.email)
        setUserInitials(initials)
        
        // Populate form with existing data
        setValue('full_name', profile.full_name || '')
        setValue('email', user?.email || '')
        setValue('birth_date', profile.birth_date || '')
        setValue('phone', profile.phone || '')
        setValue('bio', profile.bio || '')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      setMessage('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('You must be logged in to update your profile')
        return
      }

      // Update profile in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: data.full_name,
          birth_date: data.birth_date,
          phone: data.phone,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        setMessage(error.message)
        setIsSuccess(false)
      } else {
        setMessage('Profile updated successfully!')
        setIsSuccess(true)
        // Reload profile data
        await loadUserProfile()
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
      setIsSuccess(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('You must be logged in to update your profile')
        return
      }

      // Update profile in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        setMessage(error.message)
        setIsSuccess(false)
      } else {
        setMessage('Profile picture updated successfully!')
        setIsSuccess(true)
        // Reload profile data
        await loadUserProfile()
      }
    } catch (error) {
      setMessage('An unexpected error occurred while updating profile picture.')
      setIsSuccess(false)
    }
  }

  if (isLoading) {
    return (
      <div className="employer-content p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="employer-content p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <AvatarUpload
                userId={userProfile?.id || ''}
                currentAvatarUrl={userProfile?.avatar_url}
                userInitials={userInitials}
                onAvatarChange={handleAvatarChange}
                className="h-16 w-16"
              />
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription>
                  Manage your employer profile and company information
                </CardDescription>
                <Badge variant="outline" className="mt-2">
                  Employer Account
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal and company information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      {...register('full_name')}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register('email')}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Birth Date
                    </Label>
                    <Input
                      id="birth_date"
                      type="date"
                      {...register('birth_date')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      {...register('phone')}
                    />
                  </div>
                </div>

                {/* Personal Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential employees about yourself and your hiring approach..."
                    rows={3}
                    {...register('bio')}
                  />
                </div>
              </div>

              {/* Message */}
              {message && (
                <Alert variant={isSuccess ? "default" : "destructive"}>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 