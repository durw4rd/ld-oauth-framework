export interface TemplateData {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  sessionId: string;
}

export const generateSetupGuide = (data: TemplateData): string => {
  return `# LaunchDarkly OAuth Setup Guide

## Overview
This guide will help you set up OAuth authentication for your LaunchDarkly application using the credentials provided by the OAuth Framework.

## Your OAuth Credentials
- **Client ID**: ${data.clientId}
- **Client Secret**: ${data.clientSecret}
- **Redirect URL**: ${data.redirectUrl}
- **Session ID**: ${data.sessionId}

## Step 1: Create Your OAuth Client

Since LaunchDarkly OAuth clients can only be created via API, you have two options:

### Option A: Use the Framework's OAuth Client Creator
1. Go to the framework's "Create OAuth Client" page
2. Enter your LaunchDarkly API token (requires Admin privileges)
3. Provide a name for your OAuth client
4. The framework will create the client and provide you with credentials

### Option B: Create via LaunchDarkly API
If you prefer to create the client yourself:

\`\`\`bash
curl -X POST https://app.launchdarkly.com/api/v2/oauth/clients \\
  -H "Authorization: YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Your App Name",
    "redirectUri": "${data.redirectUrl}",
    "description": "Your app description"
  }'
\`\`\`

**Note**: Start with the framework's redirect URL for development. You can update it later using the LaunchDarkly API.

## Step 2: Handle Your OAuth Client's Redirect URL

Your OAuth client already has a redirect URL configured. You have two options:

### Option A: Use Your Existing Redirect URL
If you want to use your OAuth client's current redirect URL:

1. Implement a callback endpoint at your OAuth client's redirect URL
2. Use the authorization URL with your redirect URL to test the flow
3. Handle the OAuth callback in your application

### Option B: Update Redirect URL to Use Framework
If you want to use the framework for testing:

1. Use the framework's OAuth Client Manager to update your redirect URL
2. Test the OAuth flow through the framework
3. Update back to your production URL when ready

## Step 3: Implement OAuth Callback Endpoint

Create a callback endpoint in your application to handle the OAuth response:

### Node.js/Express Example
\`\`\`javascript
const express = require('express');
const axios = require('axios');

const app = express();

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://app.launchdarkly.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: '${data.clientId}',
      client_secret: '${data.clientSecret}',
      code: code,
      redirect_uri: '${data.redirectUrl}'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, token_type, expires_in } = tokenResponse.data;
    
    // Store the token securely (session, database, etc.)
    req.session.launchdarklyToken = access_token;
    
    // Redirect to your app's dashboard or success page
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});
\`\`\`

### Python/Flask Example
\`\`\`python
from flask import Flask, request, redirect, session
import requests

app = Flask(__name__)
app.secret_key = 'your-secret-key'

@app.route('/api/auth/callback')
def oauth_callback():
    code = request.args.get('code')
    
    if not code:
        return {'error': 'Authorization code required'}, 400
    
    try:
        # Exchange authorization code for access token
        token_response = requests.post('https://app.launchdarkly.com/oauth/token', data={
            'grant_type': 'authorization_code',
            'client_id': '${data.clientId}',
            'client_secret': '${data.clientSecret}',
            'code': code,
            'redirect_uri': '${data.redirectUrl}'
        })
        
        token_data = token_response.json()
        access_token = token_data['access_token']
        
        # Store the token securely
        session['launchdarkly_token'] = access_token
        
        return redirect('/dashboard')
    except Exception as e:
        print(f'Token exchange failed: {e}')
        return {'error': 'Authentication failed'}, 500
\`\`\`

## Step 3: Create Authorization URL

Generate the authorization URL to redirect users to LaunchDarkly:

\`\`\`javascript
const generateAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: '${data.clientId}',
    redirect_uri: '${data.redirectUrl}',
    response_type: 'code',
    scope: 'read'
  });
  
  return \`https://app.launchdarkly.com/oauth/authorize?\${params.toString()}\`;
};
\`\`\`

## Step 4: Use the Access Token

Once you have the access token, you can call LaunchDarkly APIs:

### Example: Fetch Projects
\`\`\`javascript
const fetchProjects = async (accessToken) => {
  const response = await fetch('https://app.launchdarkly.com/api/v2/projects', {
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  
  return await response.json();
};

// Usage
const projects = await fetchProjects(accessToken);
console.log('Projects:', projects);
\`\`\`

### Example: Fetch Feature Flags
\`\`\`javascript
const fetchFlags = async (accessToken, projectKey) => {
  const response = await fetch(\`https://app.launchdarkly.com/api/v2/flags/\${projectKey}\`, {
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  
  return await response.json();
};
\`\`\`

## Step 5: Security Best Practices

1. **Store tokens securely**: Use secure session storage or encrypted database storage
2. **Validate tokens**: Check token expiration and refresh when needed
3. **Use HTTPS**: Always use HTTPS in production
4. **Handle errors**: Implement proper error handling for OAuth failures
5. **Log securely**: Don't log sensitive tokens or credentials

## Step 6: Testing Your Implementation

1. Start your application
2. Navigate to your authorization URL
3. Complete the OAuth flow
4. Verify you receive the access token
5. Test API calls with the token

## Step 7: Update Redirect URL for Production

Once your application is deployed with HTTPS:

1. Use the framework's OAuth Client Manager to update your redirect URL
2. Provide your LaunchDarkly API token (requires Admin privileges)
3. Enter your production HTTPS endpoint
4. Update the OAuth client redirect URL
5. Test the OAuth flow with your production endpoint

**Example API call:**
\`\`\`bash
curl -X PATCH https://app.launchdarkly.com/api/v2/oauth/clients/YOUR_CLIENT_ID \\
  -H "Authorization: YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '[
    {
      "op": "replace",
      "path": "/redirectUri",
      "value": "https://your-app.com/api/auth/callback"
    }
  ]'
\`\`\`

## Troubleshooting

### Common Issues

1. **"Invalid redirect_uri"**: Ensure the redirect URI in your LaunchDarkly OAuth client matches exactly
2. **"Invalid client_id"**: Verify your client ID is correct
3. **"Authorization code expired"**: Authorization codes expire quickly, handle them promptly
4. **"Invalid grant_type"**: Use 'authorization_code' for the initial token exchange

### Debug Tips

- Check browser network tab for request/response details
- Verify all parameters are correctly encoded
- Ensure your server can handle the callback URL
- Test with the framework's validation tools first

## Next Steps

1. Implement token refresh logic for long-lived applications
2. Add user session management
3. Implement proper error handling and user feedback
4. Consider adding LaunchDarkly SDK integration for advanced features

## Resources

- [LaunchDarkly API Documentation](https://docs.launchdarkly.com/reference)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [LaunchDarkly OAuth Documentation](https://docs.launchdarkly.com/docs/oauth)

---
Generated by LaunchDarkly OAuth Framework
Session ID: ${data.sessionId}
Generated: ${new Date().toISOString()}
`;
};

