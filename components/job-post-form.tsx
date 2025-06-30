"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Briefcase, FileText, MapPin, Image as ImageIcon, X, Loader2 } from "lucide-react"
import PaymentInput from "@/components/ui/payment-input"
import DateSelection from "@/components/ui/date-selection"
import DurationInput from "@/components/ui/duration-input"
import LocationInput from "@/components/ui/location-input"
import TagSelector from "@/components/ui/tag-selector"
import { JobsService, type CreateJobData } from "@/lib/jobs-service"
import type { Job } from "@/lib/database-types"
import { validateEmployerProfileForJobPosting } from "@/lib/profile-validation"
import ProfileCompletionPrompt from "@/components/profile-completion-prompt"
import type { ProfileValidationResult } from "@/lib/profile-validation"
import { supabase } from "@/lib/supabase"

interface JobPostFormProps {
  onJobPost?: (job: Job) => void
}

// Form data interface
interface JobFormData {
  title: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  pay: string
  duration: string
  available_dates: string
  tags: string[]
  images: string[]
}

export default function JobPostForm({ onJobPost }: JobPostFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    latitude: undefined,
    longitude: undefined,
    pay: "",
    duration: "",
    available_dates: "",
    tags: [],
    images: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileValidation, setProfileValidation] = useState<ProfileValidationResult | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)

  // Check profile completeness on component mount
  useEffect(() => {
    checkProfileCompleteness()
  }, [])

  const checkProfileCompleteness = async () => {
    try {
      setIsLoading(true)
      const validation = await validateEmployerProfileForJobPosting()
      setProfileValidation(validation)
      setShowForm(validation.isValid)
    } catch (error) {
      console.error('Error checking profile:', error)
      setShowForm(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    // Check profile completeness before submitting
    const validation = await validateEmployerProfileForJobPosting()
    if (!validation.isValid) {
      setProfileValidation(validation)
      setShowForm(false)
      setIsSubmitting(false)
      return
    }
    
    // Simple validation
    if (!formData.title || !formData.description || !formData.pay) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare job data for database
      const jobData: CreateJobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        pay: formData.pay,
        duration: formData.duration || undefined,
        available_dates: formData.available_dates || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      }

      // Save job to database
      const { data: newJob, error: jobError } = await JobsService.createJob(jobData)

      if (jobError) {
        throw jobError
      }

      if (newJob && formData.images.length > 0) {
        // Save job images
        const { error: imagesError } = await supabase
          .from('job_images')
          .insert(
            formData.images.map(url => ({
              job_id: newJob.id,
              image_url: url
            }))
          )

        if (imagesError) {
          throw imagesError
        }
      }

      // Call the callback if provided
      if (onJobPost && newJob) {
        onJobPost(newJob)
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        latitude: undefined,
        longitude: undefined,
        pay: "",
        duration: "",
        available_dates: "",
        tags: [],
        images: []
      })

      alert("Job posted successfully!")
    } catch (err) {
      console.error('Error posting job:', err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePaymentChange = (value: string) => {
    setFormData({
      ...formData,
      pay: value
    })
  }

  const handleDurationChange = (value: string) => {
    setFormData({
      ...formData,
      duration: value
    })
  }

  const handleDateChange = (value: string) => {
    setFormData({
      ...formData,
      available_dates: value
    })
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData({
      ...formData,
      tags
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    setImageUploadError(null)
    const newImages: string[] = []

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please upload only image files')
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size must be less than 5MB')
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('job-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('job-images')
          .getPublicUrl(filePath)

        newImages.push(publicUrl)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
    } catch (error: any) {
      console.error('Error uploading images:', error)
      setImageUploadError(error.message || 'Error uploading images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }

  // Show loading skeleton while checking profile
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-6">
              {/* Form field skeletons */}
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
              {/* Submit button skeleton */}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show profile completion prompt if profile is incomplete
  if (!showForm && profileValidation && !profileValidation.isValid) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <ProfileCompletionPrompt 
          validation={profileValidation}
          userType="employer"
          action="post a job"
          onClose={() => {
            setShowForm(true)
            setProfileValidation(null)
          }}
        />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>
          Fill out the details below to post a job for teen workers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Lawn Mowing, Dog Walking, Tutoring"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what needs to be done, any requirements, etc."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Location */}
          <LocationInput
            value={formData.location}
            onChange={(value, coordinates) => 
              setFormData({ 
                ...formData, 
                location: value,
                latitude: coordinates?.[1],
                longitude: coordinates?.[0]
              })
            }
            placeholder="e.g., Tel Aviv, Jerusalem, Haifa..."
            disabled={isSubmitting}
          />

          {/* Payment Input */}
          <PaymentInput
            value={formData.pay}
            onChange={handlePaymentChange}
            disabled={isSubmitting}
            required
          />

          {/* Duration Input */}
          <DurationInput
            value={formData.duration}
            onChange={handleDurationChange}
            disabled={isSubmitting}
          />

          {/* Date Selection */}
          <DateSelection
            value={formData.available_dates || ""}
            onChange={handleDateChange}
            disabled={isSubmitting}
          />

          {/* Job Tags */}
          <TagSelector
            selectedTags={formData.tags}
            onChange={handleTagsChange}
            disabled={isSubmitting}
          />

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Job Images
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={url} className="relative group aspect-video">
                  <img
                    src={url}
                    alt={`Job image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label
                htmlFor="image-upload"
                className={`aspect-video flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${
                  uploadingImages ? 'bg-gray-50' : ''
                }`}
              >
                {uploadingImages ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                    <span className="mt-2 block text-sm text-gray-500">
                      Add Images
                    </span>
                  </div>
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
            </div>
            {imageUploadError && (
              <p className="text-sm text-red-600">{imageUploadError}</p>
            )}
            <p className="text-sm text-gray-500">
              Upload up to 4 images (max 5MB each). Supported formats: PNG, JPG, JPEG, GIF, WEBP
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Posting Job..." : "Post Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 