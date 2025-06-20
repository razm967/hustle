"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, Home, User, Info, LogOut } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Navigation items for different user types
const getNavigationItems = (userType: 'guest' | 'employer' | 'employee') => {
  switch (userType) {
    case 'employer':
      return [] // Clean - no navigation items, only sign out
    case 'employee':
      return [] // Clean - no navigation items, only sign out
    default: // guest
      return [
        { href: "/", label: "Home", icon: Home },
        { href: "/about", label: "About Us", icon: Info },
        { href: "/auth/signin", label: "Sign In", icon: User },
        { href: "/auth/signup", label: "Create Account", icon: User },
      ]
  }
}

interface HeaderProps {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  userType?: 'guest' | 'employer' | 'employee'
  title?: string
  subtitle?: string
}

export default function Header({ 
  isMobileMenuOpen, 
  toggleMobileMenu, 
  userType = 'guest',
  title = 'Hustle',
  subtitle = 'Welcome back!'
}: HeaderProps) {
  const navigationItems = getNavigationItems(userType)
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left side - Profile Picture Button */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {userType === 'employer' ? 'EM' : userType === 'employee' ? 'EE' : 'HU'}
                </AvatarFallback>
              </Avatar>
            </Button>
            <div className="ml-3 hidden sm:block">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right side - Navigation */}
          {/* Desktop Navigation (static on wider screens) */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Navigation Items for Guests */}
            {userType === 'guest' && navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Sign Out Button for Authenticated Users */}
            {(userType === 'employer' || userType === 'employee') && (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </nav>

          {/* Mobile Hamburger Menu Button */}
          <div className="lg:hidden relative z-50 mt-1">
            <button
              onClick={toggleMobileMenu}
              className="relative w-12 h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg border-0 bg-transparent"
            >
              {/* Animated hamburger/X icon */}
              <Menu 
                className={`h-7 w-7 absolute transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen 
                    ? 'opacity-0 rotate-180 scale-0' 
                    : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X 
                className={`h-7 w-7 absolute transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen 
                    ? 'opacity-100 rotate-0 scale-100' 
                    : 'opacity-0 rotate-180 scale-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 