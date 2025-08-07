# Vercel Deployment Guide

## Storage Options

### Option 1: Redis (Recommended for Production)

Redis is perfect for OAuth session storage because it's:
- **Simple Setup** - Just needs `REDIS_URL` environment variable
- **High Performance** - Fast read/write operations with in-memory data store
- **Production Ready** - Works seamlessly with Vercel and Redis Cloud
- **Direct Control** - Full Redis functionality available

#### Setup Steps:

1. **Install Redis package** (already done):
   ```bash
   pnpm add redis
   ```

2. **Set up Redis Cloud** (if not already done):
   - Go to Redis Cloud and create a database
   - Get your connection URL
   - Add it as `REDIS_URL` environment variable

3. **Environment Variables** (only one needed):
   - `REDIS_URL` - Your Redis Cloud connection URL

### Option 2: In-Memory Storage (Development/Testing)

The framework will automatically fall back to in-memory storage if Redis is not available. This works for testing but sessions will be lost on server restarts.

## Environment Variables

Set these in your Vercel project settings:

```env
# Framework Configuration
FRAMEWORK_URL=https://your-app.vercel.app
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://your-redis-connection-url

# LaunchDarkly OAuth Configuration (optional)
LAUNCHDARKLY_OAUTH_CLIENT_ID=your_client_id
LAUNCHDARKLY_OAUTH_CLIENT_SECRET=your_client_secret
LAUNCHDARKLY_OAUTH_REDIRECT_URI=https://your-app.vercel.app/api/callback
```

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Switch to direct Redis implementation"
   git push origin main
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

3. **Configure Environment Variables** in Vercel dashboard:
   - Set `REDIS_URL` to your Redis Cloud connection URL

4. **Test the OAuth Flow**:
   - Visit your deployed app
   - Create an OAuth client or use manual setup
   - Test the authorization flow

## Storage Behavior

- **Development**: File-based storage (`.sessions.json`) + in-memory
- **Production with Redis**: Redis storage + in-memory cache
- **Production without Redis**: In-memory storage (sessions lost on restart)

## Why Redis is Better for OAuth

1. **Simple Setup**: Just one environment variable needed
2. **High Performance**: Ultra-fast in-memory operations
3. **Production Ready**: Works perfectly with Vercel + Redis Cloud
4. **Direct Control**: Full Redis functionality available
5. **Proven Pattern**: Based on official Redis + Next.js examples

## Troubleshooting

### Session Not Found
- Check if Redis is properly configured
- Verify `REDIS_URL` environment variable is set
- Check server logs for Redis connection errors

### OAuth Callback Issues
- Ensure `FRAMEWORK_URL` is set to your production URL
- Verify redirect URIs match exactly
- Check LaunchDarkly OAuth client configuration

### Build Errors
- Ensure all TypeScript errors are resolved
- Check for unescaped entities in JSX
- Verify all dependencies are installed

### Redis Connection Issues
- Verify your Redis Cloud database is active
- Check that `REDIS_URL` is correctly formatted
- Ensure Redis Cloud allows connections from Vercel's IP ranges
