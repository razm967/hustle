"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { useState } from "react";
import HeroSection from "@/components/heroSection";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/auth-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <AuthGuard>
      {/* HeroSection Component - Clean with only sign out */}
        <HeroSection 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
          userType="employee"
          title="Employee Dashboard"
          subtitle="Find jobs & track earnings"
        />

      {/* Employee Sidebar Component - Clean with only sign out */}
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userType="employee"
        />

        {/* Main Content */}
      <div className="employee-content">
          {children}
      </div>
    </AuthGuard>
  )
} 