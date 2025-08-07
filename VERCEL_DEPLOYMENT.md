# Vercel Deployment Guide

## Storage Options

### Option 1: Vercel KV (Recommended for Production)

Vercel KV is perfect for OAuth session storage because it's:
- **Read/Write Support** - Full CRUD operations for session management
- **TTL Support** - Automatic expiration of sessions
- **High Performance** - Redis-based with low latency
- **Simple Setup** - Easy integration with Vercel projects

#### Setup Steps:

1. **Install Vercel KV SDK** (already done):
   ```bash
   pnpm add @vercel/kv
   ```

2. **Create Vercel KV Database**:
   - Go to your project in Vercel Dashboard
   - Click on "Storage" tab
   - Click "Create Database"
   - Select "KV"
   - Name it `oauth-sessions` (or similar)
   - Click "Create"

3. **Environment Variables** (automatically added):
   - `KV_URL` - Connection string for Vercel KV
   - `KV_REST_API_URL` - REST API URL
   - `KV_REST_API_TOKEN` - API token
   - `KV_REST_API_READ_ONLY_TOKEN` - Read-only token

### Option 2: In-Memory Storage (Development/Testing)

The framework will automatically fall back to in-memory storage if Vercel KV is not available. This works for testing but sessions will be lost on server restarts.

## Environment Variables

Set these in your Vercel project settings:

```env
# Framework Configuration
FRAMEWORK_URL=https://your-app.vercel.app
NODE_ENV=production

# LaunchDarkly OAuth Configuration (optional)
LAUNCHDARKLY_OAUTH_CLIENT_ID=your_client_id
LAUNCHDARKLY_OAUTH_CLIENT_SECRET=your_client_secret
LAUNCHDARKLY_OAUTH_REDIRECT_URI=https://your-app.vercel.app/api/callback
```

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment with Vercel KV"
   git push origin main
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

3. **Create Vercel KV** in Vercel dashboard (see setup steps above)

4. **Test the OAuth Flow**:
   - Visit your deployed app
   - Create an OAuth client or use manual setup
   - Test the authorization flow

## Storage Behavior

- **Development**: File-based storage (`.sessions.json`) + in-memory
- **Production with Vercel KV**: Vercel KV storage + in-memory cache
- **Production without Vercel KV**: In-memory storage (sessions lost on restart)

## Why Vercel KV is Better for OAuth

1. **Read/Write Operations**: Full CRUD support for session management
2. **TTL Support**: Automatic session expiration
3. **High Performance**: Redis-based with low latency
4. **Perfect for Sessions**: Designed for dynamic data storage
5. **Simple Integration**: Easy setup with Vercel projects

## Troubleshooting

### Session Not Found
- Check if Vercel KV is properly configured
- Verify `KV_URL` environment variable is set
- Check server logs for storage errors

### OAuth Callback Issues
- Ensure `FRAMEWORK_URL` is set to your production URL
- Verify redirect URIs match exactly
- Check LaunchDarkly OAuth client configuration

### Build Errors
- Ensure all TypeScript errors are resolved
- Check for unescaped entities in JSX
- Verify all dependencies are installed
