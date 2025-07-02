"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type FeedbackType = 'success' | 'error' | 'warning' | 'info'

interface FeedbackItem {
  id: string
  type: FeedbackType
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface FeedbackContextType {
  showFeedback: (feedback: Omit<FeedbackItem, 'id'>) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  removeFeedback: (id: string) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])

  const removeFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.filter(feedback => feedback.id !== id))
  }, [])

  const showFeedback = useCallback((feedback: Omit<FeedbackItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newFeedback: FeedbackItem = {
      ...feedback,
      id,
      duration: feedback.duration ?? 5000, // Default 5 seconds
    }

    setFeedbacks(prev => [...prev, newFeedback])

    // Auto-remove after duration
    if (newFeedback.duration && newFeedback.duration > 0) {
      setTimeout(() => {
        removeFeedback(id)
      }, newFeedback.duration)
    }
  }, [removeFeedback])

  const showSuccess = useCallback((message: string, title?: string) => {
    showFeedback({ type: 'success', message, title })
  }, [showFeedback])

  const showError = useCallback((message: string, title?: string) => {
    showFeedback({ type: 'error', message, title, duration: 7000 }) // Longer for errors
  }, [showFeedback])

  const showWarning = useCallback((message: string, title?: string) => {
    showFeedback({ type: 'warning', message, title, duration: 6000 })
  }, [showFeedback])

  const showInfo = useCallback((message: string, title?: string) => {
    showFeedback({ type: 'info', message, title })
  }, [showFeedback])

  return (
    <FeedbackContext.Provider value={{
      showFeedback,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeFeedback
    }}>
      {children}
      <FeedbackContainer feedbacks={feedbacks} onRemove={removeFeedback} />
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}

function FeedbackContainer({ 
  feedbacks, 
  onRemove 
}: { 
  feedbacks: FeedbackItem[]
  onRemove: (id: string) => void 
}) {
  if (feedbacks.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {feedbacks.map(feedback => (
        <FeedbackToast
          key={feedback.id}
          feedback={feedback}
          onRemove={() => onRemove(feedback.id)}
        />
      ))}
    </div>
  )
}

function FeedbackToast({ 
  feedback, 
  onRemove 
}: { 
  feedback: FeedbackItem
  onRemove: () => void 
}) {
  const getIcon = () => {
    switch (feedback.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (feedback.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'warning':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  return (
    <div className={cn(
      "border rounded-lg p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
      "bg-white dark:bg-gray-900",
      getStyles()
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {feedback.title && (
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {feedback.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
            {feedback.message}
          </p>
          
          {feedback.action && (
            <button
              onClick={feedback.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {feedback.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
} 