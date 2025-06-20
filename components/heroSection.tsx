"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, Home, User, Info, Mail, Briefcase, Search, DollarSign, Settings } from "lucide-react"
import Link from "next/link"

// Navigation items for different user types
const getNavigationItems = (userType: 'guest' | 'employer' | 'employee') => {
  switch (userType) {
    case 'employer':
      return [
        { href: "/employer", label: "Dashboard", icon: Home },
        { href: "/employer/post-job", label: "Post Job", icon: Briefcase },
        { href: "/employer/applications", label: "Applications", icon: User },
        { href: "/employer/payments", label: "Payments", icon: DollarSign },
        { href: "/employer/settings", label: "Settings", icon: Settings },
      ]
    case 'employee':
      return [
        { href: "/employee", label: "Dashboard", icon: Home },
        { href: "/employee/browse-jobs", label: "Browse Jobs", icon: Search },
        { href: "/employee/applications", label: "My Applications", icon: User },
        { href: "/employee/earnings", label: "Earnings", icon: DollarSign },
        { href: "/employee/profile", label: "Profile", icon: Settings },
      ]
    default: // guest
      return [
        { href: "/", label: "Home", icon: Home },
        { href: "/about", label: "About", icon: Info },
        { href: "/signin", label: "Sign In", icon: User },
        { href: "/contact", label: "Contact", icon: Mail },
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
                  JD
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
            {navigationItems.map((item) => {
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