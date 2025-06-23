import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // You can add custom logic here if needed
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Only allow authenticated users
        return !!token
      },
    },
  }
)

// Protect all routes except auth and public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - auth (signin page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}