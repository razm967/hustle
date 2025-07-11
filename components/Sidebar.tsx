"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, LogIn, UserPlus, LogOut, Info, Home, User, Compass, Bookmark, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile, getUserInitials } from "@/lib/user-utils"
import type { UserProfile } from "@/lib/database-types"

// Navigation items for different user types
const getNavigationItems = (userType: 'guest' | 'employer' | 'employee') => {
  switch (userType) {
    case 'employer':
      return [
        { href: "/employer", label: "Dashboard", icon: Home },
        { href: "/employer/post-job", label: "Post Job", icon: Plus },
        { href: "/employer/applications", label: "Applications", icon: FileText },
        { href: "/employer/profile", label: "Profile", icon: User },
      ]
    case 'employee':
      return [
        { href: "/employee", label: "Dashboard", icon: Home },
        { href: "/employee/browse-jobs", label: "Browse Jobs", icon: Compass },
        { href: "/employee/saved", label: "My Jobs", icon: Bookmark },
        { href: "/employee/profile", label: "Profile", icon: User },
      ]
    default: // guest
      return [
        { href: "/", label: "Home", icon: Home },
        { href: "/about", label: "About Us", icon: Info },
        { href: "/auth/signin", label: "Sign In", icon: LogIn },
        { href: "/auth/signup", label: "Create Account", icon: UserPlus },
      ]
  }
}

// Theme configurations for different user types
const getThemeConfig = (userType: 'guest' | 'employer' | 'employee') => {
  switch (userType) {
    case 'employer':
      return {
        avatarBg: 'bg-purple-600',
        avatarFallback: 'EM',
        title: 'Employer Panel',
        subtitle: 'Manage your business',
        hoverColors: 'hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/80',
        footerBg: 'bg-purple-50/80 dark:bg-purple-950/80',
        footerBorder: 'border-purple-200/50 dark:border-purple-800/50',
        footerTitle: 'Employer Account',
        footerSubtitle: 'Find talented teens for your projects',
        footerTitleColor: 'text-purple-800 dark:text-purple-200',
        footerSubtitleColor: 'text-purple-600 dark:text-purple-400'
      }
    case 'employee':
      return {
        avatarBg: 'bg-green-600',
        avatarFallback: 'EE',
        title: 'Employee Panel',
        subtitle: 'Find opportunities',
        hoverColors: 'hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/80 dark:hover:bg-green-950/80',
        footerBg: 'bg-green-50/80 dark:bg-green-950/80',
        footerBorder: 'border-green-200/50 dark:border-green-800/50',
        footerTitle: 'Employee Account',
        footerSubtitle: 'Earn money from local opportunities',
        footerTitleColor: 'text-green-800 dark:text-green-200',
        footerSubtitleColor: 'text-green-600 dark:text-green-400'
      }
    default: // guest
      return {
        avatarBg: 'bg-blue-600',
        avatarFallback: 'HU',
        title: 'Hustle',
        subtitle: 'Find your next opportunity',
        hoverColors: 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/80',
        footerBg: 'bg-blue-50/80 dark:bg-blue-950/80',
        footerBorder: 'border-blue-200/50 dark:border-blue-800/50',
        footerTitle: 'Safe & Secure Platform',
        footerSubtitle: 'Connecting teens with trusted local opportunities',
        footerTitleColor: 'text-blue-800 dark:text-blue-200',
        footerSubtitleColor: 'text-blue-600 dark:text-blue-400'
      }
  }
}

interface SidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  userType?: 'guest' | 'employer' | 'employee'
}

export default function Sidebar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  userType = 'guest' 
}: SidebarProps) {
  const navigationItems = getNavigationItems(userType)
  const theme = getThemeConfig(userType)
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userInitials, setUserInitials] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    
    if (userType !== 'guest') {
      loadUserProfile()
    }

    return () => {
      isMounted = false
    }
  }, [userType])

  const loadUserProfile = async () => {
    try {
      const { user, profile } = await getCurrentUserProfile()
      console.log('Sidebar - User profile data:', { 
        userId: user?.id, 
        email: user?.email, 
        profileName: profile?.full_name, 
        role: profile?.role 
      })
      if (profile) {
        setUserProfile(profile)
        const initials = getUserInitials(profile.full_name, user?.email)
        console.log('Sidebar - Generated initials:', initials, 'from name:', profile.full_name)
        setUserInitials(initials)
      } else if (user) {
        // Fallback to email if no profile
        const initials = getUserInitials(undefined, user.email)
        console.log('Sidebar - Fallback initials from email:', initials, 'from email:', user.email)
        setUserInitials(initials)
      }
    } catch (error) {
      console.error('Sidebar - Error loading user profile:', error)
    }
  }

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false)
    // Use local sign out to only affect this tab
    await supabase.auth.signOut({ scope: 'local' })
    router.push('/')
  }

  const renderGuestContent = () => (
    <div className="p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Join Hustle Today
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect teens with one-time job opportunities
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-4 text-gray-700 dark:text-gray-300 
                  ${theme.hoverColors} py-3 px-4 rounded-lg group
                  ${isMobileMenuOpen 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-4 opacity-0'
                  }
                `}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 100}ms` : '0ms',
                  transitionDuration: '300ms',
                  transitionProperty: 'transform, opacity'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderAuthenticatedContent = () => (
    <nav className="p-6">
      <div className="space-y-2">
        {/* Navigation Items */}
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-4 text-gray-700 dark:text-gray-300 
                ${theme.hoverColors} py-3 px-4 rounded-lg group
                ${isMobileMenuOpen 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-4 opacity-0'
                }
              `}
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 100}ms` : '0ms',
                transitionDuration: '300ms',
                transitionProperty: 'transform, opacity'
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={`
            w-full flex items-center space-x-4 text-red-600 dark:text-red-400 
            hover:bg-red-50/80 dark:hover:bg-red-950/80 py-3 px-4 rounded-lg group mt-4
            ${isMobileMenuOpen 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-4 opacity-0'
            }
          `}
          style={{
            transitionDelay: isMobileMenuOpen ? `${navigationItems.length * 100}ms` : '0ms',
            transitionDuration: '300ms',
            transitionProperty: 'transform, opacity'
          }}
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white/90 dark:bg-gray-800/90 
        backdrop-blur-sm shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <Link 
              href={userType === 'employer' ? '/employer/profile' : userType === 'employee' ? '/employee/profile' : '/'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarImage src={userProfile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className={`${theme.avatarBg} text-white`}>
                  {userType === 'guest' ? <User className="h-6 w-6" /> : (userInitials || theme.avatarFallback)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {theme.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {theme.subtitle}
              </p>
            </div>
          </div>
          {/* Close button */}
          <div className="flex justify-center -mt-1">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative w-12 h-12 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 rounded-full border-0 bg-transparent"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content based on user type */}
        {userType === 'guest' ? renderGuestContent() : renderAuthenticatedContent()}

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className={`p-4 ${theme.footerBg} backdrop-blur-sm rounded-lg border ${theme.footerBorder}`}>
            <p className={`text-sm ${theme.footerTitleColor} font-medium`}>
              {theme.footerTitle}
            </p>
            <p className={`text-xs ${theme.footerSubtitleColor} mt-1`}>
              {theme.footerSubtitle}
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 