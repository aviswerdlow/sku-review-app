# Setting Up Google Authentication

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-domain.vercel.app/api/auth/callback/google`

5. Copy your Client ID and Client Secret

## 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL when deploying
NEXTAUTH_SECRET=generate-a-secret-here
```

To generate NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

## 3. Update Vercel Environment Variables

When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Add these variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (set to your production URL)
   - `NEXTAUTH_SECRET`

## 4. Configure Allowed Users (Optional)

To restrict access to specific email addresses, update the auth configuration:

```typescript
// In app/api/auth/[...nextauth]/route.ts
callbacks: {
  async signIn({ user }) {
    const allowedEmails = [
      'user1@company.com',
      'user2@company.com',
      // Add authorized emails here
    ]
    
    if (allowedEmails.includes(user.email || '')) {
      return true
    }
    
    // Or allow entire domain
    if (user.email?.endsWith('@yourcompany.com')) {
      return true
    }
    
    return false // Reject sign in
  },
}
```

## 5. Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to http://localhost:3000
3. You should be redirected to the sign-in page
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected back to the app

## Troubleshooting

- **"Error: Invalid redirect_uri"**: Make sure the redirect URI in Google Console matches exactly
- **"Error: Invalid client"**: Double-check your Client ID and Secret
- **Session not persisting**: Ensure NEXTAUTH_SECRET is set and consistent