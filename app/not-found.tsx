import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl text-muted-foreground mb-6">
          Page not found
        </p>
        <Link href="/">
          <Button variant="default">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}