import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap, Target, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          Hustle
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            Features
          </a>
          <Link href="/about" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            About
          </Link>
          <a href="#contact" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 transition-colors">
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-blue-900 dark:text-blue-100 mb-6 leading-tight">
            Turn Your
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Dreams </span>
            Into Reality
          </h1>
          <p className="text-xl text-blue-700 dark:text-blue-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the power of focused action. Transform your ideas into achievements with our minimalist approach to productivity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 px-8 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
          <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Lightning Fast
              </h3>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                Streamlined workflows that help you accomplish more in less time, without the complexity.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Focused Approach
              </h3>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                Clear, actionable strategies that cut through the noise and drive real results.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Community Driven
              </h3>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                Join thousands of achievers who share your vision and support your journey.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-white/60 dark:bg-blue-900/30 backdrop-blur-sm rounded-2xl p-12 border border-blue-200 dark:border-blue-800 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mb-8 text-lg">
              Join the movement of people who believe in the power of simple, focused action.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg"
            >
              Begin Your Hustle
            </Button>
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
