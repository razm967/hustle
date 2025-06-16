"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Heart, Users, Lightbulb, Award, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function About() {
  // State for the test input
  const [testInput, setTestInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testInput.trim()) return

    setIsLoading(true)
    setMessage("")

    try {
      // Insert data into Supabase (assuming you have a 'test_submissions' table)
      const { data, error } = await supabase
        .from('test_submissions')
        .insert([
          { message: testInput.trim(), created_at: new Date() }
        ])
        .select()

      if (error) throw error

      setMessage("✅ Successfully saved to Supabase!")
      setTestInput("")
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Hustle
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            Home
          </Link>
          <a href="#mission" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            Mission
          </a>
          <a href="#team" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            Team
          </a>
          <a href="#contact" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            Contact
          </a>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back Home
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 dark:text-blue-100 mb-6 leading-tight">
            About
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Hustle</span>
          </h1>
          <p className="text-xl text-blue-700 dark:text-blue-300 max-w-3xl mx-auto leading-relaxed">
            We believe in the power of focused action and intentional living. Our mission is to help ambitious individuals transform their dreams into reality through minimalist productivity principles.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-white/60 dark:bg-blue-900/30 backdrop-blur-sm rounded-2xl p-12 border border-blue-200 dark:border-blue-800">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-6 text-center">
              Our Story
            </h2>
            <div className="space-y-6 text-blue-700 dark:text-blue-300 text-lg leading-relaxed">
              <p>
                Hustle was born from a simple observation: in a world overflowing with productivity tools and complex systems, 
                most people struggle not from lack of options, but from too many of them.
              </p>
              <p>
                We started with a radical idea - what if the path to achieving your biggest goals was actually simpler than you think? 
                What if by stripping away the noise and focusing on what truly matters, you could accomplish more than ever before?
              </p>
              <p>
                Today, Hustle represents a movement of like-minded individuals who choose clarity over complexity, 
                action over endless planning, and results over busy work.
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div id="mission" className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-12 text-center">
            Our Mission & Values
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Passion
                </h3>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  We believe passion is the fuel that drives meaningful achievement and lasting success.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Simplicity
                </h3>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  Complex problems often have simple solutions. We cut through the noise to find clarity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Community
                </h3>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  Together we're stronger. Building a supportive network of ambitious achievers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Excellence
                </h3>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  We strive for excellence in everything we do, from our products to our community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div id="team" className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-12 text-center">
            Meet the Team
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">JD</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Jane Doe</h3>
              <p className="text-blue-600 dark:text-blue-400 mb-3">Founder & CEO</p>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                Passionate about helping people achieve their goals through focused action and clear thinking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">JS</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">John Smith</h3>
              <p className="text-blue-600 dark:text-blue-400 mb-3">Co-Founder & CTO</p>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                Technology enthusiast dedicated to building tools that make productivity simple and effective.
              </p>
            </div>
          </div>
        </div>

        {/* Test Input Section */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="bg-white/60 dark:bg-blue-900/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-6 text-center">
              Test Supabase Connection
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mb-6 text-center">
              Try out our database connection! Enter any message below and we'll save it to Supabase.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testInput" className="text-blue-900 dark:text-blue-100">
                  Your Test Message
                </Label>
                <Input
                  id="testInput"
                  type="text"
                  placeholder="Enter a test message..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !testInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save to Supabase
                  </>
                )}
              </Button>
              
              {message && (
                <div className={`p-3 rounded-lg text-center ${
                  message.includes('✅') 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/60 dark:bg-blue-900/30 backdrop-blur-sm rounded-2xl p-12 border border-blue-200 dark:border-blue-800 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Ready to Join Our Mission?
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mb-8 text-lg">
              Be part of a community that believes in the power of focused action and intentional living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  Get Started Today
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 px-8 py-3 text-lg"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-20 border-t border-blue-200 dark:border-blue-800">
        <div className="text-center text-blue-600 dark:text-blue-400">
          <p>&copy; 2024 Hustle. Built with passion and purpose.</p>
        </div>
      </footer>
    </div>
  )
} 