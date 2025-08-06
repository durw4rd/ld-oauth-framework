# LaunchDarkly OAuth Framework - MVP Plan

## Overview

Create a minimal viable product to prove the concept of a streamlined OAuth framework for LaunchDarkly applications. Focus on the core pain points with minimal implementation.

## MVP Scope (1-2 days)

### Core Problem to Solve
- **Eliminate ngrok requirement** for local development
- **Provide HTTPS URLs** for OAuth client registration
- **Simplify OAuth setup** process

## MVP Solution

### 1. **Next.js OAuth Framework App** (6-8 hours)
- **Single deployment**: `https://ld-oauth-framework.vercel.app`
- **API Routes**: Handle OAuth proxy callbacks
- **Client Manager**: Web interface for creating OAuth clients
- **Session management**: Generate unique session IDs
- **Features**:
  - `/api/callback/{session-id}` - OAuth proxy endpoint
  - `/` - Client manager interface
  - `/template` - Static site template download
  - Session ID generation and management

### 2. **Static Site Template** (2-3 hours)
- **Pure HTML/JS**: No backend required
- **OAuth integration**: Handle token in browser
- **localStorage persistence**: Keep tokens across sessions
- **Based on current CSV export app**: Extract OAuth logic

## Technical Implementation

### Next.js App Structure
```
/pages
  /api
    /callback
      /[sessionId].js    # OAuth proxy endpoint
  /_app.js               # App wrapper
  /index.js              # Client manager interface
  /template.js           # Template download page

/components
  /ClientManager.js      # OAuth client creation form
  /SessionGenerator.js   # Session ID generation
  /TemplateDownload.js   # Template download component

/public
  /template              # Static site template files
```

### API Route (OAuth Proxy)
```javascript
// pages/api/callback/[sessionId].js
export default async function handler(req, res) {
  const { sessionId } = req.query;
  const { code } = req.query;
  
  // Forward to local development server
  try {
    await fetch(`http://localhost:3000/oauth/callback?code=${code}`);
    res.redirect('http://localhost:3000');
  } catch (error) {
    res.status(500).json({ error: 'Failed to forward callback' });
  }
}
```

### Client Manager Component
```javascript
// components/ClientManager.js
export default function ClientManager() {
  const [sessionId, setSessionId] = useState('');
  const [clientName, setClientName] = useState('');
  
  const generateRedirectUrl = () => {
    const redirectUrl = `https://ld-oauth-framework.vercel.app/api/callback/${sessionId}`;
    return redirectUrl;
  };
  
  return (
    <form>
      <input 
        value={clientName} 
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Client Name" 
      />
      <input 
        value={sessionId} 
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Session ID" 
      />
      <button onClick={generateRedirectUrl}>Generate Redirect URL</button>
      <div>{generateRedirectUrl()}</div>
    </form>
  );
}
```

### Static Site Template
```html
<!-- Minimal OAuth integration -->
<script>
  // Get session ID from URL or generate new one
  const sessionId = new URLSearchParams(window.location.search).get('session') || generateId();
  
  // OAuth redirect URL
  const redirectUrl = `https://ld-oauth-framework.vercel.app/api/callback/${sessionId}`;
  
  // LaunchDarkly OAuth flow
  function login() {
    const authUrl = `https://app.launchdarkly.com/trust/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=reader`;
    window.location.href = authUrl;
  }
</script>
```

## MVP Architecture

```
┌─────────────────┐    ┌─────────────────────────────┐    ┌─────────────────┐
│   Developer     │    │   Next.js App               │    │  LaunchDarkly   │
│   App (Local)   │◄──►│   (Vercel)                  │    │   OAuth         │
│                 │    │   ├── API Routes            │    │                 │
│                 │    │   ├── Client Manager        │    │                 │
│                 │    │   └── Template Download     │    │                 │
└─────────────────┘    └─────────────────────────────┘    └─────────────────┘
```

## Implementation Steps

### Day 1: Next.js App Setup
1. **Create Next.js app** (1 hour)
2. **Set up API routes** for OAuth proxy (1 hour)
3. **Build client manager interface** (2 hours)
4. **Deploy to Vercel** (30 minutes)

### Day 2: Template & Integration
1. **Extract OAuth logic** from CSV export app (1 hour)
2. **Create static site template** (1 hour)
3. **Add template download functionality** (1 hour)
4. **Test complete OAuth flow** (1 hour)

## MVP Benefits

### Immediate Value
- **No ngrok required**: Developers get HTTPS URLs instantly
- **Faster setup**: OAuth client creation in minutes
- **Proven concept**: Validates the approach works

### Minimal Risk
- **Simple implementation**: Easy to debug and modify
- **Quick iteration**: Can improve based on feedback
- **Low cost**: Free hosting on Vercel/Netlify

## Success Criteria

1. **Developer can create OAuth client** in <5 minutes
2. **Local app can authenticate** without ngrok
3. **Token persistence** works across browser sessions
4. **Simple deployment** for static sites

## Future Enhancements (Post-MVP)

### If MVP is successful:
1. **Add more templates** (Node.js, Python, etc.)
2. **Enhanced proxy features** (rate limiting, security)
3. **Better client manager** (UI improvements)
4. **Development toolkit** (CLI tools)

### If MVP needs iteration:
1. **Identify pain points** from user feedback
2. **Simplify further** or add missing features
3. **Test with real users** before expanding

## Technical Requirements

### Next.js App
- **Platform**: Vercel (free tier)
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript/JavaScript
- **Database**: None (in-memory session storage)
- **Features**: API routes, client components, static generation

### Static Site Template
- **Technology**: Vanilla HTML/JavaScript
- **Storage**: localStorage for tokens
- **Deployment**: Any static hosting
- **Distribution**: Downloadable from Next.js app

## Conclusion

This MVP approach focuses on the core problem (HTTPS requirement) with minimal implementation. It can be built in 1-2 days and provides immediate value while proving the concept. The success of this MVP will determine whether to expand into a more comprehensive framework. 