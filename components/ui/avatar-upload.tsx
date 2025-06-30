'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userInitials: string
  onAvatarChange: (url: string) => void
  className?: string
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  userInitials,
  onAvatarChange,
  className = 'h-16 w-16'
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/')
        await supabase.storage
          .from('avatars')
          .remove([oldPath])
      }

      onAvatarChange(publicUrl)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setError(error.message || 'Error uploading avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative group">
      <Avatar className={className}>
        <AvatarImage src={currentAvatarUrl || ''} alt="Profile" />
        <AvatarFallback className="bg-green-600 text-white text-lg">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      <Label
        htmlFor="avatar-upload"
        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Upload className="h-6 w-6" />
        )}
      </Label>
      
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {error && (
        <div className="absolute top-full mt-1 text-sm text-red-600 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}