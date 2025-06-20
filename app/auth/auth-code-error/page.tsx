import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem confirming your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              The confirmation link may have expired or been used already. 
              Please try signing up again or contact support if the problem persists.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signup">
                Try signing up again
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signin">
                Sign in instead
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 