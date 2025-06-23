'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome } from 'lucide-react'

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            SKU Review Dashboard
          </CardTitle>
          <CardDescription className="text-lg">
            Sign in to review and approve product variants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Only authorized users can access the review dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  )
}