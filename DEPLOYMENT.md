# Deployment Guide for SKU Review App

## Option 1: Vercel (Recommended - Free & Easy)

Vercel is the company behind Next.js and offers the easiest deployment:

### Steps:
1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/sku-review-app.git
git push -u origin main
```

2. Sign up at [vercel.com](https://vercel.com) with your GitHub account

3. Click "New Project" and import your GitHub repository

4. Deploy with default settings (Vercel auto-detects Next.js)

5. Your app will be live at `https://your-app-name.vercel.app`

### Environment Variables (if needed):
Add any env vars in Vercel's dashboard under Settings → Environment Variables

---

## Option 2: Netlify (Free Alternative)

### Steps:
1. Build the app for production:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Deploy:
```bash
netlify deploy --prod --dir=.next
```

4. Follow prompts to create account and site

---

## Option 3: Railway (Simple & Fast)

### Steps:
1. Sign up at [railway.app](https://railway.app)

2. Install Railway CLI:
```bash
npm install -g @railway/cli
```

3. Deploy:
```bash
railway login
railway init
railway up
```

---

## Option 4: Docker + Cloud Provider

### Create Dockerfile:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Then deploy to:
- **AWS**: Using ECS, App Runner, or Amplify
- **Google Cloud**: Using Cloud Run or App Engine
- **Azure**: Using App Service or Container Instances
- **DigitalOcean**: Using App Platform

---

## Option 5: Corporate/Enterprise Deployment

For internal corporate use:

### 1. Build for production:
```bash
npm run build
npm run start # Test locally first
```

### 2. Server Requirements:
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy (optional)

### 3. Basic PM2 Setup:
```bash
npm install -g pm2
pm2 start npm --name "sku-review" -- start
pm2 save
pm2 startup
```

### 4. Nginx Configuration (if using):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Security Considerations

1. **Authentication**: Add authentication before deploying:
   - NextAuth.js for OAuth providers
   - Or basic auth with middleware

2. **Environment Variables**:
   - Never commit sensitive data
   - Use `.env.production` for production secrets

3. **CORS**: Configure if API will be accessed externally

4. **Rate Limiting**: Add rate limiting for API routes

---

## Quick Start Recommendation

For immediate deployment:

1. **Use Vercel** - It's free, fast, and requires minimal configuration
2. Your app will be live in under 5 minutes
3. You get automatic HTTPS, CDN, and preview deployments
4. Share the URL with your SMEs immediately

### Vercel Quick Deploy:
```bash
npx vercel
```
Follow the prompts, and you'll have a live URL in minutes!