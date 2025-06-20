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
    <html lang="en">
      <head>
        <title>Employee Dashboard - Hustle</title>
        <meta name="description" content="Find local job opportunities and earn money from one-time tasks" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        {/* HeroSection Component */}
        <HeroSection 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
          userType="employee"
          title="Employee Dashboard"
          subtitle="Find jobs & track earnings"
        />

        {/* Employee Sidebar Component */}
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userType="employee"
        />

        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
} 