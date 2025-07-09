"use client"

import { useState } from "react";
import HeroSection from "@/components/navBar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Shield, 
  Heart, 
  Target, 
  CheckCircle, 
  Star,
  DollarSign,
  Clock,
  MapPin,
  Award,
  TrendingUp,
  UserCheck,
  Briefcase,
  Smartphone
} from "lucide-react";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <HeroSection 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu}
        userType="guest"
        title="About Hustle"
        subtitle="Empowering the next generation"
      />

      {/* Sidebar Component */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userType="guest"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-blue-950 dark:via-gray-900 dark:to-purple-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hustle
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
            Connecting ambitious teenagers with meaningful work opportunities while helping employers 
            find reliable, eager talent for one-time jobs and projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              1000+ Active Users
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Briefcase className="h-4 w-4 mr-2" />
              500+ Jobs Posted
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              98% Success Rate
            </Badge>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We believe every teenager deserves the opportunity to earn, learn, and grow through 
                meaningful work experiences that build character and skills for the future.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-blue-600 dark:text-blue-400">Empower Youth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Give teenagers the tools and opportunities to earn their first income, 
                    develop work ethic, and gain real-world experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-purple-600 dark:text-purple-400">Build Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect neighbors, help local businesses, and strengthen communities 
                    through positive youth engagement and support.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-green-600 dark:text-green-400">Ensure Safety</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Maintain the highest standards of safety, security, and fair treatment 
                    for all young workers on our platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                How Hustle Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our platform makes it simple for teens to find work and for employers to find help
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* For Teens */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6 text-center">
                  For Teens (Employees)
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sign Up & Create Profile</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Create your account, complete your profile with skills and availability
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Browse & Apply</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Search local jobs, save interesting opportunities, and apply with a personal message
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Get Hired & Work</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Connect with employers, complete jobs safely, and earn money
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Build Your Reputation</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Receive ratings and reviews to build credibility for future opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Employers */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center">
                  For Employers
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Post Your Job</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Create detailed job listings with requirements, location, and fair pay
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Review Applications</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Review teen applications, check profiles, and select the best candidates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hire & Manage</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Connect with selected teens, coordinate work details, and track progress
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Rate & Pay</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Complete secure payments and provide ratings to help teens grow
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Platform Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Built with safety, simplicity, and success in mind
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Mobile Optimized</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Access the platform seamlessly on any device with our responsive design
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Location-Based</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Find jobs in your neighborhood and connect with local employers
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Verified Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    All users go through verification to ensure a safe, trusted community
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle className="text-lg">Rating System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Build reputation through ratings and reviews from completed jobs
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-lg">Secure Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Protected payment processing ensures fair compensation for completed work
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg">Flexible Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Work around school schedules with one-time and short-term opportunities
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Values Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Safety & Youth Protection
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
              We take the safety and well-being of young workers seriously. Our platform includes 
              built-in protections and educational resources to ensure positive experiences.
            </p>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Safety Measures</h3>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Age verification and parental consent requirements
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Background checks for employers and job screening
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Real-time support and reporting mechanisms
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Compliance with youth labor laws and regulations
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Educational Support</h3>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Know Your Rights information for young workers
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Workplace safety guidelines and best practices
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Financial literacy and money management tips
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Skills development and career guidance resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Hustle?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're a teen looking to earn money or an employer needing help, 
            Hustle connects you with the right opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold">
                Get Started as a Teen
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold">
                Post Your First Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p className="text-gray-300 mb-2">Email: hello@hustle-platform.com</p>
                <p className="text-gray-300 mb-2">Phone: 1-800-HUSTLE-1</p>
                <p className="text-gray-300">Available Monday-Friday, 9 AM - 6 PM</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/" className="block text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                  <Link href="/auth/signin" className="block text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="block text-gray-300 hover:text-white transition-colors">
                    Create Account
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Legal</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                    Youth Safety Guidelines
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © 2024 Hustle Platform. All rights reserved. Empowering youth through meaningful work.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 