export const generateCallbackExample = (data: TemplateData): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LaunchDarkly OAuth Callback Example</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .code { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>LaunchDarkly OAuth Callback Example</h1>
        
        <div id="status" class="info">
            <h3>OAuth Callback Handler</h3>
            <p>This is an example of how to handle OAuth callbacks in your application.</p>
        </div>

        <div id="auth-section">
            <h2>Step 1: Start OAuth Flow</h2>
            <p>Click the button below to start the OAuth authorization flow:</p>
            <button onclick="startOAuth()">Login with LaunchDarkly</button>
        </div>

        <div id="callback-section" class="hidden">
            <h2>Step 2: Handle Callback</h2>
            <div id="callback-status"></div>
            <div id="token-section" class="hidden">
                <h3>Access Token Received</h3>
                <div id="token-info"></div>
                <button onclick="testApiCall()">Test API Call</button>
                <div id="api-result"></div>
            </div>
        </div>

        <div id="error-section" class="hidden">
            <h2>Error</h2>
            <div id="error-message"></div>
        </div>
    </div>

    <script>
        // Your OAuth configuration
        const OAUTH_CONFIG = {
            clientId: '${data.clientId}',
            clientSecret: '${data.clientSecret}',
            redirectUri: '${data.redirectUrl}',
            authUrl: 'https://app.launchdarkly.com/oauth/authorize',
            tokenUrl: 'https://app.launchdarkly.com/oauth/token'
        };

        // Check if we're returning from OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (code) {
            handleCallback(code);
        } else if (error) {
            showError('OAuth error: ' + error);
        }

        function startOAuth() {
            const params = new URLSearchParams({
                client_id: OAUTH_CONFIG.clientId,
                redirect_uri: OAUTH_CONFIG.redirectUri,
                response_type: 'code',
                scope: 'read'
            });
            
            const authUrl = \`\${OAUTH_CONFIG.authUrl}?\${params.toString()}\`;
            window.location.href = authUrl;
        }

        async function handleCallback(code) {
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('callback-section').classList.remove('hidden');
            
            const statusDiv = document.getElementById('callback-status');
            statusDiv.innerHTML = '<div class="info">Exchanging authorization code for access token...</div>';

            try {
                // In a real application, this should be done server-side
                // This is just for demonstration
                const tokenResponse = await fetch('/api/exchange-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code,
                        clientId: OAUTH_CONFIG.clientId,
                        clientSecret: OAUTH_CONFIG.clientSecret,
                        redirectUri: OAUTH_CONFIG.redirectUri
                    })
                });

                if (!tokenResponse.ok) {
                    throw new Error('Token exchange failed');
                }

                const tokenData = await tokenResponse.json();
                
                statusDiv.innerHTML = '<div class="success">✅ Access token received successfully!</div>';
                document.getElementById('token-section').classList.remove('hidden');
                
                // Display token info (in production, don't show the full token)
                document.getElementById('token-info').innerHTML = \`
                    <p><strong>Token Type:</strong> \${tokenData.token_type}</p>
                    <p><strong>Expires In:</strong> \${tokenData.expires_in} seconds</p>
                    <p><strong>Token Preview:</strong> \${tokenData.access_token.substring(0, 20)}...</p>
                \`;
                
                // Store token for API calls
                window.accessToken = tokenData.access_token;
                
            } catch (error) {
                statusDiv.innerHTML = '<div class="error">❌ Failed to exchange code for token: ' + error.message + '</div>';
            }
        }

        async function testApiCall() {
            if (!window.accessToken) {
                showError('No access token available');
                return;
            }

            const resultDiv = document.getElementById('api-result');
            resultDiv.innerHTML = '<div class="info">Testing API call to LaunchDarkly...</div>';

            try {
                const response = await fetch('https://app.launchdarkly.com/api/v2/projects', {
                    headers: {
                        'Authorization': \`Bearer \${window.accessToken}\`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }

                const projects = await response.json();
                resultDiv.innerHTML = \`
                    <div class="success">
                        <h4>✅ API Call Successful!</h4>
                        <p>Found \${projects.items?.length || 0} projects</p>
                        <pre class="code">\${JSON.stringify(projects, null, 2)}</pre>
                    </div>
                \`;
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">❌ API call failed: ' + error.message + '</div>';
            }
        }

        function showError(message) {
            document.getElementById('error-section').classList.remove('hidden');
            document.getElementById('error-message').innerHTML = '<div class="error">' + message + '</div>';
        }
    </script>
</body>
</html>`;
};

