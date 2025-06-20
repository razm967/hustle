"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { useState } from "react";
import HeroSection from "@/components/heroSection";
import Sidebar from "@/components/Sidebar";

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
    <html lang="en">
      <head>
        <title>Employer Dashboard - Hustle</title>
        <meta name="description" content="Manage your job postings and find talented teens for your projects" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        {/* HeroSection Component */}
        <HeroSection 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
          userType="employer"
          title="Employer Dashboard"
          subtitle="Manage your jobs & find talent"
        />

        {/* Employer Sidebar Component */}
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userType="employer"
        />

        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
} 