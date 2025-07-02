"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import stagewise toolbar for development mode AI-powered editing
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";
import { FeedbackProvider } from "@/components/ui/feedback";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Hustle - Transform Your Productivity</title>
        <meta name="description" content="Transform your productivity with focused action and intentional living" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <FeedbackProvider>
          {/* Stagewise Toolbar - Only renders in development mode */}
          <StagewiseToolbar 
            config={{
              plugins: [ReactPlugin]
            }}
          />
          
          {/* Main Content */}
          <main>
          {children}
          </main>
        </FeedbackProvider>
      </body>
    </html>
  );
}