export const generateSecurityGuide = (): string => {
  return `# LaunchDarkly OAuth Security Best Practices

## Overview
This guide covers essential security practices when implementing LaunchDarkly OAuth in your applications.

## 1. Token Storage Security

### ✅ Secure Storage Methods
- **Server-side sessions**: Store tokens in secure server sessions
- **Encrypted database**: Use encryption for database storage
- **Secure cookies**: Use httpOnly, secure, and sameSite flags
- **Environment variables**: Store client secrets in environment variables

### ❌ Avoid These Practices
- **Client-side storage**: Never store tokens in localStorage or sessionStorage
- **Plain text storage**: Never store tokens in plain text
- **Logging tokens**: Never log access tokens or client secrets
- **URL parameters**: Never pass tokens in URL parameters

## 2. Token Validation

### Implement Token Validation
\`\`\`javascript
// Validate token before use
const validateToken = async (token) => {
  try {
    const response = await fetch('https://app.launchdarkly.com/api/v2/caller-identity', {
      headers: {
        'Authorization': \`Bearer \${token}\`
      }
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    return await response.json();
  } catch (error) {
    // Token is invalid, redirect to re-authentication
    throw new Error('Token validation failed');
  }
};
\`\`\`

## 3. Error Handling

### Implement Proper Error Handling
\`\`\`javascript
app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code);
    
    // Store token securely
    req.session.launchdarklyToken = tokenResponse.access_token;
    
    res.redirect('/dashboard');
  } catch (error) {
    // Log error securely (don't log sensitive data)
    console.error('OAuth callback error:', error.message);
    
    // Redirect to error page
    res.redirect('/auth/error');
  }
});
\`\`\`

## 4. HTTPS Requirements

### Always Use HTTPS in Production
- **Development**: HTTP is acceptable for local development
- **Production**: Always use HTTPS
- **Redirect URIs**: Must use HTTPS in production
- **Cookies**: Set secure flag for production

## 5. State Parameter (Recommended)

### Implement State Parameter for CSRF Protection
\`\`\`javascript
// Generate state parameter
const generateState = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Store state in session
req.session.oauthState = generateState();

// Include state in authorization URL
const authUrl = \`https://app.launchdarkly.com/oauth/authorize?client_id=\${clientId}&redirect_uri=\${redirectUri}&response_type=code&scope=read&state=\${req.session.oauthState}\`;

// Validate state in callback
app.get('/api/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }
  
  // Continue with token exchange...
});
\`\`\`

## 6. Token Refresh

### Implement Token Refresh Logic
\`\`\`javascript
const refreshToken = async (refreshToken) => {
  try {
    const response = await fetch('https://app.launchdarkly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.LAUNCHDARKLY_CLIENT_ID,
        client_secret: process.env.LAUNCHDARKLY_CLIENT_SECRET,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  } catch (error) {
    // Redirect to re-authentication
    throw new Error('Token refresh failed');
  }
};
\`\`\`

## 7. Rate Limiting

### Implement Rate Limiting
\`\`\`javascript
const rateLimit = require('express-rate-limit');

const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many OAuth attempts, please try again later'
});

app.use('/api/auth/callback', oauthLimiter);
\`\`\`

## 8. Logging and Monitoring

### Secure Logging Practices
\`\`\`javascript
// ✅ Good logging
console.log('OAuth callback received for user:', userId);
console.log('Token exchange successful');

// ❌ Bad logging
console.log('Access token:', accessToken);
console.log('Client secret:', clientSecret);
\`\`\`

## 9. Environment Variables

### Secure Environment Configuration
\`\`\`bash
# .env file (never commit to version control)
LAUNCHDARKLY_CLIENT_ID=your_client_id
LAUNCHDARKLY_CLIENT_SECRET=your_client_secret
LAUNCHDARKLY_REDIRECT_URI=https://your-app.com/api/auth/callback
SESSION_SECRET=your_session_secret
\`\`\`

## 10. Regular Security Audits

### Security Checklist
- [ ] Review OAuth implementation annually
- [ ] Update dependencies regularly
- [ ] Monitor for security vulnerabilities
- [ ] Test OAuth flow regularly
- [ ] Review access logs for suspicious activity
- [ ] Implement proper session management
- [ ] Use secure session storage
- [ ] Implement proper error handling

## Additional Resources

- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/rfc6819)
- [LaunchDarkly Security Documentation](https://docs.launchdarkly.com/docs/security)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---
Generated by LaunchDarkly OAuth Framework
Generated: ${new Date().toISOString()}
`;
};
