"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { useState } from "react";
import HeroSection from "@/components/heroSection";
import Sidebar from "@/components/Sidebar";
import RoleAuthGuard from "@/components/role-auth-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <RoleAuthGuard requiredRole="employer">
      {/* HeroSection Component - Clean with only sign out */}
        <HeroSection 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
          userType="employer"
          title="Employer Dashboard"
          subtitle="Manage your jobs & find talent"
        />

      {/* Employer Sidebar Component - Clean with only sign out */}
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userType="employer"
        />

        {/* Main Content */}
      <div className="employer-content">
          {children}
      </div>
    </RoleAuthGuard>
  )
} 